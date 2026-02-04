document.addEventListener('DOMContentLoaded', () => {
    // Event Delegation for 3D Tilt on dynamically loaded cards
    document.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.product-card-enhanced');
        if (!card) return;

        // Reset others if needed, but mousemove implies hover on this one
        tiltCard(e, card);
    });

    document.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.product-card-enhanced');
        if (!card) return;

        // Only reset if actually leaving the card
        if (!card.contains(e.relatedTarget)) {
            resetCard(card);
        }
    });

    function tiltCard(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (max 15 degrees)
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        // Apply transform
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

        // Glare effect logic (if we added a glare element)
        // Add glare overlay dynamically if not exists
        let glare = card.querySelector('.glare-effect');
        if (!glare) {
            glare = document.createElement('div');
            glare.className = 'glare-effect';
            glare.style.borderRadius = getComputedStyle(card).borderRadius;
            card.appendChild(glare);
        }

        glare.style.opacity = '1';
        glare.style.transform = `translate(${x}px, ${y}px)`; // Or just static gradient
        // Actually, let's keep glare simple: 
        // We'll move the background position of glare or just use opacity
    }

    function resetCard(card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        const glare = card.querySelector('.glare-effect');
        if (glare) {
            glare.style.opacity = '0';
        }
    }
});
