// Gerenciador de upload de imagens via API do Vercel
import { getCurrentUser } from '../firebase-hybrid.js';

/**
 * Converte um arquivo para base64
 * @param {File} file - O arquivo a ser convertido
 * @returns {Promise<string>} O arquivo em formato base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * Faz upload de uma imagem via API do Vercel
 * @param {File} file - O arquivo de imagem a ser enviado
 * @returns {Promise<{success: boolean, url: string, error: string}>}
 */
async function uploadImage(file) {
  try {
    // Validação do arquivo
    if (!file || !file.type.startsWith('image/')) {
      return { success: false, error: 'Por favor, selecione um arquivo de imagem válido.' };
    }

    // Limita o tamanho do arquivo para 5MB
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'A imagem deve ter no máximo 5MB.' };
    }

    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    // Converte o arquivo para base64
    const base64File = await fileToBase64(file);
    
    // Envia para a API do Vercel
    const response = await fetch('/api/upload-profile-picture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64File,
        userId: user.uid,
        fileType: file.type,
        fileName: file.name
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Erro ao fazer upload da imagem');
    }

    return {
      success: true,
      url: result.url,
      path: result.path
    };
    
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return {
      success: false,
      error: error.message || 'Erro ao fazer upload da imagem. Tente novamente.'
    };
  }
}

/**
 * Atualiza a foto de perfil do usuário
 * @param {File} file - O arquivo de imagem
 * @returns {Promise<{success: boolean, url: string, error: string}>}
 */
async function updateProfilePicture(file) {
  console.log('Iniciando upload da imagem...');
  try {
    const user = getCurrentUser();
    if (!user) {
      console.error('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado.' };
    }

    console.log('Fazendo upload da imagem...');
    const uploadResult = await uploadImage(file);
    console.log('Resultado do upload:', uploadResult);

    if (!uploadResult.success) {
      console.error('Erro no upload:', uploadResult.error);
      return uploadResult;
    }

    // Atualiza o perfil do usuário no localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    userData.photoURL = uploadResult.url;
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('URL da imagem salva no localStorage:', uploadResult.url);

    // Dispara evento para atualizar a UI
    const event = new CustomEvent('userProfileUpdated', {
      detail: { 
        user: { 
          ...user, 
          photoURL: uploadResult.url,
          uid: user.uid
        } 
      }
    });
    
    console.log('Disparando evento userProfileUpdated');
    window.dispatchEvent(event);

    return {
      success: true,
      url: uploadResult.url,
      message: 'Foto de perfil atualizada com sucesso!'
    };
  } catch (error) {
    console.error('Erro ao atualizar foto de perfil:', error);
    return {
      success: false,
      error: error.message || 'Erro ao atualizar a foto de perfil. Tente novamente.'
    };
  }
}

/**
 * Obtém a URL da foto de perfil do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<string>} URL da foto de perfil
 */
async function getProfilePictureUrl(userId) {
  console.log(`Buscando foto de perfil para o usuário: ${userId}`);
  
  try {
    // Tenta buscar do localStorage primeiro
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Dados do usuário no localStorage:', userData);
    
    if (userData && userData.photoURL) {
      console.log('URL da foto encontrada no localStorage:', userData.photoURL);
      
      // Verifica se a URL é válida
      if (typeof userData.photoURL === 'string' && 
          (userData.photoURL.startsWith('http') || userData.photoURL.startsWith('data:image'))) {
        return userData.photoURL;
      } else {
        console.warn('URL da foto no localStorage é inválida:', userData.photoURL);
      }
    } else {
      console.log('Nenhuma foto de perfil encontrada no localStorage');
    }

    // Se não encontrar, retorna uma imagem padrão
    const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    console.log('Retornando avatar padrão:', defaultAvatar);
    return defaultAvatar;
    
  } catch (error) {
    console.error('Erro ao buscar foto de perfil:', error);
    const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    console.log('Retornando avatar padrão devido a erro');
    return defaultAvatar;
  }
}

// Exporta as funções
export { uploadImage, updateProfilePicture, getProfilePictureUrl };
