// Inicialização da aplicação
import { preloadProducts } from './product-cache.js';
import { initSearchValidation } from './validation.js';

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Aplicação Futwear inicializada');
  
  // Inicializar validação de busca
  initSearchValidation();
  
  // Iniciar pré-carregamento de produtos (com atraso para não bloquear a renderização)
  setTimeout(() => {
    preloadProducts().catch(error => {
      console.error('Erro ao pré-carregar produtos:', error);
    });
  }, 1000);
  
  // Configurar tooltips do Bootstrap
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
  
  // Configurar popovers do Bootstrap
  if (typeof bootstrap !== 'undefined' && bootstrap.Popover) {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  }
  
  // Adicionar classe de carregamento ao body
  document.body.classList.add('app-loaded');
});

// Exportar funções úteis
export function showLoading(element) {
  if (element) {
    element.classList.add('loading');
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border spinner-border-sm ms-2';
    spinner.role = 'status';
    element.appendChild(spinner);
  }
}

export function hideLoading(element) {
  if (element) {
    element.classList.remove('loading');
    const spinner = element.querySelector('.spinner-border');
    if (spinner) {
      spinner.remove();
    }
  }
}

// Função para mostrar notificações
export function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Estilos inline para garantir que funcionem em todas as páginas
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '15px 25px';
  notification.style.borderRadius = '4px';
  notification.style.color = 'white';
  notification.style.zIndex = '9999';
  notification.style.opacity = '0';
  notification.style.transition = 'opacity 0.3s ease-in-out';
  
  // Cores baseadas no tipo
  const colors = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  
  document.body.appendChild(notification);
  
  // Forçar reflow para ativar a transição
  void notification.offsetWidth;
  
  // Mostrar notificação
  notification.style.opacity = '1';
  
  // Remover após a duração
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);
}

// Exportar funções para uso global
window.FutwearApp = {
  showNotification,
  showLoading,
  hideLoading
};

// Inicializar o app
console.log('🔧 Módulo de inicialização carregado');
