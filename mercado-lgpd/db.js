const mysql = require("mysql2");
require('dotenv').config();
// Pool de conexões: cada requisição pega uma conexão livre e devolve no final.
// Os dados vêm do .env e o usuário é o mercado_app (nunca o root).
const conexao = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true, // as datas chegam como texto (ex.: 2026-10-26 14:30:00)
    connectionLimit: 10
});

// Testa a conexão ao iniciar o servidor
conexao.getConnection((erro, conn) => {
    if (erro) {
        console.log("Erro ao conectar:", erro.message);
        return;
    }

    console.log(`Conectado ao MySQL como ${process.env.DB_USER}!`);
    conn.release();
});

// Exporta a versão com Promises, para usar async/await nas rotas
module.exports = conexao.promise();
