"""
Local Transformer-Based Sentiment Analysis
Uses DistilBERT (lightweight BERT variant) - runs completely offline
"""
import logging

try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

class LocalSentimentAnalyzer:
    def __init__(self):
        if not TRANSFORMERS_AVAILABLE:
            self.model = None
            return
        try:
            self.model = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                device=-1  # CPU mode for compatibility
            )
            logging.info("✅ Local DistilBERT Sentiment Model Loaded")
        except Exception as e:
            logging.error(f"Failed to load local sentiment model: {e}")
            self.model = None

    def analyze(self, text: str) -> dict:
        """
        Returns: {'label': 'POSITIVE'/'NEGATIVE', 'score': 0.0-1.0}
        """
        if not self.model or not text:
            return {"label": "Neutral", "score": 0.5}
        
        try:
            result = self.model(text[:512])[0]  # Truncate to model limit
            
            if result['label'] == 'POSITIVE':
                if result['score'] > 0.9:
                    return {"label": "Positive", "score": result['score']}
                else:
                    return {"label": "Neutral", "score": result['score']}
            else:  # NEGATIVE
                if result['score'] > 0.8:
                    return {"label": "Negative", "score": result['score']}
                else:
                    return {"label": "Neutral", "score": 1 - result['score']}
                    
        except Exception as e:
            logging.error(f"Local sentiment analysis error: {e}")
            return {"label": "Neutral", "score": 0.5}

# Global instance
local_analyzer = LocalSentimentAnalyzer()
