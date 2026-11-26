/* Shared state, storage and next-unlock scheduling for calendar pages. */
(() => {
  const state = globalThis.AdventCalendar;

  function create(id, { onRefresh } = {}) {
    let openedDays = state.loadOpenedDays(id);
    let refreshTimer;

    function schedule() {
      window.clearTimeout(refreshTimer);
      const next = state.nextUnlock(id, openedDays, new Date());
      if (!next) return;
      const delay = Math.max(next.getTime() - Date.now() + 50, 1000);
      refreshTimer = window.setTimeout(() => {
        refresh();
      }, delay);
    }

    function refresh() {
      state.invalidate();
      openedDays = state.loadOpenedDays(id);
      schedule();
      onRefresh?.();
      return new Set(openedDays);
    }

    function save(days) {
      openedDays = state.saveOpenedDays(id, days);
      schedule();
      return new Set(openedDays);
    }

    function start() {
      schedule();
      return new Set(openedDays);
    }

    function stop() {
      window.clearTimeout(refreshTimer);
    }

    return Object.freeze({
      getOpenedDays: () => new Set(openedDays),
      isDayAvailable: (day, now = new Date()) => state.isDayAvailable(id, day, openedDays, now),
      nextUnlock: (now = new Date()) => state.nextUnlock(id, openedDays, now),
      status: (now = new Date()) => state.status(id, openedDays, now),
      refresh,
      save,
      start,
      stop,
    });
  }

  globalThis.AdventCalendarController = Object.freeze({ create });
})();
