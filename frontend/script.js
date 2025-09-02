const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// ✅ Render message (supports code formatting + copy button)
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  // Detect and render code blocks ```lang ... ```
  if (text.includes("```")) {
    const parts = text.split(/```/g);
    parts.forEach((part, i) => {
      if (i % 2 === 0) {
        // Normal text
        if (part.trim()) {
          const p = document.createElement("p");
          p.innerText = part.trim();
          msg.appendChild(p);
        }
      } else {
        // Code block
        const codeWrapper = document.createElement("div");
        codeWrapper.classList.add("code-block");

        const copyBtn = document.createElement("button");
        copyBtn.classList.add("copy-btn");
        copyBtn.innerText = "📋";

        const codeBlock = document.createElement("pre");
        const code = document.createElement("code");

        // Detect language (optional)
        const lines = part.trim().split("\n");
        let lang = "";
        if (lines[0].match(/^[a-zA-Z]+$/)) {
          lang = lines[0];
          lines.shift();
        }

        code.className = lang ? `language-${lang}` : "";
        code.textContent = lines.join("\n");

        codeBlock.appendChild(code);
        codeWrapper.appendChild(copyBtn);
        codeWrapper.appendChild(codeBlock);
        msg.appendChild(codeWrapper);

        // Copy functionality
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(code.textContent);
          copyBtn.innerText = "✅";
          setTimeout(() => (copyBtn.innerText = "📋"), 2000);
        });
      }
    });
  } else {
    msg.innerText = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Reset chat on reload
async function resetChat() {
  try {
    await fetch("http://localhost:3000/reset", { method: "POST" });
    addMessage("Hi there! How can I help you today?", "bot");
  } catch (err) {
    addMessage("⚠️ Error resetting chat.", "bot");
  }
}

// Send user message to backend
async function sendMessage(message) {
  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    addMessage(data.reply || "⚠️ Error: No response", "bot");
  } catch (err) {
    addMessage("⚠️ Error connecting to server", "bot");
  }
}

// Handle send button
sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  await sendMessage(message);
});

// Enter key support
userInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// Run reset on page load
window.addEventListener("load", resetChat);
