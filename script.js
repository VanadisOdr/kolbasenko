class MemoryGame {
    constructor() {
        this.symbols = [
            '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🥝',
            '🌸', '🌺', '🌻', '🌹', '🎵', '⭐', '🔥', '💎',
            '🐱', '🐶', '🦋', '🐝', '🎈', '🎁', '🏀', '⚽',
            '🚗', '✈️', '🚀', '🌙', '☀️', '🌈', '💧', '❄️'
        ];

        this.gridSize = 4;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameActive = false;
        this.lockBoard = false;

        this.init();
        this.bindEvents();
    }

    init() {
        this.startNewGame();
    }

    startNewGame() {
        this.stopTimer();
        this.timer = 0;
        this.moves = 0;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.lockBoard = false;
        this.gameActive = true;

        this.updateStats();
        this.showMessage('', '');
        this.createBoard();
        this.startTimer();
    }

    createBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';

        const totalCards = this.gridSize === 8 ? 36 : (this.gridSize === 6 ? 24 : 16);
        this.totalPairs = totalCards / 2;

        const selectedSymbols = this.symbols.slice(0, this.totalPairs);
        const cardValues = [...selectedSymbols, ...selectedSymbols];
        this.shuffle(cardValues);

        this.cards = [];
        board.style.gridTemplateColumns = `repeat(${this.gridSize === 8 ? 6 : (this.gridSize === 6 ? 6 : 4)}, 1fr)`;

        cardValues.forEach((symbol, index) => {
            const card = this.createCard(symbol, index);
            board.appendChild(card);
            this.cards.push(card);
        });

        document.getElementById('totalPairs').textContent = this.totalPairs;
    }

    createCard(symbol, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        card.style.animationDelay = `${index * 0.05}s`;
        card.symbol = symbol;
        card.textContent = '❓';

        card.addEventListener('click', () => this.flipCard(card));

        return card;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    flipCard(card) {
        if (!this.gameActive || this.lockBoard) return;
        if (card.classList.contains('flipped')) return;
        if (card.classList.contains('matched')) return;

        card.classList.add('flipped');
        card.textContent = card.symbol;
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkMatch();
        }
    }

    checkMatch() {
        this.lockBoard = true;
        const [card1, card2] = this.flippedCards;

        if (card1.dataset.symbol === card2.dataset.symbol) {
            this.matchCards(card1, card2);
        } else {
            this.unflipCards(card1, card2);
        }
    }

    matchCards(card1, card2) {
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            this.updateStats();
            this.flippedCards = [];
            this.lockBoard = false;

            if (this.matchedPairs === this.totalPairs) {
                this.gameWon();
            }
        }, 300);
    }

    unflipCards(card1, card2) {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '❓';
            card2.textContent = '❓';
            this.flippedCards = [];
            this.lockBoard = false;
        }, 1000);
    }

    gameWon() {
        this.gameActive = false;
        this.stopTimer();
        const timeStr = this.formatTime(this.timer);
        this.showMessage(`🏆 Победа! Время: ${timeStr}, Ходов: ${this.moves}`, 'win');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateStats();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateStats() {
        document.getElementById('timer').textContent = this.formatTime(this.timer);
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('pairsFound').textContent = this.matchedPairs;
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
    }

    showHint() {
        if (!this.gameActive) return;

        const hiddenCards = this.cards.filter(card =>
            !card.classList.contains('flipped') &&
            !card.classList.contains('matched')
        );

        const symbolMap = new Map();
        hiddenCards.forEach(card => {
            const symbol = card.dataset.symbol;
            if (!symbolMap.has(symbol)) {
                symbolMap.set(symbol, []);
            }
            symbolMap.get(symbol).push(card);
        });

        for (const [symbol, cards] of symbolMap) {
            if (cards.length >= 2) {
                cards[0].classList.add('hint');
                cards[1].classList.add('hint');

                setTimeout(() => {
                    cards[0].classList.remove('hint');
                    cards[1].classList.remove('hint');
                }, 1500);

                this.showMessage('💡 Посмотри на подсвеченные карточки!', 'info');
                return;
            }
        }

        this.showMessage('⚠️ Нет доступных подсказок!', 'error');
    }

    bindEvents() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = parseInt(e.target.dataset.size);
                if (size !== this.gridSize) {
                    this.gridSize = size;
                    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.startNewGame();
                }
            });
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.startNewGame();
            this.showMessage('Новая игра началась!', 'info');
        });

        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
