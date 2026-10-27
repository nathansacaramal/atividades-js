==========================================================
  PASTA PUBLIC/CSS  (a ROUPA da pagina)        >>> PASSO 4 <<<
==========================================================

ORDEM PARA FAZER A ATIVIDADE:

  1. routes/       (ja fez)
  2. middlewares/  (ja fez)
  3. server.js     (ja fez - juntou tudo)
  4. public/       <-- VOCE ESTA AQUI
       a. os arquivos .html  (o esqueleto)
       b. css/               <-- ESTA PASTA (a roupa)
       c. js/                (os movimentos)


----------------------------------------------------------
PARA QUE SERVE ESTA PASTA?
----------------------------------------------------------

O HTML e o esqueleto da pagina.
O CSS e a ROUPA: cores, tamanhos, espacos, bordas,
onde cada coisa fica na tela.

O CSS nao faz nada funcionar. Ele so deixa BONITO.
Por isso ele vem depois do HTML pronto.


----------------------------------------------------------
COMO ESTA PASTA ESTA ORGANIZADA
----------------------------------------------------------

  estilo.css  -> UM arquivo so para o site inteiro

Assim todas as paginas ficam com a mesma cara.
Mudou a cor aqui? Muda em todas as paginas de uma vez!


----------------------------------------------------------
COMO LIGAR O CSS NO HTML
----------------------------------------------------------

Coloque dentro do <head> de CADA pagina:

    <link rel="stylesheet" href="css/estilo.css">


----------------------------------------------------------
COMO ESCREVER O CSS (modelo pronto)
----------------------------------------------------------

Sempre assim:  QUEM { COMO_FICA }

    /* Pela TAG: vale para todos os <body> */
    body {
        background: #f2f2f2;    /* cor do fundo */
        font-family: Arial;     /* tipo de letra */
        padding: 20px;          /* espaco por dentro */
    }

    /* Pela CLASSE (com ponto): vale para class="caixa" */
    .caixa {
        max-width: 450px;       /* largura maxima */
        margin: 40px auto;      /* auto = centraliza */
        background: white;
        border-radius: 10px;    /* cantos arredondados */
    }

    /* Mensagens que o JS mostra */
    .sucesso { color: green; }
    .erro    { color: red; }

E no HTML voce usa a classe assim:

    <div class="caixa"> ... </div>


----------------------------------------------------------
PASSO A PASSO
----------------------------------------------------------

  [ ] 1. Crie o arquivo estilo.css
  [ ] 2. Ligue ele no <head> de todas as paginas
  [ ] 3. Comece pelo body (fundo e letra)
  [ ] 4. Depois as caixas, formularios (input, button) e tabelas
  [ ] 5. Por ultimo, as classes .sucesso e .erro das mensagens
  [ ] 6. Salve e aperte F5 no navegador para ver a mudanca


----------------------------------------------------------
DICAS DE OURO
----------------------------------------------------------

  * Ponto = classe (.caixa). Sem ponto = tag (body, h1).
  * Esqueceu o ";" no final da linha? A linha de baixo
    pode parar de funcionar.
  * Mudou o CSS e nada aconteceu? Aperte Ctrl + F5
    (o navegador as vezes guarda a versao antiga).
  * Aperte F12 e clique em qualquer parte da pagina:
    da para ver e testar o CSS ao vivo, sem estragar nada.
