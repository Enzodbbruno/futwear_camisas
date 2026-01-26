// Cache de produtos em memória
const productCache = new Map();
let isPreloaded = false;

// Função para obter um produto do cache ou do Firestore
async function getCachedProduct(productId) {
  // Verificar cache primeiro
  if (productCache.has(productId)) {
    return productCache.get(productId);
  }

  try {
    // Se não estiver em cache, buscar do banco externo
    const { buscarCamisaPorIdExterno } = await import('../external-database.js');
    const result = await buscarCamisaPorIdExterno(productId);

    if (result.success && result.data) {
      // Armazenar em cache
      productCache.set(productId, result.data);
      return result.data;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

// Pré-carregar produtos em cache
async function preloadProducts() {
  if (isPreloaded) return;

  try {
    const { buscarCamisasExterno } = await import('../external-database.js');
    const products = await buscarCamisasExterno();

    if (products && Array.isArray(products) && products.length > 0) {
      products.forEach(product => {
        if (product && product.id) {
          productCache.set(product.id, product);
        }
      });
      isPreloaded = true;
      console.log(`✅ ${products.length} produtos pré-carregados em cache (Externo)`);
    }
  } catch (error) {
    console.error("Erro ao pré-carregar produtos:", error);
  }
}

// Iniciar pré-carregamento quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Atraso para não bloquear o carregamento da página
  setTimeout(preloadProducts, 1000);
});

export { getCachedProduct, preloadProducts };
