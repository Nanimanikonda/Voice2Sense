from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import os
import tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model using faster-whisper
# "tiny" is very fast and uses minimal memory.
# device="cpu" and compute_type="int8" ensures it runs efficiently on Render's free tier.
print("Loading faster-whisper model... (This may take a moment)")
try:
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    print("faster-whisper model loaded successfully! Ready for connections.")
except Exception as e:
    print(f"Error loading model: {e}")
    raise e

@app.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")
    
    try:
        while True:
            # Receive audio bytes
            data = await websocket.receive_bytes()
            
            # Create a temporary file to save the chunk
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
                temp_audio.write(data)
                temp_audio_path = temp_audio.name

            try:
                # Transcribe using faster-whisper
                # model.transcribe returns a generator of segments
                segments, info = model.transcribe(temp_audio_path, beam_size=5)
                
                # Combine all segments into a single string
                text = " ".join([segment.text for segment in segments]).strip()
                
                if text:
                    await websocket.send_text(text)
            finally:
                # Clean up temp file
                if os.path.exists(temp_audio_path):
                    os.remove(temp_audio_path)
                    
    except Exception as e:
        print(f"Connection closed: {e}")
