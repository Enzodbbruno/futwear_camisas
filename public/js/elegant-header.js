// Elegant Header Component
function createElegantHeader() {
    // Remove existing headers
    const existing = document.querySelectorAll('header, .header, .modern-header, .basic-header, .header-top');
    existing.forEach(el => el.remove());
    
    const headerHTML = `
        <header>
            <div class="header-top">
                <div class="header-left">
                    <a href="index.html" class="header-logo">
                        FUT<span>WEAR</span>
                    </a>
                </div>

                <div class="header-center">
                    <div class="header-menu">
                        <a href="camisas.html?category=times-brasileiros">Times BR</a>
                        <a href="camisas.html?category=times-europeus">Times EU</a>
                        <a href="camisas.html?category=selecoes">Seleções</a>
                        <a href="camisas.html?category=retro">Retrô</a>
                        <a href="camisas.html?category=promocoes">Promoções</a>
                        <a href="camisas.html">Todos</a>
                    </div>
                </div>

                <div class="header-right">
                    <div class="header-icons">
                        <div class="search-container">
                            <input type="text" placeholder="Buscar" id="searchInput">
                            <i class="fas fa-search" onclick="performSearch()"></i>
                        </div>
                        <a href="#" aria-label="Favoritos" onclick="toggleWishlist()">
                            <i class="fas fa-heart"></i>
                        </a>
                        <a href="carrinho.html" aria-label="Carrinho">
                            <i class="fas fa-shopping-bag"></i>
                            <span class="badge" id="cart-count">0</span>
                        </a>
                        <div class="profile-button" onclick="toggleProfileDropdown()">
                            <i class="fas fa-user"></i>
                            <span class="user-email" id="user-email">Entrar</span>
                            <i class="fas fa-chevron-down"></i>
                            <div class="profile-dropdown" id="profileDropdown">
                                <a href="login.html">Fazer Login</a>
                                <a href="perfil.html">Meu Perfil</a>
                                <a href="meus-pedidos.html">Meus Pedidos</a>
                                <a href="#" onclick="logout()">Sair</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    setupHeaderEvents();
    updateCartCount();
}

function setupHeaderEvents() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
        alert('Digite pelo menos 2 caracteres para buscar');
        return;
    }
    
    // Redirect to search results
    window.location.href = `camisas.html?search=${encodeURIComponent(query)}`;
}

function toggleWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlist.length === 0) {
        alert('Sua lista de favoritos está vazia!');
        return;
    }
    
    // Show wishlist modal
    showWishlistModal(wishlist);
}

function showWishlistModal(wishlist) {
    const wishlistModalHTML = `
        <div id="wishlistModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-96 overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-gray-800">Meus Favoritos</h3>
                    <button onclick="closeWishlistModal()" class="text-gray-500 hover:text-gray-700">
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
                                <p class="text-sm font-bold text-blue-600">R$ ${Number(item.price || 0).toFixed(2).replace('.', ',')}</p>
                            </div>
                            <button onclick="removeFromWishlist('${item.id}')" class="text-red-500 hover:text-red-700">
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

function closeWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    if (modal) {
        modal.remove();
    }
}

function removeFromWishlist(itemId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updatedWishlist = wishlist.filter(item => item.id !== itemId);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    // Refresh modal
    closeWishlistModal();
    showWishlistModal(updatedWishlist);
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

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
        
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
                if (!e.target.closest('.profile-button')) {
                    dropdown.classList.remove('show');
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }, 0);
    }
}

function updateUserProfile() {
    const userEmail = document.getElementById('user-email');
    if (userEmail) {
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user && user.email) {
            userEmail.textContent = user.email;
        } else {
            userEmail.textContent = 'Entrar';
        }
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    updateUserProfile();
    window.location.href = 'index.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createElegantHeader();
    updateUserProfile();
});
