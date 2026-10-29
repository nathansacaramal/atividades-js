// =======================================================
// MIDDLEWARES DE VALIDAÇÃO (o servidor nunca confia no navegador)
// =======================================================

// Mesmo formato do CHECK ck_clientes_email do banco
const REGEX_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


// Deixa só os números (ex.: "529.982.247-25" -> "52998224725")
function somenteNumeros(texto) {

    return String(texto || "").replace(/\D/g, "");

}

function emailValido(email) {

    return email.length <= 150 && REGEX_EMAIL.test(email);

}

// 8 ou mais caracteres, com letras e números (o bcrypt só usa até 72)
function senhaValida(senha) {

    return senha.length >= 8 && senha.length <= 72 && /[A-Za-z]/.test(senha) && /[0-9]/.test(senha);

}

// Calcula a idade a partir de "AAAA-MM-DD"
function calcularIdade(dataTexto) {

    const nascimento = new Date(dataTexto + "T00:00:00");
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    // Ainda não fez aniversário este ano
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    return idade;

}

// Confere os dois dígitos verificadores do CPF
function cpfValido(cpf) {

    // 11 números e não pode ser tudo igual (111.111.111-11)
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // t = 9 confere o 1º dígito, t = 10 confere o 2º
    for (let t = 9; t < 11; t++) {

        let soma = 0;

        for (let i = 0; i < t; i++) {
            soma += Number(cpf[i]) * (t + 1 - i);
        }

        const digito = ((soma * 10) % 11) % 10;

        if (digito !== Number(cpf[t])) {
            return false;
        }

    }

    return true;

}

// Celular com DDD: 10 ou 11 números
function telefoneValido(telefone) {

    return /^\d{10,11}$/.test(telefone);

}


// =======================================================
// VALIDAÇÃO DO CADASTRO
// =======================================================

function validarCadastro(req, res, next) {

    const nome = String(req.body.nome || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");
    const dataNascimento = String(req.body.data_nascimento || "");
    const telefone = somenteNumeros(req.body.telefone);
    const cpf = somenteNumeros(req.body.cpf);

    if (nome.length < 2 || nome.length > 100) {
        return res.status(400).json({ erro: "Informe o seu nome." });
    }

    if (!emailValido(email)) {
        return res.status(400).json({ erro: "Informe um e-mail válido." });
    }

    if (!senhaValida(senha)) {
        return res.status(400).json({ erro: "A senha deve ter 8 ou mais caracteres, com letras e números." });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento) || isNaN(new Date(dataNascimento))) {
        return res.status(400).json({ erro: "Informe a data de nascimento." });
    }

    const idade = calcularIdade(dataNascimento);

    if (idade < 18) {
        return res.status(400).json({ erro: "Cadastro permitido somente para maiores de 18 anos." });
    }

    if (idade > 130) {
        return res.status(400).json({ erro: "Data de nascimento inválida." });
    }

    // Celular e CPF são opcionais, mas se vierem precisam ser válidos
    if (telefone && !telefoneValido(telefone)) {
        return res.status(400).json({ erro: "Informe o celular com DDD." });
    }

    if (cpf && !cpfValido(cpf)) {
        return res.status(400).json({ erro: "CPF inválido." });
    }

    // O aceite dos termos é obrigatório
    if (req.body.aceite_termos !== true) {
        return res.status(400).json({ erro: "É preciso aceitar os Termos de Uso e a Política de Privacidade." });
    }

    // Consentimentos opcionais: só os que foram marcados
    const consentimentos = [];

    if (req.body.ofertas_email === true) {
        consentimentos.push("ofertas_email");
    }

    if (req.body.ofertas_whatsapp === true) {

        if (!telefone) {
            return res.status(400).json({ erro: "Informe o celular para receber ofertas por WhatsApp." });
        }

        consentimentos.push("ofertas_whatsapp");

    }

    // Guarda os dados já limpos para a rota usar
    req.dadosCadastro = {
        nome,
        email,
        senha,
        data_nascimento: dataNascimento,
        telefone: telefone || null,
        cpf: cpf || null,
        consentimentos
    };

    next();

}


// =======================================================
// VALIDAÇÃO DA CORREÇÃO DE DADOS (PERFIL)
// =======================================================

function validarPerfil(req, res, next) {

    const nome = String(req.body.nome || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const telefone = somenteNumeros(req.body.telefone);

    if (nome.length < 2 || nome.length > 100) {
        return res.status(400).json({ erro: "Informe o seu nome." });
    }

    if (!emailValido(email)) {
        return res.status(400).json({ erro: "Informe um e-mail válido." });
    }

    if (telefone && !telefoneValido(telefone)) {
        return res.status(400).json({ erro: "Informe o celular com DDD." });
    }

    req.dadosPerfil = { nome, email, telefone: telefone || null };

    next();

}

module.exports = { validarCadastro, validarPerfil };
