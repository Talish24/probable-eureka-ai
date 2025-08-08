// Enhanced Chess Game Implementation
class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameOver = false;
        this.difficulty = 'medium';
        this.kingPositions = { white: [7, 4], black: [0, 4] };
        this.moveHistory = [];
        this.gameHistory = []; // For notation display
        this.isComputerThinking = false;
        this.currentTheme = 'classic';
        
        this.pieceSymbols = {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
        };
        
        this.fileNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        this.rankNames = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
        // Initialize after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.initEventListeners();
        this.switchTheme('classic'); // Set default theme
        this.showDifficultyScreen();
    }

    initEventListeners() {
        // Difficulty selection - with error handling
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const difficulty = e.currentTarget.dataset.difficulty;
                if (difficulty) {
                    this.difficulty = difficulty;
                    this.startGame();
                }
            });
        });

        // Game controls
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDifficultyScreen();
            });
        }

        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDifficultyScreen();
            });
        }

        const closeModalBtn = document.getElementById('close-modal-btn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal();
            });
        }

        // Theme controls
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showThemeModal();
            });
        }

        const closeThemeModalBtn = document.getElementById('close-theme-modal');
        if (closeThemeModalBtn) {
            closeThemeModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideThemeModal();
            });
        }

        // Theme options
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = e.currentTarget.dataset.theme;
                if (theme) {
                    this.switchTheme(theme);
                    this.hideThemeModal();
                }
            });
        });

        // Clear history
        const clearHistoryBtn = document.getElementById('clear-history');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearMoveHistory();
            });
        }
    }

    switchTheme(theme) {
        this.currentTheme = theme;
        document.body.dataset.theme = theme;
        
        // Update active theme button
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    showThemeModal() {
        const modal = document.getElementById('theme-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideThemeModal() {
        const modal = document.getElementById('theme-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showDifficultyScreen() {
        const difficultyScreen = document.getElementById('difficulty-screen');
        const gameScreen = document.getElementById('game-screen');
        
        if (difficultyScreen) difficultyScreen.classList.remove('hidden');
        if (gameScreen) gameScreen.classList.add('hidden');
        
        this.gameOver = false;
        this.isComputerThinking = false;
    }

    startGame() {
        const difficultyScreen = document.getElementById('difficulty-screen');
        const gameScreen = document.getElementById('game-screen');
        
        if (difficultyScreen) difficultyScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden');
        
        // Update difficulty badge
        const difficultyBadge = document.getElementById('computer-difficulty');
        if (difficultyBadge) {
            difficultyBadge.textContent = this.difficulty.toUpperCase();
        }
        
        this.initBoard();
        this.currentPlayer = 'white';
        this.gameOver = false;
        this.selectedSquare = null;
        this.moveHistory = [];
        this.gameHistory = [];
        this.isComputerThinking = false;
        
        // Render board and update UI
        this.renderBoard();
        this.clearHighlights();
        this.updateGameStatus();
        this.updateMoveHistory();
    }

    initBoard() {
        // Initialize 8x8 board with starting position
        this.board = [
            [{ type: 'rook', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'bishop', color: 'black' }, { type: 'queen', color: 'black' }, { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' }],
            [{ type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' }],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [{ type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' }],
            [{ type: 'rook', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'bishop', color: 'white' }, { type: 'queen', color: 'white' }, { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' }]
        ];
        
        this.kingPositions = { white: [7, 4], black: [0, 4] };
    }

    renderBoard() {
        const boardElement = document.getElementById('chess-board');
        if (!boardElement) return;
        
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.className = 'chess-piece';
                    pieceElement.textContent = this.pieceSymbols[piece.color][piece.type];
                    pieceElement.dataset.color = piece.color;
                    pieceElement.dataset.type = piece.type;
                    pieceElement.draggable = piece.color === 'white' && !this.gameOver && !this.isComputerThinking;
                    
                    // Apply piece color styling based on color
                    if (piece.color === 'white') {
                        pieceElement.style.color = '#FFFFFF';
                        pieceElement.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7), 0 0 4px rgba(0,0,0,0.5)';
                    } else {
                        pieceElement.style.color = '#000000';
                        pieceElement.style.textShadow = '1px 1px 2px rgba(255,255,255,0.7), 0 0 4px rgba(255,255,255,0.5)';
                    }
                    
                    square.appendChild(pieceElement);

                    // Add drag event listeners for white pieces
                    if (piece.color === 'white') {
                        pieceElement.addEventListener('dragstart', (e) => this.handleDragStart(e, row, col));
                        pieceElement.addEventListener('dragend', (e) => this.handleDragEnd(e));
                    }
                }

                square.addEventListener('click', (e) => this.handleSquareClick(row, col));
                square.addEventListener('dragover', (e) => e.preventDefault());
                square.addEventListener('drop', (e) => this.handleDrop(e, row, col));

                boardElement.appendChild(square);
            }
        }
    }

    handleSquareClick(row, col) {
        if (this.gameOver || this.isComputerThinking) return;
        if (this.currentPlayer !== 'white') return;

        if (this.selectedSquare) {
            if (this.selectedSquare[0] === row && this.selectedSquare[1] === col) {
                // Deselect
                this.selectedSquare = null;
                this.clearHighlights();
            } else if (this.isValidMove(this.selectedSquare[0], this.selectedSquare[1], row, col)) {
                // Make move
                this.makeMove(this.selectedSquare[0], this.selectedSquare[1], row, col);
                this.selectedSquare = null;
                this.clearHighlights();
            } else if (this.board[row][col] && this.board[row][col].color === 'white') {
                // Select new piece
                this.selectedSquare = [row, col];
                this.highlightValidMoves(row, col);
            }
        } else if (this.board[row][col] && this.board[row][col].color === 'white') {
            // Select piece
            this.selectedSquare = [row, col];
            this.highlightValidMoves(row, col);
        }
    }

    handleDragStart(e, row, col) {
        if (this.gameOver || this.isComputerThinking || this.currentPlayer !== 'white') {
            e.preventDefault();
            return;
        }
        
        this.selectedSquare = [row, col];
        e.target.classList.add('dragging');
        this.highlightValidMoves(row, col);
        
        // Set drag data
        e.dataTransfer.setData('text/plain', `${row},${col}`);
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDrop(e, row, col) {
        e.preventDefault();
        if (!this.selectedSquare) return;

        const draggedPiece = document.querySelector('.dragging');
        if (draggedPiece) {
            draggedPiece.classList.remove('dragging');
        }

        if (this.isValidMove(this.selectedSquare[0], this.selectedSquare[1], row, col)) {
            this.makeMove(this.selectedSquare[0], this.selectedSquare[1], row, col);
        }

        this.selectedSquare = null;
        this.clearHighlights();
    }

    highlightValidMoves(row, col) {
        this.clearHighlights();
        
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add('selected');
        }

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.isValidMove(row, col, r, c)) {
                    const targetSquare = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    if (targetSquare) {
                        targetSquare.classList.add('valid-move');
                        if (this.board[r][c]) {
                            targetSquare.classList.add('occupied');
                        }
                    }
                }
            }
        }
    }

    clearHighlights() {
        document.querySelectorAll('.chess-square').forEach(square => {
            square.classList.remove('selected', 'valid-move', 'occupied');
        });
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow === toRow && fromCol === toCol) return false;
        if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;

        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.currentPlayer) return false;

        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;

        // Check piece-specific movement rules
        if (!this.isPieceMoveLegal(piece, fromRow, fromCol, toRow, toCol)) return false;

        // Check if move would put own king in check
        return !this.wouldMoveExposeKing(fromRow, fromCol, toRow, toCol);
    }

    isPieceMoveLegal(piece, fromRow, fromCol, toRow, toCol) {
        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);

        switch (piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? -1 : 1;
                const startRow = piece.color === 'white' ? 6 : 1;
                
                if (colDiff === 0) {
                    // Forward move
                    if (this.board[toRow][toCol]) return false; // Can't capture forward
                    if (rowDiff === direction) return true;
                    if (fromRow === startRow && rowDiff === 2 * direction && !this.board[fromRow + direction][fromCol]) return true;
                } else if (absColDiff === 1 && rowDiff === direction) {
                    // Diagonal capture
                    return this.board[toRow][toCol] !== null;
                }
                return false;

            case 'rook':
                if (rowDiff === 0 || colDiff === 0) {
                    return this.isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;

            case 'bishop':
                if (absRowDiff === absColDiff) {
                    return this.isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;

            case 'queen':
                if (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) {
                    return this.isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;

            case 'knight':
                return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);

            case 'king':
                return absRowDiff <= 1 && absColDiff <= 1;

            default:
                return false;
        }
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
        const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;

        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.board[currentRow][currentCol]) return false;
            currentRow += rowStep;
            currentCol += colStep;
        }

        return true;
    }

    wouldMoveExposeKing(fromRow, fromCol, toRow, toCol) {
        // Make temporary move
        const originalPiece = this.board[toRow][toCol];
        const movingPiece = this.board[fromRow][fromCol];
        
        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;

        // Update king position if moving king
        let tempKingPos = this.kingPositions[this.currentPlayer].slice();
        if (movingPiece.type === 'king') {
            tempKingPos = [toRow, toCol];
        }

        // Check if king is in check
        const inCheck = this.isSquareAttacked(tempKingPos[0], tempKingPos[1], this.currentPlayer === 'white' ? 'black' : 'white');

        // Restore board
        this.board[fromRow][fromCol] = movingPiece;
        this.board[toRow][toCol] = originalPiece;

        return inCheck;
    }

    isSquareAttacked(row, col, byColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === byColor) {
                    if (this.isPieceMoveLegal(piece, r, c, row, col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];

        // Add piece movement animation
        const pieceElement = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"] .chess-piece`);
        if (pieceElement) {
            pieceElement.classList.add('moving');
            setTimeout(() => {
                if (pieceElement) pieceElement.classList.remove('moving');
            }, 300);
        }

        // Generate move notation with piece symbol
        const notation = this.generateMoveNotation(piece, fromRow, fromCol, toRow, toCol, capturedPiece);

        // Update board
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Update king position
        if (piece.type === 'king') {
            this.kingPositions[piece.color] = [toRow, toCol];
        }

        // Add to move history
        this.moveHistory.push({
            from: [fromRow, fromCol],
            to: [toRow, toCol],
            piece: piece,
            captured: capturedPiece,
            notation: notation
        });

        // Add to game history for display with piece symbol
        this.gameHistory.push({
            moveNumber: Math.ceil(this.gameHistory.length / 2) + 1,
            player: this.currentPlayer,
            notation: notation,
            pieceSymbol: this.pieceSymbols[piece.color][piece.type],
            isRecent: true
        });

        // Mark previous moves as not recent
        if (this.gameHistory.length > 1) {
            this.gameHistory[this.gameHistory.length - 2].isRecent = false;
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Re-render board immediately and update UI
        this.renderBoard();
        this.updateGameStatus();
        this.updateMoveHistory();

        // Check for game over
        if (this.isGameOver()) {
            this.handleGameOver();
        } else if (this.currentPlayer === 'black') {
            // Computer's turn
            setTimeout(() => this.makeComputerMove(), 500);
        }
    }

    generateMoveNotation(piece, fromRow, fromCol, toRow, toCol, capturedPiece) {
        const fromSquare = this.fileNames[fromCol] + this.rankNames[fromRow];
        const toSquare = this.fileNames[toCol] + this.rankNames[toRow];
        
        let notation = '';
        
        if (piece.type === 'pawn') {
            if (capturedPiece) {
                notation = this.fileNames[fromCol] + 'x' + toSquare;
            } else {
                notation = toSquare;
            }
        } else {
            const pieceSymbol = piece.type.charAt(0).toUpperCase();
            if (capturedPiece) {
                notation = pieceSymbol + 'x' + toSquare;
            } else {
                notation = pieceSymbol + toSquare;
            }
        }
        
        return notation;
    }

    makeComputerMove() {
        if (this.gameOver) return;
        
        this.isComputerThinking = true;
        this.updateGameStatus();

        // Use setTimeout to show thinking status
        setTimeout(() => {
            const bestMove = this.getBestMove();
            if (bestMove) {
                this.makeMove(bestMove.from[0], bestMove.from[1], bestMove.to[0], bestMove.to[1]);
            }
            this.isComputerThinking = false;
            this.updateGameStatus();
        }, 1000 + Math.random() * 1500); // Random thinking time
    }

    getBestMove() {
        const moves = this.getAllValidMoves('black');
        
        if (moves.length === 0) return null;

        // For easier difficulties, use simpler logic
        if (this.difficulty === 'easy') {
            // 60% random, 40% basic evaluation
            if (Math.random() < 0.6) {
                return moves[Math.floor(Math.random() * moves.length)];
            }
        }

        let bestMove = null;
        let bestScore = -Infinity;

        // Limit moves evaluated for performance
        const movesToEvaluate = moves.slice(0, Math.min(moves.length, 15));

        for (const move of movesToEvaluate) {
            const score = this.evaluateMoveQuick(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove || moves[0];
    }

    evaluateMoveQuick(move) {
        let score = Math.random() * 0.1; // Small random factor
        const pieceValues = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };

        // Material gain
        if (this.board[move.to[0]][move.to[1]]) {
            score += pieceValues[this.board[move.to[0]][move.to[1]].type] * 2;
        }

        // Center control
        const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
        if (centerSquares.some(([r,c]) => r === move.to[0] && c === move.to[1])) {
            score += 0.5;
        }

        // Piece development (moving from back rank)
        if (move.from[0] === 0 && move.to[0] > 0) {
            score += 0.3;
        }

        // Piece safety (simplified)
        const piece = move.piece;
        if (piece.type === 'king' && move.to[0] === 0 && (move.to[1] < 2 || move.to[1] > 5)) {
            score += 0.4; // King safety
        }

        return score;
    }

    getAllValidMoves(color) {
        const moves = [];
        
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.board[fromRow][fromCol];
                if (piece && piece.color === color) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMoveForColor(fromRow, fromCol, toRow, toCol, color)) {
                                moves.push({
                                    from: [fromRow, fromCol],
                                    to: [toRow, toCol],
                                    piece: piece
                                });
                            }
                        }
                    }
                }
            }
        }
        
        return moves;
    }

    isValidMoveForColor(fromRow, fromCol, toRow, toCol, color) {
        if (fromRow === toRow && fromCol === toCol) return false;
        if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;

        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== color) return false;

        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;

        if (!this.isPieceMoveLegal(piece, fromRow, fromCol, toRow, toCol)) return false;

        // Temporarily switch current player to check if move exposes king
        const originalPlayer = this.currentPlayer;
        this.currentPlayer = color;
        const wouldExpose = this.wouldMoveExposeKing(fromRow, fromCol, toRow, toCol);
        this.currentPlayer = originalPlayer;

        return !wouldExpose;
    }

    isGameOver() {
        const moves = this.getAllValidMoves(this.currentPlayer);
        if (moves.length === 0) {
            return true; // Checkmate or stalemate
        }
        return false;
    }

    handleGameOver() {
        this.gameOver = true;
        this.isComputerThinking = false; // Ensure thinking status is cleared
        
        const moves = this.getAllValidMoves(this.currentPlayer);
        const kingPos = this.kingPositions[this.currentPlayer];
        const inCheck = this.isSquareAttacked(kingPos[0], kingPos[1], this.currentPlayer === 'white' ? 'black' : 'white');

        let title, message;
        if (moves.length === 0 && inCheck) {
            // Checkmate
            title = 'Checkmate!';
            message = this.currentPlayer === 'white' ? 'Computer wins!' : 'You win!';
        } else {
            // Stalemate
            title = 'Stalemate!';
            message = 'It\'s a draw!';
        }

        this.updateGameStatus(); // Update status before showing modal
        setTimeout(() => this.showModal(title, message), 500);
    }

    updateGameStatus() {
        const statusElement = document.getElementById('game-status');
        const whitePlayer = document.querySelector('.white-player');
        const blackPlayer = document.querySelector('.black-player');
        
        if (!statusElement) return;

        // Reset classes
        if (whitePlayer) whitePlayer.classList.remove('active');
        if (blackPlayer) blackPlayer.classList.remove('active');
        statusElement.classList.remove('thinking');

        if (this.gameOver) {
            statusElement.textContent = 'Game over';
            statusElement.className = 'game-status';
        } else if (this.isComputerThinking) {
            statusElement.textContent = 'Computer thinking';
            statusElement.className = 'game-status thinking';
            if (blackPlayer) blackPlayer.classList.add('active');
        } else if (this.currentPlayer === 'white') {
            statusElement.textContent = 'Your turn';
            statusElement.className = 'game-status';
            if (whitePlayer) whitePlayer.classList.add('active');
        } else {
            statusElement.textContent = 'Computer\'s turn';
            statusElement.className = 'game-status';
            if (blackPlayer) blackPlayer.classList.add('active');
        }
    }

    updateMoveHistory() {
        const historyElement = document.getElementById('move-history');
        if (!historyElement) return;
        
        historyElement.innerHTML = '';

        // Show last 10 moves
        const recentMoves = this.gameHistory.slice(-10);
        
        recentMoves.forEach((move, index) => {
            const moveEntry = document.createElement('div');
            moveEntry.className = `move-entry ${move.isRecent ? 'recent' : ''}`;
            
            moveEntry.innerHTML = `
                <span class="move-number">${move.moveNumber}.</span>
                <span class="move-notation">
                    <span class="move-piece-symbol">${move.pieceSymbol}</span>
                    ${move.notation}
                </span>
                <span class="move-player">${move.player === 'white' ? 'You' : 'Computer'}</span>
            `;
            
            historyElement.appendChild(moveEntry);
        });

        // Auto-scroll to bottom
        historyElement.scrollTop = historyElement.scrollHeight;
    }

    clearMoveHistory() {
        this.gameHistory = [];
        this.updateMoveHistory();
    }

    showModal(title, message) {
        const titleEl = document.getElementById('game-over-title');
        const messageEl = document.getElementById('game-over-message');
        const modal = document.getElementById('game-over-modal');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        if (modal) modal.classList.remove('hidden');
    }

    hideModal() {
        const modal = document.getElementById('game-over-modal');
        if (modal) modal.classList.add('hidden');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessGame();
});