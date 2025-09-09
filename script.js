document.addEventListener('DOMContentLoaded', () => {
    const imageUrl = 'https://ca.slack-edge.com/T03GLB4LV-U03NPQTHC-c5b87dcf6094-512';
    const newImageUrl = 'https://ca.slack-edge.com/T03GLB4LV-U74F6J70Q-a5b4f692ea38-512';
    const newImage1 = 'https://ca.slack-edge.com/T03GLB4LV-UGML4HJBY-7838396a8c69-512';
    const newImage3 = 'https://ca.slack-edge.com/T03GLB4LV-U063ATELT5Y-a16f9e43bf03-512';
    const newImage4 = 'https://ca.slack-edge.com/T03GLB4LV-UQ0BWAYBH-0a572039a796-512';
    const newImage5 = 'https://ca.slack-edge.com/T03GLB4LV-U04J4C0HFL7-b9b59d60d3b9-512';
    const image_99204 = 'https://ca.slack-edge.com/T03GLB4LV-U03Q4MS9M-c4bf09b99204-512'; // This is the one to keep

    const symbols = [newImage1, newImage3, newImage4, imageUrl, newImageUrl, newImage5, image_99204];

    const reelStrips = document.querySelectorAll('.reel-strip');
    const startButton = document.getElementById('start-button');
    const stopButtonsContainer = document.getElementById('stop-buttons-container');
    const stopButtons = document.querySelectorAll('.stop-button');
    const resultDiv = document.getElementById('result');
    const hibiscusElements = document.querySelectorAll('.hibiscus');

    const REEL_ITEM_HEIGHT = 100;
    const SYMBOL_COUNT = symbols.length;
    const SPIN_SPEED = 25; // Higher is faster

    let reels = [];
    let spinCount = 0;
    let winningSymbol = null;
    let gameRunning = false;

    // --- Initialization ---
    function initializeGame() {
        startButton.disabled = false;
        startButton.textContent = 'スタート';

        reelStrips.forEach((strip, i) => {
            const symbolSet = [...symbols, ...symbols, ...symbols];
            symbolSet.forEach(symbol => strip.appendChild(createSymbolElement(symbol)));
            strip.style.top = `-${SYMBOL_COUNT * REEL_ITEM_HEIGHT}px`;

            reels[i] = {
                strip: strip,
                position: parseFloat(strip.style.top),
                isSpinning: false,
                stopRequest: false,
                finalSymbol: null
            };
        });

        startButton.addEventListener('click', startGame);
        stopButtons.forEach(button => button.addEventListener('click', requestStopReel));
        
        requestAnimationFrame(gameLoop);
    }

    // Removed preloadImages function

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

    // --- Game Flow ---
    function startGame() {
        spinCount++;
        gameRunning = true;
        resultDiv.textContent = '';
        winningSymbol = null;
        hibiscusElements.forEach(h => h.classList.remove('glowing'));

        reels.forEach((reel, i) => {
            reel.isSpinning = true;
            reel.stopRequest = false;
            stopButtons[i].disabled = false;
        });

        startButton.classList.add('hidden');
        stopButtonsContainer.classList.remove('hidden');
    }

    function requestStopReel(event) {
        const reelIndex = parseInt(event.target.dataset.reel, 10);
        if (reels[reelIndex].stopRequest || !reels[reelIndex].isSpinning) return;

        reels[reelIndex].stopRequest = true;
        stopButtons[reelIndex].disabled = true; // Disable the button immediately
    }

    function checkAllReelsStopped() {
        const allStopped = reels.every(reel => !reel.isSpinning);
        if (allStopped && gameRunning) {
            gameRunning = false;
            checkWin();
            startButton.classList.remove('hidden');
            stopButtonsContainer.classList.add('hidden');
        }
    }

    function checkWin() {
        const r1 = reels[0].finalSymbol;
        const r2 = reels[1].finalSymbol;
        const r3 = reels[2].finalSymbol;

        if (r1 && r1 === r2 && r2 === r3) {
            resultDiv.textContent = '🎉 大当たり! 🎉';
            hibiscusElements.forEach(h => h.classList.add('glowing'));
        } else {
            resultDiv.textContent = '残念...';
        }
    }

    // --- Animation Loop ---
    function gameLoop() {
        reels.forEach((reel) => {
            if (reel.isSpinning) {
                if (reel.stopRequest) {
                    // --- Stop Logic ---
                    // Set isSpinning to false IMMEDIATELY to prevent continuous spin
                    // and to prevent animateTo from being called repeatedly.
                    reel.isSpinning = false; // CRITICAL FIX

                    let targetSymbolIndex;
                    // Probabilistic win: 20% chance
                    const shouldWin = Math.random() < 0.2;

                    if (shouldWin) {
                        if (winningSymbol === null) winningSymbol = symbols[Math.floor(Math.random() * SYMBOL_COUNT)];
                        targetSymbolIndex = symbols.indexOf(winningSymbol);
                    } else {
                        targetSymbolIndex = Math.floor(Math.random() * SYMBOL_COUNT);
                    }
                    reel.finalSymbol = symbols[targetSymbolIndex];

                    const singleSetHeight = SYMBOL_COUNT * REEL_ITEM_HEIGHT;
                    const currentPosInSet = reel.position % singleSetHeight;
                    const targetPosInSet = -targetSymbolIndex * REEL_ITEM_HEIGHT;

                    let distance = (currentPosInSet - targetPosInSet + singleSetHeight) % singleSetHeight;
                    if (distance < REEL_ITEM_HEIGHT) distance += singleSetHeight;

                    const finalPosition = reel.position - distance;

                    animateTo(reel, finalPosition, 500, () => {
                        reel.stopRequest = false; // Reset the flag
                        checkAllReelsStopped();
                    });

                } else {
                    // --- Continue Spinning Logic ---
                    reel.position -= SPIN_SPEED;
                    const stripHeight = SYMBOL_COUNT * REEL_ITEM_HEIGHT;
                    if (reel.position < -stripHeight * 2) {
                        reel.position += stripHeight;
                    }
                }
            }
            reel.strip.style.top = `${reel.position}px`;
        });

        requestAnimationFrame(gameLoop);
    }

    function animateTo(reel, targetPosition, duration, callback) {
        const startPosition = reel.position;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out

            reel.position = startPosition + (targetPosition - startPosition) * easedProgress;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                reel.position = targetPosition;
                callback();
            }
        }
        requestAnimationFrame(step);
    }

    // Direct call to initializeGame, no preloader
    initializeGame();
});
