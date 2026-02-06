// Gerenciamento de perfil do usuário (Supabase/Postgres Version)

// Helper to decode JWT
function parseJwt(token) {
  try {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Carregar dados do perfil
function loadUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const user = parseJwt(token);
    if (!user) {
      throw new Error('Token inválido');
    }

    // Mostrar loading (simulado)
    const profileContent = document.getElementById('profile-content');
    const loading = document.getElementById('profile-loading');

    if (loading) loading.style.display = 'block';
    if (profileContent) profileContent.style.display = 'none';

    // Simular delay de rede
    setTimeout(() => {
      // Preencher dados do perfil
      document.getElementById('user-email').textContent = user.email || 'Não informado';
      document.getElementById('user-name').textContent = user.name || 'Usuário';

      // Data de criação não está no token padrão, deixar genérico ou ocultar
      const signUpDateInfo = document.getElementById('signup-date');
      if (signUpDateInfo) signUpDateInfo.parentElement.style.display = 'none'; // Ocultar por enquanto

      // Preencher formulário de edição (Read-only por enquanto)
      const form = document.getElementById('profile-form');
      if (form) {
        if (form.elements['displayName']) form.elements['displayName'].value = user.name || '';
        // Phone e Address não estão no banco ainda
        if (form.elements['phone']) form.elements['phone'].value = '';
        if (form.elements['address']) form.elements['address'].value = '';

        // Desabilitar edição por enquanto
        Array.from(form.elements).forEach(el => el.disabled = true);
        const btn = form.querySelector('button');
        if (btn) {
          btn.textContent = 'Edição em breve';
          btn.disabled = true;
        }
      }

      // Esconder loading e mostrar conteúdo
      if (loading) loading.style.display = 'none';
      if (profileContent) profileContent.style.display = 'block';
    }, 500);

  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }
}

// Inicializar página de perfil
function initProfilePage() {
  // Carregar perfil
  loadUserProfile();

  // Configurar botão de logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      window.location.href = 'index.html';
    });
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Verificar se estamos na página de perfil
  if (document.getElementById('profile-page') || document.getElementById('profile-content')) {
    initProfilePage();
  }
});

export { loadUserProfile };
