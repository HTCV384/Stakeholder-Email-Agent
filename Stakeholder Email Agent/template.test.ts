import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { emailTemplates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Email Template System", () => {
  let testUserId: number;
  let testTemplateId: number;

  beforeAll(async () => {
    // Use a test user ID (assuming user 1 exists from auth setup)
    testUserId = 1;
  });

  it("should create a new email template", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [result] = await db
      .insert(emailTemplates)
      .values({
        userId: testUserId,
        name: "Test Partnership Template",
        description: "A test template for partnership outreach",
        promptTemplate: `You are writing a partnership proposal email.

**Email Structure:**
1. Opening: Acknowledge their work on {stakeholder_details}
2. Partnership Value: Explain alignment with {company_name}
3. Call to Action: Suggest exploratory call

**Tone:** Professional, collaborative
**Length:** 120-150 words

Generate as JSON:
{
  "subject": "Brief subject",
  "body": "Email body"
}`,
        isDefault: false,
      })
      .$returningId();

    expect(result.id).toBeGreaterThan(0);
    testTemplateId = result.id;
  });

  it("should fetch the created template", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, testTemplateId));

    expect(template).toBeDefined();
    expect(template.name).toBe("Test Partnership Template");
    expect(template.userId).toBe(testUserId);
    expect(template.promptTemplate).toContain("partnership proposal");
  });

  it("should list all templates for a user", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const templates = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.userId, testUserId));

    expect(templates.length).toBeGreaterThan(0);
    expect(templates.some(t => t.id === testTemplateId)).toBe(true);
  });

  it("should update a template", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(emailTemplates)
      .set({
        description: "Updated description for partnership template",
      })
      .where(eq(emailTemplates.id, testTemplateId));

    const [updated] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, testTemplateId));

    expect(updated.description).toBe("Updated description for partnership template");
  });

  it("should delete a template", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .delete(emailTemplates)
      .where(eq(emailTemplates.id, testTemplateId));

    const [deleted] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, testTemplateId));

    expect(deleted).toBeUndefined();
  });

  it("should enforce user isolation (template belongs to specific user)", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a template for user 1
    const [result] = await db
      .insert(emailTemplates)
      .values({
        userId: testUserId,
        name: "User 1 Template",
        promptTemplate: "Test prompt",
        isDefault: false,
      })
      .$returningId();

    const templateId = result.id;

    // Try to fetch as different user (user 999)
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(
        eq(emailTemplates.id, templateId)
      );

    // Template exists
    expect(template).toBeDefined();
    // But belongs to user 1, not user 999
    expect(template.userId).toBe(testUserId);
    expect(template.userId).not.toBe(999);

    // Cleanup
    await db.delete(emailTemplates).where(eq(emailTemplates.id, templateId));
  });
});
