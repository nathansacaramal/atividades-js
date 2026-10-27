// =======================================================
// MIDDLEWARE: BLOQUEIA QUEM NÃO ESTÁ LOGADO
// =======================================================

function exigirLogin(req, res, next) {

    // O id do cliente só existe na sessão depois do login
    if (req.session.clienteId) {

        return next();

    }

    // Se o navegador pediu uma página, volta para o login
    if (req.accepts(["json", "html"]) === "html") {

        return res.redirect("/");

    }

    // Se foi um fetch(), responde 401 em JSON
    res.status(401).json({ erro: "Sua sessão expirou. Faça login novamente." });

}

module.exports = exigirLogin;
