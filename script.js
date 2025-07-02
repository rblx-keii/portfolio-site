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
            // Use querySelector here as .carousel-slides is directly inside carouselElement
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
                if (dotsContainer) dotsContainer.style.display = 'flex'; // Use flex to align dots
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
                    // Correct YouTube embed URL format
                    const youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${window.location.protocol}//${window.location.host}&autoplay=0&rel=0&modestbranding=1`;

                    if (i === currentSlideIndex) {
                        // Load YouTube video for the current slide if it's not already loaded
                        if (iframeElement.src !== youtubeEmbedUrl) {
                            iframeElement.src = youtubeEmbedUrl;
                        }
                    } else {
                        // Unload YouTube video for inactive slides to stop playback
                        if (iframeElement.src) { // Only clear if src is currently set
                            iframeElement.src = ''; // Setting src to empty string stops the video
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

        // Store the carousel state and controls
        carouselElement.dataset.currentSlideIndex = currentSlideIndex; // Store current index on the element
        carouselElement.moveToSlide = moveToSlide; // Attach method to the element for external control

        // Initial setup
        moveToSlide(currentSlideIndex);
    };

    // --- Generic Project/Content Display Logic ---
    const setupShowcase = async (buttonContainerId, displayContainerId, projectPaths) => {
        const buttonContainer = document.getElementById(buttonContainerId);
        const displayContainer = document.getElementById(displayContainerId);
        const carouselsInitialized = {}; // Track initialized carousels for this specific showcase

        if (!buttonContainer || !displayContainer) {
            console.error(`Showcase containers not found: #${buttonContainerId}, #${displayContainerId}`);
            return;
        }

        // Fetch all project data concurrently
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
                    return null; // Return null for failed fetches
                })
        );

        // Filter out any nulls from failed fetches
        const projects = (await Promise.all(fetchPromises)).filter(p => p !== null);

        // Clear existing content
        buttonContainer.innerHTML = '';
        displayContainer.innerHTML = '';

        // Create buttons and project content from data
        projects.forEach((project) => {
            // Create Button
            const button = document.createElement('button');
            button.classList.add('project-button');
            button.dataset.project = project.id;
            button.textContent = project.title;
            buttonContainer.appendChild(button);

            // Create Project Content
            const projectContent = document.createElement('div');
            projectContent.id = project.id;
            projectContent.classList.add('project-content');

            // Project Media (Carousel)
            const projectMedia = document.createElement('div');
            projectMedia.classList.add('project-media');
            const carouselContainer = document.createElement('div');
            carouselContainer.classList.add('carousel-container');
            const carouselSlides = document.createElement('div');
            carouselSlides.classList.add('carousel-slides');

            project.media.forEach((mediaSrc, idx) => {
                const slide = document.createElement('div');
                slide.classList.add('carousel-slide');

                // Check for YouTube embed URL (simplified check, looks for 'youtube.com/embed')
                if (mediaSrc.includes('youtube.com/embed')) {
                    const youtubeId = mediaSrc.split('/').pop().split('?')[0]; // Extract ID from actual embed URL
                    const videoWrapper = document.createElement('div');
                    videoWrapper.classList.add('video-wrapper');
                    const iframe = document.createElement('iframe');
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.dataset.youtubeId = youtubeId; // Store ID for loading later
                    videoWrapper.appendChild(iframe);
                    slide.appendChild(videoWrapper);
                } else if (/\.(mp4|webm|ogg)$/i.test(mediaSrc)) {
                    // This is a self-hosted video
                    const video = document.createElement('video');
                    video.setAttribute('controls', '');
                    video.setAttribute('preload', 'none'); // Don't load video until needed
                    const source = document.createElement('source');
                    source.setAttribute('src', mediaSrc);
                    // Dynamically set type based on extension
                    if (mediaSrc.endsWith('.mp4')) source.setAttribute('type', 'video/mp4');
                    else if (mediaSrc.endsWith('.webm')) source.setAttribute('type', 'video/webm');
                    else if (mediaSrc.endsWith('.ogg')) source.setAttribute('type', 'video/ogg');
                    video.appendChild(source);
                    slide.appendChild(video);
                } else {
                    // Assume it's an image
                    const img = document.createElement('img');
                    img.setAttribute('src', mediaSrc);
                    img.setAttribute('alt', `${project.title} Screenshot ${idx + 1}`);
                    slide.appendChild(img);
                }
                carouselSlides.appendChild(slide);
            });

            if (project.media.length > 0) { // Only add carousel controls if there's any media
                carouselContainer.appendChild(carouselSlides); // Slides container is always needed

                if (project.media.length > 1) { // Only add prev/next/dots if multiple slides
                    const prevButton = document.createElement('button');
                    prevButton.classList.add('carousel-prev');
                    prevButton.innerHTML = '&lt;'; // HTML entity for less-than
                    const nextButton = document.createElement('button');
                    nextButton.classList.add('carousel-next');
                    nextButton.innerHTML = '&gt;'; // HTML entity for greater-than
                    const dotsContainer = document.createElement('div');
                    dotsContainer.classList.add('carousel-dots');

                    carouselContainer.appendChild(prevButton);
                    carouselContainer.appendChild(nextButton);
                    carouselContainer.appendChild(dotsContainer);
                }
            }


            projectMedia.appendChild(carouselContainer);
            // Append projectMedia directly
            projectContent.appendChild(projectMedia);

            // Project Description
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

        // Now, set up event listeners and initial display after all projects are loaded
        const buttons = buttonContainer.querySelectorAll('.project-button');
        const contents = displayContainer.querySelectorAll('.project-content');

        const showContent = (contentId) => {
            buttons.forEach(button => button.classList.remove('active'));
            contents.forEach(content => {
                content.classList.remove('active');
                // Pause any media in hidden content
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
                        // If carousel was already initialized, reset it to the first slide
                        if (carouselElement.moveToSlide) {
                            carouselElement.moveToSlide(0);
                        }
                    }
                }
            }
        };

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const contentId = button.dataset.project;
                showContent(contentId);
            });
        });

        // Initialize the first project's content on page load for this showcase
        if (buttons.length > 0) {
            showContent(buttons[0].dataset.project);
        }
    };

    // --- Define paths to your project JSON files ---
    const guiProjectPaths = [
        // Example paths - update with your actual UI project paths
        'data/ui/project-1.json',
        'data/ui/project-2.json',
        'data/ui/project-3.json',
        'data/ui/project-4.json'
    ];

    const vectorProjectPaths = [
        // Example paths - update with your actual Vector project paths
        'data/vector/project-1.json',
    ];

    const scriptingProjectPaths = [
        // Add all your Scripting project JSON paths here
        'data/scripts/project-1.json',
        'data/scripts/project-2.json',
        'data/scripts/project-3.json',
        'data/scripts/project-4.json'
    ];


    // --- Initialize Each Showcase with Dynamic Content from JSON files ---
    // These calls will fetch data and build the showcases when the page loads.
    setupShowcase('gui-project-buttons', 'gui-project-display', guiProjectPaths);
    setupShowcase('vector-project-buttons', 'vector-project-display', vectorProjectPaths);
    setupShowcase('scripting-project-buttons', 'scripting-project-display', scriptingProjectPaths); // New for scripting!


    // --- Dropdown Menu Hover Delay Logic ---
    const dropdown = document.querySelector('.dropdown');
    const dropdownContent = document.querySelector('.dropdown-content');
    let dropdownTimeout;
    const delay = 50; // 50ms delay

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