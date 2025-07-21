import { enrollVoice, generateChallenge, verifyVoice, secureVerify } from './api.js';

// DOM Elements
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');
const step1Card = document.getElementById('step1Card');
const step2Card = document.getElementById('step2Card');
const step3Card = document.getElementById('step3Card');
const step4Card = document.getElementById('step4Card');

// Step Elements
const userId = document.getElementById('userId');
const registerMicBtn = document.getElementById('registerMicBtn');
const registerStatus = document.getElementById('registerStatus');
const registerBtn = document.getElementById('registerBtn');


const verifyUserId = document.getElementById('verifyUserId');
const generateBtn = document.getElementById('generateBtn');
const challengeDisplay = document.getElementById('challengeDisplay');

const verifyUserId2 = document.getElementById('verifyUserId2');
const verifyMicBtn = document.getElementById('verifyMicBtn');
const verifyStatusText = document.getElementById('verifyStatusText');
const verifyBtn = document.getElementById('verifyBtn');

const secureVerifyUserId = document.getElementById('secureVerifyUserId');
const secureChallengeDisplay = document.getElementById('secureChallengeDisplay');
const secureMicBtn = document.getElementById('secureMicBtn');
const secureStatusText = document.getElementById('secureStatusText');
const secureVerifyBtn = document.getElementById('secureVerifyBtn');


// Result elements
const resultCard = document.getElementById('resultCard');

// User data holder
const userData = {
    userId: '',
    voiceSample: null,
    challengePhrase: ''
};

// INIT
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    createFooterParticles();
    setupEventListeners();
});

function setupEventListeners() {
    console.log("Setting up event listeners...");
    // registerBtn.addEventListener('click', handleRegisterClick);

    registerMicBtn.addEventListener('click', handleRegisterMicClick);
    registerBtn.addEventListener('click', handleRegisterClick);
    generateBtn.addEventListener('click', handleGenerateChallenge);
    verifyMicBtn.addEventListener('click', handleVerifyMicClick);
    verifyBtn.addEventListener('click', handleVerifyClick);
    secureMicBtn.addEventListener('click', handleSecureMicClick);
    secureVerifyBtn.addEventListener('click', handleSecureVerifyClick);
}

// === Step 1 ===
async function handleRegisterMicClick() {
    if (!userId.value) {
        registerStatus.textContent = "Please enter your user ID";
        return;
    }

    registerStatus.textContent = "Recording...";

    try {
        const blob = await recordAudio();
        userData.voiceSample = blob;
        registerStatus.textContent = "Voice recorded successfully!";
        registerBtn.style.display = 'inline-block'; // show register button
    } catch (err) {
        registerStatus.textContent = "Recording failed: " + err.message;
    }
}


async function handleRegisterClick(event) {
    console.log("Register button clicked!");
    event.preventDefault();
    if (!userId.value) {
        registerStatus.textContent = "Please enter a user ID";
        return;
    }

    const blob = userData.voiceSample;

    try {
        const res = await enrollVoice(userId.value, blob);
        userData.userId = res.user_id;
        userData.voiceSample = blob;
        registerStatus.textContent = res.message;

        console.log("➡️ proceedToStep2 called");  // Log here
        proceedToStep2();  // ⬅️ This MUST be called here!
    } catch (e) {
        registerStatus.textContent = "Enrollment error: " + e.message;
    }
}




function proceedToStep2() {
    step1.classList.remove('active');
    step1.classList.add('completed');
    step1Card.style.display = 'none';  // ⬅️ Hide step 1 completely
    step2.classList.add('active');
    step2Card.style.display = 'block';

    // Optional: Also collapse step 1 container if needed
    step1.style.display = 'none';

    // Scroll smoothly to step 2
    step2Card.scrollIntoView({ behavior: 'smooth' });
}


window.proceedToStep2 = proceedToStep2;

// === Step 2 ===
async function handleGenerateChallenge() {
    try {
        const res = await generateChallenge();
        userData.challengePhrase = res.challenge_phrase;
        challengeDisplay.textContent = `Your challenge phrase is: ${res.challenge_phrase}`;
        setTimeout(proceedToStep3, 4000);
    } catch (e) {
        challengeDisplay.textContent = "Error getting challenge: " + e.message;
    }
}

function proceedToStep3() {
    step2.classList.remove('active');
    step2.classList.add('completed');
    document.querySelectorAll('.step-line')[1].classList.add('active');
    step3.classList.add('active');
    step2Card.style.display = 'none';
    step3Card.style.display = 'block';
    step3Card.scrollIntoView({ behavior: 'smooth' });
}

// === Step 3 ===
async function handleVerifyMicClick() {
    if (!verifyUserId2.value) {
        verifyStatusText.textContent = "Please enter your user ID";
        return;
    }

    if (verifyUserId2.value !== userData.userId) {
        verifyStatusText.textContent = "User ID does not match registered user";
        return;
    }

    verifyStatusText.textContent = "Recording voice sample...";

    try {
        const blob = await recordAudio();
        userData.verifySample = blob;
        verifyStatusText.textContent = "Voice recorded successfully!";
        verifyBtn.style.display = 'inline-block';
    } catch (err) {
        verifyStatusText.textContent = "Recording failed: " + err.message;
    }
}


async function handleVerifyClick() {
    if (!verifyUserId2.value) {
        verifyStatusText.textContent = "Please enter your user ID";
        return;
    }

    const blob = userData.verifySample;

    try {
        const res = await verifyVoice(verifyUserId2.value, blob);
        verifyStatusText.textContent = res.message;
        proceedToStep4();
    } catch (e) {
        verifyStatusText.textContent = "Verification error: " + e.message;
    }
}

function proceedToStep4() {
    step3.classList.remove('active');
    step3.classList.add('completed');
    document.querySelectorAll('.step-line')[2].classList.add('active');
    step4.classList.add('active');
    step3Card.style.display = 'none';
    step4Card.style.display = 'block';
    secureChallengeDisplay.textContent = userData.challengePhrase;
    step4Card.scrollIntoView({ behavior: 'smooth' });
}

// === Step 4 ===
async function handleSecureMicClick() {
    if (!secureVerifyUserId.value) {
        secureStatusText.textContent = "Please enter your user ID";
        return;
    }

    if (secureVerifyUserId.value !== userData.userId) {
        secureStatusText.textContent = "User ID does not match registered user";
        return;
    }

    secureStatusText.textContent = "Recording challenge phrase...";

    try {
        const blob = await recordAudio();
        userData.secureSample = blob;
        secureStatusText.textContent = "Voice recorded successfully!";
        secureVerifyBtn.style.display = 'inline-block';
    } catch (err) {
        secureStatusText.textContent = "Recording failed: " + err.message;
    }
}


async function handleSecureVerifyClick() {
    secureStatusText.textContent = "Performing final verification...";
    const blob = userData.secureSample;
    try {
        const res = await secureVerify(userData.userId, userData.challengePhrase, blob);
        showResults(res);
    } catch (e) {
        secureStatusText.textContent = "Secure verification error: " + e.message;
    }
}

// === Results ===
function showResults(results) {
    updateScoreRing(results.similarity_score);
    document.getElementById('identityResult').textContent = 
        `Identity Verified: ${results.identity_verified ? '✅' : '❌'}`;
    document.getElementById('livenessResult').textContent = 
        `Liveness Verified: ${results.liveness_verified ? '✅' : '❌'}`;
    resultCard.classList.add('show');
    secureStatusText.textContent = "Verification complete";
    step4.classList.remove('active');
    step4.classList.add('completed');
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

function updateScoreRing(score) {
    const progressCircle = document.querySelector('.progress-circle');
    const scoreValue = document.querySelector('.score-value');
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (score / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
    scoreValue.textContent = `${score}%`;
}

// === Simulated Recorder ===
async function simulateRecording() {
    const blob = new Blob(["Fake audio"], { type: "audio/wav" });
    return blob;
}

// === Background animations ===
function createParticles() {
    const bgAnimation = document.querySelector('.bg-animation');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.width = `${Math.random() * 10 + 5}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        bgAnimation.appendChild(particle);
    }
}

function createFooterParticles() {
    const footerParticles = document.getElementById('footerParticles');
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.classList.add('footer-particle');
        particle.style.width = `${Math.random() * 10 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100 + 100}%`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${10 + Math.random() * 20}s`;
        footerParticles.appendChild(particle);
    }
}

function recordAudio(duration = 3000) {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                resolve(blob);
            };

            mediaRecorder.start();
            setTimeout(() => {
                mediaRecorder.stop();
            }, duration); // default 3 seconds
        } catch (err) {
            reject(err);
        }
    });
}
