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

    /* ================= CONTACT ================= */
    const overlay = document.getElementById("contact-overlay");
    const form = overlay.querySelector("form");
    let widgetId = null;

    window.openContact = function () {
        overlay.style.display = "block";

        if (widgetId === null && window.turnstile) {
            widgetId = turnstile.render(
                form.querySelector(".cf-turnstile"),
                {
                    sitekey: "0x4AAAAAACVFhDVtYjPernwR",
                    size: "invisible"
                }
            );
        }
    };

    window.closeContact = function () {
        overlay.style.display = "none";
        form.reset();
        if (window.turnstile && widgetId !== null) {
            turnstile.reset(widgetId);
        }
    };

    overlay.addEventListener("click", e => {
        if (e.target === overlay) closeContact();
    });

    /* ================= FORM SUBMIT ================= */
    form.addEventListener("submit", e => {
        e.preventDefault();

        if (!window.turnstile || widgetId === null) {
            alert("Verification not ready. Please try again.");
            return;
        }

        turnstile.execute(widgetId, {
            callback: async (token) => {

                const payload = {
                    name: form.querySelector('input[type="text"]').value.trim(),
                    email: form.querySelector('input[type="email"]').value.trim(),
                    phone: form.querySelector('input[type="tel"]').value.trim(),
                    message: form.querySelector("textarea").value.trim(),
                    token
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
            }
        });
    });
});
