import traceback
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice2sense")

logger.info("Loading IndicTrans2 model...")
try:
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

    model_name = "ai4bharat/indictrans2-en-indic-dist-200M"
    logger.info("loading tokenizer...")
    translator_tokenizer = AutoTokenizer.from_pretrained(
        model_name, trust_remote_code=True
    )
    logger.info("loading model...")
    translator_model = AutoModelForSeq2SeqLM.from_pretrained(
        model_name, trust_remote_code=True
    )
    logger.info("IndicTrans2 model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load IndicTrans2 model: {e}")
    traceback.print_exc()
