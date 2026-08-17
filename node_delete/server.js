const express = require("express");

const app = express();
const conexao = require("./db");

const PORTA = 5000;

// Permite trabalhar com JSON
app.use(express.json());

// Permite acessar os arquivos da pasta public
app.use(express.static("public"));


// ======================================
// ROTA GET
// Busca os produtos diretamente do banco
// ======================================

app.get("/produtos", (req, res) => {

    const sql = "SELECT * FROM produtos";

    conexao.query(sql, (erro, resultado) => {

        if (erro) {

            return res.status(500).json({
                mensagem: "Erro ao buscar produtos",
                erro: erro
            });

        }

        res.json(resultado);

    });

});


// ======================================
// ROTA DELETE
// Exclui um produto diretamente do banco
// ======================================

app.delete("/produtos/:id", (req, res) => {

    // Pega o ID enviado pela URL
    const id = Number(req.params.id);

    // Comando SQL para excluir o produto
    const sql = "DELETE FROM produtos WHERE id = ?";

    // Executa o DELETE no banco
    conexao.query(sql, [id], (erro, resultado) => {

        // Se ocorrer algum erro no banco
        if (erro) {

            return res.status(500).json({
                mensagem: "Erro ao excluir produto",
                erro: erro
            });

        }

        // Verifica se algum registro foi realmente excluído
        if (resultado.affectedRows === 0) {

            return res.status(404).json({
                mensagem: "Produto não encontrado"
            });

        }

        // Produto excluído com sucesso
        res.json({
            mensagem: "Produto excluído com sucesso!"
        });

    });

});


// ======================================
// INICIA O SERVIDOR
// ======================================

app.listen(PORTA, () => {

    console.log(
        `Servidor rodando em http://localhost:${PORTA}`
    );

});