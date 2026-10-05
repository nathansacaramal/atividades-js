# Graph Report - atividades-js  (2026-09-18)

## Corpus Check
- Corpus is ~6,367 words - fits in a single context window. You may not need a graph.

## Summary
- 252 nodes · 257 edges · 24 communities (17 shown, 7 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.87)
- Token cost: 99,483 input · 0 output

## Community Hubs (Navigation)
- Multi-App Express/MySQL Core
- node_get_tarde Dependencies
- atividade_node Dependencies
- node_biblioteca Dependencies
- node_post_login Dependencies
- node_post Dependencies
- node_delete Dependencies
- node_get_noite Dependencies
- Signup Form Validation
- Todo App Logic
- Burger Order Wizard
- Java Servlet Receiver
- node_post_login Server/DB
- Product Listing Pages
- node_post Server/DB
- README Setup + Git Workflow
- Random Number Script
- Login/Signup Pages
- Restaurant Signup Forms
- Student Registration Page
- Login Success Page
- User Registration Page
- Word Search Game

## God Nodes (most connected - your core abstractions)
1. `Dev Burger Multi-Step Order App` - 6 edges
2. `validateForm()` - 5 edges
3. `setFieldStatus()` - 5 edges
4. `renderTasks()` - 5 edges
5. `ReceberDados` - 4 edges
6. `finalizar()` - 4 edges
7. `Cadastro Simples (localStorage form)` - 4 edges
8. `Node.js/Express/MySQL Setup Instructions (README)` - 4 edges
9. `scripts` - 3 edges
10. `validateName()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Lista de Produtos Page (atividade_node)` --semantically_similar_to--> `Lista de Produtos Page (node_get_noite)`  [INFERRED] [semantically similar]
  atividade_node/public/listar.html → node_get_noite/public/listar.html
- `Lista de Produtos Page (atividade_node)` --semantically_similar_to--> `Lista de Produtos Page (node_get_tarde)`  [INFERRED] [semantically similar]
  atividade_node/public/listar.html → node_get_tarde/public/listar.html
- `carregarProdutos()` --semantically_similar_to--> `Lista de Produtos Page (atividade_node)`  [INFERRED] [semantically similar]
  node_delete/public/index.html → atividade_node/public/listar.html
- `Gerenciador de Tarefas (Todo App)` --semantically_similar_to--> `Cadastro Simples (localStorage form)`  [INFERRED] [semantically similar]
  checkbox/checkbox.html → localstorform/index.html
- `Validador de Formulário / Signup Page` --semantically_similar_to--> `Cadastro Page (node_post_login)`  [INFERRED] [semantically similar]
  confirm/index.html → node_post_login/public/cadastro.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Login and Registration Flow (node_post_login)** — node_post_login_public_index_page, node_post_login_public_cadastro_page, node_post_login_public_home_page [INFERRED 0.85]
- **Duplicate 'Lista de Produtos' Pages Across Exercises** — atividade_node_public_listar_page, node_get_noite_public_listar_page, node_get_tarde_public_listar_page, node_delete_public_index_page [INFERRED 0.85]
- **Dev Burger Multi-Step Checkout Wizard** — hambur_index_mostrar, hambur_index_proxima, hambur_index_voltar, hambur_index_finalizar [INFERRED 0.90]

## Communities (24 total, 7 thin omitted)

### Community 0 - "Multi-App Express/MySQL Core"
Cohesion: 0.07
Nodes (26): conexao, mysql, app, conexao, express, path, conexao, mysql (+18 more)

### Community 1 - "node_get_tarde Dependencies"
Cohesion: 0.09
Nodes (22): author, dependencies, bootstrap, express, mysql2, pg, description, devDependencies (+14 more)

### Community 2 - "atividade_node Dependencies"
Cohesion: 0.10
Nodes (19): author, dependencies, express, mysql2, description, devDependencies, nodemon, express (+11 more)

### Community 3 - "node_biblioteca Dependencies"
Cohesion: 0.10
Nodes (19): author, dependencies, bcrypt, express, mysql2, nodemon, description, bcrypt (+11 more)

### Community 4 - "node_post_login Dependencies"
Cohesion: 0.11
Nodes (17): author, dependencies, bcrypt, express, mysql2, description, bcrypt, express (+9 more)

### Community 5 - "node_post Dependencies"
Cohesion: 0.11
Nodes (17): author, dependencies, express, mysql2, nodemon, description, express, mysql2 (+9 more)

### Community 6 - "node_delete Dependencies"
Cohesion: 0.12
Nodes (16): author, dependencies, express, mysql2, description, express, mysql2, keywords (+8 more)

### Community 7 - "node_get_noite Dependencies"
Cohesion: 0.12
Nodes (15): author, dependencies, express, mysql2, description, express, mysql2, keywords (+7 more)

### Community 8 - "Signup Form Validation"
Cohesion: 0.26
Nodes (12): confirmPasswordInput, emailInput, form, nameInput, passwordInput, setFieldStatus(), submitBtn, validateConfirmPassword() (+4 more)

### Community 9 - "Todo App Logic"
Cohesion: 0.24
Nodes (7): deleteTask(id), escapeHTML(str), Gerenciador de Tarefas (Todo App), renderTasks(), saveAndRender(), toggleTask(id), Cadastro Simples (localStorage form)

### Community 10 - "Burger Order Wizard"
Cohesion: 0.29
Nodes (9): carregarBebidas(), carregarHamburgueres(), finalizar(), mostrar(), Dev Burger Multi-Step Order App, proxima(), selecionaBebida(i, el), selecionaHamburguer(indice, card) (+1 more)

### Community 11 - "Java Servlet Receiver"
Cohesion: 0.29
Nodes (8): ioexception, javax.servlet.annotation.WebServlet, javax.servlet.http.HttpServlet, javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, printwriter, ReceberDados, servletexception

### Community 12 - "node_post_login Server/DB"
Cohesion: 0.22
Nodes (7): conexao, mysql, app, bcrypt, conexao, express, ref_bcrypt

### Community 13 - "Product Listing Pages"
Cohesion: 0.32
Nodes (8): Lista de Produtos Page (atividade_node), carregarProdutos(), excluirProduto(id), Lista de Produtos com Exclusão (node_delete), Home Page (node_get_noite), Lista de Produtos Page (node_get_noite), Home Page (node_get_tarde), Lista de Produtos Page (node_get_tarde)

### Community 14 - "node_post Server/DB"
Cohesion: 0.29
Nodes (5): conexao, mysql, app, db, express

### Community 15 - "README Setup + Git Workflow"
Cohesion: 0.40
Nodes (5): Node.js/Express/MySQL Setup Instructions (README), Express (npm package), mysql2 (npm package), nodemon (npm package), Git Workflow: New Repo vs Existing Repo Sequence

### Community 17 - "Login/Signup Pages"
Cohesion: 0.67
Nodes (3): Validador de Formulário / Signup Page, Cadastro Page (node_post_login), Login Page (node_post_login)

## Knowledge Gaps
- **165 isolated node(s):** `mysql`, `conexao`, `name`, `version`, `description` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 176 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `mysql`, `conexao`, `name` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Multi-App Express/MySQL Core` be split into smaller, more focused modules?**
  _Cohesion score 0.0677361853832442 - nodes in this community are weakly interconnected._
- **Should `node_get_tarde Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `atividade_node Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `node_biblioteca Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `node_post_login Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `node_post Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._