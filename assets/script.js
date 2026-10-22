(function(){
  // Typewriter
  const typewriterEl = document.getElementById('typewriter');
  const typewriterPhrases = ['Pixel-perfect. Neon-bright.', 'Retro vibes. Modern UX.', 'Fast. Clear. Loud.'];
  let phraseIndex = 0, charIndex = 0, deleting = false;
  function tickTypewriter(){
    if (!typewriterEl) return;
    const phrase = typewriterPhrases[phraseIndex];
    const display = deleting ? phrase.slice(0, charIndex--) : phrase.slice(0, charIndex++);
    typewriterEl.textContent = display;

    if (!deleting && charIndex > phrase.length) {
      deleting = true; setTimeout(tickTypewriter, 1200); return;
    }
    if (deleting && charIndex < 0) {
      deleting = false; phraseIndex = (phraseIndex + 1) % typewriterPhrases.length; setTimeout(tickTypewriter, 250); return;
    }
    setTimeout(tickTypewriter, deleting ? 28 : 60);
  }
  if (typewriterEl) tickTypewriter();

  // Reveal on scroll
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  // Modal
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');
  function openModal(title, desc){
    if (!modal || !modalTitle || !modalDesc) return;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.title, card.dataset.desc));
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.title, card.dataset.desc);
      }
    });
  });

  // Copy email toast
  const copyBtn = document.getElementById('copy-email');
  function showToast(text){
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  }
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('hello@chucky.dev');
        showToast('Email copied to clipboard');
      } catch {
        showToast('Copy failed — select and copy manually');
      }
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  function getTheme(){ return localStorage.getItem('site-theme') || 'light'; }
  function applyTheme(theme){
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.textContent = 'Light Theme';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) themeToggle.textContent = 'Retro Dark';
    }
  }
  if (themeToggle) {
    applyTheme(getTheme());
    themeToggle.addEventListener('click', () => {
      const next = getTheme() === 'dark' ? 'light' : 'dark';
      localStorage.setItem('site-theme', next);
      applyTheme(next);
      showToast(next === 'dark' ? 'Retro Dark enabled' : 'Light theme enabled');
      spawnConfetti(window.innerWidth / 2, 120);
    });
  }

  // Confetti
  const canvas = document.getElementById('confetti-canvas');
  let confettiCtx = null;
  let confettiWidth = 0; let confettiHeight = 0; let pieces = [];
  if (canvas) {
    confettiCtx = canvas.getContext('2d');
    function resizeCanvas(){
      confettiWidth = canvas.width = window.innerWidth;
      confettiHeight = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    function random(min, max){ return Math.random() * (max - min) + min; }
    function currentPalette(){
      return getTheme() === 'dark' ? ['#ff4da6', '#00fff0', '#ffd500', '#8e6cff', '#3be4ff'] : ['#ffd9e8', '#cffff8', '#fff0b2', '#e7dcff', '#cfefff'];
    }
    function spawnConfetti(x = random(0, confettiWidth), y = random(0, confettiHeight * 0.3)){
      const palette = currentPalette();
      for (let i = 0; i < 36; i++) {
        pieces.push({
          x, y,
          vx: random(-5, 5),
          vy: random(-10, -2),
          size: random(5, 12),
          color: palette[Math.floor(Math.random() * palette.length)],
          rotation: random(0, 360),
          life: random(40, 95)
        });
      }
    }
    function drawConfetti(){
      confettiCtx.clearRect(0, 0, confettiWidth, confettiHeight);
      pieces.forEach((piece, index) => {
        piece.vy += 0.2;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += 6;
        piece.life -= 1;

        confettiCtx.save();
        confettiCtx.translate(piece.x, piece.y);
        confettiCtx.rotate(piece.rotation * Math.PI / 180);
        confettiCtx.fillStyle = piece.color;
        confettiCtx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 1.6);
        confettiCtx.restore();

        if (piece.life <= 0) pieces.splice(index, 1);
      });
      requestAnimationFrame(drawConfetti);
    }
    drawConfetti();
    const cta = document.getElementById('show-projects');
    if (cta) cta.addEventListener('click', () => spawnConfetti(window.innerWidth / 2, 180));
    document.addEventListener('keydown', (e) => { if (e.key === 'c') spawnConfetti(); });
  }

  // Tetris game
  const tetrisCanvas = document.getElementById('tetris');
  const tetrisCtx = tetrisCanvas ? tetrisCanvas.getContext('2d') : null;
  const boardWidth = 10;
  const boardHeight = 20;
  const blockSize = 22;
  const board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));
  const colors = {
    I: '#00b8d1',
    O: '#ffd500',
    T: '#8e6cff',
    L: '#ff4da6',
    J: '#00a3ff',
    S: '#3be4ff',
    Z: '#ff7a59'
  };
  const SHAPES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]],
    J: [[1,0,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]]
  };
  const shapeNames = Object.keys(SHAPES);
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best-score');
  const startButton = document.getElementById('start-game');

  let currentPiece = null;
  let score = 0;
  let best = Number(localStorage.getItem('tetris-best') || 0);
  let lastTime = 0;
  let dropAccumulator = 0;
  let gameOver = true;
  let animationId = null;
  let dropInterval = 700;

  function createPiece(){
    const type = shapeNames[Math.floor(Math.random() * shapeNames.length)];
    const matrix = SHAPES[type].map(row => row.slice());
    return {
      type,
      matrix,
      x: Math.floor((boardWidth - matrix[0].length) / 2),
      y: -1
    };
  }

  function resetBoard(){
    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        board[y][x] = 0;
      }
    }
  }

  function collides(piece, dx = 0, dy = 0, matrix = piece.matrix){
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (!matrix[y][x]) continue;
        const newX = piece.x + x + dx;
        const newY = piece.y + y + dy;
        if (newX < 0 || newX >= boardWidth || newY >= boardHeight) return true;
        if (newY >= 0 && board[newY][newX]) return true;
      }
    }
    return false;
  }

  function mergePiece(piece){
    piece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!value) return;
        const boardX = piece.x + x;
        const boardY = piece.y + y;
        if (boardY >= 0) board[boardY][boardX] = piece.type;
      });
    });
  }

  function clearLines(){
    let cleared = 0;
    for (let y = boardHeight - 1; y >= 0; y--) {
      if (board[y].every(Boolean)) {
        board.splice(y, 1);
        board.unshift(Array(boardWidth).fill(0));
        cleared++;
        y++;
      }
    }
    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800];
      score += points[cleared] || 0;
      if (score > best) {
        best = score;
        localStorage.setItem('tetris-best', String(best));
      }
      if (scoreEl) scoreEl.textContent = String(score);
      if (bestEl) bestEl.textContent = String(best);
    }
  }

  function rotateMatrix(matrix){
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
  }

  function rotatePiece(){
    if (!currentPiece || gameOver) return;
    const rotated = rotateMatrix(currentPiece.matrix);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!collides(currentPiece, kick, 0, rotated)) {
        currentPiece.matrix = rotated;
        currentPiece.x += kick;
        return;
      }
    }
  }

  function movePiece(dx, dy){
    if (!currentPiece || gameOver) return false;
    if (!collides(currentPiece, dx, dy)) {
      currentPiece.x += dx;
      currentPiece.y += dy;
      return true;
    }
    if (dy > 0) {
      mergePiece(currentPiece);
      clearLines();
      currentPiece = createPiece();
      if (collides(currentPiece, 0, 0)) {
        gameOver = true;
        if (startButton) startButton.textContent = 'Restart';
        showToast('Game Over');
      }
    }
    return false;
  }

  function drawCell(x, y, color){
    if (!tetrisCtx) return;
    tetrisCtx.fillStyle = color;
    tetrisCtx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    tetrisCtx.strokeStyle = 'rgba(11,17,32,0.12)';
    tetrisCtx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
  }

  function drawBoard(){
    if (!tetrisCtx) return;
    tetrisCtx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);

    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const value = board[y][x];
        if (value) drawCell(x, y, colors[value]);
      }
    }

    if (currentPiece) {
      currentPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (!value) return;
          const drawX = currentPiece.x + x;
          const drawY = currentPiece.y + y;
          if (drawY >= 0) drawCell(drawX, drawY, colors[currentPiece.type]);
        });
      });
    }
  }

  function updateScoreDisplay(){
    if (scoreEl) scoreEl.textContent = String(score);
    if (bestEl) bestEl.textContent = String(best);
  }

  function getDropInterval(){
    return Math.max(120, 700 - Math.floor(score / 200) * 35);
  }

  function gameLoop(timestamp){
    if (!tetrisCanvas || gameOver) {
      drawBoard();
      return;
    }
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    dropAccumulator += delta;
    if (dropAccumulator > dropInterval) {
      movePiece(0, 1);
      dropAccumulator = 0;
      dropInterval = getDropInterval();
    }
    drawBoard();
    animationId = requestAnimationFrame(gameLoop);
  }

  function startGame(){
    resetBoard();
    score = 0;
    updateScoreDisplay();
    currentPiece = createPiece();
    gameOver = false;
    lastTime = 0;
    dropAccumulator = 0;
    dropInterval = 700;
    if (startButton) startButton.textContent = 'Restart';
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
  }

  if (startButton) startButton.addEventListener('click', startGame);

  document.addEventListener('keydown', (e) => {
    if (!currentPiece) return;
    if (e.key === 'ArrowLeft') movePiece(-1, 0);
    if (e.key === 'ArrowRight') movePiece(1, 0);
    if (e.key === 'ArrowDown') movePiece(0, 1);
    if (e.key === 'ArrowUp') rotatePiece();
    if (e.key === ' ') {
      e.preventDefault();
      while (movePiece(0, 1)) {}
    }
    if (e.key === 'Enter' && gameOver) startGame();
    drawBoard();
  });

  if (bestEl) bestEl.textContent = String(best);
  if (scoreEl) scoreEl.textContent = String(score);
  if (tetrisCtx) {
    resetBoard();
    currentPiece = createPiece();
    drawBoard();
    startGame();
  }
})();
