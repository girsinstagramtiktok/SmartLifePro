# SmartLifePro · Cuentas editables y rendimientos de Brasil (13/11/2026)

**Instalación incremental:** subir solo los archivos y conservar sus rutas; compilar desde GitHub Actions y actualizar el APK encima del anterior. Hacer copia de seguridad antes. El APK final todavía debe verificarse en Android. No se modificaron los servicios nativos de huella, notificaciones, respaldo ni actualización.

## Cuentas, tarjetas e ingresos

- **Inicio → tocar cuenta/tarjeta → Editar datos.** Se permite cambiar nombre, banco/logo, tipo, límite total, crédito utilizado inicial, días de corte/vencimiento, aviso y cuenta de pago. El límite disponible se recalcula sin eliminar compras. Si el límite nuevo queda por debajo de la deuda, el disponible puede ser negativo.
- En **Finanzas → Cuentas**, se pueden crear y ajustar cuentas y tarjetas. El saldo inicial de cuenta se puede editar, pero eso cambia la base histórica del saldo. Para conciliar el saldo de hoy, usar **Ajustar saldo** (registra un ajuste contable, no un gasto).
- Los **ingresos previstos** se pueden editar; los ingresos ya confirmados no cambian retroactivamente.

## Ahorros y tasas

**Finanzas → Ahorros → Nuevo ahorro → Banco y producto.** Elegir Nubank, Itaú, PicPay, Inter, Mercado Pago, Santander, Bradesco, Banco do Brasil, C6, Caixa, 99Pay o Poupança. El catálogo introduce tasas de oferta publicadas, con condiciones y límites, no saldos bancarios reales.

- **Nubank:** caixinha 100% CDI; Turbo 115% o 120% según elegibilidad.
- **Itaú:** cofrinhos 100% CDI. **PicPay:** cofrinho estándar 102% CDI.
- **Santander:** Minhas Reservas 100% CDI.
- **Inter:** Porquinho Dia a Dia hasta 80% y por objetivos hasta 100%; confirmar tasa contratada.
- **Mercado Pago:** cofrinhos estándar/beneficios variables (105%, 115%, 120% según condiciones y límites); ofertas y topes pueden cambiar.
- **C6:** CDB diario 101,5% CDI en la oferta consultada. **Caixa:** oferta de CDB diario 100% CDI (comprobar elegibilidad).
- **99Pay:** 110% CDI para cofrinho hasta R$5.000 y 80% excedente; saldo 105% hasta R$5.000 y 80% excedente, según reglas publicadas.
- **BB Rende Fácil / Bradesco Invest Fácil:** son productos con rentabilidad progresiva; no existe un porcentaje único para cada cliente. El simulador obliga a completar un porcentaje aplicable antes de estimar intereses. **Cofrinho BB:** fondo de inversión; requiere tasa estimada del fondo, porque no equivale a un CDB de tasa fija.
- **CDB / LCI / LCA personalizados:** tasa contractual, que puede ajustarse en Editar.
- **Poupança:** regla legal de Selic y TR con abonos en aniversario. Los retiros son aproximaciones; el banco puede calcular sobre el saldo mínimo del período.

**CDI, Selic y TR:** se consultan de los datos públicos del BCB SGS (series 12, 432 y 226) al iniciar la función y en «Actualizar tasas BCB». Queda el último valor guardado cuando no hay internet. Inicialmente se incluye una referencia identificada del 10/11/2026 (CDI 13,65% a.a., Selic 13,75% a.a., TR 0,1691% a.m.) para que la app funcione sin conexión. Se muestran fechas; no son tasas aseguradas ni históricas.

**Importante:** el rendimiento es estimación bruta, **sin** IOF, IR, tasas de administración, cambios históricos del CDI/SELIC/TR ni valorización diaria exacta por contrato. Los productos con bonificaciones requieren cumplir sus condiciones. Tasas anunciadas pueden cambiar; confirmar siempre con el banco. Cuando el rendimiento cambia, editar el producto. Cambios de tasa pueden afectar el histórico estimado. Editar un ahorro conserva sus depósitos y retiros. Para corregir el saldo real, usar «Ajustar saldo real».

## Fuentes consultadas

- Banco Central, poupança: https://www.bcb.gov.br/estatisticas/remuneradepositospoupanca
- Banco Central, Selic SGS 432: https://dadosabertos.bcb.gov.br/dataset/432-taxa-de-juros---meta-selic-definida-pelo-copom
- BCB SGS 12 CDI y 226 TR: https://www3.bcb.gov.br/sgspub/
- Nubank: https://nubank.com.br/nu/caixinhas
- Nubank Turbo: https://blog.nubank.com.br/calculadoras/caixinhas-ou-poupanca/
- Itaú: https://feito.itau.com.br/cofrinhos-itau-seu-dinheiro-a-servico-dos-seus-sonhos
- PicPay: https://meajuda.picpay.com/hc/pt-br/articles/11994164958355-Quanto-rendem-os-Cofrinhos-do-PicPay-e-quais-impostos-s%C3%A3o-cobrados
- Inter: https://ajuda.inter.co/investimentos/qual-e-a-rentabilidade-do-meu-porquinho
- Mercado Pago: https://www.mercadopago.com.br/cofrinhos
- BB Rende Fácil: https://blog.bb.com.br/bb-rende-facil-saldo-da-conta-corrente/
- BB Cofrinho: https://www.bb.com.br/site/investimentos/cofrinho-bb/
- Bradesco: https://banco.bradesco/html/classic/portal-investimentos/invest-facil.shtm
- Santander: https://www.santander.com.br/investimentos/minhas-reservas/
- C6: https://www.c6bank.com.br/c6-invest/renda-fixa/
- 99Pay: https://99app.com/99pay/cofrinho/

## Pruebas

`node smarty-money-tests.cjs`, `node smarty-investment-tests.cjs`, `node smarty-wallet-tests.cjs` y el conjunto habitual de pruebas del workflow.
