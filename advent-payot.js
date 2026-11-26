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

const { giftFiles, giftDetails } = globalThis.AdventCalendarData.payot;

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
let refreshTimer;

function scheduleRefresh() {
  window.clearTimeout(refreshTimer);
  const next = calendarState.nextUnlock("payot", openedDays, new Date());
  if (!next) return;
  const delay = Math.max(next.getTime() - Date.now() + 50, 1000);
  refreshTimer = window.setTimeout(() => {
    refreshCalendar();
    scheduleRefresh();
  }, delay);
}

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
  if (calendarState.isProgressKey(event.key)) {
    refreshCalendar();
    scheduleRefresh();
  }
});
window.addEventListener("pageshow", () => {
  refreshCalendar();
  scheduleRefresh();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    refreshCalendar();
    scheduleRefresh();
  }
});
scheduleRefresh();

PageResources.ready(pageAssetUrls).then(finishLoading);
