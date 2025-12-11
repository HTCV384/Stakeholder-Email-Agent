import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  workflows, InsertWorkflow, Workflow,
  stakeholders, InsertStakeholder, Stakeholder,
  emails, InsertEmail, Email,
  logs, InsertLog, Log,
  emailTemplates
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= User Functions =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= Workflow Functions =============

export async function createWorkflow(workflow: InsertWorkflow): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workflows).values(workflow);
  return Number(result[0].insertId);
}

export async function getWorkflow(id: number): Promise<Workflow | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserWorkflows(userId: number): Promise<Workflow[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(workflows).where(eq(workflows.userId, userId)).orderBy(desc(workflows.createdAt));
}

export async function updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(workflows).set(updates).where(eq(workflows.id, id));
}

// ============= Stakeholder Functions =============

export async function createStakeholders(stakeholderList: InsertStakeholder[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (stakeholderList.length > 0) {
    await db.insert(stakeholders).values(stakeholderList);
  }
}

export async function getWorkflowStakeholders(workflowId: number): Promise<Stakeholder[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(stakeholders).where(eq(stakeholders.workflowId, workflowId));
}

export async function updateStakeholderSelection(id: number, selected: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(stakeholders).set({ selected }).where(eq(stakeholders.id, id));
}

export async function getSelectedStakeholders(workflowId: number): Promise<Stakeholder[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(stakeholders).where(eq(stakeholders.workflowId, workflowId));
}

// ============= Email Functions =============

export async function createEmails(emailList: InsertEmail[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (emailList.length > 0) {
    await db.insert(emails).values(emailList);
  }
}

export async function getWorkflowEmails(workflowId: number): Promise<(Email & { templateName?: string })[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: emails.id,
      workflowId: emails.workflowId,
      stakeholderId: emails.stakeholderId,
      subject: emails.subject,
      body: emails.body,
      qualityScore: emails.qualityScore,
      reflectionNotes: emails.reflectionNotes,
      generationMode: emails.generationMode,
      templateId: emails.templateId,
      createdAt: emails.createdAt,
      templateName: emailTemplates.name,
    })
    .from(emails)
    .leftJoin(emailTemplates, eq(emails.templateId, emailTemplates.id))
    .where(eq(emails.workflowId, workflowId));

  return result.map(row => ({
    id: row.id,
    workflowId: row.workflowId,
    stakeholderId: row.stakeholderId,
    subject: row.subject,
    body: row.body,
    qualityScore: row.qualityScore,
    reflectionNotes: row.reflectionNotes,
    generationMode: row.generationMode,
    templateId: row.templateId,
    createdAt: row.createdAt,
    templateName: row.templateName || undefined,
  }));
}

export async function updateEmail(emailId: number, updates: Partial<InsertEmail>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(emails).set(updates).where(eq(emails.id, emailId));
}

// ============= Log Functions =============

export async function createLog(log: InsertLog): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(logs).values(log);
}

export async function createLogs(logList: InsertLog[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (logList.length > 0) {
    await db.insert(logs).values(logList);
  }
}

export async function getWorkflowLogs(workflowId: number): Promise<Log[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(logs).where(eq(logs.workflowId, workflowId));
}
