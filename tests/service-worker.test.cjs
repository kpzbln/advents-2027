const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const base = "https://example.test/advents/";
const request = (file, mode = "cors") => ({ url: new URL(file, base).href, method: "GET", mode });

function worker() {
  const handlers = new Map();
  const stores = new Map();
  let network = async () => new Response("network");
  let quotaFull = false;
  const key = (input) => new URL(typeof input === "string" ? input : input.url, base).href;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const values = stores.get(name);
      return {
        async match(input, options = {}) {
          const target = key(input);
          const found = [...values].find(([url]) => options.ignoreSearch
            ? url.split("?")[0] === target.split("?")[0] : url === target);
          return found?.[1].clone();
        },
        async put(input, response) {
          if (quotaFull) throw Error("quota exceeded");
          values.set(key(input), response.clone());
        },
        async addAll(files) {
          for (const file of files) {
            const local = path.resolve(file === "./" ? "index.html" : file);
            assert.equal(fs.existsSync(local), true, `Missing offline asset: ${file}`);
            values.set(key(file), new Response(`cached ${file}`));
          }
        },
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
  };
  const context = vm.createContext({
    URL, Response, AbortController, setTimeout, clearTimeout, caches,
    fetch: (...args) => network(...args),
    self: {
      location: { origin: "https://example.test" },
      addEventListener: (type, handler) => handlers.set(type, handler),
      skipWaiting: async () => {}, clients: { claim: async () => {} },
    },
    importScripts(...files) {
      for (const file of files) vm.runInContext(fs.readFileSync(file, "utf8"), context);
    },
  });
  vm.runInContext(fs.readFileSync("service-worker.js", "utf8"), context);
  const run = async (type) => {
    let pending;
    handlers.get(type)({ waitUntil(promise) { pending = promise; } });
    await pending;
  };
  return {
    run, caches, stores, context,
    network: (fetcher) => { network = fetcher; },
    quota: () => { quotaFull = true; },
    fetch(input) {
      let pending;
      handlers.get("fetch")({ request: input, respondWith(promise) { pending = promise; } });
      return pending;
    },
  };
}

test("first successful install caches all PAYOT gift pairs and pages for offline use", async () => {
  const sw = worker();
  await sw.run("install");
  const images = sw.context.self.ADVENT_IMAGE_ASSETS;
  assert.equal(images.filter((url) => url.includes("advent-payot/gifts/")).length, 48);
  sw.network(async () => { throw Error("offline"); });
  const page = await sw.fetch(request("advent-payot.html?from=home", "navigate"));
  assert.equal(page.status, 200);
  assert.match(await page.text(), /cached/);
  for (const file of images) assert.equal((await sw.fetch(request(file))).status, 200);
});

test("runtime caches successful responses and rejects 404/500 responses", async () => {
  const sw = worker();
  await sw.run("install");
  const asset = request("img/new-gift.webp");
  assert.equal((await sw.fetch(asset)).status, 200);
  sw.network(async () => { throw Error("offline"); });
  assert.equal(await (await sw.fetch(asset)).text(), "network");
  for (const status of [404, 500]) {
    const bad = request(`img/missing-${status}.webp`);
    sw.network(async () => new Response("error", { status }));
    assert.equal((await sw.fetch(bad)).status, status);
    sw.network(async () => { throw Error("offline"); });
    assert.equal((await sw.fetch(bad)).status, 503);
  }
});

test("network errors fall back to the same page and quota errors do not break a response", async () => {
  const sw = worker();
  await sw.run("install");
  sw.network(async () => new Response("server error", { status: 500 }));
  assert.equal((await sw.fetch(request("index.html", "navigate"))).status, 200);
  sw.quota();
  sw.network(async () => new Response("fresh page"));
  assert.equal(await (await sw.fetch(request("index.html", "navigate"))).text(), "fresh page");
});

test("upgrades remove old app caches and preserve unrelated caches", async () => {
  const sw = worker();
  await sw.run("install");
  await sw.caches.open("advents-2027-v15");
  await sw.caches.open("other-app");
  await sw.run("activate");
  assert.equal(sw.stores.has("advents-2027-v15"), false);
  assert.equal(sw.stores.has("other-app"), true);
  assert.equal(sw.stores.has("advents-2027-v23"), true);
});
