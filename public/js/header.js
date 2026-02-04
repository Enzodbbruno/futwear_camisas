document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Logic
  const mobileToggle = document.querySelector('.mobile-toggle');
  // We would need a mobile menu container to toggle. 
  // For now, let's assume we might implement a simple dropdown or sidebar later.

  // Highlight Active Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    }
  });

  // Cart Badge Update (Mock)
  updateCartCount();
});

window.toggleSearch = function () {
  const searchBar = document.querySelector('.search-bar-container');
  if (searchBar) {
    if (window.innerWidth < 768) {
      // Special mobile behavior
      if (searchBar.style.display === 'flex') {
        searchBar.style.display = '';
      } else {
        searchBar.style.display = 'flex';
        searchBar.style.position = 'absolute';
        searchBar.style.top = '100%';
        searchBar.style.left = '0';
        searchBar.style.width = '100%';
        searchBar.style.padding = '1rem';
        searchBar.style.background = 'white';
        searchBar.style.zIndex = '999';
        searchBar.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }
    } else {
      searchBar.querySelector('input').focus();
    }
  }
};

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}
