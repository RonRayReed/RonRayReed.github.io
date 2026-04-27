/* ═══════════════════════════════════════════════════════
   REED INTELLIGENCE GROUP — Core JS v3
   Live FX rates · Theme · Language · Ticker · Components
═══════════════════════════════════════════════════════ */

/* ── FALLBACK FX RATES (used if API unavailable) ── */
const FX_FALLBACK = {
  USD_UAH: 44.06, EUR_UAH: 50.28,
  USD_MDL: 17.74, EUR_MDL: 20.26,
  NBU_RATE: '13.5%', BNM_RATE: '3.60%',
};

/* Live rates cache */
let FX_LIVE = { ...FX_FALLBACK, loaded: false, timestamp: null };

/* ── LIVE FX FETCHING ──
   Sources:
   1. NBU (National Bank of Ukraine) open JSON API — no key required
      https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json
   2. BNM (National Bank of Moldova) open XML/JSON API — no key required
      https://www.bnm.md/en/official_exchange_rates?get_xml=1&date=...
   3. Frankfurter.app — free, no key, ECB rates for EUR crosses
      https://api.frankfurter.app/latest?from=USD&to=UAH,MDL
   Strategy: Try Frankfurter for USD→UAH and USD→MDL,
             derive EUR crosses via EUR/USD from same API.
             Fall back silently to hardcoded rates.
*/
async function fetchLiveFX() {
  try {
    // Fetch USD → UAH, MDL + EUR/USD from Frankfurter (ECB data, CORS-friendly)
    const [fxRes] = await Promise.all([
      fetch('https://api.frankfurter.app/latest?from=USD&to=UAH,MDL,EUR', { signal: AbortSignal.timeout(4000) })
    ]);
    if (!fxRes.ok) throw new Error('Frankfurter API error');
    const fx = await fxRes.json();
    const rates = fx.rates; // { UAH: x, MDL: x, EUR: x }

    if (rates.UAH && rates.MDL && rates.EUR) {
      const usdUah = +rates.UAH.toFixed(2);
      const usdMdl = +rates.MDL.toFixed(2);
      const eurUsd = 1 / rates.EUR; // EUR/USD
      const eurUah = +(usdUah * eurUsd).toFixed(2);
      const eurMdl = +(usdMdl * eurUsd).toFixed(2);

      FX_LIVE = {
        USD_UAH: usdUah,
        EUR_UAH: eurUah,
        USD_MDL: usdMdl,
        EUR_MDL: eurMdl,
        NBU_RATE: '13.5%',  // NBU policy rate — updated editorially
        BNM_RATE: '3.60%',  // BNM policy rate — updated editorially
        loaded: true,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      };
    }
  } catch (e) {
    // Silently use fallback — no console noise in production
    FX_LIVE = { ...FX_FALLBACK, loaded: false, timestamp: null };
  }
}

/* Format rate display */
function fmtUAH(v) { return `₴${(+v).toFixed(2)}`; }
function fmtMDL(v) { return `L${(+v).toFixed(2)}`; }
function fmtPct(v) { return v; }

/* ── BUILD FX STRIP ── */
function buildFxStrip(containerId, cityType) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const tr = T[currentLang] || T.en;
  const m = tr.mkt;
  const ts = FX_LIVE.timestamp ? `<span class="mkt-ts">Live · ${FX_LIVE.timestamp}</span>` : '';

  let html = '';
  if (cityType === 'mdl') {
    // Moldova pages lead with MDL rates
    html = `
      <div class="mkt"><span class="mkt-l">${m.mdl}</span><span class="mkt-v">${fmtMDL(FX_LIVE.USD_MDL)}</span><span class="mkt-c">USD</span></div>
      <div class="mkt"><span class="mkt-l">${m.eur_mdl}</span><span class="mkt-v">${fmtMDL(FX_LIVE.EUR_MDL)}</span><span class="mkt-c">EUR</span></div>
      <div class="mkt"><span class="mkt-l">${m.bnm}</span><span class="mkt-v">${fmtPct(FX_LIVE.BNM_RATE)}</span><span class="mkt-c">${m.unchanged}</span></div>
      <div class="mkt"><span class="mkt-l">${m.uah}</span><span class="mkt-v">${fmtUAH(FX_LIVE.USD_UAH)}</span><span class="mkt-c">ref</span></div>
      <div class="mkt"><span class="mkt-l">${m.eur_uah}</span><span class="mkt-v">${fmtUAH(FX_LIVE.EUR_UAH)}</span><span class="mkt-c">ref</span></div>
    `;
  } else {
    // Ukraine pages lead with UAH rates
    html = `
      <div class="mkt"><span class="mkt-l">${m.uah}</span><span class="mkt-v">${fmtUAH(FX_LIVE.USD_UAH)}</span><span class="mkt-c">USD</span></div>
      <div class="mkt"><span class="mkt-l">${m.eur_uah}</span><span class="mkt-v">${fmtUAH(FX_LIVE.EUR_UAH)}</span><span class="mkt-c">EUR</span></div>
      <div class="mkt"><span class="mkt-l">${m.nbu}</span><span class="mkt-v">${fmtPct(FX_LIVE.NBU_RATE)}</span><span class="mkt-c">${m.unchanged}</span></div>
      <div class="mkt"><span class="mkt-l">${m.ebrd}</span><span class="mkt-v">€2.9B</span><span class="mkt-c">${m.record}</span></div>
      <div class="mkt"><span class="mkt-l">${m.recon}</span><span class="mkt-v">$524B</span><span class="mkt-c">${m.est}</span></div>
      <div class="mkt"><span class="mkt-l">${m.mdl}</span><span class="mkt-v">${fmtMDL(FX_LIVE.USD_MDL)}</span><span class="mkt-c">ref</span></div>
    `;
  }
  el.innerHTML = html + (ts ? `<div class="mkt mkt-ts-wrap">${ts}</div>` : '');
}

/* ── THEME ── */
let currentLang = localStorage.getItem('ri_lang') || 'en';

function initTheme() {
  const saved = localStorage.getItem('ri_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : '');
  updateThemeBtns();
}
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
  localStorage.setItem('ri_theme', isDark ? 'light' : 'dark');
  updateThemeBtns();
}
function updateThemeBtns() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const tr = T[currentLang] || T.en;
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.textContent = isDark ? tr.light : tr.dark;
  });
}

/* ── LANGUAGE ── */
function switchLang(lang) {
  currentLang = lang;
  localStorage.setItem('ri_lang', lang);
  applyTranslations();
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  document.documentElement.lang = lang;
  updateThemeBtns();
}

function applyTranslations() {
  const tr = T[currentLang] || T.en;
  // Apply data-i18n attributes: <span data-i18n="subscribe">Subscribe</span>
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = resolveKey(tr, key);
    if (val !== undefined && typeof val === 'string') el.innerHTML = val;
  });
  // Apply data-i18n-ph for placeholder
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    const val = resolveKey(tr, key);
    if (val) el.placeholder = val;
  });
  // Render date
  renderDate();
}

function resolveKey(obj, keyPath) {
  return keyPath.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

/* ── DATE ── */
function renderDate() {
  const lang = currentLang;
  const locale = lang === 'de' ? 'de-DE' : lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US';
  const str = new Date().toLocaleDateString(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).toUpperCase();
  document.querySelectorAll('.mast-date').forEach(el => el.textContent = str);
}

/* ── TICKER ── */
function buildTicker(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const tr = T[currentLang] || T.en;
  const items = [...tr.ticker, ...tr.ticker]; // doubled for seamless loop
  el.innerHTML = items.map(i =>
    `<span class="tick-item"><span class="tick-city">${i.city}</span>${i.text}</span>`
  ).join('');
}

/* ── NOTABLE TAB SWITCHER ── */
function showCat(catId, el) {
  document.querySelectorAll('.notable-list').forEach(l => l.style.display = 'none');
  document.querySelectorAll('.ntab').forEach(t => t.classList.remove('active'));
  const target = document.getElementById('cat-' + catId);
  if (target) target.style.display = 'block';
  if (el) el.classList.add('active');
}

/* ── COPY LINK ── */
function copyLink() {
  const btn = document.getElementById('a-copy-btn');
  const tr = T[currentLang] || T.en;
  navigator.clipboard?.writeText(window.location.href).catch(() => {});
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = tr.copied;
    setTimeout(() => btn.textContent = orig, 2000);
  }
}

/* ── READING BAR ── */
function initReadingBar() {
  const bar = document.getElementById('reading-bar');
  if (!bar) return;
  const update = () => {
    const tot = document.documentElement.scrollHeight - window.innerHeight;
    if (tot > 0) bar.style.width = Math.min((window.scrollY / tot) * 100, 100) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
}

/* ── MAIN INIT ── */
async function init() {
  initTheme();

  // Restore saved language
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === currentLang);
    b.addEventListener('click', () => switchLang(b.dataset.lang));
  });

  document.querySelectorAll('.theme-btn').forEach(b => {
    b.addEventListener('click', toggleTheme);
  });

  // Fetch live FX (non-blocking)
  fetchLiveFX().then(() => {
    // Re-render strip once rates load
    const strip = document.getElementById('fx-strip');
    if (strip) {
      const cityType = strip.dataset.city || 'uah';
      buildFxStrip('fx-strip', cityType);
    }
  });

  applyTranslations();
  initReadingBar();

  // Init first notable tab
  const firstTab = document.querySelector('.ntab');
  if (firstTab) firstTab.classList.add('active');
}

document.addEventListener('DOMContentLoaded', init);
