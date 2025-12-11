import { describe, it, expect } from "vitest";
import { spawn } from "child_process";

/**
 * Test to validate that OPENROUTER_API_KEY is correctly configured
 * and can successfully make API calls to OpenRouter
 */
describe("OpenRouter API Key Validation", () => {
  it("should have OPENROUTER_API_KEY environment variable set", () => {
    expect(process.env.OPENROUTER_API_KEY).toBeDefined();
    expect(process.env.OPENROUTER_API_KEY).not.toBe("");
    expect(process.env.OPENROUTER_API_KEY).toMatch(/^sk-or-v1-/);
  });

  it("should successfully make a simple API call to OpenRouter", async () => {
    // Create a minimal Python script to test the API
    const testScript = `
import os
import sys
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

try:
    completion = client.chat.completions.create(
        model="google/gemini-2.5-flash",
        messages=[
            {"role": "user", "content": "Say 'test successful' and nothing else"}
        ],
        max_tokens=10
    )
    print(completion.choices[0].message.content)
    sys.exit(0)
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)
`;

    return new Promise<void>((resolve, reject) => {
      const pythonProcess = spawn("/usr/bin/python3.11", ["-c", testScript], {
        env: {
          ...process.env,
          OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
          PYTHONPATH: "/usr/local/lib/python3.11/dist-packages:/usr/lib/python3/dist-packages",
        },
      });

      let stdout = "";
      let stderr = "";

      pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`API test failed: ${stderr}`));
        } else {
          expect(stdout.toLowerCase()).toContain("test");
          resolve();
        }
      });
    });
  }, 30000); // 30 second timeout for API call
});
