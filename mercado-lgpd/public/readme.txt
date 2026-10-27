==========================================================
  PASTA PUBLIC  (a LOJA)            >>> PASSO 4 de 4 <<<
==========================================================

ORDEM PARA FAZER A ATIVIDADE:

  1. routes/       (ja fez)
  2. middlewares/  (ja fez)
  3. server.js     (ja fez - juntou tudo)
  4. public/       <-- VOCE ESTA AQUI. A ultima etapa!


----------------------------------------------------------
PARA QUE SERVE ESTA PASTA?
----------------------------------------------------------

E a parte da loja que o CLIENTE VE: as prateleiras,
as placas, os botoes. Tudo que aparece no navegador.

  *.html  -> as paginas (o esqueleto)
  css/    -> as cores e o visual (a roupa)
  js/     -> o que acontece quando clica (os movimentos)

IMPORTANTE: o JS daqui roda NO NAVEGADOR,
nao no servidor. Ele conversa com o servidor usando fetch().


----------------------------------------------------------
POR QUE FAZER POR ULTIMO?
----------------------------------------------------------

Porque a pagina precisa de rotas prontas para conversar.
Botao bonito que nao faz nada nao serve pra nada!
Primeiro funciona, depois fica bonito.


----------------------------------------------------------
ANTES DE COMECAR, CONFIRA NO server.js:
----------------------------------------------------------

    app.use(express.static("public"));

Essa linha "abre a porta da loja". Sem ela, o navegador
nao consegue abrir nenhum arquivo desta pasta.


----------------------------------------------------------
COMO A PAGINA CONVERSA COM O SERVIDOR (modelo pronto)
----------------------------------------------------------

    // public/js/cadastro.js

    const resposta = await fetch("/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "Ana", email: "ana@email.com" })
    });

    const dados = await resposta.json();

    alert(dados.mensagem || dados.erro);

O caminho do fetch ("/cadastro") tem que ser IGUAL
ao caminho da rota que voce criou no Passo 1!


----------------------------------------------------------
PASSO A PASSO
----------------------------------------------------------

  [ ] 1. Crie o index.html (a primeira pagina que abre)
  [ ] 2. Crie as outras paginas (.html)
  [ ] 3. Crie o arquivo da pasta css/ e ligue no HTML:
            <link rel="stylesheet" href="css/estilo.css">
  [ ] 4. Crie um .js na pasta js/ para cada pagina e ligue no HTML:
            <script src="js/cadastro.js"></script>
  [ ] 5. Use fetch() para chamar as rotas
  [ ] 6. Rode  npm start  e abra  http://localhost:3000


----------------------------------------------------------
DICAS DE OURO
----------------------------------------------------------

  * Algo nao funciona? Aperte F12 no navegador e olhe a aba
    "Console" (erros do JS) e a aba "Rede/Network" (o fetch).
  * Nunca coloque senha ou chave secreta aqui.
    TUDO desta pasta qualquer pessoa consegue ver!
  * Conferir campos no HTML e bom para ajudar o usuario,
    mas quem protege de verdade e o servidor (middlewares).
