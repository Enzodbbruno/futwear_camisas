// Basic Header
function createBasicHeader() {
    // Remove existing headers
    const existing = document.querySelectorAll('header, .header, .modern-header, .basic-header');
    existing.forEach(el => el.remove());
    
    const headerHTML = `
        <header class="basic-header">
            <a href="index.html" class="logo">FUTWEAR</a>
            
            <nav class="nav">
                <a href="index.html">Início</a>
                <a href="camisas.html">Produtos</a>
                <a href="carrinho.html">Carrinho</a>
            </nav>
            
            <div class="icons">
                <a href="#" onclick="toggleWishlist()">
                    <i class="fas fa-heart"></i>
                </a>
                <a href="carrinho.html">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="badge" id="cart-count">0</span>
                </a>
                <a href="login.html">
                    <i class="fas fa-user"></i>
                </a>
            </div>
        </header>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    updateCartCount();
}

function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'block' : 'none';
        }
    } catch (e) {
        console.error('Error updating cart:', e);
    }
}

function toggleWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlist.length === 0) {
        alert('Lista de favoritos vazia!');
        return;
    }
    alert(`Você tem ${wishlist.length} item(s) nos favoritos!`);
}

// Initialize
document.addEventListener('DOMContentLoaded', createBasicHeader);
