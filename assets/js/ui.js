document.addEventListener("DOMContentLoaded", () => {
    // Bootstraps UI interactions after the DOM is ready.

    /* ================= CHAT ================= */
    // Toggles the floating chat widget.
    const chatWidget = document.getElementById("chat-widget");
    const chatFab = document.getElementById("chat-fab");
    const closeChat = document.getElementById("close-chat");

    if (chatFab && chatWidget && closeChat) {
        window.toggleChat = function () {
            chatWidget.style.display =
                chatWidget.style.display === "flex" ? "none" : "flex";
        };

        chatFab.addEventListener("click", window.toggleChat);
        closeChat.addEventListener("click", window.toggleChat);
    }

    /* ================= CONTACT MODAL ================= */
    // Manages the contact modal open/close state.
    const overlay = document.getElementById("contact-overlay");
    const form = overlay ? overlay.querySelector("form") : null;

    if (!overlay || !form) return; // ⛔ hard stop if contact UI not present

    window.openContact = function () {
        overlay.style.display = "block";
    };

    window.closeContact = function () {
        overlay.style.display = "none";
        form.reset();
    };

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeContact();
    });

    const nameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const phoneInput = form.querySelector('input[type="tel"]');
    const messageInput = form.querySelector("textarea");

    /* ================= MOBILE: DIGITS ONLY (SAFE) ================= */
    // Ensures only digits in the phone field for cleaner submissions.

    if (phoneInput) {
        phoneInput.addEventListener("input", () => {
            const cleaned = phoneInput.value.replace(/[^0-9]/g, "");
            if (phoneInput.value !== cleaned) {
                phoneInput.value = cleaned;
            }
        });
    }

    /* ================= SIMPLE VALIDATION ================= */
    // Minimal client-side checks before sending the request.

    function isValidEmail(email) {
        if (!email) return false;
        const at = email.indexOf("@");
        const dot = email.lastIndexOf(".");
        return at > 0 && dot > at + 1 && dot < email.length - 1;
    }

    function isValidMobile(phone) {
        return phone && phone.length === 10;
    }

    /* ================= FORM SUBMIT ================= */
    // Sends the contact request to the backend API.

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = nameInput ? nameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const phone = phoneInput ? phoneInput.value.trim() : "";
        const message = messageInput ? messageInput.value.trim() : "";

        if (!name || !email || !phone || !message) {
            alert("All fields are required.");
            return;
        }

        if (!isValidEmail(email)) {
            alert("Please enter a valid email (example: name@gmail.com)");
            return;
        }

        if (!isValidMobile(phone)) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, message })
            });

            const result = await res.json();

            if (result.success) {
                alert("Thank you! We’ll contact you soon.");
                closeContact();
            } else {
                alert(result.error || "Submission failed.");
            }
        } catch {
            alert("Server error. Please try again.");
        }
    });
});
