const calendarState = globalThis.AdventCalendar;
const TOTAL_DAYS = calendarState.TOTAL_DAYS;
      const loadingScreen = document.querySelector("#loading-screen");
      const entryAnimationStorageKey = "advents-main-entry-animation-played-v1";
      let entryAnimationPlayed = false;
      try {
        entryAnimationPlayed =
          sessionStorage.getItem(entryAnimationStorageKey) === "true";
      } catch {
        // The animation still works when session storage is unavailable.
      }
      const criticalAssets = [
        "img/main-page/left-heart.webp",
        "img/main-page/right-heart.webp",
        "img/main-page/love-is-image.webp",
        "img/main-page/hello-kitty/background.webp",
        "img/main-page/hello-kitty/image.webp",
        "img/main-page/payot/background.webp",
        "img/main-page/payot/image.webp",
        "img/main-page/kinder-mix/background.webp",
        "img/main-page/kinder-mix/image.webp",
      ];
      const calendars = [
        {
          id: "hello-kitty",
          name: "Hello Kitty & Friends",
          artClass: "calendar-art--hello-kitty",
          note: "\u041a\u0430\u0436\u0434\u044b\u0439 \u0434\u0435\u043d\u044c \u0441 1 \u043f\u043e 24 \u0434\u0435\u043a\u0430\u0431\u0440\u044f \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0432 06:00 \u043f\u043e \u043c\u0435\u0441\u0442\u043d\u043e\u043c\u0443 \u0432\u0440\u0435\u043c\u0435\u043d\u0438.",
        },
        {
          id: "payot",
          name: "PAYOT",
          artClass: "calendar-art--payot",
          note: "Каждый день с 1 по 24 декабря открывается в 06:00 по местному времени.",
        },
        {
          id: "kinder-mix",
          name: "Kinder Mix",
          artClass: "calendar-art--kinder-mix",
          enabled: false,
          note: "\u0421\u043a\u043e\u0440\u043e \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u043f\u043e\u0434\u0440\u043e\u0431\u043d\u044b\u0439 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c.",
        },
      ];

      const selectionPage = document.querySelector("#selection-page");
      const calendarPage = document.querySelector("#calendar-page");
      const calendarList = document.querySelector("#calendar-list");
      const detailTitle = document.querySelector("#detail-title");
      const detailSummary = document.querySelector("#detail-summary");
      const detailStatus = document.querySelector("#detail-status");
      const dayGrid = document.querySelector("#day-grid");
      const detailNote = document.querySelector("#detail-note");
      const toast = document.querySelector("#toast");
      let toastTimer;
      let selectionMarkup = "";
      let detailSignature = "";
      const calendarControllers = new Map();

      async function revealApp() {
        const fontPromises = document.fonts
          ? [
              document.fonts.load('700 16px "Nunito"'),
              document.fonts.load('800 38px "Nunito"'),
            ]
          : [];
        await PageResources.ready(criticalAssets, Promise.allSettled(fontPromises));
        document.body.classList.remove("is-loading");
        document.body.classList.add("is-ready");
        loadingScreen.setAttribute("aria-hidden", "true");
        loadingScreen.hidden = true;
        window.requestAnimationFrame(playEntryAnimation);
      }

      function entryTargets() {
        if (!calendarPage.hidden) {
          return [
            calendarPage.querySelector(".detail-header"),
            calendarPage.querySelector(".detail-summary"),
            calendarPage.querySelector(".detail-status"),
            ...calendarPage.querySelectorAll(".day-button"),
            calendarPage.querySelector(".detail-note"),
          ].filter(Boolean);
        }
        return [
          selectionPage.querySelector(".site-header"),
          ...selectionPage.querySelectorAll(".calendar-card"),
          selectionPage.querySelector(".bottom-illustration"),
        ].filter(Boolean);
      }

      function playEntryAnimation() {
        if (entryAnimationPlayed) {
          return;
        }
        entryAnimationPlayed = true;
        try {
          sessionStorage.setItem(entryAnimationStorageKey, "true");
        } catch {
          // The in-memory flag still prevents repeated animation in this page.
        }
        const targets = entryTargets();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof Element.prototype.animate !== "function") {
          return;
        }
        targets.forEach((element, index) => {
          element.animate(
            [
              { opacity: 0, transform: "translateY(18px) scale(0.98)" },
              { opacity: 1, transform: "translateY(0) scale(1)" },
            ],
            {
              duration: 440,
              delay: Math.min(index, 12) * 52,
              easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              fill: "both",
            },
          );
        });
      }

      function getCalendar(id) {
        return calendars.find((calendar) => calendar.id === id);
      }

      function getController(calendar) {
        return calendarControllers.get(calendar.id);
      }

      calendars.forEach((calendar) => {
        calendarControllers.set(calendar.id, AdventCalendarController.create(calendar.id, {
          onRefresh: () => renderRoute(),
        }));
      });

      function getOpenedDays(calendar) {
        return getController(calendar).getOpenedDays();
      }

      function saveOpenedDays(calendar, openedDays) {
        getController(calendar).save(openedDays);
      }

      function waitingLabel(calendar) {
        return calendarState.unlockLabel(getController(calendar).nextUnlock());
      }

      function getStatus(calendar, openedDays) {
        return calendarState.status(calendar.id, openedDays);
      }

      function cardMarkup(calendar) {
        const openedDays = getOpenedDays(calendar);
        const enabled = calendar.enabled !== false;
        const status = enabled
          ? getStatus(calendar, openedDays)
          : { state: "coming-soon", label: "\u0421\u043a\u043e\u0440\u043e" };
        const calendarHref = calendar.id === "hello-kitty"
          ? "advent-hello-kitty.html"
          : calendar.id === "payot"
            ? "advent-payot.html"
            : null;
        const cardTag = enabled ? "a" : "div";
        const cardAttributes = enabled
          ? `href="${calendarHref}"`
          : 'aria-disabled="true"';
        const progressLabel = enabled
          ? `\u041e\u0442\u043a\u0440\u044b\u0442\u043e ${openedDays.size} \u0438\u0437 ${TOTAL_DAYS}`
          : "\u0421\u043a\u043e\u0440\u043e";
        return `
          <li>
            <${cardTag} class="calendar-card${enabled ? "" : " calendar-card--disabled"}" ${cardAttributes} data-calendar-id="${calendar.id}" aria-label="${calendar.name}. ${status.label}${enabled ? `. ${progressLabel}` : ""}">
              <span class="calendar-art ${calendar.artClass}" aria-hidden="true"></span>
              <span class="calendar-copy">
                <span class="calendar-status" data-state="${status.state}">
                  <span>${status.label}</span>
                </span>
                <span class="calendar-title">${calendar.name}</span>
                <span class="calendar-progress">
                  <span class="calendar-divider" aria-hidden="true"></span>
                  <span class="calendar-progress-label">${progressLabel}</span>
                </span>
              </span>
            </${cardTag}>
          </li>
        `;
      }
      function renderSelection() {
        const markup = calendars.map(cardMarkup).join("");
        if (selectionMarkup !== markup) {
          const focusedCalendar = document.activeElement?.dataset.calendarId;
          calendarList.innerHTML = markup;
          selectionMarkup = markup;
          if (focusedCalendar) {
            calendarList.querySelector(`[data-calendar-id="${focusedCalendar}"]`)?.focus();
          }
        }
      }

      function isDayOpenable(calendar, day) {
        return getController(calendar).isDayAvailable(day);
      }

      function renderDetail(calendar) {
        const openedDays = getOpenedDays(calendar);
        const status = getStatus(calendar, openedDays);
        const signature = JSON.stringify([calendar.id, [...openedDays], status]);
        if (signature === detailSignature) return;
        detailSignature = signature;
        detailTitle.textContent = calendar.name;
        detailSummary.textContent = `\u041e\u0442\u043a\u0440\u044b\u0442\u043e ${openedDays.size} \u0438\u0437 ${TOTAL_DAYS}`;
        detailStatus.textContent = status.state === "waiting" ? `Следующее открытие: ${status.label}` : status.label;
        detailNote.textContent = calendar.note;
        document.title = `${calendar.name} — Адвенты`;

        dayGrid.innerHTML = Array.from({ length: TOTAL_DAYS }, (_, index) => {
          const day = index + 1;
          const opened = openedDays.has(day);
          const openable = isDayOpenable(calendar, day);
          const lockedLabel = status.state === "waiting" ? `, откроется ${status.label.toLowerCase()}` : "";
          const stateLabel = opened ? ", открыт" : openable ? ", доступен для открытия" : lockedLabel;
          return `<button class="day-button" type="button" data-day="${day}" data-opened="${opened}" ${openable ? "" : "disabled"} aria-label="День ${day}${stateLabel}">${day}</button>`;
        }).join("");

        dayGrid.querySelectorAll(".day-button").forEach((button) => {
          button.addEventListener("click", () => openDay(calendar, Number(button.dataset.day)));
        });
      }

      function openDay(calendar, day) {
        const openedDays = getOpenedDays(calendar);
        if (!isDayOpenable(calendar, day)) {
          showToast(`Этот день откроется ${waitingLabel(calendar).toLowerCase()}.`);
          return;
        }
        if (openedDays.has(day)) {
          showToast(`День ${day} уже открыт.`);
          return;
        }
        openedDays.add(day);
        saveOpenedDays(calendar, openedDays);
        renderDetail(calendar);
        renderSelection();
        showToast(`День ${day} открыт.`);
      }

      function showToast(message) {
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.dataset.visible = "true";
        toastTimer = window.setTimeout(() => {
          toast.dataset.visible = "false";
        }, 2600);
      }

      function renderRoute() {
        const match = window.location.hash.match(/^#calendar\/([a-z0-9-]+)$/i);
        const calendar = match ? getCalendar(match[1]) : null;
        renderSelection();

        if (!calendar || calendar.enabled === false) {
          detailSignature = "";
          selectionPage.hidden = false;
          calendarPage.hidden = true;
          if (calendar?.enabled === false) {
            window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
            showToast("\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c \u0441\u043a\u043e\u0440\u043e \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f.");
          }
          document.title = "Адвенты — уютный декабрь";
          if (document.body.classList.contains("is-ready")) {
            window.requestAnimationFrame(playEntryAnimation);
          }
          return;
        }

        selectionPage.hidden = true;
        calendarPage.hidden = false;
        renderDetail(calendar);
        if (document.body.classList.contains("is-ready")) {
          window.requestAnimationFrame(playEntryAnimation);
        }
      }

      window.addEventListener("hashchange", renderRoute);
      window.addEventListener("pageshow", () => {
        calendarControllers.forEach((controller) => controller.refresh());
        renderRoute();
      });
      window.addEventListener("storage", (event) => {
        if (calendarState.isProgressKey(event.key)) {
          calendarControllers.forEach((controller) => controller.refresh());
          renderRoute();
        }
      });
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
          calendarControllers.forEach((controller) => controller.refresh());
          renderRoute();
        }
      });

      renderRoute();
      calendarControllers.forEach((controller) => controller.start());
      revealApp();
