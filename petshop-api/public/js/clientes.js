// Referências aos elementos da página
const formCliente = document.getElementById("formCliente");
const tabela = document.getElementById("tabelaClientes");
const mensagem = document.getElementById("mensagem");


// ======================================
// MOSTRAR MENSAGEM NA TELA
// ======================================

function mostrarMensagem(texto, tipo) {

    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo; // "sucesso" ou "erro"

}


// ======================================
// BUSCAR CLIENTES (GET /clientes)
// ======================================

async function carregarClientes() {

    const resposta = await fetch("/clientes");
    const clientes = await resposta.json();

    // Limpa a tabela
    tabela.innerHTML = "";

    if (clientes.length === 0) {

        tabela.innerHTML = `<tr><td colspan="6">Nenhum tutor cadastrado.</td></tr>`;
        return;

    }

    clientes.forEach(cliente => {

        tabela.innerHTML += `
            <tr>
                <td>${cliente.id}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.cpf}</td>
                <td>${cliente.telefone || "-"}</td>
                <td>${cliente.endereco || "-"}</td>
                <td>
                    <button class="btn-excluir" onclick="excluirCliente(${cliente.id})">
                        Excluir
                    </button>
                </td>
            </tr>
        `;

    });

}


// ======================================
// CADASTRAR CLIENTE (POST /clientes)
// ======================================

formCliente.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    // Monta o objeto com os dados digitados
    const dados = {
        nome: formCliente.nome.value.trim(),
        cpf: formCliente.cpf.value.trim(),
        telefone: formCliente.telefone.value.trim(),
        endereco: formCliente.endereco.value.trim()
    };

    const resposta = await fetch("/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    // resposta.ok é true quando o status é 200-299
    if (resposta.ok) {

        mostrarMensagem(resultado.mensagem, "sucesso");
        formCliente.reset();
        carregarClientes();

    } else {

        mostrarMensagem(resultado.erro, "erro");

    }

});


// ======================================
// EXCLUIR CLIENTE (DELETE /clientes/:id)
// ======================================

async function excluirCliente(id) {

    // Pede confirmação antes de excluir
    const confirmou = confirm("Deseja realmente excluir este tutor?");

    if (!confirmou) {
        return;
    }

    const resposta = await fetch(`/clientes/${id}`, {
        method: "DELETE"
    });

    const resultado = await resposta.json();

    if (resposta.ok) {

        mostrarMensagem(resultado.mensagem, "sucesso");
        carregarClientes();

    } else {

        mostrarMensagem(resultado.erro, "erro");

    }

}


// Carrega os clientes ao abrir a página
carregarClientes();
