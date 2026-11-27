(() => {
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Rolagem suave (Lenis) ---------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (body.classList.contains('is-loading')) lenis.stop(); // travado durante a abertura
  }
  const headerOffset = () => -(document.getElementById('header').offsetHeight - 1);
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#' ? null : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(id === '#inicio' ? 0 : target, { offset: headerOffset(), duration: 1.6 });
      else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Preloader ---------- */
  const finishLoading = () => {
    if (body.classList.contains('is-loaded')) return;
    body.classList.add('is-loaded');
    body.classList.remove('is-loading');
    if (lenis) lenis.start();
  };
  const minIntro = reduceMotion ? 0 : 2000;
  const start = performance.now();
  window.addEventListener('load', () => {
    setTimeout(finishLoading, Math.max(0, minIntro - (performance.now() - start)));
  });
  setTimeout(finishLoading, 4500); // garantia caso alguma imagem demore

  /* ---------- Header ---------- */
  const header = document.getElementById('header');
  const waFloat = document.querySelector('.wa-float');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * 0.8 && !body.classList.contains('menu-open'));
    if (waFloat) waFloat.classList.toggle('is-visible', y > window.innerHeight * 0.5);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const toggleMenu = (open) => {
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  menuBtn.addEventListener('click', () => toggleMenu(!body.classList.contains('menu-open')));
  document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });

  /* ---------- Hero: slideshow ---------- */
  const slides = document.querySelectorAll('.hero__slide');
  const bars = document.querySelectorAll('.hero__progress span');
  const cardTitle = document.getElementById('heroCardTitle');
  const cardTitles = [
    'Recuperação de créditos tributários',
    'Contencioso tributário',
    'Gestão do passivo tributário',
    'Auditoria e planejamento tributário',
    'Direito empresarial e agronegócio'
  ];
  let current = 0;
  const goTo = (i) => {
    slides[current].classList.remove('is-active');
    bars[current] && bars[current].classList.remove('is-active');
    current = i;
    slides[current].classList.add('is-active');
    if (bars[current]) { void bars[current].offsetWidth; bars[current].classList.add('is-active'); }
    if (cardTitle) {
      cardTitle.style.opacity = 0;
      setTimeout(() => { cardTitle.textContent = cardTitles[current % cardTitles.length]; cardTitle.style.opacity = 1; }, 400);
    }
  };
  if (!reduceMotion && slides.length > 1) setInterval(() => goTo((current + 1) % slides.length), 6000);

  /* ---------- Hero: moldura que "encolhe" ao rolar ---------- */
  const heroFrame = document.getElementById('heroFrame');
  const hero = document.querySelector('.hero');
  const parallaxEls = document.querySelectorAll('.parallax');
  const track = document.getElementById('galleryTrack');
  const gallery = document.querySelector('.gallery');
  const sheets = document.querySelectorAll('.sheet');

  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = window.innerHeight;

    // Hero inset + cantos arredondados
    if (heroFrame && hero) {
      const p = Math.min(Math.max(window.scrollY / (hero.offsetHeight * 0.9), 0), 1);
      const inset = p * (window.innerWidth < 700 ? 10 : 28);
      heroFrame.style.clipPath = `inset(0 ${inset}px ${inset * 1.6}px ${inset}px round 0 0 ${p * 24}px ${p * 24}px)`;
    }

    // Seções escuras: recuo + cantos arredondados que somem conforme a seção ocupa a tela
    const maxInset = window.innerWidth < 700 ? 12 : 56;
    sheets.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      // 0 quando a borda entra pela parte de baixo da tela, 1 quando chega ao topo
      const enter = Math.min(Math.max((vh - r.top) / vh, 0), 1);
      const leave = Math.min(Math.max(r.bottom / vh, 0), 1);
      const k = Math.min(enter, leave);
      const e = k * k * (3 - 2 * k); // smoothstep: começa e termina suave
      el.style.setProperty('--sheet-inset', `${(1 - e) * maxInset}px`);
      el.style.setProperty('--sheet-radius', `${(1 - e) * 56}px`);
    });

    // Parallax leve
    parallaxEls.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const prog = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = `translate3d(0, ${prog * -60}px, 0)`;
    });

    // Galeria horizontal ligada ao scroll
    if (track && gallery) {
      const r = gallery.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const maxShift = Math.max(0, track.scrollWidth - window.innerWidth + 40);
        const prog = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1);
        track.style.transform = `translate3d(${-prog * maxShift}px, 0, 0)`;
      }
    }
  };
  if (!reduceMotion) {
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    window.addEventListener('resize', frame);
    frame();
  } else if (track) {
    track.parentElement.style.overflowX = 'auto';
  }

  /* ---------- Reveal ao entrar na tela ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    // escalonamento dentro de grupos
    const siblings = el.parentElement.querySelectorAll(':scope > .reveal');
    const idx = Array.prototype.indexOf.call(siblings, el);
    el.style.transitionDelay = `${Math.min(idx, 5) * 0.08}s`;
    io.observe(el);
  });

  /* ---------- Contadores ---------- */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const from = target > 1000 ? target - 40 : 0;
      const dur = reduceMotion ? 0 : 1800;
      const t0 = performance.now();
      const tick = (t) => {
        const k = dur ? Math.min((t - t0) / dur, 1) : 1;
        const eased = 1 - Math.pow(1 - k, 4);
        el.textContent = prefix + Math.round(from + (target - from) * eased) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => counterIO.observe(el));

  /* ---------- Áreas de atuação (acordeão + imagem) ---------- */
  const areas = document.querySelectorAll('.area');
  const previews = document.querySelectorAll('.areas__preview-img');
  const showPreview = (i) => previews.forEach(p => p.classList.toggle('is-active', p.dataset.area === String(i)));
  areas.forEach(area => {
    const btn = area.querySelector('.area__head');
    btn.addEventListener('click', () => {
      const willOpen = !area.classList.contains('is-open');
      areas.forEach(a => { a.classList.remove('is-open'); a.querySelector('.area__head').setAttribute('aria-expanded', 'false'); });
      if (willOpen) {
        area.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        showPreview(area.dataset.area);
      }
    });
    btn.addEventListener('mouseenter', () => showPreview(area.dataset.area));
  });
  // ao tirar o mouse da lista, volta para a imagem da área aberta
  document.querySelector('.areas__list')?.addEventListener('mouseleave', () => {
    const open = document.querySelector('.area.is-open');
    if (open) showPreview(open.dataset.area);
  });

  /* ---------- Formulário → WhatsApp ---------- */
  const form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(input => {
      const bad = !input.value.trim();
      input.closest('.field').classList.toggle('has-error', bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    const d = new FormData(form);
    const empresa = d.get('empresa').trim();
    const msg = [
      `Olá! Vim através do site da Jaques Barbosa Advocacia de Negócios e gostaria de agendar um atendimento.`,
      '',
      `Nome: ${d.get('nome').trim()}`,
      ...(empresa ? [`Empresa: ${empresa}`] : []),
      `Assunto: ${d.get('assunto')}`,
      '',
      d.get('mensagem').trim()
    ].join('\n');
    window.jbTrack?.('whatsapp_click', { origem: 'formulario', assunto: d.get('assunto') });
    window.open(`https://wa.me/556236373859?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  /* ---------- Ano no rodapé ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
