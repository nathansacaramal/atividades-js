const express = require("express");
const conexao = require("./db");
const path = require("path");

const app = express();

// Permite acessar arquivos da pasta public
app.use(express.static(path.join(__dirname, "public")));

app.get("/produtos", (req, res) => {

    conexao.query("SELECT * FROM produtos", (erro, resultado) => {

        if (erro) {
            return res.status(500).json(erro);
        }

        res.json(resultado);

    });

});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});