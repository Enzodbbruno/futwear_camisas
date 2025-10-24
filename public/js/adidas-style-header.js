// Adidas Style Header Component
class AdidasStyleHeader {
    constructor() {
        this.createHeader();
        this.setupEventListeners();
        this.updateCounters();
        this.updateUserProfile();
    }

    createHeader() {
        // Remove existing headers
        document.querySelectorAll('header, .header, .modern-header, .basic-header, .header-top, .futwear-header, .header-top-bar, .header-main, .promo-banner').forEach(el => el.remove());
        
        const headerHTML = `
            <!-- Main Header -->
            <header class="header-main">
                <div class="header-main-container">
                    <!-- Logo Section -->
                    <a href="index.html" class="header-logo">
                        <div class="logo-icon"></div>
                        <span class="logo-text">FUTWEAR</span>
                    </a>

                    <!-- Navigation Center -->
                    <nav class="header-nav">
                        <a href="camisas.html?category=times-brasileiros" class="nav-link">Times BR</a>
                        <a href="camisas.html?category=times-europeus" class="nav-link">Times EU</a>
                        <a href="camisas.html?category=selecoes" class="nav-link">Seleções</a>
                        <a href="camisas.html?category=retro" class="nav-link">Retrô</a>
                    </nav>

                    <!-- Right Actions -->
                    <div class="header-actions">
                        <!-- Search Bar -->
                        <div class="search-container">
                            <input type="text" class="search-input" placeholder="Procurar" id="searchInput">
                            <button class="search-btn" onclick="adidasHeader.performSearch()">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>

                        <!-- Action Icons -->
                        <div class="action-icons">
                            <!-- Profile Icon -->
                            <button class="action-icon profile-button" onclick="adidasHeader.toggleProfile()" id="profileIcon">
                                <i class="fas fa-user"></i>
                                <span class="profile-email" id="profile-email">Entrar</span>
                            </button>

                            <!-- Favorites Icon -->
                            <a href="#" class="action-icon" onclick="adidasHeader.toggleFavorites(event)">
                                <i class="fas fa-heart"></i>
                                <span class="badge" id="favorites-count">0</span>
                            </a>

                            <!-- Cart Icon -->
                            <a href="carrinho.html" class="action-icon">
                                <i class="fas fa-shopping-bag"></i>
                                <span class="badge" id="cart-count">0</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Promo Banner -->
            <div class="promo-banner">
                <div class="promo-banner-content">
                    <span class="promo-text">UMA EXPERIÊNCIA PERSONALIZADA TE ESPERA. FAÇA LOGIN PARA DESCOBRI-LA.</span>
                    <span class="promo-arrow">→</span>
                </div>
            </div>
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

        // Update counters when storage changes
        window.addEventListener('storage', () => {
            this.updateCounters();
            this.updateUserProfile();
        });

        // Update counters when favorites change via custom event
        window.addEventListener('favoritesUpdated', () => {
            this.updateCounters();
        });

        // Update counters immediately when cart changes (same-tab)
        window.addEventListener('cartUpdated', () => {
            this.updateCounters();
        });

        // Listen for custom events (when user logs in/out)
        window.addEventListener('userLogin', () => {
            console.log('Evento de login detectado, atualizando perfil');
            this.updateUserProfile();
        });

        window.addEventListener('userLogout', () => {
            console.log('Evento de logout detectado, atualizando perfil');
            this.updateUserProfile();
        });

        // Verificar login a cada 2 segundos para garantir sincronização
        setInterval(() => {
            this.updateUserProfile();
        }, 2000);
    }

    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            alert('Digite pelo menos 2 caracteres para buscar');
            return;
        }
        
        window.location.href = `camisas.html?search=${encodeURIComponent(query)}`;
    }

    toggleProfile() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const userEmail = localStorage.getItem('userEmail');
        
        console.log('=== DEBUG PROFILE BUTTON ===');
        console.log('user:', user);
        console.log('isAuthenticated:', isAuthenticated);
        console.log('userEmail:', userEmail);
        console.log('user && user.email:', user && user.email);
        console.log('===========================');
        
        if (user && user.email && isAuthenticated) {
            // User is logged in, redirect to profile
            console.log('✅ Usuário logado, redirecionando para perfil:', user.email);
            window.location.href = 'perfil.html';
        } else {
            // User is not logged in, redirect to login
            console.log('❌ Usuário não logado, redirecionando para login');
            window.location.href = 'login.html';
        }
    }

    toggleFavorites(event) {
        event.preventDefault();
        // Redireciona para a página de favoritos, padronizando navegação
        window.location.href = 'favoritos.html';
    }

    showFavoritesModal(wishlist) {
        const modalHTML = `
            <div id="favoritesModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;">
                <div style="background: white; border-radius: 20px; padding: 30px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: #000; font-size: 1.5rem;">Meus Favoritos</h3>
                        <button onclick="adidasHeader.closeFavoritesModal()" style="background: none; border: none; font-size: 1.5rem; color: #666; cursor: pointer;">&times;</button>
                    </div>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${wishlist.map(item => `
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #e5e5e5; border-radius: 10px; margin-bottom: 10px;">
                                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                                <div style="flex: 1;">
                                    <h4 style="color: #000; margin: 0 0 5px 0; font-size: 1rem;">${item.name}</h4>
                                    <p style="color: #666; margin: 0; font-size: 0.9rem;">${item.team || ''}</p>
                                    <p style="color: #10b981; margin: 5px 0 0 0; font-weight: bold;">R$ ${Number(item.price || 0).toFixed(2).replace('.', ',')}</p>
                                </div>
                                <button onclick="adidasHeader.removeFromFavorites('${item.id}')" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
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
            let favoritesCount = 0;
            if (typeof window.getFavoritesCount === 'function') {
                favoritesCount = window.getFavoritesCount();
            } else {
                // Fallback para storage moderno usado pelo sistema de favoritos
                const stored = localStorage.getItem('futwear_favorites');
                favoritesCount = stored ? (JSON.parse(stored).length || 0) : 0;
            }
            const favoritesCountElement = document.getElementById('favorites-count');
            if (favoritesCountElement) {
                favoritesCountElement.textContent = favoritesCount;
                favoritesCountElement.style.display = favoritesCount > 0 ? 'flex' : 'none';
                favoritesCountElement.setAttribute('aria-label', `Favoritos: ${favoritesCount}`);
                favoritesCountElement.setAttribute('title', `Favoritos: ${favoritesCount}`);
            }
        } catch (e) {
            console.error('Error updating favorites count:', e);
        }
    }

    updateUserProfile() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const profileEmail = document.getElementById('profile-email');
        const profileIcon = document.getElementById('profileIcon');
        
        console.log('=== UPDATE USER PROFILE ===');
        console.log('user:', user);
        console.log('isAuthenticated:', isAuthenticated);
        console.log('profileEmail:', profileEmail);
        console.log('profileIcon:', profileIcon);
        console.log('===========================');
        
        if (profileEmail) {
            if (user && user.email && isAuthenticated) {
                // Mostrar email do usuário
                profileEmail.textContent = user.email;
                profileEmail.style.color = '#10b981'; // Verde para indicar login
                // Adicionar indicador visual de que está logado
                if (profileIcon) {
                    profileIcon.style.color = '#10b981'; // Verde para indicar login
                }
                console.log('✅ Perfil atualizado: USUÁRIO LOGADO -', user.email);
            } else {
                // Mostrar "Entrar" quando não logado
                profileEmail.textContent = 'Entrar';
                profileEmail.style.color = '#000000'; // Preto para não logado
                if (profileIcon) {
                    profileIcon.style.color = '#000000'; // Preto para não logado
                }
                console.log('❌ Perfil atualizado: USUÁRIO NÃO LOGADO');
            }
        }
    }
}

// Initialize header
let adidasHeader;
document.addEventListener('DOMContentLoaded', () => {
    adidasHeader = new AdidasStyleHeader();
});

// Make header globally accessible
window.adidasHeader = adidasHeader;
