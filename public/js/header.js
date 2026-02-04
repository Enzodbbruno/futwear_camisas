document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Logic
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }

  // Highlight Active Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Profile Button Logic
  const profileBtn = document.getElementById('profile-btn') || document.querySelector('a[href="perfil.html"]');
  if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        window.location.href = 'perfil.html';
      } else {
        window.location.href = 'login.html';
      }
    });

    // Update styling if logged in (optional, e.g. change icon)
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      // Maybe add a small dot or change icon color to indicate logged in
      profileBtn.classList.add('text-green-500');
    }
  }

  // Initialize Counters
  updateCartCount();
  updateWishlistCount();

  // Listen for events
  window.addEventListener('storage', () => {
    updateCartCount();
    updateWishlistCount();
  });

  window.addEventListener('cartUpdated', updateCartCount);
  window.addEventListener('favoritesUpdated', updateWishlistCount);
  window.addEventListener('userLogin', () => {
    if (profileBtn) profileBtn.classList.add('text-green-500');
  });
  window.addEventListener('userLogout', () => {
    if (profileBtn) profileBtn.classList.remove('text-green-500');
  });
});

window.toggleSearch = function () {
  const searchBar = document.querySelector('.search-bar-container');
  if (searchBar) {
    if (window.innerWidth < 1024) { // Mobile/Tablet
      searchBar.classList.toggle('show-mobile');
      if (searchBar.classList.contains('show-mobile')) {
        const input = searchBar.querySelector('input');
        if (input) setTimeout(() => input.focus(), 100);
      }
    } else {
      const input = searchBar.querySelector('input');
      if (input) input.focus();
    }
  }
};

function updateCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const badges = document.querySelectorAll('#cart-count, .cart-count');

    badges.forEach(badge => {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    });
  } catch (e) {
    console.error('Error updating cart count:', e);
  }
}

function updateWishlistCount() {
  try {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const count = favorites.length;
    const badges = document.querySelectorAll('#wishlist-count, .wishlist-count');

    badges.forEach(badge => {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    });
  } catch (e) {
    console.error('Error updating wishlist count:', e);
  }
}
