// feedback.js
// Handles: displaying feedback from JSON, and handling new feedback form submission.

import { fetchProjects } from './showcase.js';

const WORKER_URL = "https://discord-proxy.john-regado.workers.dev";

export async function initFeedbackPage() {
    const feedbackContainer = document.getElementById('feedback-container');
    if (!feedbackContainer) return;

    await displayFeedback(feedbackContainer);
    initImageModal();
    initForm();
}

async function displayFeedback(container) {
    const feedbackList = await fetchProjects(['data/feedback.json']);
    const feedbackData = feedbackList[0] || [];

    if (feedbackData.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">No feedback yet. Be the first to leave a review!</p>';
        return;
    }

    feedbackData.sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = feedbackData.map(createFeedbackCardHTML).join('');
}

function createFeedbackCardHTML(feedback) {
    const stars = '&#9733;'.repeat(feedback.rating) + '&#9734;'.repeat(5 - feedback.rating);
    const formattedDate = new Date(feedback.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const imageHTML = feedback.image && feedback.image !== "No screenshot provided"
        ? `<img src="${feedback.image}" alt="Feedback from ${escapeHTML(feedback.name)}" class="proof-image">`
        : '';

    return `
        <div class="feedback-card">
            <div class="feedback-card-header">
                <h4>${escapeHTML(feedback.name)}</h4>
                <div class="stars">${stars}</div>
            </div>
            <p>"${escapeHTML(feedback.message)}"</p>
            ${imageHTML}
            <div class="date">${formattedDate}</div>
        </div>
    `;
}

function initForm() {
    const form = document.getElementById('feedbackForm');
    const ratingInput = document.getElementById('feedbackRating');
    const stars = document.querySelectorAll('.star-rating-container .stars span');
    const responseEl = document.getElementById('feedbackResponse');
    const submitBtn = form.querySelector('button[type="submit"]');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.value;
            ratingInput.value = rating;
            stars.forEach(s => s.classList.remove('selected'));
            star.classList.add('selected');
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = form.name.value.trim();
        const rating = ratingInput.value;
        const message = form.message.value.trim();
        
        // Capture Uploadcare URL
        const screenshotInput = form.querySelector('[name="screenshot"]');
        const imageUrl = screenshotInput ? screenshotInput.value : "";

        if (!name || rating === '0' || !message) {
            showResponse('Please fill out all fields.', 'error');
            return;
        }

        if (submitBtn) submitBtn.disabled = true;
        showResponse('Sending feedback...', 'success');

        const payload = {
            type: "FEEDBACK",
            name,
            rating: parseInt(rating),
            message,
            date: new Date().toISOString().split('T')[0],
            image: imageUrl || "No screenshot provided"
        };

        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Optimistic UI update
                const feedbackContainer = document.getElementById('feedback-container');
                const newCardHTML = createFeedbackCardHTML(payload);
                if (feedbackContainer.querySelector('p')) {
                    feedbackContainer.innerHTML = newCardHTML;
                } else {
                    feedbackContainer.insertAdjacentHTML('afterbegin', newCardHTML);
                }

                showResponse('Thank you! Your feedback will be live in a minute.', 'success');
                form.reset();
                ratingInput.value = '0';
                stars.forEach(s => s.classList.remove('selected'));
                if (window.uploadcare) {
                    uploadcare.Widget(screenshotInput).value(null);
                }
            } else {
                throw new Error("Worker Error");
            }
        } catch (error) {
            showResponse('Failed to send. Please try again later.', 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

function showResponse(message, type) {
    const responseEl = document.getElementById('feedbackResponse');
    responseEl.textContent = message;
    responseEl.style.color = type === 'error' ? '#ff4d4d' : 'inherit';
    responseEl.classList.remove('hidden');
    setTimeout(() => responseEl.classList.add('hidden'), 5000);
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}

function initImageModal() {
    const modal = document.getElementById("imageModal");
    if (!modal) return;
    const modalImg = document.getElementById("modalImage");
    const captionText = document.getElementById("caption");
    const feedbackContainer = document.getElementById('feedback-container');

    feedbackContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('proof-image')) {
            modal.style.display = "block";
            modalImg.src = event.target.src;
            captionText.innerHTML = event.target.alt;
            document.body.style.overflow = 'hidden';
        }
    });

    const closeModal = () => {
        modal.style.display = "none";
        document.body.style.overflow = 'auto';
    };

    const span = document.querySelector(".close-modal");
    if (span) span.onclick = closeModal;
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}