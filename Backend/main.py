from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Backend.api.routes import router

app = FastAPI(
    title="Truevoice Voice Verification API",
    description="Liveness + Identity Verification using Whisper & ECAPA",
    version="1.0.0"
)

# Allow all CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Register API routes
app.include_router(router)
