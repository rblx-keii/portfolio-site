// main.js
// Entry point — imports and initializes all modules

import { initNav } from './nav.js';
import { setupShowcase, setupStackedDisplay, setupHomePreview, fetchProjects } from './showcase.js';
import { initContactForm } from './contact.js';
import { initFeedbackPage } from './feedback.js';

function buildPaths(category, ids) {
    if (!ids || !Array.isArray(ids)) return [];

    return ids.map(id => `data/${category}/${id}.json`);
}

async function main() {

    const directory = await fetch("data/directory.json").then(r => r.json());

    const guiProjectPaths = buildPaths("ui", directory.ui);
    const scriptingProjectPaths = buildPaths("scripts", directory.scripts);
    const vectorProjectPaths = buildPaths("vector", directory.vector);
    const showcasePaths = buildPaths("snippets", directory.snippets);

    const vectorProjects = await fetchProjects(vectorProjectPaths);
    initNav(vectorProjects.length > 0);

    initFeedbackPage();
    initContactForm();

    setupShowcase('gui-project-buttons', 'gui-project-display', guiProjectPaths);
    setupShowcase('scripting-project-buttons', 'scripting-project-display', scriptingProjectPaths);
    setupShowcase('vector-project-buttons', 'vector-project-display', vectorProjectPaths);

    setupStackedDisplay('showcase-container', showcasePaths);

    setupHomePreview('scripting-preview-grid', scriptingProjectPaths, 'scripting.html');
    setupHomePreview('gui-preview-grid', guiProjectPaths, 'ui.html');
    setupHomePreview('vector-preview-grid', vectorProjectPaths, 'ui.html');
}

document.addEventListener('DOMContentLoaded', main);
