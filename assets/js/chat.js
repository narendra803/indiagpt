// Chat UI element references for sending and rendering messages.
const messagesDiv = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Warn if the chat UI is not present (prevents runtime errors).
if (!messagesDiv || !userInput || !sendBtn) {
    console.warn("Chat UI is missing required elements.");
}

// Renders a single message bubble in the chat transcript.
function addMessage(text, isUser = false) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = isUser ? "flex-end" : "flex-start";

    const bubble = document.createElement("div");
    bubble.textContent = text;
    bubble.style.padding = "12px 16px";
    bubble.style.borderRadius = "16px";
    bubble.style.maxWidth = "80%";
    bubble.style.marginBottom = "8px";
    bubble.style.background = isUser ? "#FF9933" : "#ffffff";
    bubble.style.color = isUser ? "#ffffff" : "#000000";

    row.appendChild(bubble);
    messagesDiv.appendChild(row);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Seed the chat with a welcome message when ready.
if (messagesDiv && userInput && sendBtn) {
    addMessage(APP_CONFIG.welcomeMessage);
}

// Sends the user's message to the backend and renders the reply.
async function sendMessage() {
    if (!messagesDiv || !userInput || !sendBtn) return;
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, true);
    userInput.value = "";
    sendBtn.disabled = true;

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text }),
        });

        const data = await res.json();
        addMessage(data.reply || "Thanks! We’ll contact you soon.");
    } catch {
        addMessage("Sorry, something went wrong.");
    }

    sendBtn.disabled = false;
}

// Bind UI events once all elements exist.
if (messagesDiv && userInput && sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("input", () => {
        sendBtn.disabled = !userInput.value.trim();
    });
    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") sendMessage();
    });
}
