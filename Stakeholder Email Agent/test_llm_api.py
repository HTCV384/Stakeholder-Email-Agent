"""
Unit tests for LLM API Client
"""
import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from utils.llm_api import LLMClient
from tests.fixtures.mock_llm import MockLLMClient

class TestLLMClient:
    """Test suite for LLMClient"""
    
    def test_initialization(self):
        """Test LLM client initialization"""
        client = MockLLMClient(model="google/gemini-2.5-flash")
        assert client.model == "google/gemini-2.5-flash"
        assert client.call_count == 0
    
    def test_get_completion_basic(self):
        """Test basic completion request"""
        client = MockLLMClient()
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Generate an email"}
        ]
        
        response = client.get_completion(messages)
        
        assert response is not None
        assert isinstance(response, str)
        assert client.call_count == 1
    
    def test_get_completion_with_parameters(self):
        """Test completion with custom parameters"""
        client = MockLLMClient()
        messages = [{"role": "user", "content": "Test"}]
        
        response = client.get_completion(messages, max_tokens=500, temperature=0.5)
        
        assert response is not None
        assert client.call_count == 1
    
    def test_get_completion_tracks_calls(self):
        """Test that client tracks call count"""
        client = MockLLMClient()
        messages = [{"role": "user", "content": "Test"}]
        
        client.get_completion(messages)
        client.get_completion(messages)
        client.get_completion(messages)
        
        assert client.call_count == 3
    
    def test_get_completion_stores_last_messages(self):
        """Test that client stores last messages"""
        client = MockLLMClient()
        messages = [{"role": "user", "content": "Test message"}]
        
        client.get_completion(messages)
        
        assert client.last_messages == messages
    
    def test_reset(self):
        """Test client reset functionality"""
        client = MockLLMClient()
        messages = [{"role": "user", "content": "Test"}]
        
        client.get_completion(messages)
        assert client.call_count == 1
        
        client.reset()
        assert client.call_count == 0
        assert client.last_messages is None

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
