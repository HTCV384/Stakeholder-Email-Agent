import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { 
  createWorkflow, getWorkflow, getUserWorkflows, updateWorkflow,
  createStakeholders, getWorkflowStakeholders, updateStakeholderSelection, getSelectedStakeholders,
  createEmails, getWorkflowEmails, updateEmail,
  createLogs, getWorkflowLogs,
  getDb
} from "./db";
import { emailTemplates } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { spawn, exec } from "child_process";
import { randomBytes } from "crypto";
import { promisify } from "util";
import { writeFile, unlink, readFile } from "fs/promises";

const execAsync = promisify(exec);

/**
 * Prepare report input for Python bridge (file URL or text content)
 */
async function prepareReportInput(reportUrl: string, filename: string): Promise<any> {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  if (ext === '.pdf') {
    return {
      type: 'file_url',
      url: reportUrl,
      mime_type: 'application/pdf'
    };
  } else if (ext === '.html' || ext === '.htm') {
    return {
      type: 'file_url',
      url: reportUrl,
      mime_type: 'text/html'
    };
  } else {
    // For plain text, download and read content
    const response = await fetch(reportUrl);
    const text = await response.text();
    return {
      type: 'text',
      content: text
    };
  }
}

/**
 * Execute Python bridge script and return JSON result
 * Captures logs from stderr and saves them to database in real-time
 */
export async function executePythonBridge(input: any, workflowId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log(`[Python Bridge] API Key available: ${apiKey ? 'YES (length: ' + apiKey.length + ')' : 'NO'}`);
    
    const pythonProcess = spawn("/usr/bin/python3.11", [
      "/home/ubuntu/stakeholder_webapp/server/agentic_system/bridge.py"
    ], {
      env: { 
        ...process.env, 
        OPENROUTER_API_KEY: apiKey || "",
        DATABASE_URL: process.env.DATABASE_URL || "",
        PYTHONPATH: "/usr/local/lib/python3.11/dist-packages:/usr/lib/python3/dist-packages",
        PYTHONHOME: "/usr"
      }
    });

    let stdout = "";
    let stderrBuffer = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", async (data) => {
      const text = data.toString();
      stderrBuffer += text;
      
      // Process complete log lines (prefixed with LOG:)
      const lines = stderrBuffer.split("\n");
      stderrBuffer = lines.pop() || ""; // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.startsWith("LOG:")) {
          try {
            const logData = JSON.parse(line.substring(4));
            if (logData.type === "log" && logData.data) {
              // Save log to database immediately
              await createLogs([{
                workflowId: workflowId,
                level: logData.data.level,
                agent: logData.data.agent,
                message: logData.data.message,
                testId: logData.data.testId || null,
                metadata: logData.data.metadata ? JSON.stringify(logData.data.metadata) : null,
              }]);
            }
          } catch (e) {
            console.error("Failed to parse log line:", line, e);
          }
        }
      }
    });

    pythonProcess.on("close", (code) => {
      console.log(`[Python Bridge] Process closed with code ${code}`);
      console.log(`[Python Bridge] stdout length: ${stdout.length}`);
      console.log(`[Python Bridge] stdout content:`, stdout.substring(0, 500));
      
      if (code !== 0) {
        console.error(`[Python Bridge] Process failed with stderr:`, stderrBuffer);
        reject(new Error(`Python process exited with code ${code}: ${stderrBuffer}`));
      } else {
        try {
          const result = JSON.parse(stdout);
          console.log(`[Python Bridge] Parsed result:`, JSON.stringify(result, null, 2).substring(0, 500));
          resolve(result);
        } catch (e) {
          console.error(`[Python Bridge] Failed to parse stdout:`, stdout);
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      }
    });

    // Send input as JSON to stdin
    pythonProcess.stdin.write(JSON.stringify(input));
    pythonProcess.stdin.end();
  });
}

export const workflowRouter = router({
  /**
   * Upload research report and create new workflow
   */
  uploadReport: protectedProcedure
    .input(z.object({
      filename: z.string(),
      content: z.string(), // base64 encoded file content
    }))
    .mutation(async ({ ctx, input }) => {
      // Decode base64 content
      const fileBuffer = Buffer.from(input.content, "base64");
      
      // Generate unique file key
      const fileKey = `${ctx.user.id}/reports/${randomBytes(8).toString("hex")}-${input.filename}`;
      
      // Upload to S3
      const { url } = await storagePut(fileKey, fileBuffer, "text/plain");
      
      // Create workflow record
      const workflowId = await createWorkflow({
        userId: ctx.user.id,
        reportUrl: url,
        reportFilename: input.filename,
        status: "uploading",
      });
      
      return {
        workflowId,
        reportUrl: url,
      };
    }),

  /**
   * Extract stakeholders from uploaded report
   */
  extractStakeholders: protectedProcedure
    .input(z.object({
      workflowId: z.number(),
    }))
    .mutation(async ({ input }) => {
      console.log(`[extractStakeholders] Starting for workflowId: ${input.workflowId}`);
      
      const workflow = await getWorkflow(input.workflowId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      // Update status to extracting
      console.log(`[extractStakeholders] Updating status to extracting`);
      await updateWorkflow(input.workflowId, { status: "extracting" });

      try {
        // Prepare report input (file URL or text content)
        console.log(`[extractStakeholders] Preparing report input`);
        const reportInput = await prepareReportInput(workflow.reportUrl, workflow.reportFilename);
        console.log(`[extractStakeholders] Report input prepared:`, reportInput.type);

        // Execute Python bridge to extract stakeholders
        console.log(`[extractStakeholders] Calling Python bridge`);
        const result = await executePythonBridge({
          action: "extract_stakeholders",
          workflowId: input.workflowId,
          reportInput,
        }, input.workflowId);
        
        console.log(`[extractStakeholders] Python bridge returned, success:`, result.success);

        if (!result.success) {
          console.log(`[extractStakeholders] Extraction failed:`, result.error);
          await updateWorkflow(input.workflowId, {
            status: "failed",
            errorMessage: result.error,
          });
          
          // Save error logs
          if (result.logs) {
            await createLogs(result.logs.map((log: any) => ({
              workflowId: input.workflowId,
              level: log.level,
              agent: log.agent,
              message: log.message,
              testId: log.testId || null,
              metadata: log.metadata ? JSON.stringify(log.metadata) : null,
            })));
          }
          
          throw new Error(result.error);
        }
        
        console.log(`[extractStakeholders] Extraction successful, stakeholders:`, result.stakeholders?.length);

        // Save stakeholders to database
        console.log(`[extractStakeholders] Saving ${result.stakeholders.length} stakeholders to database`);
        const stakeholderRecords = result.stakeholders.map((s: any) => ({
          workflowId: input.workflowId,
          name: s.name,
          title: s.title || null,
          details: s.details || null,
          selected: false,
        }));
        await createStakeholders(stakeholderRecords);
        console.log(`[extractStakeholders] Stakeholders saved`);

        // Update workflow with company summary and status
        console.log(`[extractStakeholders] Updating workflow status to ready`);
        await updateWorkflow(input.workflowId, {
          companySummary: result.companySummary,
          status: "ready",
        });
        console.log(`[extractStakeholders] Workflow updated to ready`);

        // Save logs
        if (result.logs) {
          await createLogs(result.logs.map((log: any) => ({
            workflowId: input.workflowId,
            level: log.level,
            agent: log.agent,
            message: log.message,
            testId: log.testId || null,
            metadata: log.metadata ? JSON.stringify(log.metadata) : null,
          })));
        }

        console.log(`[extractStakeholders] Returning success response`);
        return {
          success: true,
          stakeholders: result.stakeholders,
          companySummary: result.companySummary,
        };
      } catch (error: any) {
        console.error(`[extractStakeholders] Error caught:`, error.message);
        await updateWorkflow(input.workflowId, {
          status: "failed",
          errorMessage: error.message,
        });
        throw error;
      }
    }),

  /**
   * Get workflow details with stakeholders
   */
  getWorkflow: protectedProcedure
    .input(z.object({
      workflowId: z.number(),
    }))
    .query(async ({ input }) => {
      const workflow = await getWorkflow(input.workflowId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      const stakeholders = await getWorkflowStakeholders(input.workflowId);
      const emails = await getWorkflowEmails(input.workflowId);
      const logs = await getWorkflowLogs(input.workflowId);

      return {
        workflow,
        stakeholders,
        emails,
        logs,
      };
    }),

  /**
   * Get all workflows for current user
   */
  listWorkflows: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserWorkflows(ctx.user.id);
    }),

  /**
   * Update stakeholder selection
   */
  updateStakeholderSelection: protectedProcedure
    .input(z.object({
      stakeholderId: z.number(),
      selected: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await updateStakeholderSelection(input.stakeholderId, input.selected);
      return { success: true };
    }),

  /**
   * Generate emails for selected stakeholders
   */
  generateEmails: protectedProcedure
    .input(z.object({
      workflowId: z.number(),
      generationMode: z.enum(["ai_style", "template", "custom"]),
      modeConfig: z.any(), // JSON config for the selected mode
    }))
    .mutation(async ({ input, ctx }) => {
      const workflow = await getWorkflow(input.workflowId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      // Update workflow with generation mode
      await updateWorkflow(input.workflowId, {
        status: "generating",
        generationMode: input.generationMode,
        modeConfig: JSON.stringify(input.modeConfig),
      });

      // Update lastUsedAt for template if using template mode
      if (input.generationMode === "template" && input.modeConfig?.template_id) {
        const db = await getDb();
        if (db) {
          await db
            .update(emailTemplates)
            .set({ lastUsedAt: new Date() })
            .where(eq(emailTemplates.id, input.modeConfig.template_id));
        }
      }

      try {
        // Get selected stakeholders
        const allStakeholders = await getWorkflowStakeholders(input.workflowId);
        const selectedStakeholders = allStakeholders.filter(s => s.selected);

        if (selectedStakeholders.length === 0) {
          throw new Error("No stakeholders selected");
        }

        // Prepare report input (file URL or text content)
        const reportInput = await prepareReportInput(workflow.reportUrl, workflow.reportFilename);

        // Execute Python bridge to generate emails
        const result = await executePythonBridge({
          action: "generate_emails",
          workflowId: input.workflowId,
          userId: ctx.user.id,
          reportInput,
          selectedStakeholders: selectedStakeholders.map(s => ({
            name: s.name,
            title: s.title,
            details: s.details,
          })),
          companySummary: workflow.companySummary,
          generationMode: input.generationMode,
          modeConfig: input.modeConfig,
        }, input.workflowId);

        if (!result.success) {
          await updateWorkflow(input.workflowId, {
            status: "failed",
            errorMessage: result.error,
          });

          // Save error logs
          if (result.logs) {
            await createLogs(result.logs.map((log: any) => ({
              workflowId: input.workflowId,
              level: log.level,
              agent: log.agent,
              message: log.message,
              testId: log.testId || null,
              metadata: log.metadata ? JSON.stringify(log.metadata) : null,
            })));
          }

          throw new Error(result.error);
        }

        // Save generated emails to database
        const emailRecords = result.emails.map((email: any, index: number) => ({
          workflowId: input.workflowId,
          stakeholderId: selectedStakeholders[index]?.id || 0,
          subject: email.email_subject || email.subject || 'No subject',
          body: email.email_body || email.body || 'No body generated',
          qualityScore: email.quality_score ? Math.round(email.quality_score * 10) : null,
          reflectionNotes: email.reflection_notes || null,
          generationMode: input.generationMode,
          templateId: input.generationMode === 'template' && input.modeConfig?.template_id ? input.modeConfig.template_id : null,
        }));
        await createEmails(emailRecords);

        // Update workflow status
        await updateWorkflow(input.workflowId, {
          status: "completed",
        });

        // Save logs
        if (result.logs) {
          await createLogs(result.logs.map((log: any) => ({
            workflowId: input.workflowId,
            level: log.level,
            agent: log.agent,
            message: log.message,
            testId: log.testId || null,
            metadata: log.metadata ? JSON.stringify(log.metadata) : null,
          })));
        }

        return {
          success: true,
          emails: result.emails,
        };
      } catch (error: any) {
        await updateWorkflow(input.workflowId, {
          status: "failed",
          errorMessage: error.message,
        });
        throw error;
      }
    }),

  /**
   * Update email body after generation
   */
  updateEmail: protectedProcedure
    .input(z.object({
      emailId: z.number(),
      body: z.string(),
    }))
    .mutation(async ({ input }) => {
      await updateEmail(input.emailId, { body: input.body });
      return { success: true };
    }),

  /**
   * Preview email generation for one stakeholder before bulk generation
   */
  previewEmail: protectedProcedure
    .input(z.object({
      workflowId: z.number(),
      stakeholderId: z.number(),
      generationMode: z.enum(["ai_style", "template", "custom"]),
      modeConfig: z.any(),
    }))
    .mutation(async ({ input, ctx }) => {
      const workflow = await getWorkflow(input.workflowId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      // Get the specific stakeholder
      const allStakeholders = await getWorkflowStakeholders(input.workflowId);
      const stakeholder = allStakeholders.find(s => s.id === input.stakeholderId);
      if (!stakeholder) {
        throw new Error("Stakeholder not found");
      }

      // Prepare report input
      const reportInput = await prepareReportInput(workflow.reportUrl, workflow.reportFilename);

      // Execute Python bridge to generate preview email for one stakeholder
      const result = await executePythonBridge({
        action: "generate_emails",
        workflowId: input.workflowId,
        userId: ctx.user.id,
        reportInput,
        selectedStakeholders: [{
          name: stakeholder.name,
          title: stakeholder.title,
          details: stakeholder.details,
        }],
        companySummary: workflow.companySummary,
        generationMode: input.generationMode,
        modeConfig: input.modeConfig,
      }, input.workflowId);

      if (!result.success || !result.emails || result.emails.length === 0) {
        throw new Error(result.error || "Failed to generate preview email");
      }

      const email = result.emails[0];
      return {
        stakeholder: {
          name: stakeholder.name,
          title: stakeholder.title,
        },
        email: {
          subject: email.email_subject || email.subject || 'No subject',
          body: email.email_body || email.body || 'No body generated',
          qualityScore: email.quality_score ? Math.round(email.quality_score * 10) / 10 : null,
          reflectionNotes: email.reflection_notes || null,
        },
      };
    }),

  /**
   * Export all generated emails as markdown
   */
  exportEmails: protectedProcedure
    .input(z.object({
      workflowId: z.number(),
    }))
    .query(async ({ input }) => {
      const workflow = await getWorkflow(input.workflowId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      const emails = await getWorkflowEmails(input.workflowId);
      const stakeholders = await getWorkflowStakeholders(input.workflowId);

      // Create stakeholder lookup
      const stakeholderMap = new Map(stakeholders.map(s => [s.id, s]));

      // Generate markdown
      let markdown = `# Generated Stakeholder Emails\n\n`;
      markdown += `**Generated:** ${new Date().toLocaleString()}\n`;
      markdown += `**Total Emails:** ${emails.length}\n\n`;
      markdown += `---\n\n`;

      emails.forEach((email, index) => {
        const stakeholder = stakeholderMap.get(email.stakeholderId);
        markdown += `## Email ${index + 1}: ${stakeholder?.name || "Unknown"}\n\n`;
        markdown += `**To:** ${stakeholder?.name || "Unknown"}`;
        if (stakeholder?.title) {
          markdown += ` (${stakeholder.title})`;
        }
        markdown += `\n`;
        markdown += `**Subject:** ${email.subject}\n`;
        if (email.qualityScore) {
          markdown += `**Quality Score:** ${(email.qualityScore / 10).toFixed(1)}/10\n`;
        }
        if (email.reflectionNotes) {
          markdown += `**Reflection Notes:** ${email.reflectionNotes}\n`;
        }
        markdown += `\n### Email Body\n\n`;
        markdown += `${email.body}\n\n`;
        markdown += `---\n\n`;
      });

      return {
        markdown,
        filename: `emails_${workflow.id}_${Date.now()}.md`,
      };
    }),
});
