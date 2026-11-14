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

/* ---------- Publications ---------- */
(function () {
  // [year, type, authors, title, venue, doi]
  const P = [
    [2026, 'journal', 'T. Tripura, S. Chakraborty', 'Learning to predict and control with sparse model discovery and deep temporal difference reinforcement learning', 'Mechanical Systems and Signal Processing, vol. 251, 114226', '10.1016/j.ymssp.2026.114226', ['csccm-iitd/MAPTD']],
    ['Submitted', 'submitted', 'T. Tripura, S. Chakraborty', 'FlowMARL: Model-agnostic reinforcement learning for active flow control', 'Manuscript submitted', ''],

    [2025, 'journal', 'T. Tripura, S. Chakraborty', 'Neural combinatorial wavelet neural operator for catastrophic forgetting free in-context operator learning of multiple partial differential equations', 'Computer Physics Communications, 109882', '10.1016/j.cpc.2025.109882', ['NCWNO']],
    [2025, 'journal', 'H. Soin, T. Tripura, S. Chakraborty', 'Generative flow induced neural architecture search: Towards discovering optimal architecture in wavelet neural operator', 'Computer Physics Communications, 109755', '10.1016/j.cpc.2025.109755', ['csccm-iitd/FWNO']],
    [2025, 'journal', 'J. Rani, T. Tripura, H. Kodamana, S. Chakraborty', 'Generative adversarial wavelet neural operator with applications to fault detection and isolation of multivariate time series data', 'Control Engineering Practice, vol. 165, 106548', '10.1016/j.conengprac.2025.106548'],
    [2025, 'journal', 'R. Kumar, T. Tripura, S. Chakraborty, S. Roy', 'Deep muscle electromyogram construction using a physics-integrated deep learning approach', 'Engineering Applications of Artificial Intelligence, vol. 159, 111613', '10.1016/j.engappai.2025.111613'],

    [2024, 'journal', 'T. Tripura, A. Thakur, S. Chakraborty', 'Multi-fidelity wavelet neural operator surrogate model for time-independent and time-dependent reliability analysis', 'Probabilistic Engineering Mechanics, vol. 77, 103672', '10.1016/j.probengmech.2024.103672', ['MFWNO']],
    [2024, 'journal', 'T. Tripura, S. Chakraborty', 'Discovering interpretable Lagrangian of dynamical systems from data', 'Computer Physics Communications, vol. 294, 108960', '10.1016/j.cpc.2023.108960', ['Lagrange_Discovery_CPC']],
    [2024, 'journal', 'N. Navaneeth, T. Tripura, S. Chakraborty', 'Physics informed WNO', 'Computer Methods in Applied Mechanics and Engineering, vol. 418, 116546', '10.1016/j.cma.2023.116546', ['PIWNO---Physics-Informed-Wavelet-Neural-Operator-']],
    [2024, 'journal', 'T. Tripura, S. Chakraborty', 'A Bayesian framework for discovering interpretable Lagrangian of dynamical systems from data', 'Mechanical Systems and Signal Processing, vol. 221, 111737', '10.1016/j.ymssp.2024.111737', ['Bayesian-Lagrangian-Discovery']],
    [2024, 'journal', 'T. Tripura, S. Panda, B. Hazra, S. Chakraborty', 'Data-driven discovery of interpretable Lagrangian of stochastically excited dynamical systems', 'Computer Methods in Applied Mechanics and Engineering, vol. 427, 117032', '10.1016/j.cma.2024.117032', ['Lagrangian-Discovery-Stochastic-Systems']],
    [2024, 'journal', 'Q. Cao, S. Goswami, T. Tripura, S. Chakraborty, G. E. Karniadakis', 'Deep neural operators can predict the real-time response of floating offshore structures under irregular waves', 'Computers & Structures, vol. 291, 107228', '10.1016/j.compstruc.2023.107228'],
    [2024, 'journal', 'Y. C. Mathpati, T. Tripura, R. Nayek, S. Chakraborty', 'Discovering stochastic partial differential equations from limited data using variational Bayes inference', 'Computer Methods in Applied Mechanics and Engineering, 116512', '10.1016/j.cma.2023.116512', ['Stochastic-PDE-Discovery']],

    [2023, 'journal', 'T. Tripura, S. Chakraborty', 'Wavelet neural operator for solving parametric partial differential equations in computational mechanics problems', 'Computer Methods in Applied Mechanics and Engineering, vol. 404, 115783', '10.1016/j.cma.2022.115783', ['WNO', 'WNO-V3']],
    [2023, 'journal', 'T. Tripura, A. Awasthi, S. Roy, S. Chakraborty', 'A wavelet neural operator based elastography for localization and quantification of tumors', 'Computer Methods and Programs in Biomedicine, vol. 232, 107436', '10.1016/j.cmpb.2023.107436', ['WNO-elastography']],
    [2023, 'journal', 'T. Tripura, S. Chakraborty', 'A sparse Bayesian framework for discovering interpretable nonlinear stochastic dynamical systems with Gaussian white noise', 'Mechanical Systems and Signal Processing, vol. 187, 109939', '10.1016/j.ymssp.2022.109939', ['Learning-physics-from-output-only-data']],
    [2023, 'journal', 'T. Tripura, S. Chakraborty', 'Robust model agnostic predictive control algorithm for randomly excited dynamical systems', 'Probabilistic Engineering Mechanics, vol. 74, 103517', '10.1016/j.probengmech.2023.103517', ['RoMAn-Model-Predictive-Control']],
    [2023, 'journal', 'T. Tripura, A. S. Desai, S. Adhikari, S. Chakraborty', 'Probabilistic machine learning based predictive and interpretable digital twin for dynamical systems', 'Computers & Structures, vol. 281, 107008', '10.1016/j.compstruc.2023.107008', ['Interpretable-DT']],
    [2023, 'journal', 'J. Rani, T. Tripura, H. Kodamana, S. Chakraborty, P. K. Tamboli', 'Fault detection and isolation using probabilistic wavelet neural operator auto-encoder with application to dynamic processes', 'Process Safety and Environmental Protection, vol. 173, pp. 215–228', '10.1016/j.psep.2023.02.078'],
    [2023, 'journal', 'Y. C. Mathpati, K. S. More, T. Tripura, R. Nayek, S. Chakraborty', 'MAntRA: A framework for model agnostic reliability analysis', 'Reliability Engineering & System Safety, vol. 235, 109233', '10.1016/j.ress.2023.109233', ['csccm-iitd/MAntRA']],
    [2023, 'journal', 'K. S. More, T. Tripura, R. Nayek, S. Chakraborty', 'A Bayesian framework for learning governing partial differential equation from data', 'Physica D: Nonlinear Phenomena, vol. 456, 133927', '10.1016/j.physd.2023.133927', ['Bayesian-Discovery-of-PDEs']],
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
  ].map(r => ({ y: r[0], t: r[1], a: r[2], ti: r[3], v: r[4], d: r[5], c: r[6] || [] }));

  const list = document.getElementById('list'), count = document.getElementById('count');
  const q = document.getElementById('q'), seg = document.getElementById('seg');
  const hasList = !!list;
  let type = 'all';
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const authors = s => esc(s).replace(/T\. Tripura/g, '<strong>T. Tripura</strong>');
  const tl = { journal: 'journal article', conference: 'conference paper', chapter: 'book chapter', submitted: 'submitted manuscript' };

  const GH = '<svg class="gh" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
  function ext(p) {
    const doi = p.d ? '<a class="chip chip-doi" href="https://doi.org/' + p.d + '" target="_blank" rel="noopener" title="Open the paper"><span class="k">DOI</span>' + esc(p.d) + '</a>' : '';
    const code = p.c.map(function (r) { return '<a class="chip chip-code" href="https://github.com/' + (r.indexOf('/') < 0 ? 'TapasTripura/' : '') + r + '" target="_blank" rel="noopener" title="Open the code on GitHub">' + GH + '<span class="k">Code</span>' + esc(r.split('/').pop().split('---')[0]) + '</a>'; }).join('');
    const ab = (window.ABSTRACTS || {})[p.d || p.ti];
    const abs = ab ? '<button type="button" class="chip chip-abs" aria-expanded="false" aria-controls="abs-' + P.indexOf(p) + '" title="Show the abstract"><span class="k">ABS</span><svg class="cv" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' : '';
    return (doi || code || abs) ? '<span class="ext">' + doi + code + abs + '</span>' : '';
  }

  const ABBR = [['Computer Methods in Applied Mechanics and Engineering', 'CMAME'], ['Computer Physics Communications', 'CPC'], ['Mechanical Systems and Signal Processing', 'MSSP'], ['Probabilistic Engineering Mechanics', 'PEM'], ['Control Engineering Practice', 'CEP'], ['Engineering Applications of Artificial Intelligence', 'EAAI'], ['Computers & Structures', 'C&S'], ['Computer Methods and Programs in Biomedicine', 'CMPB'], ['Process Safety and Environmental Protection', 'PSEP'], ['Reliability Engineering & System Safety', 'RESS'], ['Physica D', 'Physica D'], ['Applied Mathematical Modelling', 'AMM'], ['Journal of Engineering Mechanics', 'JEM'], ['Structural Health Monitoring', 'SHM'], ['Journal of Vibration and Acoustics', 'JVA'], ['Journal of Sound and Vibration', 'JSV'], ['Applied Mechanics Reviews', 'AMR']];
  function abbr(p) {
    if (p.t === 'chapter') return 'Springer';
    if (p.t === 'submitted') return 'Submitted';
    for (let i = 0; i < ABBR.length; i++) if (p.v.indexOf(ABBR[i][0]) === 0) return ABBR[i][1];
    const i = p.v.lastIndexOf('('), j = p.v.indexOf(' ', i);
    return (i >= 0 && j > i) ? p.v.slice(i + 1, j) : p.v.split(' ')[0];
  }
  function kind(p) {
    const s = p.ti.toLowerCase();
    if (/digital twin/.test(s)) return 'twin';
    if (/reliab/.test(s)) return 'reliab';
    if (/reinforcement|control|predictive/.test(s)) return 'control';
    if (/damage|modal|eigen|structural health|canonical correlation/.test(s)) return 'shm';
    if (/operator|wavelet|wno/.test(s)) return 'operator';
    if (/discover|lagrangian|governing|identif|sparse/.test(s)) return 'disc';
    if (/stochastic|milstein|maruyama|taylor|girsanov/.test(s)) return 'stoch';
    return 'gen';
  }
  function pts(f, a, b, n) { let d = ''; for (let i = 0; i <= n; i++) { const x = a + i * (b - a) / n; d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + f(x).toFixed(1); } return d; }
  function walk(seed) { let s = seed, y = 50, d = 'M8 50'; for (let i = 1; i <= 28; i++) { s = (s * 16807) % 2147483647; y += (s / 2147483647 - 0.5) * 18; y = Math.max(18, Math.min(82, y)); d += 'L' + (8 + i * 3).toFixed(1) + ' ' + y.toFixed(1); } return d; }
  const bell = function (x) { return 80 - 56 * Math.exp(-Math.pow((x - 42) / 17, 2)); };
  const GL = {
    operator: '<path d="M8 50H92" class="gl faint"/><path d="' + pts(function (x) { return 50 - 28 * Math.exp(-Math.pow((x - 50) / 15, 2)) * Math.cos((x - 50) * 0.62); }, 8, 92, 90) + '" class="ga2"/>',
    disc: '<path d="M8 82H92" class="gl faint"/>' + [[14, 0.9], [26, 0], [38, 0.6], [50, 0], [62, 0.3], [74, 0], [86, 0.12]].map(function (s) { const y = 82 - 56 * s[1]; return '<path d="M' + s[0] + ' 82V' + y + '" class="gl"/><circle cx="' + s[0] + '" cy="' + y + '" r="3.2" class="ga"/>'; }).join(''),
    control: '<rect x="10" y="18" width="32" height="22" rx="4" class="gl"/><rect x="58" y="18" width="32" height="22" rx="4" class="ga2"/><path d="M42 29H58M54 25L58 29L54 33" class="gl"/><path d="M90 29H96V72H26V40M22 36L26 40L30 36" class="gl"/>',
    twin: '<rect x="10" y="30" width="32" height="32" rx="4" class="gl"/><rect x="58" y="30" width="32" height="32" rx="4" class="gl dash"/><path d="M45 46H55M51 42L55 46L51 50M49 42L45 46L49 50" class="ga2"/><circle cx="26" cy="46" r="4" class="ga"/>',
    shm: '<path d="M28 18V82M72 18V82M28 34H72M28 54H72M28 74H72" class="gl"/><path d="M28 38l6 4-6 4 6 4-6 4" class="ga2"/>',
    stoch: '<path d="' + walk(7) + '" class="gl faint"/><path d="' + walk(11) + '" class="gl faint"/><path d="' + walk(23) + '" class="ga2"/>',
    reliab: '<path d="M8 80H92" class="gl faint"/><path d="' + pts(bell, 8, 92, 90) + '" class="gl"/><path d="M62 80' + pts(bell, 62, 92, 30).replace('M', 'L') + 'L92 80Z" class="gf"/><path d="M62 24V80" class="ga2 dash"/>',
    gen: [20, 50, 80].map(function (y) { return [20, 50, 80].map(function (x) { const c = x === 50 && y === 50; return '<circle cx="' + x + '" cy="' + y + '" r="' + (c ? 5 : 3.2) + '" class="' + (c ? 'ga' : 'gd') + '"/>'; }).join(''); }).join('')
  };
  function thumb(p) {
    const t = (window.THUMBS || {})[p.d || p.ti];
    if (t) return '<a class="thumb real" href="' + t.f + '" target="_blank" rel="noopener" title="Open the figure full size"><img src="' + t.s + '" alt="' + esc('Main figure of the paper: ' + p.ti) + '" loading="lazy" decoding="async"></a>';
    return '<span class="thumb tile" aria-hidden="true"><svg viewBox="0 0 100 100" focusable="false">' + GL[kind(p)] + '</svg><span class="tl">' + esc(abbr(p) + (typeof p.y === 'number' ? ' ' + p.y : '')) + '</span></span>';
  }

  function panel(p) {
    const ab = (window.ABSTRACTS || {})[p.d || p.ti];
    if (!ab) return '';
    const more = (ab.c && p.d) ? '<a class="abs-more" href="https://doi.org/' + p.d + '" target="_blank" rel="noopener">Read the full abstract</a>' : '';
    return '<div class="abs" id="abs-' + P.indexOf(p) + '" role="region" aria-label="Abstract"><div class="abs-in"><p>' + esc(ab.t) + '</p>' + more + '</div></div>';
  }

  function render() {
    const term = q.value.trim().toLowerCase();
    const rows = P.filter(p => (type === 'all' || p.t === type) &&
      (!term || (p.a + ' ' + p.ti + ' ' + p.v + ' ' + p.y + ' ' + p.d + ' ' + p.c.join(' ')).toLowerCase().includes(term)));
    const groups = new Map();
    rows.forEach(p => { if (!groups.has(p.y)) groups.set(p.y, []); groups.get(p.y).push(p); });
    const keys = [...groups.keys()].sort((a, b) => (a === 'Submitted') ? -1 : (b === 'Submitted') ? 1 : b - a);
    list.innerHTML = keys.map(k => '<h3>' + k + '</h3><ol>' + groups.get(k).map(p => {
      const title = p.d ? '<a href="https://doi.org/' + p.d + '" target="_blank" rel="noopener">' + esc(p.ti) + '</a>' : esc(p.ti);
      return '<li class="pub">' + thumb(p) + '<div class="pb"><span class="ti">' + title + '</span><span class="au">' + authors(p.a) + '</span><span class="ve">' + esc(p.v) + '</span>' + ext(p) + panel(p) + '</div></li>';
    }).join('') + '</ol>').join('') || '<p class="empty">No publications match. Clear the search or choose another type.</p>';
    const n = rows.length;
    count.textContent = n + ' ' + (type === 'all' ? 'publication' : tl[type]) + (n === 1 ? '' : 's') + (term ? ' matching “' + q.value.trim() + '”' : '');
  }
  if (hasList) list.addEventListener('click', function (e) {
    const b = e.target.closest('.chip-abs'); if (!b) return;
    const box = document.getElementById(b.getAttribute('aria-controls'));
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open));
    box.classList.toggle('open', open);
  });
  if (hasList) seg.addEventListener('click', function (e) {
    const b = e.target.closest('button'); if (!b) return;
    type = b.dataset.t;
    seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render();
  });
  if (hasList) q.addEventListener('input', render);
  if (hasList) render();

  const featEl = document.getElementById('featured-list');
  if (featEl) {
    const FEAT = ['10.1016/j.cma.2022.115783', '10.1016/j.cpc.2025.109882', '10.1016/j.ymssp.2022.109939', '10.1016/j.ymssp.2024.111737', '10.1016/j.ymssp.2026.114226'];
    const load = function (src) { return new Promise(function (res) { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = res; document.head.appendChild(s); }); };
    Promise.all([load('abstracts.js'), load('thumbs.js')]).then(function () {
      featEl.innerHTML = FEAT.map(function (d) {
        const p = P.find(function (x) { return x.d === d; }); if (!p) return '';
        const title = '<a href="https://doi.org/' + p.d + '" target="_blank" rel="noopener">' + esc(p.ti) + '</a>';
        return '<li class="pub">' + thumb(p) + '<div class="pb"><span class="ti">' + title + '</span><span class="au">' + authors(p.a) + '</span><span class="ve">' + esc(p.v) + '</span>' + ext(p) + panel(p) + '</div></li>';
      }).join('');
    });
    featEl.addEventListener('click', function (e) {
      const b = e.target.closest('.chip-abs'); if (!b) return;
      const box = document.getElementById(b.getAttribute('aria-controls'));
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open));
      box.classList.toggle('open', open);
    });
  }
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

/* ---------- Institute icons ---------- */
(function () {
  const cols = [5.5, 9.8, 14.2, 18.5].map(function (c) { return '<rect x="' + (c - 0.9) + '" y="11.6" width="1.8" height="6.8"/><rect x="' + (c - 1.5) + '" y="10.5" width="3" height="1.2" rx=".4"/><rect x="' + (c - 1.5) + '" y="18.4" width="3" height="1"/>'; }).join('');
  const ICON = '<svg class="inst" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 2.2L22 7.8H2z"/><path d="M12 4.5L17.9 7.2H6.1z" fill="none" stroke="var(--paper)" stroke-width=".7" stroke-linejoin="round"/><rect x="3" y="8.3" width="18" height="1.6" rx=".3"/>' + cols + '<rect x="3" y="19.8" width="18" height="1.3" rx=".3"/><rect x="2" y="21.3" width="20" height="1.5" rx=".3"/></svg>';
  const isInst = /University|Institute|IIT|NERIST|College/;
  document.querySelectorAll('.timeline .where, .groups .role, dl.facts dd, #contact .body > p:not(.mail), .map-cap').forEach(function (el) {
    if (isInst.test(el.textContent)) el.insertAdjacentHTML('afterbegin', ICON);
  });
})();
