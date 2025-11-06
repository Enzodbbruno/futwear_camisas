// Gerenciador de carrinho otimizado
import { getCachedProduct } from './product-cache.js';

const CART_STORAGE_KEY = 'futwear_cart';

// Obter carrinho do localStorage
function getCart() {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Erro ao carregar carrinho:', error);
    return [];
  }
}

// Salvar carrinho no localStorage
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
    return true;
  } catch (error) {
    console.error('Erro ao salvar carrinho:', error);
    return false;
  }
}

// Atualizar contador do carrinho
function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  // Atualizar todos os badges do carrinho na página
  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
  });
}

// Adicionar item ao carrinho
async function addToCart(productId, quantity = 1, size = null, color = null) {
  if (!productId) return { success: false, error: 'ID do produto não fornecido' };
  
  try {
    // Buscar informações do produto (usando cache)
    const product = await getCachedProduct(productId);
    
    if (!product) {
      return { success: false, error: 'Produto não encontrado' };
    }
    
    const cart = getCart();
    const existingItemIndex = cart.findIndex(item => 
      item.id === productId && 
      item.size === size && 
      item.color === color
    );
    
    if (existingItemIndex >= 0) {
      // Atualizar quantidade se o item já existir
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Adicionar novo item
      cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || 'img/placeholder.jpg',
        quantity,
        size,
        color,
        addedAt: new Date().toISOString()
      });
    }
    
    // Salvar carrinho atualizado
    saveCart(cart);
    
    // Disparar evento de atualização do carrinho
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
    
    return { 
      success: true, 
      cart,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
    
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    return { success: false, error: 'Erro ao adicionar ao carrinho' };
  }
}

// Remover item do carrinho
function removeFromCart(productId, size = null, color = null) {
  const cart = getCart();
  const filteredCart = cart.filter(item => 
    !(item.id === productId && 
      (size === null || item.size === size) && 
      (color === null || item.color === color))
  );
  
  const removed = filteredCart.length < cart.length;
  
  if (removed) {
    saveCart(filteredCart);
    
    // Disparar evento de atualização do carrinho
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: filteredCart } }));
  }
  
  return { 
    success: removed, 
    cart: filteredCart,
    totalItems: filteredCart.reduce((sum, item) => sum + item.quantity, 0)
  };
}

// Atualizar quantidade de um item no carrinho
function updateCartItemQuantity(productId, quantity, size = null, color = null) {
  if (quantity <= 0) {
    return removeFromCart(productId, size, color);
  }
  
  const cart = getCart();
  const itemIndex = cart.findIndex(item => 
    item.id === productId && 
    (size === null || item.size === size) && 
    (color === null || item.color === color)
  );
  
  if (itemIndex >= 0) {
    cart[itemIndex].quantity = quantity;
    saveCart(cart);
    
    // Disparar evento de atualização do carrinho
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
    
    return { 
      success: true, 
      cart,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  }
  
  return { 
    success: false, 
    error: 'Item não encontrado no carrinho',
    cart,
    totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
  };
}

// Limpar carrinho
function clearCart() {
  saveCart([]);
  
  // Disparar evento de atualização do carrinho
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: [] } }));
  
  return { success: true, cart: [], totalItems: 0 };
}

// Calcular total do carrinho
function calculateCartTotal(cart = null) {
  const currentCart = cart || getCart();
  return currentCart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

// Inicializar o carrinho quando o script carregar
function initCart() {
  updateCartBadge();
  
  // Atualizar badge quando o carrinho for modificado em outra aba
  window.addEventListener('storage', (event) => {
    if (event.key === CART_STORAGE_KEY) {
      updateCartBadge();
    }
  });
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initCart);

// Exportar funções
export {
  getCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  calculateCartTotal,
  updateCartBadge
};
