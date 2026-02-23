
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

          // Calculate discounted price if promo is active
          const basePrice = parseFloat(freshProduct.price) || 0;
          const discount = parseFloat(freshProduct.discount) || 0;
          const now = new Date();
          const promoStart = freshProduct.promoStart ? new Date(freshProduct.promoStart) : null;
          const promoEnd = freshProduct.promoEnd ? new Date(freshProduct.promoEnd) : null;
          const isPromoActive = discount > 0 && (!promoStart || now >= promoStart) && (!promoEnd || now <= promoEnd);
          const finalPrice = isPromoActive ? (basePrice * (1 - discount / 100)) : basePrice;

          // Mantém quantidade e tamanho, mas atualiza preço e imagem
          return {
            ...item,
            price: finalPrice, // Use discounted price if promo is active
            originalPrice: basePrice, // Keep original for reference
            discount: isPromoActive ? discount : 0,
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
    // Calculate discounted price if applicable
    const basePrice = parseFloat(product.price) || 0;
    const discount = parseFloat(product.discount) || 0;
    const now = new Date();
    const promoStart = product.promoStart ? new Date(product.promoStart) : null;
    const promoEnd = product.promoEnd ? new Date(product.promoEnd) : null;
    const isPromoActive = discount > 0 && (!promoStart || now >= promoStart) && (!promoEnd || now <= promoEnd);
    const finalPrice = isPromoActive ? (basePrice * (1 - discount / 100)) : basePrice;

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(p => p.id === product.id && p.size === product.size);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
      // Update price in case discount changed
      cart[existingIndex].price = finalPrice;
      cart[existingIndex].originalPrice = basePrice;
      cart[existingIndex].discount = isPromoActive ? discount : 0;
    } else {
      cart.push({
        ...product,
        price: finalPrice,
        originalPrice: basePrice,
        discount: isPromoActive ? discount : 0,
        quantity: 1
      });
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
// Shim for Reviews (now using API/Database)
export async function addReview(productId, review) {
  console.log('📝 Salvando avaliação via API:', review);
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        user_name: review.user || review.name || 'Anônimo',
        rating: review.rating,
        comment: review.comment || review.text
      })
    });
    if (!res.ok) throw new Error('Falha ao salvar avaliação');
    return { success: true };
  } catch (error) {
    console.error('Erro ao adicionar review:', error);
    return { success: false, error: error.message };
  }
}

export async function listReviews(productId) {
  try {
    const res = await fetch(`/api/reviews?product_id=${productId}`);
    if (!res.ok) throw new Error('Falha ao buscar avaliações');
    const reviews = await res.json();
    return reviews; // API already sorts/filters
  } catch (error) {
    console.error('Erro ao listar reviews:', error);
    return [];
  }
}

export async function deleteReview(productId, reviewId) {
  try {
    // Note: productId param kept for compatibility but not strictly needed if ID is unique
    const res = await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao deletar avaliação');
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar review:', error);
    return { success: false };
  }
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
