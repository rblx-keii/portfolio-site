// main.js
// Entry point — imports and initializes all modules

import { initNav } from './nav.js';
import { initHeader } from './header.js';
import { setupShowcase, setupHomePreview } from './showcase.js';
import { initContactForm } from './contact.js';

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeader();
    initContactForm();

    // Project data paths
    const guiProjectPaths = [
        'data/ui/project-1.json',
    ];

    const scriptingProjectPaths = [
        'data/scripts/project-1.json',
        'data/scripts/project-2.json',
    ];

    const vectorProjectPaths = [
        'data/vector/project-1.json',
    ];

    // Showcase pages
    setupShowcase('gui-project-buttons', 'gui-project-display', guiProjectPaths);
    setupShowcase('scripting-project-buttons', 'scripting-project-display', scriptingProjectPaths);
    setupShowcase('vector-project-buttons', 'vector-project-display', vectorProjectPaths);

    // Home page preview grids
    setupHomePreview('scripting-preview-grid', scriptingProjectPaths, 'scripting.html');
    setupHomePreview('gui-preview-grid', guiProjectPaths, 'ui.html');
    setupHomePreview('vector-preview-grid', vectorProjectPaths, 'ui.html');
});
