// Modern Header Component
class ModernHeader {
    constructor() {
        this.init();
    }

    init() {
        this.createHeader();
        this.setupEventListeners();
        this.setupScrollEffects();
    }

    createHeader() {
        // Remove any existing headers first
        const existingHeaders = document.querySelectorAll('header, .header, .modern-header, nav');
        existingHeaders.forEach(header => header.remove());
        
        const headerHTML = `
            <header class="modern-header" id="modernHeader">
                <div class="header-container">
                    <!-- Logo -->
                    <a href="index.html" class="logo">
                        <div class="logo-icon">
                            <i class="fas fa-tshirt"></i>
                        </div>
                        <span class="logo-text">FUTWEAR</span>
                    </a>

                    <!-- Desktop Navigation -->
                    <nav class="nav-menu">
                        <a href="index.html" class="nav-link active">Início</a>
                        <a href="camisas.html" class="nav-link">Coleções</a>
                        <a href="camisas.html?category=clubs" class="nav-link">Times</a>
                        <a href="camisas.html?category=national" class="nav-link">Seleções</a>
                        <a href="#promocoes" class="nav-link">Promoções</a>
                        <a href="#sobre" class="nav-link">Sobre</a>
                    </nav>

                    <!-- Header Actions -->
                    <div class="header-actions">
                        <button class="action-btn" onclick="toggleSearch()" title="Buscar">
                            <i class="fas fa-search"></i>
                        </button>
                        <button class="action-btn" onclick="toggleWishlist()" title="Favoritos">
                            <i class="fas fa-heart"></i>
                        </button>
                        <a href="carrinho.html" class="action-btn cart-btn" title="Carrinho">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="badge" id="cart-count">0</span>
                        </a>
                        <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
                            <i class="fas fa-bars"></i>
                        </button>
                    </div>
                </div>

                <!-- Mobile Menu -->
                <div class="mobile-menu" id="mobileMenu">
                    <div class="mobile-menu-header">
                        <a href="index.html" class="logo">
                            <div class="logo-icon">
                                <i class="fas fa-tshirt"></i>
                            </div>
                            <span class="logo-text">FUTWEAR</span>
                        </a>
                        <button class="mobile-menu-close" onclick="toggleMobileMenu()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <nav class="mobile-nav">
                        <a href="index.html" class="mobile-nav-link">Início</a>
                        <a href="camisas.html" class="mobile-nav-link">Coleções</a>
                        <a href="camisas.html?category=clubs" class="mobile-nav-link">Times</a>
                        <a href="camisas.html?category=national" class="mobile-nav-link">Seleções</a>
                        <a href="#promocoes" class="mobile-nav-link">Promoções</a>
                        <a href="#sobre" class="mobile-nav-link">Sobre</a>
                    </nav>

                    <div class="mobile-actions">
                        <button class="action-btn" onclick="toggleSearch()">
                            <i class="fas fa-search"></i>
                        </button>
                        <button class="action-btn" onclick="toggleWishlist()">
                            <i class="fas fa-heart"></i>
                        </button>
                        <a href="carrinho.html" class="action-btn cart-btn">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="badge" id="mobile-cart-count">0</span>
                        </a>
                    </div>
                </div>
            </header>
        `;

        // Remove existing header if any
        const existingHeader = document.querySelector('header, .header, .modern-header');
        if (existingHeader) {
            existingHeader.remove();
        }

        // Insert new header at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    setupEventListeners() {
        // Mobile menu toggle
        window.toggleMobileMenu = () => {
            const mobileMenu = document.getElementById('mobileMenu');
            mobileMenu.classList.toggle('open');
        };

        // Search toggle
        window.toggleSearch = () => {
            const searchModal = document.getElementById('searchModal');
            if (searchModal) {
                searchModal.classList.toggle('hidden');
                if (!searchModal.classList.contains('hidden')) {
                    const searchInput = searchModal.querySelector('#searchInput');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }
            } else {
                this.createSearchModal();
            }
        };

        // Wishlist toggle
        window.toggleWishlist = () => {
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            if (wishlist.length === 0) {
                alert('Sua lista de favoritos está vazia!');
                return;
            }
            
            // Redirect to wishlist page or show modal
            if (window.location.pathname.includes('carrinho.html')) {
                // If on cart page, show wishlist in modal
                this.showWishlistModal(wishlist);
            } else {
                // Otherwise redirect to cart page with wishlist
                window.location.href = 'carrinho.html#wishlist';
            }
        };

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const mobileMenu = document.getElementById('mobileMenu');
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            
            if (mobileMenu && mobileMenu.classList.contains('open') && 
                !mobileMenu.contains(e.target) && 
                !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('open');
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const mobileMenu = document.getElementById('mobileMenu');
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.remove('open');
                }
            }
        });
    }

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        const header = document.getElementById('modernHeader');

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Add scrolled class when scrolling down
            if (currentScrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScrollY = currentScrollY;
        });
    }

    updateCartCount(count) {
        const cartCounts = document.querySelectorAll('#cart-count, #mobile-cart-count');
        cartCounts.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    setActiveLink(currentPage) {
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    createSearchModal() {
        const searchModalHTML = `
            <div id="searchModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Buscar Produtos</h3>
                        <button onclick="toggleSearch()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="relative">
                        <input type="text" id="searchInput" placeholder="Digite o nome do produto, time ou seleção..." 
                               class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <button class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div class="mt-4">
                        <button onclick="this.performSearch()" class="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors">
                            <i class="fas fa-search mr-2"></i>
                            Buscar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', searchModalHTML);
        
        // Add search functionality
        const searchInput = document.getElementById('searchInput');
        const searchModal = document.getElementById('searchModal');
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Close modal when clicking outside
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.add('hidden');
            }
        });
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
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are rendered
    setTimeout(() => {
        new ModernHeader();
    }, 100);
});

// Export for use in other scripts
window.ModernHeader = ModernHeader;
