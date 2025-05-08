import json
import os
import tempfile
from kokoro import KPipeline
import soundfile as sf
import torch
from pydub import AudioSegment
from datetime import datetime
import uuid
def generate_podcast_audio(dialogue_json_str:str,space_id: str):

    try:
        dialogue_data = json.loads(dialogue_json_str)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None
    
    pipeline = KPipeline(lang_code='a')

    audio_folder = os.path.join(os.path.dirname(__file__),"audio_files")
    if not os.path.exists(audio_folder):
        os.makedirs(audio_folder)
    
    audio_files = []

    for idx, entry in enumerate(dialogue_data):
        text = entry['text']
        speaker = entry['speaker']

        voice = 'af_bella' if speaker.lower() == 'expert' else 'am_fenrir'

        generator = pipeline(
            text,
            voice=voice,
            speed=1,
            split_pattern=r'\n+'
        )

        for i, (gs, ps, audio) in enumerate(generator):
            filename = f"{idx}_{i}.wav"
            filepath = os.path.join(audio_folder, filename)
            sf.write(filepath, audio, 24000)
            audio_files.append(filepath)
            print(f"Saved: {filepath}")
    
    # Concatenation logic (modified)
    podcast_folder = os.path.join(
        os.path.dirname(__file__), 
        "..",  # Move up one level from services directory
        "podcasts", 
        f"space_{space_id}"
    )
    os.makedirs(podcast_folder, exist_ok=True)

    # Update output path
    output_file = f"podcast_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}.wav"
    output_path = os.path.join(podcast_folder, output_file)

    if audio_files:
        try:
            combined = AudioSegment.empty()
            # Remove sorting - use original order
            for file_path in audio_files:
                sound = AudioSegment.from_wav(file_path)
                combined += sound
            
            # output_path = os.path.join(podcast_folder, output_file)
            combined.export(output_path, format="wav")
            print(f"Concatenated podcast saved to {output_path}")
            for file_path in audio_files:
                os.remove(file_path)
            return output_path
        except Exception as e:
            print(f"Error concatenating audio files: {e}")
            return None

    return output_path
