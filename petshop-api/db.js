const mysql = require("mysql2");

const conexao = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "SUA_SENHA_AQUI", //coloquem a de vocês.
    database: "petshop",
    dateStrings: true // as datas chegam como texto (ex.: 2026-10-05)
});

conexao.connect((erro) => {
    if (erro) {
        console.log("Erro ao conectar:", erro);
        return;
    }

    console.log("Conectado ao MySQL - Pet Shop Amigo Fiel!");
});

module.exports = conexao;
