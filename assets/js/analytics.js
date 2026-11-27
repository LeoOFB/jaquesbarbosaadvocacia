/* =========================================================
   Medição (Google Analytics 4) + aviso de cookies (LGPD)
   O GA só é carregado depois que o visitante aceita.
   ========================================================= */
(() => {
  const GA_ID = 'G-CV7DDSDFZN'; // ex.: 'G-XXXXXXXXXX'. Vazio = medição desligada.
  const KEY = 'jb-cookies'; // 'aceito' | 'recusado'

  const store = {
    get() { try { return localStorage.getItem(KEY); } catch { return null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch { /* sem armazenamento */ } }
  };

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  let loaded = false;

  function loadGA() {
    if (!GA_ID || loaded) return;
    loaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  /* ---------- Eventos ---------- */
  // Uso: window.jbTrack('whatsapp_click', { origem: 'formulario' })
  window.jbTrack = (name, params = {}) => { if (loaded) gtag('event', name, params); };

  function origemDe(a) {
    if (document.body.classList.contains('links-page')) return 'pagina_links';
    if (a.dataset.areaCta) return 'area: ' + a.dataset.areaCta;
    if (a.closest('.header')) return 'topo';
    if (a.closest('.wa-float')) return 'botao_flutuante';
    if (a.closest('footer')) return 'rodape';
    const sec = a.closest('section[id], section[class]');
    return sec ? (sec.id || sec.classList[0]) : 'outro';
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href.includes('wa.me/')) window.jbTrack('whatsapp_click', { origem: origemDe(a) });
    else if (href.startsWith('tel:')) window.jbTrack('telefone_click', { origem: origemDe(a) });
    else if (href.startsWith('mailto:')) window.jbTrack('email_click', { origem: origemDe(a) });
  });

  /* ---------- Aviso de cookies ---------- */
  if (!GA_ID) return;

  const choice = store.get();
  if (choice === 'aceito') { loadGA(); return; }
  if (choice === 'recusado') return;

  const bar = document.createElement('div');
  bar.className = 'cookie-bar';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Aviso de cookies');
  bar.innerHTML =
    '<p>Usamos cookies de medição para entender como o site é utilizado e melhorar sua experiência. ' +
    'Nenhum dado pessoal é vendido ou compartilhado para publicidade.</p>' +
    '<div class="cookie-bar__actions">' +
      '<button type="button" class="cookie-bar__btn" data-c="recusado">Recusar</button>' +
      '<button type="button" class="cookie-bar__btn cookie-bar__btn--gold" data-c="aceito">Aceitar</button>' +
    '</div>';
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('[data-c]');
    if (!b) return;
    store.set(b.dataset.c);
    if (b.dataset.c === 'aceito') loadGA();
    bar.classList.remove('is-visible');
    setTimeout(() => bar.remove(), 500);
  });
  document.body.appendChild(bar);
  // aparece depois da abertura do site (preloader)
  setTimeout(() => bar.classList.add('is-visible'), document.body.classList.contains('links-page') ? 600 : 2800);
})();
