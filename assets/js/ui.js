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
    const contactOverlay = document.getElementById("contact-overlay");

    // 🔑 MUST be on window for Cloudflare
    window.openContact = function () {
        contactOverlay.style.display = "flex";
    };

    window.closeContact = function () {
        contactOverlay.style.display = "none";
    };

    // Close when clicking outside modal
    contactOverlay.addEventListener("click", (e) => {
        if (e.target === contactOverlay) {
            window.closeContact();
        }
    });
});
