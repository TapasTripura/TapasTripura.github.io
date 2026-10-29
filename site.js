/* ---------- Footer year ---------- */
document.getElementById('yr').textContent = new Date().getFullYear();

/* ---------- Portrait fallback: assets/photo.jpg, then GitHub avatar, then hide ---------- */
(function () {
  const img = document.getElementById('portrait');
  let step = 0;
  if (img) img.addEventListener('error', function () {
    if (step === 0) { step = 1; img.src = 'https://avatars.githubusercontent.com/u/44923288?v=4'; }
    else { img.style.display = 'none'; img.parentElement.style.gridTemplateColumns = '1fr'; }
  });
})();

/* ---------- Theme toggle ---------- */
(function () {
  const root = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  try { const saved = localStorage.getItem('theme'); if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved); } catch (e) {}
  document.getElementById('themeBtn').addEventListener('click', function () {
    const dark = root.getAttribute('data-theme') ? root.getAttribute('data-theme') === 'dark' : mq.matches;
    const next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    window.dispatchEvent(new Event('themechange'));
  });
  mq.addEventListener && mq.addEventListener('change', function () { window.dispatchEvent(new Event('themechange')); });
})();

/* ---------- Wavelet scope: signal, sliding Morlet wavelet and its continuous wavelet transform ---------- */
(function () {
  const cv = document.getElementById('wave');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = 320, NS = 56, W0 = 5, A_MIN = 4, A_MAX = 110;

  // Test signal: slow wave + chirp + short high-frequency burst + noise (seeded, so it is the same on every load)
  let seed = 11; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const sig = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    let v = 0.85 * Math.sin(2 * Math.PI * 2.5 * t);
    if (t > 0.07 && t < 0.42) v += 0.55 * Math.sin(2 * Math.PI * (9 * t + 38 * t * t)) * Math.sin(Math.PI * (t - 0.07) / 0.35);
    if (t > 0.62 && t < 0.78) v += 1.0 * Math.sin(2 * Math.PI * 46 * t) * Math.pow(Math.sin(Math.PI * (t - 0.62) / 0.16), 2);
    sig[i] = v + (rnd() - 0.5) * 0.18;
  }
  const scales = Array.from({ length: NS }, (_, k) => A_MIN * Math.pow(A_MAX / A_MIN, k / (NS - 1)));
  const scaleAt = kf => A_MIN * Math.pow(A_MAX / A_MIN, kf / (NS - 1));

  // Continuous wavelet transform magnitude, computed once. Row 0 = finest scale (highest frequency).
  const cwt = new Float32Array(NS * N);
  let cmax = 0;
  for (let k = 0; k < NS; k++) {
    const a = scales[k], half = Math.ceil(4 * a), norm = 1 / a;
    for (let b = 0; b < N; b++) {
      let re = 0, im = 0;
      const lo = Math.max(0, b - half), hi = Math.min(N - 1, b + half);
      for (let i = lo; i <= hi; i++) {
        const x = (i - b) / a, g = Math.exp(-x * x / 2) * sig[i];
        re += g * Math.cos(W0 * x); im += g * Math.sin(W0 * x);
      }
      const m = Math.sqrt(re * re + im * im) * norm;
      cwt[k * N + b] = m; if (m > cmax) cmax = m;
    }
  }

  const off = document.createElement('canvas'); off.width = N; off.height = NS;
  const octx = off.getContext('2d');
  const PAL = {
    light: ['#F3F6F6', '#BFE0E2', '#4FA3AB', '#0E6E78', '#243A8C'],
    dark:  ['#0F181C', '#16444D', '#2F8C95', '#6AD0D4', '#E8F8F9']
  };
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const ramp = (stops, u) => {
    const p = Math.min(0.9999, Math.max(0, u)) * (stops.length - 1), i = Math.floor(p), f = p - i;
    const a = hex(stops[i]), b = hex(stops[i + 1]);
    return [0, 1, 2].map(c => Math.round(a[c] + (b[c] - a[c]) * f));
  };

  let C = {};
  function theme() {
    const s = getComputedStyle(document.documentElement);
    const g = n => s.getPropertyValue(n).trim();
    const dark = s.colorScheme.indexOf('dark') !== -1 || g('--paper').toLowerCase() === '#0f181c';
    C = { ink: g('--ink'), muted: g('--muted'), paper: g('--paper'), surface: g('--surface'), indigo: g('--indigo'), line: g('--line') };
    const stops = dark ? PAL.dark : PAL.light;
    const img = octx.createImageData(N, NS);
    for (let k = 0; k < NS; k++) for (let b = 0; b < N; b++) {
      const rgb = ramp(stops, Math.pow(cwt[k * N + b] / cmax, 0.65));
      const o = (k * N + b) * 4; img.data[o] = rgb[0]; img.data[o + 1] = rgb[1]; img.data[o + 2] = rgb[2]; img.data[o + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
  }

  let cssW = 0, cssH = 0, dpr = 1;
  function size() {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cssW = Math.max(280, Math.round(r.width)); cssH = Math.round(r.height);
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const LABEL = 20, GAP = 10;
  function draw(b, kf) {
    const W = cssW, H = cssH;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.surface; ctx.fillRect(0, 0, W, H);
    const sigTop = LABEL, sigH = Math.round((H - 2 * LABEL - GAP) * 0.48);
    const scLabelY = sigTop + sigH + GAP, scTop = scLabelY + LABEL, scH = H - scTop;
    const xOf = i => i / (N - 1) * W;

    ctx.font = '500 11.5px "Instrument Sans", system-ui, sans-serif';
    ctx.textBaseline = 'alphabetic'; ctx.fillStyle = C.muted;
    ctx.fillText('Signal and wavelet', 12, 14);
    ctx.fillText(W < 600 ? 'Wavelet transform (fine detail on top)' : 'Wavelet transform: finer detail at the top, broader trends at the bottom', 12, scLabelY + 14);

    // signal
    const mid = sigTop + sigH / 2, amp = sigH / 2 / 2.3;
    ctx.save(); ctx.beginPath(); ctx.rect(0, sigTop, W, sigH); ctx.clip();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.85; ctx.lineWidth = 1.25; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i < N; i++) { const y = mid - sig[i] * amp; i ? ctx.lineTo(xOf(i), y) : ctx.moveTo(xOf(i), y); }
    ctx.stroke(); ctx.globalAlpha = 1;

    // wavelet at (b, a)
    const a = scaleAt(kf), half = 4 * a, i0 = Math.max(0, Math.floor(b - half)), i1 = Math.min(N - 1, Math.ceil(b + half));
    const wh = sigH * 0.40;
    ctx.fillStyle = C.indigo; ctx.globalAlpha = 0.14; ctx.beginPath();
    for (let i = i0; i <= i1; i++) { const x = (i - b) / a, y = mid - Math.exp(-x * x / 2) * wh; i === i0 ? ctx.moveTo(xOf(i), y) : ctx.lineTo(xOf(i), y); }
    for (let i = i1; i >= i0; i--) { const x = (i - b) / a, y = mid + Math.exp(-x * x / 2) * wh; ctx.lineTo(xOf(i), y); }
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.indigo; ctx.lineWidth = 2.25; ctx.beginPath();
    for (let i = i0; i <= i1; i++) { const x = (i - b) / a, y = mid - Math.exp(-x * x / 2) * Math.cos(W0 * x) * wh; i === i0 ? ctx.moveTo(xOf(i), y) : ctx.lineTo(xOf(i), y); }
    ctx.stroke(); ctx.restore();

    // transform
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, 0, scTop, W, scH);

    // position guide + marker
    const bx = xOf(b), by = scTop + (kf + 0.5) / NS * scH;
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.indigo; ctx.globalAlpha = 0.65; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, sigTop); ctx.lineTo(bx, H); ctx.stroke(); ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = C.paper; ctx.beginPath(); ctx.arc(bx, by, 6, 0, 6.2832); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = C.indigo; ctx.beginPath(); ctx.arc(bx, by, 6, 0, 6.2832); ctx.stroke();
  }

  // State: wavelet rests on the burst, drifts on its own, and follows the pointer when used
  const REST = { b: 0.70 * (N - 1), k: 6 };
  let cur = { b: REST.b, k: REST.k }, manual = false, timer = 0, raf = 0, visible = true;
  function auto(t) {
    const u = (Math.sin(t * 0.00022 - 1.2) + 1) / 2;
    return { b: (0.06 + 0.88 * u) * (N - 1), k: 26 + 20 * Math.sin(t * 0.0006 + 1) };
  }
  function frame(t) {
    raf = 0;
    if (!manual && !reduce) cur = auto(t);
    draw(cur.b, cur.k);
    if (!reduce && !manual && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  function point(e) {
    const r = cv.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    cur = { b: x * (N - 1), k: y * (NS - 1) };
    manual = true; clearTimeout(timer);
    timer = setTimeout(function () { manual = false; kick(); }, 2500);
    kick();
  }
  cv.addEventListener('pointermove', point);
  cv.addEventListener('pointerdown', point);

  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }).observe(cv);
  document.addEventListener('visibilitychange', kick);
  window.addEventListener('themechange', function () { theme(); kick(); });
  new ResizeObserver(function () { size(); kick(); }).observe(cv);

  theme(); size(); draw(cur.b, cur.k); kick();
})();

/* ---------- Publications ---------- */
(function () {
  // [year, type, authors, title, venue, doi]
  const P = [
    [2026, 'journal', 'T. Tripura, S. Chakraborty', 'Learning to predict and control with sparse model discovery and deep temporal difference reinforcement learning', 'Mechanical Systems and Signal Processing, vol. 251, 114226', '10.1016/j.ymssp.2026.114226'],
    ['Submitted', 'submitted', 'T. Tripura, S. Chakraborty', 'FlowMARL: Model-agnostic reinforcement learning for active flow control', 'Manuscript submitted', ''],

    [2025, 'journal', 'T. Tripura, S. Chakraborty', 'Neural combinatorial wavelet neural operator for catastrophic forgetting free in-context operator learning of multiple partial differential equations', 'Computer Physics Communications, 109882', '10.1016/j.cpc.2025.109882'],
    [2025, 'journal', 'H. Soin, T. Tripura, S. Chakraborty', 'Generative flow induced neural architecture search: Towards discovering optimal architecture in wavelet neural operator', 'Computer Physics Communications, 109755', '10.1016/j.cpc.2025.109755'],
    [2025, 'journal', 'J. Rani, T. Tripura, H. Kodamana, S. Chakraborty', 'Generative adversarial wavelet neural operator with applications to fault detection and isolation of multivariate time series data', 'Control Engineering Practice, vol. 165, 106548', '10.1016/j.conengprac.2025.106548'],
    [2025, 'journal', 'R. Kumar, T. Tripura, S. Chakraborty, S. Roy', 'Deep muscle electromyogram construction using a physics-integrated deep learning approach', 'Engineering Applications of Artificial Intelligence, vol. 159, 111613', '10.1016/j.engappai.2025.111613'],

    [2024, 'journal', 'T. Tripura, A. Thakur, S. Chakraborty', 'Multi-fidelity wavelet neural operator surrogate model for time-independent and time-dependent reliability analysis', 'Probabilistic Engineering Mechanics, vol. 77, 103672', '10.1016/j.probengmech.2024.103672'],
    [2024, 'journal', 'T. Tripura, S. Chakraborty', 'Discovering interpretable Lagrangian of dynamical systems from data', 'Computer Physics Communications, vol. 294, 108960', '10.1016/j.cpc.2023.108960'],
    [2024, 'journal', 'N. Navaneeth, T. Tripura, S. Chakraborty', 'Physics informed WNO', 'Computer Methods in Applied Mechanics and Engineering, vol. 418, 116546', '10.1016/j.cma.2023.116546'],
    [2024, 'journal', 'T. Tripura, S. Chakraborty', 'A Bayesian framework for discovering interpretable Lagrangian of dynamical systems from data', 'Mechanical Systems and Signal Processing, vol. 221, 111737', '10.1016/j.ymssp.2024.111737'],
    [2024, 'journal', 'T. Tripura, S. Panda, B. Hazra, S. Chakraborty', 'Data-driven discovery of interpretable Lagrangian of stochastically excited dynamical systems', 'Computer Methods in Applied Mechanics and Engineering, vol. 427, 117032', '10.1016/j.cma.2024.117032'],
    [2024, 'journal', 'Q. Cao, S. Goswami, T. Tripura, S. Chakraborty, G. E. Karniadakis', 'Deep neural operators can predict the real-time response of floating offshore structures under irregular waves', 'Computers & Structures, vol. 291, 107228', '10.1016/j.compstruc.2023.107228'],
    [2024, 'journal', 'Y. C. Mathpati, T. Tripura, R. Nayek, S. Chakraborty', 'Discovering stochastic partial differential equations from limited data using variational Bayes inference', 'Computer Methods in Applied Mechanics and Engineering, 116512', '10.1016/j.cma.2023.116512'],

    [2023, 'journal', 'T. Tripura, S. Chakraborty', 'Wavelet neural operator for solving parametric partial differential equations in computational mechanics problems', 'Computer Methods in Applied Mechanics and Engineering, vol. 404, 115783', '10.1016/j.cma.2022.115783'],
    [2023, 'journal', 'T. Tripura, A. Awasthi, S. Roy, S. Chakraborty', 'A wavelet neural operator based elastography for localization and quantification of tumors', 'Computer Methods and Programs in Biomedicine, vol. 232, 107436', '10.1016/j.cmpb.2023.107436'],
    [2023, 'journal', 'T. Tripura, S. Chakraborty', 'A sparse Bayesian framework for discovering interpretable nonlinear stochastic dynamical systems with Gaussian white noise', 'Mechanical Systems and Signal Processing, vol. 187, 109939', '10.1016/j.ymssp.2022.109939'],
    [2023, 'journal', 'T. Tripura, S. Chakraborty', 'Robust model agnostic predictive control algorithm for randomly excited dynamical systems', 'Probabilistic Engineering Mechanics, vol. 74, 103517', '10.1016/j.probengmech.2023.103517'],
    [2023, 'journal', 'T. Tripura, A. S. Desai, S. Adhikari, S. Chakraborty', 'Probabilistic machine learning based predictive and interpretable digital twin for dynamical systems', 'Computers & Structures, vol. 281, 107008', '10.1016/j.compstruc.2023.107008'],
    [2023, 'journal', 'J. Rani, T. Tripura, H. Kodamana, S. Chakraborty, P. K. Tamboli', 'Fault detection and isolation using probabilistic wavelet neural operator auto-encoder with application to dynamic processes', 'Process Safety and Environmental Protection, vol. 173, pp. 215–228', '10.1016/j.psep.2023.02.078'],
    [2023, 'journal', 'Y. C. Mathpati, K. S. More, T. Tripura, R. Nayek, S. Chakraborty', 'MAntRA: A framework for model agnostic reliability analysis', 'Reliability Engineering & System Safety, vol. 235, 109233', '10.1016/j.ress.2023.109233'],
    [2023, 'journal', 'K. S. More, T. Tripura, R. Nayek, S. Chakraborty', 'A Bayesian framework for learning governing partial differential equation from data', 'Physica D: Nonlinear Phenomena, vol. 456, 133927', '10.1016/j.physd.2023.133927'],
    [2023, 'journal', 'T. Tripura, B. Hazra, S. Chakraborty', 'Novel Girsanov correction based Milstein schemes for analysis of nonlinear multi-dimensional stochastic dynamical systems', 'Applied Mathematical Modelling, vol. 122, pp. 350–372', '10.1016/j.apm.2023.05.041'],
    [2023, 'chapter', 'T. Tripura, S. Garg, S. Chakraborty', 'Digital twin for dynamical systems', 'In Machine Learning in Modeling and Simulation: Methods and Applications, Springer, pp. 255–296', '10.1007/978-3-031-36644-4_7'],

    [2022, 'journal', 'T. Tripura, M. Imran, B. Hazra, S. Chakraborty', 'Change of measure enhanced near-exact Euler–Maruyama scheme for the solution to nonlinear stochastic dynamical systems', 'Journal of Engineering Mechanics, vol. 148, no. 6, 04022025', '10.1061/(asce)em.1943-7889.0002107'],
    [2022, 'journal', 'S. Panda, T. Tripura, B. Hazra', 'Online damage detection of earthquake-excited structure based on near real-time envelope extraction', 'Structural Health Monitoring, vol. 21, no. 2, pp. 298–319', '10.1177/1475921721997068'],

    [2021, 'journal', 'S. Panda, T. Tripura, B. Hazra', 'First-order error-adapted eigen perturbation for real-time modal identification of vibrating structures', 'Journal of Vibration and Acoustics, vol. 143, no. 5, 051001', '10.1115/1.4049268'],

    [2020, 'journal', 'T. Tripura, B. Bhowmik, V. Pakrashi, B. Hazra', 'Real-time damage detection of degrading systems', 'Structural Health Monitoring, vol. 19, no. 3, pp. 810–837', '10.1177/1475921719861801'],
    [2020, 'journal', 'T. Tripura, A. Gogoi, B. Hazra', 'An Itô–Taylor weak 3.0 method for stochastic dynamics of nonlinear systems', 'Applied Mathematical Modelling, vol. 86, pp. 115–141', '10.1016/j.apm.2020.05.014'],
    [2020, 'journal', 'B. Bhowmik, T. Tripura, B. Hazra, V. Pakrashi', 'Real time structural modal identification using recursive canonical correlation analysis and application towards online structural damage detection', 'Journal of Sound and Vibration, vol. 468, 115101', '10.1016/j.jsv.2019.115101'],
    [2020, 'journal', 'B. Bhowmik, T. Tripura, B. Hazra, V. Pakrashi', 'Robust linear and nonlinear structural damage detection using recursive canonical correlation analysis', 'Mechanical Systems and Signal Processing, vol. 136, 106499', '10.1016/j.ymssp.2019.106499'],

    [2019, 'journal', 'B. Bhowmik, T. Tripura, B. Hazra, V. Pakrashi', 'First-order eigen-perturbation techniques for real-time damage detection of vibrating systems: Theory and applications', 'Applied Mechanics Reviews, vol. 71, no. 6, 060801', '10.1115/1.4044287'],

    [2024, 'conference', 'T. Tripura, S. Chakraborty', 'Predictive and interpretable digital twin for dynamical systems', '68th Congress of the Indian Society of Theoretical and Applied Mechanics (ISTAM 2024), NIT Warangal', ''],
    [2024, 'conference', 'T. Tripura, N. N, S. Chakraborty', 'Physics-informed wavelet neural operator for data-free learning of parametric partial differential equations', '9th European Congress on Computational Methods in Applied Sciences and Engineering (ECCOMAS 2024), Lisbon, Portugal', ''],
    [2023, 'conference', 'T. Tripura, S. Chakraborty', 'Sparse system identification of dynamical systems from output-only measurements', '9th International Conference on Computational Methods in Structural Dynamics and Earthquake Engineering (COMPDYN 2023)', ''],
    [2023, 'conference', 'T. Tripura, S. Kumar, S. Chakraborty', 'Wavelet neural operator for reliability analysis', '9th International Congress on Computational Mechanics and Simulations (ICCMS 2023), IIT Gandhinagar', ''],
    [2022, 'conference', 'T. Tripura, B. Hazra, S. Chakraborty', 'Near-exact Euler–Maruyama for solving nonlinear systems in stochastic dynamics', '5th Indian Conference on Applied Mechanics (INCAM 2022), NIT Jamshedpur', ''],
    [2019, 'conference', 'B. Bhowmik, T. Tripura, B. Hazra, V. Pakrashi', 'Damage detection under progressive operational degradation of structures in real time', '8th International Operational Modal Analysis Conference (IOMAC 2019), pp. 137–145', '']
  ].map(r => ({ y: r[0], t: r[1], a: r[2], ti: r[3], v: r[4], d: r[5] }));

  const list = document.getElementById('list'), count = document.getElementById('count');
  const q = document.getElementById('q'), seg = document.getElementById('seg');
  if (!list) return;
  let type = 'all';
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const authors = s => esc(s).replace(/T\. Tripura/g, '<strong>T. Tripura</strong>');
  const tl = { journal: 'journal article', conference: 'conference paper', chapter: 'book chapter', submitted: 'submitted manuscript' };

  function render() {
    const term = q.value.trim().toLowerCase();
    const rows = P.filter(p => (type === 'all' || p.t === type) &&
      (!term || (p.a + ' ' + p.ti + ' ' + p.v + ' ' + p.y + ' ' + p.d).toLowerCase().includes(term)));
    const groups = new Map();
    rows.forEach(p => { if (!groups.has(p.y)) groups.set(p.y, []); groups.get(p.y).push(p); });
    const keys = [...groups.keys()].sort((a, b) => (a === 'Submitted') ? -1 : (b === 'Submitted') ? 1 : b - a);
    list.innerHTML = keys.map(k => '<h3>' + k + '</h3><ol>' + groups.get(k).map(p => {
      const title = p.d ? '<a href="https://doi.org/' + p.d + '" target="_blank" rel="noopener">' + esc(p.ti) + '</a>' : esc(p.ti);
      return '<li><span class="ti">' + title + '</span><span class="au">' + authors(p.a) + '</span><span class="ve">' + esc(p.v) + '</span>' + (p.d ? '<span class="doi">DOI: <a href="https://doi.org/' + p.d + '" target="_blank" rel="noopener">' + esc(p.d) + '</a></span>' : '') + '</li>';
    }).join('') + '</ol>').join('') || '<p class="empty">No publications match. Clear the search or choose another type.</p>';
    const n = rows.length;
    count.textContent = n + ' ' + (type === 'all' ? 'publication' : tl[type]) + (n === 1 ? '' : 's') + (term ? ' matching “' + q.value.trim() + '”' : '');
  }
  seg.addEventListener('click', function (e) {
    const b = e.target.closest('button'); if (!b) return;
    type = b.dataset.t;
    seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render();
  });
  q.addEventListener('input', render);
  render();
})();

/* ---------- Framework gallery ---------- */
(function () {
  const root = document.getElementById('frameworks'); if (!root) return;
  const track = root.querySelector('.track'), slides = [].slice.call(track.children);
  const prev = root.querySelector('.prev'), next = root.querySelector('.next'), dotsEl = root.querySelector('.dots');
  const count = root.querySelector('.gcount'), play = root.querySelector('.play');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = slides.length;
  let idx = 0, playing = !reduce, hover = false, visible = true, raf = 0;
  slides.forEach(function (s, i) {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Show slide ' + (i + 1));
    b.addEventListener('click', function () { stop(); go(i); }); dotsEl.appendChild(b);
  });
  function paint() {
    [].forEach.call(dotsEl.children, function (b, i) { b.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
    count.textContent = (idx + 1) + ' of ' + n;
  }
  function sync() { play.textContent = playing ? 'Pause' : 'Play'; }
  function stop() { playing = false; sync(); }
  function go(i, instant) {
    idx = (i + n) % n;
    track.scrollTo({ left: idx * track.clientWidth, behavior: (reduce || instant) ? 'auto' : 'smooth' });
    paint();
  }
  prev.addEventListener('click', function () { stop(); go(idx - 1); });
  next.addEventListener('click', function () { stop(); go(idx + 1); });
  play.addEventListener('click', function () { playing = !playing; sync(); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); go(idx - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); stop(); go(idx + 1); }
  });
  track.addEventListener('scroll', function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== idx && i >= 0 && i < n) { idx = i; paint(); }
    });
  }, { passive: true });
  track.addEventListener('pointerdown', stop);
  root.addEventListener('mouseenter', function () { hover = true; });
  root.addEventListener('mouseleave', function () { hover = false; });
  root.addEventListener('focusin', function () { hover = true; });
  root.addEventListener('focusout', function () { hover = false; });
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.3 }).observe(root);
  window.addEventListener('resize', function () { go(idx, true); });
  setInterval(function () { if (playing && visible && !hover && !document.hidden) go(idx + 1); }, 7000);
  sync(); paint();
})();
