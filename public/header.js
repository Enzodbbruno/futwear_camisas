/**
 * header.js — FutWear Shared Header Logic
 * Manages: cart badge, favorites badge, auth state, search overlay
 * Include via:  <script src="header.js"></script>  (plain script, no module)
 */

// ─── Cart Badge ────────────────────────────────────────────────────────────
function getCartCount() {
    try {
        var cart = JSON.parse(localStorage.getItem('cart') || '[]');
        return cart.reduce(function (s, i) { return s + (Number(i.quantity) || 1); }, 0);
    } catch (e) { return 0; }
}

function getFavoritesCount() {
    try {
        var favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favs.length;
    } catch (e) { return 0; }
}

function updateAllBadges() {
    var cartCount = getCartCount();
    var favCount = getFavoritesCount();

    document.querySelectorAll('#cartBadge, .cart-badge').forEach(function (el) {
        el.textContent = cartCount;
        el.style.display = cartCount > 0 ? 'flex' : 'none';
    });

    document.querySelectorAll('#wishlistBadge, .wishlist-badge').forEach(function (el) {
        el.textContent = favCount;
        el.style.display = favCount > 0 ? 'flex' : 'none';
    });
}

// ─── Auth State ─────────────────────────────────────────────────────────────
function getUser() {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch (e) { return null; }
}

function renderAuthState() {
    var user = getUser();
    var profileLink = document.getElementById('profileLink');
    var authAvatar = document.getElementById('authAvatar');

    if (!profileLink && !authAvatar) return;

    if (user && (user.email || user.name)) {
        var initials = (user.name || user.email || 'U')
            .split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase();

        if (authAvatar) {
            authAvatar.innerHTML =
                '<span style="display:inline-flex;align-items:center;justify-content:center;' +
                'width:32px;height:32px;border-radius:50%;background:var(--color-primary);' +
                'color:#fff;font-size:12px;font-weight:700;letter-spacing:.5px;" ' +
                'title="' + (user.name || user.email) + '">' + initials + '</span>';
        }
        if (profileLink) profileLink.title = user.name || user.email;
    } else {
        if (authAvatar) authAvatar.innerHTML = '<i class="far fa-user"></i>';
    }
}

// ─── Search Bar (Full-screen overlay) ───────────────────────────────────────
function initSearch() {
    var toggle = document.getElementById('searchToggle');
    var box = document.getElementById('searchBox');
    var closeBtn = document.getElementById('searchClose');
    var input = document.getElementById('searchInput');

    if (!toggle || !box) return;

    function openSearch() {
        box.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (input) setTimeout(function () { input.focus(); }, 80);
    }

    function closeSearch() {
        box.classList.remove('active');
        document.body.style.overflow = '';
        if (input) input.value = '';
    }

    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        box.classList.contains('active') ? closeSearch() : openSearch();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSearch);

    // Click on dark backdrop (outside inner box) closes
    box.addEventListener('click', function (e) {
        if (e.target === box) closeSearch();
    });

    // Escape key closes
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && box.classList.contains('active')) closeSearch();
    });

    // Enter redirects to search results
    if (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                var q = input.value.trim();
                if (q) window.location.href = 'camisas.html?search=' + encodeURIComponent(q);
            }
        });
    }
}

// ─── Mobile Menu ────────────────────────────────────────────────────────────
function initMobileMenu() {
    var btn = document.getElementById('mobileMenuBtn');
    var menu = document.getElementById('mobileMenu');
    var close = document.getElementById('mobileMenuClose');

    if (btn) btn.addEventListener('click', function () { if (menu) menu.classList.add('active'); });
    if (close) close.addEventListener('click', function () { if (menu) menu.classList.remove('active'); });
    if (menu) menu.addEventListener('click', function (e) { if (e.target === menu) menu.classList.remove('active'); });
}

// ─── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    updateAllBadges();
    renderAuthState();
    initSearch();
    initMobileMenu();
});

// Listen to storage events (cross-tab updates)
window.addEventListener('storage', function (e) {
    if (e.key === 'cart' || e.key === 'favorites' || e.key === 'user') {
        updateAllBadges();
        renderAuthState();
    }
});

// Listen to custom events
window.addEventListener('cartUpdated', updateAllBadges);
window.addEventListener('favoritesUpdated', updateAllBadges);

// Expose globally so other scripts can call it
window.updateHeaderBadges = updateAllBadges;
window.updateCartCount = updateAllBadges;
window.getCartCount = getCartCount;
window.getFavoritesCount = getFavoritesCount;
