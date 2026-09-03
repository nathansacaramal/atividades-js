// Importa o framework Express para criar e gerenciar o servidor e as rotas
const express = require("express");

// Importa o módulo de conexão com o banco de dados (configurado em outro arquivo)
const conexao = require("./db");

// Importa o módulo nativo 'path' do Node.js para lidar com caminhos de arquivos e diretórios
const path = require("path");

// Inicializa a aplicação Express
const app = express();

// Configura o Express para servir arquivos estáticos (como HTML, CSS, imagens e JS do front-end) 
// que estão dentro da pasta chamada "public"
app.use(express.static(path.join(__dirname, "public")));

// Cria uma rota GET no caminho "/produtos" para buscar todos os produtos cadastrados
app.get("/produtos", (req, res) => {

    // Executa a consulta SQL no banco de dados para selecionar todos os registros da tabela 'produtos'
    conexao.query("SELECT * FROM produtos", (erro, resultado) => {

        // Verifica se ocorreu algum erro durante a consulta ao banco de dados
        if (erro) {
            // Retorna o status HTTP 500 (Erro interno do servidor) junto com os detalhes do erro em formato JSON
            return res.status(500).json(erro);
        }

        // Se der tudo certo, retorna o resultado da consulta (os produtos) em formato JSON para o cliente
        res.json(resultado);

    });

});

// Inicia o servidor na porta 3000 e exibe uma mensagem no console quando estiver pronto
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000/home.html");
});