// Referência ao formulário
const formLogin = document.getElementById("formLogin");


// ======================================
// LOGIN (POST /login)
// ======================================

formLogin.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const dados = {
        email: formLogin.email.value.trim(),
        senha: formLogin.senha.value
    };

    try {

        const resposta = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {

            // Depois do login, vai para a página Comprar
            window.location.href = resultado.destino;

        } else {

            mostrarMensagem(resultado.erro, "erro");
            formLogin.senha.value = "";

        }

    } catch (erro) {

        mostrarMensagem("Não foi possível falar com o servidor.", "erro");

    }

});
