const BASE_URL = "http://127.0.0.1:8000"; // Replace with your deployed URL if needed

export async function generateChallenge() {
  const res = await fetch(`${BASE_URL}/generate-challenge`);
  return await res.json();
}

export async function enrollVoice(userId, audioBlob) {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("audio", audioBlob);

  const res = await fetch(`${BASE_URL}/enroll-voice`, {
    method: "POST",
    body: formData
  });

  return await res.json();
}

export async function secureVerifyVoice(userId, challengePhrase, audioBlob) {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("challenge_phrase", challengePhrase);
  formData.append("audio", audioBlob);

  const res = await fetch(`${BASE_URL}/secure-verify-voice`, {
    method: "POST",
    body: formData
  });

  return await res.json();
}
