// nav.js
// Handles: active nav link highlighting, dropdown hover delay, ui.html scroll-based active link

export function initNav() {
    const currentPath = window.location.pathname.split('/').pop();
    const currentHash = window.location.hash;

    const navLinks = document.querySelectorAll('.nav-links a');
    const worksDropbtn = document.querySelector('.dropdown .dropbtn');

    navLinks.forEach(link => link.classList.remove('active'));
    if (worksDropbtn) {
        worksDropbtn.classList.remove('dropbtn-active');
    }

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        let linkPath = linkHref.split('/').pop().split('#')[0];
        let linkHash = linkHref.includes('#') ? '#' + linkHref.split('#')[1] : '';

        if (linkPath === currentPath) {
            if (currentPath === 'ui.html' && linkPath === 'ui.html') {
                if (linkHash === currentHash) {
                    link.classList.add('active');
                } else if (!currentHash && linkHref === 'ui.html') {
                    link.classList.add('active');
                }
            } else if (!link.classList.contains('dropbtn')) {
                link.classList.add('active');
            }
        }
    });

    if (worksDropbtn) {
        if (currentPath === 'scripting.html' || currentPath === 'ui.html') {
            worksDropbtn.classList.add('dropbtn-active');
        }
    }

    initDropdownHover();
    initUiScrollActiveLink(currentPath);
}

function initDropdownHover() {
    const dropdown = document.querySelector('.dropdown');
    const dropdownContent = document.querySelector('.dropdown-content');
    const delay = 50;
    let dropdownTimeout;

    if (!dropdown || !dropdownContent) return;

    dropdown.addEventListener('mouseenter', () => {
        clearTimeout(dropdownTimeout);
        dropdownTimeout = setTimeout(() => {
            dropdownContent.style.display = 'block';
        }, delay);
    });

    dropdown.addEventListener('mouseleave', () => {
        clearTimeout(dropdownTimeout);
        dropdownTimeout = setTimeout(() => {
            dropdownContent.style.display = 'none';
        }, delay);
    });
}

function initUiScrollActiveLink(currentPath) {
    if (currentPath !== 'ui.html') return;

    const vectorShowcaseSection = document.getElementById('vector-design-showcase');
    const guiLink = document.querySelector('.dropdown-content a[href="ui.html"]');
    const vectorLink = document.querySelector('.dropdown-content a[href="ui.html#vector-design-showcase"]');
    const header = document.querySelector('header');

    if (!vectorShowcaseSection || !guiLink || !vectorLink || !header) return;

    const handleUiScroll = () => {
        const triggerOffset = header.offsetHeight + 20;
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
}
