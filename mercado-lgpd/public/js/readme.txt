==========================================================
  PASTA PUBLIC/JS  (os MOVIMENTOS da pagina)   >>> PASSO 4 <<<
==========================================================

ORDEM PARA FAZER A ATIVIDADE:

  1. routes/       (ja fez)
  2. middlewares/  (ja fez)
  3. server.js     (ja fez - juntou tudo)
  4. public/       <-- VOCE ESTA AQUI
       a. os arquivos .html  (o esqueleto)
       b. css/               (a roupa)
       c. js/                <-- ESTA PASTA (os movimentos)


----------------------------------------------------------
PARA QUE SERVE ESTA PASTA?
----------------------------------------------------------

O HTML e o esqueleto, o CSS e a roupa...
e o JS e o que faz a pagina SE MEXER:

  - quando clica no botao, alguma coisa acontece
  - pega o que a pessoa digitou no formulario
  - manda para o servidor e mostra a resposta na tela

MUITO IMPORTANTE:
Este JS roda NO NAVEGADOR (no computador de quem visita).
Ele NAO fala com o banco de dados. Quem fala com o banco
e o servidor (routes). O JS daqui so conversa com o
servidor usando fetch().

    Navegador (js/)  --fetch-->  servidor (routes)  -->  banco


----------------------------------------------------------
COMO ESTA PASTA ESTA ORGANIZADA
----------------------------------------------------------

  comum.js      -> funcoes que TODAS as paginas usam
                   (mostrarMensagem, formatarPreco, formatarData...)
  login.js      -> so da pagina index.html
  cadastro.js   -> so da pagina cadastro.html
  comprar.js    -> so da pagina comprar.html
  pagamento.js  -> so da pagina pagamento.html
  perfil.js     -> so da pagina perfil.html

Regra facil: UMA pagina = UM arquivo .js com o mesmo nome.
O que se repete em varias paginas vai para o comum.js.


----------------------------------------------------------
COMO LIGAR O JS NO HTML
----------------------------------------------------------

Coloque no FINAL do HTML, antes do </body>:

    <script src="js/comum.js"></script>
    <script src="js/cadastro.js"></script>

A ORDEM IMPORTA! O comum.js vem PRIMEIRO,
porque o cadastro.js usa as funcoes dele.


----------------------------------------------------------
O QUE COLOCAR EM CADA ARQUIVO (modelo pronto)
----------------------------------------------------------

    // 1. Pega o formulario da pagina pelo id
    const formulario = document.getElementById("formCadastro");

    // 2. Quando a pessoa enviar...
    formulario.addEventListener("submit", async (evento) => {

        evento.preventDefault();   // nao deixa a pagina recarregar

        // 3. Le o que foi digitado
        const nome = document.getElementById("nome").value;

        // 4. Manda para o servidor (para a ROTA do Passo 1)
        const resposta = await fetch("/cadastro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome })
        });

        const dados = await resposta.json();

        // 5. Mostra a resposta na tela
        if (resposta.ok) {
            mostrarMensagem(dados.mensagem, "sucesso");
        } else {
            mostrarMensagem(dados.erro, "erro");
        }

    });


----------------------------------------------------------
PASSO A PASSO
----------------------------------------------------------

  [ ] 1. Crie o comum.js com as funcoes que se repetem
  [ ] 2. Crie um .js para cada pagina
  [ ] 3. Ligue os dois no HTML (comum.js primeiro!)
  [ ] 4. Pegue os elementos com document.getElementById("...")
  [ ] 5. Use fetch() com o MESMO caminho da rota
  [ ] 6. Mostre a mensagem de sucesso ou de erro


----------------------------------------------------------
DICAS DE OURO
----------------------------------------------------------

  * Algo nao funciona? Aperte F12 e olhe a aba "Console".
    O erro aparece la em vermelho, com o numero da linha.
  * Para colocar na tela o que veio do servidor, use
    textContent, NUNCA innerHTML. Assim ninguem consegue
    esconder um codigo malvado dentro de um nome ou produto.
  * Nunca coloque senha, chave ou regra secreta aqui.
    Qualquer pessoa pode ler este JS no navegador!
  * O id do getElementById tem que ser IGUAL ao id do HTML.
    "nome" e diferente de "Nome"!
