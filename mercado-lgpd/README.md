# Mercado Online (Node.js + Express + MySQL com LGPD)

Mercado online com cadastro, login, compra, pagamento e perfil do cliente, seguindo a LGPD
(senha com bcrypt, CPF cifrado com AES, consentimentos, auditoria e exclusão/anonimização de dados).

---

## 1. O que precisa estar instalado

| Programa | Versão | Como conferir no terminal |
|---|---|---|
| [Node.js](https://nodejs.org) (já vem com o npm) | 18 ou mais nova (testado na 22) | `node -v` e `npm -v` |
| [MySQL Server](https://dev.mysql.com/downloads/installer/) | 8.0 | — |
| MySQL Workbench (vem no instalador do MySQL) | 8.0 | — |
| [Git](https://git-scm.com) (só para baixar do GitHub) | qualquer | `git --version` |

> Depois de instalar o Node.js, feche e abra o VS Code de novo. Se `node -v` mostrar uma versão
> (ex.: `v22.20.0`), está tudo certo.

---

## 2. Baixar o projeto

Se ainda não tem o projeto no computador:

```bash
git clone https://github.com/nathansacaramal/atividades-js.git
cd atividades-js/mercado-lgpd
```

Se já tem a pasta, abra a pasta `mercado-lgpd` no VS Code, clique com o botão direito nela e
escolha **Open in Integrated Terminal**. Todos os comandos abaixo são rodados **dentro da pasta
`mercado-lgpd`**.

---

## 3. Instalar as dependências

```bash
npm install
```

Esse comando lê o `package.json` e instala tudo o que o projeto usa:

| Pacote | Para que serve |
|---|---|
| `express` | servidor e rotas |
| `express-session` | mantém o cliente logado (sessão de 30 minutos) |
| `mysql2` | conexão com o MySQL |
| `bcrypt` | hash das senhas |
| `dotenv` | lê as configurações do arquivo `.env` |

Opcional — para o servidor reiniciar sozinho a cada alteração no código:

```bash
npm install --save-dev nodemon
```

---

## 4. Criar o banco de dados

O arquivo [banco.sql](banco.sql) cria o banco `mercado`, as tabelas, triggers, views, procedures,
events, as roles e o usuário `mercado_app`, que é o usuário que o Node.js usa (nunca o root).

### Pelo MySQL Workbench (recomendado)

1. Abra o Workbench e conecte como **root**.
2. Menu **File > Open SQL Script...** e abra o `banco.sql`.
3. Clique no **raio** (Execute) para rodar o arquivo inteiro.
4. A execução vai **parar com um erro na parte "8. TESTES"** (`Cadastro permitido somente para
   maiores de 18 anos`). Isso é esperado: os testes terminam com erro de propósito. Até ali, o banco,
   o usuário `mercado_app` e o cliente de teste já foram criados.
5. (Opcional) Para conferir os outros testes, rode o restante da parte "8. TESTES" **uma linha por
   vez** (cursor na linha + `Ctrl + Enter`).

### Pelo terminal (alternativa)

Se o `mysql` estiver no PATH:

```bash
mysql -u root -p < banco.sql
```

Ele também para no primeiro teste com erro, o que é o esperado.

> O `banco.sql` apaga e recria o banco (`DROP DATABASE IF EXISTS mercado`). Rodar de novo zera
> todos os dados.

---

## 5. Criar o arquivo `.env`

O `.env` guarda as senhas e chaves do sistema e **não vai para o GitHub** (está no `.gitignore`).
O projeto traz um modelo chamado `.env copy`. Faça uma cópia com o nome `.env`:

PowerShell (Windows):

```powershell
Copy-Item ".env copy" .env
```

Git Bash / Linux / macOS:

```bash
cp ".env copy" .env
```

Conteúdo esperado do `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=mercado_app
DB_PASSWORD="Mercado#App2026"
DB_NAME=mercado

SESSION_SECRET="troque#este#segredo#por#um#texto#grande#e#aleatorio"

CPF_KEY="chave#cpf#mercado#2026"

PORTA=3000
```

Cuidados:

- Valores com `#` precisam ficar **entre aspas**, senão o resto da linha vira comentário.
- `DB_PASSWORD` tem que ser a mesma senha do `CREATE USER 'mercado_app'` no `banco.sql`.
- `CPF_KEY` tem que ser a mesma chave do `@chave_cpf` no `banco.sql`; se mudar uma, mude a outra.
- Troque o `SESSION_SECRET` por um texto grande e aleatório.

---

## 6. Rodar o servidor

```bash
npm start
```

ou, com o nodemon instalado (reinicia sozinho ao salvar):

```bash
npm run dev
```

Se der certo, o terminal mostra:

```
Servidor rodando em http://localhost:3000
Conectado ao MySQL como mercado_app!
```

Para parar o servidor: `Ctrl + C` no terminal.

---

## 7. Usar o sistema

Abra no navegador: **http://localhost:3000**

Cliente de teste (criado pelo `banco.sql`):

- **E-mail:** `teste@mercado.com`
- **Senha:** `Teste1234`

Ou crie uma conta nova em **Cadastro** (precisa ter 18 anos ou mais).

| Página | Endereço | Precisa de login |
|---|---|---|
| Login | `/` ou `/index.html` | não |
| Cadastro | `/cadastro.html` | não |
| Termos de Uso | `/termos.html` | não |
| Política de Privacidade | `/privacidade.html` | não |
| Comprar | `/comprar.html` | sim |
| Pagamento | `/pagamento.html` | sim |
| Meu perfil | `/perfil.html` | sim |

---

## 8. Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| POST | `/cadastro` | cadastra o cliente |
| POST | `/login` | faz login |
| POST | `/logout` | encerra a sessão |
| GET | `/produtos` | lista os produtos da vitrine |
| GET | `/produtos/categorias` | lista as categorias |
| GET | `/pedidos` | histórico de pedidos do cliente |
| POST | `/pedidos` | finaliza uma compra |
| GET | `/pedidos/:id` | detalhes de um pedido |
| POST | `/pedidos/:id/pagar` | paga um pedido |
| POST | `/pedidos/:id/cancelar` | cancela um pedido |
| GET | `/perfil` | dados do cliente logado |
| PUT | `/perfil` | atualiza os dados do cliente |
| PUT | `/perfil/consentimentos` | concede/revoga consentimentos de ofertas |
| GET | `/perfil/meus-dados` | exporta todos os dados do titular (LGPD) |
| DELETE | `/perfil` | elimina/anonimiza a conta (LGPD) |

Todas as rotas de `/produtos`, `/pedidos` e `/perfil` exigem login.

---

## 9. Problemas comuns

| Mensagem | Causa e solução |
|---|---|
| `'npm' não é reconhecido...` | Node.js não instalado ou VS Code aberto antes da instalação. Instale e reabra o VS Code. |
| `Erro ao conectar: Access denied for user 'mercado_app'` | O `banco.sql` não foi executado ou a senha do `.env` está diferente da do `banco.sql` (ou sem aspas). |
| `Erro ao conectar: Unknown database 'mercado'` | O `banco.sql` não foi executado. Veja o passo 4. |
| `Erro ao conectar: connect ECONNREFUSED` | O MySQL não está ligado. Inicie o serviço `MySQL80` (Serviços do Windows) ou pelo Workbench. |
| `secret option required for sessions` | O arquivo `.env` não existe ou não tem `SESSION_SECRET`. Veja o passo 5. |
| `Error: listen EADDRINUSE: address already in use :::3000` | Já tem um servidor rodando na porta 3000. Feche o outro terminal ou mude `PORTA` no `.env`. |
| CPF aparece vazio/estranho no perfil | `CPF_KEY` do `.env` diferente do `@chave_cpf` usado no `banco.sql`. |

---

## Resumo rápido dos comandos

```bash
git clone https://github.com/nathansacaramal/atividades-js.git
cd atividades-js/mercado-lgpd
npm install
# rodar o banco.sql no MySQL Workbench como root
cp ".env copy" .env          # no PowerShell: Copy-Item ".env copy" .env
npm start                    # ou: npm run dev
# abrir http://localhost:3000  (teste@mercado.com / Teste1234)
```
