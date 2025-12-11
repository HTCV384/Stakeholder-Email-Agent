/**
 * Seed default email templates for all users
 * Run with: pnpm tsx server/seed-default-templates.ts
 */
import { getDb } from './db';
import { emailTemplates } from '../drizzle/schema';
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
  {
    name: "Casual Insider Approach",
    description: "Ultra-casual, peer-to-peer email that reveals hidden problems in their sepsis workflow using hospital-specific data",
    promptTemplate: `You are writing an ultra-casual, insider-knowledge email to a healthcare stakeholder. The tone is peer-to-peer, not vendor-to-buyer.

**CRITICAL STYLE RULES:**
- Use lowercase throughout (except acronyms like SEP-1, ED, CMS, NPV)
- Very short sentences and fragments
- Conversational, almost text-message style
- NO formal greetings ("Dear...") or sign-offs ("Sincerely...")
- Questions instead of statements when possible
- Lots of white space (line breaks between sections)
- Use arrows (→) to show process flow

**EMAIL STRUCTURE:**

**1. Casual Greeting + Recent Hospital Facts** (2-3 sentences)
- Start with "hi {stakeholder_name}" or "hey {stakeholder_name}"
- Reference a SPECIFIC metric from {relevant_context} or {company_summary}
- Examples:
  * "hi Sarah, saw Memorial's 68% SEP-1 compliance"
  * "hey John, noticed your ED sepsis mortality at 22%"
  * "hi Dr. Chen, read about your CMS star rating drop to 3 stars"

**2. Hook - "Something You Don't Know"** (1 sentence, question format)
- "wanna know what's happening with your sepsis patients that doesn't show up in the data?"
- "guess what your sepsis team is struggling with that metrics don't capture?"
- "let me tell you something about your sepsis workflow you might not see"

**3. Pattern Interrupt** (2 sentences)
- Validate their current approach first (builds credibility)
- "your team is doing the right things. following bundles, ordering labs, documenting."
- "you're hitting the protocols. your clinicians know sepsis."
- Then transition: "but here's what's actually happening:"

**4. Hidden Problem** (3-4 bullet points)
- Each bullet: [specific clinical/operational issue with metric] (human/operational impact in parentheses)
- These should be REAL problems that happen in sepsis care, informed by {relevant_context} if available
- Focus on: clinical delays, workflow friction, alert fatigue, compliance burden, data overload
- Examples:
  * "lactate results taking 90+ minutes while patient deteriorates (treatment delays killing outcomes)"
  * "nurses checking vitals every 15 min but sepsis risk score still manual (alert fatigue, missed escalations)"
  * "ED beds stuck waiting for SEP-1 bundle documentation (throughput tanking, boarding times up)"
  * "sepsis coordinator spending 10 hours/week building compliance reports (resource drain)"

**5. IntelliSep Value-Add** (1-2 sentences)
- Don't just say "faster test" - explain the CAPABILITY it unlocks
- "IntelliSep gives you objective sepsis risk in under 8 minutes - before clinical deterioration"
- "IntelliSep tells you who's actually at risk - not just who has SIRS criteria"
- Focus on: early detection, objective risk stratification, clinical confidence, workflow efficiency

**6. Mechanism (Flow with Arrows)** (1 sentence)
- Show the process transformation with → symbols
- Examples:
  * "patient arrives → IntelliSep in under 8 min → risk stratified → right treatment intensity → better outcomes"
  * "suspected sepsis → IntelliSep result → confidence to escalate OR safely monitor → fewer missed cases + less overtreatment"
  * "IntelliSep negative (97.5% NPV) → rule out sepsis early → avoid unnecessary antibiotics + ICU → better stewardship"

**7. Outcome (KPI Improvement)** (2-3 sentences)
- "suddenly your team realizes: we're not just testing faster. we're [transformation]"
- Reference specific KPI from {relevant_context} and show improvement potential
- Examples:
  * "suddenly your team realizes: we're not just testing faster. we're catching sepsis before it escalates. your 22% mortality → 13% mortality (40% reduction, like Thomas et al. saw)"
  * "your team realizes: we're not just following bundles. we're confidently ruling out sepsis early. your SEP-1 compliance → 85%+ without overtreatment"
  * "your team realizes: we're not drowning in alerts. we're acting on real risk. your ED throughput improves, boarding drops, outcomes get better"

**8. Simple CTA** (1 sentence, question format with timeframe)
- "[timeframe]. ready to talk?"
- "15 min call this week?"
- "quick call to walk through your data?"

**IMPORTANT - USE HOSPITAL-SPECIFIC DATA:**
- Pull metrics from {relevant_context} and {company_summary} for sections 1, 4, and 7
- If specific metrics available (SEP-1 scores, mortality rates, CMS penalties), USE THEM
- If no specific metrics, use realistic estimates based on {company_summary} context
- The hidden problems (section 4) should reflect their actual challenges when possible

**TONE EXAMPLES:**
✓ "hi Sarah, saw Memorial's 68% SEP-1 compliance"
✓ "wanna know what's happening with your sepsis patients that doesn't show up in the data?"
✓ "your team is doing the right things. following bundles, ordering labs, documenting. but here's what's actually happening:"
✓ "suddenly your team realizes: we're not just testing faster. we're catching sepsis before it escalates"

✗ "Dear Dr. Johnson, I hope this email finds you well"
✗ "I am reaching out to introduce IntelliSep"
✗ "Our product offers the following benefits:"
✗ "I would love to schedule a meeting at your convenience"

**LENGTH:** 150-180 words total

**Product Context (IntelliSep Sepsis Test):**
{product_report_excerpt}

**Stakeholder Information:**
Name: {stakeholder_name}
Title: {stakeholder_title}
Role Details: {stakeholder_details}

**Role-Specific Context:**
{role_context_excerpt}

**Hospital Context:**
Hospital: {company_name}
Report Summary: {company_summary}

**Specific Insights from Hospital Report:**
{relevant_context}

**KEY STAKEHOLDER ENGAGEMENT SUGGESTIONS:**
If the research report includes engagement recommendations for this stakeholder (preferred communication style, decision triggers, pain points, priorities), REVIEW and INCORPORATE them:
- Adjust tone/approach based on their communication preferences (data-driven, relationship-focused, urgency-driven)
- Frame value proposition around their specific decision criteria
- Reference pain points or priorities mentioned in engagement suggestions
- Tailor subject line to match their engagement triggers (curiosity, urgency, peer validation)

Generate as JSON:
{
  "subject": "Ultra-short, punchy subject (under 45 chars, lowercase preferred)",
  "body": "Email body following the structure above"
}`,
    isDefault: true,
  },
];

async function seedDefaultTemplates() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

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
      description: template.description || null,
      promptTemplate: template.promptTemplate,
      isDefault: template.isDefault,
    });

    console.log(`✓ Created default template: "${template.name}"`);
  }

  console.log('Default templates seeded successfully!');
  process.exit(0);
}

seedDefaultTemplates().catch((error) => {
  console.error('Error seeding default templates:', error);
  process.exit(1);
});
