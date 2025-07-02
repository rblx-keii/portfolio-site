document.addEventListener('DOMContentLoaded', () => {

    // --- Carousel Initialization Logic (Reusable) ---
    const initCarousel = (carouselElement) => {
        const slides = carouselElement.querySelectorAll('.carousel-slide');
        const prevButton = carouselElement.querySelector('.carousel-prev');
        const nextButton = carouselElement.querySelector('.carousel-next');
        const dotsContainer = carouselElement.querySelector('.carousel-dots');

        if (slides.length === 0) {
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            if (dotsContainer) dotsContainer.style.display = 'none';
            return; // No slides, no carousel needed
        }

        let currentSlideIndex = 0;

        // Create dots
        if (dotsContainer) { // Ensure dotsContainer exists before manipulating
            dotsContainer.innerHTML = ''; // Clear existing dots
            for (let i = 0; i < slides.length; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => {
                    moveToSlide(i);
                });
                dotsContainer.appendChild(dot);
            }
        }
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : []; // Get dots after creation, check if dotsContainer exists

        // Function to move to a specific slide
        const moveToSlide = (index) => {
            if (index < 0) {
                index = slides.length - 1; // Wrap around to end
            } else if (index >= slides.length) {
                index = 0; // Wrap around to start
            }
            currentSlideIndex = index;
            const slidesContainer = carouselElement.querySelector('.carousel-slides');
            if (slidesContainer) {
                const offset = -currentSlideIndex * 100; // Calculate percentage offset
                slidesContainer.style.transform = `translateX(${offset}%)`;
            }

            // Update active dot
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlideIndex);
            });

            // Handle prev/next button and dots visibility if only 1 slide
            if (slides.length <= 1) {
                if (prevButton) prevButton.style.display = 'none';
                if (nextButton) nextButton.style.display = 'none';
                if (dotsContainer) dotsContainer.style.display = 'none';
            } else {
                if (prevButton) prevButton.style.display = 'block';
                if (nextButton) nextButton.style.display = 'block';
                if (dotsContainer) dotsContainer.style.display = 'flex';
            }

            // Pause all media and reset them, then play/load current slide's media
            slides.forEach((slide, i) => {
                const videoElement = slide.querySelector('video'); // Self-hosted video
                const iframeElement = slide.querySelector('.video-wrapper iframe'); // YouTube iframe

                if (videoElement) {
                    if (i !== currentSlideIndex) {
                        videoElement.pause();
                        videoElement.currentTime = 0; // Reset video to start
                    }
                }

                if (iframeElement) {
                    const youtubeId = iframeElement.dataset.youtubeId;
                    const youtubeEmbedUrl = `https://www.youtube.com/embed/VIDEO_ID${youtubeId}?enablejsapi=1&origin=${window.location.protocol}//${window.location.host}&autoplay=0&rel=0&modestbranding=1`;

                    if (i === currentSlideIndex) {
                        if (iframeElement.src !== youtubeEmbedUrl) {
                            iframeElement.src = youtubeEmbedUrl;
                        }
                    } else {
                        if (iframeElement.src) {
                            iframeElement.src = '';
                        }
                    }
                }
            });
        };

        // Event listeners for prev/next buttons
        if (prevButton) {
            prevButton.addEventListener('click', () => moveToSlide(currentSlideIndex - 1));
        }
        if (nextButton) {
            nextButton.addEventListener('click', () => moveToSlide(currentSlideIndex + 1));
        }

        carouselElement.dataset.currentSlideIndex = currentSlideIndex;
        carouselElement.moveToSlide = moveToSlide;

        moveToSlide(currentSlideIndex);
    };

    // --- Generic Project/Content Display Logic (for full project pages like scripting.html, ui.html, vector.html) ---
    const setupShowcase = async (buttonContainerId, displayContainerId, projectPaths) => {
        const buttonContainer = document.getElementById(buttonContainerId);
        const displayContainer = document.getElementById(displayContainerId);
        const carouselsInitialized = {};

        if (!buttonContainer || !displayContainer) {
            // console.warn(`Showcase containers not found: #${buttonContainerId}, #${displayContainerId}. Skipping setupShowcase.`);
            return; // Exit if elements are not found (e.g., on index.html)
        }

        const fetchPromises = projectPaths.map(path =>
            fetch(path)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error(error);
                    return null;
                })
        );

        const projects = (await Promise.all(fetchPromises)).filter(p => p !== null);

        buttonContainer.innerHTML = '';
        displayContainer.innerHTML = '';

        projects.forEach((project) => {
            const button = document.createElement('button');
            button.classList.add('project-button');
            button.dataset.project = project.id;
            button.textContent = project.title;
            buttonContainer.appendChild(button);

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
                const slide = document.createElement('div');
                slide.classList.add('carousel-slide');

                if (mediaSrc.includes('https://www.youtube.com/embed/VIDEO_ID')) { // Check for YouTube embed URL
                    const youtubeId = mediaSrc.split('/').pop().split('?')[0];
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
                    img.setAttribute('alt', `${project.title} Screenshot ${idx + 1}`);
                    slide.appendChild(img);
                }
                carouselSlides.appendChild(slide);
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

            const projectDescription = document.createElement('div');
            projectDescription.classList.add('project-description');
            projectDescription.innerHTML = `
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <ul>
                    ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <div class="button-center">
                    <a href="${project.demoLink}" class="button small">View on Roblox</a>
                </div>
            `;
            projectContent.appendChild(projectDescription);

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
            if (activeButton) {
                activeButton.classList.add('active');
            }

            const activeContent = document.getElementById(contentId);
            if (activeContent) {
                activeContent.classList.add('active');
                const carouselElement = activeContent.querySelector('.carousel-container');
                if (carouselElement) {
                    if (!carouselsInitialized[contentId]) {
                        initCarousel(carouselElement);
                        carouselsInitialized[contentId] = true;
                    } else {
                        if (carouselElement.moveToSlide) {
                            carouselElement.moveToSlide(0);
                        }
                    }
                }
                // Scroll to the content if there's a hash in the URL and it matches
                if (window.location.hash === `#${contentId}`) {
                    activeContent.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const contentId = button.dataset.project;
                showContent(contentId);
                // Update URL hash without page reload
                history.pushState(null, '', `#${contentId}`);
            });
        });

        // Check if there's a hash in the URL on load
        if (window.location.hash) {
            const initialContentId = window.location.hash.substring(1);
            const initialButton = buttonContainer.querySelector(`.project-button[data-project="${initialContentId}"]`);
            if (initialButton) {
                showContent(initialContentId);
            } else if (buttons.length > 0) {
                // If hash doesn't match a project, but there are projects, show the first one
                showContent(buttons[0].dataset.project);
            }
        } else if (buttons.length > 0) {
            // Otherwise, show the first project content
            showContent(buttons[0].dataset.project);
        }
    };


    // --- NEW: Function for Home Page Previews ---
    const setupHomePreview = async (containerId, previewPaths, detailsPageUrl) => {
        const container = document.getElementById(containerId);
        if (!container) {
            // console.warn(`Preview container not found: #${containerId}. Skipping setupHomePreview.`);
            return;
        }

        container.innerHTML = ''; // Clear any placeholder content

        const fetchPromises = previewPaths.map(path =>
            fetch(path)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch preview ${path}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error(error);
                    return null;
                })
        );

        const projects = (await Promise.all(fetchPromises)).filter(p => p !== null);

        projects.forEach(project => {
            const workItem = document.createElement('div');
            workItem.classList.add('work-item');

            const title = document.createElement('h3');
            title.textContent = project.title;
            workItem.appendChild(title);

            const description = document.createElement('p');
            // Truncate description for preview if too long, or use a specific preview_description field in JSON
            description.textContent = project.description.length > 100 ? project.description.substring(0, 97) + '...' : project.description;
            workItem.appendChild(description);

            // Use the first media item for the preview image
            if (project.media && project.media.length > 0 && !project.media[0].includes('https://www.youtube.com/embed/VIDEO_ID') && !/\.(mp4|webm|ogg)$/i.test(project.media[0])) {
                const img = document.createElement('img');
                img.src = project.media[0];
                img.alt = `${project.title} Preview`;
                workItem.appendChild(img);
            } else if (project.media && project.media.length > 0 && project.media[0].includes('https://www.youtube.com/embed/VIDEO_ID')) {
                // For YouTube videos, display a thumbnail if possible, or a generic video icon
                const img = document.createElement('img');
                const youtubeId = project.media[0].split('/').pop().split('?')[0];
                img.src = `http://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`; // Medium quality thumbnail
                img.alt = `${project.title} Video Preview`;
                img.style.objectFit = 'cover'; // Ensure it covers the area
                workItem.appendChild(img);
            } else {
                // Fallback for self-hosted videos or if no media
                const fallbackImg = document.createElement('img');
                fallbackImg.src = 'assets/images/placeholder-preview.jpg'; // Create a generic placeholder image
                fallbackImg.alt = 'No image preview available';
                workItem.appendChild(fallbackImg);
            }


            const link = document.createElement('a');
            link.href = `${detailsPageUrl}#${project.id}`; // Link to the specific project on the full page
            link.classList.add('button', 'small');
            link.textContent = 'View Details';
            workItem.appendChild(link);

            container.appendChild(workItem);
        });
    };


    // --- Define paths to your project JSON files ---
    const guiProjectPaths = [
        'data/ui/project-1.json',
        'data/ui/project-2.json',
        'data/ui/project-3.json',
        'data/ui/project-4.json'
    ];

    const scriptingProjectPaths = [
        'data/scripts/project-1.json',
        'data/scripts/project-2.json',
        'data/scripts/project-3.json',
        'data/scripts/project-4.json'
    ];

    const vectorProjectPaths = [
        'data/vector/vector-1.json',
        'data/vector/vector-2.json',
        'data/vector/vector-3.json'
    ];


    // --- NEW: Define paths for Home Page Previews (subset of full lists) ---
    // You can choose which projects to feature on the home page preview
    const scriptingPreviewPaths = [
        'data/scripts/project-1.json', // Example: Project Skyblock
        'data/scripts/project-2.json'  // Example: Simulator X
    ];

    const guiPreviewPaths = [
        'data/ui/project-1.json', // Example: Modern UI Pack
        'data/ui/project-2.json'  // Example: Game Menu Redesign
    ];

    const vectorPreviewPaths = [
        'data/vector/vector-1.json', // Example: Abstract Shapes Pack
        'data/vector/vector-2.json'  // Example: Another Vector project
    ];


    // --- Initialize Each Showcase with Dynamic Content from JSON files ---
    // These are for the full project pages (scripting.html, ui.html, vector.html)
    setupShowcase('gui-project-buttons', 'gui-project-display', guiProjectPaths);
    setupShowcase('scripting-project-buttons', 'scripting-project-display', scriptingProjectPaths);
    setupShowcase('vector-project-buttons', 'vector-project-display', vectorProjectPaths); // Will work when vector.html exists


    // --- NEW: Initialize Home Page Previews ---
    // These are for index.html
    setupHomePreview('scripting-preview-grid', scriptingPreviewPaths, 'scripting.html');
    setupHomePreview('gui-preview-grid', guiPreviewPaths, 'ui.html');
    setupHomePreview('vector-preview-grid', vectorPreviewPaths, 'vector.html');


    // --- Dropdown Menu Hover Delay Logic ---
    const dropdown = document.querySelector('.dropdown');
    const dropdownContent = document.querySelector('.dropdown-content');
    let dropdownTimeout;
    const delay = 50;

    if (dropdown && dropdownContent) {
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
});