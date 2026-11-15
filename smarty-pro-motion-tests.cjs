'use strict';
/* Regression checks for the direct-upload professional visual layer.
   No UI framework dependency and no application state required. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const base = __dirname;
const read = file => fs.readFileSync(path.join(base, file), 'utf8');
const html = read('index.html');
const workflow = read('.github/workflows/android-apk.yml');
const css = read('smarty-pro-polish.css');
const js = read('smarty-pro-motion.js');
new vm.Script(js, { filename: 'smarty-pro-motion.js' });
assert.match(html, /id="slp-critical-boot"/);
assert.match(html, /html:not\(\.slp-ui-ready\) #app-root \{visibility:hidden!important/);
assert.match(html, /id="slp-boot-splash"/);
assert.match(html, /<link rel="stylesheet" href="smarty-pro-polish\.css">/);
assert.match(html, /<script src="smarty-pro-motion\.js"><\/script>/);
assert.match(workflow, /cp smarty-pro-polish\.css smarty-pro-motion\.js www\//);
assert.match(workflow, /node smarty-pro-motion-tests\.cjs/);
assert.match(css, /\.bento-metrics\s*\{/);
assert.match(css, /\.slp-settings-group/);
assert.match(css, /\.sw-finance-card/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /--slp-touch-x/);
assert.doesNotMatch(js, /Data\.save\(|localStorage\.setItem\(|\.updateAccount\(|\.applyExpense\(/);

const listener = {};
const windows = {};
const timers = [];
const flags = new Set();
const style = { removed:false, remove() { this.removed=true; }};
const splash = { hidden:false, removed:false, setAttribute(k,v) { if(k==='aria-hidden'&&v==='true')this.hidden=true; }, remove() {this.removed=true;}};
const classes = () => { const set=new Set();return { add(x){set.add(x)},remove(x){set.delete(x)},contains(x){return set.has(x)}}};
const first = { id:'view-home', classList:classes(), offsetWidth:320 };
const finance = { id:'view-finance', classList:classes(), offsetWidth:320 };
let active = first;
let domObserver;
const doc = {
 readyState:'loading',hidden:false,documentElement:{classList:{ add(x){flags.add(x)},contains(x){return flags.has(x)} }},
 addEventListener(type,fn){listener[type]=fn},
 getElementById(id){return id==='smarty-prepaint'?style:id==='slp-boot-splash'?splash:null},
 querySelector(query){if(query==='#app-root > .view.active')return active;return null},
 querySelectorAll(query){if(query==='#app-root > .view')return [first,finance];return []}
};
const root = {
 document:doc,
 addEventListener(type,fn){windows[type]=fn},
 requestAnimationFrame(fn){fn()},
 setTimeout(fn,ms){timers.push({fn,ms});return timers.length},
 matchMedia(){return {matches:false}},
 MutationObserver: class { constructor(fn){domObserver=fn} observe(){} }
};
vm.runInNewContext(js, {window:root});
assert.equal(typeof root.SmartyProMotion.reveal,'function');
assert.equal(typeof listener.DOMContentLoaded,'function');
listener.DOMContentLoaded();
assert.equal(typeof windows.load,'function');
assert.equal(flags.has('slp-ui-ready'),false,'The app must remain gated until load');
windows.load();
assert.equal(flags.has('slp-ui-ready'),true,'The app must reveal after first paint');
assert.equal(style.removed,true,'Old APK prepaint should be removed on reveal');
assert.equal(splash.hidden,true,'Splash must stop intercepting the UI');
assert.equal(timers.some(x=>x.ms===520),true,'Splash is removed after fade');
active = finance;domObserver();
assert.equal(finance.classList.contains('slp-route-enter'),true,'Navigating views should animate');
const btn={classList:classes(),style:{values:{},setProperty(k,v){this.values[k]=v}},getBoundingClientRect(){return {left:0,top:0,width:100,height:80}}};
listener.pointerdown({target:{closest(){return btn}},clientX:28,clientY:34});
assert.equal(btn.classList.contains('slp-liquid-pressed'),true);
assert.equal(btn.style.values['--slp-touch-x'],'28.0%');
listener.pointerup();assert.equal(btn.classList.contains('slp-liquid-pressed'),false);
console.log('OK: first-paint guard, splash reveal, route animations, touch lens, offline assets, packaging');
