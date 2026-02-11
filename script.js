
document.addEventListener('DOMContentLoaded', () => {
    const counterDisplay = document.getElementById('counter');
    const increaseBtn = document.getElementById('increaseBtn');

    let count = 0;

    increaseBtn.addEventListener('click', () => {
        count++;
        counterDisplay.textContent = count;
        
        // Add a small animation effect on click
        counterDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            counterDisplay.style.transform = 'scale(1)';
        }, 100);
    });
    
    // Initialize transition for the animation
    counterDisplay.style.transition = 'transform 0.1s ease';
});
