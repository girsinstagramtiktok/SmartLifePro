// Pruebas de regresión para analizar pagos y imputación mensual sin Android real.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = __dirname;
// El reloj de prueba es estable, aun cuando el archivo se ejecute meses despues.
const fixedNow = new Date(2026, 9, 27, 12, 0, 0);
class TestDate extends Date {
  constructor(...args) { if (args.length) super(...args); else super(fixedNow.getTime()); }
  static now() { return fixedNow.getTime(); }
}
const storage = new Map();
const localStorage = {
  getItem: k => storage.has(k) ? storage.get(k) : null,
  setItem: (k,v) => storage.set(k,String(v))
};
const subscribers = {};
const nativeQueue = [];
const expenseInputs = {
  'exp-amount': { value: '70' }, 'exp-desc': { value: 'Compra futura' },
  'exp-is-install': { checked: false }, 'exp-link': { value: '' },
  'exp-posting-month': { value: 'next', querySelector: () => null },
  'exp-payment-date': { value: '2026-11-18' },
  'exp-payment-date-container': { classList: { toggle(){} } },
  'exp-inst-count': { value: '2' }
};
const modal = { classList: { contains: () => false } };
const document = {
  getElementById: id => expenseInputs[id] || (id === 'modal-expense' ? modal : null),
  querySelector: () => ({ id: 'fin-tab-home', dataset: { id: 'cat_market' } }),
  addEventListener: (name, cb) => (subscribers[name] = cb)
};
const store = { expenses:[], lists:[], subscriptions:[], settings: { bankAutoDetect:true, bankAutoSaveMode:'auto' }};
const Data = { store, save() {} };
const UI = { t: key => key, renderBudgetChart() {}, showSnackbar() {}, formatMoney:n=>'$'+n };
const Main = { closeModal() {} };
const Assistant = { updateMood() {}, updateHomeXP() {}, reactToEvent() {} };
const sandbox = {
  console, Math, Date: TestDate, String, JSON, Number, parseFloat, parseInt, RegExp,
  localStorage, document, Data, UI, Main, Assistant,
  window: {
    addEventListener: (name, cb) => { subscribers[name] = cb; },
    SmartyAndroid: { getPendingNotificationsJson: () => JSON.stringify(nativeQueue.splice(0)) }
  },
  setInterval: () => {}, setTimeout: callback => callback(),
  navigator: {},
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'finance.js'),'utf8') + '\nthis.Finance = Finance;',sandbox);
const Finance = sandbox.Finance;
sandbox.Finance = Finance;
Finance.renderHomeWidgets = () => {};
Finance.renderExpensesHistory = () => {};
// Fijamos la fecha con TZ America/Sao_Paulo externamente.
assert.equal(new TestDate().getMonth(), 9, 'reloj de prueba fijo en octubre');
Finance.updateExpensePaymentDateVisibility();
assert.equal(expenseInputs['exp-payment-date'].min, '2026-11-01');
assert.equal(expenseInputs['exp-payment-date'].max, '2026-11-30');
Finance.saveExpense();
assert.equal(store.expenses.length, 1);
assert.equal(new Date(store.expenses[0].date).getMonth(), 10);
assert.equal(new Date(store.expenses[0].date).getDate(), 18, 'respeta dia elegido');
assert.equal(store.expenses[0].scheduled, true);
assert.equal(Finance.calculateMonthlySpent(), 0, 'gasto futuro NO carga octubre');
assert.equal(Finance.parseExpensePaymentDate('2026-02-31'),null,'rechaza dias imposibles');
assert.equal(Finance.parseExpensePaymentDate('2028-02-29')?.getDate(),29,'acepta bisiestos');
const countValid = store.expenses.length;
expenseInputs['exp-payment-date'].value = '2026-11-31';
Finance.saveExpense();
assert.equal(store.expenses.length, countValid, 'no guarda fecha inexistente');
expenseInputs['exp-payment-date'].value = '2026-11-18';
expenseInputs['exp-is-install'].checked = true;
expenseInputs['exp-amount'].value = '100';
Finance.saveExpense();
assert.equal(Finance.calculateMonthlySpent(), 0, 'cuota futura NO carga octubre');
assert.equal(Finance.calculateProgress(store.expenses[1].date,2).current,0);
assert.equal(Finance.calculateProgressAtDate(store.expenses[1].date,2,new Date(2026,10,1)).current,1);
assert.equal(Finance.calculateProgressAtDate(store.expenses[1].date,2,new Date(2026,11,1)).current,2);
expenseInputs['exp-posting-month'].value = 'current';
expenseInputs['exp-is-install'].checked = false;
Finance.saveExpense();
assert.equal(Finance.calculateMonthlySpent(),100,'gasto corriente carga octubre');
console.log('OK: fecha elegida, cuotas aplazadas, gasto corriente.');

vm.runInContext(fs.readFileSync(path.join(root,'bank-bridge.js'),'utf8'),sandbox);
const bridge = sandbox.window.SmartyBankBridge;
const examples = [
  ['Compra aprovada por R$ 1.234,56 em Supermercado Central', 1234.56],
  ['Pagaste $34.90 en Heladería Freddo', 34.90],
  ['PIX enviado de R$ 38,90 para Pizzaria',38.90],
];
for (const [sample, expected] of examples) {
 const parsed = bridge.parse({title:'Banco',text:sample});
 assert(parsed, sample);
 assert.equal(parsed.amount,expected,sample);
}
for(const sample of [
 'Você recebeu um Pix de R$ 300,00',
 'Compra recusada R$ 17,90',
 'Promoção especial: compre hoje por R$ 50,00'
]) assert.equal(bridge.parse({title:'Banco',text:sample}),null,sample);
subscribers.load();
const before = store.expenses.length;
nativeQueue.push({ key:'test:1', package:'com.bank', title:'Banco', text:'Compra aprovada por R$ 35,80 em Mercado' });
bridge.drainPending();
assert.equal(store.expenses.length,before+1);
nativeQueue.push({ key:'test:1', package:'com.bank', title:'Banco', text:'Compra aprovada por R$ 35,80 em Mercado' });
bridge.drainPending();
assert.equal(store.expenses.length,before+1,'evita duplicados');
console.log('OK: extracción monetaria, bloqueo de ingresos, cola y deduplicados.');
