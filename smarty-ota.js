/* Smart Life Pro — OTA visual: tarjeta financiera personalizable y Smarty completo.
 * Versión: smarty-light-2026-10-28-05
 * Solo modifica la interfaz ya instalada; no modifica gastos, datos ni actualizaciones.
 */
(function () {
  'use strict';
  window.SMARTY_PATCH_BUILD_ID = 'smarty-light-2026-10-28-05';

  const STORE_KEY = 'smarty.finance.card.theme.v1';
  const STORE_COLORS = 'smarty.finance.card.colors.v1';
  const THEMES = {
    glass: { name: 'Glass Premium', a: '#204c64', b: '#10273e', accent: '#86e4d2' },
    bb: { name: 'Inspirado en Banco do Brasil', a: '#123c96', b: '#071c55', accent: '#ffda54' },
    nubank: { name: 'Inspirado en Nubank', a: '#803fc0', b: '#421a73', accent: '#e0bcff' },
    mp: { name: 'Inspirado en Mercado Pago', a: '#118ac6', b: '#07528d', accent: '#9de9ff' },
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
    if (modal) return modal;
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
    ['glass', 'bb', 'nubank', 'mp'].forEach(key => {
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
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape') closePicker();});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  window.addEventListener('load',run,{once:true});
  setTimeout(run,350);
  window.SmartyCardThemes = {apply:applyTheme,open:openPicker};
})();
