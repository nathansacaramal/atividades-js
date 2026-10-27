const express = require("express");

// Biblioteca que gera e compara o hash das senhas
const bcrypt = require("bcrypt");

const conexao = require("../db");
const { validarCadastro } = require("../middlewares/validacoes");

const router = express.Router();

// Versão atual dos Termos de Uso (gravada junto com o aceite)
const TERMOS_VERSAO = "1.0";

// Mesma mensagem para e-mail inexistente e senha errada
const MSG_LOGIN_INVALIDO = "E-mail ou senha inválidos";

// Hash usado quando o e-mail não existe: o bcrypt.compare() roda do mesmo jeito,
// assim a resposta demora o mesmo tempo e ninguém descobre quais e-mails existem
const HASH_FALSO = bcrypt.hashSync("senha-que-nao-existe-123", 10);


// Grava cada tentativa de login no log_acesso
async function registrarAcesso(idCliente, ip, sucesso) {

    await conexao.query(
        "INSERT INTO log_acesso (id_cliente, ip, sucesso) VALUES (?, ?, ?)",
        [idCliente, ip, sucesso]
    );

}


// =======================================================
// CADASTRO (POST /cadastro)
// =======================================================

router.post("/cadastro", validarCadastro, async (req, res) => {

    const dados = req.dadosCadastro;

    // Gera o hash da senha (10 = salt rounds)
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    // Cliente e consentimentos são gravados juntos numa transação
    const conn = await conexao.getConnection();

    try {

        await conn.beginTransaction();

        // O CPF é criptografado pelo MySQL com a chave do .env
        // (AES_ENCRYPT(NULL, chave) devolve NULL quando o CPF não foi informado)
        const [resultado] = await conn.query(
            `INSERT INTO clientes
                (nome, email, senha_hash, cpf_cifrado, telefone, data_nascimento, termos_versao, termos_aceito_em)
             VALUES (?, ?, ?, AES_ENCRYPT(?, ?), ?, ?, ?, NOW())`,
            [dados.nome, dados.email, senhaHash, dados.cpf, process.env.CPF_KEY,
             dados.telefone, dados.data_nascimento, TERMOS_VERSAO]
        );

        // Grava só os consentimentos que foram marcados
        for (const finalidade of dados.consentimentos) {

            await conn.query(
                "INSERT INTO consentimentos (id_cliente, finalidade) VALUES (?, ?)",
                [resultado.insertId, finalidade]
            );

        }

        await conn.commit();

        res.status(201).json({ mensagem: "Cadastro realizado! Faça login para continuar." });

    } catch (erro) {

        await conn.rollback();

        // E-mail repetido (a coluna email é UNIQUE)
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
        }

        throw erro;

    } finally {

        conn.release();

    }

});


// =======================================================
// LOGIN (POST /login)
// =======================================================

router.post("/login", async (req, res) => {

    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");
    const ip = req.ip;

    const [clientes] = await conexao.query(
        `SELECT id, nome, senha_hash, bloqueado_ate > NOW() AS bloqueado
         FROM clientes
         WHERE email = ? AND ativo = TRUE`,
        [email]
    );

    const cliente = clientes[0];

    // E-mail não existe
    if (!cliente) {

        await bcrypt.compare(senha, HASH_FALSO);
        await registrarAcesso(null, ip, false);

        return res.status(401).json({ erro: MSG_LOGIN_INVALIDO });

    }

    // Conta bloqueada por excesso de tentativas
    if (cliente.bloqueado) {

        await registrarAcesso(cliente.id, ip, false);

        return res.status(429).json({ erro: "Muitas tentativas erradas. Aguarde 15 minutos e tente de novo." });

    }

    // Compara a senha digitada com o hash guardado no banco
    const senhaConfere = await bcrypt.compare(senha, cliente.senha_hash);

    if (!senhaConfere) {

        // Soma 1 tentativa. Na 5ª seguida, bloqueia por 15 minutos e zera o contador.
        // (bloqueado_ate vem primeiro porque o MySQL executa o SET da esquerda para a direita)
        await conexao.query(
            `UPDATE clientes SET
                bloqueado_ate = IF(tentativas_login + 1 >= 5, NOW() + INTERVAL 15 MINUTE, NULL),
                tentativas_login = IF(tentativas_login + 1 >= 5, 0, tentativas_login + 1)
             WHERE id = ?`,
            [cliente.id]
        );

        await registrarAcesso(cliente.id, ip, false);

        return res.status(401).json({ erro: MSG_LOGIN_INVALIDO });

    }

    // Senha certa: zera as tentativas e grava o último acesso
    await conexao.query(
        "UPDATE clientes SET tentativas_login = 0, bloqueado_ate = NULL, ultimo_acesso = NOW() WHERE id = ?",
        [cliente.id]
    );

    await registrarAcesso(cliente.id, ip, true);

    // Gera uma sessão nova (evita que alguém reaproveite um cookie antigo)
    await new Promise((resolve, reject) => {
        req.session.regenerate((erro) => (erro ? reject(erro) : resolve()));
    });

    // Guarda o id do cliente na sessão
    req.session.clienteId = cliente.id;
    req.session.nome = cliente.nome;

    res.json({ mensagem: "Login realizado!", destino: "/comprar.html" });

});


// =======================================================
// SAIR (POST /logout)
// =======================================================

router.post("/logout", (req, res) => {

    req.session.destroy(() => {

        res.clearCookie("mercado.sid");
        res.json({ mensagem: "Você saiu do sistema." });

    });

});

module.exports = router;
