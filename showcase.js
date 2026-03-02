// showcase.js
// Handles: fetching project JSON, rendering showcase tabs, rendering home preview grids

import { getYouTubeId, initCarousel } from './carousel.js';

export async function setupShowcase(buttonContainerId, displayContainerId, projectPaths) {
    const buttonContainer = document.getElementById(buttonContainerId);
    const displayContainer = document.getElementById(displayContainerId);
    const carouselsInitialized = {};

    if (!buttonContainer || !displayContainer) return;

    const projects = await fetchProjects(projectPaths);

    const section = buttonContainer.closest('section') || displayContainer.closest('section');
    if (section) {
        const isHidden = projects.length === 0;
        section.classList.toggle('hidden', isHidden);

        if (isHidden && buttonContainerId === 'vector-project-buttons') {
            const vectorNavLink = document.querySelector('.nav-links a[href*="#vector-design-showcase"]');
            if (vectorNavLink) vectorNavLink.parentElement.style.display = 'none';
        }
    }
    if (projects.length === 0) return;

    buttonContainer.innerHTML = '';
    displayContainer.innerHTML = '';

    projects.forEach((project) => {
        // --- Button ---
        const button = document.createElement('button');
        button.classList.add('project-button');
        button.dataset.project = project.id;
        button.textContent = project.title;
        buttonContainer.appendChild(button);

        // --- Content panel ---
        const projectContent = document.createElement('div');
        projectContent.id = project.id;
        projectContent.classList.add('project-content');

        const projectMedia = document.createElement('div');
        projectMedia.classList.add('project-media');
        const carouselContainer = document.createElement('div');
        carouselContainer.classList.add('carousel-container');
        const carouselSlides = document.createElement('div');
        carouselSlides.classList.add('carousel-slides');

        project.media.forEach((mediaSrc, idx) => {
            carouselSlides.appendChild(createMediaSlide(mediaSrc, project.title, idx));
        });

        if (project.media.length > 0) {
            carouselContainer.appendChild(carouselSlides);

            if (project.media.length > 1) {
                const prevButton = document.createElement('button');
                prevButton.classList.add('carousel-prev');
                prevButton.innerHTML = '&lt;';
                const nextButton = document.createElement('button');
                nextButton.classList.add('carousel-next');
                nextButton.innerHTML = '&gt;';
                const dotsContainer = document.createElement('div');
                dotsContainer.classList.add('carousel-dots');

                carouselContainer.appendChild(prevButton);
                carouselContainer.appendChild(nextButton);
                carouselContainer.appendChild(dotsContainer);
            }
        }

        projectMedia.appendChild(carouselContainer);
        projectContent.appendChild(projectMedia);
        projectContent.appendChild(createProjectDescription(project));
        displayContainer.appendChild(projectContent);
    });

    const buttons = buttonContainer.querySelectorAll('.project-button');
    const contents = displayContainer.querySelectorAll('.project-content');

    const showContent = (contentId) => {
        buttons.forEach(button => button.classList.remove('active'));
        contents.forEach(content => {
            content.classList.remove('active');
            content.querySelectorAll('video').forEach(video => {
                video.pause();
                video.currentTime = 0;
            });
            content.querySelectorAll('.video-wrapper iframe').forEach(iframe => {
                if (iframe.src) iframe.src = '';
            });
        });

        const activeButton = buttonContainer.querySelector(`.project-button[data-project="${contentId}"]`);
        if (activeButton) activeButton.classList.add('active');

        const activeContent = document.getElementById(contentId);
        if (activeContent) {
            activeContent.classList.add('active');
            const carouselElement = activeContent.querySelector('.carousel-container');
            if (carouselElement) {
                if (!carouselsInitialized[contentId]) {
                    initCarousel(carouselElement);
                    carouselsInitialized[contentId] = true;
                } else if (carouselElement.moveToSlide) {
                    carouselElement.moveToSlide(0);
                }
            }
            if (window.location.hash === `#${contentId}`) {
                activeContent.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const contentId = button.dataset.project;
            showContent(contentId);
            history.pushState(null, '', `#${contentId}`);
        });
    });

    if (window.location.hash) {
        const initialContentId = window.location.hash.substring(1);
        const initialButton = buttonContainer.querySelector(`.project-button[data-project="${initialContentId}"]`);
        if (initialButton) {
            showContent(initialContentId);
        } else if (buttons.length > 0) {
            showContent(buttons[0].dataset.project);
        }
    } else if (buttons.length > 0) {
        showContent(buttons[0].dataset.project);
    }
}

export async function setupHomePreview(containerId, previewPaths, detailsPageUrl) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const projects = await fetchProjects(previewPaths);

    const section = container.closest('section');
    if (section) section.classList.toggle('hidden', projects.length === 0);
    if (projects.length === 0) return;

    projects.forEach(project => {
        const workItem = document.createElement('div');
        workItem.classList.add('work-item');

        const title = document.createElement('h3');
        title.textContent = project.title;
        workItem.appendChild(title);

        const description = document.createElement('p');
        description.textContent = project.description.length > 100
            ? project.description.substring(0, 97) + '...'
            : project.description;
        workItem.appendChild(description);

        const firstMedia = project.media && project.media.length > 0 ? project.media[0] : null;
        const previewYoutubeId = firstMedia ? getYouTubeId(firstMedia) : null;

        const img = document.createElement('img');
        if (previewYoutubeId) {
            img.src = `https://img.youtube.com/vi/${previewYoutubeId}/mqdefault.jpg`;
            img.alt = `${project.title} Video Preview`;
            img.style.objectFit = 'cover';
        } else if (firstMedia && !/\.(mp4|webm|ogg)$/i.test(firstMedia)) {
            img.src = firstMedia;
            img.alt = `${project.title} Preview`;
        } else {
            img.src = 'assets/images/placeholder-preview.jpg';
            img.alt = 'No image preview available';
        }
        workItem.appendChild(img);

        const link = document.createElement('a');
        link.href = `${detailsPageUrl}#${project.id}`;
        link.classList.add('button', 'small');
        link.textContent = 'View Details';

        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = project.id;
            window.location.href = link.href;
            setTimeout(() => {
                const targetElement = document.getElementById(targetId);
                if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        });

        workItem.appendChild(link);
        container.appendChild(workItem);
    });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchProjects(paths) {
    const fetchPromises = paths.map(path =>
        fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
                return response.json();
            })
            .catch(error => {
                console.error(error);
                return null;
            })
    );
    return (await Promise.all(fetchPromises)).filter(p => p !== null && !p.hidden);
}

function createMediaSlide(mediaSrc, projectTitle, idx) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');

    const youtubeId = getYouTubeId(mediaSrc);
    if (youtubeId) {
        const videoWrapper = document.createElement('div');
        videoWrapper.classList.add('video-wrapper');
        const iframe = document.createElement('iframe');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.dataset.youtubeId = youtubeId;
        videoWrapper.appendChild(iframe);
        slide.appendChild(videoWrapper);
    } else if (/\.(mp4|webm|ogg)$/i.test(mediaSrc)) {
        const video = document.createElement('video');
        video.setAttribute('controls', '');
        video.setAttribute('preload', 'none');
        const source = document.createElement('source');
        source.setAttribute('src', mediaSrc);
        if (mediaSrc.endsWith('.mp4')) source.setAttribute('type', 'video/mp4');
        else if (mediaSrc.endsWith('.webm')) source.setAttribute('type', 'video/webm');
        else if (mediaSrc.endsWith('.ogg')) source.setAttribute('type', 'video/ogg');
        video.appendChild(source);
        slide.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.setAttribute('src', mediaSrc);
        img.setAttribute('alt', `${projectTitle} Screenshot ${idx + 1}`);
        slide.appendChild(img);
    }

    return slide;
}

function createProjectDescription(project) {
    const projectDescription = document.createElement('div');
    projectDescription.classList.add('project-description');

    const tagsHTML = project.tags && project.tags.length > 0
        ? `<div class="project-tags">
            ${project.tags.map(tag => {
                let style = '';
                if (tag.filled) {
                    style = `background-color: ${tag.color}; color: white;`;
                } else if (tag.outline) {
                    style = `border: 2px solid ${tag.color}; color: ${tag.color}; background-color: transparent;`;
                } else {
                    style = `background-color: #333; color: #eee;`;
                }
                return `<span class="tag" style="${style}">${tag.text}</span>`;
            }).join(' ')}
           </div>`
        : '';

    const featuresHTML = project.features && project.features.length > 0
        ? `<h4>Features:</h4><ul>${project.features.map(f => `<li>${f}</li>`).join('')}</ul>`
        : '';

    projectDescription.innerHTML = `
        <div class="project-title-and-tags">
            <h3>${project.title}</h3>
            ${tagsHTML}
        </div>
        <p>${project.description}</p>
        ${featuresHTML}
        <div class="button-center">
            <a href="pricing.html" class="button small">Check Pricing</a>
        </div>
    `;

    return projectDescription;
}
