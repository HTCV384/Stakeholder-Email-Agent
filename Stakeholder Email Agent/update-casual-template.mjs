import { getDb } from './stakeholder_webapp/server/db.js';
import { emailTemplates } from './stakeholder_webapp/drizzle/schema.js';
import { eq } from 'drizzle-orm';

const casualPrompt = `You are writing an ultra-casual, insider-knowledge email to a healthcare stakeholder. The tone is peer-to-peer, not vendor-to-buyer.

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
}`;

const db = await getDb();
await db.update(emailTemplates)
  .set({ promptTemplate: casualPrompt })
  .where(eq(emailTemplates.id, 6));

console.log('✓ Updated template 6 with correct Casual Insider Approach prompt');
process.exit(0);
