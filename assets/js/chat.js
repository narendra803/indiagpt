const messagesDiv = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

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

addMessage(APP_CONFIG.welcomeMessage);

async function sendMessage() {
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

sendBtn.onclick = sendMessage;
userInput.oninput = () => sendBtn.disabled = !userInput.value.trim();
userInput.onkeypress = e => {
    if (e.key === "Enter") sendMessage();
};
