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
    // Se não estiver em cache, buscar do Firestore
    const { getProductById } = await import('../firebase-hybrid.js');
    const product = await getProductById(productId);
    
    if (product) {
      // Armazenar em cache
      productCache.set(productId, product);
    }
    
    return product;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

// Pré-carregar produtos em cache
async function preloadProducts() {
  if (isPreloaded) return;
  
  try {
    const { getProducts } = await import('../firebase-hybrid.js');
    const products = await getProducts();
    
    if (products && products.length > 0) {
      products.forEach(product => {
        if (product && product.id) {
          productCache.set(product.id, product);
        }
      });
      isPreloaded = true;
      console.log(`✅ ${products.length} produtos pré-carregados em cache`);
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
