"""
Live API Integration Tests
Tests actual OpenRouter API calls with Gemini 2.5 Flash

Run with: pytest tests/integration/test_live_api.py -v
Skip with: pytest tests/integration/test_live_api.py -v -m "not live"
"""
import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from utils.llm_api import LLMClient

@pytest.mark.live
class TestLiveAPIIntegration:
    """Test suite for live API calls to OpenRouter with Gemini 2.5 Flash"""
    
    @pytest.fixture
    def client(self):
        """Create a real LLM client"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            pytest.skip("OPENROUTER_API_KEY not set")
        return LLMClient(model="google/gemini-2.5-flash")
    
    def test_client_initialization(self, client):
        """Test that client initializes with correct model"""
        assert client.model == "google/gemini-2.5-flash"
        assert client.client is not None
    
    def test_simple_completion(self, client):
        """Test a simple completion request"""
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello, I am Gemini 2.5 Flash' and nothing else."}
        ]
        
        response = client.get_completion(messages, max_tokens=50, temperature=0.0)
        
        assert response is not None
        assert isinstance(response, str)
        assert len(response) > 0
        print(f"\n✓ Response received: {response}")
    
    def test_json_output(self, client):
        """Test JSON output generation"""
        messages = [
            {"role": "system", "content": "You are a JSON generator."},
            {"role": "user", "content": 'Generate a JSON object with fields "name" and "title". Return ONLY the JSON, no additional text.'}
        ]
        
        response = client.get_completion(messages, max_tokens=100, temperature=0.0)
        
        assert response is not None
        # Should contain JSON structure
        assert "{" in response and "}" in response
        print(f"\n✓ JSON response: {response}")
    
    def test_stakeholder_extraction_prompt(self, client):
        """Test with a real stakeholder extraction prompt"""
        report = """
        Company: TechCorp
        
        Key Stakeholders:
        1. Jane Smith - CTO - Leading AI initiatives
        2. John Doe - VP Engineering - Managing development teams
        """
        
        messages = [
            {"role": "system", "content": "You are an expert at extracting structured information."},
            {"role": "user", "content": f"""Extract stakeholders from this report and return as JSON array with fields: name, title, details.

Report:
{report}

Return ONLY the JSON array, no additional text."""}
        ]
        
        response = client.get_completion(messages, max_tokens=500, temperature=0.0)
        
        assert response is not None
        assert "Jane Smith" in response or "jane smith" in response.lower()
        assert "CTO" in response or "cto" in response.lower()
        print(f"\n✓ Stakeholder extraction response: {response[:200]}...")
    
    def test_email_generation_prompt(self, client):
        """Test with a real email generation prompt"""
        messages = [
            {"role": "system", "content": "You are a professional email writer."},
            {"role": "user", "content": """Write a brief professional email to Dr. Jane Smith, CTO at TechCorp, about AI optimization solutions. Format as JSON with "subject" and "body" fields. Return ONLY the JSON."""}
        ]
        
        response = client.get_completion(messages, max_tokens=500, temperature=0.7)
        
        assert response is not None
        assert "subject" in response.lower()
        assert "body" in response.lower()
        print(f"\n✓ Email generation response: {response[:200]}...")
    
    def test_model_name_verification(self, client):
        """Verify we're using the correct model"""
        # The model name should be set correctly
        assert client.model == "google/gemini-2.5-flash"
        
        # Make a simple call to verify it works
        messages = [{"role": "user", "content": "Respond with: OK"}]
        response = client.get_completion(messages, max_tokens=10, temperature=0.0)
        
        assert response is not None
        print(f"\n✓ Model verification successful: {client.model}")
        print(f"✓ Response: {response}")
    
    def test_error_handling_invalid_api_key(self):
        """Test error handling with invalid API key"""
        # Temporarily use invalid key
        original_key = os.getenv("OPENROUTER_API_KEY")
        os.environ["OPENROUTER_API_KEY"] = "invalid_key_12345"
        
        client = LLMClient(model="google/gemini-2.5-flash")
        messages = [{"role": "user", "content": "Test"}]
        
        response = client.get_completion(messages)
        
        # Should return None on error
        assert response is None
        
        # Restore original key
        if original_key:
            os.environ["OPENROUTER_API_KEY"] = original_key
        
        print("\n✓ Error handling verified")

if __name__ == "__main__":
    # Run with live tests enabled
    pytest.main([__file__, "-v", "-s"])
