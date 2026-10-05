// Importa o framework Express
const express = require("express");

// Importa a biblioteca responsável por gerar e comparar o hash das senhas
const bcrypt = require("bcrypt"); //npm install bcrypt

// Importa a conexão com o banco de dados MySQL
const conexao = require("./db");

// Cria a aplicação Express
const app = express();

const PORTA = 3000;


// =======================================================
// CONFIGURAÇÕES DO SERVIDOR
// =======================================================

// Permite que a aplicação receba dados no formato JSON
// (usado pelos formulários de animal, veterinário e consulta, enviados via fetch)
app.use(express.json());

// Permite receber dados enviados por formulários HTML clássicos
// (method="POST", usado no cadastro/login de usuário)
app.use(express.urlencoded({ extended: true }));

// Informa ao Express que todos os arquivos da pasta "public"
// poderão ser acessados pelo navegador.
app.use(express.static("public"));


// =======================================================
// ROTA DE CADASTRO DE USUÁRIO
// =======================================================

app.post("/cadastro", async (req, res) => {

    // Recebe os dados enviados pelo formulário
    const { nome, email, senha } = req.body;

    // Gera o hash da senha.
    // O número 10 representa o nível de segurança (salt rounds).
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere o novo usuário no banco de dados
    conexao.query(

        "INSERT INTO usuarios(nome,email,senha) VALUES(?,?,?)",

        [nome, email, senhaHash],

        (erro) => {

            if (erro) {

                console.log(erro);

                return res.send("Erro ao cadastrar usuário.");

            }

            // Caso dê tudo certo, volta para a tela de login
            res.redirect("/");

        }

    );

});


// =======================================================
// ROTA DE LOGIN
// =======================================================

app.post("/login", (req, res) => {

    // Recebe os dados enviados pelo formulário
    const { email, senha } = req.body;

    // Procura um usuário com esse e-mail
    conexao.query(

        "SELECT * FROM usuarios WHERE email = ?",

        [email],

        async (erro, resultado) => {

            if (erro) {

                console.log(erro);

                return res.send("Erro ao consultar o banco.");

            }

            // Se não encontrar nenhum usuário
            if (resultado.length == 0) {

                return res.send("Usuário não encontrado.");

            }

            const usuario = resultado[0];

            // Compara a senha digitada com o hash armazenado no banco
            const verifica = await bcrypt.compare(senha, usuario.senha);

            if (verifica) {

                // Redireciona para a página inicial
                res.redirect("/home.html");

            } else {

                res.send("Senha incorreta.");

            }

        }

    );

});


// =======================================================
// ROTAS DE ANIMAIS
// =======================================================

// Cadastra um novo animal
app.post("/animais", (req, res) => {

    const { nome, especie, idade, nome_dono } = req.body;

    const sql = "INSERT INTO animais(nome, especie, idade, nome_dono) VALUES(?,?,?,?)";

    conexao.query(sql, [nome, especie, idade, nome_dono], (erro) => {

        if (erro) {

            return res.status(500).json({
                mensagem: "Erro ao cadastrar animal",
                erro: erro
            });

        }

        res.json({ mensagem: "Animal cadastrado com sucesso!" });

    });

});

// Lista todos os animais cadastrados
app.get("/animais", (req, res) => {

    conexao.query("SELECT * FROM animais", (erro, resultado) => {

        if (erro) {

            return res.status(500).json({
                mensagem: "Erro ao buscar animais",
                erro: erro
            });

        }

        res.json(resultado);

    });

});

// Exclui um animal pelo ID
app.delete("/animais/:id", (req, res) => {

    const id = Number(req.params.id);

    conexao.query("DELETE FROM animais WHERE id = ?", [id], (erro, resultado) => {

        if (erro) {

            return res.status(500).json({
                mensagem: "Erro ao excluir animal",
                erro: erro
            });

        }

        if (resultado.affectedRows === 0) {

            return res.status(404).json({ mensagem: "Animal não encontrado" });

        }

        res.json({ mensagem: "Animal excluído com sucesso!" });

    });

});


// =======================================================
// ROTAS DE VETERINÁRIOS
// =======================================================

// Cadastra um novo veterinário
app.post("/veterinarios", (req, res) => {

    const { nome, especialidade, telefone } = req.body;

    const sql = "INSERT INTO veterinarios(nome, especialidade, telefone) VALUES(?,?,?)";

    conexao.query(sql, [nome, especialidade, telefone], (erro) => {

        if (erro) {

            return res.status(500).json({
                mensagem: "Erro ao cadastrar veterinário",
                erro: erro
            });

        }

        res.json({ mensagem: "Veterinário cadastrado com sucesso!" });

    });

});

// Lista todos os veterinários cadastrados
app.get("/veterinarios", (req, res) => {

    conexao.query("SELECT * FROM veterinarios", (erro, resultado) => {

        if (erro) {

            return res.status(500).json({
                mensagem: "Erro ao buscar veterinários",
                erro: erro
            });

        }

        res.json(resultado);

    });

});

// Exclui um veterinário pelo ID
app.delete("/veterinarios/:id", (req, res) => {

    const id = Number(req.params.id);

    conexao.query("DELETE FROM veterinarios WHERE id = ?", [id], (erro, resultado) => {

        if (erro) {

            return res.status(500).json({
                mensagem: "Erro ao excluir veterinário",
                erro: erro
            });

        }

        if (resultado.affectedRows === 0) {

            return res.status(404).json({ mensagem: "Veterinário não encontrado" });

        }

        res.json({ mensagem: "Veterinário excluído com sucesso!" });

    });

});


// =======================================================
// ROTAS DE CONSULTAS
// =======================================================

// Cadastra uma nova consulta
app.post("/consultas", (req, res) => {

    const { animal_id, veterinario_id, data, horario } = req.body;

    const sql = "INSERT INTO consultas(animal_id, veterinario_id, data, horario) VALUES(?,?,?,?)";

    conexao.query(sql, [animal_id, veterinario_id, data, horario], (erro) => {

        if (erro) {

            return res.status(500).json({
                mensagem: "Erro ao cadastrar consulta",
                erro: erro
            });

        }

        res.json({ mensagem: "Consulta cadastrada com sucesso!" });

    });

});

// Lista todas as consultas, já trazendo o nome do animal e do veterinário
app.get("/consultas", (req, res) => {

    const sql = `
        SELECT
            consultas.id,
            animais.nome AS animal,
            veterinarios.nome AS veterinario,
            consultas.data,
            consultas.horario
        FROM consultas
        JOIN animais ON consultas.animal_id = animais.id
        JOIN veterinarios ON consultas.veterinario_id = veterinarios.id
        ORDER BY consultas.data, consultas.horario
    `;

    conexao.query(sql, (erro, resultado) => {

        if (erro) {

            return res.status(500).json({
                mensagem: "Erro ao buscar consultas",
                erro: erro
            });

        }

        res.json(resultado);

    });

});

// Exclui uma consulta pelo ID
app.delete("/consultas/:id", (req, res) => {

    const id = Number(req.params.id);

    conexao.query("DELETE FROM consultas WHERE id = ?", [id], (erro, resultado) => {

        if (erro) {

            return res.status(500).json({
                mensagem: "Erro ao excluir consulta",
                erro: erro
            });

        }

        if (resultado.affectedRows === 0) {

            return res.status(404).json({ mensagem: "Consulta não encontrada" });

        }

        res.json({ mensagem: "Consulta excluída com sucesso!" });

    });

});


// =======================================================
// INICIALIZAÇÃO DO SERVIDOR
// =======================================================

app.listen(PORTA, () => {

    console.log(`Servidor rodando em http://localhost:${PORTA}`);

});
