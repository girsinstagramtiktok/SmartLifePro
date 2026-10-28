/* Smarty OTA ligero — parche visual del inicio.
   Se carga desde Vercel y solo toca estilos/JS del documento ya instalado.
*/
(function () {
  'use strict';
  window.SMARTY_PATCH_BUILD_ID = 'smarty-light-2026-10-27-02';

  const css = String.raw`
#view-home .fin-overview{
  background:
    radial-gradient(circle at 16% 12%, rgba(110,229,191,.10), transparent 28%),
    radial-gradient(circle at 84% 20%, rgba(159,209,255,.15), transparent 26%),
    linear-gradient(145deg, rgba(16,39,64,.86) 0%, rgba(12,30,50,.76) 54%, rgba(10,24,42,.82) 100%) !important;
  border:1px solid rgba(214,231,246,.14) !important;
  box-shadow:0 18px 42px rgba(3,18,34,.24), inset 0 1px 0 rgba(255,255,255,.08) !important;
  backdrop-filter:blur(18px) saturate(135%) !important;
  -webkit-backdrop-filter:blur(18px) saturate(135%) !important;
  overflow:hidden !important;
}
#view-home .fin-overview::before{
  content:'';
  position:absolute;
  inset:-110px auto auto -40px;
  width:210px;
  height:210px;
  border-radius:50%;
  background:radial-gradient(circle, rgba(123,238,219,.12), transparent 70%);
  pointer-events:none;
  z-index:0;
}
#view-home .fin-overview::after{
  content:'';
  position:absolute;
  inset:auto -70px -95px auto;
  width:200px;
  height:200px;
  border-radius:50%;
  background:radial-gradient(circle, rgba(124,160,255,.14), transparent 70%);
  pointer-events:none;
  z-index:0;
}
#view-home .fin-overview-top,
#view-home .fin-hero-main,
#view-home .fin-budget-progress-labels,
#view-home .fin-budget-track,
#view-home .fin-summary-details,
#view-home .fin-budget-note{position:relative;z-index:1}

#view-home .fin-overview-top{
  display:grid !important;
  grid-template-columns:minmax(0,1fr) 90px 124px;
  gap:10px !important;
  align-items:start !important;
  min-height:112px !important;
}
#view-home .fin-heading-copy{min-width:0;padding-right:0}
#view-home .fin-eyebrow{opacity:.76;letter-spacing:1.6px}
#view-home .fin-month-title{margin-top:6px !important; line-height:1.08}
#view-home .fin-top-donut-slot{
  display:flex;
  align-items:flex-start;
  justify-content:center;
  padding-top:6px;
}
#view-home .fin-top-donut-slot .fin-hero-donut{
  width:84px !important;
  height:84px !important;
  flex:0 0 84px !important;
  display:grid !important;
  place-items:center;
  padding:0 !important;
  transform:none !important;
  border-radius:24px !important;
  background:linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04)) !important;
  border:1px solid rgba(223,236,247,.16) !important;
  box-shadow:0 10px 24px rgba(6,18,33,.16), inset 0 1px 0 rgba(255,255,255,.10) !important;
  backdrop-filter:blur(14px) saturate(130%) !important;
  -webkit-backdrop-filter:blur(14px) saturate(130%) !important;
}
#view-home .fin-top-donut-slot .fin-hero-donut .circle-bg{stroke:rgba(226,238,248,.15) !important}
#view-home .fin-top-donut-slot .fin-hero-donut .circle{stroke:#efc489 !important}
#view-home .fin-top-donut-slot .fin-hero-donut .donut-label{font-size:8px !important;color:#d9edf7 !important}
#view-home .fin-top-donut-slot .fin-hero-donut .fin-ring-value{font-size:16px !important;color:#fff !important}
#view-home .fin-hero-main{
  display:block !important;
  min-height:0 !important;
  margin-top:8px !important;
  margin-bottom:12px !important;
  padding-right:0 !important;
}
#view-home .fin-hero-balance{max-width:100% !important; min-width:0 !important}
#view-home .fin-balance-label{opacity:.82}
#view-home .fin-balance-amount{
  font-size:41px !important;
  letter-spacing:-1.2px !important;
  margin:4px 0 7px !important;
}
#view-home .fin-health-pill{
  background:rgba(255,198,122,.12) !important;
  border:1px solid rgba(255,208,148,.24) !important;
  color:#f4d09b !important;
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
}
#view-home .fin-budget-progress-labels{color:#d7e7f4 !important}
#view-home .fin-budget-track{
  height:7px !important;
  border-radius:999px !important;
  background:rgba(203,222,238,.12) !important;
  box-shadow: inset 0 1px 1px rgba(255,255,255,.04);
}
#view-home .fin-budget-fill{
  background:linear-gradient(90deg, #f1cf9d 0%, #eab66e 100%) !important;
  box-shadow:0 0 12px rgba(236,191,123,.28) !important;
}
#view-home .fin-summary-details{gap:10px !important;margin-top:12px !important}
#view-home .fin-metric{
  border:1px solid rgba(220,236,247,.12) !important;
  background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05)) !important;
  box-shadow:0 10px 24px rgba(4,18,32,.12), inset 0 1px 0 rgba(255,255,255,.08) !important;
  backdrop-filter:blur(14px) saturate(125%) !important;
  -webkit-backdrop-filter:blur(14px) saturate(125%) !important;
}
#view-home .fin-metric strong{color:#fff !important}
#view-home .fin-metric-top{color:#b8d3e3 !important}
#view-home .fin-budget-note{color:#b7d8ee !important}

#view-home .fin-home-module{
  background:linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.09)) !important;
  border:1px solid rgba(207,226,241,.12) !important;
  box-shadow:0 12px 28px rgba(7,24,42,.08), inset 0 1px 0 rgba(255,255,255,.10) !important;
  backdrop-filter:blur(18px) saturate(120%) !important;
  -webkit-backdrop-filter:blur(18px) saturate(120%) !important;
}
#view-home .home-expense-row,#view-home .home-cat-row{color:var(--text-color) !important}
#view-home .home-expense-row+.home-expense-row,
#view-home .home-cat-row+.home-cat-row{border-top:1px solid rgba(158,190,214,.18) !important}

#view-home .fin-smarty-dock{
  width:124px !important;
  min-width:124px !important;
  margin:4px 0 0 0 !important;
  align-items:center !important;
}
#view-home .fin-smarty-portrait{
  width:110px !important;
  height:96px !important;
  overflow:visible !important;
}
#view-home .fin-smarty-aura{
  width:92px !important;
  height:72px !important;
  left:9px !important;
  bottom:4px !important;
  background:radial-gradient(ellipse at 50% 65%, rgba(117,232,207,.34), rgba(157,212,244,.10) 68%, transparent 82%) !important;
}
#view-home .fin-smarty-portrait #mascot-img{
  position:absolute !important;
  left:50% !important;
  top:-8px !important;
  width:96px !important;
  height:170px !important;
  max-width:none !important;
  max-height:none !important;
  margin-left:-48px !important;
  object-fit:contain !important;
  object-position:center bottom !important;
  filter:drop-shadow(0 8px 14px rgba(4,18,33,.34)) !important;
}
#view-home .fin-smarty-xp{left:6px !important;bottom:11px !important;height:46px !important}
#view-home .fin-smarty-dialog{
  width:116px !important;
  max-width:116px !important;
  min-height:34px !important;
  margin-top:1px !important;
  padding:5px 8px 6px !important;
  border-radius:13px !important;
  background:linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.08)) !important;
  border:1px solid rgba(217,236,248,.16) !important;
  box-shadow:0 8px 16px rgba(3,16,30,.14) !important;
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
}
#view-home .fin-smarty-dialog-label{font-size:10px !important;color:#d5fff5 !important}
#view-home .fin-smarty-dialog .mascot-bubble-side{
  max-height:none !important;
  overflow:visible !important;
  white-space:normal !important;
  text-overflow:clip !important;
  line-height:1.24 !important;
  font-size:8.5px !important;
  color:#d8e8f6 !important;
}

#smarty-floating-tip{
  position:fixed !important;
  left:max(16px,env(safe-area-inset-left)) !important;
  right:max(16px,env(safe-area-inset-right)) !important;
  bottom:calc(98px + env(safe-area-inset-bottom)) !important;
  display:block !important;
  max-width:430px !important;
  margin:0 auto !important;
  padding:15px 17px !important;
  border-radius:18px !important;
  background:linear-gradient(180deg, rgba(18,52,79,.94), rgba(13,39,64,.92)) !important;
  color:#fff !important;
  border:1px solid rgba(150,223,235,.28) !important;
  box-shadow:0 16px 38px rgba(0,0,0,.28) !important;
  backdrop-filter:blur(16px) saturate(125%) !important;
  -webkit-backdrop-filter:blur(16px) saturate(125%) !important;
  overflow:auto !important;
  white-space:normal !important;
  overflow-wrap:anywhere !important;
  z-index:2147483647 !important;
  opacity:0;visibility:hidden;pointer-events:none;
  transition:opacity .2s ease, visibility .2s ease;
}
#smarty-floating-tip.is-visible{opacity:1 !important;visibility:visible !important;pointer-events:auto}

@media (max-width:365px){
  #view-home .fin-overview-top{grid-template-columns:minmax(0,1fr) 78px 106px;gap:8px !important;min-height:104px !important}
  #view-home .fin-top-donut-slot .fin-hero-donut{width:74px !important;height:74px !important;flex-basis:74px !important}
  #view-home .fin-smarty-dock{width:106px !important;min-width:106px !important}
  #view-home .fin-smarty-portrait{width:95px !important;height:88px !important}
  #view-home .fin-smarty-portrait #mascot-img{width:84px !important;height:154px !important;margin-left:-42px !important;top:-6px !important}
  #view-home .fin-balance-amount{font-size:35px !important}
}
@media (max-height:760px){
  #view-home .fin-overview-top{min-height:104px !important}
  #view-home .fin-smarty-portrait{height:88px !important}
  #view-home .fin-smarty-portrait #mascot-img{height:160px !important}
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
      }, 9000);
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
  setTimeout(runPatch, 300);
  setTimeout(runPatch, 1200);
})();
