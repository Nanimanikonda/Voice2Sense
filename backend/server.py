"""
Voice2Sense — Local Offline Backend
Uses faster-whisper for speech-to-text and IndicTrans2 for translation.
"""

import io
import os
import tempfile
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice2sense")

# ---------------------------------------------------------------------------
# Global model holders
# ---------------------------------------------------------------------------
whisper_model = None
translator_tokenizer = None
translator_model = None
models_loading = False
models_loaded = False

# IndicTrans2 language code mapping  (app code → IndicTrans2 BCP-47 tag)
LANG_MAP = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "te": "tel_Telu",
    "ta": "tam_Taml",
    "kn": "kan_Knda",
    "ml": "mal_Mlym",
    "mr": "mar_Deva",
    "bn": "ben_Beng",
    "gu": "guj_Gujr",
    "pa": "pan_Guru",
    "or": "ory_Orya",
    "as": "asm_Beng",
}

# Whisper language code mapping (app code → Whisper language name)
WHISPER_LANG_MAP = {
    "en": "en",
    "hi": "hi",
    "te": "te",
    "ta": "ta",
    "kn": "kn",
    "ml": "ml",
    "mr": "mr",
    "bn": "bn",
    "gu": "gu",
    "pa": "pa",
    "or": "or",
    "as": "as",
}


def load_models():
    """Load Whisper and IndicTrans2 models (called once on first request)."""
    global whisper_model, translator_tokenizer, translator_model
    global models_loading, models_loaded

    if models_loaded or models_loading:
        return

    models_loading = True
    logger.info("Loading Whisper model (small)...")

    try:
        from faster_whisper import WhisperModel
        whisper_model = WhisperModel(
            "small",
            device="cpu",
            compute_type="int8",
        )
        logger.info("Whisper model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load Whisper model: {e}")

    logger.info("Loading Translation model (NLLB)...")
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

        model_name = "facebook/nllb-200-distilled-600M"
        translator_tokenizer = AutoTokenizer.from_pretrained(
            model_name,
        )
        translator_model = AutoModelForSeq2SeqLM.from_pretrained(
            model_name,
        )
        logger.info("Translation model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load Translation model: {e}")

    models_loaded = True
    models_loading = False
    logger.info("All models ready.")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eagerly start model loading in background
    import threading
    threading.Thread(target=load_models, daemon=True).start()
    yield

app = FastAPI(title="Voice2Sense Offline Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "whisperLoaded": whisper_model is not None,
        "translatorLoaded": translator_model is not None,
        "modelsLoading": models_loading,
    }


# ---------------------------------------------------------------------------
# Transcribe endpoint
# ---------------------------------------------------------------------------
@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
):
    if whisper_model is None:
        load_models()
        if whisper_model is None:
            raise HTTPException(503, "Whisper model not loaded yet")

    # Save uploaded audio to a temp file
    audio_bytes = await audio.read()
    if len(audio_bytes) == 0:
        return {"text": "", "language": language or "en"}

    suffix = ".webm" if audio.content_type and "webm" in audio.content_type else ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        whisper_lang = WHISPER_LANG_MAP.get(language) if language else None
        segments, info = whisper_model.transcribe(
            tmp_path,
            language=whisper_lang,
            beam_size=5,
            vad_filter=True,
        )
        text = " ".join(seg.text.strip() for seg in segments)
        detected_lang = info.language if info else (language or "en")
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(500, f"Transcription error: {str(e)}")
    finally:
        os.unlink(tmp_path)

    return {"text": text, "language": detected_lang}


# ---------------------------------------------------------------------------
# Translate endpoint
# ---------------------------------------------------------------------------
class TranslateRequest(BaseModel):
    text: str
    sourceLanguage: str
    targetLanguage: str


@app.post("/translate")
async def translate(req: TranslateRequest):
    if translator_model is None or translator_tokenizer is None:
        load_models()
        if translator_model is None:
            raise HTTPException(503, "Translation model not loaded yet")

    src_tag = LANG_MAP.get(req.sourceLanguage)
    tgt_tag = LANG_MAP.get(req.targetLanguage)

    if not src_tag or not tgt_tag:
        raise HTTPException(
            400,
            f"Unsupported language pair: {req.sourceLanguage} → {req.targetLanguage}",
        )

    if not req.text.strip():
        return {"translatedText": ""}

    try:
        import torch

        # NLLB uses src_lang and forced_bos_token_id
        translator_tokenizer.src_lang = src_tag
        inputs = translator_tokenizer(
            req.text,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512,
        )

        with torch.no_grad():
            generated = translator_model.generate(
                **inputs,
                forced_bos_token_id=translator_tokenizer.convert_tokens_to_ids(tgt_tag),
                max_length=512,
                num_beams=5,
                num_return_sequences=1,
            )

        translated = translator_tokenizer.decode(
            generated[0], skip_special_tokens=True
        )
        return {"translatedText": translated.strip()}

    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(500, f"Translation error: {str(e)}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
