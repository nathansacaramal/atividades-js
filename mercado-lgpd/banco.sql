-- =======================================================
-- ATIVIDADE - SISTEMA DE MERCADO (MySQL + Node.js com LGPD)
-- PARTE 1 - BANCO DE DADOS
-- =======================================================
-- Execute este arquivo conectado como root (MySQL 8.0).
-- No Workbench: abra o arquivo e execute tudo (raio).
-- A parte de TESTES (no final) deve ser executada uma linha por vez,
-- porque cada teste termina com um erro de propósito.
-- =======================================================


-- Liga o agendador de eventos (necessário para os EVENTS funcionarem)
SET GLOBAL event_scheduler = ON;

-- Apaga o banco se ele já existir, para o script poder ser executado de novo
DROP DATABASE IF EXISTS mercado;

-- utf8mb4 guarda qualquer caractere (acentos, emojis...)
CREATE DATABASE mercado CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE mercado;


-- =======================================================
-- 1. TABELAS
-- =======================================================

-- Clientes (titulares dos dados)
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,               -- chave substituta (o CPF NÃO é a chave)
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,                -- só o hash do bcrypt, nunca a senha
    cpf_cifrado VARBINARY(64) NULL,                  -- opcional, só para CPF na nota (AES_ENCRYPT)
    telefone VARCHAR(20) NULL,                       -- opcional
    data_nascimento DATE NOT NULL,
    termos_versao VARCHAR(10) NOT NULL,              -- versão dos Termos de Uso aceita
    termos_aceito_em DATETIME NOT NULL,              -- data do aceite
    tentativas_login TINYINT UNSIGNED NOT NULL DEFAULT 0,
    bloqueado_ate DATETIME NULL,
    ultimo_acesso DATETIME NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_clientes_email UNIQUE (email),
    CONSTRAINT ck_clientes_email CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

-- Consentimentos para ofertas (cada concessão é uma linha; a revogação preenche revogado_em)
CREATE TABLE consentimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    finalidade ENUM('ofertas_email', 'ofertas_whatsapp') NOT NULL,
    concedido_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revogado_em DATETIME NULL,

    CONSTRAINT fk_consentimentos_cliente FOREIGN KEY (id_cliente)
        REFERENCES clientes(id) ON DELETE CASCADE
);

-- Categorias dos produtos
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,

    CONSTRAINT uq_categorias_nome UNIQUE (nome)
);

-- Produtos
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_produtos_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id),
    CONSTRAINT ck_produtos_preco CHECK (preco > 0),
    CONSTRAINT ck_produtos_estoque CHECK (estoque >= 0)
);

-- Pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('aguardando_pagamento', 'pago', 'cancelado') NOT NULL DEFAULT 'aguardando_pagamento',
    valor_total DECIMAL(10,2) NOT NULL,

    -- RESTRICT: um cliente com pedidos não pode ser apagado
    CONSTRAINT fk_pedidos_cliente FOREIGN KEY (id_cliente)
        REFERENCES clientes(id) ON DELETE RESTRICT,
    CONSTRAINT ck_pedidos_total CHECK (valor_total > 0)
);

-- Itens do pedido (guarda o preço do momento da compra)
CREATE TABLE itens_pedido (
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (id_pedido, id_produto),
    CONSTRAINT fk_itens_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id),
    CONSTRAINT fk_itens_produto FOREIGN KEY (id_produto) REFERENCES produtos(id),
    CONSTRAINT ck_itens_quantidade CHECK (quantidade BETWEEN 1 AND 50),
    CONSTRAINT ck_itens_preco CHECK (preco_unitario > 0)
);

-- Pagamentos: NUNCA guarda o número completo do cartão nem o CVV
CREATE TABLE pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    forma ENUM('pix', 'credito', 'debito') NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    bandeira VARCHAR(20) NULL,
    final_cartao CHAR(4) NULL,                       -- somente os 4 últimos dígitos
    codigo_transacao VARCHAR(64) NOT NULL,
    data_pagamento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_pagamentos_pedido UNIQUE (id_pedido),          -- um pagamento por pedido
    CONSTRAINT uq_pagamentos_transacao UNIQUE (codigo_transacao),
    CONSTRAINT fk_pagamentos_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id),
    CONSTRAINT ck_pagamentos_valor CHECK (valor > 0),

    -- PIX: bandeira e final ficam nulos. Cartão: os dois são obrigatórios e o final tem 4 dígitos
    CONSTRAINT ck_pagamentos_cartao CHECK (
        (forma = 'pix' AND bandeira IS NULL AND final_cartao IS NULL)
        OR
        (forma IN ('credito', 'debito') AND bandeira IS NOT NULL AND final_cartao REGEXP '^[0-9]{4}$')
    )
);

-- Log de acesso (Marco Civil da Internet: guardar por 6 meses)
CREATE TABLE log_acesso (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NULL,                             -- NULL quando o e-mail não existe
    ip VARCHAR(45) NOT NULL,                         -- 45 caracteres cabem um IPv6
    sucesso BOOLEAN NOT NULL,
    data_acesso DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_acesso_cliente FOREIGN KEY (id_cliente)
        REFERENCES clientes(id) ON DELETE SET NULL,
    INDEX idx_log_acesso_data (data_acesso)
);

-- Log de auditoria (não pode ser alterado nem apagado)
CREATE TABLE log_auditoria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    data_evento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(100) NOT NULL,
    operacao ENUM('INSERT', 'UPDATE', 'DELETE', 'EXPORTACAO') NOT NULL,
    tabela VARCHAR(64) NOT NULL,
    id_registro INT NOT NULL,
    detalhe JSON NULL
);


-- =======================================================
-- 2. TRIGGERS
-- =======================================================

DELIMITER $$

-- Impede o cadastro de menores de 18 anos
CREATE TRIGGER trg_clientes_maioridade
BEFORE INSERT ON clientes
FOR EACH ROW
BEGIN
    IF NEW.data_nascimento > CURDATE() - INTERVAL 18 YEAR THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cadastro permitido somente para maiores de 18 anos.';
    END IF;
END$$

-- Auditoria do cliente: registra QUAIS campos mudaram, sem copiar os valores
CREATE TRIGGER trg_clientes_auditoria
AFTER UPDATE ON clientes
FOR EACH ROW
BEGIN
    DECLARE v_campos JSON DEFAULT JSON_ARRAY();

    -- <=> compara tratando o NULL (NULL <=> NULL é verdadeiro)
    IF NOT (OLD.nome <=> NEW.nome) THEN
        SET v_campos = JSON_ARRAY_APPEND(v_campos, '$', 'nome');
    END IF;

    IF NOT (OLD.email <=> NEW.email) THEN
        SET v_campos = JSON_ARRAY_APPEND(v_campos, '$', 'email');
    END IF;

    IF NOT (OLD.senha_hash <=> NEW.senha_hash) THEN
        SET v_campos = JSON_ARRAY_APPEND(v_campos, '$', 'senha_hash');
    END IF;

    IF NOT (OLD.cpf_cifrado <=> NEW.cpf_cifrado) THEN
        SET v_campos = JSON_ARRAY_APPEND(v_campos, '$', 'cpf_cifrado');
    END IF;

    IF NOT (OLD.telefone <=> NEW.telefone) THEN
        SET v_campos = JSON_ARRAY_APPEND(v_campos, '$', 'telefone');
    END IF;

    IF NOT (OLD.data_nascimento <=> NEW.data_nascimento) THEN
        SET v_campos = JSON_ARRAY_APPEND(v_campos, '$', 'data_nascimento');
    END IF;

    IF NOT (OLD.termos_versao <=> NEW.termos_versao) THEN
        SET v_campos = JSON_ARRAY_APPEND(v_campos, '$', 'termos_versao');
    END IF;

    IF NOT (OLD.ativo <=> NEW.ativo) THEN
        SET v_campos = JSON_ARRAY_APPEND(v_campos, '$', 'ativo');
    END IF;

    -- tentativas_login, bloqueado_ate e ultimo_acesso mudam a cada login
    -- e já ficam registrados no log_acesso, por isso não entram aqui

    IF JSON_LENGTH(v_campos) > 0 THEN
        INSERT INTO log_auditoria (usuario, operacao, tabela, id_registro, detalhe)
        VALUES (USER(), 'UPDATE', 'clientes', NEW.id, JSON_OBJECT('campos_alterados', v_campos));
    END IF;
END$$

-- Registra cada mudança de status do pedido
CREATE TRIGGER trg_pedidos_status
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO log_auditoria (usuario, operacao, tabela, id_registro, detalhe)
        VALUES (USER(), 'UPDATE', 'pedidos', NEW.id,
                JSON_OBJECT('status_anterior', OLD.status, 'status_novo', NEW.status));
    END IF;
END$$

-- Pagamento não pode ser alterado
CREATE TRIGGER trg_pagamentos_bloqueia_update
BEFORE UPDATE ON pagamentos
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Pagamentos não podem ser alterados.';
END$$

-- Pagamento não pode ser apagado
CREATE TRIGGER trg_pagamentos_bloqueia_delete
BEFORE DELETE ON pagamentos
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Pagamentos não podem ser apagados.';
END$$

-- Log de auditoria não pode ser alterado
CREATE TRIGGER trg_auditoria_bloqueia_update
BEFORE UPDATE ON log_auditoria
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'O log de auditoria não pode ser alterado.';
END$$

-- Log de auditoria não pode ser apagado
CREATE TRIGGER trg_auditoria_bloqueia_delete
BEFORE DELETE ON log_auditoria
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'O log de auditoria não pode ser apagado.';
END$$

DELIMITER ;


-- =======================================================
-- 3. INSERINDO CATEGORIAS E PRODUTOS
-- =======================================================

INSERT INTO categorias (nome) VALUES
('Hortifrúti'),
('Padaria'),
('Laticínios'),
('Carnes'),
('Bebidas'),
('Limpeza'),
('Mercearia');

INSERT INTO produtos (id_categoria, nome, preco, estoque, ativo) VALUES
(1, 'Banana prata (kg)',            6.99, 120, TRUE),
(1, 'Tomate italiano (kg)',         8.49,  80, TRUE),
(1, 'Alface crespa (un)',           3.29,  40, TRUE),
(2, 'Pão francês (kg)',            16.90,  60, TRUE),
(2, 'Pão de forma integral',        9.79,  25, TRUE),
(3, 'Leite integral 1L',            5.49, 200, TRUE),
(3, 'Queijo muçarela (kg)',        44.90,  15, TRUE),
(3, 'Iogurte natural 170g',         3.19,  50, TRUE),
(4, 'Peito de frango (kg)',        19.90,  30, TRUE),
(4, 'Carne moída patinho (kg)',    42.90,  20, TRUE),
(5, 'Café torrado 500g',           24.90,  35, TRUE),
(5, 'Suco de uva integral 1L',     14.90,   0, TRUE),   -- sem estoque (usado no teste)
(5, 'Água mineral 1,5L',            2.99, 150, TRUE),
(6, 'Detergente neutro 500ml',      2.79,  90, TRUE),
(6, 'Sabão em pó 1kg',             17.49,   3, TRUE),
(7, 'Arroz branco 5kg',            27.90,  45, TRUE),
(7, 'Feijão carioca 1kg',           8.99,  60, TRUE),
(7, 'Macarrão espaguete 500g',      4.99,  70, TRUE),
(7, 'Biscoito recheado (fora de linha)', 3.49, 10, FALSE); -- inativo: não aparece na vitrine


-- =======================================================
-- 4. VIEWS
-- =======================================================

-- Produtos ativos com o nome da categoria
CREATE VIEW vw_vitrine AS
SELECT
    p.id,
    p.nome,
    p.preco,
    p.estoque,
    c.id AS id_categoria,
    c.nome AS categoria
FROM produtos p
JOIN categorias c ON c.id = p.id_categoria
WHERE p.ativo = TRUE;

-- Pedidos com os itens e o pagamento (uma linha por item)
CREATE VIEW vw_historico_compras AS
SELECT
    pe.id AS id_pedido,
    pe.id_cliente,
    pe.data_pedido,
    pe.status,
    pe.valor_total,
    i.id_produto,
    pr.nome AS produto,
    i.quantidade,
    i.preco_unitario,
    i.quantidade * i.preco_unitario AS subtotal,
    pg.forma AS forma_pagamento,
    pg.bandeira,
    pg.final_cartao,
    pg.data_pagamento
FROM pedidos pe
JOIN itens_pedido i ON i.id_pedido = pe.id
JOIN produtos pr ON pr.id = i.id_produto
LEFT JOIN pagamentos pg ON pg.id_pedido = pe.id;

-- Vendas por dia, categoria e faixa etária, SEM identificar o cliente
CREATE VIEW vw_vendas_anonimas AS
SELECT
    DATE(pe.data_pedido) AS dia,
    ca.nome AS categoria,
    CASE
        WHEN TIMESTAMPDIFF(YEAR, cl.data_nascimento, pe.data_pedido) < 25 THEN '18 a 24'
        WHEN TIMESTAMPDIFF(YEAR, cl.data_nascimento, pe.data_pedido) < 35 THEN '25 a 34'
        WHEN TIMESTAMPDIFF(YEAR, cl.data_nascimento, pe.data_pedido) < 45 THEN '35 a 44'
        WHEN TIMESTAMPDIFF(YEAR, cl.data_nascimento, pe.data_pedido) < 60 THEN '45 a 59'
        ELSE '60 ou mais'
    END AS faixa_etaria,
    COUNT(DISTINCT pe.id) AS quantidade_pedidos,
    SUM(i.quantidade) AS itens_vendidos,
    SUM(i.quantidade * i.preco_unitario) AS valor_vendido
FROM pedidos pe
JOIN clientes cl ON cl.id = pe.id_cliente
JOIN itens_pedido i ON i.id_pedido = pe.id
JOIN produtos pr ON pr.id = i.id_produto
JOIN categorias ca ON ca.id = pr.id_categoria
WHERE pe.status = 'pago'
GROUP BY dia, categoria, faixa_etaria;


-- =======================================================
-- 5. PROCEDURES (todas com transação)
-- =======================================================
-- Em todas elas, se acontecer qualquer erro, o HANDLER desfaz
-- a transação (ROLLBACK) e devolve o erro (RESIGNAL) para o Node.js.

DELIMITER $$

-- -------------------------------------------------------
-- Finaliza a compra: recebe o carrinho em JSON
-- Ex.: CALL sp_finalizar_compra(1, '[{"id_produto":1,"quantidade":2}]');
-- -------------------------------------------------------
CREATE PROCEDURE sp_finalizar_compra(IN p_id_cliente INT, IN p_itens JSON)
BEGIN
    DECLARE v_id_pedido INT;
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_travados INT;
    DECLARE v_sem_estoque VARCHAR(100);
    DECLARE v_mensagem VARCHAR(200);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_itens IS NULL OR JSON_LENGTH(p_itens) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'O carrinho está vazio.';
    END IF;

    -- Cada item precisa ter id_produto e quantidade de pelo menos 1
    IF EXISTS (
        SELECT 1
        FROM JSON_TABLE(p_itens, '$[*]' COLUMNS (
            id_produto INT PATH '$.id_produto',
            quantidade INT PATH '$.quantidade'
        )) AS j
        WHERE j.id_produto IS NULL OR j.quantidade IS NULL OR j.quantidade < 1
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Há um item inválido no carrinho.';
    END IF;

    START TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM clientes WHERE id = p_id_cliente AND ativo = TRUE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente não encontrado.';
    END IF;

    -- Lê o JSON com JSON_TABLE e junta itens repetidos do mesmo produto
    DROP TEMPORARY TABLE IF EXISTS tmp_carrinho;

    CREATE TEMPORARY TABLE tmp_carrinho AS
    SELECT j.id_produto, SUM(j.quantidade) AS quantidade
    FROM JSON_TABLE(p_itens, '$[*]' COLUMNS (
        id_produto INT PATH '$.id_produto',
        quantidade INT PATH '$.quantidade'
    )) AS j
    GROUP BY j.id_produto;

    IF EXISTS (SELECT 1 FROM tmp_carrinho WHERE quantidade > 50) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A quantidade de cada produto deve ser de 1 a 50.';
    END IF;

    -- Todos os produtos precisam existir e estar ativos
    IF EXISTS (
        SELECT 1
        FROM tmp_carrinho c
        LEFT JOIN produtos p ON p.id = c.id_produto AND p.ativo = TRUE
        WHERE p.id IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Um dos produtos do carrinho não está disponível.';
    END IF;

    -- Trava as linhas dos produtos (FOR UPDATE) para ninguém comprar o mesmo estoque ao mesmo tempo
    SELECT COUNT(*) INTO v_travados
    FROM produtos
    WHERE id IN (SELECT id_produto FROM tmp_carrinho)
    FOR UPDATE;

    -- Confere o estoque
    SET v_sem_estoque = (
        SELECT p.nome
        FROM produtos p
        JOIN tmp_carrinho c ON c.id_produto = p.id
        WHERE p.estoque < c.quantidade
        LIMIT 1
    );

    IF v_sem_estoque IS NOT NULL THEN
        SET v_mensagem = CONCAT('Estoque insuficiente para o produto: ', v_sem_estoque);
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_mensagem;
    END IF;

    -- Calcula o total com o preço atual dos produtos
    SELECT SUM(c.quantidade * p.preco) INTO v_total
    FROM tmp_carrinho c
    JOIN produtos p ON p.id = c.id_produto;

    -- Cria o pedido
    INSERT INTO pedidos (id_cliente, status, valor_total)
    VALUES (p_id_cliente, 'aguardando_pagamento', v_total);

    SET v_id_pedido = LAST_INSERT_ID();

    -- Cria os itens guardando o preço do momento da compra
    INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
    SELECT v_id_pedido, p.id, c.quantidade, p.preco
    FROM tmp_carrinho c
    JOIN produtos p ON p.id = c.id_produto;

    -- Dá baixa no estoque
    UPDATE produtos p
    JOIN tmp_carrinho c ON c.id_produto = p.id
    SET p.estoque = p.estoque - c.quantidade;

    COMMIT;

    DROP TEMPORARY TABLE IF EXISTS tmp_carrinho;

    SELECT v_id_pedido AS id_pedido, v_total AS valor_total;
END$$

-- -------------------------------------------------------
-- Paga um pedido: só do próprio cliente e com status aguardando_pagamento
-- No cartão recebe SOMENTE a bandeira e os 4 últimos dígitos
-- -------------------------------------------------------
CREATE PROCEDURE sp_pagar_pedido(
    IN p_id_cliente INT,
    IN p_id_pedido INT,
    IN p_forma VARCHAR(10),
    IN p_bandeira VARCHAR(20),
    IN p_final_cartao VARCHAR(4)
)
BEGIN
    DECLARE v_dono INT;
    DECLARE v_status VARCHAR(30);
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_data DATETIME;
    DECLARE v_codigo VARCHAR(64);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_forma IS NULL OR p_forma NOT IN ('pix', 'credito', 'debito') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Forma de pagamento inválida.';
    END IF;

    IF p_forma = 'pix' THEN
        SET p_bandeira = NULL;
        SET p_final_cartao = NULL;
    ELSEIF p_bandeira IS NULL OR p_final_cartao IS NULL OR p_final_cartao NOT REGEXP '^[0-9]{4}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Informe a bandeira e somente os 4 últimos dígitos do cartão.';
    END IF;

    START TRANSACTION;

    -- Trava o pedido para não ser pago ou cancelado duas vezes ao mesmo tempo
    SELECT id_cliente, status, valor_total, data_pedido
    INTO v_dono, v_status, v_total, v_data
    FROM pedidos
    WHERE id = p_id_pedido
    FOR UPDATE;

    IF v_dono IS NULL OR v_dono <> p_id_cliente THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido não encontrado.';
    END IF;

    IF v_status = 'pago' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Este pedido já foi pago.';
    END IF;

    IF v_status = 'cancelado' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Este pedido foi cancelado e não pode ser pago.';
    END IF;

    IF v_data < NOW() - INTERVAL 30 MINUTE THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'O prazo de 30 minutos para pagamento terminou.';
    END IF;

    -- Simula o código da transação devolvido pela operadora
    SET v_codigo = UUID();

    INSERT INTO pagamentos (id_pedido, forma, valor, bandeira, final_cartao, codigo_transacao)
    VALUES (p_id_pedido, p_forma, v_total, p_bandeira, p_final_cartao, v_codigo);

    UPDATE pedidos SET status = 'pago' WHERE id = p_id_pedido;

    COMMIT;

    SELECT p_id_pedido AS id_pedido, v_codigo AS codigo_transacao;
END$$

-- -------------------------------------------------------
-- Cancela um pedido e devolve os produtos ao estoque
-- -------------------------------------------------------
CREATE PROCEDURE sp_cancelar_pedido(IN p_id_cliente INT, IN p_id_pedido INT)
BEGIN
    DECLARE v_dono INT;
    DECLARE v_status VARCHAR(30);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT id_cliente, status
    INTO v_dono, v_status
    FROM pedidos
    WHERE id = p_id_pedido
    FOR UPDATE;

    IF v_dono IS NULL OR v_dono <> p_id_cliente THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido não encontrado.';
    END IF;

    IF v_status <> 'aguardando_pagamento' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Somente pedidos aguardando pagamento podem ser cancelados.';
    END IF;

    -- Devolve os produtos ao estoque
    UPDATE produtos p
    JOIN itens_pedido i ON i.id_produto = p.id
    SET p.estoque = p.estoque + i.quantidade
    WHERE i.id_pedido = p_id_pedido;

    UPDATE pedidos SET status = 'cancelado' WHERE id = p_id_pedido;

    COMMIT;
END$$

-- -------------------------------------------------------
-- Direito de acesso e portabilidade (LGPD art. 18):
-- devolve em JSON todos os dados do cliente, com o CPF decifrado
-- -------------------------------------------------------
CREATE PROCEDURE sp_dados_titular(IN p_id_cliente INT, IN p_chave VARCHAR(255))
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM clientes WHERE id = p_id_cliente AND ativo = TRUE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Titular não encontrado.';
    END IF;

    -- Registra que os dados foram exportados (prestação de contas)
    INSERT INTO log_auditoria (usuario, operacao, tabela, id_registro, detalhe)
    VALUES (USER(), 'EXPORTACAO', 'clientes', p_id_cliente, JSON_OBJECT('motivo', 'direito de acesso e portabilidade'));

    SELECT JSON_OBJECT(
        'gerado_em', DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),

        'cadastro', (
            SELECT JSON_OBJECT(
                'id', c.id,
                'nome', c.nome,
                'email', c.email,
                'cpf', CAST(AES_DECRYPT(c.cpf_cifrado, p_chave) AS CHAR),
                'telefone', c.telefone,
                'data_nascimento', DATE_FORMAT(c.data_nascimento, '%Y-%m-%d'),
                'termos_versao', c.termos_versao,
                'termos_aceito_em', DATE_FORMAT(c.termos_aceito_em, '%Y-%m-%d %H:%i:%s'),
                'data_cadastro', DATE_FORMAT(c.data_cadastro, '%Y-%m-%d %H:%i:%s'),
                'ultimo_acesso', DATE_FORMAT(c.ultimo_acesso, '%Y-%m-%d %H:%i:%s')
            )
            FROM clientes c
            WHERE c.id = p_id_cliente
        ),

        'consentimentos', (
            SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
                'finalidade', co.finalidade,
                'concedido_em', DATE_FORMAT(co.concedido_em, '%Y-%m-%d %H:%i:%s'),
                'revogado_em', DATE_FORMAT(co.revogado_em, '%Y-%m-%d %H:%i:%s')
            )), JSON_ARRAY())
            FROM consentimentos co
            WHERE co.id_cliente = p_id_cliente
        ),

        'pedidos', (
            SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
                'id', pe.id,
                'data', DATE_FORMAT(pe.data_pedido, '%Y-%m-%d %H:%i:%s'),
                'status', pe.status,
                'valor_total', pe.valor_total,
                'itens', (
                    SELECT JSON_ARRAYAGG(JSON_OBJECT(
                        'produto', pr.nome,
                        'quantidade', i.quantidade,
                        'preco_unitario', i.preco_unitario
                    ))
                    FROM itens_pedido i
                    JOIN produtos pr ON pr.id = i.id_produto
                    WHERE i.id_pedido = pe.id
                ),
                'pagamento', (
                    SELECT JSON_OBJECT(
                        'forma', pg.forma,
                        'bandeira', pg.bandeira,
                        'final_cartao', pg.final_cartao,
                        'data', DATE_FORMAT(pg.data_pagamento, '%Y-%m-%d %H:%i:%s')
                    )
                    FROM pagamentos pg
                    WHERE pg.id_pedido = pe.id
                )
            )), JSON_ARRAY())
            FROM pedidos pe
            WHERE pe.id_cliente = p_id_cliente
        )
    ) AS dados;

    COMMIT;
END$$

-- -------------------------------------------------------
-- Direito de eliminação (LGPD art. 18): anonimiza o cliente,
-- apaga os consentimentos e MANTÉM pedidos e pagamentos (obrigação fiscal)
-- -------------------------------------------------------
CREATE PROCEDURE sp_eliminar_titular(IN p_id_cliente INT)
BEGIN
    DECLARE v_ativo BOOLEAN;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT ativo INTO v_ativo
    FROM clientes
    WHERE id = p_id_cliente
    FOR UPDATE;

    IF v_ativo IS NULL OR v_ativo = FALSE THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Titular não encontrado.';
    END IF;

    IF EXISTS (SELECT 1 FROM pedidos WHERE id_cliente = p_id_cliente AND status = 'aguardando_pagamento') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Existe pedido aguardando pagamento. Pague ou cancele o pedido antes de excluir a conta.';
    END IF;

    DELETE FROM consentimentos WHERE id_cliente = p_id_cliente;

    -- Anonimiza: troca os dados pessoais por valores que não identificam ninguém.
    -- A data de nascimento vira 1º de janeiro do mesmo ano (só serve para a faixa etária).
    UPDATE clientes SET
        nome = 'Titular anonimizado',
        email = CONCAT('anonimo_', id, '@anonimo.invalid'),
        senha_hash = '*',
        cpf_cifrado = NULL,
        telefone = NULL,
        data_nascimento = MAKEDATE(YEAR(data_nascimento), 1),
        tentativas_login = 0,
        bloqueado_ate = NULL,
        ativo = FALSE
    WHERE id = p_id_cliente;

    COMMIT;
END$$

DELIMITER ;


-- =======================================================
-- 6. EVENTS (rotinas automáticas)
-- =======================================================

DELIMITER $$

-- A cada 5 minutos: cancela pedidos não pagos há mais de 30 minutos
-- (a sp_cancelar_pedido já devolve o estoque)
CREATE EVENT ev_cancelar_pedidos_vencidos
ON SCHEDULE EVERY 5 MINUTE
DO
BEGIN
    DECLARE v_fim BOOLEAN DEFAULT FALSE;
    DECLARE v_id_pedido INT;
    DECLARE v_id_cliente INT;

    DECLARE cur_pedidos CURSOR FOR
        SELECT id, id_cliente
        FROM pedidos
        WHERE status = 'aguardando_pagamento'
          AND data_pedido < NOW() - INTERVAL 30 MINUTE;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fim = TRUE;
    -- Se um pedido der erro (ex.: foi pago agora), passa para o próximo
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;

    OPEN cur_pedidos;

    laco: LOOP
        FETCH cur_pedidos INTO v_id_pedido, v_id_cliente;

        IF v_fim THEN
            LEAVE laco;
        END IF;

        CALL sp_cancelar_pedido(v_id_cliente, v_id_pedido);
    END LOOP;

    CLOSE cur_pedidos;
END$$

-- Todo dia: apaga registros do log_acesso com mais de 6 meses (Marco Civil da Internet, art. 15)
CREATE EVENT ev_limpar_log_acesso
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DELETE FROM log_acesso WHERE data_acesso < NOW() - INTERVAL 6 MONTH;
END$$

-- Todo dia: anonimiza contas sem acesso há mais de 2 anos
CREATE EVENT ev_anonimizar_inativos
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DECLARE v_fim BOOLEAN DEFAULT FALSE;
    DECLARE v_id_cliente INT;

    DECLARE cur_clientes CURSOR FOR
        SELECT id
        FROM clientes
        WHERE ativo = TRUE
          AND COALESCE(ultimo_acesso, data_cadastro) < NOW() - INTERVAL 2 YEAR;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fim = TRUE;
    -- Cliente com pedido aguardando pagamento é pulado
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;

    OPEN cur_clientes;

    laco: LOOP
        FETCH cur_clientes INTO v_id_cliente;

        IF v_fim THEN
            LEAVE laco;
        END IF;

        CALL sp_eliminar_titular(v_id_cliente);
    END LOOP;

    CLOSE cur_clientes;
END$$

DELIMITER ;


-- =======================================================
-- 7. ROLES E USUÁRIO DA APLICAÇÃO
-- =======================================================

DROP ROLE IF EXISTS app_mercado, estoquista, analista;

CREATE ROLE app_mercado, estoquista, analista;

-- app_mercado: só o que o sistema precisa (views, cadastro e procedures)
GRANT SELECT ON mercado.vw_vitrine TO app_mercado;
GRANT SELECT ON mercado.vw_historico_compras TO app_mercado;
GRANT SELECT ON mercado.categorias TO app_mercado;

GRANT SELECT, INSERT ON mercado.clientes TO app_mercado;
-- Só pode alterar os campos que o sistema corrige (o resto fica com as procedures)
GRANT UPDATE (nome, email, telefone, tentativas_login, bloqueado_ate, ultimo_acesso) ON mercado.clientes TO app_mercado;

GRANT SELECT, INSERT ON mercado.consentimentos TO app_mercado;
GRANT UPDATE (revogado_em) ON mercado.consentimentos TO app_mercado;

GRANT INSERT ON mercado.log_acesso TO app_mercado;

GRANT EXECUTE ON PROCEDURE mercado.sp_finalizar_compra TO app_mercado;
GRANT EXECUTE ON PROCEDURE mercado.sp_pagar_pedido TO app_mercado;
GRANT EXECUTE ON PROCEDURE mercado.sp_cancelar_pedido TO app_mercado;
GRANT EXECUTE ON PROCEDURE mercado.sp_dados_titular TO app_mercado;
GRANT EXECUTE ON PROCEDURE mercado.sp_eliminar_titular TO app_mercado;

-- estoquista: só os produtos
GRANT SELECT, INSERT, UPDATE ON mercado.produtos TO estoquista;

-- analista: só a view anônima
GRANT SELECT ON mercado.vw_vendas_anonimas TO analista;

-- Usuário que o Node.js usa (nunca o root). A senha é a mesma do .env
DROP USER IF EXISTS 'mercado_app'@'localhost';

CREATE USER 'mercado_app'@'localhost' IDENTIFIED BY 'Mercado#App2026';

GRANT app_mercado TO 'mercado_app'@'localhost';

-- Ativa a role automaticamente quando o mercado_app se conectar
SET DEFAULT ROLE app_mercado TO 'mercado_app'@'localhost';


-- =======================================================
-- 8. TESTES (execute UMA LINHA POR VEZ e tire o print de cada erro)
-- =======================================================

-- A chave precisa ser a mesma do CPF_KEY do arquivo .env
SET @chave_cpf = 'chave#cpf#mercado#2026';

-- Cliente de teste (pode fazer login no sistema: teste@mercado.com / Teste1234)
INSERT INTO clientes (nome, email, senha_hash, cpf_cifrado, telefone, data_nascimento, termos_versao, termos_aceito_em)
VALUES ('Cliente Teste', 'teste@mercado.com',
        '$2b$10$mJJfRlZX0G2hTLxoxORRcusK7/GO8./1hv1fC9HBEjupToi2HxS6i',
        AES_ENCRYPT('52998224725', @chave_cpf), '11987654321', '1990-05-10', '1.0', NOW());

SET @id_teste = LAST_INSERT_ID();


-- TESTE 1: cadastro de menor de idade
-- Esperado: Error 1644 - Cadastro permitido somente para maiores de 18 anos.
INSERT INTO clientes (nome, email, senha_hash, data_nascimento, termos_versao, termos_aceito_em)
VALUES ('Menor de Idade', 'menor@mercado.com', '*', CURDATE() - INTERVAL 15 YEAR, '1.0', NOW());


-- TESTE 2: compra sem estoque (o produto 12 está com estoque 0)
-- Esperado: Error 1644 - Estoque insuficiente para o produto: Suco de uva integral 1L
CALL sp_finalizar_compra(@id_teste, '[{"id_produto":12,"quantidade":1}]');


-- TESTE 3: pagar o mesmo pedido duas vezes
-- 3a) cria um pedido (funciona)
CALL sp_finalizar_compra(@id_teste, '[{"id_produto":1,"quantidade":2},{"id_produto":6,"quantidade":3}]');
SET @id_pedido = (SELECT MAX(id) FROM pedidos WHERE id_cliente = @id_teste);
-- 3b) primeiro pagamento (funciona)
CALL sp_pagar_pedido(@id_teste, @id_pedido, 'credito', 'visa', '1111');
-- 3c) segundo pagamento
-- Esperado: Error 1644 - Este pedido já foi pago.
CALL sp_pagar_pedido(@id_teste, @id_pedido, 'credito', 'visa', '1111');


-- TESTE 4: apagar um pagamento
-- Esperado: Error 1644 - Pagamentos não podem ser apagados.
DELETE FROM pagamentos WHERE id_pedido = @id_pedido;


-- TESTE 5: o mercado_app tentando ler a tabela de pagamentos
-- Crie uma NOVA CONEXÃO no Workbench com o usuário mercado_app
-- (senha: Mercado#App2026) e execute:
--
--     SELECT * FROM mercado.pagamentos;
--
-- Esperado: Error 1142 - SELECT command denied to user 'mercado_app'@'localhost' for table 'pagamentos'
--
-- Pelo root dá para conferir as permissões da role:
SHOW GRANTS FOR 'mercado_app'@'localhost' USING app_mercado;


-- -------------------------------------------------------
-- TESTES EXTRAS
-- -------------------------------------------------------

-- CHECK do pagamento: PIX com bandeira
-- Esperado: Error 3819 - Check constraint 'ck_pagamentos_cartao' is violated.
INSERT INTO pagamentos (id_pedido, forma, valor, bandeira, final_cartao, codigo_transacao)
VALUES (@id_pedido, 'pix', 10.00, 'visa', '1234', 'teste-check');

-- E-mail com formato inválido
-- Esperado: Error 3819 - Check constraint 'ck_clientes_email' is violated.
INSERT INTO clientes (nome, email, senha_hash, data_nascimento, termos_versao, termos_aceito_em)
VALUES ('E-mail Errado', 'email-sem-arroba', '*', '1990-01-01', '1.0', NOW());

-- Apagar um cliente com pedidos
-- Esperado: Error 1451 - Cannot delete or update a parent row: a foreign key constraint fails
DELETE FROM clientes WHERE id = @id_teste;

-- Alterar o log de auditoria
-- Esperado: Error 1644 - O log de auditoria não pode ser alterado.
UPDATE log_auditoria SET usuario = 'hacker' WHERE id = 1;


-- -------------------------------------------------------
-- CONSULTAS PARA CONFERIR
-- -------------------------------------------------------
SELECT * FROM vw_vitrine;
SELECT * FROM vw_historico_compras WHERE id_cliente = @id_teste;
SELECT * FROM vw_vendas_anonimas;
SELECT * FROM log_auditoria;
CALL sp_dados_titular(@id_teste, @chave_cpf);
SHOW EVENTS FROM mercado;
