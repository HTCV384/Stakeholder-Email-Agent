"""
Unit tests for Prompt Modules
"""
import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from prompts.ai_generated_styles import (
    get_style_prompt,
    list_available_styles,
    AI_GENERATED_STYLES
)
from prompts.editable_templates import (
    get_template,
    list_available_templates,
    EDITABLE_TEMPLATES
)
from prompts.custom_prompt_handler import (
    build_custom_prompt,
    validate_custom_prompt,
    get_example_prompts
)

class TestAIGeneratedStyles:
    """Test suite for AI-generated style prompts"""
    
    def test_all_styles_exist(self):
        """Test that all expected styles are defined"""
        expected_styles = [
            "healthcare_professional",
            "casual_broy",
            "technical_direct",
            "executive_brief",
            "consultative"
        ]
        
        for style_key in expected_styles:
            assert style_key in AI_GENERATED_STYLES
    
    def test_get_style_prompt(self):
        """Test retrieving a style prompt"""
        style = get_style_prompt("technical_direct")
        
        assert style is not None
        assert "name" in style
        assert "description" in style
        assert "generation_prompt" in style
    
    def test_get_invalid_style(self):
        """Test retrieving invalid style returns None"""
        style = get_style_prompt("nonexistent_style")
        assert style is None
    
    def test_list_available_styles(self):
        """Test listing all available styles"""
        styles = list_available_styles()
        
        assert len(styles) == 5
        assert all(len(item) == 3 for item in styles)  # (key, name, description)
    
    def test_casual_broy_style_exists(self):
        """Test that casual bro-y style is properly defined"""
        style = get_style_prompt("casual_broy")
        
        assert style is not None
        assert "Casual Bro-y" in style["name"]
        assert "bro" in style["generation_prompt"].lower()
        assert "direct" in style["description"].lower()
    
    def test_healthcare_professional_style_exists(self):
        """Test that healthcare professional style is properly defined"""
        style = get_style_prompt("healthcare_professional")
        
        assert style is not None
        assert "Healthcare" in style["name"]
        assert "clinical" in style["generation_prompt"].lower()
        assert "formal" in style["description"].lower() or "professional" in style["name"].lower()
    
    def test_style_prompts_have_placeholders(self):
        """Test that style prompts have required placeholders"""
        required_placeholders = [
            "{stakeholder_name}",
            "{stakeholder_title}",
            "{company_name}",
            "{relevant_context}"
        ]
        
        for style_key in AI_GENERATED_STYLES:
            style = get_style_prompt(style_key)
            prompt = style["generation_prompt"]
            
            for placeholder in required_placeholders:
                assert placeholder in prompt, f"{style_key} missing {placeholder}"

class TestEditableTemplates:
    """Test suite for editable templates"""
    
    def test_all_templates_exist(self):
        """Test that all expected templates are defined"""
        expected_templates = [
            "problem_solution",
            "casual_broy",
            "partnership"
        ]
        
        for template_key in expected_templates:
            assert template_key in EDITABLE_TEMPLATES
    
    def test_get_template(self):
        """Test retrieving a template"""
        template = get_template("problem_solution")
        
        assert template is not None
        assert "name" in template
        assert "description" in template
        assert "user_fields" in template
        assert "structure" in template
        assert "generation_prompt" in template
    
    def test_get_invalid_template(self):
        """Test retrieving invalid template returns None"""
        template = get_template("nonexistent_template")
        assert template is None
    
    def test_list_available_templates(self):
        """Test listing all available templates"""
        templates = list_available_templates()
        
        assert len(templates) == 3
        assert all(len(item) == 3 for item in templates)  # (key, name, description)
    
    def test_casual_broy_template_exists(self):
        """Test that casual bro-y template is properly defined"""
        template = get_template("casual_broy")
        
        assert template is not None
        assert "Casual" in template["name"]
        assert "user_fields" in template
        assert "subject" in template["user_fields"]
    
    def test_template_user_fields(self):
        """Test that templates have proper user fields"""
        template = get_template("problem_solution")
        
        assert "subject" in template["user_fields"]
        assert "opening" in template["user_fields"]
        assert "call_to_action" in template["user_fields"]

class TestCustomPromptHandler:
    """Test suite for custom prompt handler"""
    
    def test_build_custom_prompt(self):
        """Test building a custom prompt"""
        custom_instructions = "Write a friendly email about AI solutions."
        stakeholder_context = {
            "stakeholder_name": "Jane Smith",
            "stakeholder_title": "CTO",
            "stakeholder_details": "Leading AI initiatives",
            "company_name": "TechCorp",
            "company_summary": "Software company",
            "relevant_context": "Interested in AI optimization"
        }
        
        prompt = build_custom_prompt(custom_instructions, stakeholder_context)
        
        assert "Jane Smith" in prompt
        assert "CTO" in prompt
        assert "TechCorp" in prompt
        assert custom_instructions in prompt
    
    def test_validate_custom_prompt_valid(self):
        """Test validation of valid custom prompt"""
        valid_prompt = "Write a professional email introducing our AI platform."
        
        is_valid, error = validate_custom_prompt(valid_prompt)
        
        assert is_valid is True
        assert error is None
    
    def test_validate_custom_prompt_empty(self):
        """Test validation of empty prompt"""
        is_valid, error = validate_custom_prompt("")
        
        assert is_valid is False
        assert "empty" in error.lower()
    
    def test_validate_custom_prompt_too_short(self):
        """Test validation of too short prompt"""
        is_valid, error = validate_custom_prompt("Short")
        
        assert is_valid is False
        assert "short" in error.lower()
    
    def test_validate_custom_prompt_too_long(self):
        """Test validation of too long prompt"""
        long_prompt = "x" * 2001
        
        is_valid, error = validate_custom_prompt(long_prompt)
        
        assert is_valid is False
        assert "long" in error.lower()
    
    def test_get_example_prompts(self):
        """Test getting example prompts"""
        examples = get_example_prompts()
        
        assert len(examples) == 3
        assert all(isinstance(ex, str) for ex in examples)
        assert all(len(ex) > 50 for ex in examples)

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
