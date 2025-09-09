document.addEventListener('DOMContentLoaded', () => {
    const imageUrl = 'https://ca.slack-edge.com/T03GLB4LV-U03NPQTHC-c5b87dcf6094-512';
    const newImageUrl = 'https://ca.slack-edge.com/T03GLB4LV-U74F6J70Q-a5b4f692ea38-512';
    const symbols = ['🍒', '🍋', '🔔', '💎', '🍇', '🍉', imageUrl, newImageUrl];

    const reelStrips = document.querySelectorAll('.reel-strip');
    const spinButton = document.getElementById('spin-button');
    const resultDiv = document.getElementById('result');
    const hibiscusElements = document.querySelectorAll('.hibiscus');

    const REEL_ITEM_HEIGHT = 100;
    const SYMBOL_COUNT = symbols.length;
    const REPEATED_SETS = 5;

    let isSpinning = false;
    let finalSymbols = [];
    let currentYOffsets = [0, 0, 0];

    function preloadImages(urls, allImagesLoadedCallback) {
        let loadedCounter = 0;
        let toBeLoadedNumber = urls.length;
        spinButton.textContent = '画像を読込中...';

        urls.forEach(url => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                loadedCounter++;
                if (loadedCounter === toBeLoadedNumber) allImagesLoadedCallback();
            };
            img.onerror = () => {
                console.error("Failed to load image:", url);
                loadedCounter++;
                if (loadedCounter === toBeLoadedNumber) allImagesLoadedCallback();
            };
        });
    }

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

    function initializeGame() {
        spinButton.disabled = false;
        spinButton.textContent = 'スピン';

        reelStrips.forEach(strip => {
            for (let i = 0; i < REPEATED_SETS; i++) {
                symbols.forEach(symbol => {
                    strip.appendChild(createSymbolElement(symbol));
                });
            }
        });

        spinButton.addEventListener('click', () => {
            if (isSpinning) return;
            isSpinning = true;
            finalSymbols = [];
            resultDiv.textContent = '';
            hibiscusElements.forEach(h => h.classList.remove('glowing'));

            let longestDuration = 0;

            reelStrips.forEach((strip, index) => {
                const targetSymbolIndex = Math.floor(Math.random() * SYMBOL_COUNT);
                finalSymbols[index] = symbols[targetSymbolIndex];

                const stripHeight = SYMBOL_COUNT * REEL_ITEM_HEIGHT;
                // TEST: Make all reels have the same rotation distance
                const rotations = 3;
                const rotationDistance = rotations * stripHeight;
                const targetPosition = targetSymbolIndex * REEL_ITEM_HEIGHT;
                const newTargetY = currentYOffsets[index] - rotationDistance - targetPosition;

                // TEST: Make all reels have the same duration
                const spinDuration = 3;
                longestDuration = Math.max(longestDuration, spinDuration);

                strip.style.transition = `transform ${spinDuration}s cubic-bezier(0.33, 1, 0.68, 1)`;
                strip.style.transform = `translateY(${newTargetY}px)`;
                currentYOffsets[index] = newTargetY;
            });

            setTimeout(() => {
                isSpinning = false;
                checkWin();

                reelStrips.forEach((s, i) => {
                    const h = SYMBOL_COUNT * REEL_ITEM_HEIGHT;
                    const eY = currentYOffsets[i] % h;
                    s.style.transition = 'none';
                    s.style.transform = `translateY(${eY}px)`;
                    void s.offsetWidth;
                    currentYOffsets[i] = eY;
                });
            }, longestDuration * 1000);
        });

        function checkWin() {
            const [r1, r2, r3] = finalSymbols;
            if (r1 && r1 === r2 && r2 === r3) {
                resultDiv.textContent = '🎉 大当たり! 🎉';
                hibiscusElements.forEach(h => h.classList.add('glowing'));
            } else {
                resultDiv.textContent = '残念...';
            }
        }
    }

    const imageUrls = symbols.filter(s => s.startsWith('http'));
    if (imageUrls.length > 0) {
        preloadImages(imageUrls, initializeGame);
    } else {
        initializeGame();
    }
});
