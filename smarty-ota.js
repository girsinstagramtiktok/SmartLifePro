/* Smarty OTA ligero — se carga desde Vercel, sin GitHub Releases ni ZIP.
   Solo modifica estilos y JavaScript del documento que ya está instalado.
   Para cambiar archivos nativos o el HTML base se necesita un APK nuevo.
*/
(function () {
  'use strict';
  window.SMARTY_PATCH_BUILD_ID = 'smarty-light-2026-10-27-01';

  const css = String.raw`/* ================================================================
   SMARTY · CORRECCIÓN DEFINITIVA DEL INICIO (2026-10-27)
   Una única regla final: no usar object-fit:cover ni recortar consejos.
   ================================================================ */
#view-home .fin-overview-top { min-height: 92px; }
#view-home .fin-smarty-dock {
  margin: 14px 0 0 !important;
  width: 101px; min-width: 101px;
  z-index: 5;
}
#view-home .fin-smarty-portrait {
  position: relative;
  width: 94px; height: 76px;
  overflow: visible !important;
}
#view-home .fin-smarty-portrait #mascot-img {
  position: absolute !important;
  left: 50% !important;
  top: -23px !important;
  bottom: auto !important;
  display: block !important;
  width: 80px !important;
  height: 155px !important;
  max-width: none !important;
  max-height: none !important;
  margin: 0 0 0 -40px !important;
  object-fit: contain !important;
  object-position: center center !important;
  filter: drop-shadow(0 5px 8px rgba(2,17,33,.27));
}
#view-home .fin-smarty-dialog { position: relative; z-index: 6; }
#view-home .fin-smarty-dialog .mascot-bubble-side {
  max-height: none !important;
  overflow: visible !important;
  white-space: normal !important;
  text-overflow: clip !important;
  line-height: 1.3 !important;
  min-height: 0 !important;
  font-size: 9px !important;
}
#view-home .fin-hero-main {
  padding-right: 20px !important;
  margin-top: -7px !important;
  position: relative;
  z-index: 2;
}
#view-home .fin-hero-donut {
  transform: translateX(-22px) !important;
}
/* Consejo completo visible FUERA del panel que tiene overflow:hidden. */
#smarty-floating-tip {
  position: fixed !important;
  left: max(16px,env(safe-area-inset-left)) !important;
  right: max(16px,env(safe-area-inset-right)) !important;
  bottom: calc(102px + env(safe-area-inset-bottom)) !important;
  top: auto !important;
  display: block !important;
  width: auto !important;
  max-width: 430px !important;
  max-height: min(42vh,260px) !important;
  margin: 0 auto !important;
  padding: 15px 17px !important;
  box-sizing: border-box !important;
  overflow: auto !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  text-overflow: clip !important;
  border-radius: 17px !important;
  background: #183756 !important;
  color: #fff !important;
  border: 1px solid rgba(117,232,207,.48) !important;
  box-shadow: 0 10px 35px rgba(0,0,0,.28) !important;
  font: 600 13px/1.5 var(--font-main,system-ui) !important;
  z-index: 2147483647 !important;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity .2s ease,visibility .2s ease;
}
#smarty-floating-tip.is-visible { opacity: 1 !important; visibility: visible !important; pointer-events: auto; }
@media(max-width:365px){
  #view-home .fin-smarty-dock{margin-top: 12px !important; width: 88px; min-width: 88px;}
  #view-home .fin-smarty-portrait{height:72px;width:83px}
  #view-home .fin-smarty-portrait #mascot-img{height:146px !important;width:75px !important;margin-left:-37.5px !important;top:-21px !important}
  #view-home .fin-hero-donut{transform:translateX(-18px) !important}
}
@media(max-height:750px){
  #view-home .fin-smarty-dock{margin-top: 9px !important}
  #view-home .fin-hero-main{margin-top:-5px !important}
}
`;
  let style = document.getElementById('smarty-quick-patch');
  if (!style) {
    style = document.createElement('style');
    style.id = 'smarty-quick-patch';
    document.head.appendChild(style);
  }
  style.textContent = css;

  // Restaurar consejos completos y accesibles, sin envolver otros métodos.
  if (typeof Assistant !== 'undefined') {
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
})();
