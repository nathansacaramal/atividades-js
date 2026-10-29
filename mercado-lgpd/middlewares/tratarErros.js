// =======================================================
// MIDDLEWARE: TRATAMENTO DE ERROS
// =======================================================
// Nunca mostra ao usuário os erros internos do banco (SQL).
// Só as mensagens das regras do banco (SIGNAL SQLSTATE '45000'),
// como "Estoque insuficiente", aparecem na tela.

function tratarErros(erro, req, res, next) {

    // Regra de negócio das procedures e triggers
    if (erro.sqlState === "45000") {

        return res.status(400).json({ erro: erro.sqlMessage });

    }

    // JSON mal formado enviado para o servidor
    if (erro.type === "entity.parse.failed") {

        return res.status(400).json({ erro: "Dados inválidos." });

    }

    // Qualquer outro erro: aparece só no terminal
    console.log(erro);

    res.status(500).json({ erro: "Não foi possível concluir a operação. Tente novamente." });

}

module.exports = tratarErros;
