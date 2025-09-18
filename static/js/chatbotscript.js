const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let allChats = []; // Array to store chat history

const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("themeColor");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const savedChats = localStorage.getItem("all-chats");
    if (savedChats) {
        allChats = JSON.parse(savedChats);
        renderChats();
    } else {
        allChats = [];
        chatContainer.innerHTML = `<div class="default-text">
                                    <h1>AI Health Diagnosing ChatBot</h1>
                                    <p>Start a conversation and explore the power of AI Health Diagnosing ChatBot.<br> Your chat history will be displayed here.</p>
                                </div>`;
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const saveChatsToLocalStorage = () => {
    localStorage.setItem("all-chats", JSON.stringify(allChats));
};

const renderChats = () => {
    chatContainer.innerHTML = ''; // Clear current chat display
    if (allChats.length === 0) {
        chatContainer.innerHTML = `<div class="default-text">
                                    <h1>AI Health Diagnosing ChatBot</h1>
                                    <p>Start a conversation and explore the power of AI Health Diagnosing ChatBot.<br> Your chat history will be displayed here.</p>
                                </div>`;
    } else {
        allChats.forEach(chat => {
            const html = `
                <div class="chat-content">
                    <div class="chat-details">
                        <img src="/static/images/${chat.sender === 'user' ? 'user.jpg' : 'chatbot.jpg'}" alt="${chat.sender}-img">
                        <p>${chat.message}</p>
                    </div>
                    ${chat.sender === 'bot' ? '<span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>' : ''}
                </div>`;
            const chatDiv = createChatElement(html, chat.sender);
            chatContainer.appendChild(chatDiv);
        });
    }
};

const createChatElement = (html, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;
};

const getChatResponse = async (incomingChatDiv, userText) => {
    const pElement = document.createElement("p");
    let botMessage = "";

    try {
        const response = await fetch('/ask_model', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: userText })
        });
        
        const data = await response.json();
        if (response.ok) {
            botMessage = data.answer.trim();
            pElement.textContent = botMessage;
        } else {
            botMessage = `Error: ${data.error || 'Unknown error'}`;
            pElement.classList.add("error");
            pElement.textContent = botMessage;
        }
    } catch (error) {
        console.error('Error during chat response:', error);
        botMessage = "Oops! Something went wrong while retrieving the response. Please try again.";
        pElement.classList.add("error");
        pElement.textContent = botMessage;
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    
    allChats.push({ sender: 'bot', message: botMessage });
    saveChatsToLocalStorage();
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const copyResponse = (copyBtn) => {
    const reponseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
};

const showTypingAnimation = (userText) => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="/static/images/chatbot.jpg" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv, userText);
};

const handleOutgoingChat = () => {
    const userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    allChats.push({ sender: 'user', message: userText });
    saveChatsToLocalStorage();
    renderChats(); // Re-render all chats including the new one
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(() => showTypingAnimation(userText), 500);
};

deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
        allChats = [];
        saveChatsToLocalStorage();
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);
