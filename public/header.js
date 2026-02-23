/**
 * header.js — FutWear Shared Header Logic
 * Manages: cart badge, favorites badge, auth state (logged in/out), search bar
 * Include via:  <script type="module" src="header.js"></script>
 */

// ─── Cart Badge ────────────────────────────────────────────────────────────
export function getCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        return cart.reduce((s, i) => s + (Number(i.quantity) || 1), 0);
    } catch { return 0; }
}

export function getFavoritesCount() {
    try {
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favs.length;
    } catch { return 0; }
}

function updateAllBadges() {
    const cartCount = getCartCount();
    const favCount = getFavoritesCount();

    // Cart badges — id="cartBadge" or class="cart-badge"
    document.querySelectorAll('#cartBadge, .cart-badge').forEach(el => {
        el.textContent = cartCount;
        el.style.display = cartCount > 0 ? 'flex' : 'none';
    });

    // Favorites badges — id="wishlistBadge" or class="wishlist-badge"
    document.querySelectorAll('#wishlistBadge, .wishlist-badge').forEach(el => {
        el.textContent = favCount;
        el.style.display = favCount > 0 ? 'flex' : 'none';
    });
}

// ─── Auth State ─────────────────────────────────────────────────────────────
function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch { return null; }
}

function renderAuthState() {
    const user = getUser();
    // Look for the profile link wrapper
    const profileLink = document.getElementById('profileLink');
    const authAvatar = document.getElementById('authAvatar');

    if (!profileLink && !authAvatar) return;

    if (user && (user.email || user.name)) {
        const initials = (user.name || user.email || 'U')
            .split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

        if (authAvatar) {
            authAvatar.innerHTML = `
        <span style="
          display:inline-flex; align-items:center; justify-content:center;
          width:32px; height:32px; border-radius:50%;
          background:var(--color-primary); color:#fff;
          font-size:12px; font-weight:700; letter-spacing:.5px;
        " title="${user.name || user.email}">${initials}</span>`;
        }

        if (profileLink) {
            profileLink.title = user.name || user.email;
        }
    } else {
        if (authAvatar) {
            authAvatar.innerHTML = `<i class="far fa-user"></i>`;
        }
    }
}

// ─── Search Bar ─────────────────────────────────────────────────────────────
function initSearch() {
    const toggle = document.getElementById('searchToggle');
    const box = document.getElementById('searchBox');
    const closeBtn = document.getElementById('searchClose');
    const input = document.getElementById('searchInput');

    if (!toggle || !box) return;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = box.classList.toggle('active');
        if (isOpen) { setTimeout(() => input?.focus(), 50); }
    });

    closeBtn?.addEventListener('click', () => {
        box.classList.remove('active');
        if (input) input.value = '';
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!box.contains(e.target) && e.target !== toggle) {
            box.classList.remove('active');
        }
    });

    // Search on Enter
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const q = input.value.trim();
            if (q) window.location.href = `camisas.html?search=${encodeURIComponent(q)}`;
        }
    });
}

// ─── Mobile Menu ────────────────────────────────────────────────────────────
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    const close = document.getElementById('mobileMenuClose');

    btn?.addEventListener('click', () => menu?.classList.add('active'));
    close?.addEventListener('click', () => menu?.classList.remove('active'));
    menu?.addEventListener('click', (e) => {
        if (e.target === menu) menu.classList.remove('active');
    });
}

// ─── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateAllBadges();
    renderAuthState();
    initSearch();
    initMobileMenu();
});

// Listen to storage events (cross-tab updates)
window.addEventListener('storage', (e) => {
    if (e.key === 'cart' || e.key === 'favorites' || e.key === 'user') {
        updateAllBadges();
        renderAuthState();
    }
});

// Listen to custom cart/favorites events
window.addEventListener('cartUpdated', updateAllBadges);
window.addEventListener('favoritesUpdated', updateAllBadges);

// Expose globally so other scripts can call it
window.updateHeaderBadges = updateAllBadges;
window.updateCartCount = updateAllBadges; // compatibility shim
