
// Shim to replace Firebase logic with Supabase API and LocalStorage
// This file is imported by index.html

export async function buscarCamisas() {
  try {
    console.log('🔄 Buscando produtos da API (Supabase)...');
    // Add timestamp to prevent caching issues
    const response = await fetch('/api/products?limit=100&t=' + Date.now());
    if (!response.ok) throw new Error('Falha na API');
    const data = await response.json();
    // Return array (handle { data: [...] } or [...])
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    return [];
  }
}


export async function getProductById(id) {
  try {
    console.log('🔄 Buscando produto por ID:', id);
    const response = await fetch(`/api/products?id=${id}&t=${Date.now()}`);
    if (!response.ok) throw new Error('Falha na API');
    const data = await response.json();
    const products = Array.isArray(data) ? data : (data.data || []);
    if (products.length > 0) {
      return { success: true, data: products[0] };
    }
    return { success: false, error: 'Produto não encontrado' };
  } catch (error) {
    console.error('❌ Erro ao buscar produto:', error);
    return { success: false, error: error.message };
  }
}

export async function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) return [];

    console.log('🛒 Validando carrinho com API...');
    const validatedCart = await Promise.all(cart.map(async (item) => {
      // Se tiver ID, busca dados atualizados
      if (item.id) {
        const result = await getProductById(item.id);
        if (result.success && result.data) {
          const freshProduct = result.data;
          // Mantém quantidade e tamanho, mas atualiza preço e imagem
          return {
            ...item,
            price: parseFloat(freshProduct.price), // Preço atualizado do banco (Force Number)
            image: freshProduct.image,
            name: freshProduct.name,
            // Mantém personalização se houver
          };
        }
      }
      return item; // Retorna item original se falhar (fallback)
    }));

    // Salva carrinho validado para persistir correções
    localStorage.setItem('cart', JSON.stringify(validatedCart));
    return validatedCart;
  } catch (error) {
    console.error('Erro ao validar carrinho:', error);
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }
}

export function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  atualizarIconeCarrinho();
  window.dispatchEvent(new Event('cartUpdated'));
}

export function addToCart(product) {
  try {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(p => p.id === product.id && p.size === product.size);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    setCart(cart); // Use helper

    if (window.showNotification) {
      window.showNotification('Produto adicionado ao carrinho!', 'success');
    } else {
      console.log('✅ Produto adicionado ao carrinho');
    }
  } catch (e) {
    console.error('Erro ao adicionar ao carrinho:', e);
  }
}

export function atualizarIconeCarrinho() {
  // If header.js defines a global function, call it
  if (typeof window.updateCartCount === 'function') {
    window.updateCartCount();
  } else {
    // Fallback implementation
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
      const badges = document.querySelectorAll('#cart-count, .cart-count');
      badges.forEach(b => {
        b.textContent = count;
        b.classList.toggle('hidden', count === 0);
      });
    } catch (e) { console.error(e); }
  }
}

export function invalidateCamisasCache() {
  // No-op for now, or clear session storage if we used it
  console.log('Cache invalidado (noop)');
}

// Shim for Reviews (LocalStorage based for now)
export async function addReview(productId, review) {
  console.log('📝 Salvando avaliação:', review);
  let reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]');
  reviews.push({ ...review, createdAt: new Date().toISOString() });
  localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
  return { success: true };
}

export async function listReviews(productId) {
  const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]');
  return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function deleteReview(productId, reviewId) {
  console.log('🗑️ Deletando avaliação:', reviewId);
  let reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]');
  reviews = reviews.filter(r => r.id !== reviewId);
  localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
  return { success: true };
}

export async function isAdmin() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.email === 'admin@futwear.com'; // Simple check
}

// Export default object just in case
export default {
  buscarCamisas,
  addToCart,
  atualizarIconeCarrinho,
  invalidateCamisasCache,
  addReview,
  listReviews,
  deleteReview,
  isAdmin,
  getProductById,
  getCart,
  setCart
};
