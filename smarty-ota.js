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
    // La vista se muestra solo cuando la estructura y los estilos ya están colocados.
    document.getElementById('smarty-prepaint')?.remove();
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape') closePicker();});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  window.addEventListener('load',run,{once:true});
  setTimeout(run,350);
  window.SmartyCardThemes = {apply:applyTheme,open:openPicker};
})();

/* SMARTY — planificación, topes y promedios vía OTA (solo datos locales).
   No modifica registros de gastos ni necesita nuevos plugins de Android.
*/
(function () {
  'use strict';
  const VERSION = 'smarty-light-2026-11-02-08';
  window.SMARTY_PATCH_BUILD_ID = VERSION;

  const LANG = {
    es: {daily:'Disponible para gastar al día',dailyZero:'Configura un presupuesto',dailyOver:'Presupuesto superado',days:'días, incluido hoy',open:'Topes y promedios',caps:'Topes por categoría',avgs:'Promedios de gastos',recent:'Últimos',months:'meses cerrados',monthly:'Promedio mensual',monthlyCaption:'Incluye gastos, cuotas y listas completadas',catAverage:'Promedio por categoría',none:'Aún no hay meses completos con movimientos.',save:'Guardar topes',close:'Cerrar',limit:'Tope mensual',spent:'Gastado este mes',remaining:'Disponible',near:'Cerca del límite',over:'Límite superado',okay:'En rango',unset:'Sin límite',noCaps:'Configura topes para controlar categorías específicas.',warn:'Cerca del tope',avgSuffix:'/mes',note:'Los meses sin gastos cuentan como 0 después del primer mes registrado. Suscripciones: solo desde su fecha de alta identificable.',help:'Vacío o 0 = sin tope. No modifica tus gastos existentes.',status:'Estado de categorías',today:'Hoy',all:'Todo correcto',historyN:'Meses con historial',unknown:'Categoría antigua',show:'Ver detalles',invalid:'Introduce importes válidos no negativos.',saved:'Topes guardados',noBudget:'Sin presupuesto',spentMore:'Excedido',next:'Topes y estadísticas',planned:'Los gastos de meses futuros no se cuentan en este mes.'},
    pt: {daily:'Disponível para gastar por dia',dailyZero:'Defina um orçamento',dailyOver:'Orçamento ultrapassado',days:'dias, incluindo hoje',open:'Limites e médias',caps:'Limites por categoria',avgs:'Médias de gastos',recent:'Últimos',months:'meses completos',monthly:'Média mensal',monthlyCaption:'Inclui despesas, parcelas e listas concluídas',catAverage:'Média por categoria',none:'Ainda não há meses completos com movimentações.',save:'Salvar limites',close:'Fechar',limit:'Limite mensal',spent:'Gasto neste mês',remaining:'Disponível',near:'Perto do limite',over:'Limite ultrapassado',okay:'Dentro do limite',unset:'Sem limite',noCaps:'Defina limites para acompanhar suas categorias.',warn:'Perto do limite',avgSuffix:'/mês',note:'Meses sem gastos contam como 0 após o primeiro registro. Assinaturas: somente a partir da data de cadastro identificável.',help:'Vazio ou 0 = sem limite. Não altera as despesas existentes.',status:'Situação das categorias',today:'Hoje',all:'Tudo em dia',historyN:'Meses com histórico',unknown:'Categoria antiga',show:'Ver detalhes',invalid:'Informe valores válidos e não negativos.',saved:'Limites salvos',noBudget:'Sem orçamento',spentMore:'Excedido',next:'Limites e estatísticas',planned:'Despesas de meses futuros não contam neste mês.'},
    en: {daily:'Available to spend per day',dailyZero:'Set a monthly budget',dailyOver:'Budget exceeded',days:'days including today',open:'Limits & averages',caps:'Category limits',avgs:'Spending averages',recent:'Last',months:'completed months',monthly:'Monthly average',monthlyCaption:'Includes expenses, installments and completed lists',catAverage:'Average by category',none:'No completed months with transactions yet.',save:'Save limits',close:'Close',limit:'Monthly cap',spent:'Spent this month',remaining:'Remaining',near:'Near cap',over:'Cap exceeded',okay:'On track',unset:'No cap',noCaps:'Set category caps to monitor spending.',warn:'Near cap',avgSuffix:'/month',note:'Zero-spend months count as 0 after your first record. Subscriptions are counted only from an identifiable creation date.',help:'Blank or 0 = no cap. Does not change existing expenses.',status:'Category status',today:'Today',all:'All on track',historyN:'Months with history',unknown:'Legacy category',show:'View details',invalid:'Enter valid nonnegative amounts.',saved:'Caps saved',noBudget:'No budget',spentMore:'Exceeded',next:'Limits & insights',planned:'Expenses belonging to future months are excluded.'}
  };
  const CATEGORY_ALIASES = {
    cat_market:['mercado','supermercado','groceries','grocery'],
    cat_leisure:['ocio','lazer','leisure','entretenimiento','entertainment'],
    cat_transport:['transporte','transport','transportation'],
    cat_clothes:['ropa','roupa','clothes','vestuario'],
    cat_health:['salud','saude','health'],
    cat_bills:['hogar','casa','home','bills','contas','gastos fijos','gastos fixos'],
    cat_travel:['viaje','viagem','travel'],
    cat_beauty:['belleza','beleza','beauty'],
    cat_other:['otro','otros','other','outros','outro'],
    cat_subs:['suscripciones','assinaturas','subscriptions','subscription','suscripcion','assinatura'],
    // Categorías históricas que no deben mezclarse arbitrariamente con otras.
    cat_food:['comida','food','alimentacion','alimentacao'],
    cat_shop:['compras','shopping','purchases']
  };
  const DEFAULT_NAMES = {cat_subs:['Suscripciones','Assinaturas','Subscriptions'],cat_food:['Comida','Comida','Food'],cat_shop:['Compras','Compras','Shopping']};
  const CSS = `
#smarty-insights-strip{grid-column:1/-1!important;display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0;margin:5px 0 0;padding:8px 10px;border:1px solid rgba(237,249,255,.17);border-radius:12px;background:rgba(255,255,255,.105);color:#fff;}
#smarty-insights-strip .smarty-daily-info{display:flex;flex-direction:column;gap:2px;min-width:0}
#smarty-insights-strip .smarty-daily-label{font:600 9px/1.2 system-ui,sans-serif;color:rgba(245,250,255,.84)}
#smarty-insights-strip .smarty-daily-val{font:800 16px/1.2 system-ui,sans-serif;color:white;font-variant-numeric:tabular-nums;white-space:nowrap}
#smarty-insights-strip .smarty-insights-open{display:flex;align-items:center;justify-content:center;min-width:90px;max-width:47%;gap:4px;padding:7px 8px;border:1px solid rgba(241,249,255,.27);border-radius:9px;background:rgba(255,255,255,.15);color:#fff;font:700 10px/1.3 system-ui,sans-serif;cursor:pointer;text-align:center}
#smarty-category-alert{grid-column:1/-1!important;display:none;align-items:center;gap:7px;min-width:0;padding:5px 2px 0;font:600 10px/1.4 system-ui,sans-serif;color:#fbe9c7}
#smarty-category-alert.is-visible{display:flex}
#smarty-insights-modal{position:fixed;inset:0;display:none;align-items:flex-end;justify-content:center;z-index:2147483645;background:rgba(4,16,28,.65);padding:env(safe-area-inset-top) 10px calc(10px + env(safe-area-inset-bottom));box-sizing:border-box}
#smarty-insights-modal.is-open{display:flex}
#smarty-insights-modal .si-panel{width:100%;max-width:560px;max-height:min(86dvh,800px);display:flex;flex-direction:column;overflow:hidden;border-radius:22px;background:var(--card-bg, #f7fbfa);color:var(--text-color,#233343);border:1px solid var(--glass-border,rgba(152,182,198,.22));box-shadow:0 25px 70px rgba(0,0,0,.30);font-family:system-ui,sans-serif}
#smarty-insights-modal .si-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 17px;border-bottom:1px solid var(--glass-border,rgba(132,164,183,.17))}
#smarty-insights-modal .si-title{font-size:16px;font-weight:800;margin:0}
#smarty-insights-modal .si-close{border:0;background:var(--input-bg,rgba(130,155,176,.14));color:inherit;border-radius:10px;min-width:35px;min-height:35px;font-size:22px;cursor:pointer}
#smarty-insights-modal .si-body{padding:12px 16px 18px;overflow:auto;overscroll-behavior:contain}
#smarty-insights-modal .si-section{margin:0 0 20px;padding:0}
#smarty-insights-modal .si-section h3{font-size:13px;font-weight:800;margin:8px 0 10px}
#smarty-insights-modal .si-note{font:500 11px/1.5 system-ui,sans-serif;color:var(--text-sec,#6c7c87);margin:7px 0 12px}
#smarty-insights-modal .si-card{border:1px solid var(--glass-border,rgba(144,172,189,.22));background:var(--glass-bg,rgba(243,250,250,.80));border-radius:15px;padding:12px 13px;margin-bottom:9px}
#smarty-insights-modal .si-row{display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0}
#smarty-insights-modal .si-amount{font-weight:850;font-size:19px;font-variant-numeric:tabular-nums}
#smarty-insights-modal .si-caption{color:var(--text-sec,#6c7c87);font-size:11px}
#smarty-insights-modal .si-cap-row{padding:9px 1px;border-bottom:1px solid var(--glass-border,rgba(144,172,189,.16))}
#smarty-insights-modal .si-cap-main{display:flex;align-items:center;justify-content:space-between;gap:10px}
#smarty-insights-modal .si-cap-name{font-size:12px;font-weight:700;max-width:49%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#smarty-insights-modal .si-cap-input{width:110px;min-width:76px;max-width:38%;border:1px solid var(--glass-border,rgba(144,172,189,.30));border-radius:9px;padding:8px;background:var(--input-bg,rgba(235,244,248,.8));color:var(--text-color,#233343);font:600 13px system-ui,sans-serif;text-align:right}
#smarty-insights-modal .si-track{height:5px;border-radius:99px;background:rgba(143,169,189,.22);overflow:hidden;margin-top:7px}
#smarty-insights-modal .si-fill{height:100%;background:#3ebd99;border-radius:99px}
#smarty-insights-modal .si-fill.is-near{background:#e5ac57}
#smarty-insights-modal .si-fill.is-over{background:#e16d75}
#smarty-insights-modal .si-tag{font:700 10px system-ui,sans-serif}
#smarty-insights-modal .si-tag.is-near{color:#c08630}
#smarty-insights-modal .si-tag.is-over{color:#d85866}
#smarty-insights-modal .si-button{width:100%;padding:12px;border:0;border-radius:12px;background:var(--primary,#188c85);color:#fff;font-weight:800;font-size:13px;cursor:pointer}
#smarty-insights-modal .si-segment{display:flex;gap:5px;margin-bottom:12px}
#smarty-insights-modal .si-segment button{flex:1;padding:7px 9px;border-radius:10px;border:1px solid var(--glass-border,rgba(152,182,198,.3));background:var(--input-bg,rgba(130,155,176,.11));color:var(--text-color,#233343);font-weight:700;cursor:pointer}
#smarty-insights-modal .si-segment button[aria-pressed=true]{background:var(--primary,#188c85);color:#fff}
#smarty-insights-modal .si-average-row{padding:8px 0;border-bottom:1px solid var(--glass-border,rgba(152,182,198,.18));gap:12px;font-size:12px}
#smarty-insights-modal .si-average-row:last-child{border:0}
#smarty-insights-modal input:focus-visible,#smarty-insights-modal button:focus-visible,#smarty-insights-strip button:focus-visible{outline:2px solid #4eabcf;outline-offset:2px}
@media(max-width:355px){#smarty-insights-strip .smarty-daily-val{font-size:14px}#smarty-insights-strip{padding:7px}#smarty-insights-strip .smarty-insights-open{min-width:78px;font-size:9px}}
`;

  function dataManager(){return typeof Data !== 'undefined' ? Data : window.Data;}
  function uiManager(){return typeof UI !== 'undefined' ? UI : window.UI;}
  function financeManager(){return typeof Finance !== 'undefined' ? Finance : window.Finance;}
  function norm(value) {
    return String(value ?? '').replace(/^[^\p{L}\p{N}_]+/u, '').normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
  }
  function lang() { const l = dataManager()?.store?.settings?.lang; return Object.hasOwn(LANG,l) ? l : 'es'; }
  function t(k) {return LANG[lang()][k] || LANG.es[k] || k;}
  function money(n) {return uiManager()?.formatMoney ? uiManager().formatMoney(Number(n)||0) : `R$ ${(Number(n)||0).toFixed(2)}`;}
  function validDate(value) {
    // Usar la misma interpretacion que Finance.calculateMonthlySpent.
    // No recalcular fechas antiguas con una regla distinta a la contabilidad base.
    const d = value instanceof Date ? value : new Date(value);
    return !Number.isNaN(d.getTime()) ? d : null;
  }
  function startOfMonth(d) { return new Date(d.getFullYear(),d.getMonth(),1); }
  function indexMonth(d) {return d.getFullYear()*12 + d.getMonth();}
  function amount(x) {const n = Number(x);return Number.isFinite(n) && n>0 ? n : 0;}
  function parseCapAmount(text) {
    const raw = String(text ?? '').trim().replace(/\s/g,'');
    if (!raw) return 0;
    if (!/^[0-9.,]+$/.test(raw)) return NaN;
    const lastComma=raw.lastIndexOf(','),lastDot=raw.lastIndexOf('.');
    let normalized = raw;
    if (lastComma > lastDot) normalized=raw.replace(/\./g,'').replace(',','.');
    else if (lastDot > lastComma && lastComma>=0) normalized=raw.replace(/,/g,'');
    else if (lastComma>=0) normalized=raw.replace(',','.');
    else if (/^\d{1,3}(?:\.\d{3})+$/.test(raw)) normalized=raw.replace(/\./g,'');
    const n=Number(normalized);
    return Number.isFinite(n) && n>=0 ? n : NaN;
  }
  function isCatKey(raw) {return typeof raw === 'string' && /^cat_[a-z0-9_]+$/.test(raw);}
  function categoryKey(raw) {
    const value = String(raw ?? '').trim();
    if (!value) return 'cat_other';
    // IDs heredados que representan la misma categoria en el proyecto.
    // No mezclar categorias desconocidas con Otros.
    const legacyIds = {cat_home:'cat_bills',cat_ent:'cat_leisure'};
    if (legacyIds[value]) return legacyIds[value];
    if (isCatKey(value)) return value;
    const normalized = norm(value).replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u,'').trim();
    if (!normalized) return 'cat_other';
    for (const [key,names] of Object.entries(CATEGORY_ALIASES)) if (names.includes(normalized)) return key;
    // No atribuir una categoría desconocida a Otros: mantenerla separada.
    return `legacy:${normalized}`;
  }
  function categoryLabel(key) {
    if (key.startsWith('legacy:')) return key.slice(7);
    if (DEFAULT_NAMES[key]) return DEFAULT_NAMES[key][{es:0,pt:1,en:2}[lang()]];
    try {return uiManager()?.t(key) || key;}catch(_) {return key;}
  }
  function expenseRecords() {return Array.isArray(dataManager()?.store?.expenses)?dataManager().store.expenses:[];}
  function listRecords() {return Array.isArray(dataManager()?.store?.lists)?dataManager().store.lists:[];}
  function subscriptionRecords() {return Array.isArray(dataManager()?.store?.subscriptions)?dataManager().store.subscriptions:[];}
  function earliestMonth() {
    let earliest=Infinity;
    expenseRecords().forEach(e=>{const d=validDate(e.date);if(d) earliest=Math.min(earliest,indexMonth(d));});
    listRecords().filter(l=>l.status==='completed').forEach(l=>{const d=validDate(l.date);if(d)earliest=Math.min(earliest,indexMonth(d));});
    subscriptionRecords().forEach(s=>{const d=subscriptionDate(s);if(d)earliest=Math.min(earliest,indexMonth(d));});
    return earliest;
  }
  function subscriptionDate(sub) {
    // El identificador generado por Finance.saveSubscription es Date.now().
    const v = sub?.createdAt ?? sub?.date ?? sub?.id;
    const n = Number(v);
    if(Number.isFinite(n)&&n>=946684800000&&n<=Date.now()+86400000)return new Date(n);
    return null;
  }
  function monthlyBreakdown(year,month,now=new Date()) {
    const totals=new Map();
    const period=year*12+month;
    const currentPeriod=indexMonth(now);
    const add=(key,value)=>{const n=amount(value);if(n)totals.set(key,(totals.get(key)||0)+n);};
    for (const e of expenseRecords()) {
      const d=validDate(e.date);if(!d)continue;
      if(e.isInstallment) {
        const n=Math.max(0,Math.trunc(Number(e.installments?.total)||0));
        const offset=period-indexMonth(d);
        if(n>0 && offset>=0 && offset<n) add(categoryKey(e.category),e.amount);
      } else if(indexMonth(d)===period) {
        // Finance.calculateMonthlySpent cuenta TODOS los gastos imputados
        // al mes actual, incluso los programados para otro dia del mismo mes.
        add(categoryKey(e.category),e.amount);
      }
    }
    for(const l of listRecords()) {
      if(l.status!=='completed')continue;
      const d=validDate(l.date);
      if(d && indexMonth(d)===period)add('cat_market',l.total);
    }
    for(const s of subscriptionRecords()) {
      const charged=Math.trunc(Number(s.day));
      const maxDay=new Date(year,month+1,0).getDate();
      const date=subscriptionDate(s);
      if(!date || indexMonth(date)>period || !Number.isInteger(charged)||charged<1||charged>maxDay)continue;
      if(period===currentPeriod&&charged>now.getDate())continue;
      add('cat_subs',s.cost);
    }
    return totals;
  }
  function total(map) {return [...map.values()].reduce((a,b)=>a+b,0);}
  function getCaps() {
    const v=dataManager()?.store?.settings?.categoryCaps;
    if(!v||typeof v!=='object'||Array.isArray(v))return {};
    const safe={};
    for(const [k,x] of Object.entries(v)){
      if(!(isCatKey(k)||k.startsWith('legacy:'))||amount(x)<=0)continue;
      const canonical = categoryKey(k);
      // Si conviven dos topes de la misma categoria, utilizar el mayor
      // sin sobreescribir ni modificar los datos guardados.
      safe[canonical] = Math.max(safe[canonical]||0,amount(x));
    }
    return safe;
  }
  function saveCaps(caps) {
    if (!dataManager()?.store)throw new Error('Data no está inicializado');
    dataManager().store.settings ||= {};
    dataManager().store.settings.categoryCaps=caps;
    dataManager().save();
  }
  function capStatus(key,spent,caps) {
    const cap=amount(caps[key]);
    const percent=cap>0?spent/cap*100:0;
    return {cap,spent,percent,status:cap<=0?'unset':percent>=100?'over':percent>=80?'near':'okay'};
  }
  function monthlyAverage(count=3,now=new Date()) {
    const n=[3,6,12].includes(Number(count))?Number(count):3;
    const first=earliestMonth();
    const byCategory=new Map();
    let sum=0,months=0;
    for(let i=1;i<=n;i++) {
      const d=new Date(now.getFullYear(),now.getMonth()-i,1);
      if(indexMonth(d)<first)continue;
      months++;
      const breakdown=monthlyBreakdown(d.getFullYear(),d.getMonth(),now);
      const monthTotal=total(breakdown);
      sum+=monthTotal;
      for(const [key,value] of breakdown)byCategory.set(key,(byCategory.get(key)||0)+value);
    }
    const byAvg=new Map();
    for(const [key,value] of byCategory)byAvg.set(key,months?value/months:0);
    return {average:months?sum/months:0,months,byCategory:byAvg,window:n};
  }
  function dailyAllowance(now=new Date()) {
    const budget=Number(dataManager()?.store?.budget?.limit)||0;
    const spent=typeof financeManager()?.calculateMonthlySpent==='function'?Number(financeManager().calculateMonthlySpent())||0:total(monthlyBreakdown(now.getFullYear(),now.getMonth(),now));
    const remaining=budget-spent;
    const days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate()-now.getDate()+1;
    return {budget,spent,remaining,days,daily:budget>0?Math.max(0,remaining)/Math.max(1,days):0};
  }
  let selectedWindow=3;
  function element(tag,className,textValue){const e=document.createElement(tag);if(className)e.className=className;if(textValue!==undefined)e.textContent=textValue;return e;}
  function styleOnce(){let css=document.getElementById('smarty-insights-css');if(!css){css=element('style');css.id='smarty-insights-css';document.head.appendChild(css);}css.textContent=CSS;}
  function modal() {
    let m=document.getElementById('smarty-insights-modal');if(m)return m;
    m=element('div');m.id='smarty-insights-modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label',t('open'));
    m.innerHTML='<div class="si-panel"><div class="si-head"><h2 class="si-title"></h2><button type="button" class="si-close" aria-label="Cerrar">×</button></div><div class="si-body"><section class="si-section" id="si-caps"><h3></h3><p class="si-note"></p><div class="si-caps-list"></div><button class="si-button si-save" type="button"></button></section><section class="si-section" id="si-averages"><h3></h3><div class="si-segment"></div><div class="si-average-list"></div><p class="si-note si-history-note"></p></section></div></div>';
    m.querySelector('.si-close').addEventListener('click',close);
    m.addEventListener('click',ev=>{if(ev.target===m)close();});
    m.querySelector('.si-save').addEventListener('click',saveFromModal);
    document.body.appendChild(m);
    return m;
  }
  function close() {document.getElementById('smarty-insights-modal')?.classList.remove('is-open');}
  function show(){styleOnce();const m=modal();renderModal();m.classList.add('is-open');m.querySelector('.si-close')?.focus();}
  function categoriesForCaps() {
    const keys=new Set((uiManager()?.categories||[]).map(c=>c.id));
    expenseRecords().forEach(e => keys.add(categoryKey(e.category)));
    keys.add('cat_subs');
    const now=new Date(),month=monthlyBreakdown(now.getFullYear(),now.getMonth(),now);
    for (const k of [...month.keys(),...Object.keys(getCaps())])keys.add(k);
    return [...keys].sort((a,b)=>categoryLabel(a).localeCompare(categoryLabel(b),lang()));
  }
  function renderModal() {
    const m=modal();
    m.querySelector('.si-title').textContent=t('open');
    m.querySelector('#si-caps h3').textContent=t('caps');
    m.querySelector('#si-caps .si-note').textContent=t('help');
    m.querySelector('.si-save').textContent=t('save');
    m.querySelector('#si-averages h3').textContent=t('avgs');
    const now=new Date(),month=monthlyBreakdown(now.getFullYear(),now.getMonth(),now),caps=getCaps();
    const list=m.querySelector('.si-caps-list');list.replaceChildren();
    for (const key of categoriesForCaps()) {
      const status=capStatus(key,month.get(key)||0,caps);
      const row=element('div','si-cap-row');
      const line=element('div','si-cap-main');
      const name=element('span','si-cap-name',categoryLabel(key));
      const input=element('input','si-cap-input');input.type='text';input.inputMode='decimal';input.placeholder='—';input.dataset.category=key;
      input.value=status.cap>0?status.cap.toFixed(2):'';
      input.setAttribute('aria-label',`${t('limit')}: ${categoryLabel(key)}`);
      line.append(name,input);row.appendChild(line);
      const description=element('div','si-row si-caption');
      description.append(element('span','',`${t('spent')}: ${money(status.spent)}`));
      const statusText=element('span',`si-tag ${status.status==='over'?'is-over':status.status==='near'?'is-near':''}`,
        status.status==='unset'?t('unset'):`${Math.round(status.percent)}% · ${t(status.status)}`);
      description.appendChild(statusText);row.appendChild(description);
      if(status.cap>0){const track=element('div','si-track');const fill=element('div',`si-fill ${status.status==='over'?'is-over':status.status==='near'?'is-near':''}`);fill.style.width=`${Math.min(100,status.percent)}%`;track.appendChild(fill);row.appendChild(track);}
      list.appendChild(row);
    }
    const segment=m.querySelector('.si-segment');segment.replaceChildren();
    [3,6,12].forEach(n=>{const b=element('button','',`${n} ${t('months')}`);b.type='button';b.setAttribute('aria-pressed',String(selectedWindow===n));b.addEventListener('click',()=>{selectedWindow=n;renderAverages();});segment.appendChild(b);});
    renderAverages();
  }
  function renderAverages() {
    const m=document.getElementById('smarty-insights-modal');if(!m)return;
    m.querySelectorAll('.si-segment button').forEach((b,i)=>b.setAttribute('aria-pressed',String([3,6,12][i]===selectedWindow)));
    const place=m.querySelector('.si-average-list');place.replaceChildren();
    const info=monthlyAverage(selectedWindow);
    if(!info.months) {place.appendChild(element('p','si-note',t('none')));m.querySelector('.si-history-note').textContent='';return;}
    const summary=element('div','si-card');summary.append(element('div','si-caption',`${t('monthly')} · ${info.months} ${t('months')}`),element('div','si-amount',money(info.average)));
    place.appendChild(summary);
    place.appendChild(element('h4','',t('catAverage')));
    const sorted=[...info.byCategory].sort((a,b)=>b[1]-a[1]);
    for(const [key,avg] of sorted){const row=element('div','si-row si-average-row');row.append(element('span','',categoryLabel(key)),element('strong','',money(avg)));place.appendChild(row);}
    m.querySelector('.si-history-note').textContent=t('note');
  }
  function saveFromModal() {
    const m=modal(),caps={};let valid=true;
    for(const input of m.querySelectorAll('.si-cap-input')){
      const val=input.value.trim();if(!val)continue;
      const n=parseCapAmount(val);if(!Number.isFinite(n)||n<0){valid=false;break;}
      if(n>0)caps[input.dataset.category]=Math.round(n*100)/100;
    }
    if(!valid){if(uiManager()?.showSnackbar)uiManager().showSnackbar(t('invalid'));return;}
    saveCaps(caps);renderModal();refresh();
    if(uiManager()?.showSnackbar)uiManager().showSnackbar(t('saved'));
  }
  function refresh(){
    const panel=document.getElementById('home-finance-overview');if(!panel)return;
    styleOnce();
    let strip=document.getElementById('smarty-insights-strip');
    if(!strip){strip=element('div');strip.id='smarty-insights-strip';
      const info=element('div','smarty-daily-info');info.append(element('span','smarty-daily-label'),element('strong','smarty-daily-val'));strip.appendChild(info);
      const btn=element('button','smarty-insights-open');btn.type='button';btn.addEventListener('click',show);strip.appendChild(btn);panel.appendChild(strip);
    }
    const d=dailyAllowance();
    strip.querySelector('.smarty-daily-label').textContent=d.budget<=0?t('dailyZero'):d.remaining<0?t('dailyOver'):`${t('daily')} · ${d.days} ${t('days')}`;
    strip.querySelector('.smarty-daily-val').textContent=d.budget<=0?'—':money(d.daily);
    strip.querySelector('.smarty-insights-open').textContent=t('open')+' ›';
    // La tarjeta usa CSS Grid con cinco filas: la nueva banda necesita su propia fila.
    panel.style.setProperty('grid-template-rows','auto auto auto auto auto auto','important');
    strip.style.setProperty('grid-row','6','important');
    let alert=document.getElementById('smarty-category-alert');
    if(!alert){alert=element('div');alert.id='smarty-category-alert';panel.appendChild(alert);}
    const now=new Date(),totals=monthlyBreakdown(now.getFullYear(),now.getMonth(),now),caps=getCaps();
    const warnings=Object.entries(caps).map(([key,cap])=>({key,...capStatus(key,totals.get(key)||0,caps)}))
      .filter(x=>x.status==='near'||x.status==='over').sort((a,b)=>b.percent-a.percent);
    if(warnings.length){const worst=warnings[0];alert.textContent=`${worst.status==='over'?'●':'●'} ${t(worst.status)}: ${categoryLabel(worst.key)} (${Math.round(worst.percent)}%)${warnings.length>1?` · +${warnings.length-1}`:''}`;alert.classList.add('is-visible');alert.style.setProperty('grid-row','7','important');}
    else {alert.classList.remove('is-visible');alert.textContent='';}
  }
  function init(){
    if(!dataManager() || !uiManager() || !financeManager())return;
    styleOnce();
    if(!uiManager().renderBudgetChart.__smartyInsightsWrapped){
      const original=uiManager().renderBudgetChart;
      const wrapped=function(...args){const result=original.apply(this,args);try{window.SmartySpendingInsights?.refresh();}catch(e){console.warn('[Smarty insights]',e);}return result;};
      wrapped.__smartyInsightsWrapped=true;uiManager().renderBudgetChart=wrapped;
    }
    refresh();
  }
  window.SmartySpendingInsights={version:VERSION,refresh,open:show,close,categoryKey,monthlyBreakdown,monthlyAverage,dailyAllowance,capStatus,getCaps};
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  setTimeout(init,400);
})();
