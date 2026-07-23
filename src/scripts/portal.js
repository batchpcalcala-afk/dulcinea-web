/* ================================================================
   El Viaje de Dulcinea — interacción y animación del portal
   Los datos llegan renderizados por Astro desde src/data/etapas.json
   ================================================================ */
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const { etapas: ETAPAS, iActual } = JSON.parse(document.getElementById('datos-etapas').textContent);
const ROM = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
const ESTADO_TXT = {
  publicado: 'Capítulo ya escrito y publicado',
  actual: 'Aquí se halla hoy Dulcinea',
  futuro: 'Aún por escribir',
};

/* ---------- motas doradas flotando en el héroe ---------- */
try {
  const c = document.getElementById('motas'), x = c.getContext('2d');
  let W, H, motas = [];
  function resize() {
    W = c.width = c.offsetWidth; H = c.height = c.offsetHeight;
    motas = Array.from({ length: Math.min(70, W / 14) }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.2 + 0.6,
      a: Math.random() * 6, v: 0.006 + Math.random() * 0.012,
      dx: -0.08 - Math.random() * 0.18, dy: -0.05 - Math.random() * 0.12 }));
  }
  resize(); addEventListener('resize', resize);
  function draw() {
    x.clearRect(0, 0, W, H);
    for (const m of motas) {
      m.a += m.v; m.x += m.dx; m.y += m.dy;
      if (m.x < -5) m.x = W + 5; if (m.y < -5) m.y = H + 5;
      x.globalAlpha = 0.15 + Math.abs(Math.sin(m.a)) * 0.5;
      x.fillStyle = '#F7D488'; x.beginPath(); x.arc(m.x, m.y, m.r, 0, 7); x.fill();
    }
    x.globalAlpha = 1; if (!REDUCE) requestAnimationFrame(draw);
  }
  draw();
} catch (e) { console.error('motas:', e); }

/* ---------- revelado por scroll ---------- */
const obs = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.revela').forEach((el) => obs.observe(el));

/* ---------- insignia del año: viaje temporal con el scroll ---------- */
const badge = document.getElementById('ano-badge'), anoNum = document.getElementById('ano-num');
addEventListener('scroll', () => {
  const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
  const p = Math.min(1, Math.max(0, h.scrollTop / max));
  anoNum.textContent = Math.round(1616 + (2026 - 1616) * p);
  badge.classList.toggle('visible', h.scrollTop > innerHeight * 0.55);
}, { passive: true });

/* ---------- panel de detalle de etapa ---------- */
/* ---------- panel de detalle con jornadas (YouTube + Instagram) ----------
   Sustituye la función verEtapa en src/scripts/portal.js
   Busca "function verEtapa(i) {" y reemplaza todo el bloque hasta el siguiente "}"
*/
function verEtapa(i) {
  const e = ETAPAS[i];
  const panel = document.getElementById('detalle-etapa');
  let jornadasHTML = '';
  if (e.jornadas && e.jornadas.length) {
    jornadasHTML = '<div class="apartados">' + e.jornadas.map((a, j) => {
      const num = `${ROM[i]}.${j + 1}`;
      const tieneYT = !!a.url;
      const tieneIG = !!a.instagram;
      if (tieneYT || tieneIG) {
        return `<div class="apartado publicado-ap">
          <span class="ap-num">${num}</span>
          <span class="ap-tit">${a.titulo}</span>
          <span class="ap-botones">
            ${tieneYT ? `<a class="ap-btn ap-yt" href="${a.url}" target="_blank" rel="noopener">▶ YouTube</a>` : ''}
            ${tieneIG ? `<a class="ap-btn ap-ig" href="${a.instagram}" target="_blank" rel="noopener">◈ Instagram</a>` : ''}
          </span>
        </div>`;
      } else {
        return `<div class="apartado">
          <span class="ap-num">${num}</span>
          <span class="ap-tit">${a.titulo}</span>
          <span class="ap-estado">⏳ Jornada aún por escribir</span>
        </div>`;
      }
    }).join('') + '</div>';
  } else if (e.estado === 'actual') {
    jornadasHTML = '<div class="sin-video">❧ Las jornadas deste capítulo se están escribiendo en este preciso instante.</div>';
  } else {
    jornadasHTML = '<div class="sin-video">❧ Las jornadas deste capítulo se revelarán cuando Dulcinea llegue a la villa.</div>';
  }
  panel.innerHTML = `
    <span class="num">Capítulo ${ROM[i]} · ${ESTADO_TXT[e.estado]}</span>
    <h3>${e.muni}</h3>
    <div class="ano-det">Año de ${e.ano}</div>
    <p>${e.txt}</p>
    <div class="patrimonio-det">${e.pat}</div>
    ${jornadasHTML}`;
  panel.classList.add('visible');
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
}



document.querySelectorAll('#capitulos .fila-cap').forEach((card) =>
  card.addEventListener('click', () => {
    verEtapa(Number(card.dataset.etapa));
    document.getElementById('detalle-etapa').scrollIntoView({ behavior: 'smooth' });
  }));

/* ---------- mapa ilustrado: marcadores, itinerario y destacados ---------- */
document.querySelectorAll('.marcador').forEach((m) => {
  m.addEventListener('click', () => verEtapa(Number(m.dataset.etapa)));
});
document.querySelectorAll('.itinerario li, .destacado').forEach((el) => {
  el.addEventListener('click', () => {
    verEtapa(Number(el.dataset.etapa));
    document.getElementById('detalle-etapa').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
/* los marcadores brotan uno a uno al entrar el mapa en pantalla */
const marcadores = document.querySelectorAll('.marcador');
if (REDUCE) marcadores.forEach((m) => m.classList.add('in'));
else {
  const obsM = new IntersectionObserver((es) => {
    if (!es[0].isIntersecting) return;
    obsM.disconnect();
    marcadores.forEach((m) => m.classList.add('in'));
  }, { threshold: 0.3 });
  obsM.observe(document.getElementById('mapa-cuadro'));
}
