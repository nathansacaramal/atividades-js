==========================================================
  PASTA MIDDLEWARES  (os SEGURANCAS)   >>> PASSO 2 de 4 <<<
==========================================================

ORDEM PARA FAZER A ATIVIDADE:

  1. routes/       (ja fez? entao continue)
  2. middlewares/  <-- VOCE ESTA AQUI
  3. server.js     (junta tudo)
  4. public/       (as paginas HTML, por ultimo)


----------------------------------------------------------
PARA QUE SERVE ESTA PASTA?
----------------------------------------------------------

No supermercado, antes de chegar no balcao (rota),
voce passa pelo SEGURANCA.

O middleware fica NO MEIO DO CAMINHO (por isso "middle").
Ele olha o pedido e decide UMA de duas coisas:

  - DEIXA PASSAR  ->  next()
  - BARRA         ->  res.status(...).json({ erro: "..." })

Neste projeto temos 3 segurancas:

  exigirLogin.js  -> "Voce esta logado? Entao pode passar."
  validacoes.js   -> "Os dados do formulario estao certos?"
  tratarErros.js  -> "Deu erro? Eu explico com calma pro cliente."


----------------------------------------------------------
POR QUE FAZER DEPOIS DAS ROTAS?
----------------------------------------------------------

Porque primeiro precisa existir o balcao.
So depois faz sentido colocar um seguranca na frente dele!


----------------------------------------------------------
O QUE COLOCAR EM CADA ARQUIVO (modelo pronto)
----------------------------------------------------------

Todo middleware recebe 3 coisas: req, res e next.

    function exigirLogin(req, res, next) {

        // Tem a "pulseirinha" de quem fez login? Passa!
        if (req.session.clienteId) {
            return next();
        }

        // Nao tem? Barrado.
        res.status(401).json({ erro: "Faca login primeiro." });

    }

    module.exports = exigirLogin;   // <- NAO ESQUECA!


ATENCAO: o middleware de ERRO e diferente, ele recebe 4 coisas:

    function tratarErros(erro, req, res, next) { ... }

E esse "erro" no comeco que avisa o Express que ele cuida de erros.


----------------------------------------------------------
PASSO A PASSO
----------------------------------------------------------

  [ ] 1. Crie um arquivo .js para cada seguranca
  [ ] 2. Escreva a funcao com (req, res, next)
  [ ] 3. Ou chama next(), ou responde com erro. Nunca os dois!
  [ ] 4. No final:  module.exports = nomeDaFuncao;
  [ ] 5. Se for uma validacao, coloque na rota assim:
            router.post("/cadastro", validarCadastro, async (req, res) => { ... });
                                     ^^^^^^^^^^^^^^^
                                     o seguranca vem ANTES da rota
  [ ] 6. Pronto? Va para o server.js


----------------------------------------------------------
DICAS DE OURO
----------------------------------------------------------

  * Esqueceu o next()?  A pagina fica "carregando" para sempre.
  * O servidor NUNCA confia no navegador. Mesmo que o HTML
    ja confira os campos, confira de novo aqui.
  * Nunca mostre erro do SQL para o usuario. Mostre uma
    mensagem simples e deixe o detalhe so no terminal.
