import whisper

# Load Whisper model once
model = whisper.load_model("base")

def transcribe_audio(file_path: str) -> str:
    """
    Transcribe speech from audio using Whisper.
    """
    result = model.transcribe(file_path)
    return result["text"].strip().lower()
