-- =======================================================
-- PARTE 1 - DO DIAGRAMA DE CLASSES PARA O MYSQL
-- Pet Shop "Amigo Fiel"
-- =======================================================

-- Cria o banco de dados do Pet Shop
CREATE DATABASE IF NOT EXISTS petshop;

USE petshop;


-- =======================================================
-- TABELAS SEM CHAVE ESTRANGEIRA (criadas primeiro)
-- =======================================================

-- Classe Cliente (tutor do animal)
CREATE TABLE cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    endereco VARCHAR(150)
);

-- Classe Servico (banho, tosa, consulta...)
CREATE TABLE servico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(200),
    preco DECIMAL(10,2) NOT NULL,
    duracao INT -- duração em minutos
);


-- =======================================================
-- TABELAS COM CHAVE ESTRANGEIRA
-- =======================================================

-- Classe Animal
-- Um cliente tem 1..* animais -> a tabela animal recebe cliente_id
CREATE TABLE animal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50),
    raca VARCHAR(50),
    data_nascimento DATE,
    cliente_id INT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

-- Classe Agendamento
-- Um animal tem 0..* agendamentos e um serviço tem 0..* agendamentos
CREATE TABLE agendamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_hora DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Agendado',
    animal_id INT NOT NULL,
    servico_id INT NOT NULL,
    FOREIGN KEY (animal_id) REFERENCES animal(id),
    FOREIGN KEY (servico_id) REFERENCES servico(id)
);

-- Classe Pagamento
-- Um agendamento tem 0..1 pagamento -> a tabela pagamento recebe agendamento_id
CREATE TABLE pagamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(30) NOT NULL,
    data_pagamento DATE NOT NULL,
    agendamento_id INT NOT NULL,
    FOREIGN KEY (agendamento_id) REFERENCES agendamento(id)
);


-- =======================================================
-- INSERINDO REGISTROS (mesma ordem das tabelas)
-- =======================================================

INSERT INTO cliente (nome, cpf, telefone, endereco) VALUES
('Ana Souza',    '111.111.111-11', '(11) 99999-1111', 'Rua das Flores, 100'),
('Bruno Lima',   '222.222.222-22', '(11) 99999-2222', 'Av. Brasil, 250'),
('Carla Mendes', '333.333.333-33', '(11) 99999-3333', 'Rua do Sol, 45');

INSERT INTO servico (nome, descricao, preco, duracao) VALUES
('Banho',           'Banho completo com secagem',   50.00, 60),
('Tosa',            'Tosa higiênica ou na tesoura', 70.00, 90),
('Consulta',        'Consulta veterinária',        120.00, 30);

-- A cliente Ana Souza (id 1) tem 2 animais
INSERT INTO animal (nome, especie, raca, data_nascimento, cliente_id) VALUES
('Thor',  'Cachorro', 'Labrador',  '2020-03-15', 1),
('Mia',   'Gato',     'Siamês',    '2021-07-20', 1),
('Bob',   'Cachorro', 'Poodle',    '2019-11-02', 2),
('Luna',  'Gato',     'Persa',     '2022-01-10', 3);

INSERT INTO agendamento (data_hora, status, animal_id, servico_id) VALUES
('2026-10-10 09:00:00', 'Agendado',  1, 1),
('2026-10-10 10:30:00', 'Agendado',  3, 2),
('2026-10-10 14:00:00', 'Agendado',  2, 3),
('2026-10-11 09:00:00', 'Concluído', 4, 1),
('2026-10-12 15:00:00', 'Agendado',  1, 3);

INSERT INTO pagamento (valor, forma_pagamento, data_pagamento, agendamento_id) VALUES
(50.00,  'Pix',              '2026-10-10', 1),
(70.00,  'Cartão de crédito', '2026-10-10', 2),
(50.00,  'Dinheiro',         '2026-10-11', 4);


-- =======================================================
-- CONFERINDO OS DADOS
-- =======================================================

-- Todos os registros de cada tabela
SELECT * FROM cliente;
SELECT * FROM animal;
SELECT * FROM servico;
SELECT * FROM agendamento;
SELECT * FROM pagamento;

-- Animais de um cliente específico (Ana Souza)
SELECT * FROM animal WHERE cliente_id = 1;

-- Agendamentos de uma data específica
SELECT * FROM agendamento WHERE DATE(data_hora) = '2026-10-10';


-- =======================================================
-- PARTE 2 - PASSO 1: TABELAS DA AVALIAÇÃO VETERINÁRIA
-- =======================================================

CREATE TABLE veterinario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    crm VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE avaliacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_avaliacao DATE NOT NULL,
    peso DECIMAL(5,2),         -- em kg
    temperatura DECIMAL(4,1),  -- em °C
    diagnostico VARCHAR(255) NOT NULL,
    recomendacoes VARCHAR(255),
    animal_id INT NOT NULL,
    veterinario_id INT NOT NULL,
    FOREIGN KEY (animal_id) REFERENCES animal(id),
    FOREIGN KEY (veterinario_id) REFERENCES veterinario(id)
);

INSERT INTO veterinario (nome, crm) VALUES
('Dr. Ricardo Alves', 'CRMV-SP 12345'),
('Dra. Juliana Rocha', 'CRMV-SP 67890');

SELECT * FROM veterinario;


-- =======================================================
-- DESAFIO 3: LEVA E TRAZ
-- =======================================================

-- Acrescenta a coluna leva_e_traz na tabela agendamento
-- (0 = Não, 1 = Sim)
ALTER TABLE agendamento ADD leva_e_traz BOOLEAN NOT NULL DEFAULT 0;

SELECT * FROM agendamento;
