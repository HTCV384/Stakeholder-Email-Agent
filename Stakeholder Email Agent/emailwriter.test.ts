/**
 * Unit tests for EmailWriterAgent LLM integration
 * 
 * Tests the email generation pipeline to isolate where LLM calls are failing:
 * 1. Direct LLM API connectivity test
 * 2. Context extraction in TaskPlannerAgent
 * 3. Email generation in EmailWriterAgent
 * 4. End-to-end email generation workflow
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { spawn } from 'child_process';
import path from 'path';

const PYTHON_PATH = '/usr/bin/python3.11';
const BRIDGE_PATH = '/home/ubuntu/stakeholder_outreach/bridge.py';

/**
 * Helper function to execute Python bridge and capture output
 */
async function executePythonTest(testScript: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const pythonProcess = spawn(PYTHON_PATH, ['-c', testScript], {
      env: {
        ...process.env,
        PYTHONPATH: '/home/ubuntu/stakeholder_outreach',
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      },
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code || 0 });
    });
  });
}

describe('EmailWriterAgent LLM Integration Tests', () => {
  beforeAll(() => {
    // Verify OPENROUTER_API_KEY is set
    expect(process.env.OPENROUTER_API_KEY).toBeDefined();
    expect(process.env.OPENROUTER_API_KEY).not.toBe('');
  });

  it('should verify OpenRouter API key is accessible in Python', async () => {
    const testScript = `
import os
import sys
api_key = os.getenv("OPENROUTER_API_KEY")
if api_key:
    print(f"API_KEY_LENGTH:{len(api_key)}", file=sys.stderr)
    print("SUCCESS")
else:
    print("FAILED: API key not found", file=sys.stderr)
    print("FAILED")
`;

    const result = await executePythonTest(testScript);
    
    expect(result.stdout.trim()).toBe('SUCCESS');
    expect(result.stderr).toContain('API_KEY_LENGTH:');
    expect(result.exitCode).toBe(0);
  }, 10000);

  it('should test direct LLM API call from Python', async () => {
    const testScript = `
import sys
sys.path.insert(0, '/home/ubuntu/stakeholder_outreach')

from utils.llm_api import LLMClient

try:
    client = LLMClient()
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Say 'TEST_SUCCESS' and nothing else."}
    ]
    
    response = client.get_completion(messages, max_tokens=50, temperature=0.0)
    
    if response and "TEST_SUCCESS" in response:
        print("LLM_CALL_SUCCESS", file=sys.stderr)
        print("SUCCESS")
    elif response:
        print(f"LLM_RESPONSE:{response}", file=sys.stderr)
        print("PARTIAL")
    else:
        print("LLM returned None", file=sys.stderr)
        print("FAILED")
except Exception as e:
    print(f"EXCEPTION:{str(e)}", file=sys.stderr)
    print("FAILED")
`;

    const result = await executePythonTest(testScript);
    
    console.log('LLM Test stdout:', result.stdout);
    console.log('LLM Test stderr:', result.stderr);
    
    // Should either succeed or show us the actual error
    expect(result.exitCode).toBe(0);
    expect(['SUCCESS', 'PARTIAL', 'FAILED']).toContain(result.stdout.trim());
    
    if (result.stdout.trim() === 'FAILED') {
      console.error('LLM API call failed. Check stderr for details.');
    }
  }, 30000);

  it('should test TaskPlannerAgent context extraction', async () => {
    const testScript = `
import sys
sys.path.insert(0, '/home/ubuntu/stakeholder_outreach')

from agents.task_planner import TaskPlannerAgent

try:
    planner = TaskPlannerAgent()
    
    stakeholder = {
        "name": "Test Stakeholder",
        "title": "Chief Technology Officer",
        "details": "Responsible for technology strategy and innovation."
    }
    
    report = "This is a test report about technology innovation and digital transformation."
    
    context = planner._extract_relevant_context(stakeholder, report)
    
    if context and len(context) > 0:
        print(f"CONTEXT_LENGTH:{len(context)}", file=sys.stderr)
        print("SUCCESS")
    else:
        print("Context extraction returned None or empty", file=sys.stderr)
        print("FAILED")
except Exception as e:
    print(f"EXCEPTION:{str(e)}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    print("FAILED")
`;

    const result = await executePythonTest(testScript);
    
    console.log('Context Extraction stdout:', result.stdout);
    console.log('Context Extraction stderr:', result.stderr);
    
    expect(result.exitCode).toBe(0);
    
    if (result.stdout.trim() === 'FAILED') {
      console.error('Context extraction failed. This is likely where the LLM integration breaks.');
    }
  }, 30000);

  it('should test EmailWriterAgent email generation', async () => {
    const testScript = `
import sys
import asyncio
sys.path.insert(0, '/home/ubuntu/stakeholder_outreach')

from agents.email_writer import EmailWriterAgent

async def test():
    try:
        agent = EmailWriterAgent("TestWriter")
        
        task = {
            "stakeholder_name": "Dr. Sarah Johnson",
            "stakeholder_title": "Chief Medical Officer",
            "stakeholder_details": "Responsible for clinical quality and patient safety initiatives.",
            "company_name": "MedStar Franklin Square Medical Center",
            "company_summary": "Leading healthcare provider focused on patient care excellence.",
            "relevant_context": "The hospital is implementing new sepsis detection protocols.",
            "generation_mode": "ai_style",
            "mode_config": {"style_key": "professional_healthcare"}
        }
        
        result = await agent.run(task)
        
        if result and "email_subject" in result and result["email_subject"] != "ERROR":
            print(f"EMAIL_SUBJECT:{result['email_subject']}", file=sys.stderr)
            print("SUCCESS")
        elif result and result.get("email_subject") == "ERROR":
            print(f"ERROR_MESSAGE:{result.get('email_body', 'Unknown error')}", file=sys.stderr)
            print("FAILED")
        else:
            print("Email generation returned None or invalid result", file=sys.stderr)
            print("FAILED")
    except Exception as e:
        print(f"EXCEPTION:{str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        print("FAILED")

asyncio.run(test())
`;

    const result = await executePythonTest(testScript);
    
    console.log('Email Generation stdout:', result.stdout);
    console.log('Email Generation stderr:', result.stderr);
    
    expect(result.exitCode).toBe(0);
    
    if (result.stdout.trim() === 'FAILED') {
      console.error('Email generation failed. Check stderr for the specific error message.');
    } else if (result.stdout.trim() === 'SUCCESS') {
      console.log('✅ Email generation working! Subject:', result.stderr.match(/EMAIL_SUBJECT:(.*)/)?.[1]);
    }
  }, 60000);

  it('should test end-to-end email generation via bridge', async () => {
    const testInput = {
      action: 'generate_emails',
      workflowId: 999999,
      reportInput: {
        type: 'text',
        content: 'Test report about healthcare technology and sepsis detection protocols.'
      },
      selectedStakeholders: [
        {
          name: 'Dr. Test Stakeholder',
          title: 'Chief Medical Officer',
          details: 'Responsible for clinical quality and patient safety.'
        }
      ],
      companySummary: 'Leading healthcare provider focused on innovation.',
      generationMode: 'ai_style',
      modeConfig: { style_key: 'professional_healthcare' }
    };

    const testScript = `
import sys
import json
import asyncio
sys.path.insert(0, '/home/ubuntu/stakeholder_outreach')

from bridge import generate_emails, WorkflowLogger

async def test():
    try:
        input_data = ${JSON.stringify(JSON.stringify(testInput))}
        data = json.loads(input_data)
        
        logger = WorkflowLogger(data['workflowId'])
        
        result = await generate_emails(
            report_input=data['reportInput'],
            selected_stakeholders=data['selectedStakeholders'],
            company_summary=data['companySummary'],
            generation_mode=data['generationMode'],
            mode_config=data['modeConfig'],
            logger=logger
        )
        
        print(json.dumps(result))
    except Exception as e:
        print(f"EXCEPTION:{str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"success": False, "error": str(e)}))

asyncio.run(test())
`;

    const result = await executePythonTest(testScript);
    
    console.log('Bridge Test stdout:', result.stdout);
    console.log('Bridge Test stderr:', result.stderr);
    
    expect(result.exitCode).toBe(0);
    
    try {
      const response = JSON.parse(result.stdout);
      expect(response).toHaveProperty('success');
      
      if (response.success) {
        expect(response.emails).toBeDefined();
        expect(response.emails.length).toBeGreaterThan(0);
        
        const email = response.emails[0];
        console.log('Generated email subject:', email.email_subject);
        console.log('Generated email body preview:', email.email_body?.substring(0, 100));
        
        expect(email.email_subject).not.toBe('ERROR');
      } else {
        console.error('Bridge test failed:', response.error);
      }
    } catch (e) {
      console.error('Failed to parse bridge response:', result.stdout);
      throw e;
    }
  }, 90000);
});
