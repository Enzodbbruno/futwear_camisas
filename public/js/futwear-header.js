// FutWear Header Component
class FutWearHeader {
    constructor() {
        this.createHeader();
        this.setupEventListeners();
        this.updateCounters();
        this.updateUserProfile();
        this.setupScrollEffect();
    }

    createHeader() {
        // Remove existing headers
        document.querySelectorAll('header, .header, .modern-header, .basic-header, .header-top, .futwear-header').forEach(el => el.remove());
        
        const headerHTML = `
            <header class="futwear-header">
                <div class="header-container">
                    <!-- Logo Section -->
                    <a href="index.html" class="header-logo">
                        <div class="logo-icon">
                            <i class="fas fa-tshirt"></i>
                        </div>
                        <span class="logo-text">FUTWEAR</span>
                    </a>

                    <!-- Navigation Center -->
                    <nav class="header-nav">
                        <a href="camisas.html?category=masculino" class="nav-link">Masculino</a>
                        <a href="camisas.html?category=feminino" class="nav-link">Feminino</a>
                    </nav>

                    <!-- Right Actions -->
                    <div class="header-actions">
                        <!-- Search Button -->
                        <button class="search-btn" onclick="futwearHeader.toggleSearch()">
                            <i class="fas fa-search"></i>
                            <span>Buscar</span>
                        </button>

                        <!-- Profile Button -->
                        <button class="profile-btn" onclick="futwearHeader.toggleProfile()">
                            <i class="fas fa-user"></i>
                            <span class="user-email" id="user-email">Entrar</span>
                        </button>

                        <!-- Favorites Button -->
                        <a href="#" class="action-btn" onclick="futwearHeader.toggleFavorites(event)">
                            <i class="fas fa-heart"></i>
                            <span class="badge" id="favorites-count">0</span>
                        </a>

                        <!-- Cart Button -->
                        <a href="carrinho.html" class="action-btn">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="badge" id="cart-count">0</span>
                        </a>
                    </div>
                </div>

                <!-- Search Modal -->
                <div class="search-modal" id="searchModal">
                    <div class="search-modal-content">
                        <h3 style="margin-bottom: 20px; color: #1a1a1a; font-size: 1.5rem;">Buscar Produtos</h3>
                        <input type="text" class="search-input" id="searchInput" placeholder="Digite o nome do produto, time ou jogador...">
                        <div style="margin-top: 20px; text-align: center;">
                            <button onclick="futwearHeader.performSearch()" style="background: var(--futwear-gradient); color: white; border: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    setupEventListeners() {
        // Search input enter key
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && document.getElementById('searchInput')) {
                this.performSearch();
            }
        });

        // Close search modal when clicking outside
        document.addEventListener('click', (e) => {
            const searchModal = document.getElementById('searchModal');
            if (searchModal && e.target === searchModal) {
                this.closeSearch();
            }
        });

        // Update counters when storage changes
        window.addEventListener('storage', () => {
            this.updateCounters();
            this.updateUserProfile();
        });

        // Listen for custom events (when user logs in/out)
        window.addEventListener('userLogin', () => {
            this.updateUserProfile();
        });

        window.addEventListener('userLogout', () => {
            this.updateUserProfile();
        });
    }

    setupScrollEffect() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.futwear-header');
            if (header) {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
        });
    }

    toggleSearch() {
        const searchModal = document.getElementById('searchModal');
        if (searchModal) {
            searchModal.classList.add('show');
            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 100);
        }
    }

    closeSearch() {
        const searchModal = document.getElementById('searchModal');
        if (searchModal) {
            searchModal.classList.remove('show');
        }
    }

    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            alert('Digite pelo menos 2 caracteres para buscar');
            return;
        }
        
        this.closeSearch();
        window.location.href = `camisas.html?search=${encodeURIComponent(query)}`;
    }

    toggleProfile() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (user && user.email) {
            // User is logged in, redirect to profile
            window.location.href = 'perfil.html';
        } else {
            // User is not logged in, redirect to login
            window.location.href = 'login.html';
        }
    }

    toggleFavorites(event) {
        event.preventDefault();
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        if (wishlist.length === 0) {
            alert('Sua lista de favoritos está vazia!');
            return;
        }
        
        // Show favorites modal or redirect to favorites page
        this.showFavoritesModal(wishlist);
    }

    showFavoritesModal(wishlist) {
        const modalHTML = `
            <div id="favoritesModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;">
                <div style="background: white; border-radius: 20px; padding: 30px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: #1a1a1a; font-size: 1.5rem;">Meus Favoritos</h3>
                        <button onclick="futwearHeader.closeFavoritesModal()" style="background: none; border: none; font-size: 1.5rem; color: #666; cursor: pointer;">&times;</button>
                    </div>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${wishlist.map(item => `
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 10px;">
                                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                                <div style="flex: 1;">
                                    <h4 style="color: #1a1a1a; margin: 0 0 5px 0; font-size: 1rem;">${item.name}</h4>
                                    <p style="color: #666; margin: 0; font-size: 0.9rem;">${item.team || ''}</p>
                                    <p style="color: var(--futwear-accent); margin: 5px 0 0 0; font-weight: bold;">R$ ${Number(item.price || 0).toFixed(2).replace('.', ',')}</p>
                                </div>
                                <button onclick="futwearHeader.removeFromFavorites('${item.id}')" style="background: var(--futwear-error); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closeFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        if (modal) {
            modal.remove();
        }
    }

    removeFromFavorites(itemId) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const updatedWishlist = wishlist.filter(item => item.id !== itemId);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        
        this.closeFavoritesModal();
        this.updateCounters();
        
        if (updatedWishlist.length > 0) {
            this.showFavoritesModal(updatedWishlist);
        } else {
            alert('Item removido dos favoritos!');
        }
    }

    updateCounters() {
        // Update cart counter
        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = cartCount;
                cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
            }
        } catch (e) {
            console.error('Error updating cart count:', e);
        }

        // Update favorites counter
        try {
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            const favoritesCount = wishlist.length;
            const favoritesCountElement = document.getElementById('favorites-count');
            if (favoritesCountElement) {
                favoritesCountElement.textContent = favoritesCount;
                favoritesCountElement.style.display = favoritesCount > 0 ? 'flex' : 'none';
            }
        } catch (e) {
            console.error('Error updating favorites count:', e);
        }
    }

    updateUserProfile() {
        const userEmailElement = document.getElementById('user-email');
        if (userEmailElement) {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (user && user.email) {
                userEmailElement.textContent = user.email;
                userEmailElement.style.color = '#10b981'; // Verde para usuário logado
            } else {
                userEmailElement.textContent = 'Entrar';
                userEmailElement.style.color = '#ffffff'; // Branco para não logado
            }
        }
    }

    // Método para atualizar perfil quando usuário faz login
    refreshUserProfile() {
        this.updateUserProfile();
    }
}

// Initialize header
let futwearHeader;
document.addEventListener('DOMContentLoaded', () => {
    futwearHeader = new FutWearHeader();
});

// Make header globally accessible
window.futwearHeader = futwearHeader;
