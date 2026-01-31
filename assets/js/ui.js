document.addEventListener("DOMContentLoaded", () => {

    /* ================= CHAT ================= */
    const chatWidget = document.getElementById("chat-widget");
    const chatFab = document.getElementById("chat-fab");
    const closeChat = document.getElementById("close-chat");

    window.toggleChat = function () {
        chatWidget.style.display =
            chatWidget.style.display === "flex" ? "none" : "flex";
    };

    chatFab.addEventListener("click", window.toggleChat);
    closeChat.addEventListener("click", window.toggleChat);

    /* ================= CONTACT MODAL ================= */
    const overlay = document.getElementById("contact-overlay");
    const form = overlay.querySelector("form");

    const nameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const phoneInput = form.querySelector('input[type="tel"]');
    const messageInput = form.querySelector("textarea");

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

    /* ================= MOBILE: DIGITS ONLY ================= */

    phoneInput.addEventListener("input", () => {
        // Remove any non-digit characters
        phoneInput.value = phoneInput.value.replace(/\D/g, "");
    });

    /* ================= SIMPLE VALIDATION HELPERS ================= */

    function isValidEmail(email) {
        if (!email.includes("@")) return false;
        const parts = email.split("@");
        if (parts.length !== 2) return false;
        if (!parts[1].includes(".")) return false;
        return true;
    }

    function isValidMobile(phone) {
        return phone.length === 10;
    }

    /* ================= FORM SUBMIT ================= */

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const message = messageInput.value.trim();

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
