import { db } from "./db";
import {
  users, entities, evidence, reviews, auditLogs, settings,
  type User, type InsertUser,
  type Entity, type InsertEntity,
  type Evidence, type InsertEvidence,
  type Review, type InsertReview,
  type AuditLog,
  userRoleEnum, entityStatusEnum, serviceTypeEnum
} from "@shared/schema";
import { eq, ilike, or, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Entities
  getEntities(search?: string, status?: string, serviceType?: string): Promise<(Entity & { evidenceCount: number })[]>;
  getEntity(id: number): Promise<Entity | undefined>;
  createEntity(entity: InsertEntity): Promise<Entity>;
  updateEntity(id: number, entity: Partial<InsertEntity>): Promise<Entity | undefined>;
  deleteEntity(id: number): Promise<boolean>;

  // Evidence
  getEvidenceByEntityId(entityId: number): Promise<Evidence[]>;
  createEvidence(evidence: InsertEvidence): Promise<Evidence>;
  deleteEvidence(id: number): Promise<boolean>;

  // Reviews
  getReviewsByEntityId(entityId: number): Promise<Review[]>; // Approved only usually
  getAllReviewsByEntityId(entityId: number): Promise<Review[]>; // Admin
  createReview(review: InsertReview): Promise<Review>;
  getPendingReviews(): Promise<(Review & { entityName: string, username: string })[]>;
  updateReviewStatus(id: number, status: "approved" | "rejected"): Promise<Review | undefined>;

  // Logs & Stats
  createAuditLog(adminId: number, action: string, details?: string): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  getStats(): Promise<{ totalEntities: number; pendingReviews: number; totalUsers: number }>;
}

export class DatabaseStorage implements IStorage {
  // === Users ===
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // === Entities ===
  async getEntities(search?: string, status?: string, serviceType?: string): Promise<(Entity & { evidenceCount: number })[]> {
    let query = db.select().from(entities);
    const conditions = [];

    if (search) {
      conditions.push(or(
        ilike(entities.name, `%${search}%`),
        ilike(entities.phone, `%${search}%`)
      ));
    }
    if (status) {
      conditions.push(eq(entities.status, status as any));
    }
    if (serviceType) {
      conditions.push(eq(entities.serviceType, serviceType as any));
    }

    if (conditions.length > 0) {
      // @ts-ignore - complex query building with optional logic
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(entities.createdAt));

    // Efficiently get evidence counts
    // For simplicity in MVP, we loop. Ideal: aggregation query.
    const resultsWithCount = await Promise.all(results.map(async (e) => {
      const ev = await db.select().from(evidence).where(eq(evidence.entityId, e.id));
      return { ...e, evidenceCount: ev.length };
    }));

    return resultsWithCount;
  }

  async getEntity(id: number): Promise<Entity | undefined> {
    const [entity] = await db.select().from(entities).where(eq(entities.id, id));
    return entity;
  }

  async createEntity(insertEntity: InsertEntity): Promise<Entity> {
    const [entity] = await db.insert(entities).values(insertEntity).returning();
    return entity;
  }

  async updateEntity(id: number, update: Partial<InsertEntity>): Promise<Entity | undefined> {
    const [entity] = await db.update(entities).set({ ...update, updatedAt: new Date() }).where(eq(entities.id, id)).returning();
    return entity;
  }

  async deleteEntity(id: number): Promise<boolean> {
    // Delete related reviews and evidence first to avoid FK issues
    await db.delete(reviews).where(eq(reviews.entityId, id));
    await db.delete(evidence).where(eq(evidence.entityId, id));
    const result = await db.delete(entities).where(eq(entities.id, id)).returning();
    return result.length > 0;
  }

  // === Evidence ===
  async getEvidenceByEntityId(entityId: number): Promise<Evidence[]> {
    return await db.select().from(evidence).where(eq(evidence.entityId, entityId)).orderBy(desc(evidence.rank));
  }

  async createEvidence(insertEvidence: InsertEvidence): Promise<Evidence> {
    const [ev] = await db.insert(evidence).values(insertEvidence).returning();
    return ev;
  }

  async deleteEvidence(id: number): Promise<boolean> {
    const result = await db.delete(evidence).where(eq(evidence.id, id)).returning();
    return result.length > 0;
  }

  // === Reviews ===
  async getReviewsByEntityId(entityId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(and(eq(reviews.entityId, entityId), eq(reviews.status, "approved"))).orderBy(desc(reviews.createdAt));
  }

  async getAllReviewsByEntityId(entityId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.entityId, entityId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async getPendingReviews(): Promise<(Review & { entityName: string, username: string })[]> {
    const pending = await db.select({
      review: reviews,
      entityName: entities.name,
      username: users.username
    })
    .from(reviews)
    .innerJoin(entities, eq(reviews.entityId, entities.id))
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.status, "pending"));

    return pending.map(row => ({
      ...row.review,
      entityName: row.entityName,
      username: row.username
    }));
  }

  async updateReviewStatus(id: number, status: "approved" | "rejected"): Promise<Review | undefined> {
    const [review] = await db.update(reviews).set({ status }).where(eq(reviews.id, id)).returning();
    return review;
  }

  // === Logs & Stats ===
  async createAuditLog(adminId: number, action: string, details?: string): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values({ adminId, action, details }).returning();
    return log;
  }

  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async getStats(): Promise<{ totalEntities: number; pendingReviews: number; totalUsers: number }> {
    const totalEntities = (await db.select().from(entities)).length;
    const pendingReviews = (await db.select().from(reviews).where(eq(reviews.status, "pending"))).length;
    const totalUsers = (await db.select().from(users)).length;
    return { totalEntities, pendingReviews, totalUsers };
  }
}

export const storage = new DatabaseStorage();
