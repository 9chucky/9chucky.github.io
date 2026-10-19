// Interactive behaviors: typewriter, reveal-on-scroll, modal, copy-email, confetti
(function(){
  // Typewriter for hero
  const phrases = [
    'I build elegant, fast websites and apps.',
    'Modern craftsmanship with a mythic touch.',
    'Fast. Clear. Beautiful.'
  ];
  const el = document.getElementById('typewriter');
  let pi = 0, ci = 0, forward = true;
  function tick(){
    const str = phrases[pi];
    el.textContent = str.slice(0, ci);
    if(forward){
      ci++;
      if(ci>str.length){ forward=false; setTimeout(tick,1200); return }
    } else {
      ci--;
      if(ci<0){ forward=true; pi=(pi+1)%phrases.length; setTimeout(tick,200); return }
    }
    setTimeout(tick, forward?50:25);
  }
  if(el) tick();

  // Reveal on scroll
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('visible');
    });
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(n=>obs.observe(n));

  // Modal for project cards
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');
  function openModal(title, desc){
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

  document.querySelectorAll('.project-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      openModal(card.dataset.title, card.dataset.desc);
    });
    card.addEventListener('keypress', (e)=>{ if(e.key==='Enter') openModal(card.dataset.title, card.dataset.desc); });
  });

  // Copy email
  const copyBtn = document.getElementById('copy-email');
  copyBtn.addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText('hello@chucky.dev');
      showToast('Email copied to clipboard');
    }catch(err){
      showToast('Copy failed — select and copy manually');
    }
  });

  // Toast
  function showToast(text){
    const t = document.createElement('div'); t.className='toast'; t.textContent=text; document.body.appendChild(t);
    setTimeout(()=>t.classList.add('show'),20);
    setTimeout(()=>{ t.remove(); },2500);
  }

  // Confetti canvas
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles=[];
  function resize(){ W=canvas.width=innerWidth; H=canvas.height=innerHeight; }
  resize(); window.addEventListener('resize', resize);
  function rand(min,max){ return Math.random()*(max-min)+min }
  function spawnConfetti(x,y){
    const count = 30;
    for(let i=0;i<count;i++){
      particles.push({
        x: x||rand(0,W), y: y||rand(0,H/2),
        vx: rand(-6,6), vy: rand(-12,-2),
        size: rand(6,12), rot:rand(0,360), color: `hsl(${rand(0,360)},80%,60%)`, life: rand(60,120)
      });
    }
  }
  function step(){
    ctx.clearRect(0,0,W,H);
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += 6; p.life--;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
      ctx.restore();
      if(p.y>H+50 || p.life<=0) particles.splice(i,1);
    }
    requestAnimationFrame(step);
  }
  step();

  // Trigger confetti when CTA clicked
  const cta = document.getElementById('show-projects');
  cta.addEventListener('click', (e)=>{ spawnConfetti(window.innerWidth/2,200); });

  // Keyboard shortcut: press 'c' to trigger confetti
  document.addEventListener('keydown', (e)=>{ if(e.key==='c') spawnConfetti(); });
})();
