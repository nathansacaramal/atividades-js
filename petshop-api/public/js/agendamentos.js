// Referências aos elementos da página
const formAgendamento = document.getElementById("formAgendamento");
const selectAnimal = document.getElementById("animal_id");
const selectServico = document.getElementById("servico_id");
const tabela = document.getElementById("tabelaAgendamentos");
const mensagem = document.getElementById("mensagem");


// ======================================
// MOSTRAR MENSAGEM NA TELA
// ======================================

function mostrarMensagem(texto, tipo) {

    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo; // "sucesso" ou "erro"

}


// ======================================
// PREENCHER OS <select> (GET /animais e GET /servicos)
// ======================================

async function carregarAnimais() {

    const resposta = await fetch("/animais");
    const animais = await resposta.json();

    animais.forEach(animal => {

        selectAnimal.innerHTML += `<option value="${animal.id}">${animal.nome} (tutor: ${animal.tutor})</option>`;

    });

}

async function carregarServicos() {

    const resposta = await fetch("/servicos");
    const servicos = await resposta.json();

    servicos.forEach(servico => {

        selectServico.innerHTML += `<option value="${servico.id}">${servico.nome} - R$ ${servico.preco}</option>`;

    });

}


// ======================================
// BUSCAR AGENDAMENTOS (GET /agendamentos)
// ======================================

async function carregarAgendamentos() {

    const resposta = await fetch("/agendamentos");
    const agendamentos = await resposta.json();

    // Limpa a tabela
    tabela.innerHTML = "";

    if (agendamentos.length === 0) {

        tabela.innerHTML = `<tr><td colspan="7">Nenhum agendamento cadastrado.</td></tr>`;
        return;

    }

    agendamentos.forEach(agendamento => {

        tabela.innerHTML += `
            <tr>
                <td>${agendamento.data_hora}</td>
                <td>${agendamento.animal}</td>
                <td>${agendamento.tutor}</td>
                <td>${agendamento.servico}</td>
                <td>${agendamento.status}</td>
                <td>${agendamento.leva_e_traz ? "Sim" : "Não"}</td>
                <td>
                    <button class="btn-excluir" onclick="cancelarAgendamento(${agendamento.id})">
                        Cancelar
                    </button>
                </td>
            </tr>
        `;

    });

}


// ======================================
// CADASTRAR AGENDAMENTO (POST /agendamentos)
// ======================================

formAgendamento.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const dados = {
        animal_id: selectAnimal.value,
        servico_id: selectServico.value,
        data_hora: formAgendamento.data_hora.value,
        leva_e_traz: formAgendamento.leva_e_traz.checked
    };

    const resposta = await fetch("/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (resposta.ok) {

        mostrarMensagem(resultado.mensagem, "sucesso");
        formAgendamento.reset();
        carregarAgendamentos();

    } else {

        mostrarMensagem(resultado.erro, "erro");

    }

});


// ======================================
// CANCELAR AGENDAMENTO (DELETE /agendamentos/:id)
// ======================================

async function cancelarAgendamento(id) {

    const confirmou = confirm("Deseja realmente cancelar este agendamento?");

    if (!confirmou) {
        return;
    }

    const resposta = await fetch(`/agendamentos/${id}`, {
        method: "DELETE"
    });

    const resultado = await resposta.json();

    if (resposta.ok) {

        mostrarMensagem(resultado.mensagem, "sucesso");
        carregarAgendamentos();

    } else {

        mostrarMensagem(resultado.erro, "erro");

    }

}


// Carrega os dados ao abrir a página
carregarAnimais();
carregarServicos();
carregarAgendamentos();
