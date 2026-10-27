# Como o projeto está organizado

Pense no projeto como um **supermercado de verdade**:

| No mercado | No projeto | O que faz |
|---|---|---|
| A loja | `public/` | páginas HTML, CSS e o JS que roda **no navegador** |
| A portaria | `server.js` | liga o servidor e decide **por onde** cada pedido passa |
| Os seguranças | `middlewares/` | conferem o pedido **antes** de ele chegar no balcão |
| Os balcões | `routes/` | fazem o trabalho de verdade (cadastrar, comprar, pagar...) |
| O depósito | `db.js` + MySQL | conexão com o banco de dados |
| O cofre | `.env` | senhas e chaves (não vai para o GitHub) |

```
mercado-lgpd/
├── server.js          ← portaria
├── db.js              ← porta do depósito (MySQL)
├── middlewares/
│   ├── exigirLogin.js ← "está logado? então passa"
│   ├── validacoes.js  ← "os dados do formulário estão certos?"
│   └── tratarErros.js ← "deu erro? eu explico para o cliente"
├── routes/
│   ├── auth.js        ← cadastro, login, sair
│   ├── produtos.js    ← vitrine
│   ├── pedidos.js     ← comprar, pagar, cancelar
│   └── perfil.js      ← meus dados (LGPD)
└── public/            ← a loja (o que aparece no navegador)
```

> O JS de `public/js/` roda **no navegador**; o resto roda **no servidor**. Eles só conversam pelo `fetch()`.

---

## `server.js` — a portaria

É o primeiro arquivo que roda (`npm start`). Ele não faz compra nem login: só **organiza o caminho**.

```js
app.use(express.json());                         // entende JSON (cria o req.body)
app.use(session({ ... }));                       // dá a "pulseirinha" (cookie) de quem logou
app.use(express.static("public"));               // abre a loja

app.use("/", rotasAuth);                         // login: aberto para todos
app.use("/pedidos", exigirLogin, rotasPedidos);  // pedidos: segurança primeiro!

app.use(tratarErros);                            // emergência: sempre por último
```

O Express lê **de cima para baixo**, como uma fila. Por isso a ordem importa.

---

## `middlewares/` — os seguranças

Um middleware fica **no meio do caminho** e recebe `req` (o pedido), `res` (a resposta) e `next`
(deixar passar). Ele faz **uma** de duas coisas:

- **deixa passar** → `next()`
- **barra** → `res.status(...).json(...)`

```js
function exigirLogin(req, res, next) {
    if (req.session.clienteId) return next();               // tem pulseira: passa
    res.status(401).json({ erro: "Sua sessão expirou." });   // não tem: barrado
}
```

- **`exigirLogin`** → só entra quem fez login.
- **`validacoes`** → confere nome, e-mail, senha, idade, CPF. *O servidor nunca confia no navegador.*
- **`tratarErros`** → quando algo dá errado, mostra uma mensagem amigável e esconde os detalhes do SQL.

---

## `routes/` — os balcões

Cada arquivo cuida de **um assunto**. O `server.js` dá o **prefixo** e a rota completa o caminho:

```js
app.use("/pedidos", exigirLogin, rotasPedidos);   // server.js
router.post("/:id/pagar", ...);                   // routes/pedidos.js
// resultado: POST /pedidos/7/pagar
```

Toda rota segue a mesma receita: **lê** o pedido → **consulta** o banco (`db.js`) → **responde** com `res.json()`.

| Método | Significa |
|---|---|
| `GET` | buscar / ver |
| `POST` | criar / enviar |
| `PUT` | alterar |
| `DELETE` | apagar |

---

## Juntando tudo: o clique em "Pagar"

```
Navegador  fetch("/pedidos/7/pagar")
   ↓
server.js  → express.json → session
   ↓
exigirLogin  → logado? ✔ next()        ✘ → 401 (volta ao login)
   ↓
routes/pedidos.js → db.js → MySQL
   ↓                          ✘ erro → tratarErros → mensagem amigável
res.json({ mensagem: "Pagamento aprovado!" })
   ↓
Navegador mostra a mensagem
```

---

## Para pensar

1. O que acontece se tirarmos o `exigirLogin` da linha de `/pedidos`?
2. Por que o `tratarErros` precisa ser a **última** linha?
3. Para criar uma página de **favoritos**, quais arquivos você mexeria?
