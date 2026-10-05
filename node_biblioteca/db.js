const mysql = require("mysql2");

const conexao = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "SUA_SENHA_AQUI", //coloquem a de vocês.
    database: "clinica_veterinaria"
});

conexao.connect((erro) => {
    if (erro) {
        console.log("Erro ao conectar:", erro);
        return;
    }

    console.log("Conectado ao MySQL - Clínica Veterinária!");
});

module.exports = conexao;
