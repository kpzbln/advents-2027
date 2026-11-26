const calendarState = globalThis.AdventCalendar;
const TOTAL_DAYS = calendarState.TOTAL_DAYS;
const pageLoader = document.querySelector(".page-loader");
const progressText = document.querySelector(".calendar-progress-text");
const currentDateText = document.querySelector("#current-date-text");
const nextUnlockText = document.querySelector("#next-unlock-text");
const giftGrid = document.querySelector("#payot-gift-grid");
const focusPanel = document.querySelector("#payot-focus-panel");
const focusKicker = document.querySelector("#payot-focus-kicker");
const focusTitle = document.querySelector("#payot-focus-title");
const focusStatus = document.querySelector("#payot-focus-status");
const focusAction = document.querySelector("#payot-focus-action");
const focusBox = document.querySelector("#payot-focus-box");
const focusNumber = document.querySelector("#payot-focus-number");
const focusProduct = document.querySelector("#payot-focus-product");
const giftModal = document.querySelector(".payot-gift-modal");
const giftModalContent = document.querySelector(".payot-gift-modal-content");
const giftModalClose = document.querySelector(".payot-gift-modal-close");
const giftConfirmation = document.querySelector(".payot-gift-confirmation");
const giftResult = document.querySelector(".payot-gift-result");
const giftModalMessage = document.querySelector("#payot-gift-modal-message");
const giftModalConfirm = document.querySelector(".payot-gift-modal-confirm");
const giftModalCancel = document.querySelector(".payot-gift-modal-cancel");
const giftModalBox = document.querySelector("#payot-modal-box");
const giftModalNumber = document.querySelector("#payot-modal-number");
const giftModalImage = document.querySelector("#payot-modal-image");
const giftModalImagePlaceholder = document.querySelector("#payot-modal-image-placeholder");
const giftModalTitle = document.querySelector("#payot-modal-title");
const giftModalCategory = document.querySelector("#payot-modal-category");
const giftModalDay = document.querySelector("#payot-modal-day");
const giftModalDescription = document.querySelector("#payot-modal-description");
const calendarHomeLink = document.querySelector(".calendar-home-link");
const giftDialog = ModalDialog.create({
  overlay: giftModal,
  dialog: giftModalContent,
  initialFocus: giftModalClose,
});

const giftFiles = {
  1: ["PAYOT_01_box_front_illustration.webp", "PAYOT_01_SOURCE_30ml_illustration.webp"],
  2: ["PAYOT_02_box_front_illustration.webp", "PAYOT_02_NUE_GELEE_50ml_illustration.webp"],
  3: ["PAYOT_03_box_front_illustration.webp", "PAYOT_03_ROSELIFT_5ml_illustration.webp"],
  4: ["PAYOT_04_box_front_illustration.webp", "PAYOT_04_RITUEL_DOUCEUR_100ml_illustration.webp"],
  5: ["PAYOT_05_box_front_illustration.webp", "PAYOT_05_NEO_SERUM_5ml_illustration.webp"],
  6: ["PAYOT_06_box_front_illustration.webp", "PAYOT_06_PATE_GRISE_10ml_illustration.webp"],
  7: ["PAYOT_07_box_front_illustration.webp", "PAYOT_07_NUE_LOTION_TONIQUE_20ml_illustration.webp"],
  8: ["PAYOT_08_box_front_illustration.webp", "PAYOT_08_STICK_LEVRES_4g_illustration.webp"],
  9: ["PAYOT_09_box_front_corrected_illustration.webp", "PAYOT_09_ESSENTIEL_SHAMPOO_25ml_illustration.webp"],
  10: ["PAYOT_10_box_front_illustration.webp", "PAYOT_10_ESSENTIEL_CONDITIONER_25ml_illustration.webp"],
  11: ["PAYOT_11_box_front_illustration.webp", "PAYOT_11_PATE_GRISE_MASK_15ml_illustration.webp"],
  12: ["PAYOT_12_box_front_illustration.webp", "PAYOT_12_MY_PAYOT_CREME_VITAMINEE_15ml_illustration.webp"],
  13: ["PAYOT_13_box_front_illustration.webp", "PAYOT_13_NUE_MASQUE_PEELING_INTENSE_4ml_illustration.webp"],
  14: ["PAYOT_14_box_front_illustration.webp", "PAYOT_14_RITUEL_DOUCEUR_SCRUB_25ml_illustration.webp"],
  15: ["PAYOT_15_box_front_illustration.webp", "PAYOT_15_SUPREME_EYE_5ml_illustration.webp"],
  16: ["PAYOT_16_box_front_illustration.webp", "PAYOT_16_MY_PAYOT_CLEANSING_MASK_15ml_illustration.webp"],
  17: ["PAYOT_17_box_front_illustration.webp", "PAYOT_17_PATE_GRISE_EMULSION_15ml_illustration.webp"],
  18: ["PAYOT_18_box_front_illustration.webp", "PAYOT_18_RITUEL_DOUCEUR_HAND_CREAM_30ml_illustration.webp"],
  19: ["PAYOT_19_box_front_illustration.webp", "PAYOT_19_MY_PAYOT_HUILE_BONNE_5ml_illustration.webp"],
  20: ["PAYOT_20_box_front_illustration.webp", "PAYOT_20_SOURCE_MASQUE_15ml_illustration.webp"],
  21: ["PAYOT_21_box_front_illustration.webp", "PAYOT_21_LISSE_SLEEPING_CREME_30ml_illustration.webp"],
  22: ["PAYOT_22_box_front_illustration.webp", "PAYOT_22_NUE_EAU_MICELLAIRE_100ml_illustration.webp"],
  23: ["PAYOT_23_box_front_illustration.webp", "PAYOT_23_PATE_GRISE_CLEANSING_GEL_50ml_illustration.webp"],
  24: ["PAYOT_24_box_front_illustration.webp", "PAYOT_24_SOURCE_INFUSION_125ml_illustration.webp"],
};

const giftDetails = {
  1: {
    caption: "SOURCE — увлажняющий крем, 30 мл",
    category: "Увлажнение",
    description: "Адаптогенный увлажняющий крем PAYOT для ежедневного ухода.",
  },
  2: {
    caption: "NUE — очищающий гель, 50 мл",
    category: "Очищение",
    description: "Мягкий очищающий гель для свежего и комфортного ухода за кожей.",
  },
  3: {
    caption: "Roselift — уход для кожи, 5 мл",
    category: "Уход за лицом",
    description: "Мини-формат средства Roselift для ежедневного ухода PAYOT.",
  },
  4: {
    caption: "RITUEL DOUCEUR — средство для ухода, 100 мл",
    category: "Уход за телом",
    description: "Нежное средство из линии RITUEL DOUCEUR для мягкого ухода.",
  },
  5: {
    caption: "NEO-SERUM — сыворотка, 5 мл",
    category: "Сыворотка",
    description: "Концентрированный мини-формат сыворотки PAYOT.",
  },
  6: {
    caption: "PÂTE GRISE — локальный уход, 10 мл",
    category: "Уход за проблемной кожей",
    description: "Средство линии PÂTE GRISE для локального ухода за кожей.",
  },
  7: {
    caption: "NUE — тонизирующий лосьон, 20 мл",
    category: "Тонизирование",
    description: "Освежающий лосьон NUE для завершения этапа очищения.",
  },
  8: {
    caption: "Stick lèvres — бальзам для губ, 4 г",
    category: "Уход за губами",
    description: "Компактный бальзам PAYOT для ежедневного ухода за губами.",
  },
  9: {
    caption: "ESSENTIEL — шампунь, 25 мл",
    category: "Уход за волосами",
    description: "Дорожный формат шампуня ESSENTIEL для мягкого очищения волос.",
  },
  10: {
    caption: "ESSENTIEL — кондиционер, 25 мл",
    category: "Уход за волосами",
    description: "Дорожный формат кондиционера ESSENTIEL для ухода за волосами.",
  },
  11: {
    caption: "PÂTE GRISE — маска, 15 мл",
    category: "Маска",
    description: "Маска PÂTE GRISE для ухода за кожей с несовершенствами.",
  },
  12: {
    caption: "MY PAYOT — витаминный крем, 15 мл",
    category: "Уход за лицом",
    description: "Витаминный крем MY PAYOT для свежего и сияющего вида кожи.",
  },
  13: {
    caption: "NUE — интенсивная пилинг-маска, 4 мл",
    category: "Маска",
    description: "Интенсивная пилинг-маска NUE в компактном формате.",
  },
  14: {
    caption: "RITUEL DOUCEUR — скраб, 25 мл",
    category: "Уход за телом",
    description: "Мягкий скраб RITUEL DOUCEUR для гладкости кожи.",
  },
  15: {
    caption: "SUPREME EYE — уход для глаз, 5 мл",
    category: "Уход за зоной вокруг глаз",
    description: "Мини-формат ухода SUPREME EYE для нежной зоны вокруг глаз.",
  },
  16: {
    caption: "MY PAYOT — очищающая маска, 15 мл",
    category: "Маска",
    description: "Очищающая маска MY PAYOT для ухода за кожей лица.",
  },
  17: {
    caption: "PÂTE GRISE — эмульсия, 15 мл",
    category: "Уход за проблемной кожей",
    description: "Эмульсия PÂTE GRISE для ежедневного ухода за кожей.",
  },
  18: {
    caption: "RITUEL DOUCEUR — крем для рук, 30 мл",
    category: "Уход за руками",
    description: "Питательный крем RITUEL DOUCEUR для мягкости кожи рук.",
  },
  19: {
    caption: "MY PAYOT — масло для сияния кожи, 5 мл",
    category: "Масло",
    description: "Мини-формат масла MY PAYOT для ухоженного и сияющего вида кожи.",
  },
  20: {
    caption: "SOURCE — маска, 15 мл",
    category: "Маска",
    description: "Увлажняющая маска SOURCE для ухода за кожей лица.",
  },
  21: {
    caption: "LISSE — ночной крем, 30 мл",
    category: "Ночной уход",
    description: "Ночной крем LISSE для вечернего ухода за кожей.",
  },
  22: {
    caption: "NUE — мицеллярная вода, 100 мл",
    category: "Очищение",
    description: "Мицеллярная вода NUE для бережного удаления макияжа и загрязнений.",
  },
  23: {
    caption: "PÂTE GRISE — очищающий гель, 50 мл",
    category: "Очищение",
    description: "Очищающий гель PÂTE GRISE для ежедневного ухода за кожей.",
  },
  24: {
    caption: "SOURCE — маска-инфузия, 125 мл",
    category: "Увлажнение",
    description: "Увлажняющее средство SOURCE для насыщенного ухода за кожей.",
  },
};

const gifts = Array.from({ length: TOTAL_DAYS }, (_, index) => {
  const day = index + 1;
  const [box, product] = giftFiles[day];
  return {
    day,
    box: `img/advent-payot/gifts/${box}`,
    product: `img/advent-payot/gifts/${product}`,
    ...giftDetails[day],
  };
});

const isGiftAvailable = (day) => calendarState.isDayAvailable("payot", day, openedDays);

const pageAssetUrls = [
  "img/advent-payot/calendar-progress.webp",
  "img/advent-payot/current-date.webp",
  "img/advent-payot/next-unlock.webp",
];

const loadOpenedDays = () => calendarState.loadOpenedDays("payot");

let openedDays = loadOpenedDays();

const saveOpenedDays = () => {
  calendarState.saveOpenedDays("payot", openedDays);
};

const formatDate = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

const updateCalendarMeta = () => {
  const now = new Date();
  currentDateText.textContent = formatDate.format(now);
  nextUnlockText.textContent = openedDays.size === TOTAL_DAYS
    ? "Всё открыто"
    : calendarState.unlockLabel(calendarState.nextUnlock("payot", openedDays, now), now);
};

const updateProgress = () => {
  progressText.textContent = `Открыто ${openedDays.size} из ${TOTAL_DAYS}`;
};

const getFocusDay = () => calendarState.focusDay("payot", openedDays);

const updateFocusPanel = (day) => {
  const gift = gifts.find((candidate) => candidate.day === day);
  if (!gift || !focusPanel) {
    return;
  }

  const opened = openedDays.has(day);
  const available = isGiftAvailable(day);
  const now = new Date();
  const isToday =
    now.getFullYear() === calendarState.configs.payot.year &&
    now.getMonth() === 11 && now.getDate() === day && day <= TOTAL_DAYS;
  focusPanel.dataset.opened = String(opened);
  focusPanel.dataset.available = String(available);
  focusPanel.dataset.day = String(day);
  focusKicker.textContent = isToday
    ? "Сегодняшнее средство"
    : available
      ? "Ближайшее доступное средство"
      : "Средство пока недоступно";
  focusTitle.textContent = opened ? gift.caption : `Подарок за ${day} декабря`;
  focusStatus.textContent = !available
    ? `Недоступно · день ${day}`
    : opened
    ? `Открыто · день ${day}`
    : `Не открыто · день ${day}`;
  focusBox.src = gift.box;
  focusProduct.src = gift.product;
  focusNumber.textContent = day;
  focusAction.disabled = !available;
  focusAction.textContent = !available
    ? `Откроется ${formatDate.format(calendarState.unlockDate("payot", day))}`
    : opened ? "Посмотреть средство" : isToday ? "Открыть сегодняшний подарок" : "Открыть подарок";
};

let activeDay = null;
let activeCard = null;

const updateModalGift = (gift) => {
  giftModalBox.src = gift.box;
  giftModalBox.alt = `Коробка подарка за ${gift.day} декабря`;
  giftModalNumber.textContent = gift.day;
  giftModalImage.hidden = false;
  giftModalImagePlaceholder.hidden = true;
  giftModalImage.src = gift.product;
  giftModalImage.alt = gift.caption;
  giftModalTitle.textContent = gift.caption;
  giftModalCategory.textContent = gift.category;
  giftModalDay.textContent = `День ${gift.day} · ${gift.day} декабря`;
  giftModalDescription.textContent = gift.description;
};

const showGiftConfirmation = (gift) => {
  giftConfirmation.hidden = false;
  giftResult.hidden = true;
  giftModalContent.setAttribute("aria-labelledby", "payot-confirmation-title");
  giftModalContent.setAttribute("aria-describedby", "payot-gift-modal-message");
  giftModalMessage.textContent = `Подарок за ${gift.day} декабря уже ждёт тебя.`;
};

const showGiftResult = (gift) => {
  giftConfirmation.hidden = true;
  giftResult.hidden = false;
  giftModalContent.setAttribute("aria-labelledby", "payot-modal-title");
  giftModalContent.setAttribute("aria-describedby", "payot-modal-description");
  if (giftModal.classList.contains("is-open")) giftDialog.focusInitial();
};

const openGiftModal = (day, trigger) => {
  const gift = gifts.find((candidate) => candidate.day === day);
  if (!gift || !giftModal || !isGiftAvailable(day)) {
    return;
  }

  activeDay = day;
  activeCard = [...giftGrid.querySelectorAll(".payot-gift-card")]
    .find((card) => Number(card.dataset.day) === day);
  updateModalGift(gift);
  if (openedDays.has(day)) {
    showGiftResult(gift);
  } else {
    showGiftConfirmation(gift);
  }
  giftDialog.open(trigger);
};

const closeGiftModal = () => {
  giftDialog.close();
};

const revealGift = () => {
  if (!activeDay || !isGiftAvailable(activeDay)) {
    return;
  }

  openedDays.add(activeDay);
  saveOpenedDays();
  if (activeCard) updateGiftCard(activeCard);
  updateProgress();
  updateCalendarMeta();
  updateFocusPanel(getFocusDay());
  const gift = gifts.find((candidate) => candidate.day === activeDay);
  if (gift) {
    showGiftResult(gift);
  }
};

const giftStateMarkup = (day) => openedDays.has(day)
  ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg><span>Открыто</span>'
  : isGiftAvailable(day)
    ? "<span>Доступно</span>"
    : `<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg><span>${formatDate.format(calendarState.unlockDate("payot", day))}</span>`;

const updateGiftCard = (card) => {
  const day = Number(card.dataset.day);
  const opened = openedDays.has(day);
  const available = isGiftAvailable(day);
  card.dataset.opened = String(opened);
  card.dataset.available = String(available);
  card.disabled = !available;
  card.setAttribute("aria-disabled", String(!available));
  card.setAttribute("aria-pressed", String(opened));
  card.setAttribute("aria-label", `${opened ? "Открытый подарок" : available ? "Открыть подарок" : "Подарок пока недоступен"} за ${day} декабря${available ? "" : ", открытие в 06:00"}`);
  card.querySelector(".payot-gift-state").innerHTML = giftStateMarkup(day);
};

const giftCardMarkup = (gift) => {
  const opened = openedDays.has(gift.day);
  const available = isGiftAvailable(gift.day);
  const state = !available
    ? "Подарок пока недоступен"
    : opened
      ? "Открытый подарок"
      : "Открыть подарок";
  return `
    <button
      class="payot-gift-card"
      type="button"
      data-day="${gift.day}"
      data-opened="${opened}"
      data-available="${available}"
      style="--attention-delay: -${((gift.day * 0.37) % 5).toFixed(2)}s"
      aria-pressed="${opened}"
      aria-haspopup="dialog"
      aria-disabled="${!available}"
      ${available ? "" : "disabled"}
      aria-label="${state} за ${gift.day} декабря"
    >
      <span class="payot-gift-box-frame" aria-hidden="true">
        <img class="payot-gift-box-image" src="${gift.box}" alt="" loading="lazy" decoding="async" />
        <span class="payot-gift-number">${gift.day}</span>
      </span>
      <span class="payot-gift-product-frame" aria-hidden="true">
        <img class="payot-gift-product-image" src="${gift.product}" alt="" loading="lazy" decoding="async" />
      </span>
      <span class="payot-gift-state" aria-hidden="true">${giftStateMarkup(gift.day)}</span>
    </button>
  `;
};

const renderGiftGrid = () => {
  if (!giftGrid) {
    return;
  }

  giftGrid.innerHTML = gifts.map(giftCardMarkup).join("");
  giftGrid.querySelectorAll(".payot-gift-card").forEach((card) => {
    card.addEventListener("click", () => {
      const day = Number(card.dataset.day);
      openGiftModal(day, card);
    });
  });
};

const finishLoading = () => {
  if (!pageLoader) {
    return;
  }

  pageLoader.classList.add("is-hidden");
  document.body.classList.remove("page-is-loading");
  window.setTimeout(() => pageLoader.remove(), 420);
};

const cameFromMainPage = () => {
  try {
    const referrerUrl = document.referrer ? new URL(document.referrer) : null;
    return Boolean(
      referrerUrl &&
        referrerUrl.origin === window.location.origin &&
        (referrerUrl.pathname.endsWith("/") ||
          referrerUrl.pathname.endsWith("/index.html")),
    );
  } catch {
    return false;
  }
};

calendarHomeLink?.addEventListener("click", (event) => {
  event.preventDefault();
  if (cameFromMainPage() && window.history.length > 1) {
    window.history.back();
    return;
  }
  window.location.replace(calendarHomeLink.href);
});

giftModalConfirm?.addEventListener("click", revealGift);
giftModalCancel?.addEventListener("click", closeGiftModal);
giftModalClose?.addEventListener("click", closeGiftModal);
focusAction.addEventListener("click", () => {
  openGiftModal(Number(focusPanel.dataset.day), focusAction);
});
giftModalImage.addEventListener("error", () => {
  giftModalImage.hidden = true;
  giftModalImagePlaceholder.hidden = false;
});
giftModalImage.addEventListener("load", () => {
  giftModalImage.hidden = false;
  giftModalImagePlaceholder.hidden = true;
});

updateCalendarMeta();
renderGiftGrid();
const focusDay = getFocusDay();
const focusGift = gifts.find((gift) => gift.day === focusDay);
updateFocusPanel(focusDay);
if (focusGift) {
  pageAssetUrls.push(focusGift.box, focusGift.product);
}
updateProgress();

let refreshSignature = "";
const refreshCalendar = () => {
  calendarState.invalidate();
  openedDays = loadOpenedDays();
  const now = new Date();
  const signature = JSON.stringify([
    [...openedDays], now.toDateString(),
    calendarState.nextUnlock("payot", openedDays, now)?.getTime(),
  ]);
  if (signature === refreshSignature) return;
  refreshSignature = signature;
  // Keep the card nodes (and their animation/focus) while refreshing availability.
  giftGrid?.querySelectorAll(".payot-gift-card").forEach(updateGiftCard);
  updateFocusPanel(getFocusDay());
  updateProgress();
  updateCalendarMeta();
};

window.addEventListener("storage", (event) => {
  if (calendarState.isProgressKey(event.key)) refreshCalendar();
});
window.addEventListener("pageshow", refreshCalendar);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshCalendar();
});
window.setInterval(refreshCalendar, 1000);

PageResources.ready(pageAssetUrls).then(finishLoading);
