# Truevoice Voice Verification API

A FastAPI-based voice verification system that uses ECAPA-TDNN speaker recognition for liveness detection and identity verification.

## Features

- **Voice Enrollment**: Enroll users' voiceprints using ECAPA-TDNN embeddings
- **Voice Verification**: Verify users against their enrolled voiceprints
- **Challenge-Response**: Generate random phrases for liveness detection
- **Speaker Recognition**: High-accuracy speaker verification using SpeechBrain

## API Endpoints

### 1. Health Check
```
GET /health
```
Returns API status and confirms the service is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "Truevoice API is running"
}
```

### 2. Generate Challenge
```
GET /generate-challenge
```
Returns a random phrase for the user to speak during verification.

**Response:**
```json
{
  "challenge_phrase": "Say 35 green apples"
}
```

### 3. Enroll Voice
```
POST /enroll-voice
```
Enroll a user's voiceprint for future verification.

**Parameters:**
- `user_id` (form): Unique identifier for the user
- `audio` (file): WAV audio file containing user's voice

**Response:**
```json
{
  "status": "success",
  "message": "Voice enrolled for user123",
  "user_id": "user123"
}
```

### 4. Verify Voice
```
POST /verify-voice
```
Verify a user's voice against their enrolled voiceprint.

**Parameters:**
- `user_id` (form): User identifier
- `audio` (file): WAV audio file to verify
- `threshold` (form, optional): Similarity threshold (default: 0.5)

**Response:**
```json
{
  "status": "success",
  "score": 0.85,
  "is_match": true,
  "message": "Verification completed. Score: 0.850, Match: true"
}
```

## Usage Examples

### Using curl

1. **Health Check:**
```bash
curl http://127.0.0.1:8000/health
```

2. **Generate Challenge:**
```bash
curl http://127.0.0.1:8000/generate-challenge
```

3. **Enroll Voice:**
```bash
curl -X POST "http://127.0.0.1:8000/enroll-voice" \
  -F "user_id=john_doe" \
  -F "audio=@enrollment_audio.wav"
```

4. **Verify Voice:**
```bash
curl -X POST "http://127.0.0.1:8000/verify-voice" \
  -F "user_id=john_doe" \
  -F "audio=@verification_audio.wav" \
  -F "threshold=0.5"
```

### Using Python

```python
import requests

# Generate challenge
response = requests.get("http://127.0.0.1:8000/generate-challenge")
challenge = response.json()["challenge_phrase"]

# Enroll voice
with open("enrollment.wav", "rb") as f:
    files = {"audio": f}
    data = {"user_id": "john_doe"}
    response = requests.post("http://127.0.0.1:8000/enroll-voice", 
                           files=files, data=data)

# Verify voice
with open("verification.wav", "rb") as f:
    files = {"audio": f}
    data = {"user_id": "john_doe", "threshold": 0.5}
    response = requests.post("http://127.0.0.1:8000/verify-voice", 
                           files=files, data=data)
    result = response.json()
    print(f"Match: {result['is_match']}, Score: {result['score']}")
```

## Technical Details

### Speaker Recognition Model
- **Model**: ECAPA-TDNN (Embedded Cross Attention Pattern Aggregation)
- **Source**: SpeechBrain spkrec-ecapa-voxceleb
- **Features**: 192-dimensional speaker embeddings
- **Accuracy**: State-of-the-art speaker verification performance

### Audio Requirements
- **Format**: WAV files
- **Sample Rate**: 16kHz (recommended)
- **Duration**: 3-10 seconds for optimal results
- **Quality**: Clear speech, minimal background noise

### Threshold Guidelines
- **0.3-0.4**: Very permissive (high false accept rate)
- **0.5**: Balanced (recommended default)
- **0.6-0.7**: Strict (low false accept rate)
- **0.8+**: Very strict (may reject legitimate users)

## Installation & Setup

1. **Install Dependencies:**
```bash
pip install -r Backend/requirements.txt
```

2. **Start the Server:**
```bash
uvicorn Backend.main:app --reload
```

3. **Access API Documentation:**
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Testing

Run the test script to verify API functionality:
```bash
python test_api.py
```

## File Structure

```
Backend/
├── api/
│   └── routes.py          # API endpoints
├── services/
│   ├── challenge.py       # Challenge phrase generation
│   ├── ecapa_utils.py     # Speaker recognition utilities
│   ├── matcher.py         # Voice matching logic
│   └── whisper_utils.py   # Whisper integration (future)
├── main.py                # FastAPI application
└── requirements.txt       # Python dependencies
```

## Error Handling

The API includes comprehensive error handling for:
- Missing audio files
- Invalid user IDs
- Unenrolled users
- Audio processing errors
- Model initialization failures

## Security Considerations

- Store embeddings securely in production
- Implement proper user authentication
- Use HTTPS in production
- Consider rate limiting for API endpoints
- Validate audio file formats and sizes

## Future Enhancements

- Database integration for persistent storage
- Whisper ASR for challenge phrase verification
- Multi-factor authentication support
- Real-time audio streaming
- Mobile SDK integration 