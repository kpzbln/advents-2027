const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const test = require("node:test");

class Element {
  constructor() {
    this.dataset = {};
    this.events = {};
    this.style = { setProperty() {} };
    this.classes = new Set();
    this.parentElement = null;
    this.isConnected = true;
    this.classList = {
      add: (name) => this.classes.add(name),
      remove: (name) => this.classes.delete(name),
      contains: (name) => this.classes.has(name),
    };
  }
  addEventListener(type, callback) { this.events[type] = callback; }
  setAttribute(name, value) { this[name] = value; }
  set innerHTML(value) {
    this.markup = value;
    this.cards = [...value.matchAll(/<button\b[\s\S]*?<\/button>/g)]
      .filter(([html]) => html.includes('class="payot-gift-card"'))
      .map(([html]) => {
        const card = new Element();
        for (const [, name, content] of html.matchAll(/data-([a-z]+)="([^"]+)"/g)) {
          card.dataset[name] = content;
        }
        card.disabled = /\sdisabled\s/.test(html);
        card.state = new Element();
        card.state.markup = html.match(/class="payot-gift-state"[^>]*>([\s\S]*?)<\/button>/)?.[1];
        return card;
      });
  }
  get innerHTML() { return this.markup; }
  querySelector(selector) { return selector === ".payot-gift-state" ? this.state : null; }
  querySelectorAll(selector) { return selector === ".payot-gift-card" ? this.cards || [] : []; }
  remove() {}
  focus() {}
  closest() { return this.hidden || this.inert ? this : null; }
  getClientRects() { return this.hidden ? [] : [{}]; }
}

function page(script, storage, initialTime) {
  const now = { value: initialTime };
  class PageDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now.value])); }
    static now() { return now.value.getTime(); }
  }
  const elements = new Map();
  const events = {};
  const intervals = [];
  const document = {
    fonts: { ready: Promise.resolve(), load: () => Promise.resolve() },
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, new Element());
      return elements.get(selector);
    },
    body: new Element(), referrer: "", addEventListener() {},
  };
  const context = vm.createContext({
    Date: PageDate, Intl, URL, document, Element, setTimeout, clearTimeout,
    getComputedStyle: () => ({ visibility: "visible" }),
    Image: class { set src(value) { this.onload?.(); } },
    sessionStorage: { getItem: () => "true" },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    window: {
      location: { hash: "", origin: "https://example.test", replace() {} },
      history: { length: 1 }, setTimeout, clearTimeout,
      setInterval: (fn) => intervals.push(fn),
      addEventListener: (type, fn) => { events[type] = fn; },
      requestAnimationFrame: (fn) => fn(), matchMedia: () => ({ matches: true }),
    },
  });
  for (const file of ["calendar-state.js", "page-resources.js", "modal-dialog.js", script]) {
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  }
  return { context, elements, events, now, intervals };
}

test("opening a PAYOT gift updates the same progress on the landing page and in preview", () => {
  const storage = new Map([["advent-opened-payot-test-v2", "[1,2,3,4]"]]);
  const time = new Date(2026, 11, 5, 6);
  const landing = page("main-page.js", storage, time);
  const payot = page("advent-payot.js", storage, time);
  assert.match(landing.elements.get("#calendar-list").innerHTML, /Открыто 4 из 24/);
  const gift = payot.elements.get("#payot-gift-grid").cards.find((card) => card.dataset.day === "5");
  gift.events.click();
  payot.elements.get(".payot-gift-modal-confirm").events.click();
  assert.equal(payot.elements.get(".calendar-progress-text").textContent, "Открыто 5 из 24");
  assert.equal(gift.dataset.opened, "true");
  assert.equal(payot.elements.get("#payot-focus-panel").dataset.opened, "true");
  landing.events.storage({ key: "advent-opened-payot" });
  assert.match(landing.elements.get("#calendar-list").innerHTML, /Открыто 5 из 24/);
});

test("PAYOT and landing change availability at 06:00 without a reload", () => {
  const storage = new Map([["advent-opened-payot", "[]"]]);
  const time = new Date(2026, 11, 1, 5, 59, 59);
  const landing = page("main-page.js", storage, time);
  const payot = page("advent-payot.js", storage, time);
  assert.match(landing.elements.get("#calendar-list").innerHTML, /Сегодня в 06:00/);
  assert.equal(vm.runInContext("isGiftAvailable(1)", payot.context), false);
  const firstCard = payot.elements.get("#payot-gift-grid").cards[0];
  assert.equal(firstCard.disabled, true);
  landing.now.value = payot.now.value = new Date(2026, 11, 1, 6);
  landing.intervals[0]();
  payot.intervals[0]();
  assert.match(landing.elements.get("#calendar-list").innerHTML, /Можно открыть 1/);
  assert.equal(vm.runInContext("isGiftAvailable(1)", payot.context), true);
  assert.equal(vm.runInContext("isGiftAvailable(2)", payot.context), false);
  assert.equal(firstCard.disabled, false);
  assert.equal(firstCard.dataset.available, "true");
});

test("PAYOT preview opens today's gift and changes to view product after opening", () => {
  const payot = page("advent-payot.js", new Map([["advent-opened-payot", "[1,2,3,4]"]]), new Date(2026, 11, 5, 6));
  const action = payot.elements.get("#payot-focus-action");
  const title = payot.elements.get("#payot-focus-title");
  assert.equal(title.textContent, "Подарок за 5 декабря");
  assert.equal(action.textContent, "Открыть сегодняшний подарок");
  assert.equal(action.disabled, false);
  action.events.click();
  assert.equal(payot.elements.get(".payot-gift-confirmation").hidden, false);
  assert.equal(title.textContent, "Подарок за 5 декабря");
  payot.elements.get(".payot-gift-modal-confirm").events.click();
  assert.equal(title.textContent, "NEO-SERUM — сыворотка, 5 мл");
  assert.equal(action.textContent, "Посмотреть средство");
  assert.match(payot.elements.get("#payot-gift-grid").cards[4].state.innerHTML, /Открыто/);
  payot.elements.get(".payot-gift-modal-close").events.click();
  action.events.click();
  assert.equal(payot.elements.get(".payot-gift-confirmation").hidden, true);
  assert.equal(payot.elements.get(".payot-gift-result").hidden, false);
});

test("locked preview stays disabled and gift cards show dates/checkmarks", () => {
  const payot = page("advent-payot.js", new Map([["advent-opened-payot", "[1,2,3,4]"]]), new Date(2026, 11, 19, 6));
  const cards = payot.elements.get("#payot-gift-grid").cards;
  assert.match(cards[0].state.innerHTML, /Открыто/);
  assert.match(cards[4].state.innerHTML, /Доступно/);
  assert.match(cards[19].state.innerHTML, /20 декабря/);
  const early = page("advent-payot.js", new Map([["advent-opened-payot", "[]"]]), new Date(2026, 11, 1, 5));
  assert.equal(early.elements.get("#payot-focus-action").disabled, true);
  assert.equal(early.elements.get("#payot-focus-action").textContent, "Откроется 1 декабря");
  assert.equal(early.elements.get("#payot-focus-title").textContent, "Подарок за 1 декабря");
});

test("PAYOT image error shows a placeholder and the next gift resets it", () => {
  const payot = page("advent-payot.js", new Map([["advent-opened-payot", "[1,2,3,4]"]]), new Date(2026, 11, 19, 6));
  const image = payot.elements.get("#payot-modal-image");
  const placeholder = payot.elements.get("#payot-modal-image-placeholder");
  const cards = payot.elements.get("#payot-gift-grid").cards;
  cards[0].events.click();
  image.events.error();
  assert.equal(image.hidden, true);
  assert.equal(placeholder.hidden, false);
  payot.elements.get(".payot-gift-modal-close").events.click();
  cards[1].events.click();
  assert.equal(image.hidden, false);
  assert.equal(placeholder.hidden, true);
});
