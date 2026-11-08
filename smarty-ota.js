/* Smart Life Pro — OTA visual: tarjeta financiera personalizable y Smarty completo.
 * Versión: smarty-light-2026-11-08-18
 * Solo modifica la interfaz ya instalada; no modifica gastos, datos ni actualizaciones.
 */
(function () {
  'use strict';
  window.SMARTY_PATCH_BUILD_ID = 'smarty-light-2026-11-08-18';

  const STORE_KEY = 'smarty.finance.card.theme.v1';
  const STORE_COLORS = 'smarty.finance.card.colors.v1';
  const THEMES = {
    glass: { name: 'Glass Premium', a: '#204c64', b: '#10273e', accent: '#86e4d2' },
    bb: { name: 'Inspirado en Banco do Brasil', a: '#123c96', b: '#071c55', accent: '#ffda54' },
    nubank: { name: 'Inspirado en Nubank', a: '#803fc0', b: '#421a73', accent: '#e0bcff' },
    mp: { name: 'Inspirado en Mercado Pago', a: '#118ac6', b: '#07528d', accent: '#9de9ff' },
    light: { name: 'Claro', a: '#eaf2ff', b: '#cddff3', accent: '#087e73' },
    dark: { name: 'Oscuro', a: '#172034', b: '#0b1222', accent: '#65e4c6' },
    custom: { name: 'Personalizado', a: '#30497b', b: '#17334c', accent: '#7ee2b2' }
  };

  function readSetting(key, fallback) {
    try { return localStorage.getItem(key) || fallback; }
    catch (_) { return fallback; }
  }
  function saveSetting(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* ajustes optativos */ }
  }
  function validColor(v, fallback) {
    return /^#[0-9a-fA-F]{6}$/.test(v || '') ? v : fallback;
  }
  function readCustomColors() {
    try {
      const v = JSON.parse(readSetting(STORE_COLORS, '{}'));
      return {
        a: validColor(v.a, THEMES.custom.a),
        b: validColor(v.b, THEMES.custom.b),
        accent: validColor(v.accent, THEMES.custom.accent)
      };
    } catch (_) { return { ...THEMES.custom }; }
  }

  const css = String.raw`
/* MASCOTA: arriba, completamente visible y separada de la tarjeta. */
#view-home .fin-home-scroll > .fin-smarty-dock{
  position:relative!important;display:flex!important;flex-direction:column!important;
  align-items:center!important;justify-content:flex-start!important;
  width:100%!important;min-width:0!important;height:auto!important;
  margin:0 0 9px!important;padding:0!important;overflow:visible!important;
  z-index:3!important;
}
#view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-aura{display:none!important}
#view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-portrait{
  position:relative!important;display:block!important;width:130px!important;height:128px!important;
  overflow:hidden!important;margin:0 auto!important;padding:0!important;flex:none!important;
}
#view-home .fin-home-scroll > .fin-smarty-dock .smarty-visible-figure{
  position:absolute;inset:0;width:100%;height:100%;z-index:2;
  object-fit:contain;pointer-events:none;
}
#view-home .fin-home-scroll > .fin-smarty-dock #mascot-img{
  position:absolute!important;inset:0!important;left:0!important;top:0!important;
  display:block!important;width:100%!important;height:100%!important;
  max-width:none!important;max-height:none!important;margin:0!important;
  object-fit:contain!important;object-position:center!important;transform:none!important;
  cursor:pointer!important;z-index:3!important;
}
#view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-xp{
  position:absolute!important;left:7px!important;bottom:17px!important;width:3px!important;
  height:43px!important;z-index:5!important;
}
#view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-dialog{
  position:relative!important;z-index:6!important;display:flex!important;
  flex-direction:row!important;justify-content:center!important;align-items:center!important;
  min-width:94px!important;width:auto!important;max-width:none!important;
  min-height:29px!important;margin:0 auto!important;padding:6px 16px!important;
  border-radius:999px!important;border:1px solid rgba(118,164,179,.23)!important;
  background:var(--glass-bg,rgba(255,255,255,.75))!important;
  box-shadow:0 6px 15px rgba(18,45,68,.09)!important;
  backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important;
}
#view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-dialog-label{
  font-size:11px!important;font-weight:800!important;line-height:1.1!important;
  color:var(--text-color,#253c4c)!important;
}
#view-home .fin-home-scroll > .fin-smarty-dock .mascot-bubble-side{display:none!important}

/* TARJETA: layout compacto, donut ampliado, colores configurables. */
#view-home .fin-overview{
  --sc-a:#204c64;--sc-b:#10273e;--sc-accent:#86e4d2;
  display:grid!important;grid-template-columns:minmax(0,1fr) 100px!important;
  grid-template-rows:auto auto auto auto auto!important;
  gap:5px 11px!important;align-items:start!important;
  padding:15px 16px 14px!important;margin:0 13px 10px!important;
  border-radius:20px!important;isolation:isolate!important;overflow:hidden!important;
  color:#fff!important;
  background:linear-gradient(132deg,var(--sc-a),var(--sc-b))!important;
  border:1px solid rgba(231,244,255,.20)!important;
  box-shadow:0 10px 27px rgba(19,47,69,.14),inset 0 1px 0 rgba(255,255,255,.16)!important;
  backdrop-filter:blur(16px) saturate(118%)!important;
  -webkit-backdrop-filter:blur(16px) saturate(118%)!important;
}
#view-home .fin-overview::before,
#view-home .fin-overview::after{display:none!important;content:none!important}
#view-home .fin-overview-top{display:contents!important;min-height:0!important}
#view-home .fin-overview .fin-heading-copy{
  grid-column:1!important;grid-row:1!important;margin:0!important;padding:0!important;
  min-width:0!important;
}
#view-home .fin-heading-controls{display:flex;align-items:center;gap:6px;max-width:100%}
#view-home .fin-overview .fin-eyebrow{
  font-size:8px!important;letter-spacing:1.05px!important;
  color:rgba(242,251,255,.78)!important;white-space:nowrap!important;
}
#view-home .fin-overview .fin-month-title{
  font-size:16px!important;line-height:1.17!important;color:#fff!important;
  margin:5px 0 0!important;letter-spacing:-.3px!important;
}
#view-home .smarty-theme-trigger{
  display:grid;place-items:center;flex:0 0 29px;width:29px;height:29px;
  padding:0;border-radius:9px;cursor:pointer;
  border:1px solid rgba(234,247,255,.22);background:rgba(255,255,255,.13);color:#fff;
}
#view-home .smarty-theme-trigger:active{transform:scale(.97)}
#view-home .smarty-theme-trigger svg{width:17px;height:17px;display:block}
#view-home .fin-overview .fin-hero-donut{
  grid-column:2!important;grid-row:1/span 2!important;
  align-self:center!important;justify-self:end!important;
  position:relative!important;display:block!important;
  width:96px!important;height:96px!important;min-width:96px!important;
  flex:none!important;margin:0!important;padding:0!important;
  border:0!important;border-radius:50%!important;background:none!important;
  box-shadow:none!important;transform:none!important;
}
#view-home .fin-overview .fin-hero-donut .circle-bg{
  stroke:rgba(226,242,252,.22)!important;
}
#view-home .fin-overview .fin-hero-donut .circle{
  stroke:var(--sc-accent)!important;filter:none!important;
}
#view-home .fin-overview .fin-hero-donut .donut-label{
  font-size:8.5px!important;color:rgba(243,251,255,.8)!important;
}
#view-home .fin-overview .fin-hero-donut .fin-ring-value{
  font-size:18px!important;color:#fff!important;font-weight:850!important;
}
#view-home .fin-overview .fin-hero-main{
  grid-column:1!important;grid-row:2!important;display:block!important;
  width:100%!important;min-width:0!important;min-height:0!important;
  margin:2px 0 4px!important;padding:0!important;
}
#view-home .fin-overview .fin-hero-balance{width:100%!important;min-width:0!important}
#view-home .fin-overview .fin-balance-label{
  display:block!important;font-size:10px!important;line-height:1.2!important;
  color:rgba(245,252,255,.86)!important;
}
#view-home .fin-overview .fin-balance-amount{
  display:block!important;margin:4px 0 5px!important;
  font-size:clamp(23px,6.3vw,29px)!important;line-height:1.08!important;
  letter-spacing:-.7px!important;font-weight:850!important;white-space:nowrap!important;
}
#view-home .fin-overview .fin-health-pill{
  display:inline-flex!important;align-items:center!important;
  padding:4px 8px!important;margin:0!important;min-height:0!important;
  font-size:8.5px!important;line-height:1.18!important;
  border-radius:999px!important;color:#ddf7f2!important;
  border:1px solid rgba(231,249,248,.22)!important;
  background:rgba(255,255,255,.095)!important;
}
#view-home .fin-overview.fin-is-warning .fin-health-pill{
  color:#ffe2aa!important;border-color:rgba(255,226,170,.36)!important;
}
#view-home .fin-overview.fin-is-over .fin-health-pill{
  color:#ffbfc4!important;border-color:rgba(255,191,196,.38)!important;
}
#view-home .fin-overview .fin-budget-progress-labels{
  grid-column:1/-1!important;grid-row:3!important;
  display:flex!important;align-items:center!important;justify-content:space-between!important;
  margin:1px 0 0!important;padding:0!important;
  font-size:9px!important;color:rgba(245,251,255,.82)!important;
}
#view-home .fin-overview .fin-budget-progress-labels strong{
  font-size:10px!important;color:#fff!important;
}
#view-home .fin-overview .fin-budget-track{
  grid-column:1/-1!important;grid-row:4!important;
  height:6px!important;margin:0 0 5px!important;
  border-radius:999px!important;background:rgba(241,249,255,.18)!important;
}
#view-home .fin-overview .fin-budget-fill{
  background:var(--sc-accent)!important;box-shadow:none!important;
}
#view-home .fin-overview .fin-summary-details{
  grid-column:1/-1!important;grid-row:5!important;display:grid!important;
  grid-template-columns:1fr 1fr!important;min-width:0!important;
  gap:8px!important;margin:0!important;padding:0!important;
}
#view-home .fin-overview .fin-metric{
  display:flex!important;flex-direction:column!important;justify-content:center!important;
  min-width:0!important;min-height:47px!important;
  margin:0!important;padding:7px 10px!important;gap:3px!important;
  border:1px solid rgba(237,249,255,.17)!important;border-radius:12px!important;
  background:rgba(255,255,255,.10)!important;box-shadow:none!important;
}
#view-home .fin-overview .fin-metric-top{
  font-size:9px!important;gap:5px!important;color:rgba(247,251,255,.83)!important;
}
#view-home .fin-overview .fin-metric-icon{
  width:17px!important;height:17px!important;flex-basis:17px!important;
}
#view-home .fin-overview .fin-metric strong{
  color:#fff!important;font-size:14px!important;line-height:1.1!important;
}
#view-home .fin-overview .fin-budget-note{display:none!important}

/* Mismos módulos inferiores, sin alterar los accesos a movimientos/categorías. */
#view-home .fin-home-module{
  margin:0 13px 10px!important;border-radius:18px!important;
  border:1px solid var(--glass-border,rgba(163,193,214,.23))!important;
  background:var(--glass-bg,rgba(255,255,255,.62))!important;
  box-shadow:0 6px 18px rgba(21,51,72,.05)!important;
  backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important;
}

/* Modal para configurar el color de la tarjeta. */
#smarty-theme-sheet{
  position:fixed;inset:0;display:none;z-index:2147483600;
  align-items:flex-end;justify-content:center;
  background:rgba(5,18,31,.55);
  font-family:var(--font-main,system-ui);
}
#smarty-theme-sheet.is-open{display:flex}
#smarty-theme-sheet .smarty-theme-panel{
  box-sizing:border-box;width:min(100%,480px);max-height:min(80dvh,660px);
  overflow-y:auto;padding:19px 18px calc(22px + env(safe-area-inset-bottom));
  border-radius:23px 23px 0 0;
  background:var(--modal-bg,#f5f9fb);color:var(--text-color,#1e3547);
  box-shadow:0 -15px 45px rgba(4,20,38,.25);
}
#smarty-theme-sheet .smarty-theme-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:5px}
#smarty-theme-sheet h2{font-size:18px;margin:0;font-weight:850;line-height:1.3}
#smarty-theme-sheet p{font-size:12px;opacity:.75;margin:0 0 14px;line-height:1.45}
#smarty-theme-sheet button{cursor:pointer;font-family:inherit}
#smarty-theme-sheet .smarty-close{
  width:36px;height:36px;flex:0 0 36px;border:0;border-radius:12px;
  background:rgba(126,154,175,.13);color:inherit;font-size:24px;line-height:1;
}
#smarty-theme-sheet .smarty-theme-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#smarty-theme-sheet .smarty-preset{
  display:flex;flex-direction:column;align-items:flex-start;gap:7px;text-align:left;
  min-height:104px;padding:11px 12px;border-radius:15px;
  border:2px solid transparent;background:var(--glass-bg,rgba(140,171,185,.10));
  color:inherit;
}
#smarty-theme-sheet .smarty-preset[aria-pressed="true"]{border-color:var(--primary,#48aebc)}
#smarty-theme-sheet .smarty-theme-swatch{
  width:100%;height:41px;border-radius:9px;position:relative;display:block;
  background:linear-gradient(120deg,var(--swatch-a),var(--swatch-b));
}
#smarty-theme-sheet .smarty-theme-swatch:after{
  content:'';position:absolute;right:11px;top:9px;width:23px;height:23px;
  border-radius:50%;border:4px solid var(--swatch-accent);box-sizing:border-box;
}
#smarty-theme-sheet .smarty-preset span:last-child{font-size:11px;line-height:1.3;font-weight:750}
#smarty-theme-sheet .smarty-custom-area{margin-top:16px}
#smarty-theme-sheet .smarty-custom-area strong{font-size:12px;display:block;margin-bottom:9px}
#smarty-theme-sheet .smarty-colors{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
#smarty-theme-sheet .smarty-color-label{
  display:flex;align-items:center;justify-content:space-between;gap:6px;
  padding:8px;border-radius:11px;background:rgba(115,151,175,.12);font-size:10px;
}
#smarty-theme-sheet input[type=color]{width:32px;height:30px;padding:0;border:0;background:transparent;cursor:pointer}
#smarty-theme-sheet .smarty-custom-apply{
  display:block;width:100%;margin-top:12px;padding:11px 14px;
  border:0;border-radius:13px;background:var(--primary,#167f9e);color:#fff;
  font-size:12px;font-weight:800;
}
body.dark-mode #smarty-theme-sheet .smarty-theme-panel{
  background:#172b3a;color:#e9f8ff;
}

/* Consejos fuera de la tarjeta; texto completo, sin cubrir a Smarty. */
#smarty-floating-tip{
  position:fixed!important;left:max(16px,env(safe-area-inset-left))!important;
  right:max(16px,env(safe-area-inset-right))!important;
  bottom:calc(98px + env(safe-area-inset-bottom))!important;
  top:auto!important;max-width:430px!important;max-height:min(45vh,280px)!important;
  margin:0 auto!important;padding:15px 16px!important;box-sizing:border-box!important;
  overflow:auto!important;white-space:normal!important;overflow-wrap:anywhere!important;
  border-radius:17px!important;background:rgba(19,49,70,.96)!important;
  color:#fff!important;border:1px solid rgba(165,223,230,.27)!important;
  box-shadow:0 12px 30px rgba(10,25,41,.25)!important;
  backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;
  font:600 13px/1.5 var(--font-main,system-ui)!important;
  z-index:2147483647!important;opacity:0;visibility:hidden;pointer-events:none;
  transition:opacity .2s ease,visibility .2s ease;
}
#smarty-floating-tip.is-visible{opacity:1!important;visibility:visible!important;pointer-events:auto}

@media(max-width:365px){
  #view-home .fin-overview{grid-template-columns:minmax(0,1fr) 88px!important;margin:0 10px 8px!important;padding:12px 12px 11px!important;gap:4px 8px!important}
  #view-home .fin-overview .fin-hero-donut{width:85px!important;height:85px!important;min-width:85px!important}
  #view-home .fin-home-module{margin-left:10px!important;margin-right:10px!important}
  #view-home .fin-overview .fin-balance-amount{font-size:clamp(21px,6.4vw,26px)!important}
  #view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-portrait{height:119px!important;width:118px!important}
  #view-home .fin-overview .fin-eyebrow{font-size:7.3px!important}
}
@media(max-height:710px){
  #view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-portrait{height:112px!important}
  #view-home .fin-home-scroll > .fin-smarty-dock{margin-bottom:5px!important}
}
@media(prefers-reduced-motion:reduce){
  #smarty-floating-tip{transition:none!important}
}
`;

  function injectStyle() {
    let sheet = document.getElementById('smarty-quick-patch');
    if (!sheet) {
      sheet = document.createElement('style');
      sheet.id = 'smarty-quick-patch';
      document.head.appendChild(sheet);
    }
    sheet.textContent = css;
  }

  function getOverview() { return document.querySelector('#view-home .fin-overview'); }
  function applyTheme(name, customColors) {
    const overview = getOverview();
    if (!overview) return;
    const key = Object.prototype.hasOwnProperty.call(THEMES, name) ? name : 'glass';
    const colors = key === 'custom' ? (customColors || readCustomColors()) : THEMES[key];
    overview.dataset.smartyTheme = key;
    overview.style.setProperty('--sc-a', validColor(colors.a, THEMES.glass.a));
    overview.style.setProperty('--sc-b', validColor(colors.b, THEMES.glass.b));
    overview.style.setProperty('--sc-accent', validColor(colors.accent, THEMES.glass.accent));
    saveSetting(STORE_KEY, key);
    document.querySelectorAll('#smarty-theme-sheet .smarty-preset').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.theme === key));
    });
  }

  function ensurePicker() {
    const overview = getOverview();
    if (!overview) return;
    const heading = overview.querySelector('.fin-heading-copy');
    const eyebrow = heading && heading.querySelector('.fin-eyebrow');
    if (!heading || !eyebrow) return;
    let controls = heading.querySelector('.fin-heading-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'fin-heading-controls';
      heading.insertBefore(controls, eyebrow);
      controls.appendChild(eyebrow);
    }
    if (!controls.querySelector('.smarty-theme-trigger')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'smarty-theme-trigger';
      button.setAttribute('aria-label', 'Personalizar colores de la tarjeta financiera');
      button.setAttribute('title', 'Personalizar tarjeta');
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="15" cy="7" r="1" fill="currentColor"/><circle cx="17" cy="13" r="1" fill="currentColor"/><path d="M12 16c-1 0-2 1-2 2a2 2 0 0 0 2 2"/></svg>';
      button.addEventListener('click', openPicker);
      controls.appendChild(button);
    }
  }

  function makePicker() {
    let modal = document.getElementById('smarty-theme-sheet');
    if (modal) { modal.remove(); } // El selector anterior no contenía Claro y Oscuro.
    modal = document.createElement('div');
    modal.id = 'smarty-theme-sheet';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Personalizar tarjeta financiera');
    const panel = document.createElement('div');
    panel.className = 'smarty-theme-panel';
    const head = document.createElement('div');
    head.className = 'smarty-theme-head';
    head.innerHTML = '<h2>Personalizar tarjeta</h2>';
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'smarty-close'; close.textContent = '×';
    close.setAttribute('aria-label', 'Cerrar');
    close.addEventListener('click', closePicker);
    head.appendChild(close);
    panel.appendChild(head);
    const sub = document.createElement('p');
    sub.textContent = 'Elige un estilo. Solo cambia la apariencia; tus gastos y presupuestos no se modifican.';
    panel.appendChild(sub);
    const grid = document.createElement('div'); grid.className = 'smarty-theme-grid';
    ['glass', 'bb', 'nubank', 'mp', 'light', 'dark'].forEach(key => {
      const theme = THEMES[key];
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'smarty-preset'; button.dataset.theme = key;
      button.setAttribute('aria-pressed', 'false');
      const swatch = document.createElement('span'); swatch.className = 'smarty-theme-swatch';
      swatch.style.setProperty('--swatch-a', theme.a);
      swatch.style.setProperty('--swatch-b', theme.b);
      swatch.style.setProperty('--swatch-accent', theme.accent);
      const label = document.createElement('span'); label.textContent = theme.name;
      button.append(swatch, label);
      button.addEventListener('click', () => { applyTheme(key); closePicker(); });
      grid.appendChild(button);
    });
    panel.appendChild(grid);
    const custom = document.createElement('div'); custom.className = 'smarty-custom-area';
    const label = document.createElement('strong'); label.textContent = 'O crea tus propios colores';
    custom.appendChild(label);
    const colors = document.createElement('div'); colors.className = 'smarty-colors';
    const saved = readCustomColors();
    const inputs = {};
    [['a','Color 1'],['b','Color 2'],['accent','Acento']].forEach(([key,title]) => {
      const row = document.createElement('label'); row.className = 'smarty-color-label';
      const name = document.createElement('span'); name.textContent = title;
      const input = document.createElement('input'); input.type = 'color'; input.value = saved[key];
      input.setAttribute('aria-label',title);
      inputs[key] = input;
      row.append(name,input); colors.appendChild(row);
    });
    custom.appendChild(colors);
    const submit = document.createElement('button');
    submit.className = 'smarty-custom-apply'; submit.type = 'button';
    submit.textContent = 'Aplicar mis colores';
    submit.addEventListener('click', () => {
      const values = { a:inputs.a.value,b:inputs.b.value,accent:inputs.accent.value };
      saveSetting(STORE_COLORS, JSON.stringify(values));
      applyTheme('custom', values);
      closePicker();
    });
    custom.appendChild(submit);
    panel.appendChild(custom);
    modal.appendChild(panel);
    modal.addEventListener('click', e => { if (e.target === modal) closePicker(); });
    document.body.appendChild(modal);
    modal._smartyInputs = inputs;
    return modal;
  }
  function openPicker() {
    const modal = makePicker();
    const colors = readCustomColors();
    for (const key of ['a','b','accent']) modal._smartyInputs[key].value = colors[key];
    const theme = readSetting(STORE_KEY, 'glass');
    modal.querySelectorAll('.smarty-preset').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.theme === theme)));
    modal.classList.add('is-open');
    modal.querySelector('.smarty-close').focus();
  }
  function closePicker() {
    const modal = document.getElementById('smarty-theme-sheet');
    if (modal) modal.classList.remove('is-open');
  }

  function restructure() {
    const home = document.getElementById('view-home');
    if (!home) return;
    const scroll = home.querySelector('.fin-home-scroll');
    const panel = home.querySelector('.fin-overview');
    const dock = home.querySelector('.fin-smarty-dock');
    const top = panel && panel.querySelector('.fin-overview-top');
    const donut = panel && panel.querySelector('.fin-hero-donut');
    if (!scroll || !panel || !dock || !top || !donut) return;
    // Una vez montado Glass Home, no devolver mascota ni dona al diseño anterior.
    if (document.getElementById('smarty-glass-hero')) { ensurePicker(); return; }
    if (dock.parentElement !== scroll || dock.nextElementSibling !== panel) scroll.insertBefore(dock, panel);
    if (donut.parentElement !== top) top.appendChild(donut);
    top.querySelectorAll('.fin-top-donut-slot').forEach(slot => {
      if (slot.contains(donut)) top.appendChild(donut);
      slot.remove();
    });
    const label = dock.querySelector('.fin-smarty-dialog-label');
    if (label) label.textContent = 'Smarty ↗';
    ensurePicker();
  }

  // El origen de cada skin contiene márgenes transparentes variables.
  // Se calcula el área visible y se dibuja completa en un canvas, sin recortar pies o cabeza.
  function getOpaqueBounds(img) {
    const sample = document.createElement('canvas');
    const ratio = Math.min(1, 220 / Math.max(img.naturalWidth, img.naturalHeight));
    sample.width = Math.max(1, Math.ceil(img.naturalWidth * ratio));
    sample.height = Math.max(1, Math.ceil(img.naturalHeight * ratio));
    const ctx = sample.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img,0,0,sample.width,sample.height);
    const data = ctx.getImageData(0,0,sample.width,sample.height).data;
    let l = sample.width,t = sample.height,r = -1,b = -1;
    for (let y=0;y<sample.height;y++) {
      for (let x=0;x<sample.width;x++) {
        if (data[4*(y*sample.width+x)+3] < 18) continue;
        if (x<l) l=x;if (x>r) r=x;
        if (y<t) t=y;if (y>b) b=y;
      }
    }
    if (r<l || b<t) return null;
    return {
      x:l*img.naturalWidth/sample.width,
      y:t*img.naturalHeight/sample.height,
      w:(r-l+1)*img.naturalWidth/sample.width,
      h:(b-t+1)*img.naturalHeight/sample.height
    };
  }

  function paintMascot(img, canvas) {
    if (!img.complete || !img.naturalWidth || !img.naturalHeight || !canvas.isConnected) return;
    const frame = canvas.parentElement;
    if (!frame) return;
    // Otro parche anterior puede volver a escribir posiciones inline al cambiar de skin.
    // Estas propiedades se limpian tras el evento load para que el canvas tenga un área táctil correcta.
    for (const prop of ['width','height','top','left','right','bottom','margin','transform']) {
      img.style.removeProperty(prop);
    }
    const width = frame.clientWidth || 130;
    const height = frame.clientHeight || 128;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(width*dpr);
    canvas.height = Math.round(height*dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,width,height);
    let bounds;
    try { bounds = getOpaqueBounds(img); } catch (_) { /* algunos orígenes bloquean lectura */ }
    if (!bounds) { img.style.removeProperty('opacity'); return; }
    const maxH = height - 8;
    const maxW = width - 12;
    const scale = Math.min(maxW/bounds.w,maxH/bounds.h);
    const dw = bounds.w*scale;
    const dh = bounds.h*scale;
    try {
      ctx.drawImage(img,bounds.x,bounds.y,bounds.w,bounds.h,(width-dw)/2,height-4-dh,dw,dh);
      img.style.setProperty('opacity','0','important');
    } catch (_) { img.style.removeProperty('opacity'); }
  }

  function setupMascot() {
    const img = document.querySelector('#view-home .fin-smarty-portrait #mascot-img');
    if (!img) return;
    const frame = img.closest('.fin-smarty-portrait');
    if (!frame) return;
    let canvas = frame.querySelector('.smarty-visible-figure');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'smarty-visible-figure';
      frame.insertBefore(canvas,img);
    }
    // Limpia posiciones inline que dejó la versión anterior del parche.
    for (const prop of ['width','height','top','left','right','bottom','margin','transform','opacity']) {
      img.style.removeProperty(prop);
    }
    if (!img.dataset.smartyCanvasReady) {
      img.dataset.smartyCanvasReady = '1';
      img.addEventListener('load',() => paintMascot(img,canvas));
    }
    if (img.complete && img.naturalWidth) paintMascot(img,canvas);
    window.addEventListener('resize', () => paintMascot(img,canvas), { passive:true, once:true });
  }

  function installTips() {
    if (typeof Assistant === 'undefined') return;
    Assistant.giveTip = function () {
      this.updateMood('thinking.png');
      const tip = this.getSmartTip();
      let layer = document.getElementById('smarty-floating-tip');
      if (!layer) {
        layer = document.createElement('div');layer.id='smarty-floating-tip';
        layer.setAttribute('role','status');layer.setAttribute('aria-live','polite');
        document.body.appendChild(layer);
      }
      layer.textContent = tip;
      layer.classList.add('is-visible');
      clearTimeout(this._smartyTipTimeout);
      this._smartyTipTimeout = setTimeout(() => {
        layer.classList.remove('is-visible');this.updateMood();
      },8500);
    };
  }

  function run() {
    injectStyle();
    restructure();
    setupMascot();
    applyTheme(readSetting(STORE_KEY,'glass'));
    installTips();
    // El protector de arranque se retira cuando Glass Home v17 está montado.
    // Evita mostrar la plantilla antigua entre la capa base y el diseño final.
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape') closePicker();});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  window.addEventListener('load',run,{once:true});
  setTimeout(run,350);
  window.SmartyCardThemes = {apply:applyTheme,open:openPicker};
})();


/* ====================================================================
   Finanzas seguras: las categorías e iconos que añade el WORKFLOW Android
   permanecen intactos. Corregir solo la lectura multilingüe,
   sumar topes por categoria y promedios sin migrar los gastos.
   ==================================================================== */
(function () {
  'use strict';
  const VERSION = 'smarty-insights-2026-11-03-14';
  const IDS = ['cat_market','cat_lunch','cat_dining','cat_leisure','cat_transport','cat_clothes','cat_health','cat_bills','cat_travel','cat_beauty','cat_other','cat_subs'];
  const LOCAL = {
    es:{daily:'Puedes gastar por día',days:'días restantes',limit:'Tope mensual',save:'Guardar tope',clear:'Quitar tope',spent:'Gastado',near:'Cerca del límite',over:'Límite superado',safe:'Dentro del límite',alert:'Alerta de categoría',avg:'Promedios de gastos',monthly:'Promedio mensual',perCategory:'Promedio por categoría',months:'meses completos',empty:'No hay datos históricos suficientes.',invalid:'Introduce un importe válido.',saved:'Tope actualizado',available:'Sin presupuesto'},
    pt:{daily:'Disponível por dia',days:'dias restantes',limit:'Limite mensal',save:'Salvar limite',clear:'Remover limite',spent:'Gasto',near:'Perto do limite',over:'Limite ultrapassado',safe:'Dentro do limite',alert:'Alerta de categoria',avg:'Médias de gastos',monthly:'Média mensal',perCategory:'Média por categoria',months:'meses completos',empty:'Sem histórico suficiente.',invalid:'Informe um valor válido.',saved:'Limite atualizado',available:'Sem orçamento'},
    en:{daily:'Available per day',days:'days remaining',limit:'Monthly cap',save:'Save cap',clear:'Remove cap',spent:'Spent',near:'Near cap',over:'Cap exceeded',safe:'Within cap',alert:'Category alert',avg:'Spending averages',monthly:'Monthly average',perCategory:'Average by category',months:'completed months',empty:'Not enough history yet.',invalid:'Enter a valid amount.',saved:'Cap updated',available:'No budget'}
  };
  const EXTRA = {
    entertainment:['Entretenimiento','Entretenimento','Entertainment'],
    food:['Comida','Comida','Food'],
    shopping:['Compras','Compras','Shopping']
  };
  const LANG_INDEX={es:0,pt:1,en:2};
  const ui=()=>typeof UI!=='undefined'?UI:null;
  const data=()=>typeof Data!=='undefined'?Data:null;
  const fin=()=>typeof Finance!=='undefined'?Finance:null;
  const lang=()=>['es','pt','en'].includes(data()?.store?.settings?.lang)?data().store.settings.lang:'es';
  const t=k=>LOCAL[lang()][k]||LOCAL.es[k]||k;
  const money=v=>ui()?.formatMoney?ui().formatMoney(Number(v)||0):String(v);
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('en').replace(/^[^\p{L}\p{N}_]+/u,'').replace(/[^\p{L}\p{N}_\s-]/gu,'').replace(/\s+/g,' ').trim();
  const aliases = new Map();
  function alias(key,...labels){for(const text of labels)aliases.set(norm(text),key);}
  // Mapeo SOLO de valores persistidos a IDs que el APK ya conoce.
  // No añadir/remover categorías ni cambiar UI.categoryIcon.
  const tr = {
    cat_market:['supermercado','supermercados','mercado','groceries','grocery'],
    cat_lunch:['almuerzo','almoço','almoco','lunch','cat_lunch'],
    cat_dining:['delivery y salidas','delivery y salida','delivery e saidas','delivery e saídas','delivery & dining','delivery and dining','cat_dining','cat_delivery','extra:dining'],
    cat_leisure:['microgasto','microgastos','micro-expenses','micro expenses','ocio','lazer','leisure'],
    cat_transport:['transporte','transport','transportation'],
    cat_clothes:['ropa','roupa','clothes'],
    cat_health:['salud','saúde','saude','health'],
    cat_bills:['hogar','casa','home','bills','cat_home'],
    cat_travel:['viaje','viagem','travel'],
    cat_beauty:['belleza','beleza','beauty'],
    cat_other:['otros','otro','outros','outro','other'],
    cat_subs:['gastos fijos','gasto fijo','gastos fixos','despesas fixas','fixed exp.','fixed expenses','suscripciones','assinaturas','subscriptions','cat_sub','cat-sub','cat_fixed','cat_fijos','tab_subs','extra:fixed','extra:subscriptions'],
    'extra:entertainment':['entretenimiento','entretenimento','entertainment','cat_ent'],
    'extra:food':['comida','food','cat_food'],
    'extra:shopping':['compras','shopping','cat_shop']
  };
  for (const [key,words] of Object.entries(tr)) alias(key,key,...words);
  // También aceptar todas las traducciones que estén presentes en ui.js.
  function dynamicKeyOf(n){
    const u=ui();if(!u?.dictionary)return null;
    for(const id of IDS){
      for(const language of ['es','pt','en']){
        const dict=u.dictionary[language];
        const value=dict?.[id==='cat_subs'?'tab_subs':id];
        if(value&&norm(value)===n)return id;
      }
    }
    return null;
  }
  function keyOf(raw){
    if(raw==null||String(raw).trim()==='')return 'cat_other';
    const literal=String(raw).trim();
    if(literal.startsWith('extra:') && EXTRA[literal.slice(6)])return literal;
    if(literal.startsWith('raw:')){const rawNorm=norm(literal.slice(4));return aliases.get(rawNorm)||dynamicKeyOf(rawNorm)||`raw:${rawNorm}`;}
    let n=norm(raw);
    if(n.startsWith('legacy:'))n=norm(n.slice(7));
    if(aliases.has(n))return aliases.get(n);
    const dynamic=dynamicKeyOf(n);if(dynamic)return dynamic;
    if(/^cat_[a-z0-9_-]+$/.test(n))return `raw:${n}`;
    return n?`raw:${n}`:'cat_other';
  }
  const records=()=>Array.isArray(data()?.store?.expenses)?data().store.expenses:[];
  function originalLabel(key){
    const s=records().find(e=>keyOf(e.category)===key)?.category;
    return typeof s==='string'&&s.trim()&&!/^cat[_-]/i.test(s.trim())?s.trim():null;
  }
  function label(key){
    const k=keyOf(key);
    if(IDS.includes(k))return ui()?.t(k==='cat_subs'?'tab_subs':k)||k;
    if(k.startsWith('extra:'))return EXTRA[k.slice(6)]?.[LANG_INDEX[lang()]]||originalLabel(k)||k.slice(6);
    if(k.startsWith('raw:')){
      const original=originalLabel(k);
      if(original)return original;
      // Jamás imprimir identificadores internos como cat_market en pantalla.
      return k.slice(4).replace(/^cat[_-]/,'').replace(/[_-]+/g,' ').replace(/^./,c=>c.toUpperCase());
    }
    return String(k);
  }
  const amount=x=>Number.isFinite(Number(x))?Number(x):0;
  const indexOfMonth=d=>d.getFullYear()*12+d.getMonth();
  const date=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d:null;};
  const period=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  function monthTotals(year,month,now=new Date()){
    const wanted=year*12+month, map=new Map();
    const add=(k,v)=>{const n=amount(v);if(n){k=keyOf(k);map.set(k,(map.get(k)||0)+n);}};
    for(const e of records()){
      const d=date(e.date);if(!d)continue;
      if(e.isInstallment){const n=Number(e.installments?.total)||0;const i=wanted-indexOfMonth(d);if(i>=0&&i<n)add(e.category,e.amount);}
      else if(indexOfMonth(d)===wanted)add(e.category,e.amount);
    }
    for(const x of data()?.store?.lists||[]){const d=date(x.date);if(x.status==='completed'&&d&&indexOfMonth(d)===wanted)add('cat_market',x.total);}
    for(const x of data()?.store?.subscriptions||[]){
      const day=Number(x.day),last=new Date(year,month+1,0).getDate();
      if(day<1||day>last)continue;
      if(wanted===indexOfMonth(now)){if(day<=now.getDate())add('cat_subs',x.cost);}
      else{
        const joined=date(x.createdAt||x.date||(Number(x.id)>946684800000&&Number(x.id)<Date.now()+86400000?Number(x.id):null));
        // Si no hay fecha de alta, no inventar suscripciones en meses pasados.
        if(joined&&indexOfMonth(joined)<=wanted)add('cat_subs',x.cost);
      }
    }
    return map;
  }
  function dailyAllowance(now=new Date()){
    const budget=amount(data()?.store?.budget?.limit);
    const spent=amount(fin()?.calculateMonthlySpent?.());
    const days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate()-now.getDate()+1;
    return {budget,spent,days,daily:budget>0?Math.max(0,budget-spent)/days:0};
  }
  function averages(n=3,now=new Date()){
    n=[3,6,12].includes(Number(n))?Number(n):3;
    const history=[...records().map(e=>date(e.date)),...(data()?.store?.lists||[]).filter(l=>l.status==='completed').map(l=>date(l.date)),...(data()?.store?.subscriptions||[]).map(s=>date(s.createdAt||s.date||(Number(s.id)>946684800000&&Number(s.id)<Date.now()+86400000?Number(s.id):null)))].filter(Boolean);
    const first=history.length?Math.min(...history.map(indexOfMonth)):Infinity;
    let months=0,sum=0;const byCategory=new Map();
    for(let i=1;i<=n;i++){
      const m=new Date(now.getFullYear(),now.getMonth()-i,1);
      if(indexOfMonth(m)<first)continue;
      months++;
      const map=monthTotals(m.getFullYear(),m.getMonth(),now);
      for(const [k,v] of map){sum+=v;byCategory.set(k,(byCategory.get(k)||0)+v);}
    }
    return {months,average:months?sum/months:0,byCategory:new Map([...byCategory].map(([k,v])=>[k,v/(months||1)]))};
  }
  function readCaps(){
    const source=data()?.store?.settings?.categoryCaps;
    const result={};
    if(source&&typeof source==='object'&&!Array.isArray(source))for(const [k,v] of Object.entries(source)){
      if(amount(v)>0){const key=keyOf(k);result[key]=Math.max(result[key]||0,amount(v));}
    }
    return result;
  }
  function saveCap(key,v){
    const store=data()?.store;if(!store)return;
    store.settings=store.settings||{};
    const caps=readCaps(),k=keyOf(key);if(v>0)caps[k]=v;else delete caps[k];
    store.settings.categoryCaps=caps;data().save();
  }
  function capStatus(key,totals=monthTotals(new Date().getFullYear(),new Date().getMonth())){
    const cap=readCaps()[keyOf(key)]||0,spent=totals.get(keyOf(key))||0,pct=cap>0?spent/cap*100:0;
    return {cap,spent,pct,level:cap===0?0:pct>=100?2:pct>=80?1:0};
  }
  function addNode(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  const CSS=String.raw`
#smarty-category-alert{display:none!important}
#smarty-insights-strip{display:flex!important;grid-column:1/-1!important;justify-content:flex-start!important;align-items:center!important;min-height:43px!important;margin:7px 0 0!important;padding:9px 12px!important;border-radius:13px!important;border:1px solid rgba(231,246,255,.13)!important;background:rgba(255,255,255,.09)!important}
#smarty-insights-strip .smarty-insights-open{display:none!important}
#smarty-insights-strip .smarty-daily-label{font:600 10px/1.2 system-ui,sans-serif;color:rgba(255,255,255,.78)}
#smarty-insights-strip .smarty-daily-val{font:800 17px/1.24 system-ui,sans-serif;color:#fff}
#smarty-insights-strip .smarty-daily-info{display:flex;flex-direction:column;gap:3px}
#smarty-finance-toolbar{display:flex;align-items:center;gap:8px;margin:0 0 12px;padding:0}
#smarty-finance-toolbar button{min-height:40px;flex:1;border:1px solid var(--glass-border,rgba(130,170,185,.20));border-radius:13px;background:var(--glass-bg,rgba(255,255,255,.7));color:var(--text-color,#243342);font:700 12px system-ui,sans-serif}
#smarty-category-cap-detail{padding:15px 16px!important;margin:10px 0 14px!important;border-radius:17px!important;background:var(--glass-bg,rgba(245,252,252,.90))!important;border:1px solid var(--glass-border,rgba(170,192,208,.30))!important;color:var(--text-color,#293949)!important}
#smarty-category-cap-detail .sc-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;font:800 13px system-ui,sans-serif}
#smarty-category-cap-detail .sc-subtitle{font:500 11px/1.4 system-ui,sans-serif;color:var(--text-sec,#6f7f8b)}
#smarty-category-cap-detail .sc-stat{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:9px 0 5px;font:600 12px system-ui,sans-serif}
#smarty-category-cap-detail .sc-track{height:7px;background:rgba(141,166,183,.2);border-radius:20px;overflow:hidden;margin:9px 0}
#smarty-category-cap-detail .sc-fill{height:100%;background:#36bda2;border-radius:20px}
#smarty-category-cap-detail .sc-fill.sc-near{background:#e3a646}
#smarty-category-cap-detail .sc-fill.sc-over{background:#d96771}
#smarty-category-cap-detail .sc-edit{display:flex;align-items:center;gap:8px;margin-top:12px}
#smarty-category-cap-detail .sc-edit input{min-width:0;flex:1;width:45%;padding:10px 11px;border-radius:11px;border:1px solid var(--glass-border,rgba(150,180,200,.3));color:var(--text-color,#243342);background:var(--input-bg,rgba(255,255,255,.6));font:600 13px system-ui,sans-serif}
#smarty-category-cap-detail .sc-edit button{min-height:42px;border:0;border-radius:11px;padding:0 12px;background:var(--primary,#178d81);color:white;font:750 12px system-ui,sans-serif}
#smarty-category-cap-detail .sc-remove{border:0;background:none;color:var(--text-sec,#627b85);margin:9px 0 0;padding:3px 0;font:600 11px system-ui,sans-serif}
#smarty-category-cap-detail .sc-status{font:750 11px/1.4 system-ui,sans-serif;color:var(--text-sec,#627a86)}
#smarty-category-cap-detail .sc-status.sc-near{color:#b77c27}
#smarty-category-cap-detail .sc-status.sc-over{color:#d35a64}
#smarty-averages-modal{position:fixed;inset:0;z-index:2147483600;display:none;align-items:flex-end;justify-content:center;padding:env(safe-area-inset-top) 10px calc(env(safe-area-inset-bottom) + 10px);background:rgba(4,16,29,.63)}
#smarty-averages-modal.sc-open{display:flex}
#smarty-averages-modal .sc-sheet{width:100%;max-width:560px;max-height:83dvh;display:flex;flex-direction:column;border-radius:22px;background:var(--card-bg,#f4f9f9);color:var(--text-color,#263843);overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.25);border:1px solid var(--glass-border,rgba(147,179,195,.2))}
#smarty-averages-modal .sc-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:14px 16px;border-bottom:1px solid var(--glass-border,rgba(147,179,195,.2))}
#smarty-averages-modal .sc-head strong{font:800 15px system-ui,sans-serif}
#smarty-averages-modal .sc-close{min-width:36px;min-height:36px;border:0;border-radius:10px;background:var(--input-bg,#edf1f4);color:inherit;font:700 20px system-ui,sans-serif}
#smarty-averages-modal .sc-content{padding:14px 16px 24px;overflow-y:auto;overscroll-behavior:contain}
#smarty-averages-modal .sc-period{display:flex;gap:8px;margin-bottom:13px}
#smarty-averages-modal .sc-period button{flex:1;min-height:37px;border-radius:10px;border:1px solid var(--glass-border,rgba(150,180,200,.3));background:var(--glass-bg,#e9f1f0);color:inherit;font:700 12px system-ui,sans-serif}
#smarty-averages-modal .sc-period button[aria-pressed=true]{background:var(--primary,#188d7e);color:#fff}
#smarty-averages-modal .sc-summary{border-radius:15px;background:var(--glass-bg,#eef6f6);padding:15px;margin-bottom:12px}
#smarty-averages-modal .sc-summary small{color:var(--text-sec,#6b7f85)}
#smarty-averages-modal .sc-summary strong{display:block;font-size:24px;margin-top:5px}
#smarty-averages-modal .sc-avg-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 2px;border-bottom:1px solid var(--glass-border,rgba(150,180,200,.2));font:600 12px system-ui,sans-serif}
#smarty-averages-modal .sc-avg-row strong{white-space:nowrap}
#smarty-averages-modal .sc-note{color:var(--text-sec,#6b7f85);font:500 11px/1.5 system-ui,sans-serif}
`;
  function installCss(){let s=document.getElementById('smarty-insights-css');if(!s){s=addNode('style');s.id='smarty-insights-css';document.head.appendChild(s);}s.textContent=CSS;}
  function refreshDaily(){
    const panel=document.getElementById('home-finance-overview');if(!panel)return;
    document.getElementById('smarty-category-alert')?.remove();
    let strip=document.getElementById('smarty-insights-strip');if(!strip){strip=addNode('div');strip.id='smarty-insights-strip';panel.appendChild(strip);}
    const {budget,days,daily}=dailyAllowance();
    strip.replaceChildren();const info=addNode('div','smarty-daily-info');
    info.append(addNode('span','smarty-daily-label',budget>0?`${t('daily')} · ${days} ${t('days')}`:t('available')),
                addNode('strong','smarty-daily-val',budget>0?money(daily):'—'));
    strip.appendChild(info);
    panel.style.setProperty('grid-template-rows','auto auto auto auto auto auto','important');
    strip.style.setProperty('grid-row','6','important');
  }
  // La app genera filtros e iconos en el workflow Android.
  // Una copia temporal traduce únicamente categorías persistidas durante el render;
  // NO cambia Data.store ni UI.categories ni el gráfico del APK.
  let depth=0;
  function projectForRender(fn){
    const d=data();if(!d?.store||!Array.isArray(d.store.expenses)||depth)return fn();
    depth++;const original=d.store.expenses;
    d.store.expenses=original.map(e=>{
      const key=keyOf(e.category);
      if(!IDS.includes(key))return e; // categorías desconocidas: conservar literalmente
      const translated=label(key);
      return translated===e.category?e:{...e,category:translated};
    });
    try{return fn();}finally{d.store.expenses=original;depth--;}
  }
  function parseAmount(x){
    const s=String(x||'').trim().replace(/\s/g,'');if(!s)return 0;
    if(!/^\d[\d.,]*$/.test(s))return NaN;
    const comma=s.lastIndexOf(','),dot=s.lastIndexOf('.');let v=s;
    if(comma>dot)v=s.replace(/\./g,'').replace(',','.');
    else if(comma!==-1)v=s.replace(/,/g,'');
    else if(/^\d{1,3}(?:\.\d{3})+$/.test(s))v=s.replace(/\./g,'');
    const n=Number(v);return Number.isFinite(n)&&n>=0?n:NaN;
  }
  function capCard(key){
    const container=document.getElementById('expenses-history-list');if(!container)return;
    const summary=capStatus(key),card=addNode('section');card.id='smarty-category-cap-detail';
    card.appendChild(addNode('div','sc-title',`${label(key)} · ${t('limit')}`));
    const line=addNode('div','sc-stat');line.append(addNode('span','',`${t('spent')}: ${money(summary.spent)}`),addNode('strong','',summary.cap>0?money(summary.cap):'—'));card.appendChild(line);
    if(summary.cap>0){
      const track=addNode('div','sc-track'),fill=addNode('div','sc-fill'+(summary.level===2?' sc-over':summary.level===1?' sc-near':''));
      fill.style.width=`${Math.min(100,Math.max(0,summary.pct))}%`;track.appendChild(fill);card.appendChild(track);
      card.appendChild(addNode('div','sc-status'+(summary.level===2?' sc-over':summary.level===1?' sc-near':''),`${Math.round(summary.pct)}% · ${t(summary.level===2?'over':summary.level===1?'near':'safe')}`));
    }
    const row=addNode('div','sc-edit'),input=addNode('input'),save=addNode('button','',t('save'));
    input.type='text';input.inputMode='decimal';input.value=summary.cap>0?String(summary.cap).replace('.',','):'';
    save.type='button';
    const persist=async()=>{
      const v=parseAmount(input.value);if(!Number.isFinite(v)){ui()?.showSnackbar?.(t('invalid'));return;}
      saveCap(key,v);ui()?.showSnackbar?.(t('saved'));fin().renderExpensesHistory();checkCaps();
      if(v>0){const plugin=window.Capacitor?.Plugins?.LocalNotifications;
        if(plugin){try{const p=await plugin.checkPermissions();if(p.display!=='granted')await plugin.requestPermissions();}catch(_){}}
      }
    };
    save.addEventListener('click',persist);input.addEventListener('keydown',e=>{if(e.key==='Enter')void persist();});row.append(input,save);card.appendChild(row);
    if(summary.cap>0){const clear=addNode('button','sc-remove',t('clear'));clear.type='button';clear.addEventListener('click',()=>{saveCap(key,0);fin().renderExpensesHistory();});card.appendChild(clear);}
    const filter=container.querySelector('.filter-scroll-container');const parent=filter?.parentElement;
    if(parent)parent.insertAdjacentElement('afterend',card);else container.appendChild(card);
  }
  let averageWindow=3;
  function averagesModal(){
    let modal=document.getElementById('smarty-averages-modal');if(modal)return modal;
    modal=addNode('div');modal.id='smarty-averages-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
    const sheet=addNode('div','sc-sheet'),head=addNode('div','sc-head'),content=addNode('div','sc-content');
    head.appendChild(addNode('strong','',t('avg')));
    const close=addNode('button','sc-close','×');close.type='button';close.addEventListener('click',()=>modal.classList.remove('sc-open'));head.appendChild(close);
    sheet.append(head,content);modal.appendChild(sheet);modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('sc-open');});
    document.body.appendChild(modal);return modal;
  }
  function renderAverages(){
    const modal=averagesModal(),content=modal.querySelector('.sc-content');content.replaceChildren();
    modal.querySelector('.sc-head strong').textContent=t('avg');
    const tabs=addNode('div','sc-period');
    for(const n of [3,6,12]){const b=addNode('button','',`${n} ${t('months')}`);b.type='button';b.setAttribute('aria-pressed',String(averageWindow===n));b.addEventListener('click',()=>{averageWindow=n;renderAverages();});tabs.appendChild(b);}content.appendChild(tabs);
    const m=averages(averageWindow);if(!m.months){content.appendChild(addNode('p','sc-note',t('empty')));return;}
    const summary=addNode('div','sc-summary');summary.append(addNode('small','',`${t('monthly')} · ${m.months} ${t('months')}`),addNode('strong','',money(m.average)));content.appendChild(summary);
    content.appendChild(addNode('h3','',t('perCategory')));
    for(const [key,value] of [...m.byCategory].sort((a,b)=>b[1]-a[1])){const row=addNode('div','sc-avg-row');row.append(addNode('span','',label(key)),addNode('strong','',money(value)));content.appendChild(row);}
  }
  function openAverages(){const modal=averagesModal();renderAverages();modal.classList.add('sc-open');modal.querySelector('.sc-close').focus();}
  function enhanceHistory(){
    const container=document.getElementById('expenses-history-list');if(!container)return;
    // La actualización rápida puede ejecutarse encima del parche previo:
    // nunca duplicar el botón de promedios ni el panel de topes.
    container.querySelector('#smarty-finance-toolbar')?.remove();
    container.querySelector('#smarty-category-cap-detail')?.remove();
    const toolbar=addNode('div');toolbar.id='smarty-finance-toolbar';const button=addNode('button','',t('avg')+' ›');button.type='button';button.addEventListener('click',openAverages);toolbar.appendChild(button);
    const filter=container.querySelector('.filter-scroll-container');
    if(filter?.parentElement)filter.parentElement.insertAdjacentElement('beforebegin',toolbar);else container.prepend(toolbar);
    const key=fin()?.selectedCategoryFilter;
    if(key && key!=='ALL')capCard(key);
  }
  function installFinances(){
    const f=fin(),u=ui();if(!f||!u)return;
    // El APK redefine Finance.renderExpensesHistory() y UI.renderBudgetChart()
    // al dispararse window.load. Nunca depender de un flag global: verificar
    // cada metodo y reengancharlo si el APK lo ha sustituido.
    // No modificar UI.categories, UI.categoryIcon ni Finance.renderFilterChips.
    f.__smartySafeCategories13=true;
    const mark='__smartySpendingInsights13';
    if(typeof f.renderExpensesHistory==='function' && !f.renderExpensesHistory[mark]){
      const originalHistory=f.renderExpensesHistory;
      const wrappedHistory=function(...args){
        let result;
        try{result=projectForRender(()=>originalHistory.apply(this,args));}
        finally{try{enhanceHistory();}catch(e){console.warn('[Smarty history]',e);}}
        return result;
      };
      wrappedHistory[mark]=true;
      f.renderExpensesHistory=wrappedHistory;
    }
    if(typeof f.renderHomeWidgets==='function' && !f.renderHomeWidgets[mark]){
      const originalHome=f.renderHomeWidgets;
      const wrappedHome=function(...args){return projectForRender(()=>originalHome.apply(this,args));};
      wrappedHome[mark]=true;
      f.renderHomeWidgets=wrappedHome;
    }
    if(typeof u.renderBudgetChart==='function' && !u.renderBudgetChart[mark]){
      const originalBudget=u.renderBudgetChart;
      const wrappedBudget=function(...args){
        const result=originalBudget.apply(this,args);
        try{refreshDaily();checkCaps();}catch(e){console.warn('[Smarty limits]',e);}
        return result;
      };
      wrappedBudget[mark]=true;
      u.renderBudgetChart=wrappedBudget;
    }
    try{refreshDaily();checkCaps();}catch(e){console.warn('[Smarty insights install]',e);}
    // Mostrar los controles también si el usuario actualiza con el historial ya abierto.
    try{enhanceHistory();}catch(e){console.warn('[Smarty insights view]',e);}
    document.getElementById('smarty-insights-modal')?.remove();
  }
  async function localNotice(key,p,level,message){
    const plugin=window.Capacitor?.Plugins?.LocalNotifications;if(!plugin)return;
    try{const check=await plugin.checkPermissions();if(check.display!=='granted')return;
      let id=750000000;for(const c of `${key}${p}${level}`)id=(id*31+c.charCodeAt(0))%1000000000;
      await plugin.schedule({notifications:[{id:Math.max(1000000,Math.floor(id)),title:t('alert'),body:message,schedule:{at:new Date(Date.now()+1000)}}]});
    }catch(e){console.warn('[Smarty notice]',e);}
  }
  let checking=false;
  function checkCaps(now=new Date()){
    if(checking||!data()?.store?.settings)return;checking=true;
    try{
      const caps=readCaps(),totals=monthTotals(now.getFullYear(),now.getMonth(),now);
      const settings=data().store.settings;settings.categoryCapNoticeState=settings.categoryCapNoticeState||{};
      for(const [key,cap] of Object.entries(caps)){
        const s=capStatus(key,totals),id=`${period(now)}:${key}`,previous=Number(settings.categoryCapNoticeState[id])||0;
        if(s.level>previous){settings.categoryCapNoticeState[id]=s.level;
          const message=`${label(key)}: ${Math.round(s.pct)}% · ${money(s.spent)} / ${money(cap)}`;
          ui()?.showSnackbar?.(message);void localNotice(key,period(now),s.level,message);data().save();}
        else if(s.level<previous){if(s.level===0)delete settings.categoryCapNoticeState[id];else settings.categoryCapNoticeState[id]=s.level;data().save();}
      }
    }finally{checking=false;}
  }
  window.SmartySpendingInsights={version:VERSION,keyOf,label,monthTotals,averages,dailyAllowance,readCaps,capStatus,checkCaps,openAverages};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{installCss();installFinances();},{once:true});
  else{installCss();installFinances();}
  window.addEventListener('load',()=>{installCss();installFinances();},{once:true});
  setTimeout(()=>{installCss();installFinances();},500);
})();
/* =====================================================================
   SMARTY GLASS HOME · visual dashboard only · 2026-11-07
   Uses existing Data, UI, Finance and SmartySpendingInsights read-only.
   It NEVER rewrites UI.categories, user data, notifications or finance APIs.
   ===================================================================== */
(function () {
  'use strict';
  const VERSION = 'smarty-glass-home-2026-11-08-18';
  if(window.SmartyHomeGlassDesign?.version===VERSION){window.SmartyHomeGlassDesign.refresh?.();return;}
  const ROOT = '#view-home';
  const TEXT = {
    es: {hello:'Hola', summary:'Tu resumen financiero', remaining:'Presupuesto restante', spentToday:'Gastado hoy', daily:'Disponible por día', pacing:'Evolución del gasto', month:'Mes', week:'Semana', actual:'Gasto + fijos', ideal:'Ritmo ideal', leading:'Dentro del ritmo', exceeding:'Por encima del ritmo', noBudget:'Configura un presupuesto para ver el ritmo ideal', categories:'Principales gastos del mes', topHint:'Del gasto mensual', more:'Ver todas', noData:'Sin gastos este mes', todayInfo:'Movimientos de hoy', showHistory:'Ver historial', period:'Presupuesto mensual' },
    pt: {hello:'Olá', summary:'Seu resumo financeiro', remaining:'Restante do orçamento', spentToday:'Gasto hoje', daily:'Disponível por dia', pacing:'Evolução dos gastos', month:'Mês', week:'Semana', actual:'Gastos + fixos', ideal:'Ritmo ideal', leading:'Dentro do ritmo', exceeding:'Acima do ritmo', noBudget:'Defina um orçamento para ver o ritmo ideal', categories:'Principais gastos do mês', topHint:'Dos gastos mensais', more:'Ver todas', noData:'Nenhuma despesa neste mês', todayInfo:'Movimentos de hoje', showHistory:'Ver histórico', period:'Orçamento mensal' },
    en: {hello:'Hello', summary:'Your financial overview', remaining:'Budget remaining', spentToday:'Spent today', daily:'Available per day', pacing:'Spending trend', month:'Month', week:'Week', actual:'Spent + fixed', ideal:'Ideal pace', leading:'Within pace', exceeding:'Above pace', noBudget:'Set a budget to see your ideal pace', categories:'Top spending categories', topHint:'Of monthly spending', more:'See all', noData:'No expenses this month', todayInfo:'Today’s transactions', showHistory:'View history', period:'Monthly budget' }
  };
  const icon = {
    activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-9"/><path d="M15 6h6v6"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>'
  };
  const STYLES = String.raw`
/* ================================================================
   Glass Home V15 — scoped ENTIRELY to #view-home and #smarty-glass-
   ================================================================ */
#view-home {--sg-start:#251955;--sg-end:#162251;--sg-glow:#a46cf3;--sg-mint:#63f4cc;--sg-ink:#ffffff;
  background: radial-gradient(ellipse at 8% -12%,color-mix(in srgb,var(--sg-glow) 28%,transparent),transparent 49%),
              radial-gradient(ellipse at 105% 50%,color-mix(in srgb,var(--sg-glow) 22%,transparent),transparent 49%),
              linear-gradient(164deg,var(--sg-start),var(--sg-end))!important; color:#fff!important; }

/* Home-only glass navigation; keep original buttons, routes and other screens intact. */
#app-root:has(#view-home.active) .bottom-dock{background:linear-gradient(135deg,color-mix(in srgb,var(--sg-start,#2b1b62) 83%,white 17%),color-mix(in srgb,var(--sg-end,#1e2159) 80%,white 20%))!important;border:1px solid rgba(223,199,255,.44)!important;box-shadow:0 15px 34px rgba(10,7,42,.35),inset 0 1px 0 rgba(255,255,255,.16)!important;backdrop-filter:blur(20px)!important}
#app-root:has(#view-home.active) .bottom-dock .dock-btn{color:#e7d9ff!important}
#app-root:has(#view-home.active) .bottom-dock .dock-btn.active{color:#fff!important;background:rgba(184,131,251,.28)!important;border-radius:17px!important;transform:translateY(-2px)!important}
#app-root:has(#view-home.active) #dock-plus-btn{background:linear-gradient(135deg,#b477fa,#6b46de)!important;box-shadow:0 4px 14px rgba(90,51,191,.5),inset 0 1px 0 rgba(255,255,255,.24)!important;border-radius:18px!important}
#view-home .home-header{padding:10px 16px 8px!important;margin-top:max(3px,env(safe-area-inset-top))!important;min-height:61px!important}
#view-home .home-brand-name{color:#fff!important;font-size:16px!important}
#view-home .home-brand-copy .app-title-text{color:rgba(241,238,255,.75)!important;font-size:10px!important}
#view-home .home-profile-btn,#view-home .glass-btn-small{background:rgba(244,236,255,.12)!important;color:#fff!important;border:1px solid rgba(255,255,255,.19)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)!important;backdrop-filter:blur(13px)}
#view-home .fin-home-scroll{padding:5px 0 calc(114px + env(safe-area-inset-bottom))!important;scrollbar-width:none!important}
#view-home .fin-home-scroll::-webkit-scrollbar{display:none}
#smarty-glass-hero{display:grid;grid-template-columns:92px minmax(0,1fr) 108px;align-items:center;gap:9px;min-height:139px;margin:0 14px 11px;padding:5px 2px;color:#fff}
#smarty-glass-hero .fin-smarty-dock{grid-column:1;align-self:center;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;margin:0!important;min-width:0!important;width:100%!important;gap:3px!important}
#smarty-glass-hero .fin-smarty-portrait{width:84px!important;height:83px!important;max-width:84px!important;min-width:0!important;position:relative!important;overflow:hidden!important;display:block!important;margin:0 auto!important;flex:none!important}
#smarty-glass-hero .fin-smarty-aura{display:none!important}
#smarty-glass-hero .smarty-visible-figure{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:contain;pointer-events:none}
#smarty-glass-hero #mascot-img{position:absolute!important;top:0!important;left:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;transform:none!important;margin:0!important;display:block!important}
#smarty-glass-hero .fin-smarty-xp{position:absolute!important;left:3px!important;bottom:14px!important;width:3px!important;height:32px!important;margin:0!important}
#smarty-glass-hero .fin-smarty-dialog{display:flex!important;align-items:center!important;justify-content:center!important;width:80px!important;max-width:80px!important;min-width:0!important;min-height:24px!important;padding:3px 8px!important;margin:0 auto!important;border-radius:999px!important;border:1px solid rgba(216,196,255,.40)!important;background:rgba(219,184,255,.15)!important;color:#fff!important;box-shadow:0 2px 9px rgba(9,5,37,.13)!important}
#smarty-glass-hero .fin-smarty-dialog-label{color:#fff!important;font-size:10px!important;font-weight:800!important}
#view-home #smarty-glass-hero .fin-smarty-dialog .mascot-bubble-side{display:none!important}
#smarty-glass-hero .sg-hello{display:flex;flex-direction:column;justify-content:center;gap:6px;min-width:0;align-items:flex-start}
#smarty-glass-hero .sg-hello-title{color:#fff;font-size:clamp(18px,5.4vw,24px);letter-spacing:-.6px;font-weight:850;line-height:1.1;white-space:nowrap}
#smarty-glass-hero .fin-heading-copy{display:flex!important;flex-direction:column!important;gap:4px;padding:0!important;min-width:0!important;margin:0!important}
#smarty-glass-hero .fin-month-title{font-size:11px!important;font-weight:650!important;color:rgba(242,235,255,.82)!important;line-height:1.2!important;margin:0!important;letter-spacing:-.15px!important}
#smarty-glass-hero .fin-heading-controls{display:none!important}
#smarty-glass-hero .fin-health-pill{display:inline-flex!important;gap:5px!important;align-items:center;max-width:100%;font-size:9px!important;line-height:1.2!important;font-weight:740!important;white-space:normal!important;padding:6px 7px!important;border-radius:999px!important;border:1px solid rgba(110,234,199,.35)!important;background:rgba(87,208,179,.14)!important;color:#9cf8db!important;margin:0!important}
#smarty-glass-hero .fin-health-pill:before{content:'';display:block;width:6px;height:6px;border-radius:100%;background:currentColor;flex:0 0 6px}
#smarty-glass-hero .fin-hero-donut{display:block!important;grid-column:3!important;grid-row:1!important;width:108px!important;height:108px!important;min-width:108px!important;align-self:center!important;justify-self:end!important;border:0!important;background:transparent!important;position:relative!important;padding:0!important;margin:0!important;transform:none!important;box-shadow:none!important;color:#fff!important}
#smarty-glass-hero .fin-hero-donut .circle{stroke:var(--sg-mint)!important;stroke-width:3.2!important;filter:drop-shadow(0 0 2px rgba(94,241,198,.28))!important}
#smarty-glass-hero .fin-hero-donut .circle-bg{stroke:rgba(208,189,255,.23)!important;stroke-width:3.2!important}
#smarty-glass-hero .fin-hero-donut .fin-ring-value{font-size:21px!important;color:#fff!important;font-weight:900!important}
#smarty-glass-hero .fin-hero-donut .donut-label{font-size:8px!important;color:rgba(245,234,255,.86)!important}
#view-home .fin-overview{display:flex!important;flex-direction:column!important;gap:10px!important;position:relative!important;margin:0 13px 13px!important;padding:16px!important;min-height:0!important;border-radius:24px!important;background:linear-gradient(137deg,color-mix(in srgb,var(--sg-start) 81%,white 19%),color-mix(in srgb,var(--sg-end) 87%,white 13%))!important;border:1px solid rgba(226,202,255,.39)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 14px 30px rgba(12,7,40,.24)!important;backdrop-filter:blur(24px) saturate(130%)!important;-webkit-backdrop-filter:blur(24px) saturate(130%)!important;color:#fff!important;overflow:hidden!important}
#view-home .fin-overview:before{display:block!important;content:''!important;position:absolute;top:-110px;right:-90px;left:auto;bottom:auto;width:240px;height:225px;border-radius:50%;background:radial-gradient(circle,rgba(195,145,255,.20),transparent 71%);pointer-events:none;z-index:0}
#view-home .fin-overview:after{display:none!important}
#view-home .fin-overview>*{position:relative;z-index:1}
#view-home .fin-overview-top{display:none!important}
#view-home .sg-overview-heading{font-size:10px;font-weight:850;letter-spacing:1.05px;text-transform:uppercase;color:rgba(232,216,253,.84)}
#view-home .fin-hero-main{display:flex!important;flex-direction:column!important;grid-column:auto!important;grid-row:auto!important;width:100%!important;min-height:0!important;margin:0!important;padding:0!important;gap:0!important}
#view-home .fin-hero-balance{width:100%!important;min-width:0!important}
#view-home .fin-balance-label{font-size:11px!important;color:rgba(239,225,255,.83)!important}
#view-home .fin-balance-amount{font-size:clamp(26px,7.6vw,34px)!important;margin:5px 0 1px!important;line-height:1.14!important;color:#9cf8da!important;letter-spacing:-1px!important;overflow:visible!important}
#view-home .fin-overview .fin-budget-progress-labels,#view-home .fin-overview .fin-budget-track{display:none!important}
#view-home .fin-summary-details{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important;grid-column:auto!important;grid-row:auto!important;align-items:stretch!important;margin:0!important;padding:0!important;width:100%!important}
#view-home .fin-summary-details .fin-metric,#view-home #smarty-insights-strip,#view-home #smarty-glass-today{box-sizing:border-box;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:4px!important;min-width:0!important;min-height:67px!important;height:auto!important;border:1px solid rgba(244,227,255,.20)!important;border-radius:16px!important;background:rgba(245,234,255,.095)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;padding:10px!important;margin:0!important;color:#fff!important;text-align:left!important;position:static!important;grid-row:auto!important}
#view-home .fin-metric-top,#view-home #smarty-insights-strip .smarty-daily-label,#view-home #smarty-glass-today .sg-metric-label{font-size:10px!important;color:rgba(237,226,255,.78)!important;font-weight:700!important;line-height:1.2!important}
#view-home .fin-summary-details .fin-metric strong,#view-home #smarty-insights-strip .smarty-daily-val,#view-home #smarty-glass-today .sg-metric-amount{font-size:clamp(14px,4.0vw,17px)!important;font-weight:850!important;letter-spacing:-.3px!important;color:#fff!important;white-space:nowrap!important;line-height:1.2!important}
#view-home #smarty-glass-today .sg-metric-amount{color:#ffbbcf!important}
#view-home #smarty-insights-strip .smarty-daily-val{color:#9cf8da!important}
#view-home #smarty-insights-strip{grid-column:auto!important;justify-content:center!important;min-height:67px!important;width:100%!important}
#view-home #smarty-insights-strip .smarty-daily-info{gap:5px!important;min-width:0}
#view-home #smarty-insights-strip .smarty-daily-label{display:block!important;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#view-home #smarty-glass-today .sg-today-foot{display:none}
#view-home #smarty-insights-strip .sg-days-remaining{font:600 9px/1.1 var(--font-main,system-ui);color:rgba(235,222,255,.70)}
#view-home .smarty-theme-trigger{display:grid!important;position:absolute;right:12px;top:10px;width:28px;height:28px;border-radius:10px;border:1px solid rgba(243,233,255,.28);background:rgba(244,230,255,.12);color:#fff}
#view-home .fin-overview .fin-budget-note{display:none!important}
#smarty-glass-trend{margin:0 13px 13px;padding:14px 14px 10px;border-radius:23px;border:1px solid rgba(232,211,255,.33);background:linear-gradient(135deg,rgba(188,150,251,.17),rgba(150,192,245,.075));color:#fff;box-shadow:0 12px 28px rgba(11,9,45,.19),inset 0 1px 0 rgba(255,255,255,.15);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}
#smarty-glass-trend .sg-trend-head{display:flex;align-items:center;justify-content:space-between;gap:9px;min-width:0}
#smarty-glass-trend .sg-chart-label{display:flex;align-items:center;gap:8px;min-width:0;font-size:13px;font-weight:800}
#smarty-glass-trend .sg-chart-label svg{width:19px;height:19px;stroke:#c7a6ff;flex:0 0 19px}
#smarty-glass-trend .sg-tabs{display:flex;gap:3px;padding:3px;border-radius:999px;background:rgba(226,203,255,.12);border:1px solid rgba(229,200,255,.20);flex:none}
#smarty-glass-trend .sg-tabs button{border:0;padding:5px 11px;border-radius:999px;background:transparent;color:rgba(255,255,255,.76);font:750 10px/1.2 var(--font-main,system-ui);min-height:27px}
#smarty-glass-trend .sg-tabs button[aria-pressed="true"]{color:#fff;background:linear-gradient(135deg,#ac6ef7,#7441ca);box-shadow:0 2px 8px rgba(38,19,88,.35)}
#smarty-glass-trend .sg-chart-wrap{height:168px;margin:10px 0 2px;position:relative;overflow:hidden}
#smarty-glass-trend svg.sg-chart{width:100%;height:100%;overflow:visible;display:block}
#smarty-glass-trend .sg-legend{display:flex;gap:16px;align-items:center;justify-content:center;margin:2px auto 0;font-size:10px;font-weight:650;color:rgba(242,230,255,.85)}
#smarty-glass-trend .sg-legend-item{display:flex;gap:5px;align-items:center}
#smarty-glass-trend .sg-line{display:inline-block;width:18px;height:4px;background:#63f4cc;border-radius:99px}
#smarty-glass-trend .sg-line.ideal{height:0;border-top:2px dashed #c992fd;background:none;border-radius:0}
#smarty-glass-trend .sg-trend-footer{margin-top:8px;text-align:center;color:rgba(242,231,255,.76);font-size:10px;line-height:1.35}
#view-home .fin-home-module{border-radius:22px!important;border:1px solid rgba(230,214,255,.29)!important;background:linear-gradient(135deg,rgba(229,209,255,.15),rgba(163,195,247,.09))!important;color:#fff!important;box-shadow:0 10px 28px rgba(12,9,43,.16),inset 0 1px 0 rgba(255,255,255,.09)!important;backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important}
#view-home .fin-module-header{color:#fff!important}
#view-home .fin-module-icon{background:rgba(219,177,255,.22)!important;color:#d4b2ff!important}
#view-home .fin-module-chevron{color:#dcccf6!important}
#view-home .home-expense-row{color:#fff!important}
#view-home .home-expense-row>div:last-child{color:#ffbdd0!important}
#view-home .home-expense-row>div:first-child>div>span:last-child{color:rgba(233,223,250,.73)!important;opacity:1!important}
#view-home .home-expense-row>div:first-child>span:first-child{background:rgba(219,193,255,.15)!important}
#view-home #home-top-categories{display:none!important}
#smarty-glass-top-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;padding:2px 12px 13px}
#smarty-glass-top-grid .sg-cat-card{border:1px solid rgba(235,216,255,.19);border-radius:16px;background:rgba(213,191,254,.10);padding:9px 7px 8px;min-width:0;min-height:87px;color:#fff;text-align:left;font:inherit;display:flex;flex-direction:column;gap:5px;align-items:flex-start}
#smarty-glass-top-grid .sg-cat-card .category-icon-shell{width:30px;height:30px;border-radius:11px;display:grid;place-items:center;flex:none}
#smarty-glass-top-grid .sg-cat-card .category-icon{width:20px;height:20px}
#smarty-glass-top-grid .sg-cat-name{font-size:9px;font-weight:700;line-height:1.15;max-width:100%;white-space:normal;overflow-wrap:anywhere;min-height:20px}
#smarty-glass-top-grid .sg-cat-percent{font-size:11px;font-weight:850;align-self:flex-end}
#smarty-glass-top-grid .sg-cat-track{width:100%;height:4px;overflow:hidden;border-radius:99px;background:rgba(224,209,248,.22);margin-top:auto}
#smarty-glass-top-grid .sg-cat-fill{height:100%;border-radius:99px;background:var(--sg-mint)}
#smarty-glass-top-grid .sg-cat-card:nth-child(2) .sg-cat-fill{background:#e3a1f6}
#smarty-glass-top-grid .sg-cat-card:nth-child(3) .sg-cat-fill{background:#7bb8ff}
#smarty-glass-top-grid .sg-cat-card:nth-child(4) .sg-cat-fill{background:#ffcc76}
#smarty-glass-top-grid .sg-cat-empty{grid-column:1/-1;padding:8px;color:rgba(243,229,255,.75);text-align:center;font-size:11px}
@media(max-width:380px){
 #smarty-glass-hero{grid-template-columns:76px minmax(0,1fr) 92px;margin-left:10px;margin-right:10px;gap:6px;min-height:121px}
 #smarty-glass-hero .fin-smarty-portrait{height:70px!important;width:73px!important}
 #smarty-glass-hero .fin-smarty-dialog{width:72px!important}
 #smarty-glass-hero .fin-hero-donut{width:91px!important;height:91px!important;min-width:91px!important}
 #smarty-glass-hero .sg-hello-title{font-size:18px}
 #view-home .fin-overview,#smarty-glass-trend{margin-left:9px!important;margin-right:9px!important;padding:12px!important}
 #smarty-glass-top-grid{gap:5px;padding:2px 8px 10px}
 #smarty-glass-top-grid .sg-cat-card{padding:7px 5px;min-height:84px}
 #smarty-glass-top-grid .sg-cat-name{font-size:8px}
}
@media(prefers-reduced-motion:reduce){#view-home #smarty-glass-trend *,#view-home .fin-overview *{transition:none!important;animation:none!important}}
`;
  const doc = document;
  const d=()=>typeof Data!=='undefined'?Data:null;
  const u=()=>typeof UI!=='undefined'?UI:null;
  const f=()=>typeof Finance!=='undefined'?Finance:null;
  const el = (tag,cls,txt)=>{const x=doc.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;};
  const lang=()=>['es','pt','en'].includes(d()?.store?.settings?.lang)?d().store.settings.lang:'es';
  const t=k=>TEXT[lang()][k]||TEXT.es[k]||k;
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const money=v=>u()?.formatMoney?u().formatMoney(n(v)):n(v).toFixed(2);
  const keyOf=v=>window.SmartySpendingInsights?.keyOf?.(v)||String(v||'cat_other');
  const label=v=>window.SmartySpendingInsights?.label?.(v)||(String(v||''));
  let view='month', frameQueued=false, lastPaint='', observationReady=false;

  function css(){let style=doc.getElementById('smarty-glass-home-css');if(!style){style=el('style');style.id='smarty-glass-home-css';doc.head.appendChild(style);}if(style.textContent!==STYLES)style.textContent=STYLES;}
  function theme(){
    const root=doc.getElementById('view-home'),overview=doc.getElementById('home-finance-overview');if(!root||!overview)return;
    const themeName=overview.dataset.smartyTheme||'glass';
    const presets={glass:['#152947','#14234d','#744bdb','#62e9d0'],bb:['#0c296b','#081d51','#3773ce','#f8dc75'],nubank:['#2c175e','#1c184c','#b47aff','#63f4cc'],mp:['#083956','#073356','#2388ce','#6fe8da'],custom:['#263254','#1b264c','#9274d9','#82e9db'],light:['#eaf2ff','#d4e4f7','#acc5f4','#087e73'],dark:['#172034','#0b1222','#364878','#65e4c6']};
    const item=presets[themeName]||presets.glass;
    let a=item[0],b=item[1],accent=item[3];
    if(themeName==='custom') {a=overview.style.getPropertyValue('--sc-a')?.trim()||a;b=overview.style.getPropertyValue('--sc-b')?.trim()||b;accent=overview.style.getPropertyValue('--sc-accent')?.trim()||accent;}
    for(const target of [root,doc.getElementById('app-root')].filter(Boolean)){target.style.setProperty('--sg-start',a);target.style.setProperty('--sg-end',b);target.style.setProperty('--sg-glow',item[2]);target.style.setProperty('--sg-mint',accent);}
  }
  function layout(){
    const home=doc.getElementById('view-home'),scroll=home?.querySelector('.fin-home-scroll'),panel=home?.querySelector('.fin-overview');
    const dock=home?.querySelector('.fin-smarty-dock'),donut=home?.querySelector('.fin-hero-donut');
    const heading=panel?.querySelector('.fin-heading-copy')||home?.querySelector('#smarty-glass-hero .fin-heading-copy');
    const health=home?.querySelector('#home-budget-health');
    if(!home||!scroll||!panel||!dock||!donut||!heading||!health)return false;
    let hero=doc.getElementById('smarty-glass-hero');
    if(!hero){hero=el('section');hero.id='smarty-glass-hero';hero.setAttribute('aria-label','Smarty y progreso del presupuesto');scroll.insertBefore(hero,panel);}
    if(hero.nextElementSibling!==panel)scroll.insertBefore(hero,panel);
    let greetings=hero.querySelector('.sg-hello');if(!greetings){greetings=el('div','sg-hello');hero.appendChild(greetings);}
    let headline=greetings.querySelector('.sg-hello-title');if(!headline){headline=el('strong','sg-hello-title');greetings.appendChild(headline);}
    if(dock.parentNode!==hero)hero.insertBefore(dock,greetings);
    if(heading.parentNode!==greetings)greetings.appendChild(heading);
    if(health.parentNode!==greetings)greetings.appendChild(health);
    if(donut.parentNode!==hero)hero.appendChild(donut);
    const controls=heading.querySelector('.fin-heading-controls');
    let picker=controls?.querySelector('.smarty-theme-trigger');
    if(picker && picker.parentNode!==panel)panel.appendChild(picker);
    let header=panel.querySelector('.sg-overview-heading');if(!header){header=el('div','sg-overview-heading');panel.insertBefore(header,panel.firstChild);}
    const grid=panel.querySelector('.fin-summary-details');
    if(!grid)return false;
    let today=doc.getElementById('smarty-glass-today');
    if(!today){today=el('button');today.type='button';today.id='smarty-glass-today';today.addEventListener('click',()=>f()?.openHomeMovements?.('expense'));const lbl=el('span','sg-metric-label');const v=el('strong','sg-metric-amount');today.append(lbl,v);}
    if(today.parentNode!==grid)grid.appendChild(today);
    const strip=doc.getElementById('smarty-insights-strip');if(strip){if(strip.parentNode!==grid)grid.appendChild(strip);strip.style.setProperty('grid-row','auto','important');strip.style.setProperty('grid-column','auto','important');}
    let trend=doc.getElementById('smarty-glass-trend');
    if(!trend){trend=el('section');trend.id='smarty-glass-trend';trend.setAttribute('aria-label',t('pacing'));
      const head=el('div','sg-trend-head'),title=el('div','sg-chart-label');title.innerHTML=icon.activity;title.appendChild(el('span','sg-chart-title'));
      const tabs=el('div','sg-tabs');for(const k of ['month','week']){const b=el('button','',t(k));b.type='button';b.dataset.period=k;b.setAttribute('aria-pressed',String(view===k));b.addEventListener('click',()=>{view=k;render();});tabs.appendChild(b);}
      head.append(title,tabs);trend.appendChild(head);trend.appendChild(el('div','sg-chart-wrap'));
      const legends=el('div','sg-legend');for(const [k,cls] of [['actual',''],['ideal','ideal']]){const item=el('span','sg-legend-item');item.append(el('i','sg-line '+cls),el('span','sg-legend-'+k));legends.appendChild(item);}trend.appendChild(legends);trend.appendChild(el('div','sg-trend-footer'));
      scroll.insertBefore(trend,panel.nextSibling);
    }
    let top=doc.getElementById('smarty-glass-top-grid');if(!top){top=el('div');top.id='smarty-glass-top-grid';const section=home.querySelector('.fin-categories-section');section?.appendChild(top);}
    return true;
  }

  function monthDays(now=new Date()){
    const y=now.getFullYear(),m=now.getMonth(),last=new Date(y,m+1,0).getDate(),td=now.getDate();
    const daily=Array(last+1).fill(0);
    const inMonth=d=>d.getFullYear()===y&&d.getMonth()===m;
    const safeDate=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d:null;};
    const validAmount=v=>Math.max(0,n(v));
    const expenses=Array.isArray(d()?.store?.expenses)?d().store.expenses:[];
    const cats=new Map();let reservedSubscriptions=0;
    function add(day,amount,cat){if(day<1||day>last||!Number.isFinite(amount)||amount<=0)return;
      daily[day]+=amount;const key=keyOf(cat);cats.set(key,(cats.get(key)||0)+amount);
    }
    for(const e of expenses){const d=safeDate(e.date);if(!d)continue;
      if(e.isInstallment){const count=Number(e.installments?.total)||0;const monthIndex=(y-d.getFullYear())*12+m-d.getMonth();if(monthIndex>=0&&monthIndex<count)add(Math.min(d.getDate(),last),validAmount(e.amount),e.category);}
      else if(inMonth(d))add(d.getDate(),validAmount(e.amount),e.category);
    }
    for(const l of d()?.store?.lists||[]){const d=safeDate(l.date);if(l.status==='completed'&&d&&inMonth(d))add(d.getDate(),validAmount(l.total),'cat_market');}
    for(const s of d()?.store?.subscriptions||[]){
      const day=Number(s.day),cost=validAmount(s.cost);
      if(day<1||day>last||!cost)continue;
      if(day<=td){add(day,cost,'cat_subs');}
      else {reservedSubscriptions+=cost;const key=keyOf('cat_subs');cats.set(key,(cats.get(key)||0)+cost);}
    }
    const cumulative=Array(last+1).fill(0);
    for(let i=1;i<=last;i++)cumulative[i]=cumulative[i-1]+daily[i]+(i===1?reservedSubscriptions:0);
    return {now,y,m,last,td,daily,cumulative,cats,reservedSubscriptions};
  }

  function plotGraph(){
    const chart=doc.querySelector('#smarty-glass-trend .sg-chart-wrap');if(!chart)return;
    const stats=monthDays(),budget=Math.max(0,n(d()?.store?.budget?.limit));
    const lightMode=doc.getElementById('home-finance-overview')?.dataset.smartyTheme==='light';
    const {td,last,cumulative}=stats;
    const left=view==='week'?Math.max(1,td-6):1,right=view==='week'?Math.min(last,left+6):last;
    const maxReal=Math.max(...cumulative.slice(left,td+1),0);
    const upper=Math.max(budget,maxReal,1)*1.13;
    const width=345,height=160,x0=14,x1=330,y0=133,y1=12;
    const xx=d=>x0+((d-left)/Math.max(1,right-left))*(x1-x0);
    const yy=v=>y0-Math.min(1,Math.max(0,v/upper))*(y0-y1);
    const series=(from,to,f)=>Array.from({length:to-from+1},(_,i)=>[xx(from+i),yy(f(from+i))]);
    const points=series(left,td,d=>cumulative[d]);
    if(view==='week' && right<td)points.push(...series(td+1,right,d=>cumulative[d]));
    const line=points.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    const area=`${line} L ${xx(td).toFixed(1)} ${y0} L ${xx(left).toFixed(1)} ${y0} Z`;
    const ideal=series(left,right,d=>budget*d/last).map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    const yyToday=yy(cumulative[td]),xToday=xx(td);
    const scaleVals=[0,.33,.66,1].map(f=>Math.round(upper*f));
    const s=doc.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox',`0 0 ${width} ${height}`);s.setAttribute('role','img');s.classList.add('sg-chart');s.setAttribute('aria-label',`${t('actual')}: ${money(cumulative[td])}. ${t('ideal')}: ${money(budget*td/last)}`);
    const xmlns='http://www.w3.org/2000/svg';
    const svg=(tag,props)=>{const item=doc.createElementNS(xmlns,tag);for(const [k,v] of Object.entries(props))item.setAttribute(k,String(v));return item;};
    const defs=svg('defs',{}),g=svg('linearGradient',{id:'sg-chart-fill',x1:'0',y1:'0',x2:'0',y2:'1'});g.append(svg('stop',{offset:'0%', 'stop-color':lightMode?'#078f88':'#65f8d1','stop-opacity':'.27'}),svg('stop',{offset:'100%','stop-color':lightMode?'#078f88':'#65f8d1','stop-opacity':'.005'}));defs.appendChild(g);s.appendChild(defs);
    for(let i=0;i<4;i++)s.appendChild(svg('line',{x1:x0,y1:y0-(y0-y1)*i/3,x2:x1,y2:y0-(y0-y1)*i/3,stroke:lightMode?'rgba(53,84,119,.24)':'rgba(233,217,255,.17)','stroke-width':1}));
    if(budget>0)s.appendChild(svg('path',{d:ideal,fill:'none',stroke:lightMode?'#7753c7':'#c894fc','stroke-width':2.4,'stroke-dasharray':'6 5','stroke-linejoin':'round'}));
    s.append(svg('path',{d:area,fill:'url(#sg-chart-fill)'}),svg('path',{d:line,fill:'none',stroke:lightMode?'#00897c':'#64f5ce','stroke-width':3.8,'stroke-linejoin':'round','stroke-linecap':'round'}));
    s.appendChild(svg('circle',{cx:xToday,cy:yyToday,r:5.1,fill:lightMode?'#00897c':'#65f6ce',stroke:'#fff','stroke-width':2}));
    const txt=(x,y,str,anchor='middle')=>{const z=svg('text',{x,y,fill:lightMode?'#51617d':'rgba(240,226,255,.81)','font-size':'10','font-family':'system-ui,Arial', 'text-anchor':anchor});z.textContent=str;s.appendChild(z);};
    const dateLabel=d=>view==='week'?`${d}/${stats.m+1}`:String(d);
    txt(x0,155,dateLabel(left),'start');txt(x1,155,dateLabel(right),'end');
    if(view==='month'&&right>7){txt(xx(Math.round((left+right)/2)),155,dateLabel(Math.round((left+right)/2)));}
    chart.replaceChildren(s);
    const footer=doc.querySelector('#smarty-glass-trend .sg-trend-footer');
    if(footer){
      if(!budget)footer.textContent=t('noBudget');
      else {const delta=cumulative[td]-budget*td/last;footer.textContent=`${delta>0?t('exceeding'):t('leading')} · ${money(Math.abs(delta))}`;}
    }
  }
  function topCats(stats){
    const grid=doc.getElementById('smarty-glass-top-grid');if(!grid)return;
    grid.replaceChildren();const total=[...stats.cats.values()].reduce((a,b)=>a+b,0);
    const entries=[...stats.cats.entries()].filter(([,amt])=>amt>0).sort((a,b)=>b[1]-a[1]).slice(0,4);
    if(!entries.length){grid.appendChild(el('div','sg-cat-empty',t('noData')));return;}
    for(const [key,value] of entries){
      const item=el('button','sg-cat-card');item.type='button';const id=key;
      const known=(u()?.categories||[]).some(c=>c.id===id)||id==='cat_subs';
      const categoryNames={cat_lunch:{es:'Almuerzo',pt:'Almoço',en:'Lunch'},cat_dining:{es:'Delivery y Salidas',pt:'Delivery e Saídas',en:'Delivery & Dining'},cat_leisure:{es:'Microgastos',pt:'Microgastos',en:'Micro-expenses'},cat_subs:{es:'Gastos Fijos',pt:'Gastos Fixos',en:'Fixed Expenses'}};const fromUI=known?(id==='cat_subs'?u()?.t?.('tab_subs'):u()?.t?.(id)):null;const legacyLeisure=id==='cat_leisure'&&['ocio','lazer','leisure'].includes(String(fromUI||'').toLocaleLowerCase('en'));const actualLabel=(fromUI&&fromUI!==id&&fromUI!=='tab_subs'&&!legacyLeisure)?fromUI:(categoryNames[id]?.[lang()]||label(id));
      item.setAttribute('aria-label',`${actualLabel}: ${Math.round(100*value/total)}%`);
      item.addEventListener('click',()=>f()?.openHomeCategory?.(known?id:null));
      const graphic=el('span','sg-cat-icon');
      if(typeof u()?.categoryIcon==='function')graphic.innerHTML=u().categoryIcon(known?id:'cat_other');
      item.appendChild(graphic);
      item.append(el('span','sg-cat-name',actualLabel),el('strong','sg-cat-percent',`${Math.round(100*value/total)}%`));
      const track=el('div','sg-cat-track'),fill=el('div','sg-cat-fill');fill.style.width=`${Math.min(100,100*value/total)}%`;track.appendChild(fill);item.appendChild(track);grid.appendChild(item);
    }
  }
  function render(){
    if(!layout())return;
    const stats=monthDays();
    const root=doc.getElementById('view-home'),hero=doc.getElementById('smarty-glass-hero');
    theme();
    hero.querySelector('.sg-hello-title').textContent=t('hello');
    const labelSummary=doc.querySelector('#view-home .sg-overview-heading');if(labelSummary)labelSummary.textContent=t('summary');
    const rem=doc.querySelector('#view-home .fin-balance-label');if(rem)rem.textContent=t('remaining');
    const today=doc.getElementById('smarty-glass-today');if(today){today.querySelector('.sg-metric-label').textContent=t('spentToday');today.querySelector('.sg-metric-amount').textContent=money(stats.daily[stats.td]);today.title=t('todayInfo');}
    const daily=doc.getElementById('smarty-insights-strip'), dailyInfo=daily?.querySelector('.smarty-daily-info');if(dailyInfo){const dailyLabel=dailyInfo.querySelector('.smarty-daily-label');if(dailyLabel)dailyLabel.textContent=t('daily');let days=dailyInfo.querySelector('.sg-days-remaining');if(!days){days=el('span','sg-days-remaining');dailyInfo.appendChild(days);}const remains=stats.last-stats.td+1;days.textContent=remains+' '+({es:'días restantes',pt:'dias restantes',en:'days left'}[lang()]);}
    const trend=doc.getElementById('smarty-glass-trend');if(trend){trend.querySelector('.sg-chart-title').textContent=t('pacing');trend.querySelectorAll('.sg-tabs button').forEach(btn=>{btn.textContent=t(btn.dataset.period);btn.setAttribute('aria-pressed',String(btn.dataset.period===view));});trend.querySelector('.sg-legend-actual').textContent=t('actual');trend.querySelector('.sg-legend-ideal').textContent=t('ideal');plotGraph();}
    topCats(stats);
  }
  function enqueue(){if(frameQueued)return;frameQueued=true;requestAnimationFrame(()=>{frameQueued=false;try{render();}catch(e){console.warn('[Smarty Glass Home]',e);}});}
  function observe(){if(observationReady)return;observationReady=true;
    const ids=['budget-spent','budget-limit','budget-remaining','home-budget-percent','home-month-title','smarty-insights-strip'];
    const observer=new MutationObserver(()=>enqueue());
    for(const id of ids){const node=doc.getElementById(id);if(node)observer.observe(node,{characterData:true,childList:true,subtree:true});}
    const overview=doc.getElementById('home-finance-overview');if(overview)observer.observe(overview,{attributes:true,attributeFilter:['data-smarty-theme']});
    doc.addEventListener('visibilitychange',()=>{if(doc.visibilityState==='visible')enqueue();});
    window.addEventListener('focus',enqueue);
    window.addEventListener('smarty:updated',enqueue);
  }
  function start(){css();if(!layout())return;enqueue();observe();}
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('load',()=>{setTimeout(start,700);},{once:true});
  setTimeout(start,950);
  window.SmartyHomeGlassDesign={version:VERSION,refresh:enqueue};
})();

/* =====================================================================
   SMARTY GLASS COMPACT · v16 · layout-only overlay on approved v15.
   Does not replace functions, data, category config, budget calculations,
   notification service, themes or chart interactivity.
   ===================================================================== */
(function () {
  'use strict';
  const ID='smarty-glass-compact-v16';
  const CSS=String.raw`
/* Move content up while preserving phone safe areas and the fixed dock. */
#view-home .home-header{min-height:53px!important;padding:7px 14px 5px!important}
#view-home .fin-home-scroll{padding-top:0!important}
/* Smarty + greeting + single donut: same approved composition, less vertical space. */
#smarty-glass-hero{grid-template-columns:77px minmax(0,1fr) 88px!important;min-height:111px!important;gap:7px!important;margin:0 12px 6px!important;padding:2px 0!important}
#smarty-glass-hero .fin-smarty-portrait{width:69px!important;height:69px!important;max-width:69px!important}
#smarty-glass-hero .fin-smarty-dialog{width:73px!important;max-width:73px!important;min-height:21px!important;padding:2px 6px!important}
#smarty-glass-hero .fin-smarty-dialog-label{font-size:9px!important}
#smarty-glass-hero .fin-smarty-xp{height:27px!important;bottom:11px!important}
#smarty-glass-hero .sg-hello{gap:4px!important}
#smarty-glass-hero .sg-hello-title{font-size:clamp(17px,4.6vw,21px)!important}
#smarty-glass-hero .fin-heading-copy{gap:2px!important}
#smarty-glass-hero .fin-month-title{font-size:10px!important}
#smarty-glass-hero .fin-health-pill{padding:4px 6px!important;font-size:9px!important}
#smarty-glass-hero .fin-hero-donut{width:88px!important;height:88px!important;min-width:88px!important}
#smarty-glass-hero .fin-hero-donut .fin-ring-value{font-size:20px!important}
/* Four metrics + remaining balance: tighter spacing, unchanged information. */
#view-home .fin-overview{padding:11px 13px!important;gap:6px!important;margin:0 11px 9px!important;border-radius:21px!important}
#view-home .sg-overview-heading{font-size:9px!important}
#view-home .fin-balance-label{font-size:10px!important}
#view-home .fin-balance-amount{font-size:clamp(24px,6.9vw,29px)!important;margin:2px 0 0!important;line-height:1.1!important}
#view-home .fin-summary-details{gap:6px!important}
#view-home .fin-summary-details .fin-metric,#view-home #smarty-insights-strip,#view-home #smarty-glass-today{min-height:55px!important;padding:7px 9px!important;gap:2px!important;border-radius:13px!important}
#view-home #smarty-insights-strip{min-height:55px!important;margin:0!important}
#view-home #smarty-insights-strip .smarty-daily-info{gap:2px!important}
#view-home .fin-metric-top,#view-home #smarty-insights-strip .smarty-daily-label,#view-home #smarty-glass-today .sg-metric-label{font-size:9px!important}
#view-home .fin-summary-details .fin-metric strong,#view-home #smarty-insights-strip .smarty-daily-val,#view-home #smarty-glass-today .sg-metric-amount{font-size:clamp(13px,3.7vw,16px)!important}
#view-home #smarty-insights-strip .sg-days-remaining{font-size:8px!important}
#view-home .smarty-theme-trigger{width:25px!important;height:25px!important;right:10px!important;top:8px!important}
/* Spending graph: preserve Month/Week switching, axes and both series. */
#smarty-glass-trend{padding:10px 12px 8px!important;margin:0 11px 9px!important;border-radius:21px!important}
#smarty-glass-trend .sg-chart-label{font-size:12px!important;gap:6px!important}
#smarty-glass-trend .sg-chart-label svg{width:17px!important;height:17px!important;flex-basis:17px!important}
#smarty-glass-trend .sg-tabs button{min-height:24px!important;padding:4px 10px!important}
#smarty-glass-trend .sg-chart-wrap{height:clamp(106px,15vh,126px)!important;margin:5px 0 0!important}
#smarty-glass-trend .sg-legend{margin:0 auto!important;font-size:9px!important;gap:12px!important}
#smarty-glass-trend .sg-trend-footer{margin-top:4px!important;font-size:9px!important}
/* Secondary blocks closer together; no hiding existing details. */
#view-home .fin-home-module{border-radius:19px!important}
#smarty-glass-top-grid{padding:2px 11px 9px!important;gap:6px!important}
#smarty-glass-top-grid .sg-cat-card{min-height:78px!important;padding:7px 6px!important;gap:3px!important;border-radius:13px!important}
/* Narrow devices: maintain legible values and avoid donut/greeting collisions. */
@media(max-width:380px){
 #smarty-glass-hero{grid-template-columns:67px minmax(0,1fr) 77px!important;gap:5px!important;min-height:98px!important;margin:0 9px 5px!important}
 #smarty-glass-hero .fin-smarty-portrait{width:61px!important;height:61px!important;max-width:61px!important}
 #smarty-glass-hero .fin-smarty-dialog{width:64px!important;max-width:64px!important;min-height:19px!important}
 #smarty-glass-hero .fin-hero-donut{width:77px!important;height:77px!important;min-width:77px!important}
 #smarty-glass-hero .sg-hello-title{font-size:17px!important}
 #view-home .fin-overview{padding:9px 10px!important;margin:0 9px 8px!important}
 #smarty-glass-trend{padding:9px 10px 7px!important;margin:0 9px 8px!important}
 #smarty-glass-trend .sg-chart-wrap{height:clamp(98px,14.5vh,115px)!important}
 #view-home .fin-summary-details .fin-metric,#view-home #smarty-insights-strip,#view-home #smarty-glass-today{min-height:53px!important;padding:6px 7px!important}
}
`;
  function apply(){
    let style=document.getElementById(ID);
    if(!style){style=document.createElement('style');style.id=ID;document.head.appendChild(style);}
    if(style.textContent!==CSS)style.textContent=CSS;
  }
  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.SmartyHomeCompactDesign={version:'smarty-glass-compact-2026-11-08-16',refresh:apply};
})();

/* =====================================================================
   SMARTY GLASS DENSE v17 — solo presentación del Inicio.
   La sección de categorías existente se mueve al resumen: se mantienen
   sus botones, iconos, IDs, etiquetas, filtros y la lectura de datos v16.
   ===================================================================== */
(function () {
  'use strict';
  const ID = 'smarty-glass-dense-v17';
  const CSS = String.raw`
/* Resumen más informativo sin los cuatro rectángulos anidados. */
#view-home .fin-overview{gap:4px!important;padding:11px 13px 10px!important;margin-bottom:8px!important}
#view-home .sg-overview-heading{font-size:9px!important;line-height:1.1!important;margin-bottom:1px!important}
#view-home .fin-overview .fin-hero-main{gap:0!important;margin:0!important}
#view-home .fin-balance-label{font-size:10px!important}
#view-home .fin-balance-amount{font-size:clamp(23px,6.7vw,29px)!important;line-height:1.08!important;margin:2px 0 4px!important}
#view-home .fin-overview .fin-summary-details{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:0!important;border-top:1px solid rgba(234,219,255,.23)!important;border-bottom:1px solid rgba(234,219,255,.23)!important;margin:1px 0 0!important;padding:2px 0!important}
#view-home .fin-overview .fin-summary-details>.fin-metric,
#view-home .fin-overview .fin-summary-details>#smarty-glass-today,
#view-home .fin-overview .fin-summary-details>#smarty-insights-strip{
  display:flex!important;flex-direction:column!important;align-items:flex-start!important;
  justify-content:center!important;min-height:44px!important;height:auto!important;
  padding:5px 7px!important;gap:2px!important;border:0!important;border-radius:0!important;
  background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;margin:0!important;min-width:0!important;position:relative!important;
}
#view-home .fin-overview .fin-summary-details>:nth-child(odd){border-right:1px solid rgba(234,219,255,.18)!important}
#view-home .fin-overview .fin-summary-details>:nth-child(-n+2){border-bottom:1px solid rgba(234,219,255,.18)!important}
#view-home .fin-overview .fin-summary-details .fin-metric-top,
#view-home .fin-overview .fin-summary-details #smarty-glass-today .sg-metric-label,
#view-home .fin-overview .fin-summary-details #smarty-insights-strip .smarty-daily-label{
  display:block!important;font-size:9px!important;line-height:1.1!important;font-weight:700!important;color:rgba(235,222,255,.73)!important;
}
#view-home .fin-overview .fin-summary-details .fin-metric-icon{display:none!important}
#view-home .fin-overview .fin-summary-details .fin-metric strong,
#view-home .fin-overview .fin-summary-details #smarty-glass-today .sg-metric-amount,
#view-home .fin-overview .fin-summary-details #smarty-insights-strip .smarty-daily-val{
  font-size:clamp(13px,3.65vw,16px)!important;font-weight:850!important;line-height:1.13!important;
  min-height:0!important;white-space:nowrap!important;letter-spacing:-.3px!important
}
#view-home .fin-overview .fin-summary-details #smarty-insights-strip .smarty-daily-info{gap:1px!important}
#view-home .fin-overview .fin-summary-details #smarty-insights-strip .sg-days-remaining{font-size:8px!important;line-height:1.1!important}
/* Categorías del APK, reutilizadas DENTRO de la tarjeta principal. */
#view-home .fin-overview .fin-categories-section.smarty-categories-embedded-v17{
  display:block!important;width:100%!important;min-width:0!important;
  margin:0!important;padding:5px 0 0!important;min-height:0!important;
  border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow:visible!important;
}
#view-home .fin-overview .fin-categories-section .fin-module-header{
  padding:1px 1px 5px!important;min-height:23px!important;font-size:11px!important;margin:0!important;
  display:flex!important;align-items:center!important;justify-content:space-between!important;
}
#view-home .fin-overview .fin-categories-section .fin-module-heading-left{gap:6px!important;font-size:11px!important}
#view-home .fin-overview .fin-categories-section .fin-module-icon{width:21px!important;height:21px!important;min-width:21px!important;border-radius:7px!important}
#view-home .fin-overview .fin-categories-section .fin-module-icon svg{width:15px!important;height:15px!important}
#view-home .fin-overview .fin-categories-section .fin-module-chevron{font-size:20px!important;line-height:1!important}
#view-home .fin-overview #smarty-glass-top-grid{
  display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;
  gap:5px!important;padding:0!important;margin:0!important;
}
#view-home .fin-overview #smarty-glass-top-grid .sg-cat-card{
  box-sizing:border-box;min-height:58px!important;display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;grid-template-rows:20px minmax(18px,auto) 3px!important;
  align-content:center!important;align-items:center!important;gap:2px 2px!important;
  padding:5px 5px 5px!important;border-radius:11px!important;text-align:left!important;
  background:rgba(220,199,255,.075)!important;border:1px solid rgba(233,213,255,.14)!important;
}
#view-home .fin-overview #smarty-glass-top-grid .sg-cat-icon{grid-column:1!important;grid-row:1!important;min-width:0!important}
#view-home .fin-overview #smarty-glass-top-grid .sg-cat-icon .category-icon-shell{width:20px!important;height:20px!important;border-radius:6px!important}
#view-home .fin-overview #smarty-glass-top-grid .sg-cat-icon .category-icon{width:14px!important;height:14px!important}
#view-home .fin-overview #smarty-glass-top-grid .sg-cat-percent{grid-column:2!important;grid-row:1!important;align-self:center!important;font-size:10px!important;margin:0!important}
#view-home .fin-overview #smarty-glass-top-grid .sg-cat-name{
  grid-column:1/-1!important;grid-row:2!important;font-size:8px!important;font-weight:750!important;
  line-height:1.09!important;min-height:17px!important;max-height:19px!important;overflow:hidden!important;
  word-break:normal!important;overflow-wrap:anywhere!important;margin:0!important;
}
#view-home .fin-overview #smarty-glass-top-grid .sg-cat-track{grid-column:1/-1!important;grid-row:3!important;height:3px!important;margin:0!important}
#view-home .fin-overview #smarty-glass-top-grid .sg-cat-empty{padding:7px 1px!important}
#view-home .fin-overview #home-top-categories{display:none!important}
#view-home .fin-overview .fin-categories-section .fin-module-body:empty{display:none!important}
@media(max-width:375px){
 #view-home .fin-overview{padding:9px 9px 8px!important}
 #view-home .fin-overview #smarty-glass-top-grid{gap:4px!important}
 #view-home .fin-overview #smarty-glass-top-grid .sg-cat-card{padding:4px 3px!important}
 #view-home .fin-overview #smarty-glass-top-grid .sg-cat-name{font-size:7.6px!important}
}
`;
  let pending=false;
  function style(){
    let st=document.getElementById(ID);
    if(!st){st=document.createElement('style');st.id=ID;document.head.appendChild(st);}
    if(st.textContent!==CSS)st.textContent=CSS;
  }
  function update(){
    style();
    const home=document.getElementById('view-home');
    const panel=home?.querySelector('#home-finance-overview');
    const section=home?.querySelector('.fin-categories-section');
    if(!panel||!section||!document.getElementById('smarty-glass-hero')||!document.getElementById('smarty-glass-top-grid'))return false;
    section.classList.add('smarty-categories-embedded-v17');
    if(section.parentElement!==panel)panel.appendChild(section);
    // El parche base solo debe retirarse cuando el nuevo DOM y CSS están listos.
    requestAnimationFrame(()=>document.getElementById('smarty-prepaint')?.remove());
    return true;
  }
  function init(){
    if(update())return;
    if(pending)return;
    pending=true;
    let tries=0;
    const retry=()=>{
      if(update()||++tries>=45){pending=false;return;}
      requestAnimationFrame(retry);
    };
    requestAnimationFrame(retry);
  }
  style();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('smarty:updated',init);
  window.SmartyHomeDenseDesign={version:'smarty-glass-dense-2026-11-08-17',refresh:init};
})();


/* =====================================================================
   SMARTY FINANCE & SKINS · v18
   - Monthly subscriptions reserved immediately (matches Finance's pie chart).
   - Home dock plus button follows the app-wide Settings theme.
   - Light/Dark visual variants of the existing card picker.
   No edits to persistent data, Android notification listener, or category IDs.
   ===================================================================== */
(function(){
  'use strict';
  const VERSION='smarty-light-2026-11-08-18';
  const MARK='__smartyMonthlySubscriptionProjection18';
  function installAccounting(){
    const f=typeof Finance!=='undefined'?Finance:null,u=typeof UI!=='undefined'?UI:null,d=typeof Data!=='undefined'?Data:null;
    if(!f||!u||!d?.store||typeof f.calculateMonthlySpent!=='function')return false;
    const current=f.calculateMonthlySpent;
    if(current[MARK])return true;
    const wrapped=function(...args){
      const baseline=Number(current.apply(this,args));
      const now=new Date();
      const last=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
      let pending=0;
      for(const sub of d.store.subscriptions||[]){
        const day=Number(sub.day),cost=Number(sub.cost);
        if(day>now.getDate()&&day<=last&&Number.isFinite(cost))pending+=cost;
      }
      return (Number.isFinite(baseline)?baseline:0)+pending;
    };
    wrapped[MARK]=true;
    f.calculateMonthlySpent=wrapped;
    return true;
  }
  const CSS=String.raw`
/* El + y el estado activo siguen el tema escogido en Ajustes, no un morado fijo. */
#app-root:has(#view-home.active) #dock-plus-btn{
  background:var(--primary-grad)!important;
  box-shadow:0 5px 16px color-mix(in srgb,var(--primary) 37%,transparent),inset 0 1px 0 rgba(255,255,255,.26)!important;
}
#app-root:has(#view-home.active) #dock-plus-btn.listening{
  background:var(--primary-grad)!important;
  box-shadow:0 0 25px color-mix(in srgb,var(--primary) 55%,transparent)!important;
}
#app-root:has(#view-home.active) .bottom-dock .dock-btn.active{
  color:var(--primary)!important;
  background:color-mix(in srgb,var(--primary) 21%,transparent)!important;
}
/* Claro: alto contraste y tarjetas translúcidas, sin alterar otras pantallas. */
#view-home:has(#home-finance-overview[data-smarty-theme="light"]){color:#192c47!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .home-brand-name,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-hero .sg-hello-title,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-hero .fin-ring-value,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-hero .donut-label{
  color:#20344e!important;
}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .home-brand-copy .app-title-text,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-hero .fin-month-title{
  color:#566b83!important;
}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .home-profile-btn,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .glass-btn-small{
  color:#263c59!important;background:rgba(255,255,255,.48)!important;border-color:rgba(87,119,165,.27)!important;
}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-hero .fin-smarty-dialog{
  background:rgba(255,255,255,.61)!important;border-color:rgba(88,118,162,.27)!important;color:#24405d!important;
}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-hero .fin-smarty-dialog-label{color:#24405d!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-hero .fin-hero-donut .circle-bg{stroke:rgba(73,99,146,.19)!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-overview{
  color:#20354e!important;border-color:rgba(104,138,181,.38)!important;
  box-shadow:0 12px 30px rgba(52,85,125,.13),inset 0 1px 0 rgba(255,255,255,.7)!important;
}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-overview:before{background:radial-gradient(circle,rgba(151,182,235,.17),transparent 71%)!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .sg-overview-heading,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-balance-label,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-metric-top,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-insights-strip .smarty-daily-label,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-today .sg-metric-label,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-insights-strip .sg-days-remaining{
  color:#526783!important;
}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-overview .fin-balance-amount,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-summary-details .fin-metric strong,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-insights-strip .smarty-daily-val,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-today .sg-metric-amount{
  color:#173c55!important;
}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-overview .fin-summary-details{
  border-color:rgba(83,117,164,.21)!important;
}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-overview .fin-summary-details>:nth-child(odd),
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-overview .fin-summary-details>:nth-child(-n+2){border-color:rgba(83,117,164,.18)!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .smarty-theme-trigger{color:#2c4d6f!important;background:rgba(255,255,255,.36)!important;border-color:rgba(82,119,166,.27)!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-trend{
  color:#20354e!important;background:linear-gradient(130deg,rgba(255,255,255,.61),rgba(202,219,250,.44))!important;
  border-color:rgba(93,130,176,.29)!important;box-shadow:0 9px 25px rgba(52,85,125,.11)!important;
}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-trend .sg-chart-label svg{stroke:#6751b6!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-trend .sg-tabs{background:rgba(70,98,145,.09)!important;border-color:rgba(85,111,154,.22)!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-trend .sg-tabs button:not([aria-pressed="true"]){color:#4b5b76!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-trend .sg-tabs button[aria-pressed="true"]{background:linear-gradient(135deg,#637cc3,#375989)!important;color:#fff!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-trend .sg-legend,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-trend .sg-trend-footer{color:#566b83!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-trend .sg-line{background:#00897c!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) #smarty-glass-trend .sg-line.ideal{background:none!important;border-top-color:#7753c7!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-module-header,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-overview #smarty-glass-top-grid .sg-cat-card,
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .home-expense-row{color:#263d59!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-overview #smarty-glass-top-grid .sg-cat-card{background:rgba(255,255,255,.28)!important;border-color:rgba(89,125,170,.17)!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .home-expense-row{background:rgba(255,255,255,.46)!important;border-color:rgba(85,111,154,.19)!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .home-expense-row>div:first-child>div>span:last-child{color:#667c96!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .home-expense-row>div:last-child{color:#aa4364!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-module-icon{color:#455a9a!important;background:rgba(68,94,152,.12)!important}
#view-home:has(#home-finance-overview[data-smarty-theme="light"]) .fin-module-chevron{color:#5a6b89!important}
#app-root:has(#view-home.active #home-finance-overview[data-smarty-theme="light"]) .bottom-dock{
  background:linear-gradient(130deg,rgba(255,255,255,.87),rgba(210,223,246,.82))!important;
  border-color:rgba(95,128,171,.29)!important;box-shadow:0 12px 27px rgba(43,76,123,.13)!important;
}
#app-root:has(#view-home.active #home-finance-overview[data-smarty-theme="light"]) .bottom-dock .dock-btn{color:#516581!important}
/* Oscuro: negro azulado, preservando contraste del estilo Glass. */
#view-home:has(#home-finance-overview[data-smarty-theme="dark"]) .fin-overview{
  background:linear-gradient(135deg,rgba(33,44,64,.96),rgba(13,21,37,.96))!important;
  border-color:rgba(122,150,184,.28)!important;
}
#view-home:has(#home-finance-overview[data-smarty-theme="dark"]) #smarty-glass-trend{background:linear-gradient(135deg,rgba(74,93,127,.18),rgba(15,24,42,.34))!important}
`;
  function installVisual(){
    let style=document.getElementById('smarty-v18-settings-skins');
    if(!style){style=document.createElement('style');style.id='smarty-v18-settings-skins';document.head.appendChild(style);}
    if(style.textContent!==CSS)style.textContent=CSS;
  }
  function refresh(){
    installVisual();
    const first=installAccounting();
    if(first){try{if(typeof UI!=='undefined')UI.renderBudgetChart?.();}catch(e){console.warn('[Smarty v18 budget]',e);}}
    try{window.SmartyHomeGlassDesign?.refresh?.();}catch(e){console.warn('[Smarty v18 graph]',e);}
  }
  installVisual();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
  window.addEventListener('load',refresh,{once:true});
  window.addEventListener('smarty:updated',refresh);
  window.SmartyFinanceV18={version:VERSION,refresh};
})();
