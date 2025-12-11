LLM API Wrapper for OpenRouter
Supports text and file_url content types for multimodal input
"""
from openai import OpenAI
import os

class LLMClient:
    """
    A wrapper for the OpenRouter API using the OpenAI SDK.
    Supports passing file URLs (PDF, HTML) directly to the LLM.
    """
    def __init__(self, model="google/gemini-2.5-flash"):
        self.model = model
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY")
        )

    def get_completion(self, messages, conversation_history=None, max_tokens=2048, temperature=0.7):
        """
        Get a completion from the LLM with optional conversation history.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
                     content can be:
                     - string: plain text
                     - list: multimodal content with text and file_url types
                       Example: [
                         {"type": "text", "text": "Analyze this report"},