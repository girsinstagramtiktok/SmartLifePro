
/* Inicio circular SmartLifePro. Vista, ayuda y preferencias; no modifica movimientos. */
(function(root){
  'use strict';
  const $=id=>document.getElementById(id);
  const D=()=>typeof Data==='undefined'?null:Data;
  const lang=()=>['es','pt','en'].includes(D()?.store?.settings?.lang)?D().store.settings.lang:'es';
  const t=(es,pt,en)=>({es,pt,en})[lang()]||es;
  const notice=msg=>{if(typeof UI!=='undefined'&&UI.showSnackbar)UI.showSnackbar(msg);else console.info('[SmartyHome]',msg);};
  const CIRC=2*Math.PI*104;

  function translate(){
    const mappings=[
      ['.slp-ref-arc-text textPath',t('Progreso del presupuesto','Progresso do orçamento','Budget progress')],
      ['.slp-ref-percent-caption',t('del presupuesto gastado','do orçamento gasto','of budget spent')],
      ['.slp-ref-total-caption',t('Presupuesto total','Orçamento total','Total budget')],
      ['.slp-ref-stat-spent .slp-ref-stat-label',t('Has gastado','Você gastou','You spent')],
      ['.slp-ref-stat-daily .slp-ref-stat-label',t('Puedes gastar por día','Pode gastar por dia','You can spend per day')]
    ];
    mappings.forEach(pair=>{const node=document.querySelector('#view-home '+pair[0]);if(node)node.textContent=pair[1];});
  }
  function renderProgress(percent,budget,remaining){
    const fill=$('slp-ref-ring-fill'),ring=document.querySelector('.slp-ref-ring');
    if(!ring||!fill)return;
    translate();
    const ratio=budget>0&&Number.isFinite(percent)?Math.max(0,Math.min(1,percent/100)):0;
    fill.style.strokeDasharray=String(CIRC);
    fill.style.strokeDashoffset=String(CIRC*(1-ratio));
    const color=budget<=0?'#9eafa9':percent>=100?'#d65658':percent>=90?'#d19b32':'#2da75d';
    ring.style.setProperty('--slp-progress-color',color);
    ring.setAttribute('aria-label',budget>0?t('Presupuesto gastado: ','Orçamento gasto: ','Budget spent: ')+Math.round(percent)+'%.':t('Configura tu presupuesto','Configure seu orçamento','Set your budget'));
    const msg=$('home-budget-health');
    const caption=document.querySelector('.slp-ref-remaining-caption');
    if(caption)caption.textContent=budget>0&&remaining<0?t('Excedido por','Excedido em','Over budget by'):t('Restante para gastar','Restante para gastar','Remaining to spend');
    if(msg&&budget>0&&remaining<0)msg.setAttribute('data-budget-status','over');
    else msg?.removeAttribute('data-budget-status');
  }
  function closeOverlay(){
    $('slp-ref-overlay')?.remove();
    document.removeEventListener('keydown',onEscape);
  }
  function onEscape(event){if(event.key==='Escape')closeOverlay();}
  function overlay(title,inner,kind){
    closeOverlay();
    const el=document.createElement('div');el.id='slp-ref-overlay';el.className='slp-ref-modal';
    el.innerHTML='<section class="slp-ref-sheet" role="dialog" aria-modal="true" aria-label="'+title+'"><header><h2>'+title+'</h2><button type="button" class="slp-ref-close" aria-label="'+t('Cerrar','Fechar','Close')+'">×</button></header><main>'+inner+'</main></section>';
    el.addEventListener('click',event=>{if(event.target===el||event.target.closest('.slp-ref-close'))closeOverlay();});
    document.body.appendChild(el);
    document.addEventListener('keydown',onEscape);
    el.querySelector('.slp-ref-close')?.focus();
    if(kind==='alerts')connectAlerts(el);
  }
  const section=(title,body)=>({title,body});
  function guideSections(){
    return [
      section(t('Inicio y presupuesto','Início e orçamento','Home and budget'),
        t('<p>El círculo indica qué porcentaje del presupuesto mensual ya se gastó. Dentro aparece el importe restante; al tocarlo puedes modificar el presupuesto.</p><p>Los dos indicadores inferiores muestran el gasto acumulado y el importe diario orientativo para los días que quedan. Son cálculos del presupuesto, no del saldo bancario.</p>',
          '<p>O círculo mostra a porcentagem do orçamento mensal já gasta. No centro aparece o valor restante; toque para alterar o orçamento.</p><p>Os indicadores mostram o gasto acumulado e a média diária disponível até o fim do mês. São cálculos do orçamento, não do saldo bancário.</p>',
          '<p>The ring shows the percentage of your monthly budget already spent. Tap it to adjust your budget. The figures below show spending and a daily budget estimate, not your bank balance.</p>')),
      section(t('Bancos, cuentas y tarjetas','Bancos, contas e cartões','Banks, accounts and cards'),
        t('<p>En Inicio, cada banco muestra por separado el saldo registrado de sus cuentas y el crédito disponible de sus tarjetas. Toca una tarjeta para consultar sus productos y movimientos.</p><p>En Finanzas puedes crear, editar y ajustar saldos, límites, crédito utilizado, fechas de corte y vencimiento. Los importes son registros locales: la aplicación no consulta el saldo real del banco automáticamente.</p>',
          '<p>No Início, cada banco exibe separadamente o saldo das contas e o crédito disponível dos cartões. Toque para consultar os produtos e movimentos.</p><p>Em Finanças, edite saldos, limites, crédito utilizado, fechamento e vencimento. Os valores são registros locais, não consulta bancária em tempo real.</p>',
          '<p>Each bank shows recorded account balances and available card credit separately. Tap a bank to view products and activity. Edit limits and balances in Finance. Figures are locally recorded, not live bank feeds.</p>')),
      section(t('Gastos, categorías y gastos fijos','Despesas, categorias e gastos fixos','Expenses, categories and fixed bills'),
        t('<p>Registra cada gasto con descripción, importe, categoría y, si corresponde, cuenta o tarjeta de origen. Las categorías principales muestran en qué se concentra el presupuesto.</p><p>En Finanzas, Gastos fijos permite administrar pagos recurrentes, fechas de vencimiento y origen de pago. Comprueba los registros para evitar duplicar un cargo.</p>',
          '<p>Cadastre despesas com valor, categoria e conta/cartão de origem. As principais categorias resumem o uso do orçamento.</p><p>Em Finanças, Gastos fixos gerencia pagamentos recorrentes, datas e origem de pagamento. Evite lançar a mesma cobrança duas vezes.</p>',
          '<p>Record an expense with amount, category, and payment source. Fixed bills track recurring payments and due dates. Check entries to avoid duplicate charges.</p>')),
      section(t('Listas de compras e historial','Listas de compras e histórico','Shopping lists and history'),
        t('<p>En Listas crea una lista, añade productos y modifica sus cantidades y precios. Al finalizar una compra, sus productos pueden pasar al historial de precios.</p><p>Puedes adjuntar una foto del ticket y consultar la evolución de precios. La campana de cada lista sirve para definir una fecha y hora de recordatorio.</p>',
          '<p>Em Listas, crie listas, produtos, quantidades e preços. Finalizar uma compra permite consultar depois o histórico de preços.</p><p>É possível guardar fotos do comprovante. A campainha de cada lista agenda um lembrete com data e hora.</p>',
          '<p>Create shopping lists with products, quantities and prices. Finished purchases support price history and receipt photos. Use a list bell to schedule a reminder.</p>')),
      section(t('Asistente Smarty y voz','Assistente Smarty e voz','Smarty assistant and voice'),
        t('<p>Toca la mascota para abrir el chat con Smarty. El botón central + permite crear gastos y listas; la entrada por voz depende de los permisos del micrófono y de la configuración de la IA.</p><p>Para reconocer gastos, indica importe, concepto y categoría. Revisa siempre los datos interpretados antes de confirmarlos.</p>',
          '<p>Toque no mascote para abrir o chat. O botão central + cria despesas e listas; a entrada por voz depende das permissões do microfone e da configuração da IA.</p><p>Informe valor, item e categoria, e confira os dados interpretados antes de salvar.</p>',
          '<p>Tap the mascot to open Smarty chat. Use the central + button for expenses and lists. Voice needs microphone access and AI configuration. Check interpreted entries before saving.</p>')),
      section(t('Cómo conseguir la API key de Groq','Como obter uma chave API da Groq','How to get a Groq API key'),
        t("<ol><li>Entra en <a href='https://console.groq.com/keys' target='_blank' rel='noopener noreferrer'>Groq Console — API Keys</a>.</li><li>Inicia sesión o crea una cuenta en Groq.</li><li>En API Keys, selecciona la opción para crear una nueva clave.</li><li>Asigna un nombre, crea la clave y cópiala en ese momento.</li><li>Al utilizar por primera vez una función de Smarty AI, la app solicitará la clave de Groq. Pégala en el cuadro de solicitud y confirma.</li><li>Prueba el chat de Smarty. Si falla, comprueba los permisos, la conexión y los límites de uso de Groq.</li></ol><p><b>Seguridad:</b> no publiques tu clave, ni la subas a GitHub. Si se expone, revócala en Groq y genera otra.</p>",
          "<ol><li>Acesse <a href='https://console.groq.com/keys' target='_blank' rel='noopener noreferrer'>Groq Console — API Keys</a>.</li><li>Entre ou crie uma conta Groq.</li><li>Abra API Keys e escolha criar uma chave.</li><li>Dê um nome, gere a chave e copie imediatamente.</li><li>Ao usar o Smarty AI pela primeira vez, o aplicativo solicita a chave Groq. Cole-a na caixa de solicitação e confirme.</li><li>Teste o chat e verifique conexão e limites de uso se houver erro.</li></ol><p><b>Segurança:</b> nunca publique a chave no GitHub. Caso seja exposta, revogue-a.</p>",
          "<ol><li>Open <a href='https://console.groq.com/keys' target='_blank' rel='noopener noreferrer'>Groq Console — API Keys</a>.</li><li>Sign in or register.</li><li>Create a new API key and copy it immediately.</li><li>On first use of Smarty AI, the app asks for the Groq key. Paste it into that prompt and confirm.</li><li>Test Smarty chat and review your connection or Groq usage limits if needed.</li></ol><p>Never publish the key or commit it to GitHub. Revoke any exposed key.</p>")),
      section(t('Ingresos y ahorros','Receitas e reservas','Income and savings'),
        t('<p>En Finanzas puedes registrar ingresos puntuales o recurrentes, su origen y la cuenta de destino. Los ingresos previstos no deben confundirse con los efectivamente recibidos: confirma el cobro cuando llegue.</p><p>La sección de ahorros permite registrar productos, depósitos, retiros y proyecciones de rendimiento. Las tasas proyectadas son estimaciones, no garantías del banco.</p>',
          '<p>Em Finanças, registre receitas pontuais ou recorrentes, sua origem e conta de destino. Confirme o recebimento real quando acontecer.</p><p>Em Reservas, acompanhe depósitos, retiradas e projeções. As taxas projetadas são estimativas, não garantias do banco.</p>',
          '<p>Track one-time and recurring income, its source and destination. Confirm a projected payment when received. Savings forecasts are estimates, not guaranteed bank returns.</p>')),
      section(t('Alertas, vencimientos y notificaciones bancarias','Alertas, vencimentos e notificações bancárias','Alerts, due dates and bank notifications'),
        t('<p>La campana de Inicio abre las preferencias de alertas. Para recordar una compra usa la campana de la lista. Para facturas de crédito, configura el día de vencimiento y los días de anticipación al editar la tarjeta.</p><p>Android puede exigir permiso de notificaciones. La lectura de notificaciones bancarias requiere otro permiso específico y puede necesitar confirmación manual de los gastos detectados.</p>',
          '<p>A campainha do Início abre as preferências. Cada lista pode ter lembrete próprio. Para faturas, edite a data de vencimento e os dias de antecedência do cartão.</p><p>O Android pode exigir permissão para avisos locais e outra para leitura de notificações bancárias. Confira lançamentos detectados.</p>',
          '<p>The Home bell opens alert preferences. Lists have individual reminders; edit credit cards to set due dates and advance notice. Android notifications and bank notification reading require separate permissions.</p>')),
      section(t('Seguridad, copia de seguridad y actualizaciones','Segurança, backup e atualizações','Security, backup and updates'),
        t('<p>En Ajustes puedes administrar PIN, huella digital, idioma y colores. Los datos y las claves se almacenan en la app del dispositivo: protege el teléfono.</p><p>Configura copias de seguridad diarias en la carpeta elegida y comprueba que estén disponibles. Para actualizar la aplicación, descarga el APK en Download/SmartLifePro e instálalo manualmente. Conserva una copia antes de reinstalar.</p>',
          '<p>Em Ajustes, gerencie PIN, biometria, idioma e cores. Os dados ficam no aplicativo do dispositivo: proteja o aparelho.</p><p>Configure backups diários na pasta escolhida. As atualizações são instaladas manualmente a partir do APK em Download/SmartLifePro. Guarde um backup antes de reinstalar.</p>',
          '<p>Settings manages PIN, biometrics, language and colors. Configure daily backups and verify them. Updates use the APK saved to Download/SmartLifePro for manual installation. Back up before reinstalling.</p>'))
    ];
  }
  function openGuide(){
    const title=t('Guía completa de SmartLifePro','Guia completa do SmartLifePro','SmartLifePro complete guide');
    const intro=t('Aprende a utilizar cada sección de la app. Toca un tema para desplegar sus instrucciones.','Aprenda a usar cada seção do aplicativo. Toque em um assunto para ver os detalhes.','Learn to use every section. Tap any topic for instructions.');
    const entries=guideSections().map((item,i)=>'<details class="slp-ref-guide-section"'+(i===0?' open':'')+'><summary>'+item.title+'</summary><div class="slp-ref-guide-body">'+item.body+'</div></details>').join('');
    overlay(title,'<p class="slp-ref-guide-intro">'+intro+'</p>'+entries+'<button type="button" class="slp-ref-action" id="slp-guide-key-button">'+t('Configurar o cambiar API key de Groq','Configurar ou trocar a chave API Groq','Set or change Groq API key')+'</button>','guide');
    $('slp-guide-key-button')?.addEventListener('click',()=>{
      if(!D()?.store)return;
      const entered=window.prompt(t('Pega tu nueva API key de Groq:','Cole sua chave API Groq:','Paste your new Groq API key:'));
      if(entered===null)return;
      const key=entered.trim();
      if(key.length<12){notice(t('La clave parece demasiado corta. No se ha cambiado.','A chave parece curta demais. Nada foi alterado.','Key appears too short. Nothing changed.'));return;}
      D().store.settings=D().store.settings||{};
      D().store.settings.groqApiKey=key;
      D().save();notice(t('Clave guardada en el dispositivo','Chave salva no dispositivo','Key saved on device'));
    });
  }
  function openAlerts(){
    const s=D()?.store?.settings||{};
    const yes=(x)=>x?' checked':'';
    const html=
      '<p class="slp-ref-guide-intro">'+t('Configura los avisos compatibles con esta versión. Los recordatorios de listas y tarjetas se establecen en cada elemento.','Configure os avisos disponíveis. Lembretes de listas e cartões são definidos em cada item.','Configure available alerts. List and card reminders are set on each item.')+'</p>'+
      '<label class="slp-ref-setting"><span><strong>'+t('Alertas de gastos fijos','Alertas de gastos fixos','Fixed bill alerts')+'</strong><small>'+t('Avisos de pagos recurrentes, según soporte del APK.','Avisos de pagamentos recorrentes, conforme o APK.','Recurring bill alerts, when supported by the APK.')+'</small></span><input type="checkbox" data-slpa-setting="subNotifications"'+yes(s.subNotifications!==false)+'></label>'+
      '<label class="slp-ref-setting"><span><strong>'+t('Detectar notificaciones bancarias','Detectar notificações bancárias','Detect bank notifications')+'</strong><small>'+t('Reconocer posibles gastos; requiere permiso especial de Android.','Identificar possíveis despesas; requer permissão Android.','Recognize possible expenses; requires Android access.')+'</small></span><input type="checkbox" data-slpa-setting="bankAutoDetect"'+yes(!!s.bankAutoDetect)+'></label>'+
      '<button type="button" class="slp-ref-action" data-slpa-action="permission">'+t('Autorizar notificaciones de Android','Autorizar notificações do Android','Allow Android notifications')+'</button>'+
      '<button type="button" class="slp-ref-action" data-slpa-action="bank-permission">'+t('Configurar acceso a notificaciones bancarias','Configurar acesso a notificações bancárias','Set bank notification access')+'</button>'+
      '<button type="button" class="slp-ref-action" data-slpa-action="lists">'+t('Ir a Listas para configurar recordatorios','Abrir Listas para configurar lembretes','Open Lists to set reminders')+'</button>'+
      '<button type="button" class="slp-ref-action" data-slpa-action="cards">'+t('Ir a cuentas y tarjetas para configurar vencimientos','Abrir contas e cartões para ajustar vencimentos','Open accounts and cards to edit due dates')+'</button>'+
      '<p class="slp-ref-alert-note">'+t('La activación de detección bancaria no registra compras sin confirmación salvo que se haya elegido expresamente el modo automático en Ajustes.','A detecção bancária não registra despesas sem confirmação, exceto no modo automático escolhido em Ajustes.','Bank detection does not auto-save expenses unless auto mode was explicitly selected in Settings.')+'</p>';
    overlay(t('Configurar alertas','Configurar alertas','Configure alerts'),html,'alerts');
  }
  function connectAlerts(el){
    el.querySelectorAll('[data-slpa-setting]').forEach(node=>{
      node.addEventListener('change',()=>{
        const store=D()?.store;if(!store)return;
        store.settings=store.settings||{};
        store.settings[node.dataset.slpaSetting]=node.checked;
        D().save();
        notice(t('Preferencia guardada','Preferência salva','Preference saved'));
      });
    });
    el.querySelectorAll('[data-slpa-action]').forEach(node=>node.addEventListener('click',async()=>{
      const action=node.dataset.slpaAction;
      if(action==='lists'||action==='cards'){
        closeOverlay();
        if(typeof Main!=='undefined')Main.router(action==='lists'?'lists':'finance');
        if(action==='cards'&&typeof Finance!=='undefined')Finance.setTab('accounts');
        return;
      }
      if(action==='bank-permission'){
        if(typeof NativeBridge!=='undefined'&&NativeBridge.openNotificationAccessSettings)NativeBridge.openNotificationAccessSettings();
        else if(root.SmartyAndroid?.openNotificationSettings)root.SmartyAndroid.openNotificationSettings();
        else notice(t('Este APK no permite abrir ese permiso directamente; búscalo en Ajustes de Android.','Este APK não abre essa permissão; encontre-a nos ajustes do Android.','Open notification access in Android settings.'));
        return;
      }
      if(action==='permission'){
        try{
          const api=root.Capacitor?.Plugins?.LocalNotifications;
          if(!api?.requestPermissions)throw Error(t('Las notificaciones locales no están disponibles en este APK.','Notificações locais não disponíveis neste APK.','Local notifications are not available in this APK.'));
          const result=await api.requestPermissions();
          notice(result.display==='granted'?t('Notificaciones autorizadas','Notificações autorizadas','Notifications allowed'):t('Activa el permiso desde Android','Ative a permissão no Android','Allow notifications in Android settings'));
        }catch(e){notice(e.message||t('No se pudo solicitar el permiso','Não foi possível solicitar a permissão','Permission request failed'));}
      }
    }));
  }
  function init(){
    translate();
    if(typeof SmartyBentoHome!=='undefined')SmartyBentoHome.render?.();
    root.addEventListener('focus',()=>{if(typeof SmartyBentoHome!=='undefined')SmartyBentoHome.render?.();});
  }
  root.SmartyHomeRefresh={openGuide,openAlerts,renderProgress,translate};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
