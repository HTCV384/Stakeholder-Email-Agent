import { describe, it, expect, beforeAll } from "vitest";
import { createWorkflow, createStakeholders, createEmails, updateEmail, getWorkflowEmails } from "./db";

describe("updateEmail mutation", () => {
  let workflowId: number;
  let stakeholderId: number;
  let emailId: number;

  beforeAll(async () => {
    // Create test workflow
    workflowId = await createWorkflow({
      userId: 1, // Test user ID
      reportUrl: "https://example.com/test.pdf",
      reportFilename: "test.pdf",
      status: "ready",
      companySummary: "Test company",
    });

    // Create test stakeholder
    await createStakeholders([{
      workflowId,
      name: "John Doe",
      title: "CEO",
      department: "Executive",
      influence: "High",
      concerns: "Budget",
      relevantContext: "Decision maker",
      isSelected: true,
    }]);

    // Get stakeholder ID
    const stakeholders = await import("./db").then(m => m.getWorkflowStakeholders(workflowId));
    stakeholderId = stakeholders[0].id;

    // Create test email
    await createEmails([{
      workflowId,
      stakeholderId,
      subject: "Original Subject",
      body: "Original email body content",
      generationMode: "ai_style",
      modeConfig: JSON.stringify({ style_key: "healthcare_professional" }),
      qualityScore: 80,
      reflectionNotes: "Test reflection",
    }]);

    // Get email ID
    const emails = await getWorkflowEmails(workflowId);
    emailId = emails[0].id;
  });

  it("should update email body successfully", async () => {
    const newBody = "Updated email body with new content";

    // Update the email
    await updateEmail(emailId, { body: newBody });

    // Verify the update
    const emails = await getWorkflowEmails(workflowId);
    const updatedEmail = emails.find(e => e.id === emailId);

    expect(updatedEmail).toBeDefined();
    expect(updatedEmail?.body).toBe(newBody);
    expect(updatedEmail?.subject).toBe("Original Subject"); // Subject should remain unchanged
  });

  it("should preserve other fields when updating body", async () => {
    const anotherNewBody = "Another updated body";

    await updateEmail(emailId, { body: anotherNewBody });

    const emails = await getWorkflowEmails(workflowId);
    const updatedEmail = emails.find(e => e.id === emailId);

    expect(updatedEmail?.body).toBe(anotherNewBody);
    expect(updatedEmail?.subject).toBe("Original Subject");
    expect(updatedEmail?.qualityScore).toBe(80);
    expect(updatedEmail?.reflectionNotes).toBe("Test reflection");
    expect(updatedEmail?.stakeholderId).toBe(stakeholderId);
  });

  it("should handle partial updates correctly", async () => {
    // Update only the subject
    await updateEmail(emailId, { subject: "New Subject Line" });

    const emails = await getWorkflowEmails(workflowId);
    const updatedEmail = emails.find(e => e.id === emailId);

    expect(updatedEmail?.subject).toBe("New Subject Line");
    // Body should still be the last updated value
    expect(updatedEmail?.body).toBe("Another updated body");
  });
});
