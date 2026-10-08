// Importa o framework Express
const express = require("express");

// Importa a conexão com o banco de dados MySQL
const conexao = require("./db");

// Cria a aplicação Express
const app = express();

const PORTA = 3000;


// =======================================================
// CONFIGURAÇÕES DO SERVIDOR
// =======================================================

// Permite que a aplicação receba dados no formato JSON (enviados via fetch)
app.use(express.json());

// Informa ao Express que todos os arquivos da pasta "public"
// poderão ser acessados pelo navegador.
app.use(express.static("public"));


// =======================================================
// ROTAS DE CLIENTES (TUTORES)
// =======================================================

// Lista todos os clientes
app.get("/clientes", (req, res) => {

    conexao.query("SELECT * FROM cliente ORDER BY nome", (erro, resultado) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao buscar clientes." });

        }

        res.json(resultado);

    });

});

// Cadastra um novo cliente
app.post("/clientes", (req, res) => {

    const { nome, cpf, telefone, endereco } = req.body;

    // Nome e CPF são obrigatórios
    if (!nome || !cpf) {

        return res.status(400).json({ erro: "O nome e o CPF do tutor são obrigatórios." });

    }

    const sql = "INSERT INTO cliente(nome, cpf, telefone, endereco) VALUES(?,?,?,?)";

    conexao.query(sql, [nome, cpf, telefone, endereco], (erro) => {

        if (erro) {

            // CPF repetido (a coluna cpf é UNIQUE)
            if (erro.code === "ER_DUP_ENTRY") {

                return res.status(400).json({ erro: "Já existe um tutor com esse CPF." });

            }

            return res.status(500).json({ erro: "Erro ao cadastrar tutor." });

        }

        res.status(201).json({ mensagem: "Tutor cadastrado com sucesso!" });

    });

});

// Exclui um cliente pelo ID
app.delete("/clientes/:id", (req, res) => {

    const id = Number(req.params.id);

    // Antes de excluir, verifica se o tutor possui animais
    conexao.query("SELECT id FROM animal WHERE cliente_id = ?", [id], (erro, animais) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao verificar os animais do tutor." });

        }

        if (animais.length > 0) {

            return res.status(400).json({ erro: "Este tutor possui animais cadastrados e não pode ser excluído." });

        }

        conexao.query("DELETE FROM cliente WHERE id = ?", [id], (erro, resultado) => {

            if (erro) {

                return res.status(500).json({ erro: "Erro ao excluir tutor." });

            }

            if (resultado.affectedRows === 0) {

                return res.status(404).json({ erro: "Tutor não encontrado." });

            }

            res.json({ mensagem: "Tutor excluído com sucesso!" });

        });

    });

});


// =======================================================
// ROTAS DE ANIMAIS
// =======================================================

// Lista os animais já trazendo o nome do tutor
app.get("/animais", (req, res) => {

    const sql = `
        SELECT
            animal.id,
            animal.nome,
            animal.especie,
            animal.raca,
            animal.data_nascimento,
            animal.cliente_id,
            cliente.nome AS tutor
        FROM animal
        JOIN cliente ON animal.cliente_id = cliente.id
        ORDER BY animal.nome
    `;

    conexao.query(sql, (erro, resultado) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao buscar animais." });

        }

        res.json(resultado);

    });

});

// Cadastra um animal vinculado a um cliente
app.post("/animais", (req, res) => {

    const { nome, especie, raca, data_nascimento, cliente_id } = req.body;

    // Nome e tutor são obrigatórios
    if (!nome || !cliente_id) {

        return res.status(400).json({ erro: "O nome do animal e o tutor são obrigatórios." });

    }

    const sql = "INSERT INTO animal(nome, especie, raca, data_nascimento, cliente_id) VALUES(?,?,?,?,?)";

    // Se a data não for preenchida, grava NULL no banco
    conexao.query(sql, [nome, especie, raca, data_nascimento || null, cliente_id], (erro) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao cadastrar animal." });

        }

        res.status(201).json({ mensagem: "Animal cadastrado com sucesso!" });

    });

});

// Exclui um animal pelo ID
app.delete("/animais/:id", (req, res) => {

    const id = Number(req.params.id);

    // Antes de excluir, verifica se o animal possui avaliações
    conexao.query("SELECT id FROM avaliacao WHERE animal_id = ?", [id], (erro, avaliacoes) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao verificar as avaliações do animal." });

        }

        if (avaliacoes.length > 0) {

            return res.status(400).json({ erro: "Este animal possui avaliações e não pode ser excluído." });

        }

        // Também verifica se o animal possui agendamentos
        conexao.query("SELECT id FROM agendamento WHERE animal_id = ?", [id], (erro, agendamentos) => {

            if (erro) {

                return res.status(500).json({ erro: "Erro ao verificar os agendamentos do animal." });

            }

            if (agendamentos.length > 0) {

                return res.status(400).json({ erro: "Este animal possui agendamentos e não pode ser excluído." });

            }

            conexao.query("DELETE FROM animal WHERE id = ?", [id], (erro, resultado) => {

                if (erro) {

                    return res.status(500).json({ erro: "Erro ao excluir animal." });

                }

                if (resultado.affectedRows === 0) {

                    return res.status(404).json({ erro: "Animal não encontrado." });

                }

                res.json({ mensagem: "Animal excluído com sucesso!" });

            });

        });

    });

});


// =======================================================
// ROTAS DE VETERINÁRIOS
// =======================================================

// Lista os veterinários
app.get("/veterinarios", (req, res) => {

    conexao.query("SELECT * FROM veterinario ORDER BY nome", (erro, resultado) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao buscar veterinários." });

        }

        res.json(resultado);

    });

});


// =======================================================
// ROTAS DE AVALIAÇÕES
// =======================================================

// Lista o histórico de avaliações de um animal
app.get("/animais/:id/avaliacoes", (req, res) => {

    const id = Number(req.params.id);

    const sql = `
        SELECT
            avaliacao.id,
            avaliacao.data_avaliacao,
            avaliacao.peso,
            avaliacao.temperatura,
            avaliacao.diagnostico,
            avaliacao.recomendacoes,
            veterinario.nome AS veterinario
        FROM avaliacao
        JOIN veterinario ON avaliacao.veterinario_id = veterinario.id
        WHERE avaliacao.animal_id = ?
        ORDER BY avaliacao.data_avaliacao DESC
    `;

    conexao.query(sql, [id], (erro, resultado) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao buscar avaliações." });

        }

        res.json(resultado);

    });

});

// Registra a avaliação do veterinário
app.post("/avaliacoes", (req, res) => {

    const { data_avaliacao, peso, temperatura, diagnostico, recomendacoes, animal_id, veterinario_id } = req.body;

    // Data, diagnóstico, animal e veterinário são obrigatórios
    if (!data_avaliacao || !diagnostico || !animal_id || !veterinario_id) {

        return res.status(400).json({ erro: "Data, diagnóstico, animal e veterinário são obrigatórios." });

    }

    const sql = `
        INSERT INTO avaliacao(data_avaliacao, peso, temperatura, diagnostico, recomendacoes, animal_id, veterinario_id)
        VALUES(?,?,?,?,?,?,?)
    `;

    const valores = [data_avaliacao, peso || null, temperatura || null, diagnostico, recomendacoes, animal_id, veterinario_id];

    conexao.query(sql, valores, (erro) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao registrar avaliação." });

        }

        res.status(201).json({ mensagem: "Avaliação registrada com sucesso!" });

    });

});

// Exclui uma avaliação pelo ID
app.delete("/avaliacoes/:id", (req, res) => {

    const id = Number(req.params.id);

    conexao.query("DELETE FROM avaliacao WHERE id = ?", [id], (erro, resultado) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao excluir avaliação." });

        }

        if (resultado.affectedRows === 0) {

            return res.status(404).json({ erro: "Avaliação não encontrada." });

        }

        res.json({ mensagem: "Avaliação excluída com sucesso!" });

    });

});


// =======================================================
// DESAFIO - ROTAS DE SERVIÇOS E AGENDAMENTOS
// =======================================================

// Lista os serviços (usado no <select> da tela de agendamentos)
app.get("/servicos", (req, res) => {

    conexao.query("SELECT * FROM servico ORDER BY nome", (erro, resultado) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao buscar serviços." });

        }

        res.json(resultado);

    });

});

// Lista os agendamentos com o nome do animal, do tutor e do serviço
app.get("/agendamentos", (req, res) => {

    const sql = `
        SELECT
            agendamento.id,
            agendamento.data_hora,
            agendamento.status,
            agendamento.leva_e_traz,
            animal.nome AS animal,
            cliente.nome AS tutor,
            servico.nome AS servico
        FROM agendamento
        JOIN animal ON agendamento.animal_id = animal.id
        JOIN cliente ON animal.cliente_id = cliente.id
        JOIN servico ON agendamento.servico_id = servico.id
        ORDER BY agendamento.data_hora
    `;

    conexao.query(sql, (erro, resultado) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao buscar agendamentos." });

        }

        res.json(resultado);

    });

});

// Cadastra um agendamento
app.post("/agendamentos", (req, res) => {

    const { animal_id, servico_id, leva_e_traz } = req.body;

    // O <input type="datetime-local"> envia "2026-10-10T09:00".
    // Trocamos o "T" por espaço para ficar no formato do MySQL.
    const data_hora = req.body.data_hora ? req.body.data_hora.replace("T", " ") : "";

    if (!animal_id || !servico_id || !data_hora) {

        return res.status(400).json({ erro: "Animal, serviço e data/hora são obrigatórios." });

    }

    // Verificar disponibilidade de horário:
    // não pode existir outro agendamento no mesmo horário
    conexao.query("SELECT id FROM agendamento WHERE data_hora = ?", [data_hora], (erro, existentes) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao verificar disponibilidade do horário." });

        }

        if (existentes.length > 0) {

            return res.status(400).json({ erro: "Já existe um agendamento nesse horário. Escolha outro." });

        }

        const sql = "INSERT INTO agendamento(data_hora, animal_id, servico_id, leva_e_traz) VALUES(?,?,?,?)";

        conexao.query(sql, [data_hora, animal_id, servico_id, leva_e_traz ? 1 : 0], (erro) => {

            if (erro) {

                return res.status(500).json({ erro: "Erro ao cadastrar agendamento." });

            }

            res.status(201).json({ mensagem: "Agendamento cadastrado com sucesso!" });

        });

    });

});

// Cancela (exclui) um agendamento
app.delete("/agendamentos/:id", (req, res) => {

    const id = Number(req.params.id);

    // Um agendamento que já foi pago não pode ser cancelado
    conexao.query("SELECT id FROM pagamento WHERE agendamento_id = ?", [id], (erro, pagamentos) => {

        if (erro) {

            return res.status(500).json({ erro: "Erro ao verificar o pagamento do agendamento." });

        }

        if (pagamentos.length > 0) {

            return res.status(400).json({ erro: "Este agendamento já foi pago e não pode ser cancelado." });

        }

        conexao.query("DELETE FROM agendamento WHERE id = ?", [id], (erro, resultado) => {

            if (erro) {

                return res.status(500).json({ erro: "Erro ao cancelar agendamento." });

            }

            if (resultado.affectedRows === 0) {

                return res.status(404).json({ erro: "Agendamento não encontrado." });

            }

            res.json({ mensagem: "Agendamento cancelado com sucesso!" });

        });

    });

});


// =======================================================
// INICIALIZAÇÃO DO SERVIDOR
// =======================================================

app.listen(PORTA, () => {

    console.log(`Servidor rodando em http://localhost:${PORTA}`);

});
