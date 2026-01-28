import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === ENUMS ===
export const userRoleEnum = ["admin", "user"] as const;
export const entityStatusEnum = ["trusted", "scammer", "investigation"] as const;
export const serviceTypeEnum = ["game_charging", "account_selling", "digital_services", "other"] as const;
export const reviewStatusEnum = ["pending", "approved", "rejected"] as const;

// === USERS TABLE ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Hashed
  role: text("role", { enum: userRoleEnum }).default("user").notNull(),
  isBlocked: boolean("is_blocked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === ENTITIES TABLE (The people being rated) ===
export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image"), // URL
  phone: text("phone"),
  accountLink: text("account_link"),
  serviceType: text("service_type", { enum: serviceTypeEnum }).notNull(),
  status: text("status", { enum: entityStatusEnum }).default("investigation").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// === EVIDENCE TABLE ===
export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").references(() => entities.id).notNull(),
  title: text("title").notNull(),
  image: text("image").notNull(), // URL
  description: text("description"),
  rank: integer("rank").default(0), // For ordering
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === REVIEWS TABLE ===
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").references(() => entities.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  status: text("status", { enum: reviewStatusEnum }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === AUDIT LOGS TABLE ===
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === SYSTEM SETTINGS (For site lock/read-only) ===
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(), // JSON stringified
});

// === RELATIONS ===
export const entitiesRelations = relations(entities, ({ many }) => ({
  evidence: many(evidence),
  reviews: many(reviews),
}));

export const evidenceRelations = relations(evidence, ({ one }) => ({
  entity: one(entities, {
    fields: [evidence.entityId],
    references: [entities.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  entity: one(entities, {
    fields: [reviews.entityId],
    references: [entities.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

// === SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, isBlocked: true });
export const insertEntitySchema = createInsertSchema(entities).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEvidenceSchema = createInsertSchema(evidence).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, status: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type Entity = typeof entities.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEntity = z.infer<typeof insertEntitySchema>;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// API Types
export type LoginRequest = { username: string; password: string };
export type EntityWithDetails = Entity & { evidence: Evidence[]; reviews: Review[] };
