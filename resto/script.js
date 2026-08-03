document.getElementById("formulario").addEventListener("submit", function(event){

    let nome = document.getElementById("nome").value;
    let idade = document.getElementById("idade").value;
    let cidade = document.getElementById("cidade").value;

    console.log("Nome:", nome);
    console.log("Idade:", idade);
    console.log("Cidade:", cidade);

});

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let primeiroNumero = randomNumber(1, 50);

let segundoNumero = randomNumber(1, primeiroNumero);
