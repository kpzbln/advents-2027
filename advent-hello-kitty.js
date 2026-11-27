const calendarState = globalThis.AdventCalendar;
const pageSnow = document.querySelector(".page-snow");
      const pageLoader = document.querySelector(".page-loader");
      let pageLoadingFinished = false;

      function playPageEntryAnimation() {
        const targets = [
          document.querySelector(".calendar-home-link-wrap"),
          document.querySelector(".hello-kitty-logo"),
          document.querySelector(".calendar-progress"),
          document.querySelector(".calendar-info"),
          document.querySelector(".calendar-board"),
          document.querySelector(".page-footer"),
        ].filter(Boolean);

        if (
          window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
          typeof Element.prototype.animate !== "function"
        ) {
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
              delay: index * 32,
              easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
              fill: "both",
            },
          );
        });
      }

      const pageAssetUrls = [
        "img/advent-hello-kitty/hello-kitty-logo.webp",
        "img/advent-hello-kitty/calendar-progress.webp",
        "img/advent-hello-kitty/current-date.webp",
        "img/advent-hello-kitty/next-unlock.webp",
        "img/advent-hello-kitty/calendar-board.webp",
        "img/advent-hello-kitty/calendar-door-opened.webp",
        "img/advent-hello-kitty/gift-box-red.webp",
        "img/advent-hello-kitty/gift-box-green.webp",
        "img/advent-hello-kitty/winter-scene.webp",
      ];

      const finishPageLoading = () => {
        if (!pageLoader || pageLoadingFinished) {
          return;
        }

        pageLoadingFinished = true;
        pageLoader.classList.add("is-hidden");
        document.body.classList.remove("page-is-loading");
        window.requestAnimationFrame(playPageEntryAnimation);
        window.setTimeout(() => pageLoader.remove(), 420);
      };

      const waitForPageResources = async () => {
        await PageResources.ready(pageAssetUrls);
        finishPageLoading();
      };

      waitForPageResources();

      const randomBetween = (min, max) => Math.random() * (max - min) + min;

      const randomizeSnowflake = (flake, initial = false) => {
        const duration = randomBetween(22, 38);
        const delay = initial ? -randomBetween(0, duration) : 0;
        flake.style.setProperty("--left", `${randomBetween(-5, 105)}%`);
        flake.style.setProperty("--size", `${randomBetween(2, 6).toFixed(1)}px`);
        flake.style.setProperty("--opacity", randomBetween(0.25, 0.78).toFixed(2));
        flake.style.setProperty("--duration", `${duration.toFixed(1)}s`);
        flake.style.setProperty("--delay", `${delay.toFixed(1)}s`);
        flake.style.setProperty("--drift-one", `${randomBetween(-34, 34).toFixed(0)}px`);
        flake.style.setProperty("--drift-two", `${randomBetween(-58, 58).toFixed(0)}px`);
        flake.style.setProperty("--drift-three", `${randomBetween(-40, 40).toFixed(0)}px`);
        flake.style.setProperty("--drift-four", `${randomBetween(-70, 70).toFixed(0)}px`);
      };

      const createPageSnow = () => {
        if (!pageSnow) {
          return;
        }

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const flakeCount = window.innerWidth < 600 ? 24 : 36;
        for (let index = 0; index < flakeCount; index += 1) {
          const flake = document.createElement("span");
          flake.className = "page-snowflake";
          randomizeSnowflake(flake, true);
          if (prefersReducedMotion) {
            flake.classList.add("page-snowflake--static");
            flake.style.setProperty(
              "--static-top",
              `${randomBetween(4, 96).toFixed(1)}vh`,
            );
          } else {
            flake.addEventListener("animationiteration", () => {
              randomizeSnowflake(flake);
            });
          }
          pageSnow.append(flake);
        }
      };

      createPageSnow();

      const gifts = globalThis.AdventCalendarData.helloKitty;

const progressText = document.querySelector(".calendar-progress-text");
      let giftDoors = [...document.querySelectorAll("[data-day]")];
      const giftModal = document.querySelector(".gift-modal");
      const giftModalContent = document.querySelector(".gift-modal-content");
      const giftModalClose = document.querySelector(".gift-modal-close");
      const giftDialog = ModalDialog.create({
        overlay: giftModal, dialog: giftModalContent, initialFocus: giftModalClose,
      });
      const giftModalTitle = document.querySelector(".gift-modal-title");
      const giftModalMessage = document.querySelector(".gift-modal-message");
      const giftConfirmation = document.querySelector(".gift-confirmation");
      const giftConfirmationPreview = document.querySelector(
        ".gift-confirmation-preview",
      );
      const giftResult = document.querySelector(".gift-result");
      const giftModalConfirm = document.querySelector(".gift-modal-confirm");
      const giftModalCancel = document.querySelector(".gift-modal-cancel");
      const giftModalImageSource = document.querySelector(
        ".gift-modal-image-source",
      );
      const giftModalImage = document.querySelector(".gift-modal-image");
      const giftModalImageFrame = document.querySelector(
        ".gift-modal-image-frame",
      );
      const giftModalCaption = document.querySelector(".gift-modal-caption");
      const giftModalCategory = document.querySelector(".gift-modal-category");
      const giftModalDay = document.querySelector(".gift-modal-day");
      const giftModalDescription = document.querySelector(
        ".gift-modal-description",
      );
      const calendarHomeLink = document.querySelector(".calendar-home-link");
      const giftImagePlaceholder = document.querySelector(
        ".gift-image-placeholder",
      );
      const calendarController = AdventCalendarController.create("hello-kitty", {
        onRefresh: () => refreshCalendar(true),
      });
      let openedGiftDays = new Set(
        [...calendarController.getOpenedDays()].map(String),
      );
      let activeDoor = null;
      let activeGift = null;
      let imageFallbackAttempted = false;

      const dateLabel = (day) => `${day} декабря`;

      const updateProgress = () => {
        const openedCount = openedGiftDays.size;
        progressText.textContent = `\u041e\u0442\u043a\u0440\u044b\u0442\u043e ${openedCount} \u0438\u0437 24`;
      };

      const saveOpenedGiftDays = () => {
        openedGiftDays = new Set(
          [...calendarController.save(openedGiftDays)].map(String),
        );
      };

      const isGiftAvailable = (day, now = new Date()) =>
        calendarController.isDayAvailable(Number(day), now);

      const updateCalendarMeta = () => {
        const now = new Date();
        document.querySelector(".current-date-text").textContent = new Intl.DateTimeFormat(
          "ru-RU", { day: "numeric", month: "long" },
        ).format(now);
        document.querySelector(".next-unlock-text").textContent =
          openedGiftDays.size === 24 ? "Всё открыто" : calendarState.unlockLabel(
            calendarController.nextUnlock(now), now,
          );
      };

      const makeSemanticDoor = (door) => {
        if (door.tagName === "BUTTON") {
          return door;
        }

        const button = document.createElement("button");
        button.type = "button";
        [...door.attributes].forEach((attribute) => {
          button.setAttribute(attribute.name, attribute.value);
        });
        button.innerHTML = door.innerHTML;
        door.replaceWith(button);
        return button;
      };

      const setDoorAvailable = (door) => {
        const day = door.dataset.day;
        door.classList.remove("calendar-door-locked");
        door.classList.add("calendar-door-available");
        door.disabled = false;
        door.removeAttribute("aria-disabled");
        const shineDelay = ((Number(day) * 0.37) % 5).toFixed(2);
        door.style.setProperty("--shine-delay", `-${shineDelay}s`);
        if (door.tagName === "BUTTON") {
          door.removeAttribute("role");
          door.removeAttribute("tabindex");
        } else {
          door.setAttribute("role", "button");
          door.setAttribute("tabindex", "0");
        }
        door.setAttribute("aria-haspopup", "dialog");
        door.setAttribute("aria-label", `Открыть подарок за ${dateLabel(day)}`);
      };

      const setDoorLocked = (door, now = new Date()) => {
        const day = Number(door.dataset.day);
        door.classList.remove("calendar-door-available", "calendar-door-opened");
        door.classList.add("calendar-door-locked");
        door.disabled = true;
        door.setAttribute("aria-disabled", "true");
        door.removeAttribute("aria-haspopup");
        door.removeAttribute("role");
        door.removeAttribute("tabindex");
        door.setAttribute(
          "aria-label",
          `\u041f\u043e\u0434\u0430\u0440\u043e\u043a \u043f\u043e\u043a\u0430 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u0437\u0430 ${dateLabel(day)}, ${calendarState.unlockLabel(calendarState.unlockDate("hello-kitty", day), now).toLowerCase()}`,
        );
      };

      giftDoors = giftDoors.map((door) =>
        gifts[door.dataset.day] ? makeSemanticDoor(door) : door,
      );

      const setGiftVisual = (door, gift) => {
        door.classList.add("calendar-door-gift");
        door.classList.toggle("calendar-door-stand", gift.category === "Элемент для демонстрации");
        const giftColor = door.querySelector(".gift-box-green") ? "is-green" : "is-red";
        const day = door.dataset.day;
        door.innerHTML =
          `<div class="gift-box-received gift-box-revealed" aria-hidden="true"></div><span class="gift-opened-badge ${giftColor}" aria-hidden="true"><span class="gift-opened-number">${day}</span></span>`;
        const revealedGift = door.firstElementChild;
        revealedGift.style.backgroundImage = `url("${gift.image}")`;
      };

      const markDoorOpened = (door, gift) => {
        door.classList.remove("calendar-door-available");
        door.classList.remove("calendar-door-locked");
        door.classList.add("calendar-door-opened");
        door.disabled = false;
        door.removeAttribute("aria-disabled");
        door.setAttribute(
          "aria-label",
          `Открытый подарок за ${dateLabel(door.dataset.day)}. Открыть снова`,
        );
        setGiftVisual(door, gift);
      };

      const refreshDoors = (now = new Date()) => {
        giftDoors.forEach((door) => {
          const gift = gifts[door.dataset.day];
          if (!gift) return;
          const day = door.dataset.day;
          if (openedGiftDays.has(day)) {
            if (!door.classList.contains("calendar-door-opened")) {
              markDoorOpened(door, gift);
            }
          } else if (isGiftAvailable(day, now)) {
            setDoorAvailable(door);
          } else {
            setDoorLocked(door, now);
          }
        });
      };

      refreshDoors();

      function refreshCalendar(fromController = false) {
        if (!fromController) {
          openedGiftDays = new Set(
            [...calendarController.refresh()].map(String),
          );
        } else {
          openedGiftDays = new Set(
            [...calendarController.getOpenedDays()].map(String),
          );
        }
        const now = new Date();
        refreshDoors(now);
        updateProgress();
        updateCalendarMeta();
      }

      updateProgress();
      updateCalendarMeta();

      const updateModalGift = (gift, day) => {
        giftModalMessage.textContent = `Подарок за ${dateLabel(day)} уже ждёт тебя.`;
        giftModalCaption.textContent = gift.caption;
        giftModalCategory.textContent = gift.category;
        giftModalDay.textContent = `День ${day} · ${dateLabel(day)}`;
        giftModalDescription.textContent = gift.description;
        giftModalImage.hidden = false;
        giftImagePlaceholder.hidden = true;
        imageFallbackAttempted = false;
        giftModalImage.alt = `Подарок за ${dateLabel(day)}`;
        giftModalImage.src = gift.image;
        giftModalImageSource.srcset = gift.image;
      };

      const updateConfirmationPreview = (door) => {
        if (!giftConfirmationPreview || !door) {
          return;
        }

        const day = door.dataset.day;
        const boxClass = door.querySelector(".gift-box-green")
          ? "gift-box-green"
          : "gift-box-red";
        const box = document.createElement("div");
        const dayNumber = document.createElement("div");

        box.className = `gift-confirmation-gift-box ${boxClass}`;
        dayNumber.className = "day-number";
        dayNumber.textContent = day;
        box.append(dayNumber);
        giftConfirmationPreview.replaceChildren(box);
      };

      const closeGiftModal = () => {
        giftDialog.close();
      };

      const showConfirmation = () => {
        updateConfirmationPreview(activeDoor);
        giftConfirmation.hidden = false;
        giftResult.hidden = true;
        giftResult.classList.remove("gift-result-enter");
        giftModalTitle.textContent = "Открыть подарок?";
        giftModalContent.setAttribute(
          "aria-labelledby",
          "gift-confirmation-title",
        );
        giftModalContent.setAttribute("aria-describedby", "gift-confirmation-message");
      };

      const showGift = () => {
        giftConfirmation.hidden = true;
        giftResult.hidden = false;
        giftResult.classList.remove("gift-result-enter");
        requestAnimationFrame(() => {
          giftResult.classList.add("gift-result-enter");
        });
        giftModalContent.setAttribute("aria-labelledby", "gift-modal-caption");
        giftModalContent.setAttribute("aria-describedby", "gift-modal-description");
      };

      const showOpenedGift = (day) => {
        const door = giftDoors.find((candidate) => candidate.dataset.day === day);
        const gift = gifts[day];
        if (!door || !gift || !openedGiftDays.has(day)) {
          return;
        }

        activeDoor = door;
        activeGift = gift;
        updateModalGift(gift, day);
        showGift();
      };

      const openGiftModal = (view, door) => {
        if (!isGiftAvailable(door.dataset.day)) {
          return;
        }
        activeDoor = door;
        activeGift = gifts[door.dataset.day];
        if (view === "confirmation") {
          updateModalGift(activeGift, door.dataset.day);
          showConfirmation();
        } else {
          showOpenedGift(door.dataset.day);
        }
        giftDialog.open(door);
      };

      const revealGift = () => {
        if (!activeDoor || !activeGift) {
          return;
        }

        const day = activeDoor.dataset.day;
        openedGiftDays.add(day);
        markDoorOpened(activeDoor, activeGift);
        activeDoor.classList.add("gift-just-opened");
        window.setTimeout(() => {
          activeDoor?.classList.remove("gift-just-opened");
        }, 900);
        saveOpenedGiftDays();
        updateProgress();
        updateCalendarMeta();
        openGiftModal("gift", activeDoor);
      };

      const playGiftClickShine = (door) => {
        door.classList.remove("gift-clicked");
        void door.offsetWidth;
        door.classList.add("gift-clicked");
        window.setTimeout(() => {
          door.classList.remove("gift-clicked");
        }, 760);
      };

      const handleGiftActivation = (door) => {
        const day = door.dataset.day;
        if (!gifts[day] || !isGiftAvailable(day)) {
          return;
        }

        playGiftClickShine(door);
        openGiftModal(openedGiftDays.has(day) ? "gift" : "confirmation", door);
      };

      giftDoors.forEach((door) => {
        door.addEventListener("click", () => handleGiftActivation(door));
        door.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleGiftActivation(door);
          }
        });
      });

      window.addEventListener("storage", (event) => {
        if (calendarState.isProgressKey(event.key)) {
          refreshCalendar();
        }
      });
      window.addEventListener("pageshow", () => refreshCalendar());
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) refreshCalendar();
      });

      giftModalConfirm.addEventListener("click", revealGift);
      giftModalCancel.addEventListener("click", closeGiftModal);
      giftModalClose.addEventListener("click", closeGiftModal);
      giftModalImage.addEventListener("error", () => {
        if (activeGift && !imageFallbackAttempted) {
          imageFallbackAttempted = true;
          giftModalImageSource.removeAttribute("srcset");
          giftModalImage.src = activeGift.image;
          return;
        }

        giftModalImage.hidden = true;
        giftImagePlaceholder.hidden = false;
        if (activeGift) {
          giftImagePlaceholder.textContent =
            "Изображение этой игрушки пока не добавлено.";
        }
      });
      giftModalImageFrame.addEventListener("click", () => {
        giftResult.classList.remove("gift-result-enter");
        playGiftClickShine(giftModalImageFrame);
      });

      calendarHomeLink?.addEventListener("click", (event) => {
        event.preventDefault();

        let cameFromMainPage = false;
        try {
          const referrerUrl = document.referrer
            ? new URL(document.referrer)
            : null;
          cameFromMainPage = Boolean(
            referrerUrl &&
              referrerUrl.origin === window.location.origin &&
              (referrerUrl.pathname.endsWith("/") ||
                referrerUrl.pathname.endsWith("/index.html")),
          );
        } catch {
          cameFromMainPage = false;
        }

        if (cameFromMainPage && window.history.length > 1) {
          window.history.back();
          return;
        }

        window.location.replace(calendarHomeLink.href);
      });

      calendarController.start();
