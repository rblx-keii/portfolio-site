// main.js
// Entry point — imports and initializes all modules

import { initNav } from './nav.js';
import { setupShowcase, setupStackedDisplay, setupHomePreview, fetchProjects } from './showcase.js';
import { initContactForm } from './contact.js';

async function main() {
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

	const showcasePaths = [
		'data/snippets/area-unlocking-and-custom-lighting-system.json',
		'data/snippets/trading-system.json',
		'data/snippets/code-system.json',
        'data/snippets/teleport-system.json'
	];

    // Check for vector projects first to initialize nav correctly
    const vectorProjects = await fetchProjects(vectorProjectPaths);
    initNav(vectorProjects.length > 0);

    initContactForm();

    // Showcase pages
    setupShowcase('gui-project-buttons', 'gui-project-display', guiProjectPaths);
    setupShowcase('scripting-project-buttons', 'scripting-project-display', scriptingProjectPaths);
    setupShowcase('vector-project-buttons', 'vector-project-display', vectorProjectPaths);
    setupStackedDisplay('showcase-container', showcasePaths);

    // Home page preview grids
    setupHomePreview('scripting-preview-grid', scriptingProjectPaths, 'scripting.html');
    setupHomePreview('gui-preview-grid', guiProjectPaths, 'ui.html');
    setupHomePreview('vector-preview-grid', vectorProjectPaths, 'ui.html');
}

document.addEventListener('DOMContentLoaded', main);
