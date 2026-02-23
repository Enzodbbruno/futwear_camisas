// ============================================
// NIKE-INSPIRED JAVASCRIPT FOR FUTWEAR
// ============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // MOBILE MENU
    // ============================================
    
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close mobile menu when clicking a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close mobile menu when clicking outside
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================
    
    const searchToggle = document.getElementById('searchToggle');
    const searchBox = document.getElementById('searchBox');
    const searchClose = document.getElementById('searchClose');
    const searchInput = searchBox?.querySelector('.search-input');
    
    if (searchToggle) {
        searchToggle.addEventListener('click', function() {
            searchBox.classList.add('active');
            setTimeout(() => searchInput?.focus(), 100);
        });
    }
    
    if (searchClose) {
        searchClose.addEventListener('click', function() {
            searchBox.classList.remove('active');
            if (searchInput) searchInput.value = '';
        });
    }
    
    // Close search when clicking outside
    document.addEventListener('click', function(e) {
        if (searchBox && !searchBox.contains(e.target) && !searchToggle.contains(e.target)) {
            searchBox.classList.remove('active');
        }
    });
    
    // ============================================
    // CAROUSEL FUNCTIONALITY
    // ============================================
    
    function initCarousel(carouselId) {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;
        
        const track = carousel.querySelector('.carousel-track');
        const prevBtn = document.querySelector(`[data-carousel="${carouselId}"].prev`);
        const nextBtn = document.querySelector(`[data-carousel="${carouselId}"].next`);
        
        if (!track || !prevBtn || !nextBtn) return;
        
        const scrollAmount = track.offsetWidth * 0.8;
        
        prevBtn.addEventListener('click', function() {
            track.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });
        
        nextBtn.addEventListener('click', function() {
            track.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
        
        // Update button states
        function updateButtons() {
            const scrollLeft = track.scrollLeft;
            const maxScroll = track.scrollWidth - track.clientWidth;
            
            prevBtn.disabled = scrollLeft <= 0;
            nextBtn.disabled = scrollLeft >= maxScroll - 10;
        }
        
        track.addEventListener('scroll', updateButtons);
        updateButtons();
    }
    
    // Initialize all carousels
    initCarousel('featured');
    
    // ============================================
    // WISHLIST FUNCTIONALITY
    // ============================================
    
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    
    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            this.classList.toggle('active');
            
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
            
            // Update wishlist count (you can implement actual storage here)
            updateWishlistCount();
        });
    });
    
    function updateWishlistCount() {
        const activeWishlists = document.querySelectorAll('.wishlist-btn.active').length;
        const badge = document.querySelector('.icon-btn .badge');
        
        if (badge && activeWishlists > 0) {
            badge.textContent = activeWishlists;
            badge.classList.remove('hidden');
        } else if (badge) {
            badge.classList.add('hidden');
        }
    }
    
    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================
    
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
    
    // ============================================
    // LAZY LOADING IMAGES
    // ============================================
    
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // ============================================
    // PRODUCT CARD ANIMATIONS
    // ============================================
    
    const productCards = document.querySelectorAll('.product-card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    productCards.forEach(card => cardObserver.observe(card));
    
    // ============================================
    // CART FUNCTIONALITY (BASIC)
    // ============================================
    
    let cartCount = 0;
    
    function updateCartCount() {
        const cartBadge = document.querySelector('.icon-btn .badge');
        if (cartBadge) {
            cartBadge.textContent = cartCount;
            if (cartCount > 0) {
                cartBadge.classList.remove('hidden');
            } else {
                cartBadge.classList.add('hidden');
            }
        }
    }
    
    // Add to cart functionality (you can attach this to buttons)
    window.addToCart = function() {
        cartCount++;
        updateCartCount();
        
        // Show a simple notification (you can enhance this)
        console.log('Item added to cart!');
    };
    
    // Initialize cart count
    updateCartCount();
    
    // ============================================
    // TOUCH SWIPE FOR CAROUSELS (MOBILE)
    // ============================================
    
    const carouselTracks = document.querySelectorAll('.carousel-track');
    
    carouselTracks.forEach(track => {
        let startX = 0;
        let scrollLeft = 0;
        let isDown = false;
        
        track.addEventListener('mousedown', (e) => {
            isDown = true;
            track.style.cursor = 'grabbing';
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });
        
        track.addEventListener('mouseleave', () => {
            isDown = false;
            track.style.cursor = 'grab';
        });
        
        track.addEventListener('mouseup', () => {
            isDown = false;
            track.style.cursor = 'grab';
        });
        
        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 2;
            track.scrollLeft = scrollLeft - walk;
        });
    });
    
    // ============================================
    // CONSOLE MESSAGE
    // ============================================
    
    console.log('%c🏆 FutWear - Nike-Inspired Design', 'font-size: 20px; font-weight: bold; color: #16a34a;');
    console.log('%cDesign System: Modern, Clean, Premium', 'font-size: 14px; color: #666;');
    
});
