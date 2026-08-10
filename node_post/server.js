// Importa o framework Express
const express = require("express");

// Importa a conexão com o banco de dados
// O arquivo db.js é responsável pela conexão com o MySQL
const db = require("./db");

// Cria uma instância do Express
const app = express();

// Define a porta onde o servidor irá rodar
const PORT = 3000;


// ============================================================
// CONFIGURAÇÕES DO EXPRESS
// ============================================================

// Permite que o Express receba dados enviados por formulários HTML
// Exemplo:
// <form method="POST">
//     <input name="nome">
// </form>
//
// Os dados enviados ficarão disponíveis em:
// req.body
app.use(express.urlencoded({ extended: true }));


// Permite que o Express disponibilize arquivos estáticos
// da pasta "public".
//
// Dessa forma, arquivos como:
// - index.html
// - style.css
// - imagens
// poderão ser acessados pelo navegador.
app.use(express.static("public"));


// ============================================================
// ROTA POST - CADASTRAR USUÁRIO
// ============================================================

// Define uma rota POST para:
// /usuarios
//
// Essa rota será chamada quando o formulário for enviado.
//
// No HTML teremos:
// <form action="/usuarios" method="POST">
app.post("/usuarios", (req, res) => {

    // Pega os valores enviados pelo formulário
    //
    // O nome das propriedades precisa ser igual ao atributo
    // "name" dos inputs do HTML.
    //
    // Exemplo:
    // <input name="nome">
    // <input name="data_nascimento">
    const { nome, data_nascimento } = req.body;


    // Verifica se os campos obrigatórios foram preenchidos
    if (!nome || !data_nascimento) {

        // Retorna um erro HTTP 400 para o navegador
        return res.status(400).send(
            "Nome e data de nascimento são obrigatórios."
        );
    }


    // SQL que será executado no banco de dados
    //
    // Os símbolos "?" são placeholders.
    //
    // Os valores serão enviados separadamente através do array:
    // [nome, data_nascimento]
    //
    // Isso é importante para evitar SQL Injection.
    const sql = `
        INSERT INTO usuario (nome, data_nascimento)
        VALUES (?, ?)
    `;


    // Executa o comando SQL no MySQL
    db.execute(
        sql,

        // Valores que substituirão os "?"
        //
        // Primeiro "?"  = nome
        // Segundo "?"   = data_nascimento
        [nome, data_nascimento],

        // Função executada depois que o MySQL responder
        (err, result) => {

            // Verifica se aconteceu algum erro
            if (err) {

                // Mostra o erro no terminal
                console.error(
                    "Erro ao cadastrar usuário:",
                    err
                );

                // Retorna erro 500 para o navegador
                return res
                    .status(500)
                    .send("Erro ao cadastrar usuário.");
            }


            // Se chegou aqui, o usuário foi cadastrado
            // com sucesso.
            //
            // result.insertId contém o ID criado pelo MySQL
            console.log(
                "Usuário cadastrado com ID:",
                result.insertId
            );


            // Envia uma resposta para o navegador
            res.send(`
                <h1>Usuário cadastrado com sucesso!</h1>

                <p>ID: ${result.insertId}</p>

                <p>Nome: ${nome}</p>

                <p>Data de nascimento: ${data_nascimento}</p>

                <br>

                <a href="/">Cadastrar outro usuário</a>
            `);
        }
    );
});


// ============================================================
// ROTA GET - LISTAR USUÁRIOS
// ============================================================

// Define uma rota GET para:
// /usuarios
//
// Essa rota será utilizada para buscar todos os usuários
// cadastrados no banco.
app.get("/usuarios", (req, res) => {

    // Comando SQL para buscar todos os registros
    const sql = "SELECT * FROM usuario";


    // Executa a consulta no banco
    db.query(sql, (err, results) => {

        // Verifica se ocorreu algum erro
        if (err) {

            // Mostra o erro no terminal
            console.error(
                "Erro ao buscar usuários:",
                err
            );

            // Retorna erro 500 para o navegador
            return res
                .status(500)
                .send("Erro ao buscar usuários.");
        }


        // Retorna os usuários em formato JSON
        //
        // Exemplo:
        //
        // [
        //     {
        //         "id": 1,
        //         "nome": "João",
        //         "data_nascimento": "1990-05-20"
        //     }
        // ]
        res.json(results);
    });
});


// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================

// Inicia o servidor Express na porta definida acima
app.listen(PORT, () => {

    // Mostra no terminal uma mensagem informando
    // que o servidor foi iniciado corretamente
    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );
});