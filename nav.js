// nav.js
// Handles: active nav link highlighting, dropdown hover delay, ui.html scroll-based active link

export async function initNav(hasVectorProjects) {
    // On page load, check if there are any vector projects. If not, hide the nav link.
    if (!hasVectorProjects) {
        const vectorNavLink = document.querySelector('.nav-links a[href*="#vector-design-showcase"]');
        if (vectorNavLink) {
            vectorNavLink.parentElement.style.display = 'none';
        }
    }

    const currentPath = window.location.pathname.split('/').pop();
    const currentHash = window.location.hash;

    const navLinks = document.querySelectorAll('.nav-links a');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    navLinks.forEach(link => link.classList.remove('active'));
    dropdownToggles.forEach(toggle => toggle.parentElement.classList.remove('open'));

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === '#') return;

        const linkPath = linkHref.split('#')[0].split('/').pop();

        if (linkPath === currentPath) {
            let isActive = false;
            if (currentPath === 'ui.html') {
                const linkHasHash = linkHref.includes('#');
                if (currentHash) { // URL has a hash
                    if (linkHref.endsWith(currentHash)) {
                        isActive = true;
                    }
                } else { // URL does not have a hash
                    if (!linkHasHash) {
                        isActive = true;
                    }
                }
            } else {
                // For all other pages, if path matches, it's active.
                if (linkPath) { // Avoid activating on empty hrefs if any
                    isActive = true;
                }
            }

            if (isActive) {
                link.classList.add('active');
                const parentDropdown = link.closest('.nav-dropdown');
                if (parentDropdown) parentDropdown.classList.add('open');
            }
        }
    });

    // Fetch commission status and create the indicator
    try {
        const response = await fetch('data/status.json');
        if (!response.ok) throw new Error('Status not found');
        const status = await response.json();
        createCommissionWidget(status.open);
    } catch (error) {
        console.error("Could not fetch commission status:", error);
        createCommissionWidget(false); // Default to closed on error
    }

    initUiScrollActiveLink(currentPath);
    initSidebar();
}

function createCommissionWidget(isOpen) {
    const commissionWidget = document.createElement('a');
    commissionWidget.href = 'contact.html';
    commissionWidget.className = 'commission-indicator-widget';
    commissionWidget.innerHTML = `
        <div class="indicator-content">
            <span class="status-dot ${isOpen ? 'open' : 'closed'}"></span>
            <span class="indicator-text">Commissions: ${isOpen ? 'Open' : 'Closed'}</span>
        </div>
        <div class="indicator-hover-modal">
            <h3>Commissions are ${isOpen ? 'Open!' : 'Currently Closed'}</h3>
            <p>${isOpen ? "I'm currently accepting new projects. If you have an idea you'd like to discuss, feel free to get in touch." : "I'm not taking new commissions right now, but feel free to browse my work. Check back later!"}</p>
            ${isOpen ? '<a href="contact.html" class="button small">Contact Me</a>' : ''}
        </div>
    `;
    const wrapper = document.querySelector('.wrapper');
    if (wrapper) wrapper.prepend(commissionWidget);
    else document.body.prepend(commissionWidget);
}

function initUiScrollActiveLink(currentPath) {
    if (currentPath !== 'ui.html') return;

    const vectorShowcaseSection = document.getElementById('vector-design-showcase');
    const guiLink = document.querySelector('.nav-links a[href="ui.html"]');
    const vectorLink = document.querySelector('.nav-links a[href*="#vector-design-showcase"]');

    if (!vectorShowcaseSection || !guiLink || !vectorLink) return;

    const handleUiScroll = () => {
        const triggerOffset = 20;
        const sectionTop = vectorShowcaseSection.getBoundingClientRect().top;

        if (sectionTop <= triggerOffset) {
            guiLink.classList.remove('active');
            vectorLink.classList.add('active');
        } else {
            guiLink.classList.add('active');
            vectorLink.classList.remove('active');
        }
    };

    window.addEventListener('scroll', handleUiScroll, { passive: true });

    // Watch for the 'hidden' class to be added, then disable scroll detection
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (mutation.target.classList.contains('hidden')) {
                    window.removeEventListener('scroll', handleUiScroll);
                    // Ensure the main GUI link is active and vector is not
                    guiLink.classList.add('active');
                    vectorLink.classList.remove('active');
                    observer.disconnect(); // Clean up the observer
                }
            }
        }
    });

    observer.observe(vectorShowcaseSection, { attributes: true });
}

function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const mobileToggleBtn = document.querySelector('.mobile-toggle');
    const toggleIcon = document.querySelector('.sidebar-toggle .toggle-icon');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (!sidebar || !overlay || !toggleBtn || !toggleIcon) return;

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    const setToggleIcon = () => {
        const isExpandedOrOpen = isMobile()
            ? sidebar.classList.contains('open')
            : !sidebar.classList.contains('collapsed');

        toggleIcon.src = isExpandedOrOpen ? 'assets/icons/sb-close.svg' : 'assets/icons/sb-open.svg';
        toggleBtn.setAttribute('aria-label', isExpandedOrOpen ? 'Collapse Menu' : 'Expand Menu');
    };

    const openMobile = () => {
        sidebar.classList.remove('collapsed');
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setToggleIcon();
    };

    const closeMobile = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        setToggleIcon();
    };

    const toggleDesktopCollapsed = () => {
        sidebar.classList.toggle('collapsed');

        const wrapper = document.querySelector('.wrapper');
        if (wrapper) {
            wrapper.style.marginLeft = sidebar.classList.contains('collapsed') ? '80px' : '240px';
        }

        setToggleIcon();
    };

    toggleBtn.addEventListener('click', () => {
        if (isMobile()) {
            closeMobile();
        } else {
            toggleDesktopCollapsed();
        }
    });

    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', openMobile);
    }
    overlay.addEventListener('click', closeMobile);

    navLinks.forEach(link => {
        // Close mobile sidebar on link click, unless it's a dropdown toggle
        if (link.classList.contains('dropdown-toggle')) return;
        link.addEventListener('click', (e) => {
            if (!isMobile()) return;
            closeMobile();
        });
    });

    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggle.parentElement.classList.toggle('open');
        });
    })

    window.addEventListener('resize', () => {
        // when leaving mobile, ensure overlay/lock is cleared
        if (!isMobile()) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            sidebar.classList.remove('open');

            // Resync wrapper margin on resize to desktop
            const wrapper = document.querySelector('.wrapper');
            if (wrapper) {
                wrapper.style.marginLeft = sidebar.classList.contains('collapsed') ? '80px' : '240px';
            }
        }
        setToggleIcon();
    });

    setToggleIcon();
}
