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

    /* ================= SIMPLE VALIDATION HELPERS ================= */

    function isValidEmail(email) {
        if (!email.includes("@")) return false;
        const parts = email.split("@");
        if (parts.length !== 2) return false;
        if (!parts[1].includes(".")) return false;
        return true;
    }

    function isValidMobile(phone) {
        if (!/^\d+$/.test(phone)) return false;
        if (phone.length !== 10) return false;
        return true;
    }

    /* ================= FORM SUBMIT ================= */

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = form.querySelector('input[type="text"]').value.trim();
        const email = form.querySelector('input[type="email"]').value.trim();
        const phone = form.querySelector('input[type="tel"]').value.trim();
        const message = form.querySelector("textarea").value.trim();

        if (!name || !email || !phone || !message) {
            alert("All fields are required.");
            return;
        }

        // ✅ SIMPLE, SAFE CHECKS ONLY
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
