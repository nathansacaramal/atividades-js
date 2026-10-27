==========================================================
  PASTA ROUTES  (as ROTAS)          >>> PASSO 1 de 4 <<<
==========================================================

ORDEM PARA FAZER A ATIVIDADE:

  1. routes/       <-- VOCE ESTA AQUI. Comece por esta!
  2. middlewares/
  3. server.js     (junta tudo)
  4. public/       (as paginas HTML, por ultimo)


----------------------------------------------------------
PARA QUE SERVE ESTA PASTA?
----------------------------------------------------------

Imagine um supermercado. As ROTAS sao os BALCOES.
Cada balcao faz UM trabalho:

  - um balcao faz o cadastro e o login   -> auth.js
  - um balcao mostra os produtos         -> produtos.js
  - um balcao cuida das compras          -> pedidos.js
  - um balcao cuida dos seus dados       -> perfil.js

E aqui que o trabalho DE VERDADE acontece:
salvar no banco, buscar produtos, pagar, etc.


----------------------------------------------------------
POR QUE COMECAR POR AQUI?
----------------------------------------------------------

Porque sem balcao nao tem loja!
Primeiro a gente decide O QUE o sistema faz.
Depois a gente coloca seguranca (middlewares)
e por fim deixa bonito (public).


----------------------------------------------------------
TODA ROTA SEGUE A MESMA RECEITA (3 passos)
----------------------------------------------------------

  1. LER     o que o cliente mandou   (req.body, req.params, req.query)
  2. FALAR   com o banco de dados     (conexao.query)
  3. RESPONDER                        (res.json)


----------------------------------------------------------
O QUE COLOCAR EM CADA ARQUIVO (modelo pronto)
----------------------------------------------------------

    const express = require("express");
    const conexao = require("../db");

    const router = express.Router();

    // GET = buscar / ver
    router.get("/", async (req, res) => {

        const [linhas] = await conexao.query("SELECT * FROM produtos");

        res.json(linhas);

    });

    module.exports = router;   // <- NAO ESQUECA! Sem isso o server.js nao enxerga.


----------------------------------------------------------
OS 4 TIPOS DE ROTA
----------------------------------------------------------

  GET     -> buscar / ver        (ex.: ver os produtos)
  POST    -> criar / enviar      (ex.: fazer cadastro)
  PUT     -> alterar             (ex.: mudar meu e-mail)
  DELETE  -> apagar              (ex.: excluir minha conta)


----------------------------------------------------------
PASSO A PASSO
----------------------------------------------------------

  [ ] 1. Crie um arquivo .js para cada ASSUNTO (auth, produtos...)
  [ ] 2. Em cada um, escreva:  const router = express.Router();
  [ ] 3. Crie as rotas com router.get / post / put / delete
  [ ] 4. No final:  module.exports = router;
  [ ] 5. Pronto? Va para a pasta middlewares/


----------------------------------------------------------
DICAS DE OURO
----------------------------------------------------------

  * Um arquivo = um assunto. Nao misture tudo num arquivo so.
  * O caminho aqui e CURTO. Ex.: router.post("/:id/pagar")
    O comeco do caminho ("/pedidos") quem coloca e o server.js.
    Resultado final: POST /pedidos/7/pagar
  * Use sempre "?" no SQL, nunca junte texto do usuario direto:
        conexao.query("SELECT * FROM clientes WHERE id = ?", [id])
  * O id do cliente logado vem de req.session.clienteId,
    NUNCA do formulario (senao alguem pode fingir ser outra pessoa).
