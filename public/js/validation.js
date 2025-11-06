// Sistema de validação de formulários

// Inicializar validação de busca
function initSearchValidation() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const searchError = document.getElementById('search-error');

  if (!searchForm || !searchInput) return;

  // Criar elemento de erro se não existir
  if (!searchError) {
    const errorElement = document.createElement('div');
    errorElement.id = 'search-error';
    errorElement.className = 'error-message';
    errorElement.style.display = 'none';
    errorElement.style.color = '#dc3545';
    errorElement.style.marginTop = '5px';
    errorElement.style.fontSize = '0.875rem';
    
    searchForm.appendChild(errorElement);
  }

  // Função para validar a busca
  function validateSearch() {
    const searchTerm = searchInput.value.trim();
    const errorElement = document.getElementById('search-error');
    
    // Resetar estilo de erro
    searchInput.style.borderColor = '';
    
    // Se estiver vazio, não mostrar erro
    if (searchTerm.length === 0) {
      if (errorElement) errorElement.style.display = 'none';
      return true;
    }
    
    // Validar tamanho mínimo
    if (searchTerm.length < 2) {
      if (errorElement) {
        errorElement.textContent = 'Digite pelo menos 2 caracteres';
        errorElement.style.display = 'block';
      }
      searchInput.style.borderColor = '#dc3545';
      return false;
    }
    
    // Se chegou aqui, a validação passou
    if (errorElement) errorElement.style.display = 'none';
    return true;
  }

  // Adicionar eventos
  searchInput.addEventListener('input', function() {
    // Só valida se já tiver algo digitado
    if (this.value.trim().length > 0) {
      validateSearch();
    } else {
      const errorElement = document.getElementById('search-error');
      if (errorElement) errorElement.style.display = 'none';
    }
  });

  // Validar no submit do formulário
  searchForm.addEventListener('submit', function(e) {
    if (!validateSearch()) {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

// Inicializar validação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  initSearchValidation();
});

// Função para validar formulário de login
function validateLoginForm(form) {
  const email = form.querySelector('input[type="email"]');
  const password = form.querySelector('input[type="password"]');
  let isValid = true;

  // Resetar erros
  document.querySelectorAll('.error-message').forEach(el => el.remove());
  form.querySelectorAll('input').forEach(input => input.style.borderColor = '');

  // Validar email
  if (!email.value) {
    showError(email, 'Por favor, insira seu e-mail');
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    showError(email, 'Por favor, insira um e-mail válido');
    isValid = false;
  }

  // Validar senha
  if (!password.value) {
    showError(password, 'Por favor, insira sua senha');
    isValid = false;
  }

  return isValid;
}

// Função auxiliar para mostrar erros
function showError(input, message) {
  const error = document.createElement('div');
  error.className = 'error-message';
  error.style.color = '#dc3545';
  error.style.fontSize = '0.875rem';
  error.style.marginTop = '5px';
  error.textContent = message;
  
  input.style.borderColor = '#dc3545';
  input.parentNode.insertBefore(error, input.nextSibling);
}

export { initSearchValidation, validateLoginForm, showError };
