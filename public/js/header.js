// Gerenciamento do cabeçalho e navegação
import { getCurrentUser, isUserLoggedIn, isAdmin, onAuthStateChange } from '../firebase-hybrid.js';
import { showNotification } from './app.js';

// Elementos do DOM
let headerElement = null;
let mobileMenuButton = null;
let mobileMenu = null;
let userMenu = null;
let userMenuButton = null;
let authButtons = null;
let adminLinks = null;

// Inicializar o cabeçalho
function initHeader() {
  headerElement = document.querySelector('header');
  if (!headerElement) return;

  // Encontrar elementos importantes
  mobileMenuButton = headerElement.querySelector('.mobile-menu-button');
  mobileMenu = headerElement.querySelector('.mobile-menu');
  userMenu = headerElement.querySelector('.user-menu');
  userMenuButton = headerElement.querySelector('.user-menu-button');
  authButtons = headerElement.querySelector('.auth-buttons');
  adminLinks = headerElement.querySelectorAll('[data-admin-only]');
  
  // Configurar eventos
  setupEventListeners();
  
  // Atualizar estado inicial
  updateAuthUI();
  
  // Ouvir mudanças de autenticação
  onAuthStateChange(updateAuthUI);
}

// Configurar eventos do cabeçalho
function setupEventListeners() {
  // Menu móvel
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
  }
  
  // Menu do usuário
  if (userMenuButton && userMenu) {
    userMenuButton.addEventListener('click', toggleUserMenu);
  }
  
  // Fechar menus ao clicar fora
  document.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenuButton && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
      mobileMenu.classList.remove('active');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
    }
    
    if (userMenu && userMenuButton && !userMenu.contains(e.target) && !userMenuButton.contains(e.target)) {
      userMenu.classList.remove('active');
      userMenuButton.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Links do menu de navegação
  const navLinks = headerElement.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Fechar menu móvel ao clicar em um link
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });
  
  // Botão de logout
  const logoutButton = headerElement.querySelector('.logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
}

// Alternar menu móvel
function toggleMobileMenu() {
  if (!mobileMenu || !mobileMenuButton) return;
  
  const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
  mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
  mobileMenu.classList.toggle('active');
  
  // Alternar ícone do botão
  const icon = mobileMenuButton.querySelector('i, svg');
  if (icon) {
    if (isExpanded) {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    } else {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    }
  }
  
  // Desabilitar rolagem da página quando o menu estiver aberto
  document.body.style.overflow = isExpanded ? '' : 'hidden';
}

// Alternar menu do usuário
function toggleUserMenu() {
  if (!userMenu || !userMenuButton) return;
  
  const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
  userMenuButton.setAttribute('aria-expanded', !isExpanded);
  userMenu.classList.toggle('active');
}

// Atualizar interface com base no estado de autenticação
async function updateAuthUI() {
  const loggedIn = isUserLoggedIn();
  
  // Atualizar botões de autenticação
  if (authButtons) {
    authButtons.style.display = loggedIn ? 'none' : 'flex';
  }
  
  // Atualizar menu do usuário
  if (userMenuButton) {
    userMenuButton.style.display = loggedIn ? 'flex' : 'none';
    
    if (loggedIn) {
      const user = getCurrentUser();
      const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
      
      const nameElement = userMenuButton.querySelector('.user-name');
      if (nameElement) {
        nameElement.textContent = userName;
      }
      
      const avatarElement = userMenuButton.querySelector('.user-avatar');
      if (avatarElement && user?.photoURL) {
        avatarElement.src = user.photoURL;
        avatarElement.alt = `Foto de ${userName}`;
        avatarElement.style.display = 'block';
      } else if (avatarElement) {
        // Mostrar iniciais como fallback
        const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
        avatarElement.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><rect width='40' height='40' fill='%230d6efd' rx='20'/><text x='50%' y='55%' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dominant-baseline='middle'>${initials.substring(0, 2)}</text></svg>`;
        avatarElement.style.display = 'block';
      }
    }
  }
  
  // Atualizar links de administração
  if (adminLinks.length > 0) {
    const userIsAdmin = await isAdmin();
    adminLinks.forEach(link => {
      link.style.display = userIsAdmin ? 'block' : 'none';
    });
  }
  
  // Disparar evento personalizado
  document.dispatchEvent(new CustomEvent('authStateChanged', { 
    detail: { 
      isLoggedIn: loggedIn,
      user: loggedIn ? getCurrentUser() : null
    } 
  }));
}

// Manipular logout
async function handleLogout(e) {
  e.preventDefault();
  
  try {
    const { logout } = await import('../firebase-hybrid.js');
    await logout();
    
    // Redirecionar para a página inicial
    if (window.location.pathname.includes('perfil') || 
        window.location.pathname.includes('admin')) {
      window.location.href = 'index.html';
    } else {
      // Recarregar a página atual para atualizar a UI
      window.location.reload();
    }
    
    showNotification('Você saiu da sua conta', 'success');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    showNotification('Erro ao sair da conta. Tente novamente.', 'error');
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Verificar se estamos em uma página que tem o cabeçalho
  if (document.querySelector('header')) {
    initHeader();
  }
});

// Exportar funções úteis
export { initHeader, updateAuthUI };
