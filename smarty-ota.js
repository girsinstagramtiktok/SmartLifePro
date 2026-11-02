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

/* SMARTY – Categorías estables, límites desde Finanzas, medias y aviso 80 %.
 * Complemento OTA: no migra ni reescribe gastos existentes.
 */
(function () {
  'use strict';
  const VERSION = 'smarty-light-2026-11-02-09';
  window.SMARTY_PATCH_BUILD_ID = VERSION;
  const BASE_CATS = ['cat_market','cat_leisure','cat_transport','cat_clothes','cat_health','cat_bills','cat_travel','cat_beauty','cat_other'];
  const EXTRA_CATS = ['cat_food','cat_shop','cat_subs'];
  const LEGACY_IDS = {cat_home:'cat_bills',cat_ent:'cat_leisure',tab_subs:'cat_subs'};
  const ALIASES = {
    cat_market:['supermercado','mercado','groceries','grocery','market'],
    cat_leisure:['ocio','lazer','leisure','entretenimiento','entretenimento','entertainment'],
    cat_transport:['transporte','transport','transportation'],
    cat_clothes:['ropa','roupa','clothes','vestuario','vestuario y calzado'],
    cat_health:['salud','saude','health'],
    cat_bills:['hogar','casa','home','bills','contas','gastos fijos','gastos fixos','gastos fixos mensais'],
    cat_travel:['viaje','viagem','travel'],
    cat_beauty:['belleza','beleza','beauty'],
    cat_other:['otro','otros','outro','outros','other','misc','miscellaneous'],
    cat_subs:['suscripciones','assinaturas','subscriptions','subscription','suscripcion','assinatura'],
    cat_food:['comida','food','alimentacion','alimentacao'],
    cat_shop:['compras','shopping','purchases']
  };
  const WORDS = {
    es: {daily:'Puedes gastar por día',days:'días restantes',limit:'Tope mensual',save:'Guardar tope',clear:'Quitar tope',spent:'Gastado',left:'Disponible',near:'Cerca del límite',over:'Límite superado',safe:'Dentro del límite',none:'Sin tope',alert:'Alerta de categoría',avg:'Promedios de gastos',monthly:'Promedio mensual',perCategory:'Promedio por categoría',months:'meses completos',empty:'No hay meses completos con movimientos.',close:'Cerrar',invalid:'Introduce un importe válido.',saved:'Tope actualizado',remove:'Sin tope',daysCount:'Incluye hoy',info:'El tope se aplica a cada mes. Te avisaremos al llegar al 80 %.',available:'Sin presupuesto',sub:'Suscripciones',older:'Categoría anterior',noSpend:'Sin movimientos para este periodo'},
    pt: {daily:'Disponível por dia',days:'dias restantes',limit:'Limite mensal',save:'Salvar limite',clear:'Remover limite',spent:'Gasto',left:'Disponível',near:'Perto do limite',over:'Limite ultrapassado',safe:'Dentro do limite',none:'Sem limite',alert:'Alerta da categoria',avg:'Médias de gastos',monthly:'Média mensal',perCategory:'Média por categoria',months:'meses completos',empty:'Ainda não há meses completos com movimentações.',close:'Fechar',invalid:'Informe um valor válido.',saved:'Limite atualizado',remove:'Sem limite',daysCount:'Inclui hoje',info:'O limite vale para cada mês. Você receberá um aviso ao chegar a 80%.',available:'Sem orçamento',sub:'Assinaturas',older:'Categoria anterior',noSpend:'Sem movimentações neste período'},
    en: {daily:'Available per day',days:'days remaining',limit:'Monthly cap',save:'Save cap',clear:'Remove cap',spent:'Spent',left:'Remaining',near:'Near cap',over:'Cap exceeded',safe:'Within cap',none:'No cap',alert:'Category alert',avg:'Spending averages',monthly:'Monthly average',perCategory:'Average by category',months:'completed months',empty:'No completed months with transactions yet.',close:'Close',invalid:'Enter a valid amount.',saved:'Cap updated',remove:'No cap',daysCount:'Includes today',info:'The cap applies monthly. You will be alerted at 80%.',available:'No budget',sub:'Subscriptions',older:'Legacy category',noSpend:'No transactions this period'}
  };
  const LABELS = {
    cat_market:['Supermercado','Mercado','Groceries'],cat_leisure:['Ocio','Lazer','Leisure'],cat_transport:['Transporte','Transporte','Transport'],
    cat_clothes:['Ropa','Roupa','Clothes'],cat_health:['Salud','Saúde','Health'],cat_bills:['Hogar','Casa','Bills'],
    cat_travel:['Viaje','Viagem','Travel'],cat_beauty:['Belleza','Beleza','Beauty'],cat_other:['Otros','Outro','Other'],
    cat_food:['Comida','Comida','Food'],cat_shop:['Compras','Compras','Shopping'],cat_subs:['Suscripciones','Assinaturas','Subscriptions']
  };
  const CSS = `
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
  const $ = s => document.querySelector(s);
  const data = () => typeof Data !== 'undefined' ? Data : null;
  const finance = () => typeof Finance !== 'undefined' ? Finance : null;
  const ui = () => typeof UI !== 'undefined' ? UI : null;
  const lang = () => ['es','pt','en'].includes(data()?.store?.settings?.lang) ? data().store.settings.lang : 'es';
  const tx = k => WORDS[lang()][k] || WORDS.es[k] || k;
  const amount = x => { const n=Number(x);return Number.isFinite(n) && n>0?n:0; };
  const money = x => ui()?.formatMoney ? ui().formatMoney(Number(x)||0) : `R$ ${(Number(x)||0).toFixed(2)}`;
  const monthIndex = d => d.getFullYear()*12+d.getMonth();
  const date = x => {const d=new Date(x);return !Number.isNaN(d.getTime())?d:null;};
  const period = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const normal = x => String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('en').replace(/^[^\p{L}\p{N}_]+/u,'').replace(/[^\p{L}\p{N}_\s-]/gu,'').replace(/\s+/g,' ').trim();
  const ALIAS_MAP = new Map();
  for(const [key,alts] of Object.entries(ALIASES)) for(const a of [key,...alts]) ALIAS_MAP.set(normal(a),key);
  for(const [key,items] of Object.entries(LABELS)) for(const a of items) ALIAS_MAP.set(normal(a),key);
  const canonical = raw => {
    const x=String(raw??'').trim();
    if (!x) return 'cat_other';
    if(x.startsWith('legacy:'))return `legacy:${normal(x.slice(7))}`;
    const n=normal(x);
    if(LEGACY_IDS[n])return LEGACY_IDS[n];
    if(ALIAS_MAP.has(n))return ALIAS_MAP.get(n);
    if(/^cat_[a-z0-9_]+$/.test(n))return n;
    return n?`legacy:${n}`:'cat_other';
  };
  const label = key => {
    const k=canonical(key);
    if (k.startsWith('legacy:'))return k.slice(7).replace(/(^|\s)\p{L}/gu,m=>m.toLocaleUpperCase());
    if(LABELS[k])return LABELS[k][{es:0,pt:1,en:2}[lang()]];
    const t=ui()?.t(k);return t&&t!==k?t:k;
  };
  const rawRecords = () => Array.isArray(data()?.store?.expenses)?data().store.expenses:[];
  const getCaps = () => {
    const src=data()?.store?.settings?.categoryCaps;
    if(!src || typeof src!=='object'||Array.isArray(src))return {};
    const out={};
    for(const [raw,cap] of Object.entries(src)){const key=canonical(raw);if(amount(cap)>0)out[key]=Math.max(out[key]||0,amount(cap));}
    return out;
  };
  const saveCap = (key,n) => {
    const s=data()?.store?.settings;if(!s)return;
    const caps=getCaps();const k=canonical(key);
    if(n>0)caps[k]=Math.round(n*100)/100;else delete caps[k];
    s.categoryCaps=caps;data().save();
  };
  const parseMoney = v => {
    const t=String(v??'').trim().replace(/\s/g,'');if(!t)return 0;
    if(!/^\d[\d.,]*$/.test(t))return NaN;
    const c=t.lastIndexOf(','),d=t.lastIndexOf('.');let normalized=t;
    if(c>d)normalized=t.replace(/\./g,'').replace(',','.');
    else if(c>=0)normalized=t.replace(/,/g,'');
    else if(/^\d{1,3}(?:\.\d{3})+$/.test(t))normalized=t.replace(/\./g,'');
    const n=Number(normalized);return Number.isFinite(n)&&n>=0?n:NaN;
  };
  const status = (key,spent,caps=getCaps()) => {
    const cap=amount(caps[canonical(key)]);
    const percent=cap?spent/cap*100:0;
    return {cap,spent,percent,state:cap===0?'none':percent>=100?'over':percent>=80?'near':'safe'};
  };
  function subscriptionDate(s){
    const v=s?.createdAt??s?.date??s?.id;
    const n=Number(v);
    return Number.isFinite(n)&&n>946684800000&&n<=Date.now()+86400000?new Date(n):null;
  }
  function monthlyBreakdown(year,month,now=new Date()) {
    const m=year*12+month;const totals=new Map();
    const add=(key,x)=>{const n=amount(x),k=canonical(key);if(n)totals.set(k,(totals.get(k)||0)+n);};
    for(const e of rawRecords()){
      const d=date(e.date);if(!d)continue;
      if(e.isInstallment){const len=Math.max(0,Math.trunc(Number(e.installments?.total)||0)),pos=m-monthIndex(d);if(pos>=0&&pos<len)add(e.category,e.amount);}
      else if(monthIndex(d)===m)add(e.category,e.amount);
    }
    for(const l of data()?.store?.lists||[]){const d=date(l.date);if(l.status==='completed'&&d&&monthIndex(d)===m)add('cat_market',l.total);}
    for(const s of data()?.store?.subscriptions||[]){
      const due=Math.trunc(Number(s.day));const max=new Date(year,month+1,0).getDate();
      const start=subscriptionDate(s);
      if(due<1||due>max)continue;
      // En el mes actual usar el mismo criterio del presupuesto principal.
      // En meses históricos exigir una fecha de alta real para no inventar cobros.
      if(m===monthIndex(now)){if(due>now.getDate())continue;}
      else if(!start || monthIndex(start)>m)continue;
      add('cat_subs',s.cost);
    }
    return totals;
  }
  function monthlyAverage(count=3,now=new Date()){
    const n=[3,6,12].includes(Number(count))?Number(count):3;
    let earliest=Infinity;
    const consider=v=>{const d=date(v);if(d)earliest=Math.min(earliest,monthIndex(d));};
    rawRecords().forEach(e=>consider(e.date));
    for(const l of data()?.store?.lists||[])if(l.status==='completed')consider(l.date);
    for(const s of data()?.store?.subscriptions||[]){const d=subscriptionDate(s);if(d)consider(d);}
    let months=0,sum=0;const byCategory=new Map();
    for(let i=1;i<=n;i++){
      const d=new Date(now.getFullYear(),now.getMonth()-i,1);
      if(monthIndex(d)<earliest)continue;
      months++;
      const breakdown=monthlyBreakdown(d.getFullYear(),d.getMonth(),now);
      for(const [key,value] of breakdown){sum+=value;byCategory.set(key,(byCategory.get(key)||0)+value);}
    }
    const averages=new Map();for(const [k,v] of byCategory)averages.set(k,months?v/months:0);
    return {average:months?sum/months:0,months,byCategory:averages,window:n};
  }
  function dailyAllowance(now=new Date()){
    const budget=Number(data()?.store?.budget?.limit)||0;
    const spent=Number(finance()?.calculateMonthlySpent?.())||0;
    const remaining=budget-spent;
    const days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate()-now.getDate()+1;
    return {budget,spent,remaining,days,daily:budget>0?Math.max(0,remaining)/Math.max(1,days):0};
  }
  function addStyle(){let s=document.getElementById('smarty-insights-css');if(!s){s=document.createElement('style');s.id='smarty-insights-css';document.head.appendChild(s);}s.textContent=CSS;}
  function make(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
  function refreshDaily(){
    const panel=$('#home-finance-overview');if(!panel)return;
    $('#smarty-category-alert')?.remove();
    const old=$('#smarty-insights-strip');
    let strip=old;
    if(!strip){strip=make('div');strip.id='smarty-insights-strip';panel.appendChild(strip);}
    strip.replaceChildren();
    const info=make('div','smarty-daily-info'),d=dailyAllowance();
    info.append(make('span','smarty-daily-label',d.budget>0?`${tx('daily')} · ${d.days} ${tx('days')}`:tx('available')),
                make('strong','smarty-daily-val',d.budget>0?money(d.daily):'—'));
    strip.appendChild(info);
    panel.style.setProperty('grid-template-rows','auto auto auto auto auto auto','important');
    strip.style.setProperty('grid-row','6','important');
  }
  function withDisplayCategories(callback){
    const d=data();if(!d||!Array.isArray(d.store.expenses))return callback();
    const original=d.store.expenses;
    d.store.expenses=original.map(e=>({...e,category: canonical(e.category).startsWith('legacy:')?canonical(e.category):label(canonical(e.category))}));
    try{return callback();}finally{d.store.expenses=original;}
  }
  // En los detalles del historial se reutiliza el render original. Solo se proyectan
  // temporalmente las categorías actuales; NO se reescriben ni se guardan movimientos.
  function patchFinance(){
    const f=finance();if(!f||f.__smartyStableCategories)return;
    f.__smartyStableCategories=true;
    const originalHistory=f.renderExpensesHistory;
    f.renderExpensesHistory=function(...args){
      const output=withDisplayCategories(()=>originalHistory.apply(this,args));
      try{enhanceFinanceHistory();}catch(e){console.warn('[Smarty categorías]',e);}
      return output;
    };
    const originalHome=f.renderHomeWidgets;
    f.renderHomeWidgets=function(...args){return withDisplayCategories(()=>originalHome.apply(this,args));};
    const originalIcon=f.getCategoryIcon;
    f.getCategoryIcon=function(raw){return originalIcon.call(this,canonical(raw).startsWith('legacy:')?raw:label(raw));};
    const originalFilter=f.openHomeCategory;
    f.openHomeCategory=function(categoryId){
      const key=categoryId?canonical(categoryId):null;
      if(key && !BASE_CATS.includes(key) && key!=='cat_subs'){
        const now=new Date();this.selectedHistoryMonth=period(now);this.selectedCategoryFilter=key;
        if(typeof Main!=='undefined')Main.router('finance');this.setTab('history');return;
      }
      return originalFilter.call(this,key);
    };
    const originalDetail=f.openExpenseDetail;
    f.openExpenseDetail=function(id){const r=originalDetail.call(this,id);const e=rawRecords().find(x=>String(x.id)===String(id));const display=$('#det-exp-cat');if(e&&display)display.textContent=label(e.category);return r;};
  }
  function shownCategoryKeys(){
    const keys=new Set(BASE_CATS);
    for(const e of rawRecords())keys.add(canonical(e.category));
    for(const k of Object.keys(getCaps()))keys.add(canonical(k));
    keys.add('cat_subs');
    return keys;
  }
  function extraChips(container){
    const strip=container.querySelector('.filter-scroll-container');if(!strip)return;
    const extra=[...shownCategoryKeys()].filter(k=>!BASE_CATS.includes(k));
    for(const k of extra){
      const btn=make('button','filter-chip'+(finance().selectedCategoryFilter===k?' active':''),label(k));
      btn.type='button';btn.dataset.smartyCat=k;
      btn.addEventListener('click',()=>{finance().selectedCategoryFilter=k;finance().renderExpensesHistory();});
      strip.appendChild(btn);
    }
  }
  // El filtro nativo conoce solo las 9 categorías base. Para las anteriores y las
  // suscripciones se agregan filtros adicionales sin perder los chips existentes.
  function financeChartLegends(container){
    const card=container.querySelector('.glass-card');if(!card)return;
    const wrappers=[...card.querySelectorAll('div')].filter(x=>x.getAttribute('style')?.includes('margin-top:25px'));
    const legend=wrappers[0];if(!legend)return;
    for(const row of [...legend.children]){
      const spans=row.querySelectorAll('span');if(spans.length<3)continue;
      const el=spans[2];const key=canonical(el.textContent);
      if(key.startsWith('legacy:'))el.textContent=label(key);
      row.style.cursor='pointer';row.setAttribute('role','button');row.tabIndex=0;
      row.setAttribute('aria-label',label(key));
      const open=()=>{finance().selectedCategoryFilter=key;finance().renderExpensesHistory();};
      row.addEventListener('click',open);
      row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
    }
  }
  function categoryTotal(key){
    const selected=finance()?.selectedHistoryMonth||period();
    const [year,month]=selected.split('-').map(Number);
    return monthlyBreakdown(year,month-1).get(canonical(key))||0;
  }
  function capCard(container,key){
    const caps=getCaps(),current=categoryTotal(key),s=status(key,current,caps);
    const card=make('section','glass-card');card.id='smarty-category-cap-detail';
    const title=make('div','sc-title');title.append(make('span','',`${tx('limit')} · ${label(key)}`));
    const badge=make('span','sc-status'+(s.state==='near'?' sc-near':s.state==='over'?' sc-over':''),
      s.state==='none'?tx('none'):`${Math.round(s.percent)}% · ${tx(s.state)}`);
    title.appendChild(badge);card.appendChild(title);
    const stat=make('div','sc-stat');stat.append(make('span','',`${tx('spent')}: ${money(current)}`),make('strong','',s.cap?`${money(s.cap)} ${tx('limit')}`:tx('none')));card.appendChild(stat);
    if(s.cap){const track=make('div','sc-track'),fill=make('div','sc-fill'+(s.state==='near'?' sc-near':s.state==='over'?' sc-over':''));fill.style.width=Math.min(100,s.percent)+'%';track.appendChild(fill);card.appendChild(track);}
    card.appendChild(make('div','sc-subtitle',tx('info')));
    const edit=make('div','sc-edit'),input=make('input');input.type='text';input.inputMode='decimal';input.placeholder='R$ 0,00';input.value=s.cap?String(s.cap.toFixed(2)).replace('.',','):'';input.setAttribute('aria-label',tx('limit'));
    const save=make('button','',tx('save'));save.type='button';
    const persist=async()=>{
      const n=parseMoney(input.value);if(!Number.isFinite(n)||n<0){ui()?.showSnackbar?.(tx('invalid'));return;}
      saveCap(key,n);ui()?.showSnackbar?.(tx('saved'));finance().renderExpensesHistory();
      // Pedir permiso solo al guardar deliberadamente un tope, nunca al abrir Inicio.
      if(n>0){const plugin=window.Capacitor?.Plugins?.LocalNotifications;
        if(plugin){try{const permission=await plugin.checkPermissions();
          if(permission.display!=='granted')await plugin.requestPermissions();
        }catch(e){console.warn('[Smarty] Sin permiso de notificaciones locales',e);}}}
      checkCaps();
    };
    save.addEventListener('click',persist);input.addEventListener('keydown',e=>{if(e.key==='Enter')persist();});
    edit.append(input,save);card.appendChild(edit);
    if(s.cap>0){const clear=make('button','sc-remove',tx('clear'));clear.type='button';clear.addEventListener('click',()=>{saveCap(key,0);finance().renderExpensesHistory();});card.appendChild(clear);}
    const filter=container.querySelector('.filter-scroll-container');const anchor=filter?.parentElement || container;
    anchor.insertAdjacentElement('afterend',card);
  }
  function averagesModal(){
    let modal=$('#smarty-averages-modal');if(modal)return modal;
    modal=make('div');modal.id='smarty-averages-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
    const sheet=make('div','sc-sheet'),head=make('div','sc-head');head.appendChild(make('strong','',tx('avg')));
    const close=make('button','sc-close','×');close.type='button';close.addEventListener('click',()=>modal.classList.remove('sc-open'));head.appendChild(close);
    const content=make('div','sc-content');sheet.append(head,content);modal.appendChild(sheet);
    modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('sc-open');});document.body.appendChild(modal);
    return modal;
  }
  let averageWindow=3;
  function renderAverages(){
    const m=averagesModal(),content=m.querySelector('.sc-content');content.replaceChildren();m.querySelector('.sc-head strong').textContent=tx('avg');
    const tabs=make('div','sc-period');
    [3,6,12].forEach(n=>{const btn=make('button','',`${n} ${tx('months')}`);btn.type='button';btn.setAttribute('aria-pressed',String(averageWindow===n));btn.addEventListener('click',()=>{averageWindow=n;renderAverages();});tabs.appendChild(btn);});
    content.appendChild(tabs);
    const info=monthlyAverage(averageWindow);
    if(!info.months){content.appendChild(make('p','sc-note',tx('empty')));return;}
    const summary=make('div','sc-summary');summary.append(make('small','',`${tx('monthly')} · ${info.months} ${tx('months')}`),make('strong','',money(info.average)));content.appendChild(summary);
    content.appendChild(make('h3','',tx('perCategory')));
    for(const [k,v] of [...info.byCategory].sort((a,b)=>b[1]-a[1])){
      const row=make('div','sc-avg-row');row.append(make('span','',label(k)),make('strong','',money(v)));content.appendChild(row);
    }
    content.appendChild(make('p','sc-note','3 / 6 / 12 · '+tx('months')));
  }
  function openAverages(){const m=averagesModal();renderAverages();m.classList.add('sc-open');m.querySelector('.sc-close').focus();}
  function enhanceFinanceHistory(){
    const container=$('#expenses-history-list');if(!container)return;
    extraChips(container);financeChartLegends(container);
    const toolbar=make('div');toolbar.id='smarty-finance-toolbar';
    const avgBtn=make('button','',tx('avg')+' ›');avgBtn.type='button';avgBtn.addEventListener('click',openAverages);toolbar.appendChild(avgBtn);
    const filter=container.querySelector('.filter-scroll-container');
    const place=filter?.parentElement||container;
    place.insertAdjacentElement('beforebegin',toolbar);
    const selected=finance()?.selectedCategoryFilter;
    if(selected && selected!=='ALL')capCard(container,canonical(selected));
    // La pantalla Finanzas conserva el resumen y el historial; se quitan alertas del inicio.
    const selectedTitle=container.querySelector('#smarty-category-cap-detail');
    if(selectedTitle)selectedTitle.scrollMarginTop='15px';
  }
  async function nativeNotice(title,body,key,month,level){
    const plugin=window.Capacitor?.Plugins?.LocalNotifications;
    if(!plugin)return;
    try{
      const perm=await plugin.checkPermissions();
      if(perm.display!=='granted')return;
      let id=700000001;
      for(const c of key+month+level)id=((id*31+c.charCodeAt(0))%1000000000)|0;
      await plugin.schedule({notifications:[{id:Math.max(800000,Math.abs(id)),title,body,schedule:{at:new Date(Date.now()+800)}}]});
    }catch(e){console.warn('[Smarty] Notificación de tope no disponible',e);}
  }
  let isChecking=false;
  function checkCaps(now=new Date()){
    if(isChecking||!data()?.store?.settings)return;
    isChecking=true;
    try{
      const caps=getCaps(),spent=monthlyBreakdown(now.getFullYear(),now.getMonth(),now);
      const settings=data().store.settings;
      if(!settings.categoryCapNoticeState || typeof settings.categoryCapNoticeState!=='object')settings.categoryCapNoticeState={};
      let changed=false;
      const bucket=settings.categoryCapNoticeState;
      for(const [key,cap] of Object.entries(caps)){
        const s=status(key,spent.get(key)||0,caps),p=period(now),storageKey=`${p}:${key}`;
        const severity=s.state==='over'?2:s.state==='near'?1:0;
        const previous=Math.max(0,Number(bucket[storageKey])||0);
        if(severity<previous){if(severity)bucket[storageKey]=severity;else delete bucket[storageKey];changed=true;}
        if(severity>previous){
          bucket[storageKey]=severity;changed=true;
          const message=`${label(key)}: ${Math.round(s.percent)}% · ${money(s.spent)} / ${money(cap)}`;
          ui()?.showSnackbar?.(`${tx('alert')}: ${message}`);
          void nativeNotice(tx(severity===2?'over':'near'),message,key,p,severity);
        }
      }
      // No guardar avisos de meses muy antiguos.
      for(const k of Object.keys(bucket))if(/^\d{4}-\d{2}:/.test(k)&&k.slice(0,7)<period(new Date(now.getFullYear(),now.getMonth()-3,1))){delete bucket[k];changed=true;}
      if(changed)data().save();
    }finally{isChecking=false;}
  }
  function install(){
    if(!data()||!ui()||!finance())return;
    addStyle();patchFinance();
    const u=ui();
    if(!u.renderBudgetChart.__smartyCapWrapped){
      const original=u.renderBudgetChart;
      u.renderBudgetChart=function(...args){const ret=original.apply(this,args);try{refreshDaily();checkCaps();}catch(e){console.warn('[Smarty caps]',e);}return ret;};
      u.renderBudgetChart.__smartyCapWrapped=true;
    }
    // En versiones antiguas no existe un callback del cambio de idioma: refreshDOM
    // ya llama a Finance.setTab, que vuelve a dibujar los filtros traducidos.
    refreshDaily();checkCaps();
    const oldModal=$('#smarty-insights-modal');if(oldModal)oldModal.remove();
  }
  window.SmartySpendingInsights={version:VERSION,refresh:refreshDaily,open:openAverages,categoryKey:canonical,monthlyBreakdown,monthlyAverage,dailyAllowance,capStatus:status,getCaps,checkCaps};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#smarty-averages-modal')?.classList.remove('sc-open');});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('load',install,{once:true});setTimeout(install,350);
})();
