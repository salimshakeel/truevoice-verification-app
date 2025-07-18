from pydub import AudioSegment
import os

def convert_to_wav(input_path: str, output_path: str):
    """
    Convert any audio file format to WAV using pydub.
    Requires ffmpeg to be installed and added to PATH.
    """
    audio = AudioSegment.from_file(input_path)
    audio.export(output_path, format="wav")
