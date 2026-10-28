/* SMARTY · Inicio compacto: mascota fuera de la tarjeta, tarjeta rectangular glass.
   Parche OTA de un solo archivo; no altera almacenamiento ni navegación.
*/
(function () {
  'use strict';
  window.SMARTY_PATCH_BUILD_ID = 'smarty-light-2026-10-27-04';

  const css = String.raw`
/* La mascota es una pieza independiente, centrada sobre el resumen. */
#view-home .fin-home-scroll > .fin-smarty-dock {
  display:flex !important;
  flex-direction:column !important;
  align-items:center !important;
  justify-content:center !important;
  position:relative !important;
  width:100% !important;
  min-width:0 !important;
  height:auto !important;
  margin:2px 0 6px !important;
  padding:0 !important;
  z-index:3 !important;
  overflow:visible !important;
}
#view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-aura { display:none !important; }
#view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-portrait {
  display:block !important;
  position:relative !important;
  width:116px !important;
  height:117px !important;
  margin:0 !important;
  padding:0 !important;
  overflow:hidden !important;
  flex:none !important;
}
/* El PNG original tiene márgenes transparentes grandes. Se encuadra sin cortar el robot. */
#view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-portrait #mascot-img {
  display:block !important;
  position:absolute !important;
  width:122px !important;
  height:236px !important;
  max-width:none !important;
  max-height:none !important;
  left:50% !important;
  top:-76px !important;
  margin:0 0 0 -52px !important;
  object-fit:fill !important;
  transform:none !important;
  filter:drop-shadow(0 5px 8px rgba(19,45,68,.12)) !important;
  cursor:pointer;
}
#view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-xp {
  position:absolute !important;
  left:6px !important;
  bottom:9px !important;
  width:3px !important;
  height:36px !important;
  z-index:4 !important;
}
#view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-dialog {
  display:flex !important;
  flex-direction:row !important;
  justify-content:center !important;
  align-items:center !important;
  width:auto !important;
  max-width:none !important;
  min-height:24px !important;
  margin:3px auto 0 !important;
  padding:4px 13px !important;
  border-radius:99px !important;
  border:1px solid var(--glass-border,rgba(113,151,173,.22)) !important;
  background:var(--glass-bg,rgba(255,255,255,.58)) !important;
  box-shadow:0 5px 15px rgba(35,65,86,.06) !important;
  color:var(--text-color,#203448) !important;
  backdrop-filter:blur(12px) !important;
  -webkit-backdrop-filter:blur(12px) !important;
}
#view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-dialog-label {
  font-size:10px !important;
  font-weight:800 !important;
  color:var(--text-color,#203448) !important;
  line-height:1.2 !important;
}
#view-home .fin-home-scroll > .fin-smarty-dock .mascot-bubble-side {display:none !important;}

/* Resumen financiero: un rectángulo real de poca altura, no una tarjeta cuadrada. */
#view-home .fin-overview {
  display:grid !important;
  grid-template-columns:minmax(0,1fr) 67px !important;
  grid-template-rows:auto auto auto auto auto !important;
  column-gap:10px !important;
  row-gap:4px !important;
  align-items:start !important;
  margin:0 13px 9px !important;
  padding:13px 15px 12px !important;
  border-radius:19px !important;
  border:1px solid rgba(218,236,247,.18) !important;
  color:#f8fcff !important;
  background:linear-gradient(135deg,rgba(30,67,88,.93),rgba(26,56,82,.91) 58%,rgba(24,47,73,.91)) !important;
  box-shadow:0 9px 25px rgba(14,44,67,.13),inset 0 1px 0 rgba(255,255,255,.11) !important;
  backdrop-filter:blur(18px) saturate(110%) !important;
  -webkit-backdrop-filter:blur(18px) saturate(110%) !important;
  overflow:hidden !important;
  isolation:isolate !important;
}
#view-home .fin-overview::before,
#view-home .fin-overview::after {display:none !important;content:none !important;}
#view-home .fin-overview-top {display:contents !important;min-height:0 !important;}
#view-home .fin-overview .fin-heading-copy {
  grid-column:1 !important;
  grid-row:1 !important;
  padding:0 !important;
  margin:0 !important;
  min-width:0 !important;
}
#view-home .fin-overview .fin-eyebrow {font-size:8px !important;letter-spacing:1.25px !important;color:#c7e2eb !important;}
#view-home .fin-overview .fin-month-title {font-size:15px !important;margin:3px 0 0 !important;line-height:1.15 !important;color:#fff !important;}
#view-home .fin-overview .fin-hero-donut {
  grid-column:2 !important;
  grid-row:1 / span 2 !important;
  align-self:center !important;
  justify-self:end !important;
  display:block !important;
  position:relative !important;
  width:64px !important;
  height:64px !important;
  min-width:64px !important;
  flex:none !important;
  padding:0 !important;
  margin:0 !important;
  border:0 !important;
  border-radius:50% !important;
  background:none !important;
  box-shadow:none !important;
  transform:none !important;
}
#view-home .fin-overview .fin-hero-donut .circle-bg{stroke:rgba(209,233,239,.23) !important;}
#view-home .fin-overview .fin-hero-donut .circle{stroke:#80daca !important;filter:none !important;}
#view-home .fin-overview .fin-ring-value{font-size:14px !important;color:#fff !important;}
#view-home .fin-overview .fin-hero-donut .donut-label{font-size:8px !important;color:#bedae5 !important;}
#view-home .fin-overview .fin-hero-main {
  grid-column:1 !important;
  grid-row:2 !important;
  display:block !important;
  min-height:0 !important;
  width:100% !important;
  margin:3px 0 5px !important;
  padding:0 !important;
}
#view-home .fin-overview .fin-hero-balance{width:100% !important;min-width:0 !important;}
#view-home .fin-overview .fin-balance-label{display:block !important;font-size:10px !important;line-height:1.18 !important;color:#d3e5ed !important;}
#view-home .fin-overview .fin-balance-amount{
  display:block !important;
  margin:3px 0 4px !important;
  font-size:clamp(23px,6.5vw,28px) !important;
  font-weight:850 !important;
  letter-spacing:-.7px !important;
  line-height:1.08 !important;
  white-space:nowrap !important;
}
#view-home .fin-overview .fin-health-pill{
  display:inline-flex !important;
  align-items:center !important;
  padding:3px 7px !important;
  margin:0 !important;
  min-height:0 !important;
  font-size:8px !important;
  line-height:1.2 !important;
  border-radius:12px !important;
  color:#bdeae2 !important;
  border:1px solid rgba(129,214,203,.19) !important;
  background:rgba(119,217,204,.09) !important;
}
#view-home .fin-overview.fin-is-warning .fin-health-pill{color:#f4dbab !important;border-color:rgba(227,194,138,.27) !important;background:rgba(227,194,138,.10) !important;}
#view-home .fin-overview.fin-is-over .fin-health-pill{color:#ffc2c2 !important;border-color:rgba(255,153,153,.30) !important;background:rgba(255,153,153,.10) !important;}
#view-home .fin-overview .fin-budget-progress-labels{
  grid-column:1 / -1 !important;
  grid-row:3 !important;
  display:flex !important;
  align-items:center !important;
  justify-content:space-between !important;
  margin:2px 0 0 !important;
  padding:0 !important;
  color:#cadfe8 !important;
  font-size:9px !important;
}
#view-home .fin-overview .fin-budget-progress-labels strong{font-size:10px !important;color:#fff !important;}
#view-home .fin-overview .fin-budget-track{
  grid-column:1 / -1 !important;
  grid-row:4 !important;
  height:5px !important;
  margin:0 0 5px !important;
  border-radius:99px !important;
  background:rgba(215,233,242,.17) !important;
}
#view-home .fin-overview .fin-budget-fill{background:linear-gradient(90deg,#87dbc8,#aad7e8) !important;box-shadow:none !important;}
#view-home .fin-overview.fin-is-warning .fin-budget-fill{background:linear-gradient(90deg,#b9d4c8,#e1c48d) !important;}
#view-home .fin-overview .fin-summary-details{
  grid-column:1 / -1 !important;
  grid-row:5 !important;
  display:grid !important;
  grid-template-columns:1fr 1fr !important;
  gap:8px !important;
  margin:0 !important;
  padding:0 !important;
  min-width:0 !important;
}
#view-home .fin-overview .fin-metric{
  display:flex !important;
  flex-direction:column !important;
  justify-content:center !important;
  min-width:0 !important;
  min-height:42px !important;
  padding:6px 9px !important;
  margin:0 !important;
  gap:3px !important;
  border-radius:11px !important;
  border:1px solid rgba(217,235,245,.15) !important;
  background:rgba(244,251,255,.075) !important;
  box-shadow:none !important;
}
#view-home .fin-overview .fin-metric-top{font-size:9px !important;color:#c8dce8 !important;gap:5px !important;}
#view-home .fin-overview .fin-metric-icon{width:15px !important;height:15px !important;flex-basis:15px !important;}
#view-home .fin-overview .fin-metric strong{font-size:13px !important;line-height:1.1 !important;color:#fff !important;letter-spacing:-.2px !important;}
#view-home .fin-overview .fin-budget-note{display:none !important;}

#view-home .fin-home-module{
  margin:0 13px 9px !important;
  border-radius:17px !important;
  border:1px solid var(--glass-border,rgba(134,165,186,.22)) !important;
  background:var(--glass-bg,rgba(255,255,255,.55)) !important;
  box-shadow:0 5px 16px rgba(26,54,77,.04) !important;
  backdrop-filter:blur(16px) !important;
  -webkit-backdrop-filter:blur(16px) !important;
}
#view-home .fin-module-header{height:38px !important;}
#view-home .fin-module-body{padding-bottom:6px !important;}
#view-home .home-expense-row,#view-home .home-cat-row{min-height:30px !important;}

#smarty-floating-tip {
  position:fixed !important;
  left:max(16px,env(safe-area-inset-left)) !important;
  right:max(16px,env(safe-area-inset-right)) !important;
  bottom:calc(98px + env(safe-area-inset-bottom)) !important;
  top:auto !important;
  max-width:430px !important;
  max-height:min(45vh,280px) !important;
  margin:0 auto !important;
  padding:15px 16px !important;
  box-sizing:border-box !important;
  overflow:auto !important;
  white-space:normal !important;
  overflow-wrap:anywhere !important;
  border-radius:17px !important;
  background:rgba(19,49,70,.96) !important;
  color:#fff !important;
  border:1px solid rgba(165,223,230,.27) !important;
  box-shadow:0 12px 30px rgba(10,25,41,.25) !important;
  backdrop-filter:blur(16px) !important;
  -webkit-backdrop-filter:blur(16px) !important;
  font:600 13px/1.5 var(--font-main,system-ui) !important;
  z-index:2147483647 !important;
  opacity:0;visibility:hidden;pointer-events:none;
  transition:opacity .2s ease, visibility .2s ease;
}
#smarty-floating-tip.is-visible{opacity:1 !important;visibility:visible !important;pointer-events:auto;}
@media(max-width:365px){
  #view-home .fin-overview{margin:0 10px 8px !important;padding:11px 12px 11px !important;}
  #view-home .fin-home-module{margin-left:10px !important;margin-right:10px !important;}
  #view-home .fin-home-scroll > .fin-smarty-dock{margin-bottom:4px !important;}
  #view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-portrait{height:108px !important;}
  #view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-portrait #mascot-img{height:218px !important;width:113px !important;top:-70px !important;margin-left:-49px !important;}
}
@media(max-height:710px){
  #view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-portrait{height:100px !important;}
  #view-home .fin-home-scroll > .fin-smarty-dock .fin-smarty-portrait #mascot-img{width:104px !important;height:200px !important;top:-64px !important;margin-left:-45px !important;}
  #view-home .fin-overview{padding-top:10px !important;padding-bottom:10px !important;}
}
`;

  function applyCss() {
    let sheet = document.getElementById('smarty-quick-patch');
    if (!sheet) {
      sheet = document.createElement('style');
      sheet.id = 'smarty-quick-patch';
      document.head.appendChild(sheet);
    }
    sheet.textContent = css;
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

    // Sacar físicamente a Smarty fuera de la tarjeta sin perder sus eventos, XP ni ID.
    if (dock.parentElement !== scroll || dock.nextElementSibling !== panel) scroll.insertBefore(dock, panel);

    // Meter porcentaje en la primera fila del rectángulo, al lado de la fecha.
    if (donut.parentElement !== top) top.appendChild(donut);
    const emptySlots = top.querySelectorAll('.fin-top-donut-slot');
    emptySlots.forEach(slot => { if (!slot.contains(donut)) slot.remove(); });

    const dialog = dock.querySelector('.fin-smarty-dialog');
    if (dialog) dialog.setAttribute('aria-label', 'Abrir chat de Smarty');
  }

  function fitMascotImage(img) {
    const frame = img.closest('.fin-smarty-portrait');
    if (!frame || !img.naturalWidth || !img.naturalHeight) return;
    try {
      // Se detecta el contorno visible del PNG en lugar de recortar con valores fijos.
      // Esto evita cortar la cabeza/pies al cambiar de humor o de skin.
      const maxSide = Math.max(img.naturalWidth, img.naturalHeight);
      const ratio = Math.min(1, 230 / maxSide);
      const width = Math.max(1, Math.round(img.naturalWidth * ratio));
      const height = Math.max(1, Math.round(img.naturalHeight * ratio));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', {willReadFrequently: true});
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);
      const data = ctx.getImageData(0, 0, width, height).data;
      let x0 = width, y0 = height, x1 = -1, y1 = -1;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (data[(y * width + x) * 4 + 3] < 16) continue;
          x0 = Math.min(x0, x); x1 = Math.max(x1, x);
          y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        }
      }
      if (x1 < x0 || y1 < y0) return;
      const px = img.naturalWidth / width;
      const py = img.naturalHeight / height;
      const bx = x0 * px, by = y0 * py;
      const bw = (x1 - x0 + 1) * px, bh = (y1 - y0 + 1) * py;
      const fw = frame.clientWidth, fh = frame.clientHeight;
      const scale = Math.min((fw - 10) / bw, (fh - 6) / bh);
      const left = (fw - bw * scale) / 2 - bx * scale;
      const top = (fh - bh * scale) / 2 - by * scale;
      for (const [key, value] of Object.entries({
        width: `${img.naturalWidth * scale}px`,
        height: `${img.naturalHeight * scale}px`,
        left: `${left}px`,
        top: `${top}px`,
        margin: '0',
        transform: 'none'
      })) img.style.setProperty(key, value, 'important');
    } catch (_) {
      // Si Android no permite leer un PNG, conserva el encuadre CSS de respaldo.
    }
  }

  function setupMascotFit() {
    const img = document.querySelector('#view-home .fin-smarty-portrait #mascot-img');
    if (!img) return;
    if (!img.dataset.smartyAutoFit) {
      img.dataset.smartyAutoFit = '1';
      img.addEventListener('load', () => fitMascotImage(img));
    }
    if (img.complete && img.naturalWidth) fitMascotImage(img);
  }

  function installFullTips() {
    if (typeof Assistant === 'undefined') return;
    Assistant.giveTip = function () {
      this.updateMood('thinking.png');
      const tip = this.getSmartTip();
      let box = document.getElementById('smarty-floating-tip');
      if (!box) {
        box = document.createElement('div');
        box.id = 'smarty-floating-tip';
        box.setAttribute('role', 'status');
        box.setAttribute('aria-live', 'polite');
        document.body.appendChild(box);
      }
      box.textContent = tip;
      box.classList.add('is-visible');
      clearTimeout(this._smartyTipTimeout);
      this._smartyTipTimeout = setTimeout(() => {
        box.classList.remove('is-visible');
        this.updateMood();
      }, 8500);
    };
  }

  function applyPatch() { applyCss(); restructure(); setupMascotFit(); installFullTips(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyPatch, { once: true });
  else applyPatch();
  window.addEventListener('load', applyPatch, { once: true });
  setTimeout(applyPatch, 350);
})();
