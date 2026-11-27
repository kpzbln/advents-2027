const calendarState = globalThis.AdventCalendar;
const calendarController = AdventCalendarController.create("kinder-mix", {
  onRefresh: () => refreshCalendar(true),
});
const calendarData = globalThis.AdventCalendarData.kinder;
const TOTAL_DAYS = calendarState.totalDays("kinder-mix");
const pageLoader = document.querySelector(".kinder-loader");
const progressText = document.querySelector(".kinder-progress");
const currentDateText = document.querySelector("#kinder-current-date");
const nextUnlockText = document.querySelector("#kinder-next-unlock");
const dayGrid = document.querySelector("#kinder-day-grid");
const sideImage = document.querySelector("#kinder-side-image");
const sideCaption = document.querySelector("#kinder-side-caption");
const sideTabs = [...document.querySelectorAll(".kinder-side-tab")];
const pageAssetUrls = [
  "img/advent-kinder/front-closed.webp",
  "img/advent-kinder/back-closed.webp",
  ...Object.values(calendarData.products).map((product) => product.image),
  ...Object.values(calendarData.days).filter((day) => day.type === "game")
    .map((day) => `img/advent-kinder/qr/${day.qr}`),
];

const modal = document.querySelector(".kinder-modal");
const modalContent = document.querySelector(".kinder-modal-content");
const modalClose = document.querySelector(".kinder-modal-close");
const modalConfirmation = document.querySelector(".kinder-confirmation");
const modalResult = document.querySelector(".kinder-result");
const modalKicker = document.querySelector("#kinder-modal-kicker");
const modalTitle = document.querySelector("#kinder-modal-title");
const modalDescription = document.querySelector("#kinder-modal-description");
const modalConfirm = document.querySelector(".kinder-modal-confirm");
const modalCancel = document.querySelector(".kinder-modal-cancel");
const modalImage = document.querySelector("#kinder-modal-image");
const modalQr = document.querySelector("#kinder-modal-qr");
const modalCategory = document.querySelector("#kinder-modal-category");
const modalResultTitle = document.querySelector("#kinder-modal-result-title");
const modalResultDescription = document.querySelector("#kinder-modal-result-description");
const modalLink = document.querySelector("#kinder-modal-link");
const modalCloseResult = document.querySelector(".kinder-modal-close-result");
const dialog = ModalDialog.create({ overlay: modal, dialog: modalContent, initialFocus: modalClose });

let openedDays = calendarController.getOpenedDays();
let activeDay = null;
let activeData = null;

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });
const dateLabel = (day) => `${day} декабря`;

function getDayData(day) {
  return calendarData.days[day];
}

function getDayLabel(day, now = new Date()) {
  const unlock = calendarState.unlockDate("kinder-mix", day);
  return calendarState.unlockLabel(unlock, now);
}

function refreshProgress() {
  progressText.textContent = `Открыто ${openedDays.size} из ${TOTAL_DAYS}`;
  currentDateText.textContent = dateFormatter.format(new Date());
  nextUnlockText.textContent = openedDays.size >= TOTAL_DAYS
    ? "Всё открыто"
    : calendarState.unlockLabel(calendarController.nextUnlock(), new Date());
}

function dayMarkup(day) {
  const data = getDayData(day);
  const opened = openedDays.has(day);
  const available = calendarController.isDayAvailable(day);
  const kind = data.type;
  const stateLabel = opened
    ? "открыт"
    : available
      ? kind === "game" ? "игра доступна" : "подарок доступен"
      : `откроется ${getDayLabel(day).toLowerCase()}`;
  return `<button class="kinder-day" type="button" data-day="${day}" data-kind="${kind}" data-opened="${opened}" ${available ? "" : "disabled"} aria-label="День ${day}, ${stateLabel}">${day}</button>`;
}

function renderDays() {
  dayGrid.innerHTML = Array.from({ length: TOTAL_DAYS }, (_, index) => dayMarkup(index + 1)).join("");
  dayGrid.querySelectorAll(".kinder-day").forEach((button) => {
    button.addEventListener("click", () => openDay(Number(button.dataset.day), button));
  });
}

function renderSide(side) {
  const front = side === "front";
  sideImage.src = front ? "img/advent-kinder/front-closed.webp" : "img/advent-kinder/back-closed.webp";
  sideImage.alt = front ? "Лицевая сторона календаря Kinder" : "Задняя сторона календаря Kinder";
  sideCaption.textContent = front
    ? "Лицевая сторона календаря Kinder."
    : "Задняя сторона календаря Kinder с праздничной инструкцией.";
  sideTabs.forEach((tab) => {
    const selected = tab.dataset.side === side;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
}

function showConfirmation(day, data, trigger) {
  activeDay = day;
  activeData = data;
  modalConfirmation.hidden = false;
  modalResult.hidden = true;
  modalKicker.textContent = data.type === "game" ? "Игровой день" : "Сладкий подарок";
  modalTitle.textContent = data.type === "game" ? `Игра за ${dateLabel(day)}` : `Открыть подарок за ${dateLabel(day)}?`;
  modalDescription.textContent = data.type === "game"
    ? data.description
    : `Подарок за ${dateLabel(day)} уже ждёт тебя.`;
  modalContent.setAttribute("aria-labelledby", "kinder-modal-title");
  modalContent.setAttribute("aria-describedby", "kinder-modal-description");
  dialog.open(trigger);
}

function showResult(day, data) {
  modalConfirmation.hidden = true;
  modalResult.hidden = false;
  const product = data.type === "gift" ? calendarData.products[data.product] : null;
  modalCategory.textContent = data.type === "game" ? "QR-игра Kinder" : `${product.category} · ${product.quantity}`;
  modalResultTitle.textContent = data.type === "game" ? data.title : product.title;
  modalResultDescription.textContent = data.type === "game"
    ? data.description
    : `Подарок за ${dateLabel(day)} — ${product.quantity}.`;
  modalImage.hidden = data.type !== "gift";
  modalQr.hidden = data.type !== "game";
  modalLink.hidden = data.type !== "game";
  if (data.type === "gift") {
    modalImage.src = product.image;
    modalImage.alt = `${product.title}, ${product.category}`;
  } else {
    modalQr.src = `img/advent-kinder/qr/${data.qr}`;
    modalLink.href = data.url;
  }
  modalContent.setAttribute("aria-labelledby", "kinder-modal-result-title");
  modalContent.setAttribute("aria-describedby", "kinder-modal-result-description");
}

function openDay(day, trigger) {
  if (!calendarController.isDayAvailable(day)) return;
  const data = getDayData(day);
  if (!data) return;
  if (openedDays.has(day)) {
    activeDay = day;
    activeData = data;
    showResult(day, data);
    dialog.open(trigger);
    return;
  }
  showConfirmation(day, data, trigger);
}

function revealDay() {
  if (!activeDay || !activeData) return;
  openedDays = calendarController.save(new Set([...openedDays, activeDay]));
  refreshProgress();
  renderDays();
  showResult(activeDay, activeData);
}

function refreshCalendar(fromController = false) {
  openedDays = fromController ? calendarController.getOpenedDays() : calendarController.refresh();
  refreshProgress();
  renderDays();
}

sideTabs.forEach((tab) => tab.addEventListener("click", () => renderSide(tab.dataset.side)));
modalConfirm.addEventListener("click", revealDay);
modalCancel.addEventListener("click", () => dialog.close());
modalClose.addEventListener("click", () => dialog.close());
modalCloseResult.addEventListener("click", () => dialog.close());
window.addEventListener("storage", (event) => {
  if (calendarState.isProgressKey(event.key)) refreshCalendar();
});
window.addEventListener("pageshow", () => refreshCalendar());
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshCalendar();
});

renderSide("front");
refreshProgress();
renderDays();
calendarController.start();

PageResources.ready(pageAssetUrls).then(() => {
  document.body.classList.remove("kinder-is-loading");
  pageLoader.classList.add("is-hidden");
  window.setTimeout(() => pageLoader.remove(), 360);
});
