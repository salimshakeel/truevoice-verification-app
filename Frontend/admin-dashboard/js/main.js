import { generateChallenge, enrollVoice, secureVerifyVoice } from "./api.js";

const userIdInput = document.getElementById("userId");
const challengeText = document.getElementById("challengeText");
const generateBtn = document.getElementById("generateBtn");
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const enrollBtn = document.getElementById("enrollBtn");
const verifyBtn = document.getElementById("verifyBtn");
const resultBox = document.getElementById("resultBox");

let challengePhrase = "";
let mediaRecorder;
let audioChunks = [];

// 🟦 Generate Challenge
generateBtn.addEventListener("click", async () => {
  const data = await generateChallenge();
  challengePhrase = data.challenge_phrase;
  challengeText.textContent = challengePhrase;
});

// 🟩 Start Recording
recordBtn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  audioChunks = [];
  mediaRecorder.ondataavailable = e => {
    audioChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    stream.getTracks().forEach(track => track.stop());
  };

  mediaRecorder.start();
  recordBtn.classList.add("hidden");
  stopBtn.classList.remove("hidden");
});

// 🟥 Stop Recording
stopBtn.addEventListener("click", () => {
  mediaRecorder.stop();
  recordBtn.classList.remove("hidden");
  stopBtn.classList.add("hidden");
});

// 📥 Enroll Button
enrollBtn.addEventListener("click", async () => {
  const userId = userIdInput.value.trim();
  if (!userId) return alert("Please enter a User ID");

  const blob = new Blob(audioChunks, { type: "audio/wav" });

  resultBox.innerHTML = "⏳ Enrolling...";
  const response = await enrollVoice(userId, blob);
  resultBox.innerHTML = `✅ ${response.message}`;
});

// 🔐 Secure Verify Button
verifyBtn.addEventListener("click", async () => {
  const userId = userIdInput.value.trim();
  if (!userId || !challengePhrase) return alert("Missing User ID or Challenge");

  const blob = new Blob(audioChunks, { type: "audio/wav" });

  resultBox.innerHTML = "⏳ Verifying...";
  const response = await secureVerifyVoice(userId, challengePhrase, blob);

  resultBox.innerHTML = `
    <div class="mt-2">
      <strong>Identity Verified:</strong> ${response.identity_verified}<br>
      <strong>Liveness Verified:</strong> ${response.liveness_verified}<br>
      <strong>Speaker Score:</strong> ${response.speaker_score}<br>
      <strong>Transcript:</strong> "${response.transcript}"<br>
      <strong>Challenge Phrase:</strong> "${response.challenge_phrase}"<br>
      <strong>Similarity Score:</strong> ${response.similarity_score}
    </div>
  `;
});
