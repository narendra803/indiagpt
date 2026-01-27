document.addEventListener("DOMContentLoaded", () => {
    const chatWidget = document.getElementById("chat-widget");
    const chatFab = document.getElementById("chat-fab");
    const closeBtn = document.getElementById("close-chat");

    // 🔑 Expose globally so HTML onclick works
    window.toggleChat = function () {
        const isOpen = chatWidget.style.display === "flex";
        chatWidget.style.display = isOpen ? "none" : "flex";
    };

    // Floating button
    chatFab.addEventListener("click", window.toggleChat);

    // Close button inside chat
    closeBtn.addEventListener("click", window.toggleChat);
});
