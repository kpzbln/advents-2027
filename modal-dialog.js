(() => {
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function create({ overlay, dialog, initialFocus }) {
    let isOpen = false;
    let returnFocus = null;
    const background = new Map();
    dialog.setAttribute("tabindex", "-1");

    const isVisible = (element) => element && !element.closest("[hidden], [inert]") &&
      element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden";
    const focusables = () => [...dialog.querySelectorAll(focusableSelector)].filter(isVisible);
    const focusInitial = () => (isVisible(initialFocus) ? initialFocus : focusables()[0] || dialog)
      .focus({ preventScroll: true });

    function open(trigger = document.activeElement) {
      if (!isOpen) {
        returnFocus = trigger;
        // Walk ancestors so a dialog nested inside <main> remains interactive.
        for (let branch = overlay; branch.parentElement; branch = branch.parentElement) {
          for (const sibling of branch.parentElement.children) {
            if (sibling !== branch && !["SCRIPT", "STYLE", "LINK"].includes(sibling.tagName)) {
              background.set(sibling, sibling.inert);
              sibling.inert = true;
            }
          }
          if (branch.parentElement === document.body) break;
        }
        isOpen = true;
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
      }
      focusInitial();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      overlay.classList.remove("is-open");
      for (const [element, wasInert] of background) element.inert = wasInert;
      background.clear();
      document.body.classList.remove("modal-open");
      if (returnFocus?.isConnected && !returnFocus.disabled && !returnFocus.closest("[inert]")) {
        returnFocus.focus({ preventScroll: true });
      }
      overlay.setAttribute("aria-hidden", "true");
      returnFocus = null;
    }

    document.addEventListener("keydown", (event) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === "Tab") {
        const items = focusables();
        const first = items[0] || dialog;
        const last = items[items.length - 1] || dialog;
        if (!items.length || !items.includes(document.activeElement) ||
            (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
      }
    }, true);
    document.addEventListener("focusin", (event) => {
      if (isOpen && !dialog.contains(event.target)) focusInitial();
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });

    return Object.freeze({ open, close, focusInitial });
  }

  globalThis.ModalDialog = Object.freeze({ create });
})();
