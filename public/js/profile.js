// Gerenciamento de perfil do usuário
import { getCurrentUser, getUserProfile, updateUserProfile } from '../firebase-hybrid.js';

// Formatar data para o formato brasileiro
function formatDate(date) {
  if (!date) return 'Data não disponível';
  
  try {
    // Se for um timestamp do Firestore
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    
    // Se for uma data inválida
    if (isNaN(dateObj.getTime())) {
      console.warn('Data inválida recebida:', date);
      return 'Data não disponível';
    }
    
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data não disponível';
  }
}

// Carregar dados do perfil
async function loadUserProfile() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    // Mostrar loading
    const profileContent = document.getElementById('profile-content');
    const loading = document.getElementById('profile-loading');
    
    if (loading) loading.style.display = 'block';
    if (profileContent) profileContent.style.display = 'none';

    // Buscar perfil do usuário
    const userProfile = await getUserProfile(user.uid);
    
    // Preencher dados do perfil
    document.getElementById('user-email').textContent = user.email || 'Não informado';
    document.getElementById('user-name').textContent = user.displayName || 'Não informado';
    
    // Usar a data de criação do perfil se existir, senão usar a data de criação do usuário
    const createdAt = userProfile?.createdAt || user.metadata?.creationTime;
    document.getElementById('signup-date').textContent = formatDate(createdAt);
    
    // Preencher formulário de edição
    if (userProfile) {
      const form = document.getElementById('profile-form');
      if (form) {
        form.elements['displayName'].value = userProfile.displayName || '';
        form.elements['phone'].value = userProfile.phone || '';
        form.elements['address'].value = userProfile.address || '';
      }
    }
    
    // Esconder loading e mostrar conteúdo
    if (loading) loading.style.display = 'none';
    if (profileContent) profileContent.style.display = 'block';
    
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    
    // Mostrar mensagem de erro
    const errorElement = document.getElementById('profile-error');
    if (errorElement) {
      errorElement.textContent = 'Erro ao carregar perfil. Por favor, recarregue a página.';
      errorElement.style.display = 'block';
    }
    
    const loading = document.getElementById('profile-loading');
    if (loading) loading.style.display = 'none';
  }
}

// Salvar perfil
async function saveProfile(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const errorElement = document.getElementById('profile-error');
  const successElement = document.getElementById('profile-success');
  
  // Resetar mensagens
  if (errorElement) errorElement.style.display = 'none';
  if (successElement) successElement.style.display = 'none';
  
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    // Desabilitar botão
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';
    }
    
    // Preparar dados para atualização
    const updateData = {
      displayName: form.elements['displayName'].value.trim(),
      phone: form.elements['phone'].value.trim(),
      address: form.elements['address'].value.trim(),
      updatedAt: new Date().toISOString()
    };
    
    // Atualizar perfil
    await updateUserProfile(user.uid, updateData);
    
    // Atualizar dados na interface
    document.getElementById('user-name').textContent = updateData.displayName || user.email.split('@')[0];
    
    // Mostrar mensagem de sucesso
    if (successElement) {
      successElement.textContent = 'Perfil atualizado com sucesso!';
      successElement.style.display = 'block';
      
      // Esconder mensagem após 3 segundos
      setTimeout(() => {
        if (successElement) successElement.style.display = 'none';
      }, 3000);
    }
    
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    
    // Mostrar mensagem de erro
    if (errorElement) {
      errorElement.textContent = 'Erro ao salvar perfil. Por favor, tente novamente.';
      errorElement.style.display = 'block';
    }
    
  } finally {
    // Reabilitar botão
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Salvar alterações';
    }
  }
}

// Inicializar página de perfil
function initProfilePage() {
  // Carregar perfil
  loadUserProfile();
  
  // Configurar formulário
  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', saveProfile);
  }
  
  // Configurar botão de logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const { logout } = await import('../firebase-hybrid.js');
        await logout();
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    });
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Verificar se estamos na página de perfil
  if (document.getElementById('profile-page')) {
    initProfilePage();
  }
});

export { loadUserProfile, saveProfile, formatDate };
