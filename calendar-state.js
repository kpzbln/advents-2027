/* Shared progress and local-time unlock rules for every calendar page. */
(() => {
  const TOTAL_DAYS = 24;
  const DEFAULT_TOTAL_DAYS = TOTAL_DAYS;
  const SEASON_YEAR = globalThis.AdventAppConfig?.seasonYear ?? 2026;
  const configs = {
    "hello-kitty": {
      storageKey: "hello-kitty-opened-gifts",
      schedule: "daily",
      year: SEASON_YEAR,
      unlockHour: 6,
      initialOpened: [],
    },
    payot: {
      storageKey: "advent-opened-payot",
      schedule: "daily",
      year: SEASON_YEAR,
      unlockHour: 6,
      initialOpened: [],
    },
    "kinder-mix": {
      storageKey: "advent-opened-kinder-mix-v2",
      schedule: "daily",
      year: SEASON_YEAR,
      unlockHour: 6,
      totalDays: 31,
      initialOpened: [],
    },
  };
  const memory = new Map();
  const unsaved = new Set();
  const totalDays = (id) => configs[id]?.totalDays ?? DEFAULT_TOTAL_DAYS;
  const normalize = (id, days) => [...new Set(days.map(Number).filter(
    (day) => Number.isInteger(day) && day >= 1 && day <= totalDays(id),
  ))].sort((a, b) => a - b);

  function readStored(id, key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return Array.isArray(value) ? normalize(id, value) : null;
    } catch {
      return null;
    }
  }

  function saveOpenedDays(id, days) {
    const config = configs[id];
    const normalized = normalize(id, [...days]);
    memory.set(id, normalized);
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(normalized));
      if (config.migrationKey) localStorage.removeItem(config.migrationKey);
      unsaved.delete(id);
    } catch {
      unsaved.add(id);
      // Continue with session memory when persistent storage is unavailable.
    }
    return new Set(normalized);
  }

  function loadOpenedDays(id) {
    const config = configs[id];
    if (memory.has(id)) return new Set(memory.get(id));
    const migrated = config.migrationKey ? readStored(id, config.migrationKey) : null;
    if (migrated !== null) return saveOpenedDays(id, migrated);
    const stored = readStored(id, config.storageKey);
    if (stored !== null) {
      memory.set(id, stored);
      return new Set(stored);
    }
    for (const key of config.legacyKeys || []) {
      const legacy = readStored(id, key);
      if (legacy !== null) return saveOpenedDays(id, legacy);
    }
    return saveOpenedDays(id, config.initialOpened);
  }

  function unlockDate(id, day) {
    const config = configs[id];
    return config.schedule === "daily"
      ? new Date(config.year, 11, day, config.unlockHour, 0, 0, 0)
      : null;
  }

  function isDayAvailable(id, day, opened = loadOpenedDays(id), now = new Date()) {
    if (!Number.isInteger(day) || day < 1 || day > totalDays(id)) return false;
    return opened.has(day) || configs[id].schedule === "all" || now >= unlockDate(id, day);
  }

  function nextUnlock(id, opened = loadOpenedDays(id), now = new Date()) {
    if (configs[id].schedule !== "daily") return null;
    for (let day = 1; day <= totalDays(id); day += 1) {
      const date = unlockDate(id, day);
      if (!opened.has(day) && date > now) return date;
    }
    return null;
  }

  function unlockLabel(date, now = new Date()) {
    if (!date) return "Все дни доступны";
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayLabel = date.toDateString() === now.toDateString()
      ? "Сегодня"
      : date.toDateString() === tomorrow.toDateString()
        ? "Завтра"
        : new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(date);
    const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return `${dayLabel} в ${time}`;
  }

  function status(id, opened = loadOpenedDays(id), now = new Date()) {
    if (opened.size >= totalDays(id)) return { state: "complete", label: "Всё открыто" };
    let count = 0;
    for (let day = 1; day <= totalDays(id); day += 1) {
      if (!opened.has(day) && isDayAvailable(id, day, opened, now)) count += 1;
    }
    return count > 0
      ? { state: "available", label: `Можно открыть ${count}` }
      : { state: "waiting", label: unlockLabel(nextUnlock(id, opened, now), now) };
  }

  function focusDay(id, opened = loadOpenedDays(id), now = new Date()) {
    const config = configs[id];
    if (now.getFullYear() === config.year && now.getMonth() === 11 && now.getDate() <= totalDays(id)) {
      return now.getDate();
    }
    const unopened = Array.from({ length: totalDays(id) }, (_, index) => index + 1)
      .filter((day) => !opened.has(day));
    return unopened.find((day) => isDayAvailable(id, day, opened, now)) ?? unopened[0] ?? totalDays(id);
  }

  function isProgressKey(key) {
    return key === null || Object.values(configs).some((config) =>
      [config.storageKey, config.migrationKey, ...(config.legacyKeys || [])]
        .filter(Boolean)
        .includes(key));
  }

  globalThis.AdventCalendar = Object.freeze({
    TOTAL_DAYS, totalDays, configs, loadOpenedDays, saveOpenedDays, unlockDate, isDayAvailable,
    nextUnlock, unlockLabel, status, focusDay, isProgressKey,
    invalidate: () => {
      for (const id of memory.keys()) {
        if (!unsaved.has(id)) memory.delete(id);
      }
    },
  });
})();
