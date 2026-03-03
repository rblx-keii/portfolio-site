// contact.js
// Handles: service selector dropdowns and contact form submission

const ALL_OPTIONS = ["Scripting", "GUI", "Vector", "Others"];
const WORKER_URL = "https://discord-proxy.john-regado.workers.dev"; // Your Cloudflare Worker

export function initContactForm() {
    const container = document.getElementById("service-container");
    const contactForm = document.getElementById("contactForm");
    const responseEl = document.getElementById("contactResponse");

    if (!container || !contactForm) return;

    // Check for URL parameters to pre-fill the form
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const projectParam = urlParams.get('project');

    if (serviceParam === 'Order' && projectParam) {
        const messageField = document.getElementById("messageField");
        if (messageField) {
            messageField.value = `I would like to order a copy of the "${decodeURIComponent(projectParam)}" project/system.`;
        }
        // Pre-select "Others"
        container.innerHTML = generateSelectHTML(ALL_OPTIONS);
        const firstSelect = container.querySelector('select');
        if (firstSelect) {
            firstSelect.value = 'Others';
            // Manually trigger change to update UI (add remove button, etc.)
            firstSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    } else {
        // Default initialization
        container.innerHTML = generateSelectHTML(ALL_OPTIONS);
    }
    updateMessageFieldState(container);

    container.addEventListener("change", (e) => {
        if (e.target.tagName !== "SELECT") return;

        const selectedValues = getSelectedValues(container);
        const currentWrapper = e.target.closest(".service-select");

        if (e.target.value && !currentWrapper.querySelector(".remove-service")) {
            const removeBtn = document.createElement("a");
            removeBtn.className = "button alt remove-service";
            removeBtn.innerHTML = "<span>X</span>";
            currentWrapper.appendChild(removeBtn);
        }

        const allSelects = Array.from(container.querySelectorAll(".service-select"));
        const isLast = currentWrapper === allSelects[allSelects.length - 1];
        const availableOptions = ALL_OPTIONS.filter(opt => !selectedValues.includes(opt));

        if (isLast && availableOptions.length > 0) {
            container.insertAdjacentHTML("beforeend", generateSelectHTML(availableOptions));
        }

        updateDropdownOptions(container);
        updateMessageFieldState(container);
    });

    container.addEventListener("click", (e) => {
        const removeBtn = e.target.closest(".remove-service");
        if (!removeBtn) return;

        const wrapper = removeBtn.closest(".service-select");
        const select = wrapper.querySelector("select");
        const allSelects = Array.from(container.querySelectorAll(".service-select"));

        if (wrapper === allSelects[0]) {
            select.selectedIndex = 0;
            allSelects.slice(1).forEach(el => el.remove());
            removeBtn.remove();
        } else {
            wrapper.remove();
        }

        updateDropdownOptions(container);
        updateMessageFieldState(container);
    });

    // ─── Modified Submit Logic ──────────────────────────────────────────────
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const selected = getSelectedValues(container);
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        if (selected.length === 0) {
            responseEl.classList.remove("hidden");
            responseEl.style.color = "#ff4d4d";
            responseEl.textContent = "Please select at least one service.";
            return;
        }

        // Honeypot check — silently succeed so bots don't know they were blocked
        if (document.getElementById("bot_field").value) {
            responseEl.classList.remove("hidden");
            responseEl.textContent = "Message sent successfully!";
            return;
        }

        // Show loading state
        responseEl.classList.remove("hidden");
        responseEl.style.color = "inherit";
        responseEl.textContent = "Sending message...";
        if (submitBtn) submitBtn.disabled = true;

        const payload = {
            name: contactForm.name.value,
            email: contactForm.email.value,
            message: contactForm.querySelector("textarea").value,
            services: selected.join(", "),
        };

        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                responseEl.style.color = "inherit";
                responseEl.textContent = "Message sent successfully!";
                contactForm.reset();
                container.innerHTML = generateSelectHTML(ALL_OPTIONS);
                updateMessageFieldState(container);
            } else {
                const errorText = await response.text();
                console.error("Worker error:", response.status, errorText);
                throw new Error(errorText);
            }
        } catch (error) {
            console.error("Submission error:", error);
            responseEl.style.color = "#ff4d4d";
            responseEl.textContent = "Failed to send. Please try again later.";
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

// ─── Helpers (Stay the same) ────────────────────────────────────────────────

function generateSelectHTML(options) {
    const opts = options.map(opt => `<option value="${opt}">${opt}</option>`).join("");
    return `
        <div class="service-select">
            <select>
                <option disabled selected value="">Choose a service</option>
                ${opts}
            </select>
        </div>
    `;
}

function getSelectedValues(container) {
    return Array.from(container.querySelectorAll("select"))
        .map(select => select.value)
        .filter(val => val && val !== "");
}

function updateDropdownOptions(container) {
    const selects = container.querySelectorAll("select");
    const selectedValues = getSelectedValues(container);

    selects.forEach((select) => {
        const currentValue = select.value;
        const available = ALL_OPTIONS.filter(opt => !selectedValues.includes(opt) || opt === currentValue);
        
        select.innerHTML = `<option disabled ${!currentValue ? "selected" : ""} value="">Choose a service</option>`;
        available.forEach(opt => {
            const option = document.createElement("option");
            option.value = opt;
            option.textContent = opt;
            if (opt === currentValue) option.selected = true;
            select.appendChild(option);
        });
    });
}

function updateMessageFieldState(container) {
    const messageField = document.getElementById("messageField");
    if (!messageField) return;

    const selected = getSelectedValues(container);
    messageField.disabled = selected.length === 0;
    if (messageField.disabled) {
        messageField.placeholder = "Please select a service first.";
    } else if (!messageField.value) { // Don't overwrite pre-filled value
        messageField.placeholder = "Your Message";
    }
}