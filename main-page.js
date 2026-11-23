const TOTAL_DAYS = 24;
      const storagePrefix = "advent-opened-";
      const loadingScreen = document.querySelector("#loading-screen");
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
          status: "available",
          artClass: "calendar-art--hello-kitty",
          note: "Все 24 дня уже доступны для открытия.",
          initialOpened: [],
        },
        {
          id: "payot",
          name: "PAYOT",
          status: "waiting",
          artClass: "calendar-art--payot",
          unlockHour: 6,
          note: "Последний день откроется в 06:00 по местному времени.",
          initialOpened: Array.from({ length: 23 }, (_, index) => index + 1),
        },
        {
          id: "kinder-mix",
          name: "Kinder Mix",
          status: "complete",
          artClass: "calendar-art--kinder-mix",
          note: "Все 24 дня уже открыты.",
          initialOpened: Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1),
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
      const memoryOpenedDays = new Map();
      let toastTimer;

      function waitForImage(url) {
        return new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            if (typeof image.decode === "function") {
              image.decode().catch(() => {}).finally(resolve);
              return;
            }
            resolve();
          };
          image.onerror = resolve;
          image.src = url;
        });
      }

      async function revealApp() {
        const fontPromises = document.fonts
          ? [
              document.fonts.load('700 16px "Nunito"'),
              document.fonts.load('800 38px "Nunito"'),
            ]
          : [];
        const assetPromises = criticalAssets.map(waitForImage);
        const resourcesReady = Promise.allSettled([...fontPromises, ...assetPromises]);

        await resourcesReady;
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
        const targets = entryTargets();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof Element.prototype.animate !== "function") {
          return;
        }
        targets.forEach((element, index) => {
          element.animate(
            [
              { opacity: 0, transform: "translateY(8px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: 340,
              delay: Math.min(index, 12) * 32,
              easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
              fill: "both",
            },
          );
        });
      }

      function getCalendar(id) {
        return calendars.find((calendar) => calendar.id === id);
      }

      function storageKeysFor(calendar) {
        const landingKey = storagePrefix + calendar.id;
        if (calendar.id === "hello-kitty") {
          return ["hello-kitty-opened-gifts", landingKey];
        }
        return [landingKey];
      }

      function getOpenedDays(calendar) {
        if (memoryOpenedDays.has(calendar.id)) {
          return new Set(memoryOpenedDays.get(calendar.id));
        }

        for (const storageKey of storageKeysFor(calendar)) {
          try {
            const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
            if (Array.isArray(stored)) {
              const openedDays = stored
                .map(Number)
                .filter((day) => Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS);
              memoryOpenedDays.set(calendar.id, openedDays);
              return new Set(openedDays);
            }
          } catch {
            // A missing or invalid local value falls back to the next key.
          }
        }

        const initialOpened = [...calendar.initialOpened];
        memoryOpenedDays.set(calendar.id, initialOpened);
        return new Set(initialOpened);
      }

      function saveOpenedDays(calendar, openedDays) {
        const sortedDays = [...openedDays].sort((a, b) => a - b);
        memoryOpenedDays.set(calendar.id, sortedDays);
        try {
          const serializedDays = JSON.stringify(sortedDays);
          storageKeysFor(calendar).forEach((storageKey) => {
            localStorage.setItem(storageKey, serializedDays);
          });
        } catch {
          // Session memory keeps the interaction working when storage is unavailable.
        }
      }

      function nextUnlock(calendar) {
        const date = new Date();
        date.setHours(calendar.unlockHour, 0, 0, 0);
        if (date <= new Date()) {
          date.setDate(date.getDate() + 1);
        }
        return date;
      }

      function waitingLabel(calendar) {
        const unlock = nextUnlock(calendar);
        const today = new Date();
        const dayLabel = unlock.toDateString() === today.toDateString() ? "Сегодня" : "Завтра";
        return `${dayLabel} в ${String(calendar.unlockHour).padStart(2, "0")}:00`;
      }

      function isWaiting(calendar) {
        return calendar.status === "waiting" && new Date() < nextUnlock(calendar);
      }

      function getStatus(calendar, openedDays) {
        if (calendar.status === "complete" || openedDays.size >= TOTAL_DAYS) {
          return { state: "complete", icon: "✓", label: "Всё открыто" };
        }
        if (isWaiting(calendar)) {
          return { state: "waiting", icon: "◷", label: waitingLabel(calendar) };
        }
        return {
          state: "available",
          icon: "✓",
          label: `Можно открыть ${TOTAL_DAYS - openedDays.size}`,
        };
      }

      function cardMarkup(calendar) {
        const openedDays = getOpenedDays(calendar);
        const status = getStatus(calendar, openedDays);
        const calendarHref = calendar.id === "hello-kitty"
          ? "advent-hello-kitty.html"
          : `#calendar/${calendar.id}`;
        return `
          <li>
            <a class="calendar-card" href="${calendarHref}" data-calendar-id="${calendar.id}" aria-label="Открыть календарь ${calendar.name}. ${status.label}. Открыто ${openedDays.size} из ${TOTAL_DAYS}">
              <span class="calendar-art ${calendar.artClass}" aria-hidden="true"></span>
              <span class="calendar-copy">
                <span class="calendar-status" data-state="${status.state}">
                  <span class="calendar-status-icon" aria-hidden="true">${status.icon}</span>
                  <span>${status.label}</span>
                </span>
                <span class="calendar-title">${calendar.name}</span>
                <span class="calendar-progress">
                  <span class="calendar-divider" aria-hidden="true"></span>
                  <span class="calendar-progress-label">Открыто ${openedDays.size} из ${TOTAL_DAYS}</span>
                </span>
              </span>
            </a>
          </li>
        `;
      }

      function renderSelection() {
        calendarList.innerHTML = calendars.map(cardMarkup).join("");
      }

      function isDayOpenable(calendar, day) {
        if (isWaiting(calendar)) {
          return false;
        }
        return day >= 1 && day <= TOTAL_DAYS;
      }

      function renderDetail(calendar) {
        const openedDays = getOpenedDays(calendar);
        const status = getStatus(calendar, openedDays);
        detailTitle.textContent = calendar.name;
        detailSummary.textContent = `${openedDays.size} из ${TOTAL_DAYS} дней открыто`;
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

        if (!calendar) {
          selectionPage.hidden = false;
          calendarPage.hidden = true;
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
      window.setInterval(() => {
        renderSelection();
        if (window.location.hash.startsWith("#calendar/")) {
          const id = window.location.hash.slice("#calendar/".length);
          const calendar = getCalendar(id);
          if (calendar) {
            renderDetail(calendar);
          }
        }
      }, 60_000);

      renderRoute();
      revealApp();
