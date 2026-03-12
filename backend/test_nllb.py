import traceback
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice2sense")

try:
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

    model_name = "facebook/nllb-200-distilled-600M"
    logger.info("loading tokenizer NLLB...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    logger.info("loading model NLLB...")
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    logger.info("NLLB model loaded successfully.")

    # Test an English to Telugu translation
    text = "Hello, how are you today?"
    tokenizer.src_lang = "eng_Latn"
    inputs = tokenizer(text, return_tensors="pt")
    translated_tokens = model.generate(
        **inputs, forced_bos_token_id=tokenizer.lang_code_to_id["tel_Telu"], max_length=30
    )
    res = tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]
    logger.info(f"Translation Output: {res}")
except Exception as e:
    logger.error(f"Failed to load NLLB model: {e}")
    traceback.print_exc()
