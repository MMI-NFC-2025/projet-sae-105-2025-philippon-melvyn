// =========================================
// Mobile menu toggle (AQITA)
// Works with: .menu-btn, .menu, .menu__close, .menu__link
// Updates aria-expanded + aria-hidden
// Closes on: close button, ESC, click on backdrop, click on a link
// =========================================

const menuBtn = document.querySelector(".menu-btn");
const menu = document.querySelector(".menu");
const menuClose = document.querySelector(".menu__close");

if (menuBtn && menu && menuClose) {
    const focusableSelector =
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    let lastFocusedElement = null;

    function openMenu() {
        lastFocusedElement = document.activeElement;

        menuBtn.setAttribute("aria-expanded", "true");
        menu.setAttribute("aria-hidden", "false");
        document.body.classList.add("body--noScroll");

        // Focus management: focus close button
        menuClose.focus();
    }

    function closeMenu() {
        menuBtn.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
        document.body.classList.remove("body--noScroll");

        // Return focus to the burger button
        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        } else {
            menuBtn.focus();
        }
    }

    function isOpen() {
        return menu.getAttribute("aria-hidden") === "false";
    }

    // Toggle on burger
    menuBtn.addEventListener("click", () => {
        if (isOpen()) closeMenu();
        else openMenu();
    });

    // Close button
    menuClose.addEventListener("click", closeMenu);

    // Click on backdrop closes (but not inside the panel)
    menu.addEventListener("click", (e) => {
        // If click is on overlay itself (not on the panel content)
        const clickedInsidePanel = e.target.closest(".menu__list");
        if (!clickedInsidePanel) closeMenu();
    });

    // Close on link click
    menu.querySelectorAll(".menu__link").forEach((link) => {
        link.addEventListener("click", () => {
            // On mobile it's expected to close after navigation
            closeMenu();
        });
    });

    // ESC to close
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen()) {
            closeMenu();
        }
    });

    // Simple focus trap inside the open menu
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Tab" || !isOpen()) return;

        const focusables = menu.querySelectorAll(focusableSelector);
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });
}
