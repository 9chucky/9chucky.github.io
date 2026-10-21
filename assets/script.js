// Interactive behaviors: typewriter, reveal-on-scroll, modal, copy-email, confetti, theme toggle, Tetris
(function(){
  const typewriterPhrases = ['Pixel-perfect. Neon-bright.', 'Retro vibes. Modern UX.', 'Fast. Clear. Loud.'];
  const el = document.getElementById('typewriter');
  let phraseIndex = 0, charIndex = 0, deleting = false;
  function tickTypewriter(){
    const currentPhrase = typewriterPhrases[phraseIndex];
    const displayText = deleting ? currentPhrase.slice(0, charIndex--) : currentPhrase.slice(0, charIndex++);
    el.textContent = displayText;

    if(!deleting && charIndex > currentPhrase.length){
      deleting = true; setTimeout(tickTypewriter, 1200); return;
    }
    if(deleting && charIndex < 0){
      deleting = false; phraseIndex = (phraseIndex + 1) % typewriterPhrases.length; setTimeout(tickTypewriter, 250); return;
    }
    setTimeout(tickTypewriter, deleting ? 28 : 60);
  }
  if(el) tickTypewriter();

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => obs.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');
  function openModal(title, desc){ modalTitle.textContent = title; modalDesc.textContent = desc; modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.title, card.dataset.desc));
    card.addEventListener('keypress', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card.dataset.title, card.dataset.desc); }});
  });

  const copyBtn = document.getElementById('copy-email');
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('hello@chucky.dev'); showToast('Email copied to clipboard'); }
    catch { showToast('Copy failed — select and copy manually'); }
  });
  function showToast(text){ const toast = document.createElement('div'); toast.className='toast'; toast.textContent=text; document.body.appendChild(toast); setTimeout(() => toast.remove(), 2200); }

  // --- Confetti ---
  const canvas = document.getElementById('confetti-canvas');
  const ctxt = canvas.getContext('2d');
  let w = 0, h = 0, pieces = [];
  const pastelPalette = ['#ffd9e8', '#cffff8', '#fff0b2', '#e7dcff', '#cfefff'];
  const neonPalette = ['#ff4da6', '#00fff0', '#ffd500', '#8e6cff', '#3be4ff'];
  function getTheme(){ return localStorage.getItem('site-theme') || 'light'; }
  function currentPalette(){ return (getTheme() === 'dark') ? neonPalette : pastelPalette; }
  function resizeCanvas(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resizeCanvas(); window.addEventListener('resize', resizeCanvas);
  function random(min, max){ return Math.random() * (max - min) + min; }
  function spawnConfetti(x = random(0,w), y = random(0,h*0.3)){
    const palette = currentPalette();
    for(let i=0;i<36;i++) pieces.push({ x, y, vx: random(-5,5), vy: random(-10,-2), size: random(5,12), color: palette[Math.floor(Math.random()*palette.length)], rotation: random(0,360), life: random(40,95)});
  }
  function drawConfetti(){
    ctxt.clearRect(0,0,w,h);
    pieces.forEach((piece,index)=>{
      piece.vy += 0.2; piece.x += piece.vx; piece.y += piece.vy; piece.rotation += 6; piece.life -= 1;
      ctxt.save(); ctxt.translate(piece.x,piece.y); ctxt.rotate(piece.rotation * Math.PI / 180); ctxt.fillStyle = piece.color; ctxt.fillRect(-piece.size/2, -piece.size/2, piece.size, piece.size*1.6); ctxt.restore();
      if(piece.life <=0) pieces.splice(index,1);
    });
    requestAnimationFrame(drawConfetti);
  }
  drawConfetti();
  const cta = document.getElementById('show-projects');
  cta.addEventListener('click', () => spawnConfetti(window.innerWidth / 2, 180));
  document.addEventListener('keydown', e => { if (e.key === 'c') spawnConfetti(); });

  // --- Theme toggle ---
  const themeToggle = document.getElementById('theme-toggle');
  function applyTheme(t){
    if(t === 'dark'){ document.documentElement.setAttribute('data-theme','dark'); themeToggle.textContent='Light Theme'; themeToggle.setAttribute('aria-pressed','true'); }
    else { document.documentElement.removeAttribute('data-theme'); themeToggle.textContent='Retro Dark'; themeToggle.setAttribute('aria-pressed','false'); }
    spawnConfetti(window.innerWidth/2, 120);
  }
  const initial = getTheme(); applyTheme(initial);
  themeToggle.addEventListener('click', () => {
    const next = (getTheme() === 'dark') ? 'light' : 'dark';
    localStorage.setItem('site-theme', next);
    applyTheme(next);
    showToast(next === 'dark' ? 'Retro Dark enabled' : 'Light theme enabled');
  });

  document.querySelectorAll('.card').forEach(c => c.classList.add('boxed'));
  document.getElementById('year').textContent = new Date().getFullYear();

  // --- Mini Tetris ---
  const canvas = document.getElementById('tetris');
  const ctx = canvas.getContext('2d');
  const boardWidth = 10; const boardHeight = 20; const blockSize = 22;
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
  const pieces = Object.keys(SHAPES);
  let current = null; let score = 0; let best = Number(localStorage.getItem('tetris-best') || 0); let dropInterval = 700; let lastTime = 0; let dropAccumulator = 0; let gameOver = true; let animationId = null;
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best-score');
  const startButton = document.getElementById('start-game');

  function createPiece(){
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    const matrix = SHAPES[type].map(row => row.slice());
    return {
      type,
      matrix,
      x: Math.floor((boardWidth - matrix[0].length) / 2),
      y: -1
    };
  }

  function resetBoard(){
    for(let y=0; y<boardHeight; y++) for(let x=0; x<boardWidth; x++) board[y][x] = 0;
  }

  function collides(piece, dx = 0, dy = 0, matrix = piece.matrix){
    for(let y=0; y<matrix.length; y++){
      for(let x=0; x<matrix[y].length; x++){
        if (!matrix[y][x]) continue;
        const newX = piece.x + x + dx;
        const newY = piece.y + y + dy;
        if (newX < 0 || newX >= boardWidth || newY >= boardHeight) return true;
        if (newY >= 0 && board[newY][newX]) return true;
      }
    }
    return false;
  }

  function merge(piece){
    piece.matrix.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          const bx = piece.x + x; const by = piece.y + y;
          if (by >= 0) board[by][bx] = piece.type;
        }
      });
    });
  }

  function clearLines(){
    let lines = 0;
    for(let y = boardHeight - 1; y >= 0; y--){
      if (board[y].every(Boolean)) {
        board.splice(y,1); board.unshift(Array(boardWidth).fill(0)); lines++;
        y++;
      }
    }
    if (lines > 0) {
      score += [0, 100, 300, 500, 800][lines] || 0;
      if (score > best) {
        best = score; localStorage.setItem('tetris-best', String(best));
      }
      bestEl.textContent = String(best);
      scoreEl.textContent = String(score);
    }
  }

  function rotateMatrix(matrix){
    return matrix[0].map((_,i) => matrix.map(row => row[i]).reverse());
  }

  function rotatePiece(){
    if (!current || gameOver) return;
    const rotated = rotateMatrix(current.matrix);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!collides(current, kick, 0, rotated)) {
        current.matrix = rotated;
        current.x += kick;
        return;
      }
    }
  }

  function move(dx, dy){
    if (!current || gameOver) return;
    if (!collides(current, dx, dy)) {
      current.x += dx; current.y += dy; return true;
    }
    if (dy > 0) {
      merge(current); clearLines();
      current = createPiece();
      if (collides(current, 0, 0)) {
        gameOver = true; startButton.textContent = 'Start'; showToast('Game Over');
      }
    }
    return false;
  }

  function drawCell(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    ctx.strokeStyle = 'rgba(11,17,32,0.12)';
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
  }

  function drawBoard(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let y=0; y<boardHeight; y++){
      for(let x=0; x<boardWidth; x++){
        const val = board[y][x];
        if (val) drawCell(x,y,colors[val]);
      }
    }
    if (current){
      current.matrix.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val) {
            const drawY = current.y + y;
            const drawX = current.x + x;
            if (drawY >= 0) drawCell(drawX, drawY, colors[current.type]);
          }
        });
      });
    }
  }

  function updateScore(){
    scoreEl.textContent = String(score);
    bestEl.textContent = String(best);
  }

  function startGame(){
    resetBoard();
    score = 0; updateScore();
    current = createPiece();
    gameOver = false; lastTime = 0; dropAccumulator = 0; startButton.textContent = 'Restart';
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
  }

  function gameLoop(timestamp){
    if (gameOver) { drawBoard(); return; }
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime; lastTime = timestamp;
    dropAccumulator += delta;
    if (dropAccumulator > dropInterval) {
      if (!move(0, 1)) {
        // if move fails due to settling, it already merges/scores
      }
      dropAccumulator = 0;
    }
    drawBoard();
    animationId = requestAnimationFrame(gameLoop);
  }

  document.addEventListener('keydown', e => {
    if (gameOver && e.key !== 'Enter') return;
    if (e.key === 'ArrowLeft') move(-1, 0);
    if (e.key === 'ArrowRight') move(1, 0);
    if (e.key === 'ArrowDown') move(0, 1);
    if (e.key === 'ArrowUp') rotatePiece();
    if (e.key === ' ') { e.preventDefault(); while(move(0,1)){} }
    if (e.key === 'Enter' && gameOver) startGame();
    drawBoard();
  });

  startButton.addEventListener('click', startGame);
  bestEl.textContent = String(best);
  resetBoard(); drawBoard();
  startGame();
})();
