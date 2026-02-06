// Chat UI element references for sending and rendering messages.
const messagesDiv = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const wordCountEl = document.getElementById("chat-word-count");
const MAX_WORDS = 100;

// Warn if the chat UI is not present (prevents runtime errors).
if (!messagesDiv || !userInput || !sendBtn || !wordCountEl) {
    console.warn("Chat UI is missing required elements.");
}

function countWords(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function updateWordCount() {
    if (!wordCountEl || !userInput || !sendBtn) return;
    const words = countWords(userInput.value);
    wordCountEl.textContent = `${words}/${MAX_WORDS} words`;
    wordCountEl.style.color = words > MAX_WORDS ? "#dc2626" : "#6b7280";
    sendBtn.disabled = words === 0 || words > MAX_WORDS;
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
if (messagesDiv && userInput && sendBtn && wordCountEl) {
    addMessage(APP_CONFIG.welcomeMessage);
    updateWordCount();
}

// Sends the user's message to the backend and renders the reply.
async function sendMessage() {
    if (!messagesDiv || !userInput || !sendBtn || !wordCountEl) return;
    const text = userInput.value.trim();
    if (!text) return;
    if (countWords(text) > MAX_WORDS) {
        addMessage(`Please keep your message under ${MAX_WORDS} words.`);
        return;
    }

    addMessage(text, true);
    userInput.value = "";
    updateWordCount();
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

    updateWordCount();
}

// Bind UI events once all elements exist.
if (messagesDiv && userInput && sendBtn && wordCountEl) {
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("input", () => {
        updateWordCount();
    });
    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") sendMessage();
    });
}
