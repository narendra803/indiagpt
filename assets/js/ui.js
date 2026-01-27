document.addEventListener("DOMContentLoaded", () => {
    // CHAT
    const chatWidget = document.getElementById("chat-widget");
    const chatFab = document.getElementById("chat-fab");
    const closeChat = document.getElementById("close-chat");

    window.toggleChat = function () {
        chatWidget.style.display =
            chatWidget.style.display === "flex" ? "none" : "flex";
    };

    chatFab.addEventListener("click", window.toggleChat);
    closeChat.addEventListener("click", window.toggleChat);

    // CONTACT MODAL
    const contactOverlay = document.getElementById("contact-overlay");

    window.openContact = function () {
        contactOverlay.style.display = "flex";
    };

    window.closeContact = function () {
        contactOverlay.style.display = "none";
    };

    contactOverlay.addEventListener("click", (e) => {
        if (e.target === contactOverlay) {
            closeContact();
        }
    });
});
