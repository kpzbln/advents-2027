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
        ...Array.from(
          { length: 24 },
          (_, index) =>
            `img/advent-hello-kitty/gifts/${String(index + 1).padStart(2, "0")}.webp`,
        ),
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

      const gifts = {
        1: {
          caption: "Hello Kitty в праздничном костюме",
          category: "Фигурка",
          description: "Hello Kitty в красной шапочке и шарфе для зимней коллекции.",
          image: "img/advent-hello-kitty/gifts/01.webp",
          imageWebp: "img/advent-hello-kitty/gifts/01.webp",
        },
        2: {
          caption: "Lala в зимней шапочке",
          category: "Фигурка",
          description: "Нежная Lala в розовом праздничном образе из серии Hello Kitty & Friends.",
          image: "img/advent-hello-kitty/gifts/02.webp",
          imageWebp: "img/advent-hello-kitty/gifts/02.webp",
        },
        3: {
          caption: "Подставка Bitty Pop! для демонстрации",
          category: "Подставка",
          description: "Красный элемент для демонстрации фигурок, который можно складывать друг на друга.",
          image: "img/advent-hello-kitty/gifts/03.webp",
          imageWebp: "img/advent-hello-kitty/gifts/03.webp",
        },
        4: {
          caption: "Kiki в зимней шапочке",
          category: "Фигурка",
          description: "Kiki в голубой зимней шапочке и тёплом праздничном образе.",
          image: "img/advent-hello-kitty/gifts/04.webp",
          imageWebp: "img/advent-hello-kitty/gifts/04.webp",
        },
        5: {
          caption: "Праздничная ёлочка",
          category: "Аксессуар",
          description: "Золотистая ёлочка на подставке для зимней витрины.",
          image: "img/advent-hello-kitty/gifts/05.webp",
          imageWebp: "img/advent-hello-kitty/gifts/05.webp",
        },
        6: {
          caption: "Подставка Bitty Pop! для демонстрации",
          category: "Подставка",
          description: "Красный элемент для демонстрации фигурок, который можно складывать друг на друга.",
          image: "img/advent-hello-kitty/gifts/06.webp",
          imageWebp: "img/advent-hello-kitty/gifts/06.webp",
        },
        7: {
          caption: "Tuxedo Sam в зимнем образе",
          category: "Фигурка",
          description: "Забавный Tuxedo Sam в зимнем костюме и цилиндре.",
          image: "img/advent-hello-kitty/gifts/07.webp",
          imageWebp: "img/advent-hello-kitty/gifts/07.webp",
        },
        8: {
          caption: "Двойная красная подставка Bitty Pop!",
          category: "Подставка",
          description: "Красный элемент для демонстрации двух фигурок, который можно складывать друг на друга.",
          image: "img/advent-hello-kitty/gifts/08.webp",
          imageWebp: "img/advent-hello-kitty/gifts/08.webp",
        },
        9: {
          caption: "Подарочная коробка с бантом",
          category: "Аксессуар",
          description: "Праздничная коробочка для зимней композиции календаря.",
          image: "img/advent-hello-kitty/gifts/09.webp",
          imageWebp: "img/advent-hello-kitty/gifts/09.webp",
        },
        10: {
          caption: "Красный элемент подставки Bitty Pop!",
          category: "Подставка",
          description: "Красный элемент для демонстрации фигурок, который можно складывать друг на друга.",
          image: "img/advent-hello-kitty/gifts/10.webp",
          imageWebp: "img/advent-hello-kitty/gifts/10.webp",
        },
        11: {
          caption: "Chococat в праздничном костюме",
          category: "Фигурка",
          description: "Chococat в зелёном праздничном костюме и зимней шапочке.",
          image: "img/advent-hello-kitty/gifts/11.webp",
          imageWebp: "img/advent-hello-kitty/gifts/11.webp",
        },
        12: {
          caption: "Подставка Bitty Pop! для демонстрации",
          category: "Подставка",
          description: "Красный элемент для демонстрации фигурок, который можно складывать друг на друга.",
          image: "img/advent-hello-kitty/gifts/12.webp",
          imageWebp: "img/advent-hello-kitty/gifts/12.webp",
        },
        13: {
          caption: "My Melody в зимнем образе",
          category: "Фигурка",
          description: "My Melody в тёплой шапочке и праздничной зимней одежде.",
          image: "img/advent-hello-kitty/gifts/13.webp",
          imageWebp: "img/advent-hello-kitty/gifts/13.webp",
        },
        14: {
          caption: "Голубой футляр для брелка",
          category: "Футляр",
          description: "Голубой футляр с Hello Kitty для хранения брелка.",
          image: "img/advent-hello-kitty/gifts/14.webp",
          imageWebp: "img/advent-hello-kitty/gifts/14.webp",
        },
        15: {
          caption: "Красный элемент подставки Bitty Pop!",
          category: "Подставка",
          description: "Красный элемент для демонстрации фигурок, который можно складывать друг на друга.",
          image: "img/advent-hello-kitty/gifts/15.webp",
          imageWebp: "img/advent-hello-kitty/gifts/15.webp",
        },
        16: {
          caption: "Pochacco в костюме ёлочки",
          category: "Фигурка",
          description: "Pochacco в зелёном костюме ёлочки с праздничной звездой.",
          image: "img/advent-hello-kitty/gifts/16.webp",
          imageWebp: "img/advent-hello-kitty/gifts/16.webp",
        },
        17: {
          caption: "Pompompurin в оленьих рожках",
          category: "Фигурка",
          description: "Pompompurin в праздничном образе с оленьими рожками.",
          image: "img/advent-hello-kitty/gifts/17.webp",
          imageWebp: "img/advent-hello-kitty/gifts/17.webp",
        },
        18: {
          caption: "Подставка Bitty Pop! для демонстрации",
          category: "Подставка",
          description: "Красный элемент для демонстрации фигурок, который можно складывать друг на друга.",
          image: "img/advent-hello-kitty/gifts/18.webp",
          imageWebp: "img/advent-hello-kitty/gifts/18.webp",
        },
        19: {
          caption: "Голубой футляр для брелка",
          category: "Футляр",
          description: "Голубой футляр с Hello Kitty для хранения брелка.",
          image: "img/advent-hello-kitty/gifts/19.webp",
          imageWebp: "img/advent-hello-kitty/gifts/19.webp",
        },
        20: {
          caption: "Подставка Bitty Pop! для демонстрации",
          category: "Подставка",
          description: "Красный элемент для демонстрации фигурок, который можно складывать друг на друга.",
          image: "img/advent-hello-kitty/gifts/20.webp",
          imageWebp: "img/advent-hello-kitty/gifts/20.webp",
        },
        21: {
          caption: "Kuromi в костюме оленёнка",
          category: "Фигурка",
          description: "Kuromi в тёплом праздничном костюме маленького оленёнка.",
          image: "img/advent-hello-kitty/gifts/21.webp",
          imageWebp: "img/advent-hello-kitty/gifts/21.webp",
        },
        22: {
          caption: "Подарок с зимним бантом",
          category: "Аксессуар",
          description: "Розовая подарочная коробка со снежинками и праздничным бантом.",
          image: "img/advent-hello-kitty/gifts/22.webp",
          imageWebp: "img/advent-hello-kitty/gifts/22.webp",
        },
        23: {
          caption: "Красная треугольная подставка",
          category: "Подставка",
          description: "Красный элемент для демонстрации фигурок, который можно складывать друг на друга.",
          image: "img/advent-hello-kitty/gifts/23.webp",
          imageWebp: "img/advent-hello-kitty/gifts/23.webp",
        },
        24: {
          caption: "Hello Kitty в зимнем образе",
          category: "Фигурка",
          description: "Hello Kitty в праздничной шапочке и зимнем наряде.",
          image: "img/advent-hello-kitty/gifts/24.webp",
          imageWebp: "img/advent-hello-kitty/gifts/24.webp",
        },
      };

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
      const loadOpenedGiftDays = () => new Set(
        [...calendarState.loadOpenedDays("hello-kitty")].map(String),
      );

      const openedGiftDays = loadOpenedGiftDays();
      let activeDoor = null;
      let activeGift = null;
      let imageFallbackAttempted = false;

      const dateLabel = (day) => `${day} декабря`;

      const updateProgress = () => {
        const openedCount = openedGiftDays.size;
        progressText.textContent = `Собрано ${openedCount} из 24`;
      };

      const saveOpenedGiftDays = () => {
        calendarState.saveOpenedDays("hello-kitty", openedGiftDays);
      };

      const updateCalendarMeta = () => {
        const now = new Date();
        document.querySelector(".current-date-text").textContent = new Intl.DateTimeFormat(
          "ru-RU", { day: "numeric", month: "long" },
        ).format(now);
        document.querySelector(".next-unlock-text").textContent =
          openedGiftDays.size === 24 ? "Всё открыто" : calendarState.unlockLabel(
            calendarState.nextUnlock("hello-kitty", new Set([...openedGiftDays].map(Number)), now), now,
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

      giftDoors = giftDoors.map((door) =>
        gifts[door.dataset.day] ? makeSemanticDoor(door) : door,
      );

      const setGiftVisual = (door, gift) => {
        door.classList.add("calendar-door-gift");
        door.classList.toggle("calendar-door-stand", gift.category === "Подставка");
        door.innerHTML =
          '<div class="gift-box-received gift-box-revealed" aria-hidden="true"></div><span class="gift-opened-mark" aria-hidden="true">✓</span>';
        const revealedGift = door.firstElementChild;
        revealedGift.style.backgroundImage = `url("${gift.imageWebp}")`;
      };

      const markDoorOpened = (door, gift) => {
        door.classList.remove("calendar-door-available");
        door.classList.add("calendar-door-opened");
        door.setAttribute(
          "aria-label",
          `Открытый подарок за ${dateLabel(door.dataset.day)}. Открыть снова`,
        );
        setGiftVisual(door, gift);
      };

      giftDoors.forEach((door) => {
        if (gifts[door.dataset.day]) {
          setDoorAvailable(door);
        }
      });

      giftDoors.forEach((door) => {
        const gift = gifts[door.dataset.day];
        if (gift && openedGiftDays.has(door.dataset.day)) {
          markDoorOpened(door, gift);
        }
      });

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
        giftModalImageSource.srcset = gift.imageWebp;
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
        if (!gifts[day]) {
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
