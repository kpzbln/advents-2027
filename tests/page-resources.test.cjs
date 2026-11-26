const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const test = require("node:test");

function resources(imageBehavior) {
  const timers = new Map();
  let nextId = 0;
  const context = vm.createContext({
    document: { fonts: { ready: Promise.resolve() } },
    setTimeout(fn, delay) { const id = ++nextId; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    Image: class { set src(value) { imageBehavior?.(this, value); } },
  });
  vm.runInContext(fs.readFileSync("page-resources.js", "utf8"), context);
  return { api: context.PageResources, timers };
}

test("a stalled font and image cannot block page readiness past five seconds", async () => {
  const { api, timers } = resources();
  let ready = false;
  const result = api.ready(["stalled.webp"], new Promise(() => {})).then(() => { ready = true; });
  await Promise.resolve();
  assert.equal(ready, false);
  assert.equal([...timers.values()][0].delay, 5000);
  [...timers.values()][0].fn();
  await result;
  assert.equal(ready, true);
});

test("image/font errors still finish loading and clear the timeout", async () => {
  const { api, timers } = resources((image) => image.onerror());
  await api.ready(["missing.webp"], Promise.reject(Error("font failed")));
  assert.equal(timers.size, 0);
});

test("cached images finish loading without waiting for the timeout", async () => {
  const { api, timers } = resources((image) => image.onload());
  await api.ready(["cached.webp"]);
  assert.equal(timers.size, 0);
});
