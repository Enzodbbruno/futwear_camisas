// Ponto de entrada principal da aplicação

// Carregar estilos
function loadStyles() {
  // Adicionar CSS principal
  const mainCss = document.createElement('link');
  mainCss.rel = 'stylesheet';
  mainCss.href = '/css/app.css';
  document.head.appendChild(mainCss);
  
  // Adicionar fonte do Font Awesome (se não estiver incluída no HTML)
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    fontAwesome.integrity = 'sha512-Fo3rlrZj/k7ujTnHg4C+2XonQ6dLJvELQkcd6Rph+6yY5F5U5k5q5f5p5F5Y5F5U5k5q5f5p5F5Y5F5U5k5q5';
    fontAwesome.crossOrigin = 'anonymous';
    fontAwesome.referrerPolicy = 'no-referrer';
    document.head.appendChild(fontAwesome);
  }
}

// Carregar scripts dinamicamente
function loadScript(src, type = 'module') {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = type;
    script.onload = () => resolve();
    script.onerror = (error) => reject(new Error(`Erro ao carregar o script: ${src}`, error));
    document.body.appendChild(script);
  });
}

// Inicializar a aplicação
async function initApp() {
  try {
    console.log('🚀 Inicializando aplicação Futwear...');
    
    // Carregar estilos
    loadStyles();
    
    // Carregar scripts principais (em ordem)
    await loadScript('/js/product-cache.js');
    await loadScript('/js/validation.js');
    await loadScript('/js/cart-manager.js');
    await loadScript('/js/header.js');
    await loadScript('/js/profile.js');
    await loadScript('/js/app.js');
    
    console.log('✅ Aplicação inicializada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar a aplicação:', error);
    
    // Mostrar mensagem de erro amigável
    const errorMessage = document.createElement('div');
    errorMessage.className = 'alert alert-danger m-3';
    errorMessage.role = 'alert';
    errorMessage.innerHTML = `
      <h4 class="alert-heading">Erro ao carregar a aplicação</h4>
      <p>Ocorreu um erro ao carregar a aplicação. Por favor, recarregue a página.</p>
      <hr>
      <p class="mb-0">Se o problema persistir, entre em contato com o suporte.</p>
    `;
    
    document.body.insertBefore(errorMessage, document.body.firstChild);
  }
}

// Iniciar a aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Exportar funções para uso global
window.Futwear = {
  initApp,
  loadScript
};
