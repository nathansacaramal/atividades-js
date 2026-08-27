// Importa o framework Express
const express = require("express");

// Importa a biblioteca responsável por gerar e comparar o hash das senhas
const bcrypt = require("bcrypt"); //npm install bcrypt

// Importa a conexão com o banco de dados MySQL
const conexao = require("./db");

// Cria a aplicação Express
const app = express();


// =======================================================
// CONFIGURAÇÕES DO SERVIDOR
// =======================================================

// Permite que a aplicação receba dados no formato JSON
app.use(express.json());

// Permite receber dados enviados por formulários HTML
// (method="POST")
app.use(express.urlencoded({ extended: true }));

// Informa ao Express que todos os arquivos da pasta "public"
// poderão ser acessados pelo navegador.
app.use(express.static("public"));


// =======================================================
// ROTA DE CADASTRO
// =======================================================

// Essa rota será chamada quando o formulário de cadastro
// for enviado.
app.post("/cadastro", async (req, res) => {

    // Recebe os dados enviados pelo formulário
    const { nome, email, senha } = req.body;

    // Gera o hash da senha.
    // O número 10 representa o nível de segurança (salt rounds).
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere o novo usuário no banco de dados
    conexao.query(

        "INSERT INTO usuarios(nome,email,senha) VALUES(?,?,?)",

        // Os valores que irão substituir os "?"
        [nome, email, senhaHash],

        // Callback executada após o INSERT
        (erro) => {

            // Caso aconteça algum erro
            if (erro) {

                console.log(erro);

                return res.send("Erro ao cadastrar usuário.");

            }

            // Caso dê tudo certo,
            // volta para a tela de login
            res.redirect("/");

        }

    );

});


// =======================================================
// ROTA DE LOGIN
// =======================================================

// Essa rota será chamada quando o usuário clicar
// no botão Entrar.
app.post("/login", (req, res) => {

    // Recebe os dados enviados pelo formulário
    const { email, senha } = req.body;

    // Procura um usuário com esse e-mail
    conexao.query(

        "SELECT * FROM usuarios WHERE email = ?",

        [email],

        // Callback executada após a consulta
        async (erro, resultado) => {

            // Caso aconteça algum erro no banco
            if (erro) {

                console.log(erro);

                return res.send("Erro ao consultar o banco.");

            }

            // Se não encontrar nenhum usuário
            if (resultado.length == 0) {

                return res.send("Usuário não encontrado.");

            }

            // Guarda os dados do usuário encontrado
            const usuario = resultado[0];

            // Compara a senha digitada
            // com o hash armazenado no banco
            const verifica = await bcrypt.compare(senha, usuario.senha);

            // Se as senhas forem iguais
            if (verifica) {

                // Redireciona para a página inicial
                res.redirect("/home.html");

            } else {

                // Caso contrário, informa erro
                res.send("Senha incorreta.");

            }

        }

    );

});


// =======================================================
// INICIALIZAÇÃO DO SERVIDOR
// =======================================================

// Inicia o servidor na porta 3000
app.listen(3000, () => {

    console.log("Servidor rodando em http://localhost:3000");

});