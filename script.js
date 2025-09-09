document.addEventListener('DOMContentLoaded', () => {
    const imageUrl = 'https://ca.slack-edge.com/T03GLB4LV-U03NPQTHC-c5b87dcf6094-512';
    const newImageUrl = 'https://ca.slack-edge.com/T03GLB4LV-U74F6J70Q-a5b4f692ea38-512';
    const symbols = ['🍒', '🍋', '🔔', '💎', '🍇', '🍉', imageUrl, newImageUrl];

    const reelStrips = document.querySelectorAll('.reel-strip');
    const spinButton = document.getElementById('spin-button');
    const resultDiv = document.getElementById('result');
    const hibiscusElements = document.querySelectorAll('.hibiscus');

    const REEL_ITEM_HEIGHT = 100; // Must match .reel-item height in CSS
    const SYMBOLS_PER_REEL = 30;

    let isSpinning = false;
    let finalResults = [];

    function createSymbolElement(symbol) {
        const reelItem = document.createElement('div');
        reelItem.classList.add('reel-item');
        if (symbol.startsWith('http')) {
            const img = document.createElement('img');
            img.src = symbol;
            reelItem.appendChild(img);
        } else {
            reelItem.textContent = symbol;
        }
        return reelItem;
    }

    reelStrips.forEach(strip => {
        strip.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < SYMBOLS_PER_REEL; i++) {
            const symbolIndex = Math.floor(Math.random() * symbols.length);
            fragment.appendChild(createSymbolElement(symbols[symbolIndex]));
        }
        strip.appendChild(fragment);
    });

    spinButton.addEventListener('click', () => {
        if (isSpinning) return;
        isSpinning = true;
        resultDiv.textContent = '';
        finalResults = [];
        hibiscusElements.forEach(h => h.classList.remove('glowing'));

        reelStrips.forEach((strip, index) => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            finalResults.push(randomSymbol);

            // For reverse spin, put the target symbol at the top
            const newFirstChild = createSymbolElement(randomSymbol);
            strip.insertBefore(newFirstChild, strip.firstChild);

            const totalHeight = strip.scrollHeight;
            const initialPosition = -(totalHeight - REEL_ITEM_HEIGHT);

            strip.style.setProperty('--initial-position', `${initialPosition}px`);
            strip.style.setProperty('--spin-duration', `${2 + index * 0.5}s`);

            strip.classList.remove('spinning');
            void strip.offsetWidth;
            strip.classList.add('spinning');
        });
    });

    reelStrips[reelStrips.length - 1].addEventListener('animationend', () => {
        isSpinning = false;
        checkWin();

        // Reset reel strips to original state to prevent them from growing infinitely
        reelStrips.forEach(strip => {
            strip.removeChild(strip.firstChild);
            strip.classList.remove('spinning');
            strip.style.transform = `translateY(0)`;
        });
    });

    function checkWin() {
        const [r1, r2, r3] = finalResults;
        if (r1 === r2 && r2 === r3) {
            resultDiv.textContent = '🎉 大当たり! 🎉';
            hibiscusElements.forEach(h => h.classList.add('glowing'));
        } else {
            resultDiv.textContent = '残念...';
        }
    }
});
