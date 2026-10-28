/* Smarty OTA ligero — refinamiento visual limpio del inicio.
   Solo toca estilos/JS del documento ya instalado.
*/
(function () {
  'use strict';
  window.SMARTY_PATCH_BUILD_ID = 'smarty-light-2026-10-27-03';

  const css = String.raw`
#view-home .fin-overview{
  background:
    radial-gradient(circle at 18% 16%, rgba(119,233,213,.10), transparent 28%),
    radial-gradient(circle at 86% 18%, rgba(150,210,255,.11), transparent 24%),
    linear-gradient(150deg, rgba(17,39,63,.84) 0%, rgba(14,33,54,.80) 46%, rgba(10,24,42,.84) 100%) !important;
  border:1px solid rgba(222,236,248,.12) !important;
  box-shadow:0 16px 38px rgba(7,18,31,.18), inset 0 1px 0 rgba(255,255,255,.08) !important;
  backdrop-filter:blur(18px) saturate(125%) !important;
  -webkit-backdrop-filter:blur(18px) saturate(125%) !important;
  overflow:hidden !important;
  padding:18px 17px 15px !important;
}
#view-home .fin-overview::before,
#view-home .fin-overview::after{pointer-events:none;z-index:0}
#view-home .fin-overview::before{
  content:'';
  position:absolute;
  top:-88px; right:-54px;
  width:170px; height:170px; border-radius:50%;
  background:radial-gradient(circle, rgba(96,194,255,.12), transparent 70%);
}
#view-home .fin-overview::after{
  content:'';
  position:absolute;
  left:-54px; bottom:-78px;
  width:145px; height:145px; border-radius:50%;
  background:radial-gradient(circle, rgba(123,236,208,.10), transparent 72%);
}
#view-home .fin-overview-top,
#view-home .fin-hero-main,
#view-home .fin-budget-progress-labels,
#view-home .fin-budget-track,
#view-home .fin-summary-details,
#view-home .fin-budget-note{position:relative; z-index:1}

#view-home .fin-overview-top{
  display:grid !important;
  grid-template-columns:minmax(0,1fr) 74px 98px;
  gap:10px !important;
  align-items:start !important;
  min-height:82px !important;
  margin-bottom:4px !important;
}
#view-home .fin-heading-copy{min-width:0}
#view-home .fin-eyebrow{
  opacity:.78;
  letter-spacing:1.35px !important;
  font-size:10px !important;
}
#view-home .fin-month-title{
  margin-top:5px !important;
  line-height:1.07 !important;
  font-size:18px !important;
}

#view-home .fin-top-donut-slot{
  display:flex;
  justify-content:center;
  align-items:flex-start;
  padding-top:4px;
}
#view-home .fin-top-donut-slot .fin-hero-donut{
  width:72px !important;
  height:72px !important;
  flex:0 0 72px !important;
  display:grid !important;
  place-items:center;
  border-radius:22px !important;
  background:linear-gradient(180deg, rgba(255,255,255,.11), rgba(255,255,255,.05)) !important;
  border:1px solid rgba(224,237,248,.14) !important;
  box-shadow:0 8px 20px rgba(4,18,32,.10), inset 0 1px 0 rgba(255,255,255,.08) !important;
  backdrop-filter:blur(12px) saturate(118%) !important;
  -webkit-backdrop-filter:blur(12px) saturate(118%) !important;
  transform:none !important;
  padding:0 !important;
}
#view-home .fin-top-donut-slot .circle-bg{stroke:rgba(225,237,247,.14) !important}
#view-home .fin-top-donut-slot .circle{stroke:#79dccc !important; filter:none !important}
#view-home .fin-top-donut-slot .donut-label{font-size:7.8px !important;color:#cfe3ef !important}
#view-home .fin-top-donut-slot .fin-ring-value{font-size:15px !important;color:#fff !important}

#view-home .fin-smarty-dock{
  width:98px !important;
  min-width:98px !important;
  margin:0 !important;
  position:relative !important;
  display:flex !important;
  flex-direction:column !important;
  align-items:center !important;
  justify-content:flex-start !important;
}
#view-home .fin-smarty-aura{display:none !important}
#view-home .fin-smarty-portrait{
  width:96px !important;
  height:92px !important;
  position:relative !important;
  overflow:visible !important;
  display:flex !important;
  justify-content:center !important;
  align-items:flex-end !important;
}
#view-home .fin-smarty-portrait #mascot-img{
  position:absolute !important;
  left:50% !important;
  top:-2px !important;
  width:84px !important;
  height:132px !important;
  max-width:none !important;
  max-height:none !important;
  margin-left:-42px !important;
  object-fit:contain !important;
  object-position:center bottom !important;
  filter:drop-shadow(0 8px 12px rgba(6,18,32,.24)) !important;
}
#view-home .fin-smarty-xp{
  left:4px !important;
  bottom:17px !important;
  width:3px !important;
  height:40px !important;
}
#view-home .fin-smarty-dialog{
  width:auto !important;
  min-width:74px !important;
  max-width:92px !important;
  min-height:24px !important;
  margin-top:2px !important;
  padding:4px 10px !important;
  border-radius:999px !important;
  background:rgba(255,255,255,.10) !important;
  border:1px solid rgba(220,236,248,.14) !important;
  box-shadow:0 6px 14px rgba(4,17,30,.10) !important;
  backdrop-filter:blur(12px) !important;
  -webkit-backdrop-filter:blur(12px) !important;
}
#view-home .fin-smarty-dialog-label{
  font-size:10px !important;
  font-weight:800 !important;
  color:#d8fff7 !important;
  line-height:1 !important;
}
#view-home .fin-smarty-dialog .mascot-bubble-side{display:none !important}

#view-home .fin-hero-main{
  display:block !important;
  margin:0 0 10px !important;
  min-height:0 !important;
  padding-right:0 !important;
}
#view-home .fin-hero-balance{max-width:100% !important}
#view-home .fin-balance-label{
  font-size:11px !important;
  line-height:1.25 !important;
  color:#caddeb !important;
}
#view-home .fin-balance-amount{
  font-size:38px !important;
  line-height:1.02 !important;
  letter-spacing:-1px !important;
  margin:5px 0 7px !important;
}
#view-home .fin-health-pill{
  display:inline-flex !important;
  max-width:100% !important;
  font-size:10px !important;
  padding:7px 10px !important;
  border-radius:999px !important;
  background:rgba(126,221,208,.10) !important;
  border:1px solid rgba(126,221,208,.18) !important;
  color:#cceee7 !important;
}
#view-home .fin-budget-progress-labels{
  margin:0 0 5px !important;
  color:#d7e6f2 !important;
}
#view-home .fin-budget-track{
  height:6px !important;
  background:rgba(204,220,234,.12) !important;
  border-radius:999px !important;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.04) !important;
}
#view-home .fin-budget-fill{
  background:linear-gradient(90deg, #84e0d0 0%, #6bb7ff 100%) !important;
  box-shadow:0 0 10px rgba(107,183,255,.22) !important;
}
#view-home .fin-summary-details{
  gap:8px !important;
  margin-top:10px !important;
}
#view-home .fin-metric{
  min-height:62px !important;
  padding:10px 11px !important;
  border-radius:18px !important;
  background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05)) !important;
  border:1px solid rgba(220,236,248,.11) !important;
  box-shadow:0 8px 18px rgba(5,18,31,.08), inset 0 1px 0 rgba(255,255,255,.08) !important;
  backdrop-filter:blur(13px) !important;
  -webkit-backdrop-filter:blur(13px) !important;
}
#view-home .fin-metric-top{color:#c6dcea !important}
#view-home .fin-metric strong{font-size:15px !important;color:#fff !important}
#view-home .fin-budget-note{margin-top:9px !important;color:#bdd8ea !important}

#view-home .fin-home-module{
  background:linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.10)) !important;
  border:1px solid rgba(219,234,246,.11) !important;
  box-shadow:0 10px 24px rgba(6,20,35,.07), inset 0 1px 0 rgba(255,255,255,.09) !important;
  backdrop-filter:blur(16px) saturate(118%) !important;
  -webkit-backdrop-filter:blur(16px) saturate(118%) !important;
}
#view-home .fin-module-header{height:40px !important}
#view-home .home-expense-row,#view-home .home-cat-row{min-height:33px !important}
#view-home .home-expense-row+.home-expense-row,
#view-home .home-cat-row+.home-cat-row{border-top:1px solid rgba(166,190,211,.18) !important}

#smarty-floating-tip{
  position:fixed !important;
  left:max(16px,env(safe-area-inset-left)) !important;
  right:max(16px,env(safe-area-inset-right)) !important;
  bottom:calc(96px + env(safe-area-inset-bottom)) !important;
  display:block !important;
  max-width:430px !important;
  margin:0 auto !important;
  padding:14px 16px !important;
  border-radius:18px !important;
  background:linear-gradient(180deg, rgba(18,51,77,.96), rgba(12,38,62,.94)) !important;
  color:#fff !important;
  border:1px solid rgba(150,223,235,.24) !important;
  box-shadow:0 16px 36px rgba(0,0,0,.26) !important;
  backdrop-filter:blur(16px) saturate(120%) !important;
  -webkit-backdrop-filter:blur(16px) saturate(120%) !important;
  overflow:auto !important;
  white-space:normal !important;
  overflow-wrap:anywhere !important;
  z-index:2147483647 !important;
  opacity:0; visibility:hidden; pointer-events:none;
  transition:opacity .2s ease, visibility .2s ease;
}
#smarty-floating-tip.is-visible{opacity:1 !important;visibility:visible !important;pointer-events:auto}

@media (max-width:365px){
  #view-home .fin-overview{padding:16px 14px 14px !important}
  #view-home .fin-overview-top{grid-template-columns:minmax(0,1fr) 66px 88px;gap:8px !important;min-height:76px !important}
  #view-home .fin-top-donut-slot .fin-hero-donut{width:64px !important;height:64px !important;flex-basis:64px !important}
  #view-home .fin-smarty-dock{width:88px !important;min-width:88px !important}
  #view-home .fin-smarty-portrait{width:86px !important;height:86px !important}
  #view-home .fin-smarty-portrait #mascot-img{width:76px !important;height:122px !important;margin-left:-38px !important}
  #view-home .fin-smarty-dialog{min-width:68px !important;max-width:84px !important;padding:4px 8px !important}
  #view-home .fin-balance-amount{font-size:33px !important}
}
@media (max-height:760px){
  #view-home .fin-overview-top{min-height:76px !important}
  #view-home .fin-smarty-portrait{height:86px !important}
  #view-home .fin-smarty-portrait #mascot-img{height:126px !important}
}
`;

  function applyCss() {
    let style = document.getElementById('smarty-quick-patch');
    if (!style) {
      style = document.createElement('style');
      style.id = 'smarty-quick-patch';
      document.head.appendChild(style);
    }
    style.textContent = css;
  }

  function reflowHomeCard() {
    const viewHome = document.getElementById('view-home');
    if (!viewHome) return;
    const overviewTop = viewHome.querySelector('.fin-overview-top');
    const donut = viewHome.querySelector('.fin-hero-donut');
    const smartyDock = viewHome.querySelector('.fin-smarty-dock');
    const heroMain = viewHome.querySelector('.fin-hero-main');
    if (!overviewTop || !donut || !smartyDock || !heroMain) return;

    let slot = overviewTop.querySelector('.fin-top-donut-slot');
    if (!slot) {
      slot = document.createElement('div');
      slot.className = 'fin-top-donut-slot';
      overviewTop.insertBefore(slot, smartyDock);
    }
    if (donut.parentElement !== slot) slot.appendChild(donut);

    const dialog = smartyDock.querySelector('.fin-smarty-dialog');
    if (dialog) {
      dialog.setAttribute('aria-label', 'Abrir el chat de Smarty');
      const label = dialog.querySelector('.fin-smarty-dialog-label');
      if (label) label.innerHTML = 'Smarty <span aria-hidden="true">↗</span>';
    }

    heroMain.classList.add('fin-hero-main--reflowed');
  }

  function patchTips() {
    if (typeof Assistant === 'undefined') return;
    Assistant.giveTip = function () {
      this.updateMood('thinking.png');
      const tip = this.getSmartTip();
      let layer = document.getElementById('smarty-floating-tip');
      if (!layer) {
        layer = document.createElement('div');
        layer.id = 'smarty-floating-tip';
        layer.setAttribute('role', 'status');
        layer.setAttribute('aria-live', 'polite');
        document.body.appendChild(layer);
      }
      layer.textContent = tip;
      layer.classList.add('is-visible');
      clearTimeout(this._smartyTipTimeout);
      this._smartyTipTimeout = setTimeout(() => {
        layer.classList.remove('is-visible');
        this.updateMood();
      }, 8500);
    };
  }

  function runPatch() {
    applyCss();
    reflowHomeCard();
    patchTips();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPatch, { once: true });
  } else {
    runPatch();
  }
  window.addEventListener('load', runPatch, { once: true });
  setTimeout(runPatch, 250);
  setTimeout(runPatch, 1200);
})();
