// Referência ao formulário
const formCadastro = document.getElementById("formCadastro");


// ======================================
// CADASTRAR CLIENTE (POST /cadastro)
// ======================================

formCadastro.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    // Monta o objeto com os dados digitados.
    // As caixas de seleção vão como true/false.
    const dados = {
        nome: formCadastro.nome.value.trim(),
        email: formCadastro.email.value.trim(),
        senha: formCadastro.senha.value,
        data_nascimento: formCadastro.data_nascimento.value,
        telefone: formCadastro.telefone.value.trim(),
        cpf: formCadastro.cpf.value.trim(),
        aceite_termos: formCadastro.aceite_termos.checked,
        ofertas_email: formCadastro.ofertas_email.checked,
        ofertas_whatsapp: formCadastro.ofertas_whatsapp.checked
    };

    try {

        const resposta = await fetch("/cadastro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {

            mostrarMensagem(resultado.mensagem, "sucesso");
            formCadastro.reset();

            // Leva para o login depois de 2 segundos
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);

        } else {

            mostrarMensagem(resultado.erro, "erro");

        }

    } catch (erro) {

        mostrarMensagem("Não foi possível falar com o servidor.", "erro");

    }

});
