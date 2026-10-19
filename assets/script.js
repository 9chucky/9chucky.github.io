// Interactive behaviors: typewriter, reveal-on-scroll, modal, copy-email, confetti
(function(){
  const typewriterPhrases = [
    'Pixel-perfect. Neon-bright.',
    'Retro vibes. Modern UX.',
    'Fast. Clear. Loud.'
  ];

  const el = document.getElementById('typewriter');
  let phraseIndex = 0, charIndex = 0, deleting = false;
  function tickTypewriter(){
    const currentPhrase = typewriterPhrases[phraseIndex];
    const displayText = deleting ? currentPhrase.slice(0, charIndex--) : currentPhrase.slice(0, charIndex++);
    el.textContent = displayText;

    if(!deleting && charIndex > currentPhrase.length){
      deleting = true;
      setTimeout(tickTypewriter, 1200);
      return;
    }

    if(deleting && charIndex < 0){
      deleting = false;
      phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
      setTimeout(tickTypewriter, 250);
      return;
    }

    setTimeout(tickTypewriter, deleting ? 28 : 60);
  }
  if(el) tickTypewriter();

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
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

  function openModal(title, desc){
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.title, card.dataset.desc));
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.title, card.dataset.desc);
      }
    });
  });

  const copyBtn = document.getElementById('copy-email');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('hello@chucky.dev');
      showToast('Email copied to clipboard');
    } catch (err) {
      showToast('Copy failed — select and copy manually');
    }
  });

  function showToast(text){
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 2200);
  }

  const canvas = document.getElementById('confetti-canvas');
  const ctxt = canvas.getContext('2d');
  let w = 0, h = 0, pieces = [];
  const palette = ['#ff4da6', '#00fff0', '#ffd500', '#8e6cff', '#3be4ff'];

  function resizeCanvas(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function random(min, max){ return Math.random() * (max - min) + min; }

  function spawnConfetti(x = random(0, w), y = random(0, h * 0.3)){
    for (let i = 0; i < 36; i++) {
      pieces.push({
        x,
        y,
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
    ctxt.clearRect(0, 0, w, h);
    pieces.forEach((piece, index) => {
      piece.vy += 0.2;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rotation += 6;
      piece.life -= 1;

      ctxt.save();
      ctxt.translate(piece.x, piece.y);
      ctxt.rotate(piece.rotation * Math.PI / 180);
      ctxt.fillStyle = piece.color;
      ctxt.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 1.6);
      ctxt.restore();

      if (piece.life <= 0) pieces.splice(index, 1);
    });
    requestAnimationFrame(drawConfetti);
  }
  drawConfetti();

  const cta = document.getElementById('show-projects');
  cta.addEventListener('click', () => spawnConfetti(window.innerWidth / 2, 180));
  document.addEventListener('keydown', (e) => { if (e.key === 'c') spawnConfetti(); });
})();
