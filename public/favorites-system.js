// Sistema de Favoritos para FutWear
// Gerencia favoritos usando localStorage com sincronização entre abas

class FavoritesSystem {
    constructor() {
        this.storageKey = 'futwear_favorites';
        this.favorites = this.loadFavorites();
        this.listeners = [];
        
        // Escuta mudanças em outras abas
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.favorites = this.loadFavorites();
                this.notifyListeners();
            }
        });
        
        // Escuta eventos customizados
        window.addEventListener('favoritesUpdated', () => {
            this.favorites = this.loadFavorites();
            this.notifyListeners();
        });
    }
    
    // Carrega favoritos do localStorage
    loadFavorites() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Erro ao carregar favoritos:', error);
            return [];
        }
    }
    
    // Salva favoritos no localStorage
    saveFavorites() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
            // Atualiza UI imediatamente
            this.updateFavoritesIcon();
            this.notifyListeners();
            
            // Dispara evento para sincronizar entre abas com dados
            window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { count: this.getFavoritesCount(), favorites: this.getFavorites() } }));
        } catch (error) {
            console.error('Erro ao salvar favoritos:', error);
        }
    }
    
    // Adiciona produto aos favoritos
    addToFavorites(product) {
        if (!product || !product.id) {
            console.error('Produto inválido para favoritos:', product);
            return false;
        }
        
        const productIdStr = String(product.id);
        const exists = this.favorites.find(fav => String(fav.id) === productIdStr);
        if (exists) {
            console.log('Produto já está nos favoritos:', product.name);
            return false;
        }
        
        const favoriteItem = {
            id: productIdStr,
            name: product.name,
            price: product.price,
            image: product.image,
            team: product.team,
            league: product.league,
            category: product.category,
            addedAt: new Date().toISOString()
        };
        
        this.favorites.push(favoriteItem);
        this.saveFavorites();
        
        console.log('✅ Produto adicionado aos favoritos:', product.name);
        this.showToast('Produto adicionado aos favoritos!', 'success');
        
        return true;
    }
    
    // Remove produto dos favoritos
    removeFromFavorites(productId) {
        const productIdStr = String(productId);
        const index = this.favorites.findIndex(fav => String(fav.id) === productIdStr);
        if (index === -1) {
            console.log('Produto não encontrado nos favoritos:', productId);
            return false;
        }
        
        const removed = this.favorites.splice(index, 1)[0];
        this.saveFavorites();
        
        console.log('❌ Produto removido dos favoritos:', removed.name);
        this.showToast('Produto removido dos favoritos!', 'info');
        
        return true;
    }
    
    // Toggle favorito (adiciona se não existe, remove se existe)
    toggleFavorite(product) {
        if (!product || !product.id) {
            console.error('Produto inválido para toggle:', product);
            return false;
        }
        
        const productIdStr = String(product.id);
        const exists = this.favorites.find(fav => String(fav.id) === productIdStr);
        
        if (exists) {
            return this.removeFromFavorites(productIdStr);
        } else {
            return this.addToFavorites(product);
        }
    }
    
    // Verifica se produto está nos favoritos
    isFavorite(productId) {
        const productIdStr = String(productId);
        return this.favorites.some(fav => String(fav.id) === productIdStr);
    }
    
    // Retorna todos os favoritos
    getFavorites() {
        return [...this.favorites];
    }
    
    // Retorna quantidade de favoritos
    getFavoritesCount() {
        return this.favorites.length;
    }
    
    // Limpa todos os favoritos
    clearFavorites() {
        this.favorites = [];
        this.saveFavorites();
        console.log('🗑️ Todos os favoritos foram removidos');
        this.showToast('Todos os favoritos foram removidos!', 'info');
    }
    
    // Adiciona listener para mudanças
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    // Remove listener
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    
    // Notifica todos os listeners
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.favorites);
            } catch (error) {
                console.error('Erro em listener de favoritos:', error);
            }
        });
    }
    
    // Atualiza ícone de favoritos no header
    updateFavoritesIcon() {
        const count = this.getFavoritesCount();
        const icon = document.getElementById('wishlistCount');
        
        if (icon) {
            icon.textContent = count;
            // manter sempre visível para mostrar a contagem, inclusive 0
            icon.classList.remove('hidden');
            icon.setAttribute('aria-label', `Favoritos: ${count}`);
            icon.setAttribute('title', `Favoritos: ${count}`);
        }
        
        // Atualiza todos os botões de favorito na página
        document.querySelectorAll('[data-product-id]').forEach(button => {
            const productId = button.getAttribute('data-product-id');
            const isFav = this.isFavorite(productId);
            
            const heartIcon = button.querySelector('i');
            if (heartIcon) {
                if (isFav) {
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                    button.classList.add('text-red-500');
                } else {
                    heartIcon.classList.remove('fas');
                    heartIcon.classList.add('far');
                    button.classList.remove('text-red-500');
                }
            }
        });
    }
    
    // Mostra toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-20 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm shadow-lg transition-all duration-300`;
        toast.style.transform = 'translateX(120%)';
        toast.textContent = message;
        
        // Cores baseadas no tipo
        if (type === 'success') {
            toast.classList.add('bg-green-600');
        } else if (type === 'error') {
            toast.classList.add('bg-red-600');
        } else if (type === 'warning') {
            toast.classList.add('bg-yellow-600');
        } else {
            toast.classList.add('bg-blue-600');
        }
        
        document.body.appendChild(toast);
        
        // Anima entrada
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        // Remove após 3 segundos
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Instância global do sistema de favoritos
const favoritesSystem = new FavoritesSystem();

// Funções globais para compatibilidade
window.toggleFavorite = function(product) {
    return favoritesSystem.toggleFavorite(product);
};

window.isFavorite = function(productId) {
    return favoritesSystem.isFavorite(productId);
};

window.getFavorites = function() {
    return favoritesSystem.getFavorites();
};

window.getFavoritesCount = function() {
    return favoritesSystem.getFavoritesCount();
};

window.clearFavorites = function() {
    return favoritesSystem.clearFavorites();
};

// Atualiza ícones quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    favoritesSystem.updateFavoritesIcon();
});

// Atualiza ícones quando favoritos mudam
favoritesSystem.addListener(() => {
    favoritesSystem.updateFavoritesIcon();
});

console.log('❤️ Sistema de favoritos carregado');
