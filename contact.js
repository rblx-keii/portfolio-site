// contact.js
// Handles: service selector dropdowns and contact form submission

const ALL_OPTIONS = ["Scripting", "GUI", "Vector", "Others"];

export function initContactForm() {
    const container = document.getElementById("service-container");
    const contactForm = document.getElementById("contactForm");
    const responseEl = document.getElementById("contactResponse");

    if (!container || !contactForm) return;

    // Initialize with the first dropdown
    container.innerHTML = generateSelectHTML(ALL_OPTIONS);
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

    contactForm.addEventListener("submit", (e) => {
        const selected = getSelectedValues(container);

        if (selected.length === 0) {
            e.preventDefault();
            responseEl.classList.remove("hidden");
            responseEl.textContent = "❗ Please select at least one service.";
            return;
        }

        responseEl.classList.add("hidden");

        // Hook this up to backend/Discord later
        // const formData = {
        //   name: contactForm.name.value,
        //   email: contactForm.email.value,
        //   message: contactForm.message.value,
        //   services: selected
        // };
    });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

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
        select.innerHTML = `<option disabled ${!currentValue ? "selected" : ""} value="">Choose a service</option>`;

        ALL_OPTIONS.forEach(opt => {
            if (!selectedValues.includes(opt) || opt === currentValue) {
                const option = document.createElement("option");
                option.value = opt;
                option.textContent = opt;
                if (opt === currentValue) option.selected = true;
                select.appendChild(option);
            }
        });
    });
}

function updateMessageFieldState(container) {
    const messageField = document.getElementById("messageField");
    if (!messageField) return;

    const selected = getSelectedValues(container);
    messageField.disabled = selected.length === 0;
    messageField.placeholder = selected.length === 0
        ? "Please select a service first."
        : "Your Message";
}
