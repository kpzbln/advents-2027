const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const test = require("node:test");

function fixture() {
  const listeners = new Map();
  const document = {
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
  };
  class Node {
    constructor(tagName = "DIV") {
      this.tagName = tagName;
      this.children = [];
      this.inert = false;
      this.hidden = false;
      this.isConnected = true;
      this.classes = new Set();
      this.classList = { add: (s) => this.classes.add(s), remove: (s) => this.classes.delete(s) };
      this.events = {};
    }
    append(...nodes) { for (const node of nodes) { node.parentElement = this; this.children.push(node); } }
    setAttribute(name, value) { this[name] = value; }
    addEventListener(type, fn) { this.events[type] = fn; }
    contains(target) { return this === target || this.children.some((child) => child.contains(target)); }
    closest(selector) {
      if ((selector.includes("[inert]") && this.inert) || (selector.includes("[hidden]") && this.hidden)) return this;
      return this.parentElement?.closest(selector) || null;
    }
    getClientRects() { return this.closest("[hidden]") ? [] : [{}]; }
    querySelectorAll() {
      return this.children.flatMap((child) => [
        ...(child.tagName === "BUTTON" && !child.disabled ? [child] : []), ...child.querySelectorAll(),
      ]);
    }
    focus() {
      document.activeElement = this;
      for (const fn of listeners.get("focusin") || []) fn({ target: this });
    }
  }
  const body = document.body = new Node("BODY");
  const main = new Node("MAIN");
  const content = new Node();
  const overlay = new Node();
  const dialog = new Node();
  const close = new Node("BUTTON");
  const confirmation = new Node();
  const cancel = new Node("BUTTON");
  const confirm = new Node("BUTTON");
  const trigger = new Node("BUTTON");
  const alreadyInert = new Node();
  alreadyInert.inert = true;
  body.append(main, alreadyInert);
  main.append(content, overlay);
  content.append(trigger);
  overlay.append(dialog);
  dialog.append(close, confirmation);
  confirmation.append(cancel, confirm);
  const context = vm.createContext({ document, getComputedStyle: () => ({ visibility: "visible" }) });
  vm.runInContext(fs.readFileSync("modal-dialog.js", "utf8"), context);
  const controller = context.ModalDialog.create({ overlay, dialog, initialFocus: close });
  const key = (value, shiftKey = false) => {
    const event = { key: value, shiftKey, prevented: false, preventDefault() { this.prevented = true; }, stopPropagation() {} };
    for (const fn of listeners.get("keydown") || []) fn(event);
    return event;
  };
  return { document, controller, key, content, overlay, dialog, close, confirm, cancel, confirmation, trigger, alreadyInert };
}

test("a nested modal blocks its background and restores the original inert/focus state", () => {
  const f = fixture();
  f.controller.open(f.trigger);
  assert.equal(f.content.inert, true);
  assert.equal(f.overlay.closest("[inert]"), null);
  assert.equal(f.document.activeElement, f.close);
  f.controller.open(f.confirm); // Switching modal views must keep the original trigger.
  f.key("Escape");
  assert.equal(f.document.activeElement, f.trigger);
  assert.equal(f.content.inert, false);
  assert.equal(f.alreadyInert.inert, true);
  assert.equal(f.overlay["aria-hidden"], "true");
});

test("Tab and Shift+Tab wrap and ignore buttons in a hidden confirmation view", () => {
  const f = fixture();
  f.controller.open(f.trigger);
  assert.equal(f.key("Tab", true).prevented, true);
  assert.equal(f.document.activeElement, f.confirm);
  f.key("Tab");
  assert.equal(f.document.activeElement, f.close);
  f.confirmation.hidden = true;
  f.key("Tab");
  assert.equal(f.document.activeElement, f.close);
  f.trigger.focus();
  assert.equal(f.document.activeElement, f.close);
});

test("only clicking the modal backdrop closes the dialog", () => {
  const f = fixture();
  f.controller.open(f.trigger);
  f.overlay.events.click({ target: f.dialog });
  assert.equal(f.content.inert, true);
  f.overlay.events.click({ target: f.overlay });
  assert.equal(f.content.inert, false);
  assert.equal(f.document.activeElement, f.trigger);
});
