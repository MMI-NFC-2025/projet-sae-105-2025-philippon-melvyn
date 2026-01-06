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

// =========================================
// Language Switcher
// =========================================

const langSwitcherBtn = document.querySelector(".lang-switcher__btn");
const langSwitcherMenu = document.querySelector(".lang-switcher__menu");

if (langSwitcherBtn && langSwitcherMenu) {
    function toggleLangMenu() {
        const isExpanded = langSwitcherBtn.getAttribute("aria-expanded") === "true";

        if (isExpanded) {
            langSwitcherBtn.setAttribute("aria-expanded", "false");
            langSwitcherMenu.setAttribute("hidden", "");
        } else {
            langSwitcherBtn.setAttribute("aria-expanded", "true");
            langSwitcherMenu.removeAttribute("hidden");
        }
    }

    // Toggle on button click
    langSwitcherBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleLangMenu();
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".lang-switcher")) {
            langSwitcherBtn.setAttribute("aria-expanded", "false");
            langSwitcherMenu.setAttribute("hidden", "");
        }
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && langSwitcherBtn.getAttribute("aria-expanded") === "true") {
            langSwitcherBtn.setAttribute("aria-expanded", "false");
            langSwitcherMenu.setAttribute("hidden", "");
            langSwitcherBtn.focus();
        }
    });
}


// =========================
// ARCHIVES CAROUSEL
// =========================
function initArchivesCarousel() {
    const page = document.querySelector(".archivesPage");
    if (!page) return;

    const prevBtn = page.querySelector(".archivesCarousel__control--prev");
    const nextBtn = page.querySelector(".archivesCarousel__control--next");
    const slides = Array.from(page.querySelectorAll(".archivesCarousel__slide"));
    const dataItems = Array.from(page.querySelectorAll(".archivesData__item"));

    const detailsTitle = page.querySelector(".archivesDetails__title");
    const detailsText = page.querySelector(".archivesDetails__text");
    const detailValues = Array.from(page.querySelectorAll(".archivesDetails__value"));
    const detailsBtn = page.querySelector(".archivesDetails__button");

    if (!prevBtn || !nextBtn || slides.length === 0 || dataItems.length === 0) return;

    const clampIndex = (i) => {
        const n = slides.length;
        return ((i % n) + n) % n;
    };

    const getDataByIndex = (index) => dataItems.find((el) => Number(el.dataset.index) === index);

    const setActive = (index) => {
        const i = clampIndex(index);

        // slides: show one, hide others
        slides.forEach((slide, idx) => {
            const isActive = idx === i;
            slide.classList.toggle("archivesCarousel__slide--active", isActive);
            slide.hidden = !isActive;
        });

        // details: update from hidden dataset
        const data = getDataByIndex(i);
        if (data) {
            const title = data.querySelector(".archivesData__title")?.textContent?.trim() || "";
            const synopsis = data.querySelector(".archivesData__synopsis")?.textContent?.trim() || "";
            const director = data.querySelector(".archivesData__director")?.textContent?.trim() || "";
            const year = data.querySelector(".archivesData__year")?.textContent?.trim() || "";
            const language = data.querySelector(".archivesData__language")?.textContent?.trim() || "";
            const href = data.querySelector(".archivesData__href")?.textContent?.trim() || "#";

            if (detailsTitle) detailsTitle.textContent = title;
            if (detailsText) detailsText.textContent = synopsis;

            // order in HTML: Réalisateur / Année / Langue
            if (detailValues[0]) detailValues[0].textContent = director;
            if (detailValues[1]) detailValues[1].textContent = year;
            if (detailValues[2]) detailValues[2].textContent = language;

            if (detailsBtn) detailsBtn.setAttribute("href", href);
        }

        // store current index
        page.dataset.archivesIndex = String(i);
    };

    const getCurrentIndex = () => {
        const saved = Number(page.dataset.archivesIndex);
        if (Number.isFinite(saved)) return saved;

        const active = slides.findIndex((s) => s.classList.contains("archivesCarousel__slide--active") && !s.hidden);
        return active >= 0 ? active : 0;
    };

    const goPrev = () => setActive(getCurrentIndex() - 1);
    const goNext = () => setActive(getCurrentIndex() + 1);

    prevBtn.addEventListener("click", goPrev);
    nextBtn.addEventListener("click", goNext);

    // keyboard support (when on this page)
    window.addEventListener("keydown", (e) => {
        // avoid hijacking when typing in inputs
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;

        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
    });

    // init on load based on current active slide
    setActive(getCurrentIndex());
}

// Call it (if your script.js already has a DOMContentLoaded, merge inside it)
document.addEventListener("DOMContentLoaded", () => {
    initArchivesCarousel();
});
