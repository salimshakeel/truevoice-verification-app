const BASE_URL = "http://127.0.0.1:8000"; // or your deployed API URL

export async function enrollVoice(userId, audioBlob) {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("audio", audioBlob, "enroll.wav");

    const res = await fetch(`${BASE_URL}/enroll-voice`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error("Enrollment failed");
    return res.json();
}

export async function generateChallenge() {
    const res = await fetch(`${BASE_URL}/generate-challenge`);
    if (!res.ok) throw new Error("Failed to fetch challenge");
    return res.json();
}

export async function verifyVoice(userId, audioBlob) {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("audio", audioBlob, "verify.wav");

    const res = await fetch(`${BASE_URL}/verify-voice`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error("Verification failed");
    return res.json();
}

export async function secureVerify(userId, challengePhrase, audioBlob) {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("challenge_phrase", challengePhrase);
    formData.append("audio", audioBlob, "secure.wav");

    const res = await fetch(`${BASE_URL}/secure-verify-voice`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error("Secure verification failed");
    return res.json();
}
