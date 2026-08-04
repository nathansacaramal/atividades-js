// 1. Selecionando os elementos do DOM
const form = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const submitBtn = document.getElementById('submit-btn');


// 2. Regras de Validação (Regex)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;


// 3. Adicionando os ouvintes de evento (O que dispara a ação primeiro)
nameInput.addEventListener('input', validateForm);
emailInput.addEventListener('input', validateForm);
passwordInput.addEventListener('input', () => {
  validateForm();
  if (confirmPasswordInput.value) validateConfirmPassword(); 
});
confirmPasswordInput.addEventListener('input', validateForm);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  alert('Formulário enviado com sucesso!');
});


// 4. Função principal de validação do formulário (Chamada pelos eventos)
function validateForm() {
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();

  const isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
  submitBtn.disabled = !isFormValid;
}


// 5. Funções de validação individuais
function validateName() {
  const isValid = nameInput.value.trim().length >= 8;
  setFieldStatus(nameInput, isValid, 'O nome deve ter pelo menos 8 caracteres.');
  return isValid;
}

function validateEmail() {
  const isValid = emailRegex.test(emailInput.value.trim());
  setFieldStatus(emailInput, isValid, 'Insira um e-mail válido (ex: usuario@dominio.com).');
  return isValid;
}

function validatePassword() {
  const isValid = passwordRegex.test(passwordInput.value);
  setFieldStatus(
    passwordInput, 
    isValid, 
    'A senha precisa de 8+ chars, 1 maiúscula e 1 número.'
  );
  return isValid;
}

function validateConfirmPassword() {
  const isMatch = confirmPasswordInput.value === passwordInput.value;
  const isNotEmpty = confirmPasswordInput.value.length > 0;
  const isValid = isMatch && isNotEmpty;

  setFieldStatus(
    confirmPasswordInput, 
    isValid, 
    'As senhas não coincidem.'
  );
  return isValid;
}


// 6. Função utilitária de suporte visual (A mais "baixa" camada)
function setFieldStatus(input, isValid, errorMessage = '') {
  const errorSpan = input.parentElement.querySelector('.error-message');

  if (isValid === true) {
    input.classList.remove('invalid');
    input.classList.add('valid');
    errorSpan.textContent = '';
  } else {
    input.classList.remove('valid');
    input.classList.add('invalid');
    errorSpan.textContent = errorMessage;
  }
}