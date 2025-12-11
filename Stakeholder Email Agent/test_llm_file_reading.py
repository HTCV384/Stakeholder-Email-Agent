#!/usr/bin/python3.11
"""
Simple test script to verify LLM can read PDF files from URLs
"""
import os
import sys
import json
from openai import OpenAI

# Initialize OpenAI client with OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# Test PDF URL (MedStar Franklin PDF uploaded to S3)
# We'll need to get this from a recent workflow
test_pdf_url = "https://manus-user-file-storage.s3.us-east-1.amazonaws.com/i8fc66xwh8fh5ooy47kso/StrategicSalesReport_MedStarFranklinSquareMedicalCenter.pdf"

print("Testing LLM file reading capability...")
print(f"PDF URL: {test_pdf_url}\n")

# Test 1: Simple text extraction
print("=" * 80)
print("TEST 1: Ask LLM to summarize the document")
print("=" * 80)

try:
    response = client.chat.completions.create(
        model="google/gemini-2.5-flash",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Please read the attached PDF document and provide a brief 2-sentence summary of what it contains."
                    },
                    {
                        "type": "file_url",
                        "file_url": {
                            "url": test_pdf_url,
                            "mime_type": "application/pdf"
                        }
                    }
                ]
            }
        ]
    )
    
    print(f"Response: {response.choices[0].message.content}\n")
    
except Exception as e:
    print(f"ERROR: {e}\n")

# Test 2: Structured JSON extraction
print("=" * 80)
print("TEST 2: Ask LLM to extract stakeholders as JSON")
print("=" * 80)

try:
    response = client.chat.completions.create(
        model="google/gemini-2.5-flash",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Please read the attached PDF document and identify key stakeholders mentioned in the report.

For each stakeholder, extract:
1. Full name
2. Job title/role
3. Brief details about their role

Format your response as a JSON array. Return ONLY the JSON array with no additional text:
[
  {
    "name": "Full Name",
    "title": "Job Title",
    "details": "Brief details..."
  }
]

IMPORTANT: Return ONLY the raw JSON array. Do not wrap it in markdown code blocks."""
                    },
                    {
                        "type": "file_url",
                        "file_url": {
                            "url": test_pdf_url,
                            "mime_type": "application/pdf"
                        }
                    }
                ]
            }
        ]
    )
    
    content = response.choices[0].message.content
    print(f"Raw response:\n{content}\n")
    
    # Try to parse as JSON
    try:
        # Strip markdown code blocks if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()
        
        stakeholders = json.loads(content)
        print(f"Parsed {len(stakeholders)} stakeholders successfully!")
        print(json.dumps(stakeholders, indent=2))
    except json.JSONDecodeError as je:
        print(f"Failed to parse JSON: {je}")
        
except Exception as e:
    print(f"ERROR: {e}\n")

print("\n" + "=" * 80)
print("Test complete!")
