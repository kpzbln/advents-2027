/* Shared release configuration for calendar rules and offline cache naming. */
(() => {
  const config = {
    seasonYear: 2026,
    cacheYear: 2027,
    cacheVersion: 23,
  };
  config.cacheName = `advents-${config.cacheYear}-v${config.cacheVersion}`;
  globalThis.AdventAppConfig = Object.freeze(config);
})();
