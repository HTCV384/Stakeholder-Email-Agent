import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Workflows table - tracks email generation sessions
 */
export const workflows = mysqlTable("workflows", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reportUrl: text("reportUrl").notNull(),
  reportFilename: varchar("reportFilename", { length: 255 }).notNull(),
  companySummary: text("companySummary"),
  status: mysqlEnum("status", ["uploading", "extracting", "ready", "generating", "completed", "failed"]).default("uploading").notNull(),
  generationMode: mysqlEnum("generationMode", ["ai_style", "template", "custom"]),
  modeConfig: text("modeConfig"), // JSON string for style/template/prompt config
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

/**
 * Stakeholders table - extracted from research reports
 */
export const stakeholders = mysqlTable("stakeholders", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: int("workflowId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  details: text("details"),
  selected: boolean("selected").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Stakeholder = typeof stakeholders.$inferSelect;
export type InsertStakeholder = typeof stakeholders.$inferInsert;

/**
 * Emails table - generated email drafts
 */
export const emails = mysqlTable("emails", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: int("workflowId").notNull(),
  stakeholderId: int("stakeholderId").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  qualityScore: int("qualityScore"), // stored as integer (e.g., 85 for 8.5)
  reflectionNotes: text("reflectionNotes"),
  generationMode: varchar("generationMode", { length: 50 }),
  templateId: int("templateId"), // Track which template was used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;

/**
 * Email Templates table - user-created email templates
 */
export const emailTemplates = mysqlTable("emailTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  promptTemplate: text("promptTemplate").notNull(), // The generation prompt with placeholders
  isDefault: boolean("isDefault").default(false).notNull(), // System-provided templates
  lastUsedAt: timestamp("lastUsedAt"), // Track when template was last used for sorting
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

/**
 * Logs table - debug console messages
 */
export const logs = mysqlTable("logs", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: int("workflowId").notNull(),
  level: mysqlEnum("level", ["info", "warning", "error", "debug"]).default("info").notNull(),
  agent: varchar("agent", { length: 100 }), // e.g., "Orchestrator", "EmailWriter-1"
  message: text("message").notNull(),
  testId: varchar("testId", { length: 100 }), // traceable test ID
  metadata: text("metadata"), // JSON string for additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Log = typeof logs.$inferSelect;
export type InsertLog = typeof logs.$inferInsert;
