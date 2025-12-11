import { describe, it, expect } from "vitest";

describe("Email generation field mapping", () => {
  it("should correctly map email_subject and email_body fields", () => {
    // Simulate Python bridge response
    const pythonResponse = {
      emails: [
        {
          stakeholder_name: "Dr. John Smith",
          stakeholder_title: "Chief Medical Officer",
          email_subject: "Improving Patient Outcomes at Test Hospital",
          email_body: "Dear Dr. Smith,\n\nI hope this message finds you well...",
          quality_score: 8.5,
          reflection_notes: "High quality email with clinical focus",
          generation_mode: "ai_style"
        }
      ]
    };

    // Simulate the mapping logic from workflowRouter
    const emailRecords = pythonResponse.emails.map((email: any) => ({
      subject: email.email_subject || email.subject || 'No subject',
      body: email.email_body || email.body || 'No body generated',
      qualityScore: email.quality_score ? Math.round(email.quality_score * 10) : null,
      reflectionNotes: email.reflection_notes || null,
    }));

    expect(emailRecords[0].subject).toBe("Improving Patient Outcomes at Test Hospital");
    expect(emailRecords[0].body).toContain("Dear Dr. Smith");
    expect(emailRecords[0].qualityScore).toBe(85);
    expect(emailRecords[0].reflectionNotes).toBe("High quality email with clinical focus");
  });

  it("should handle fallback to subject/body fields", () => {
    const pythonResponse = {
      emails: [
        {
          subject: "Fallback Subject",
          body: "Fallback body content",
          quality_score: 7.0,
        }
      ]
    };

    const emailRecords = pythonResponse.emails.map((email: any) => ({
      subject: email.email_subject || email.subject || 'No subject',
      body: email.email_body || email.body || 'No body generated',
      qualityScore: email.quality_score ? Math.round(email.quality_score * 10) : null,
    }));

    expect(emailRecords[0].subject).toBe("Fallback Subject");
    expect(emailRecords[0].body).toBe("Fallback body content");
    expect(emailRecords[0].qualityScore).toBe(70);
  });

  it("should use defaults when fields are missing", () => {
    const pythonResponse = {
      emails: [
        {
          stakeholder_name: "Jane Doe",
          quality_score: 0,
        }
      ]
    };

    const emailRecords = pythonResponse.emails.map((email: any) => ({
      subject: email.email_subject || email.subject || 'No subject',
      body: email.email_body || email.body || 'No body generated',
      qualityScore: email.quality_score ? Math.round(email.quality_score * 10) : null,
    }));

    expect(emailRecords[0].subject).toBe("No subject");
    expect(emailRecords[0].body).toBe("No body generated");
    expect(emailRecords[0].qualityScore).toBe(null); // 0 is falsy, so returns null
  });
});
