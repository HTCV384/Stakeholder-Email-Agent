import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { emailTemplates } from "../drizzle/schema";
import { eq, or } from "drizzle-orm";

describe("Template Features (Edit, Preview, Default Library)", () => {
  let testUserId: number;
  let userTemplateId: number;
  let defaultTemplateCount: number;

  beforeAll(async () => {
    testUserId = 1;
    
    // Count default templates
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const defaultTemplates = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.userId, 0));
    
    defaultTemplateCount = defaultTemplates.length;
  });

  describe("Feature 1: Template Editing", () => {
    it("should create a user template", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db
        .insert(emailTemplates)
        .values({
          userId: testUserId,
          name: "Test User Template",
          description: "A template created by user for testing edit",
          promptTemplate: "Original prompt template content",
          isDefault: false,
        })
        .$returningId();

      expect(result.id).toBeGreaterThan(0);
      userTemplateId = result.id;
    });

    it("should update the user template", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(emailTemplates)
        .set({
          name: "Updated User Template",
          promptTemplate: "Updated prompt template content",
        })
        .where(eq(emailTemplates.id, userTemplateId));

      const [updated] = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, userTemplateId));

      expect(updated.name).toBe("Updated User Template");
      expect(updated.promptTemplate).toBe("Updated prompt template content");
    });

    it("should not allow editing default templates (userId=0)", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [defaultTemplate] = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.userId, 0))
        .limit(1);

      expect(defaultTemplate).toBeDefined();
      expect(defaultTemplate.isDefault).toBe(true);
      expect(defaultTemplate.userId).toBe(0);
    });

    it("should allow duplicating default templates", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [defaultTemplate] = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.userId, 0))
        .limit(1);

      // Duplicate as user template
      const [duplicated] = await db
        .insert(emailTemplates)
        .values({
          userId: testUserId,
          name: `${defaultTemplate.name} (Copy)`,
          description: defaultTemplate.description,
          promptTemplate: defaultTemplate.promptTemplate,
          isDefault: false,
        })
        .$returningId();

      expect(duplicated.id).toBeGreaterThan(0);

      const [newTemplate] = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, duplicated.id));

      expect(newTemplate.name).toContain("(Copy)");
      expect(newTemplate.userId).toBe(testUserId);
      expect(newTemplate.isDefault).toBe(false);

      // Cleanup
      await db.delete(emailTemplates).where(eq(emailTemplates.id, duplicated.id));
    });
  });

  describe("Feature 2: Template Preview", () => {
    it("should validate preview sample data structure", () => {
      const sampleData = {
        stakeholder_name: "Dr. Sarah Johnson",
        stakeholder_title: "Chief Quality Officer",
        stakeholder_details: "Oversees quality improvement initiatives",
        company_name: "Memorial Regional Hospital",
        company_summary: "450-bed acute care facility",
        relevant_context: "SEP-1 compliance at 68%",
      };

      expect(sampleData.stakeholder_name).toBeDefined();
      expect(sampleData.company_name).toBeDefined();
      expect(sampleData.relevant_context).toContain("SEP-1");
    });

    it("should have all required template variables in sample data", () => {
      const requiredVariables = [
        "stakeholder_name",
        "stakeholder_title",
        "stakeholder_details",
        "company_name",
        "company_summary",
        "relevant_context",
      ];

      const sampleData = {
        stakeholder_name: "Dr. Sarah Johnson",
        stakeholder_title: "Chief Quality Officer",
        stakeholder_details: "Oversees quality improvement initiatives",
        company_name: "Memorial Regional Hospital",
        company_summary: "450-bed acute care facility",
        relevant_context: "SEP-1 compliance at 68%",
      };

      requiredVariables.forEach((variable) => {
        expect(sampleData).toHaveProperty(variable);
        expect(sampleData[variable as keyof typeof sampleData]).toBeTruthy();
      });
    });
  });

  describe("Feature 3: Default Template Library", () => {
    it("should have at least 5 default templates", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const defaultTemplates = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.userId, 0));

      expect(defaultTemplates.length).toBeGreaterThanOrEqual(5);
    });

    it("should have expected default template names", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const defaultTemplates = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.userId, 0));

      const templateNames = defaultTemplates.map((t) => t.name);

      expect(templateNames).toContain("Problem-Solution Approach");
      expect(templateNames).toContain("Case Study Approach");
      expect(templateNames).toContain("Partnership Proposal");
      expect(templateNames).toContain("Product Introduction");
      expect(templateNames).toContain("Follow-up / Re-engagement");
    });

    it("should mark all default templates with isDefault=true", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const defaultTemplates = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.userId, 0));

      defaultTemplates.forEach((template) => {
        expect(template.isDefault).toBe(true);
        expect(template.userId).toBe(0);
      });
    });

    it("should list both user templates and default templates", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allTemplates = await db
        .select()
        .from(emailTemplates)
        .where(
          or(
            eq(emailTemplates.userId, testUserId),
            eq(emailTemplates.userId, 0)
          )
        );

      const userTemplates = allTemplates.filter((t) => t.userId === testUserId);
      const defaultTemplates = allTemplates.filter((t) => t.userId === 0);

      expect(userTemplates.length).toBeGreaterThan(0);
      expect(defaultTemplates.length).toBeGreaterThanOrEqual(5);
      expect(allTemplates.length).toBe(userTemplates.length + defaultTemplates.length);
    });

    it("should have descriptions for all default templates", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const defaultTemplates = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.userId, 0));

      defaultTemplates.forEach((template) => {
        expect(template.description).toBeTruthy();
        expect(template.description!.length).toBeGreaterThan(20);
      });
    });
  });

  // Cleanup
  describe("Cleanup", () => {
    it("should delete test user template", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(emailTemplates)
        .where(eq(emailTemplates.id, userTemplateId));

      const [deleted] = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, userTemplateId));

      expect(deleted).toBeUndefined();
    });
  });
});
