// Referências aos elementos da página
const formAvaliacao = document.getElementById("formAvaliacao");
const selectAnimal = document.getElementById("animal_id");
const selectVeterinario = document.getElementById("veterinario_id");
const infoHistorico = document.getElementById("infoHistorico");
const tabela = document.getElementById("tabelaAvaliacoes");
const mensagem = document.getElementById("mensagem");


// ======================================
// MOSTRAR MENSAGEM NA TELA
// ======================================

function mostrarMensagem(texto, tipo) {

    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo; // "sucesso" ou "erro"

}


// ======================================
// PREENCHER O <select> DE ANIMAIS (GET /animais)
// ======================================

async function carregarAnimais() {

    const resposta = await fetch("/animais");
    const animais = await resposta.json();

    animais.forEach(animal => {

        // Ex.: Thor (tutor: Ana Souza)
        selectAnimal.innerHTML += `<option value="${animal.id}">${animal.nome} (tutor: ${animal.tutor})</option>`;

    });

}


// ======================================
// PREENCHER O <select> DE VETERINÁRIOS (GET /veterinarios)
// ======================================

async function carregarVeterinarios() {

    const resposta = await fetch("/veterinarios");
    const veterinarios = await resposta.json();

    veterinarios.forEach(vet => {

        selectVeterinario.innerHTML += `<option value="${vet.id}">${vet.nome} - ${vet.crm}</option>`;

    });

}


// ======================================
// HISTÓRICO DO ANIMAL (GET /animais/:id/avaliacoes)
// ======================================

async function carregarHistorico() {

    const animalId = selectAnimal.value;

    // Limpa a tabela
    tabela.innerHTML = "";

    if (!animalId) {

        infoHistorico.textContent = "Escolha um animal para ver o histórico.";
        return;

    }

    const resposta = await fetch(`/animais/${animalId}/avaliacoes`);
    const avaliacoes = await resposta.json();

    // Mostra o nome do animal escolhido acima da tabela
    const nomeAnimal = selectAnimal.options[selectAnimal.selectedIndex].text;
    infoHistorico.textContent = `Animal: ${nomeAnimal}`;

    if (avaliacoes.length === 0) {

        tabela.innerHTML = `<tr><td colspan="7">Nenhuma avaliação registrada para este animal.</td></tr>`;
        return;

    }

    avaliacoes.forEach(avaliacao => {

        tabela.innerHTML += `
            <tr>
                <td>${avaliacao.data_avaliacao}</td>
                <td>${avaliacao.veterinario}</td>
                <td>${avaliacao.peso || "-"}</td>
                <td>${avaliacao.temperatura || "-"}</td>
                <td>${avaliacao.diagnostico}</td>
                <td>${avaliacao.recomendacoes || "-"}</td>
                <td>
                    <button class="btn-excluir" onclick="excluirAvaliacao(${avaliacao.id})">
                        Excluir
                    </button>
                </td>
            </tr>
        `;

    });

}

// Ao escolher um animal, mostra o histórico dele
selectAnimal.addEventListener("change", carregarHistorico);


// ======================================
// REGISTRAR AVALIAÇÃO (POST /avaliacoes)
// ======================================

formAvaliacao.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    // Monta o objeto com os dados digitados
    const dados = {
        animal_id: selectAnimal.value,
        veterinario_id: selectVeterinario.value,
        data_avaliacao: formAvaliacao.data_avaliacao.value,
        peso: formAvaliacao.peso.value,
        temperatura: formAvaliacao.temperatura.value,
        diagnostico: formAvaliacao.diagnostico.value.trim(),
        recomendacoes: formAvaliacao.recomendacoes.value.trim()
    };

    const resposta = await fetch("/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (resposta.ok) {

        mostrarMensagem(resultado.mensagem, "sucesso");

        // Limpa só os campos da avaliação, mantendo o animal e o veterinário escolhidos
        formAvaliacao.data_avaliacao.value = "";
        formAvaliacao.peso.value = "";
        formAvaliacao.temperatura.value = "";
        formAvaliacao.diagnostico.value = "";
        formAvaliacao.recomendacoes.value = "";

        carregarHistorico();

    } else {

        mostrarMensagem(resultado.erro, "erro");

    }

});


// ======================================
// EXCLUIR AVALIAÇÃO (DELETE /avaliacoes/:id)
// ======================================

async function excluirAvaliacao(id) {

    // Pede confirmação antes de excluir
    const confirmou = confirm("Deseja realmente excluir esta avaliação?");

    if (!confirmou) {
        return;
    }

    const resposta = await fetch(`/avaliacoes/${id}`, {
        method: "DELETE"
    });

    const resultado = await resposta.json();

    if (resposta.ok) {

        mostrarMensagem(resultado.mensagem, "sucesso");
        carregarHistorico();

    } else {

        mostrarMensagem(resultado.erro, "erro");

    }

}


// Carrega os <select> ao abrir a página
carregarAnimais();
carregarVeterinarios();
