// Referências aos elementos da página
const formAnimal = document.getElementById("formAnimal");
const selectTutor = document.getElementById("cliente_id");
const semTutor = document.getElementById("semTutor");
const tabela = document.getElementById("tabelaAnimais");
const mensagem = document.getElementById("mensagem");


// ======================================
// MOSTRAR MENSAGEM NA TELA
// ======================================

function mostrarMensagem(texto, tipo) {

    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo; // "sucesso" ou "erro"

}


// ======================================
// PREENCHER O <select> DE TUTORES (GET /clientes)
// ======================================

async function carregarTutores() {

    const resposta = await fetch("/clientes");
    const clientes = await resposta.json();

    // Se não houver tutor, mostra o aviso e esconde o formulário
    if (clientes.length === 0) {

        semTutor.style.display = "block";
        formAnimal.style.display = "none";
        return;

    }

    clientes.forEach(cliente => {

        // O valor de cada opção é o id do cliente
        selectTutor.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;

    });

}


// ======================================
// BUSCAR ANIMAIS (GET /animais)
// ======================================

async function carregarAnimais() {

    const resposta = await fetch("/animais");
    const animais = await resposta.json();

    // Limpa a tabela
    tabela.innerHTML = "";

    if (animais.length === 0) {

        tabela.innerHTML = `<tr><td colspan="7">Nenhum animal cadastrado.</td></tr>`;
        return;

    }

    animais.forEach(animal => {

        tabela.innerHTML += `
            <tr>
                <td>${animal.id}</td>
                <td>${animal.nome}</td>
                <td>${animal.especie || "-"}</td>
                <td>${animal.raca || "-"}</td>
                <td>${animal.data_nascimento || "-"}</td>
                <td>${animal.tutor}</td>
                <td>
                    <button class="btn-excluir" onclick="excluirAnimal(${animal.id})">
                        Excluir
                    </button>
                </td>
            </tr>
        `;

    });

}


// ======================================
// CADASTRAR ANIMAL (POST /animais)
// ======================================

formAnimal.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    // Monta o objeto com os dados digitados, incluindo o tutor escolhido
    const dados = {
        cliente_id: selectTutor.value,
        nome: formAnimal.nome.value.trim(),
        especie: formAnimal.especie.value.trim(),
        raca: formAnimal.raca.value.trim(),
        data_nascimento: formAnimal.data_nascimento.value
    };

    const resposta = await fetch("/animais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (resposta.ok) {

        mostrarMensagem(resultado.mensagem, "sucesso");
        formAnimal.reset();
        carregarAnimais();

    } else {

        mostrarMensagem(resultado.erro, "erro");

    }

});


// ======================================
// EXCLUIR ANIMAL (DELETE /animais/:id)
// ======================================

async function excluirAnimal(id) {

    // Pede confirmação antes de excluir
    const confirmou = confirm("Deseja realmente excluir este animal?");

    if (!confirmou) {
        return;
    }

    const resposta = await fetch(`/animais/${id}`, {
        method: "DELETE"
    });

    const resultado = await resposta.json();

    if (resposta.ok) {

        mostrarMensagem(resultado.mensagem, "sucesso");
        carregarAnimais();

    } else {

        mostrarMensagem(resultado.erro, "erro");

    }

}


// Carrega os dados ao abrir a página
carregarTutores();
carregarAnimais();
