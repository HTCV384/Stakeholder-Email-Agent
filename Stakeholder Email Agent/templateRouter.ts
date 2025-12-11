import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { emailTemplates, workflows, stakeholders } from "../drizzle/schema";
import { and, eq, or, desc, sql } from "drizzle-orm";

export const templateRouter = router({
  /**
   * List all templates for the current user
   */
  listTemplates: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Get both user templates and default templates (userId=0)
    // Sort by: lastUsedAt desc (nulls last), then createdAt desc
    const templates = await db
      .select()
      .from(emailTemplates)
      .where(
        or(
          eq(emailTemplates.userId, ctx.user.id),
          eq(emailTemplates.userId, 0) // Default templates
        )
      )
      .orderBy(
        sql`${emailTemplates.lastUsedAt} IS NULL`, // Nulls last
        desc(emailTemplates.lastUsedAt),
        desc(emailTemplates.createdAt)
      );
    
    return { templates };
  }),

  /**
   * Get a specific template by ID
   */
  getTemplate: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [template] = await db
        .select()
        .from(emailTemplates)
        .where(
          and(
            eq(emailTemplates.id, input.templateId),
            eq(emailTemplates.userId, ctx.user.id)
          )
        );
      
      if (!template) {
        throw new Error("Template not found");
      }
      
      return { template };
    }),

  /**
   * Create a new template
   */
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Template name is required"),
        description: z.string().optional(),
        promptTemplate: z.string().min(1, "Prompt template is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [template] = await db
        .insert(emailTemplates)
        .values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
          promptTemplate: input.promptTemplate,
          isDefault: false,
        })
        .$returningId();
      
      return { 
        success: true, 
        templateId: template.id,
        message: "Template created successfully" 
      };
    }),

  /**
   * Update an existing template
   */
  updateTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        name: z.string().min(1, "Template name is required").optional(),
        description: z.string().optional(),
        promptTemplate: z.string().min(1, "Prompt template is required").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { templateId, ...updates } = input;
      
      // Verify ownership
      const [existing] = await db
        .select()
        .from(emailTemplates)
        .where(
          and(
            eq(emailTemplates.id, templateId),
            eq(emailTemplates.userId, ctx.user.id)
          )
        );
      
      if (!existing) {
        throw new Error("Template not found or access denied");
      }
      
      await db
        .update(emailTemplates)
        .set(updates)
        .where(eq(emailTemplates.id, templateId));
      
      return { 
        success: true, 
        message: "Template updated successfully" 
      };
    }),

  /**
   * Delete a template
   */
  deleteTemplate: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify ownership
      const [existing] = await db
        .select()
        .from(emailTemplates)
        .where(
          and(
            eq(emailTemplates.id, input.templateId),
            eq(emailTemplates.userId, ctx.user.id)
          )
        );
      
      if (!existing) {
        throw new Error("Template not found or access denied");
      }
      
      await db
        .delete(emailTemplates)
        .where(eq(emailTemplates.id, input.templateId));
      
      return { 
        success: true, 
        message: "Template deleted successfully" 
      };
    }),

  /**
   * Preview a template with real workflow data or placeholder data
   */
  previewTemplate: protectedProcedure
    .input(
      z.object({
        promptTemplate: z.string().min(1, "Prompt template is required"),
        workflowId: z.number().optional(), // If provided, use real workflow data
      })
    )
    .mutation(async ({ ctx, input }) => {
      let sampleData: any;
      let isPlaceholder = false;
      
      // Try to use real workflow data if workflowId provided
      if (input.workflowId) {
        const db = await getDb();
        if (db) {
          const workflow = await db
            .select()
            .from(workflows)
            .where(eq(workflows.id, input.workflowId))
            .limit(1);
          
          if (workflow.length > 0) {
            const wf = workflow[0];
            
            // Get first selected stakeholder for preview
            const selectedStakeholders = await db
              .select()
              .from(stakeholders)
              .where(
                and(
                  eq(stakeholders.workflowId, input.workflowId),
                  eq(stakeholders.selected, true)
                )
              )
              .limit(1);
            
            if (selectedStakeholders.length > 0) {
              const stakeholder = selectedStakeholders[0];
              
              // Extract company name from companySummary or use filename
              let companyName = wf.reportFilename.replace(/\.(pdf|html|htm|txt)$/i, '');
              if (wf.companySummary) {
                // Try to extract company name from first line of summary
                const firstLine = wf.companySummary.split('\n')[0];
                if (firstLine.length < 100) {
                  companyName = firstLine.replace(/^(\w+\s+){0,5}/, '').trim();
                }
              }
              
              sampleData = {
                stakeholder_name: stakeholder.name,
                stakeholder_title: stakeholder.title || "<PLACEHOLDER: No title available>",
                stakeholder_details: stakeholder.details || "<PLACEHOLDER: No details available>",
                company_name: companyName,
                company_summary: wf.companySummary || "<PLACEHOLDER: No company summary available>",
                relevant_context: stakeholder.details || "<PLACEHOLDER: No relevant context available>",
              };
              isPlaceholder = false;
            }
          }
        }
      }
      
      // Fall back to placeholder data if no workflow data available
      if (!sampleData) {
        isPlaceholder = true;
        sampleData = {
          stakeholder_name: "<PLACEHOLDER> Dr. Sarah Johnson",
          stakeholder_title: "<PLACEHOLDER> Chief Quality Officer",
          stakeholder_details: "<PLACEHOLDER> Oversees quality improvement initiatives and patient safety programs. Led implementation of sepsis protocols. Published research on early sepsis detection. Chairs the hospital's Quality Steering Committee.",
          company_name: "<PLACEHOLDER> Memorial Regional Hospital",
          company_summary: "<PLACEHOLDER> Memorial Regional Hospital is a 450-bed acute care facility serving the greater metro area with 2,800 employees. Recent CMS quality ratings show room for improvement in sepsis outcomes (SEP-1 compliance at 68%). The hospital has invested $2.5M in quality improvement initiatives over the past year.",
          relevant_context: "<PLACEHOLDER> Hospital performance data shows SEP-1 bundle compliance at 68%, below the national average of 75%. Recent sepsis mortality rate of 18% indicates opportunity for improvement. Emergency department sees 45,000 visits annually with 12% requiring sepsis protocol activation. Quality team actively seeking evidence-based solutions to improve early detection and treatment initiation.",
        };
      }
      
      // Create comprehensive fake report for context extraction
      const comprehensiveReport = `
MEMORIAL REGIONAL HOSPITAL - QUALITY IMPROVEMENT RESEARCH REPORT

EXECUTIVE SUMMARY
Memorial Regional Hospital is a 450-bed acute care facility serving a diverse patient population in the greater metro area. This report analyzes current sepsis care performance and identifies opportunities for improvement through advanced diagnostic technologies.

HOSPITAL OVERVIEW
- Bed Capacity: 450 beds
- Annual Admissions: 22,000
- Emergency Department Visits: 45,000/year
- Employees: 2,800
- Service Area Population: 850,000

CURRENT SEPSIS PERFORMANCE METRICS

SEP-1 Bundle Compliance: 68%
- National Average: 75%
- Top Quartile: 85%
- Gap Analysis: 17-point improvement opportunity

Sepsis Mortality Rate: 18%
- Risk-adjusted expected: 14%
- Excess deaths: ~15 annually
- Financial impact: $2.1M in penalties and lost revenue

Time to Antibiotic Administration:
- Current median: 4.2 hours from triage
- Target: <3 hours
- Compliance rate: 62%

KEY STAKEHOLDERS

Dr. Sarah Johnson - Chief Quality Officer
- Oversees all quality improvement initiatives
- Led successful implementation of stroke protocols (improved door-to-needle time by 35%)
- Published 12 peer-reviewed articles on quality improvement
- Chairs Quality Steering Committee
- Reports directly to CEO
- Key priorities: Sepsis outcomes, patient safety, CMS star ratings
- Communication style: Data-driven, evidence-based, collaborative
- Decision criteria: ROI analysis, clinical evidence, staff engagement

RECENT QUALITY INITIATIVES

1. Sepsis Protocol Enhancement (2023)
   - Invested $800K in staff training
   - Implemented electronic sepsis screening tool
   - Results: Modest 5% improvement in compliance
   - Limitation: Relies on manual vital sign interpretation

2. Early Warning Score System (2024)
   - Deployed NEWS2 scoring across all units
   - $400K implementation cost
   - Challenge: High false positive rate (40%) causing alert fatigue

3. Emergency Department Redesign
   - Reduced average wait time by 18 minutes
   - Improved patient satisfaction scores
   - Did not significantly impact sepsis detection

CHALLENGES IDENTIFIED

1. Late Recognition
   - 35% of sepsis cases not identified until ICU transfer
   - Average delay: 6.8 hours from first abnormal vitals
   - Contributing factors: Subtle early signs, competing priorities

2. Alert Fatigue
   - Current EHR generates 200+ alerts per nurse per shift
   - 40% false positive rate on sepsis screening
   - Nurses report "alarm fatigue" as top concern

3. Laboratory Turnaround Time
   - Lactate results: 45-minute average
   - Blood culture results: 24-48 hours
   - Delays treatment initiation decisions

4. Resource Constraints
   - ED operates at 95% capacity during peak hours
   - Nurse-to-patient ratios stretched
   - Limited ICU bed availability

OPPORTUNITIES FOR IMPROVEMENT

1. Advanced Diagnostic Technology
   - Need: Rapid, accurate sepsis biomarker testing
   - Requirement: Results under 8 minutes
   - Impact: Earlier antibiotic initiation, reduced mortality

2. Clinical Decision Support
   - AI-powered risk stratification
   - Integration with existing EHR
   - Reduced false positives

3. Workflow Optimization
   - Streamlined sepsis protocol
   - Point-of-care testing capabilities
   - Automated documentation

FINANCIAL IMPACT ANALYSIS

Current Sepsis Program Costs:
- Annual sepsis cases: 540
- Average cost per case: $28,000
- Total: $15.1M annually

Potential Savings from 10% Mortality Reduction:
- Lives saved: 10 annually
- Avoided costs: $1.2M
- CMS penalty avoidance: $900K
- Total annual benefit: $2.1M

QUALITY TEAM PRIORITIES (from Dr. Johnson's Q4 Report)
1. Achieve 80% SEP-1 compliance by end of fiscal year
2. Reduce sepsis mortality to <15%
3. Improve early detection capabilities
4. Enhance staff engagement in quality initiatives
5. Maintain CMS 4-star rating

STAKEHOLDER ENGAGEMENT RECOMMENDATIONS

For Dr. Sarah Johnson (CQO):
- Lead with data: Reference 68% SEP-1 compliance gap
- Emphasize evidence base: Cite peer-reviewed studies
- Show ROI: Quantify mortality reduction and cost savings
- Acknowledge current efforts: Recognize recent protocol enhancements
- Propose partnership: Position as collaborative quality improvement
- Timing: Q4 budget planning cycle (September-November)
- Format: Brief exploratory call → data review → pilot proposal

CONCLUSION
Memorial Regional Hospital has demonstrated commitment to quality improvement through significant investments in sepsis care. However, current SEP-1 compliance of 68% and mortality rate of 18% indicate substantial opportunity for improvement. Advanced diagnostic technologies that enable rapid, accurate sepsis detection could help the hospital achieve its quality goals while improving patient outcomes and financial performance.
`;

      // Call Python bridge to generate preview email
      const { executePythonBridge } = await import("./workflowRouter");
      
      try {
        const result = await executePythonBridge({
          action: "generate_emails",
          workflowId: 0, // Dummy workflow ID for preview
          userId: ctx.user.id,
          reportInput: { type: "text", content: comprehensiveReport },
          selectedStakeholders: [{
            name: sampleData.stakeholder_name,
            title: sampleData.stakeholder_title,
            details: sampleData.stakeholder_details,
          }],
          companySummary: sampleData.company_summary,
          generationMode: "template",
          modeConfig: {
            promptTemplate: input.promptTemplate,
          },
        }, 0);

        if (!result.success || !result.emails || result.emails.length === 0) {
          throw new Error(result.error || "Failed to generate preview email");
        }

        const email = result.emails[0];
        return {
          sampleData,
          isPlaceholder, // Flag to indicate if using placeholder or real data
          email: {
            subject: email.email_subject || email.subject || 'No subject',
            body: email.email_body || email.body || 'No body generated',
          },
        };
      } catch (error: any) {
        throw new Error(`Preview generation failed: ${error.message}`);
      }
    }),
});
