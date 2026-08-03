// Selecionando os elementos do DOM
const form = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const submitBtn = document.getElementById('submit-btn');

// Regras de Validação com Expressões Regulares (Regex)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// Função utilitária para aplicar status visual no campo
function setFieldStatus(input, isValid, errorMessage = '') {
  const errorSpan = input.parentElement.querySelector('.error-message');

  if (isValid == true) {
    input.classList.remove('invalid');
    input.classList.add('valid');
    errorSpan.textContent = '';
  } else {
    input.classList.remove('valid');
    input.classList.add('invalid');
    errorSpan.textContent = errorMessage;
  }
}

// Funções de validação individuais
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

// Função para checar o formulário todo e liberar/bloquear o botão
function validateForm() {
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();

  // O botão só ativa se TODOS os retornos forem true
  const isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
  submitBtn.disabled = !isFormValid;
}

// Adicionando os ouvintes de evento ('input' escuta cada tecla/alteração)
nameInput.addEventListener('input', validateForm);
emailInput.addEventListener('input', validateForm);
passwordInput.addEventListener('input', () => {
  validateForm();
  // Valida a confirmação novamente caso a senha principal mude
  if (confirmPasswordInput.value) validateConfirmPassword(); 
});
confirmPasswordInput.addEventListener('input', validateForm);

// Evento ao enviar o formulário
form.addEventListener('submit', (event) => {
  event.preventDefault(); // Impede o recarregamento da página
  alert('Formulário enviado com sucesso!');
});