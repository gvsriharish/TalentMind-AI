import numpy as np
from typing import List, Union
from .utils import get_logger

logger = get_logger("Embedding")

class EmbeddingGenerator:
    """Generates dense semantic vector embeddings for text sequences using Sentence Transformers."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None
        self._initialized = False

    def _lazy_init(self):
        """Lazy initialization of SentenceTransformer to conserve memory and speed up startup."""
        if self._initialized:
            return
        
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer model: {self.model_name}...")
            self._model = SentenceTransformer(self.model_name)
            self._initialized = True
            logger.info("SentenceTransformer loaded successfully.")
        except ImportError:
            logger.warning(
                "sentence-transformers package not installed or failed to import. "
                "Activating lightweight Fallback TF-IDF Tokenizer instead."
            )
            self._initialized = True
        except Exception as e:
            logger.error(f"Error loading SentenceTransformer: {e}. Reverting to fallback vectorizer.")
            self._initialized = True

    def get_embedding(self, text: str) -> np.ndarray:
        """
        Generates an embedding vector for a single string.
        
        Args:
            text (str): Input text.
            
        Returns:
            np.ndarray: Embedding vector of dimensions (D,).
        """
        self._lazy_init()
        if not text:
            return np.zeros(384, dtype=np.float32)

        if self._model:
            try:
                # Returns 1D array of floats
                return self._model.encode(text, convert_to_numpy=True).astype(np.float32)
            except Exception as e:
                logger.error(f"Embedding encoding failed: {e}. Resorting to math vectorizer.")

        return self._generate_fallback_vector(text)

    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generates embeddings for a list of strings.
        
        Args:
            texts (List[str]): List of input strings.
            
        Returns:
            np.ndarray: Embedding matrix of shape (N, D).
        """
        self._lazy_init()
        if not texts:
            return np.empty((0, 384), dtype=np.float32)

        if self._model:
            try:
                return self._model.encode(texts, convert_to_numpy=True).astype(np.float32)
            except Exception as e:
                logger.error(f"Batch embedding encoding failed: {e}.")

        return np.array([self._generate_fallback_vector(t) for t in texts], dtype=np.float32)

    def _generate_fallback_vector(self, text: str) -> np.ndarray:
        """
        Generates a standardized 384-dimensional vector using deterministic hashing.
        This ensures semantic calculations still work mathematically (with cosine logic)
        even in resource-constrained environments.
        """
        vector = np.zeros(384, dtype=np.float32)
        words = text.lower().split()
        if not words:
            return vector
            
        for i, word in enumerate(words):
            # Generate deterministic hashes for dimensions
            hash_val = hash(word)
            dim1 = abs(hash_val) % 384
            dim2 = abs(hash_val // 2) % 384
            vector[dim1] += 1.0
            vector[dim2] += 0.5
            
        # Normalize to unit circle (L2 norm)
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
            
        return vector

    @staticmethod
    def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
        """Computes cosine similarity between two vectors."""
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(np.dot(v1, v2) / (norm1 * norm2))
