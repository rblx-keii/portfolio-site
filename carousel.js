// carousel.js
// Handles: carousel initialization and YouTube URL parsing

export function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function initCarousel(carouselElement) {
    const slides = carouselElement.querySelectorAll('.carousel-slide');
    const prevButton = carouselElement.querySelector('.carousel-prev');
    const nextButton = carouselElement.querySelector('.carousel-next');
    const dotsContainer = carouselElement.querySelector('.carousel-dots');

    if (slides.length === 0) {
        if (prevButton) prevButton.style.display = 'none';
        if (nextButton) nextButton.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';
        return;
    }

    let currentSlideIndex = 0;

    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < slides.length; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => moveToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

    const moveToSlide = (index) => {
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        currentSlideIndex = index;

        const slidesContainer = carouselElement.querySelector('.carousel-slides');
        if (slidesContainer) {
            slidesContainer.style.transform = `translateX(${-currentSlideIndex * 100}%)`;
        }

        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlideIndex));

        if (slides.length <= 1) {
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            if (dotsContainer) dotsContainer.style.display = 'none';
        } else {
            if (prevButton) prevButton.style.display = 'block';
            if (nextButton) nextButton.style.display = 'block';
            if (dotsContainer) dotsContainer.style.display = 'flex';
        }

        slides.forEach((slide, i) => {
            const videoElement = slide.querySelector('video');
            const iframeElement = slide.querySelector('.video-wrapper iframe');

            if (videoElement && i !== currentSlideIndex) {
                videoElement.pause();
                videoElement.currentTime = 0;
            }

            if (iframeElement) {
                const youtubeId = iframeElement.dataset.youtubeId;
                const youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${window.location.protocol}//${window.location.host}&autoplay=0&rel=0&modestbranding=1`;

                if (i === currentSlideIndex) {
                    if (iframeElement.src !== youtubeEmbedUrl) {
                        iframeElement.src = youtubeEmbedUrl;
                    }
                } else {
                    if (iframeElement.src) iframeElement.src = '';
                }
            }
        });
    };

    if (prevButton) prevButton.addEventListener('click', () => moveToSlide(currentSlideIndex - 1));
    if (nextButton) nextButton.addEventListener('click', () => moveToSlide(currentSlideIndex + 1));

    carouselElement.dataset.currentSlideIndex = currentSlideIndex;
    carouselElement.moveToSlide = moveToSlide;

    moveToSlide(currentSlideIndex);
}
