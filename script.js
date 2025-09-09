document.addEventListener('DOMContentLoaded', () => {
    const imageUrl = 'https://ca.slack-edge.com/T03GLB4LV-U03NPQTHC-c5b87dcf6094-512';
    const newImageUrl = 'https://ca.slack-edge.com/T03GLB4LV-U74F6J70Q-a5b4f692ea38-512';
    const symbols = ['🍒', '🍋', '🔔', '💎', '🍇', '🍉', imageUrl, newImageUrl];

    const reelStrips = document.querySelectorAll('.reel-strip');
    const spinButton = document.getElementById('spin-button');
    const resultDiv = document.getElementById('result');
    const reelContainer = document.querySelector('.reel-container');

    const REEL_ITEM_HEIGHT = 100; // Must match .reel-item height in CSS
    const SYMBOLS_PER_REEL = 30;

    let isSpinning = false;
    let finalResults = [];

    // Helper function to create a symbol element
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

    // Populate the reel strips with symbols
    reelStrips.forEach(strip => {
        strip.innerHTML = ''; // Clear existing
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < SYMBOLS_PER_REEL; i++) {
            const symbolIndex = Math.floor(Math.random() * symbols.length);
            const reelItem = createSymbolElement(symbols[symbolIndex]);
            fragment.appendChild(reelItem);
        }
        strip.appendChild(fragment);
    });

    spinButton.addEventListener('click', () => {
        if (isSpinning) return;
        isSpinning = true;
        resultDiv.textContent = '';
        finalResults = [];
        reelContainer.classList.remove('win-animation');

        reelStrips.forEach((strip, index) => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            finalResults.push(randomSymbol);

            // Replace the last symbol element with the one we want to land on
            strip.removeChild(strip.lastChild);
            strip.appendChild(createSymbolElement(randomSymbol));

            const totalHeight = strip.scrollHeight;
            const finalPosition = totalHeight - REEL_ITEM_HEIGHT;

            strip.style.setProperty('--final-position', `-${finalPosition}px`);
            strip.style.setProperty('--spin-duration', `${2 + index * 0.5}s`);

            strip.classList.remove('spinning');
            void strip.offsetWidth;
            strip.classList.add('spinning');
        });
    });

    reelStrips[reelStrips.length - 1].addEventListener('animationend', () => {
        isSpinning = false;
        checkWin();
    });

    function checkWin() {
        const [r1, r2, r3] = finalResults;
        if (r1 === r2 && r2 === r3) {
            // Check if the win is with an image or an emoji
            if (typeof r1 === 'string' && r1.startsWith('http')) {
                resultDiv.textContent = '🎊 JACKPOT!! 🎊';
                reelContainer.classList.add('win-animation'); // Golden glow for jackpot
            } else {
                resultDiv.textContent = '🎉 大当たり! 🎉';
                document.body.classList.add('emoji-win-animation'); // Flashing screen for emoji win
            }
        } else {
            resultDiv.textContent = '残念...';
        }
    }
});