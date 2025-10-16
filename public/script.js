// File: script.js

// --- Artwork Data & Modal Logic (This can stay here) ---
const artworks = [
    { id: 1, title: "Biomorphic Study I", year: "2023", description: "Mixed media on canvas, exploring cellular life and decay.", src: "img/work 10.png?text=Artwork+1" },
    { id: 2, title: "The Weaver's Knot", year: "2022", description: "Sculpture made of woven recycled plastics and resin.", src: "img/work 11.png?text=Artwork+2" },
    { id: 3, title: "Luminescent Garden", year: "2023", description: "Digital print on aluminum, finished with a UV-resistant clear coat.", src: "img/work 12.png?text=Artwork+3" },
    { id: 4, title: "Echoes of the Deep", year: "2021", description: "Oil on board, abstract representation of deep-sea hydrothermal vents.", src: "img/work 10.png?text=Artwork+4" },
    { id: 5, title: "Fragmented Memory", year: "2024", description: "Assemblage of found objects and aged textiles, sealed in glass.", src: "img/work 10.png?text=Artwork+5" },
    { id: 6, title: "The Circuit Tree", year: "2022", description: "Installation piece using discarded electronic components and wiring.", src: "img/work 10.png?text=Artwork+6" },
];
// --- All your existing modal and grid logic remains unchanged ---
const modal = document.getElementById('artwork-modal');
const modalTitle = document.getElementById('modal-title');
const modalYear = document.getElementById('modal-year');
const modalDescription = document.getElementById('modal-description');
const modalImage = document.getElementById('modal-image');
const modalCloseButton = document.getElementById('modal-close-button');

function showModal(artwork) { 
    modalTitle.textContent = artwork.title;
    modalYear.textContent = artwork.year;
    modalDescription.textContent = artwork.description;
    modalImage.src = artwork.src;
    modalImage.alt = artwork.title;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
 }
function hideModal() { 
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
 }

modalCloseButton.addEventListener('click', hideModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

        const artGridContainer = document.getElementById('art-grid-container');
        artworks.forEach((art) => {
            const wrapper = document.createElement('div');
            wrapper.className = "overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer";
            const image = document.createElement('img');
            image.src = art.src;
            image.alt = art.title;
            image.className = "w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300";
            wrapper.addEventListener('click', () => showModal(art));
            wrapper.appendChild(image);
            artGridContainer.appendChild(wrapper);
        });

        document.getElementById('mobile-menu-button').addEventListener('click', function() {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => document.getElementById('mobile-menu').classList.add('hidden'));
        });

// --- C.L.A.R.A. AI Assistant Logic ---
        
async function initializeClara() {
    // --- All your DOM element selectors remain the same ---
    const claraOpenBtn = document.getElementById('clara-open-btn');
    const claraCloseBtn = document.getElementById('clara-close-btn');
    const claraChatSidebar = document.getElementById('clara-chat-sidebar');
    const chatArea = document.getElementById('chat-area');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const audioPlayer = document.getElementById('audio-player');
    const voiceInputArea = document.getElementById('voice-input-area');
    const textInputArea = document.getElementById('text-input-area');
    const micBtn = document.getElementById('mic-btn');
    const micStatus = document.getElementById('mic-status');
    const toggleInputBtn = document.getElementById('toggle-input-btn');
    const keyboardIcon = document.getElementById('keyboard-icon');
    const micIcon = document.getElementById('mic-icon');


    try {
        const response = await fetch('/api/clara-config.json');
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const config = await response.json();

        // --- UI Customization from public config ---
        document.getElementById('ai-name-header').textContent = config.aiName;
        document.getElementById('ai-subtitle').textContent = config.aiFullName;
        document.getElementById('ai-profile-pic').src = config.aiProfilePicUrl;
        document.getElementById('clara-btn-pic').src = config.aiProfilePicUrl;
        // --- AI Personality ---
        const SYSTEM_INSTRUCTION = config.systemInstructionTemplate
            .replace('{aiName}', config.aiName)
            .replace('{aiFullName}', config.aiFullName);
         

        // --- Speech Recognition ---
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.onstart = () => { micStatus.textContent = "Listening..."; micBtn.classList.add('recording'); };
            recognition.onend = () => { micStatus.textContent = "Tap the mic to speak"; micBtn.classList.remove('recording'); };
            recognition.onresult = (event) => processUserMessage(event.results[0][0].transcript, 'voice');
            recognition.onerror = (event) => { console.error("Speech recognition error:", event.error); micStatus.textContent = "Sorry, I didn't catch that."; };
        } else {
            voiceInputArea.classList.add('hidden'); textInputArea.classList.remove('hidden'); toggleInputBtn.classList.add('hidden');
        }
        // --- Event Listeners ---
        claraOpenBtn.addEventListener('click', () => claraChatSidebar.style.transform = 'translateX(0)');
        claraCloseBtn.addEventListener('click', () => claraChatSidebar.style.transform = 'translateX(100%)');
        sendBtn.addEventListener('click', handleTextMessage);
        userInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleTextMessage(); });
        micBtn.addEventListener('click', () => { if (recognition) recognition.start(); });
        toggleInputBtn.addEventListener('click', toggleInputMode);
        // --- Core Functions (REWRITTEN) ---
        function handleTextMessage() { 
            function handleTextMessage() {
                const userMessage = userInput.value.trim();
                if (userMessage) { processUserMessage(userMessage, 'text'); userInput.value = ''; }
            }
         }

        async function processUserMessage(message, inputMethod = 'text') {
            if (!message) return;
            addMessageToChat(message, 'user');
            setLoading(true);
            try {
                // STEP 1: Call our new secure backend to get the text response
                const aiTextResponse = await generateText(message);
                
                if (inputMethod === 'voice') {
                    // STEP 2: Call our other backend to get the audio
                    const audioData = await generateSpeech(aiTextResponse);
                    // NOW, display the final text and play the audio
                    addMessageToChat(aiTextResponse, 'ai'); 
                    playAudio(audioData);
                } else {
                    addMessageToChat(aiTextResponse, 'ai');
                }

            } catch (error) {
                console.error("Error:", error);
                addMessageToChat("Sorry, I encountered an error. Please try again.", 'ai');
            } finally {
                setLoading(false);
            }
        }
        
        // NEW function to call our backend
        async function generateText(prompt) {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });
            if (!response.ok) throw new Error(`API failed: ${response.status}`);
            const result = await response.json();
            return result.message;
        }

        // NEW function to call our backend
        async function generateSpeech(textToSpeak) {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ textToSpeak: textToSpeak })
            });
            if (!response.ok) throw new Error(`API failed: ${response.status}`);
            const result = await response.json();
            return result.audioData;
        }

        function playAudio(base64AudioData) {
            // This function now expects the base64 string directly from our backend
            audioPlayer.src = `data:audio/wav;base64,${base64AudioData}`;
            audioPlayer.play();
        }

        // --- UI & Utility Functions ---
        function toggleInputMode() {
            const isCurrentlyVoiceMode = !voiceInputArea.classList.contains('hidden');
            if (isCurrentlyVoiceMode) {
                voiceInputArea.classList.add('hidden');
                textInputArea.classList.remove('hidden');
                keyboardIcon.classList.add('hidden');
                micIcon.classList.remove('hidden');
            } else {
                voiceInputArea.classList.remove('hidden');
                textInputArea.classList.add('hidden');
                keyboardIcon.classList.remove('hidden');
                micIcon.classList.add('hidden');
            }
        }
        function addMessageToChat(message, sender) {
            const wrapper = document.createElement('div');
            const bubble = document.createElement('div');
            wrapper.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
            bubble.className = `chat-bubble ${sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`;
            bubble.textContent = message;
            chatArea.querySelector('.thinking')?.parentElement.remove();
            wrapper.appendChild(bubble);
            chatArea.appendChild(wrapper);
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        function setLoading(isLoading) {
            [sendBtn, userInput, micBtn].forEach(el => el.disabled = isLoading);
            if (isLoading) {
                micBtn.classList.add('opacity-50', 'cursor-not-allowed');
                const thinkingWrapper = document.createElement('div');
                thinkingWrapper.className = 'flex justify-start';
                thinkingWrapper.innerHTML = `<div class="chat-bubble chat-bubble-ai thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
                chatArea.appendChild(thinkingWrapper);
                chatArea.scrollTop = chatArea.scrollHeight;
            } else {
                micBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
        // --- Audio Conversion Helpers ---
        function base64ToArrayBuffer(b64) {
            const str = window.atob(b64);
            const len = str.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) { bytes[i] = str.charCodeAt(i); }
            return bytes.buffer;
        }
        function pcmToWav(pcmData, sampleRate) {
            const buffer = new ArrayBuffer(44 + pcmData.length * 2);
            const view = new DataView(buffer);
            writeString(view, 0, 'RIFF'); view.setUint32(4, 36 + pcmData.length * 2, true);
            writeString(view, 8, 'WAVE'); writeString(view, 12, 'fmt '); view.setUint32(16, 16, true);
            view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
            writeString(view, 36, 'data'); view.setUint32(40, pcmData.length * 2, true);
            for (let i = 0; i < pcmData.length; i++) { view.setInt16(44 + i * 2, pcmData[i], true); }
            return new Blob([view], { type: 'audio/wav' });
        }
        function writeString(view, offset, str) {
            for (let i = 0; i < str.length; i++) { view.setUint8(offset + i, str.charCodeAt(i)); }
        }


    } catch (error) {
        console.error("Could not initialize C.L.A.R.A.:", error);
        document.getElementById('clara-open-btn').parentElement.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Manually copy the modal/grid logic here for now
    // In a real project, you'd organize this better, but this works.
    const modal = document.getElementById('artwork-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalYear = document.getElementById('modal-year');
    const modalDescription = document.getElementById('modal-description');
    const modalImage = document.getElementById('modal-image');
    const modalCloseButton = document.getElementById('modal-close-button');

    function showModal(artwork) {
        modalTitle.textContent = artwork.title;
        modalYear.textContent = artwork.year;
        modalDescription.textContent = artwork.description;
        modalImage.src = artwork.src;
        modalImage.alt = artwork.title;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }

    modalCloseButton.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

    const artGridContainer = document.getElementById('art-grid-container');
    artworks.forEach((art) => {
        const wrapper = document.createElement('div');
        wrapper.className = "overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer";
        const image = document.createElement('img');
        image.src = art.src;
        image.alt = art.title;
        image.className = "w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300";
        wrapper.addEventListener('click', () => showModal(art));
        wrapper.appendChild(image);
        artGridContainer.appendChild(wrapper);
    });

    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => document.getElementById('mobile-menu').classList.add('hidden'));
    });
    
    // Now start the C.L.A.R.A. setup
    initializeClara();
});