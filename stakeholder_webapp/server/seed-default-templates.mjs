/**
 * Seed default email templates for all users
 * Run with: node server/seed-default-templates.mjs
 */
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { emailTemplates } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

const defaultTemplates = [
  {
    name: "Problem-Solution Approach",
    description: "Highlight a specific problem the hospital faces and position your solution as the answer",
    promptTemplate: `You are writing a problem-solution email to a healthcare stakeholder.

**Email Structure:**
1. Opening: Acknowledge {stakeholder_name}'s role as {stakeholder_title} at {company_name}
2. Problem Statement: Reference specific challenges from {relevant_context} (e.g., SEP-1 scores, mortality rates, quality metrics)
3. Solution: Explain how our product addresses these challenges with evidence
4. Call to Action: Suggest a brief exploratory call

**Tone:** Professional, empathetic, solution-focused
**Length:** 150-180 words
**Key Requirement:** MUST reference specific hospital facts from {relevant_context} and {company_summary}

Generate as JSON:
{
  "subject": "Brief, problem-focused subject line",
  "body": "Email body with hospital-specific facts"
}`,
    isDefault: true,
  },
  {
    name: "Case Study Approach",
    description: "Share success stories from similar hospitals to build credibility and demonstrate proven results",
    promptTemplate: `You are writing a case study-driven email to a healthcare stakeholder.

**Email Structure:**
1. Opening: Brief greeting to {stakeholder_name}, {stakeholder_title}
2. Similar Hospital Success: Share a relevant case study (use realistic examples based on {company_summary} context)
3. Relevance: Connect the case study to {company_name}'s specific situation from {relevant_context}
4. Next Steps: Offer to discuss how similar results could be achieved

**Tone:** Evidence-based, confident, consultative
**Length:** 160-190 words
**Key Requirement:** Reference {company_name}'s specific metrics or challenges from {relevant_context}

Generate as JSON:
{
  "subject": "Results-focused subject with specific metrics",
  "body": "Email body with case study and hospital-specific connection"
}`,
    isDefault: true,
  },
  {
    name: "Partnership Proposal",
    description: "Position the outreach as a collaborative partnership opportunity rather than a sales pitch",
    promptTemplate: `You are writing a partnership-focused email to a healthcare stakeholder.

**Email Structure:**
1. Opening: Acknowledge {stakeholder_name}'s work on {stakeholder_details}
2. Shared Goals: Identify alignment between our mission and {company_name}'s initiatives from {company_summary}
3. Partnership Value: Explain mutual benefits and collaborative approach
4. Call to Action: Suggest exploratory conversation about partnership

**Tone:** Collaborative, respectful, forward-thinking
**Length:** 140-170 words
**Key Requirement:** Reference specific initiatives or goals from {relevant_context} or {stakeholder_details}

Generate as JSON:
{
  "subject": "Partnership-focused subject line",
  "body": "Email body emphasizing collaboration and shared goals"
}`,
    isDefault: true,
  },
  {
    name: "Product Introduction",
    description: "Direct introduction of your product with clear value proposition tailored to their role",
    promptTemplate: `You are writing a product introduction email to a healthcare stakeholder.

**Email Structure:**
1. Opening: Brief introduction referencing {stakeholder_title} role at {company_name}
2. Product Overview: Concise explanation of what we offer and why it matters for their role
3. Specific Value: Connect product benefits to {company_name}'s situation from {relevant_context}
4. Call to Action: Offer product demo or brief call

**Tone:** Clear, confident, value-focused
**Length:** 130-160 words
**Key Requirement:** Tailor product benefits to {stakeholder_title} role and reference {company_name} facts

Generate as JSON:
{
  "subject": "Clear, value-driven subject line",
  "body": "Email body with role-specific product value"
}`,
    isDefault: true,
  },
  {
    name: "Follow-up / Re-engagement",
    description: "Re-engage with a stakeholder after initial outreach or previous conversation",
    promptTemplate: `You are writing a follow-up email to a healthcare stakeholder.

**Email Structure:**
1. Opening: Reference previous interaction or initial outreach to {stakeholder_name}
2. New Information: Share relevant update, insight, or resource related to {company_name}'s challenges from {relevant_context}
3. Value Add: Offer something useful (article, data, brief consultation) without being pushy
4. Soft Call to Action: Leave door open for conversation when timing is right

**Tone:** Helpful, patient, non-pushy
**Length:** 120-150 words
**Key Requirement:** Reference {company_name} context to show continued research and genuine interest

Generate as JSON:
{
  "subject": "Follow-up subject with new value",
  "body": "Email body with helpful resource or insight"
}`,
    isDefault: true,
  },
];

async function seedDefaultTemplates() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  console.log('Seeding default email templates...');

  for (const template of defaultTemplates) {
    // Check if template already exists
    const existing = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.name, template.name))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Template "${template.name}" already exists, skipping...`);
      continue;
    }

    // Insert default template with userId = 0 (system templates)
    await db.insert(emailTemplates).values({
      userId: 0, // System user ID for default templates
      name: template.name,
      description: template.description,
      promptTemplate: template.promptTemplate,
      isDefault: template.isDefault,
    });

    console.log(`✓ Created default template: "${template.name}"`);
  }

  console.log('Default templates seeded successfully!');
  await connection.end();
}

seedDefaultTemplates().catch((error) => {
  console.error('Error seeding default templates:', error);
  process.exit(1);
});
