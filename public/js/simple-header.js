// Simple Header Component
class SimpleHeader {
    constructor() {
        this.init();
    }

    init() {
        this.createHeader();
        this.setupEventListeners();
        this.updateCartCount();
    }

    createHeader() {
        // Remove any existing headers first
        const existingHeaders = document.querySelectorAll('header, .header, .modern-header, nav');
        existingHeaders.forEach(header => header.remove());
        
        const headerHTML = `
            <header class="header">
                <a href="index.html" class="header-logo">
                    FUT<span>WEAR</span>
                </a>

                <div class="header-search">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Buscar camisas, times, jogadores..." id="searchInput">
                </div>

                <div class="header-icons">
                    <a href="#" aria-label="Favoritos" onclick="toggleWishlist()">
                        <i class="fas fa-heart"></i>
                    </a>
                    <a href="carrinho.html" aria-label="Carrinho">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="badge" id="cart-count">0</span>
                    </a>
                    <a href="login.html" aria-label="Perfil">
                        <i class="fas fa-user"></i>
                    </a>
                </div>
            </header>
        `;
        
        // Insert header at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        // Wishlist functionality
        window.toggleWishlist = () => {
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            if (wishlist.length === 0) {
                alert('Sua lista de favoritos está vazia!');
                return;
            }
            
            // Show wishlist modal
            this.showWishlistModal(wishlist);
        };
    }

    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            alert('Digite pelo menos 2 caracteres para buscar');
            return;
        }
        
        // Redirect to search results
        window.location.href = `camisas.html?search=${encodeURIComponent(query)}`;
    }

    showWishlistModal(wishlist) {
        const wishlistModalHTML = `
            <div id="wishlistModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-96 overflow-y-auto">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Meus Favoritos</h3>
                        <button onclick="this.closeWishlistModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="space-y-3">
                        ${wishlist.map(item => `
                            <div class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded-lg">
                                <div class="flex-1">
                                    <h4 class="font-medium text-gray-800">${item.name}</h4>
                                    <p class="text-sm text-gray-600">${item.team || ''}</p>
                                    <p class="text-sm font-bold text-green-600">R$ ${Number(item.price || 0).toFixed(2).replace('.', ',')}</p>
                                </div>
                                <button onclick="this.removeFromWishlist('${item.id}')" class="text-red-500 hover:text-red-700">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', wishlistModalHTML);
    }

    closeWishlistModal() {
        const modal = document.getElementById('wishlistModal');
        if (modal) {
            modal.remove();
        }
    }

    updateCartCount() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            
            const cartCount = document.getElementById('cart-count');
            if (cartCount) {
                cartCount.textContent = count;
                cartCount.style.display = count > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        new SimpleHeader();
    }, 100);
});

// Export for use in other scripts
window.SimpleHeader = SimpleHeader;
