import logging
import re
import os
import json
from typing import Any, Dict, List

# Central Logger Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

def get_logger(module_name: str) -> logging.Logger:
    """Returns a pre-configured logger instance."""
    return logging.getLogger(f"TalentMind-AI.{module_name}")

logger = get_logger("Utils")

def clean_text(text: str) -> str:
    """
    Cleans text by removing unnecessary whitespaces, special chars,
    and converting to lowercase for better NLP/Embedding indexing.
    """
    if not text:
        return ""
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)
    return text.lower()

def load_json_file(file_path: str) -> List[Dict[str, Any]]:
    """Loads a JSON file safely with error handling."""
    if not os.path.exists(file_path):
        logger.warning(f"File {file_path} not found. Returning empty list.")
        return []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load JSON file {file_path}: {e}")
        return []

def save_json_file(data: Any, file_path: str) -> bool:
    """Saves data to a JSON file safely with directory creation."""
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        logger.error(f"Failed to save JSON to {file_path}: {e}")
        return False
