import torchaudio
from speechbrain.inference.speaker import EncoderClassifier, SpeakerRecognition
import os
from typing import Optional, Tuple, Union
import numpy as np

# Global classifier instance
classifier: Optional[EncoderClassifier] = None
verification: Optional[SpeakerRecognition] = None

def _initialize_classifier():
    """Initialize the ECAPA classifier if not already done."""
    global classifier, verification
    if classifier is None:
        classifier = EncoderClassifier.from_hparams(source="speechbrain/spkrec-ecapa-voxceleb")
        verification = SpeakerRecognition.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb",
            savedir="pretrained_models/spkrec-ecapa-voxceleb"
        )

def extract_speaker_embedding(file_path: str) -> np.ndarray:
    """
    Extract speaker embedding from an audio file using ECAPA model.
    
    Args:
        file_path (str): Path to the audio file
        
    Returns:
        numpy.ndarray: Speaker embedding vector
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")
    
    _initialize_classifier()
    if classifier is None:
        raise RuntimeError("Classifier failed to initialize")
    
    signal, fs = torchaudio.load(file_path)
    embedding = classifier.encode_batch(signal).squeeze().detach().cpu().numpy()
    return embedding

def verify_speakers(file1_path: str, file2_path: str) -> Tuple[float, bool]:
    """
    Verify if two audio files are from the same speaker.
    
    Args:
        file1_path (str): Path to first audio file
        file2_path (str): Path to second audio file
        
    Returns:
        tuple: (score, prediction) where score is similarity and prediction is boolean
    """
    if not os.path.exists(file1_path) or not os.path.exists(file2_path):
        raise FileNotFoundError("One or both audio files not found")
    
    _initialize_classifier()
    if verification is None:
        raise RuntimeError("Verification model failed to initialize")
    
    score, prediction = verification.verify_files(file1_path, file2_path)
    return score, prediction
