const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const test = require("node:test");
const configSource = fs.readFileSync("app-config.js", "utf8");
const source = fs.readFileSync("calendar-state.js", "utf8");

function calendar(storage = new Map(), blocked = false) {
  const context = vm.createContext({ Date, Intl, localStorage: {
    getItem: (key) => { if (blocked) throw Error("blocked"); return storage.get(key) ?? null; },
    setItem: (key, value) => { if (blocked) throw Error("blocked"); storage.set(key, value); },
    removeItem: (key) => storage.delete(key),
  } });
  vm.runInContext(configSource, context);
  vm.runInContext(source, context);
  return context.AdventCalendar;
}

test("PAYOT starts empty and shares saved progress between pages", () => {
  const storage = new Map();
  const detail = calendar(storage);
  assert.deepEqual([...detail.loadOpenedDays("payot")], []);
  const landing = calendar(storage);
  assert.deepEqual([...landing.loadOpenedDays("payot")], []);
  detail.saveOpenedDays("payot", [1, 2, 3, 4, 5, 6]);
  landing.invalidate();
  assert.equal(landing.loadOpenedDays("payot").size, 6);
});

test("old PAYOT test progress is ignored", () => {
  const state = calendar(new Map([["advent-opened-payot-test-v2", "[1,2,3,4]"]]));
  assert.equal(state.loadOpenedDays("payot").size, 0);
});

test("PAYOT unlocks exactly at 06:00 and only during its December season", () => {
  const state = calendar();
  const empty = new Set();
  for (const now of [new Date(2026, 10, 26, 12), new Date(2026, 11, 1, 5, 59, 59)]) {
    assert.equal(state.isDayAvailable("payot", 1, empty, now), false);
  }
  const six = new Date(2026, 11, 1, 6);
  assert.equal(state.isDayAvailable("payot", 1, empty, six), true);
  assert.equal(state.isDayAvailable("payot", 2, empty, six), false);
  assert.equal(state.nextUnlock("payot", empty, six).getDate(), 2);
  assert.equal(state.nextUnlock("payot", empty, six).getHours(), 6);
  assert.equal(state.isDayAvailable("payot", 24, empty, new Date(2026, 11, 24, 6)), true);
  assert.equal(state.nextUnlock("payot", empty, new Date(2026, 11, 25)), null);
  assert.equal(state.nextUnlock("payot", empty, new Date(2027, 0, 1)), null);
});

test("overdue gifts remain openable while future dates stay locked", () => {
  const state = calendar(new Map([["advent-opened-payot", "[1,2,3,4]"]]));
  const now = new Date(2026, 11, 19, 6);
  const opened = state.loadOpenedDays("payot");
  assert.equal(opened.size, 4);
  assert.equal(state.status("payot", opened, now).label, "Можно открыть 15");
  assert.equal(state.isDayAvailable("payot", 19, opened, now), true);
  assert.equal(state.isDayAvailable("payot", 20, opened, now), false);
  assert.equal(state.focusDay("payot", opened, now), 19);
  assert.equal(state.focusDay("payot", opened, new Date(2026, 10, 26)), 5);
});

test("opened gifts are preserved regardless of the current clock", () => {
  const state = calendar(new Map([["advent-opened-payot", "[1,24]"]]));
  const opened = state.loadOpenedDays("payot");
  assert.equal(state.isDayAvailable("payot", 24, opened, new Date(2026, 10, 26)), true);
  assert.equal(state.isDayAvailable("payot", 23, opened, new Date(2026, 10, 26)), false);
});

test("storage errors retain progress across refreshes during the session", () => {
  const state = calendar(new Map(), true);
  state.saveOpenedDays("payot", [1, 2, 3, 4, 5]);
  state.invalidate();
  assert.equal(state.loadOpenedDays("payot").size, 5);
});

test("Hello Kitty starts empty and follows the daily December schedule", () => {
  const state = calendar();
  const opened = state.loadOpenedDays("hello-kitty");
  assert.equal(opened.size, 0);
  assert.equal(state.isDayAvailable("hello-kitty", 1, opened, new Date(2026, 11, 1, 5, 59, 59)), false);
  assert.equal(state.isDayAvailable("hello-kitty", 1, opened, new Date(2026, 11, 1, 6)), true);
  assert.equal(state.isDayAvailable("hello-kitty", 2, opened, new Date(2026, 11, 1, 6)), false);
  assert.equal(state.nextUnlock("hello-kitty", opened, new Date(2026, 11, 1, 6)).getDate(), 2);
  assert.equal(state.nextUnlock("hello-kitty", opened, new Date(2026, 11, 1, 6)).getHours(), 6);
});
