Após a instalação do NODE.JS via navegador.

Caso o vscode de vocês esteja aberto, fechar e abrir novamente.

Após isso, dar o comando npm -v, caso retorne uma versão (EX: 24.1.1), 
significa que está correto.

Caso seja sinalizado a execução correta, rodar os seguintes comandos.

npm init -y

npm install express

npm install mysql2.

Após isso criar dentro da pasta um arquivo chamado db.js e colocar as determinadas configurações.

Depois criar o server.js e também criar as determinadas configurações.

Após isso, dar o node server.js para executar o node.

OBS: pesquisar sobre o nodemoon(npm install --save-dev nodemon).

Dentro do db.js você cria a conexão com o banco de dados.

Dentro do server.js você cria as rotas para posteriormente chamar ela via fetch
para imprimir os dados