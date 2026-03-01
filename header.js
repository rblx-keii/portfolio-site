// header.js
// Handles: auto-hiding the header after scrolling stops

export function initHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    let scrollTimeout;
    let isMouseOverHeader = false;
    let isHeaderHidden = false;
    let lastScrollYWhenHidden = 0;
    const HIDE_DELAY = 1000;

    const showHeader = () => {
        if (header.style.top !== '0px') {
            header.style.top = '0';
            isHeaderHidden = false;
        }
    };

    const hideHeader = () => {
        if (window.scrollY > 0 && !isMouseOverHeader) {
            if (header.style.top !== `-${header.offsetHeight}px`) {
                header.style.top = `-${header.offsetHeight}px`;
                isHeaderHidden = true;
                lastScrollYWhenHidden = window.scrollY;
            }
        }
    };

    header.addEventListener('mouseenter', () => {
        isMouseOverHeader = true;
        clearTimeout(scrollTimeout);
        showHeader();
    });

    header.addEventListener('mouseleave', () => {
        isMouseOverHeader = false;
        scrollTimeout = setTimeout(hideHeader, HIDE_DELAY);
    });

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const scrollThreshold = viewportHeight / 2.5;

        if (currentScrollY === 0) {
            showHeader();
            clearTimeout(scrollTimeout);
            return;
        }

        if (isHeaderHidden && !isMouseOverHeader) {
            const scrollDelta = Math.abs(currentScrollY - lastScrollYWhenHidden);
            if (scrollDelta >= scrollThreshold) {
                showHeader();
            }
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(hideHeader, HIDE_DELAY);
    });

    if (window.scrollY === 0) {
        showHeader();
    } else {
        setTimeout(hideHeader, 100);
    }
}
