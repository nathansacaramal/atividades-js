// Carrega as variáveis do arquivo .env (precisa vir antes de tudo)
require("dotenv").config({ quiet: true });

// Importa o framework Express
const express = require("express");

// Importa o express-session, que mantém o cliente logado
const session = require("express-session");

// Middlewares do projeto
const exigirLogin = require("./middlewares/exigirLogin");
const tratarErros = require("./middlewares/tratarErros");

// Rotas do projeto
const rotasAuth = require("./routes/auth");
const rotasProdutos = require("./routes/produtos");
const rotasPedidos = require("./routes/pedidos");
const rotasPerfil = require("./routes/perfil");

// Cria a aplicação Express
const app = express();

const PORTA = process.env.PORTA || 3000;


// =======================================================
// CONFIGURAÇÕES DO SERVIDOR
// =======================================================

// Permite que a aplicação receba dados no formato JSON (enviados via fetch)
app.use(express.json());

// Sessão: guarda o id do cliente no servidor; o navegador só recebe o cookie
app.use(session({
    name: "mercado.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // só cria a sessão depois do login
    rolling: true,            // cada requisição renova os 30 minutos
    cookie: {
        httpOnly: true,           // o JavaScript da página não consegue ler o cookie
        sameSite: "strict",
        maxAge: 30 * 60 * 1000    // 30 minutos
    }
}));

// Páginas que só podem ser abertas por quem está logado
app.use(["/comprar.html", "/pagamento.html", "/perfil.html"], exigirLogin);

// Informa ao Express que todos os arquivos da pasta "public"
// poderão ser acessados pelo navegador.
app.use(express.static("public"));


// =======================================================
// ROTAS
// =======================================================

// Cadastro, login e logout (abertas)
app.use("/", rotasAuth);

// Daqui para baixo, só para quem está logado
app.use("/produtos", exigirLogin, rotasProdutos);
app.use("/pedidos", exigirLogin, rotasPedidos);
app.use("/perfil", exigirLogin, rotasPerfil);

// Trata os erros de todas as rotas (sempre por último)
app.use(tratarErros);


// =======================================================
// INICIALIZAÇÃO DO SERVIDOR
// =======================================================

app.listen(PORTA, () => {

    console.log(`Servidor rodando em http://localhost:${PORTA}`);

});
