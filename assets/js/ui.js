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
        if (e.target === overlay) {
            closeContact();
        }
    });

    /* ================= FORM SUBMIT ================= */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            name: form.querySelector('input[type="text"]').value.trim(),
            email: form.querySelector('input[type="email"]').value.trim(),
            phone: form.querySelector('input[type="tel"]').value.trim(),
            message: form.querySelector("textarea").value.trim()
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
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
