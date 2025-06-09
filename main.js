import { init, generate } from './model.js';

// --- AUDIO ---
let audioContext;
const soundBuffers = {};
let isMuted = false;

async function setupAudio() {
    // AudioContext is created on first user interaction to comply with browser policies.
}

async function loadSound(name, url) {
    if (!audioContext || soundBuffers[name]) return;
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        soundBuffers[name] = audioBuffer;
    } catch (e) {
        console.error(`Failed to load sound: ${name}`, e);
    }
}

function playSound(name) {
    if (!audioContext || isMuted || !soundBuffers[name]) return;
    const source = audioContext.createBufferSource();
    source.buffer = soundBuffers[name];
    source.connect(audioContext.destination);
    source.start(0);
}

// Initial audio setup on first user interaction
let audioInitialized = false;
async function initializeAudio() {
    if (audioInitialized) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        await Promise.all([
            loadSound('click', '/click.mp3'),
            loadSound('notification', '/notification.mp3')
        ]);
        audioInitialized = true;
    } catch (e) {
        console.warn("Web Audio API is not supported in this browser or failed to initialize.");
        audioContext = null; // Ensure audio is disabled if setup fails
    }
}
document.body.addEventListener('click', initializeAudio, { once: true });
document.body.addEventListener('keydown', initializeAudio, { once: true });

// --- MODEL INITIALIZATION & LOADING ---
const loadingOverlay = document.getElementById("loading-overlay");
const loadingStatus = document.getElementById("loading-status");
const loadingProgress = document.getElementById("loading-progress");
const loadingFile = document.getElementById("loading-file");
const queryInput = document.getElementById("query-input");
const searchButton = document.getElementById("search-button");

async function initializeModel() {
    queryInput.disabled = true;
    searchButton.disabled = true;
    queryInput.placeholder = "Loading AI...";

    try {
        await init((data) => {
            if (data.status === 'progress') {
                const percentage = Math.round(data.progress)
                loadingStatus.textContent = `Engine Loading... (${percentage}%)`;
                loadingProgress.style.width = `${percentage}%`;
                loadingFile.textContent = data.file;
            } else if (data.status === 'done') {
                loadingFile.textContent = "Done.";
            } else {
                loadingStatus.textContent = data.status.replace(/_/g, ' ');
            }
        });
        loadingOverlay.style.opacity = '0';
        setTimeout(() => { loadingOverlay.style.display = "none"; }, 500);
        queryInput.disabled = false;
        searchButton.disabled = false;
        queryInput.placeholder = "Search...";

    } catch (error) {
        loadingStatus.textContent = "Failed to load AI model.";
        loadingFile.textContent = "Please refresh the page to try again.";
        console.error(error);
    }
}

// --- CORE APP LOGIC ---

let isLoggedIn = false;

// Create animated fireflies (50 of them).
function createFirefly() {
    const firefly = document.createElement("div");
    firefly.classList.add("firefly");
    firefly.style.top = Math.random() * 100 + "%";
    firefly.style.left = Math.random() * 100 + "%";
    const dx = (Math.random() - 0.5) * 100;
    const dy = (Math.random() - 0.5) * 100;
    firefly.style.setProperty("--dx", dx + "px");
    firefly.style.setProperty("--dy", dy + "px");
    const duration = 5 + Math.random() * 5;
    firefly.style.animationDuration = duration + "s";
    firefly.style.animationDelay = Math.random() * 5 + "s";
    document.getElementById("fireflies").appendChild(firefly);
}
for (let i = 0; i < 50; i++) { createFirefly(); }

// Get DOM elements.
const resultsDiv = document.getElementById("results");
const menuIcon = document.getElementById("menu-icon");
const modalOverlay = document.getElementById("modal-overlay");
const closeButton = document.getElementById("close-button");

// Account & Login elements
const accountIcon = document.getElementById("account-icon");
const loginModalOverlay = document.getElementById("login-modal-overlay");
const loginCloseButton = document.getElementById("login-close-button");
const loginButton = document.getElementById("login-button");
const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const loginError = document.getElementById("login-error");

const tabSettings = document.getElementById("tab-settings");
const tabGuide = document.getElementById("tab-guide");
const modalContentSettings = document.getElementById("modal-content-settings");
const modalContentGuide = document.getElementById("modal-content-guide");
const themeSelect = document.getElementById("theme-select");
const themeTitle = document.getElementById("theme-title");
const blurSelect = document.getElementById("blur-select");
const countdownElement = document.getElementById("countdown-timer");
const soundToggle = document.getElementById("sound-toggle");

// Parameter sliders & displays.
const lengthSlider = document.getElementById("length-slider");
const lengthDisplay = document.getElementById("length-display");
const tempSlider = document.getElementById("temp-slider");
const tempDisplay = document.getElementById("temp-display");
const toppSlider = document.getElementById("topp-slider");
const toppDisplay = document.getElementById("topp-display");
const beamsSlider = document.getElementById("beams-slider");
const beamsDisplay = document.getElementById("beams-display");

// Store original slider settings
const originalSliderSettings = {
    length: { max: lengthSlider.max },
    temp: { max: tempSlider.max },
    topp: { max: toppSlider.max },
    beams: { max: beamsSlider.max },
};

// Function to update slider background for the fill effect
function updateSliderBackground(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const percentage = ((val - min) * 100) / (max - min);
    slider.style.backgroundSize = percentage + '% 100%';
}

lengthSlider.addEventListener("input", () => {
    lengthDisplay.textContent = lengthSlider.value;
    updateSliderBackground(lengthSlider);
    playSound('click');
});
tempSlider.addEventListener("input", () => {
    tempDisplay.textContent = tempSlider.value;
    updateSliderBackground(tempSlider);
    playSound('click');
});
toppSlider.addEventListener("input", () => {
    toppDisplay.textContent = toppSlider.value;
    updateSliderBackground(toppSlider);
    playSound('click');
});
beamsSlider.addEventListener("input", () => {
    beamsDisplay.textContent = beamsSlider.value;
    updateSliderBackground(beamsSlider);
    playSound('click');
});

// Initial update for all sliders on page load
document.querySelectorAll('.settings-slider').forEach(updateSliderBackground);

// Background Blur Option.
blurSelect.addEventListener("change", function() {
    const blurAmount = this.value;
    document.querySelector(".container").style.backdropFilter = "blur(" + blurAmount + ")";
    playSound('click');
});

// Toggle settings modal.
menuIcon.addEventListener("click", () => { modalOverlay.style.display = "flex"; playSound('click'); });
closeButton.addEventListener("click", () => { modalOverlay.style.display = "none"; playSound('click'); });
modalOverlay.addEventListener("click", function(e) {
    if(e.target === modalOverlay) { modalOverlay.style.display = "none"; playSound('click'); }
});

// --- VIP / Login Logic ---
function showLoginModal() {
    loginError.style.display = 'none';
    usernameInput.value = '';
    passwordInput.value = '';
    loginModalOverlay.style.display = 'flex';
    playSound('click');
}

function closeLoginModal() {
    loginModalOverlay.style.display = 'none';
    playSound('click');
}

function handleLogin() {
    playSound('click');
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (username === 'waris' && password === 'charm') {
        isLoggedIn = true;
        document.body.classList.add('vip-active');
        accountIcon.classList.add('logged-in');
        enableVipMode();
        closeLoginModal();
        playSound('notification');
    } else {
        loginError.textContent = 'Invalid username or password.';
        loginError.style.display = 'block';
    }
}

function handleLogout() {
    isLoggedIn = false;
    document.body.classList.remove('vip-active');
    accountIcon.classList.remove('logged-in');
    disableVipMode();
    playSound('click');
    // Optional: Switch back to a default theme if VIP theme was active
    if (themeSelect.value === 'vip') {
        themeSelect.value = 'air';
        themeSelect.dispatchEvent(new Event('change'));
    }
}

function enableVipMode() {
    // Enhance sliders
    lengthSlider.max = 1024;
    tempSlider.max = 2.0;
    beamsSlider.max = 16;
    document.querySelectorAll('.settings-slider').forEach(updateSliderBackground);

    // Add VIP theme
    if (!themeSelect.querySelector('option[value="vip"]')) {
        const vipOption = new Option('Neodemia VIP', 'vip');
        themeSelect.add(vipOption);
    }
}

function disableVipMode() {
    // Reset sliders to original values
    lengthSlider.max = originalSliderSettings.length.max;
    tempSlider.max = originalSliderSettings.temp.max;
    beamsSlider.max = originalSliderSettings.beams.max;
    // Reset slider value if it's now out of bounds
    if (parseInt(lengthSlider.value) > lengthSlider.max) lengthSlider.value = lengthSlider.max;
    if (parseFloat(tempSlider.value) > tempSlider.max) tempSlider.value = tempSlider.max;
    if (parseInt(beamsSlider.value) > beamsSlider.max) beamsSlider.value = beamsSlider.max;
    lengthDisplay.textContent = lengthSlider.value;
    tempDisplay.textContent = tempSlider.value;
    beamsDisplay.textContent = beamsSlider.value;
    document.querySelectorAll('.settings-slider').forEach(updateSliderBackground);


    // Remove VIP theme
    const vipOption = themeSelect.querySelector('option[value="vip"]');
    if (vipOption) {
        themeSelect.removeChild(vipOption);
    }
}

accountIcon.addEventListener('click', () => {
    if (isLoggedIn) {
        handleLogout();
    } else {
        showLoginModal();
    }
});

loginCloseButton.addEventListener('click', closeLoginModal);
loginModalOverlay.addEventListener('click', (e) => {
    if (e.target === loginModalOverlay) {
        closeLoginModal();
    }
});
loginButton.addEventListener('click', handleLogin);
passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

// Modal tab switching.
tabSettings.addEventListener("click", () => {
    tabSettings.classList.add("active");
    tabGuide.classList.remove("active");
    modalContentSettings.classList.add("active");
    modalContentGuide.classList.remove("active");
    playSound('click');
});
tabGuide.addEventListener("click", () => {
    tabGuide.classList.add("active");
    tabSettings.classList.remove("active");
    modalContentGuide.classList.add("active");
    modalContentSettings.classList.remove("active");
    playSound('click');
});

// Theme Switching.
const themes = {
    air: "Neodemia Air",
    forest: "Neodemia Forest",
    cosmic: "Neodemia Cosmic",
    vip: "Neodemia VIP",
};
themeSelect.addEventListener("change", () => {
    playSound('click');
    const theme = themeSelect.value;
    document.body.className = "theme-" + theme;
    const themeName = themes[theme] || "Neodemia";
    themeTitle.textContent = themeName;
    document.title = themeName;
});

// Trigger search on Enter key or Search button click.
queryInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") { playSound('click'); performSearch(); }
});
searchButton.addEventListener("click", () => { playSound('click'); performSearch(); });

function showSpinner() {
    resultsDiv.innerHTML = "<div class='spinner'></div>";
}

// Execute search using adjustable parameters.
async function performSearch() {
    const query = queryInput.value;
    if (!query.trim()) return;
    showSpinner();
    searchButton.disabled = true;
    const gen_length = parseInt(lengthSlider.value);
    const temperature = parseFloat(tempSlider.value);
    const top_p = parseFloat(toppSlider.value);
    const beams = parseInt(beamsSlider.value);

    try {
        const result = await generate({
            query: query,
            gen_length: gen_length,
            temperature: temperature,
            top_p: top_p,
            beams: beams,
            isExplain: false
        });
        resultsDiv.innerHTML = `<p>${result.replace(/(?:\r\n|\r|\n)/g, "<br>")}</p>` +
            `<button class='explain-btn' id='explain-btn'>Explain Further</button>`;
        document.getElementById("explain-btn").addEventListener("click", performExplain);
        playSound('notification');
    } catch (error) {
        resultsDiv.innerHTML = `<p style='color: red;'>An error occurred. Please try again.</p>`;
        console.error(error);
    } finally {
        searchButton.disabled = false;
    }
}

// Perform additional explanation.
async function performExplain() {
    playSound('click');
    const explainBtn = document.getElementById('explain-btn');
    if (explainBtn) {
        explainBtn.disabled = true;
        explainBtn.textContent = "Explaining...";
    };

    const answerText = resultsDiv.querySelector("p").innerText;
    const explanationDiv = document.createElement("div");
    explanationDiv.innerHTML = "<div class='spinner'></div>";
    resultsDiv.appendChild(explanationDiv);

    try {
        // Use settings from original python script for explain endpoint
        const result = await generate({
            previousAnswer: answerText,
            isExplain: true,
            gen_length: 200, 
            temperature: 1.0,
            top_p: 0.9,
            beams: 3,
        });
        explanationDiv.innerHTML = `<p>${result.replace(/(?:\r\n|\r|\n)/g, "<br>")}</p>`;
        playSound('notification');
    } catch (error) {
        explanationDiv.innerHTML = `<p style='color: red;'>An error occurred during explanation.</p>`;
        console.error(error);
    }
}

// Initialize the application
setupAudio();
initializeModel();

// --- Countdown Timer ---
const destructTime = new Date("2025-07-29T21:00:00").getTime();
function updateCountdown() {
    const now = new Date().getTime();
    const distance = destructTime - now;

    if (distance < 0) {
        countdownElement.innerHTML = "TRIAL EXPIRED";
        if(countdownInterval) clearInterval(countdownInterval);
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownElement.innerHTML = `TRIAL ENDS IN: ${days}d ${hours}h ${minutes}m ${seconds}s`;
}
const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// --- Sound Settings ---
isMuted = localStorage.getItem('neodemia-muted') === 'true';
soundToggle.checked = !isMuted;
soundToggle.addEventListener('change', () => {
    isMuted = !soundToggle.checked;
    localStorage.setItem('neodemia-muted', isMuted);
    if (!isMuted) {
        playSound('click');
    }
});