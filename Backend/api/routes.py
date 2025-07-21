from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from typing import Optional
import os
import shutil
from ..services.audio_utils import convert_to_wav

from ..services.challenge import get_random_phrase
from ..services.ecapa_utils import extract_speaker_embedding, verify_speakers
from ..services.whisper_utils import transcribe_audio
from rapidfuzz import fuzz

# 🔐 Create the router first
router = APIRouter()

# 🧾 Response Models
class ChallengeResponse(BaseModel):
    challenge_phrase: str

class EnrollResponse(BaseModel):
    status: str
    message: str
    user_id: str

class VerifyResponse(BaseModel):
    status: str
    score: float
    is_match: bool
    message: str

# ✅ Health check
@router.get("/health")
def health_check():
    return {"status": "healthy", "message": "Truevoice API is running"}


# 🎙️ Enroll Voice
@router.post("/enroll-voice", response_model=EnrollResponse)
async def enroll_voice(user_id: str = Form(...), audio: UploadFile = File(...)):
    """
    Enroll a user's voiceprint (speaker identity) using ECAPA embedding.
    Accepts any audio format and converts to .wav
    """
    try:
        os.makedirs("temp", exist_ok=True)

        # Save original uploaded file with extension
        raw_path = f"temp/{user_id}_raw.{audio.filename.split('.')[-1]}"
        with open(raw_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # Convert to .wav format
        wav_path = f"temp/{user_id}_enroll.wav"
        convert_to_wav(raw_path, wav_path)

        # Extract speaker embedding from .wav
        embedding = extract_speaker_embedding(wav_path)

        # Save embedding
        embedding_file = f"temp/{user_id}_embedding.txt"
        with open(embedding_file, "w") as f:
            f.write(",".join(map(str, embedding)))

        return EnrollResponse(
            status="success",
            message=f"Voice enrolled for {user_id}",
            user_id=user_id
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=f"Audio file error: {str(e)}")
    except Exception as e:
        print(f"🔥 ERROR in /enroll-voice: {e}")
        raise HTTPException(status_code=500, detail=f"Enrollment failed: {str(e)}")


# 📌 Generate Challenge
@router.get("/generate-challenge", response_model=ChallengeResponse)
def generate_challenge():
    phrase = get_random_phrase()
    return ChallengeResponse(challenge_phrase=phrase)

# 🎧 Verify Voice Identity
@router.post("/verify_voice", response_model=VerifyResponse)
async def verify_voice(
    user_id: str = Form(...), 
    audio: UploadFile = File(...),
    threshold: float = Form(0.5)
):
    try:
        os.makedirs("temp", exist_ok=True)

        # Save uploaded audio
        raw_path = f"temp/{user_id}_raw_verify.{audio.filename.split('.')[-1]}"
        with open(raw_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # Convert to wav
        verify_file = f"temp/{user_id}_verify.wav"
        convert_to_wav(raw_path, verify_file)

        # Check enroll file exists
        enroll_file = f"temp/{user_id}_enroll.wav"
        if not os.path.exists(enroll_file):
            raise HTTPException(status_code=404, detail=f"Enrollment audio not found for {user_id}")

        score, prediction = verify_speakers(enroll_file, verify_file)
        score = float(score)
        is_match = score > threshold

        return VerifyResponse(
            status="success",
            score=float(score),
            is_match=is_match,
            message=f"Verification completed. Score: {score:.3f}, Match: {is_match}"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


# 🔐 Secure Verify (Liveness + Identity)
@router.post("/secure_verify_voice")
async def secure_verify_voice(
    user_id: str = Form(...),
    challenge_phrase: str = Form(...),
    threshold: float = Form(0.5),
    audio: UploadFile = File(...)
    
):
    # Debugging: Print uploaded file details
    print(f"DEBUG: Received file - {audio.filename}")
    print(f"DEBUG: Content type - {audio.content_type}")
    print(f"DEBUG: User ID - {user_id}")
    print(f"DEBUG: Challenge Phrase - {challenge_phrase}")
    print(f"DEBUG: Threshold - {threshold}")
    
    try:
        os.makedirs("temp", exist_ok=True)

        # Save raw file
        raw_path = f"temp/{user_id}_raw_test.{audio.filename.split('.')[-1]}"
        with open(raw_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # Convert to wav
        test_file = f"temp/{user_id}_test.wav"
        convert_to_wav(raw_path, test_file)

        enroll_file = f"temp/{user_id}_enroll.wav"
        if not os.path.exists(enroll_file):
            raise HTTPException(status_code=404, detail=f"User {user_id} not enrolled")

        # Identity check
        score, _ = verify_speakers(enroll_file, test_file)
        score = float(score)
        identity_verified = score > threshold

        # Liveness check
        transcript = transcribe_audio(test_file)
        similarity = fuzz.partial_ratio(transcript, challenge_phrase.lower())
        liveness_verified = similarity >= 80

        return {
            "user_id": user_id,
            "identity_verified": identity_verified,
            "liveness_verified": liveness_verified,
            "speaker_score": round(float(score), 3),
            "transcript": transcript,
            "challenge_phrase": challenge_phrase,
            "similarity_score": similarity
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Secure verification failed: {str(e)}")


