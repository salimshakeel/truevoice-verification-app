from fastapi import APIRouter
from ..services.challenge import get_random_phrase
from fastapi import UploadFile, File, HTTPException, Form
import shutil
import os
from ..services.ecapa_utils import extract_speaker_embedding, verify_speakers
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

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

@router.get("/generate-challenge", response_model=ChallengeResponse)
def generate_challenge():
    """
    Returns a one-time random phrase for the user to speak aloud.
    """
    phrase = get_random_phrase()
    return ChallengeResponse(challenge_phrase=phrase)


# Enroll Voice Endpoint
@router.post("/enroll-voice", response_model=EnrollResponse)
async def enroll_voice(user_id: str = Form(...), audio: UploadFile = File(...)):
    """
    Enroll a user's voiceprint (speaker identity) using ECAPA embedding.
    """
    try:
        # Create temp directory if it doesn't exist
        os.makedirs("temp", exist_ok=True)
        
        file_location = f"temp/{user_id}_enroll.wav"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        embedding = extract_speaker_embedding(file_location)

        # Save embedding to file
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
        raise HTTPException(status_code=500, detail=f"Enrollment failed: {str(e)}")

# Verify Voice Endpoint
@router.post("/verify-voice", response_model=VerifyResponse)
async def verify_voice(
    user_id: str = Form(...), 
    audio: UploadFile = File(...),
    threshold: float = Form(0.5)
):
    """
    Verify a user's voice against their enrolled voiceprint.
    """
    try:
        # Create temp directory if it doesn't exist
        os.makedirs("temp", exist_ok=True)
        
        # Check if user is enrolled
        embedding_file = f"temp/{user_id}_embedding.txt"
        if not os.path.exists(embedding_file):
            raise HTTPException(status_code=404, detail=f"User {user_id} not enrolled")
        
        # Save verification audio
        verify_file = f"temp/{user_id}_verify.wav"
        with open(verify_file, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        # Get enrolled audio file
        enroll_file = f"temp/{user_id}_enroll.wav"
        if not os.path.exists(enroll_file):
            raise HTTPException(status_code=404, detail=f"Enrollment audio not found for {user_id}")
        
        # Verify speakers
        score, prediction = verify_speakers(enroll_file, verify_file)
        is_match = score > threshold
        
        return VerifyResponse(
            status="success",
            score=float(score),
            is_match=is_match,
            message=f"Verification completed. Score: {score:.3f}, Match: {is_match}"
        )
        
    except HTTPException:
        raise
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=f"Audio file error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

# Health check endpoint
@router.get("/health")
def health_check():
    """
    Health check endpoint to verify API is running.
    """
    return {"status": "healthy", "message": "Truevoice API is running"}
