from fastapi import FastAPI
from Backend.api.routes import router

app = FastAPI(
    title="Truevoice Voice Verification API",
    description="Liveness + Identity Verification using Whisper & ECAPA",
    version="1.0.0"
)

# Register API routes
app.include_router(router)
