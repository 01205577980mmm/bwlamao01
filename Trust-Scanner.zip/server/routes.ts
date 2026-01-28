import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { userRoleEnum } from "@shared/schema";

// Middleware to check if user is admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized: Admin access required" });
  }
  next();
};

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized: Login required" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (Passport)
  setupAuth(app);

  // === Auth Routes ===
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        username: input.username,
        password: hashedPassword,
        role: "user",
      });
      req.logIn(user, (err) => {
        if (err) throw err;
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not logged in" });
    }
  });

  // === Entity Routes ===
  app.get(api.entities.list.path, async (req, res) => {
    const input = api.entities.list.input?.parse(req.query);
    const entities = await storage.getEntities(input?.search, input?.status, input?.serviceType);
    res.json(entities);
  });

  app.get(api.entities.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const entity = await storage.getEntity(id);
    if (!entity) return res.status(404).json({ message: "Not found" });
    const evidence = await storage.getEvidenceByEntityId(id);
    // Admins see all reviews, Users see approved
    const reviews = (req.isAuthenticated() && (req.user as any).role === 'admin')
      ? await storage.getAllReviewsByEntityId(id)
      : await storage.getReviewsByEntityId(id);
    res.json({ ...entity, evidence, reviews });
  });

  app.post(api.entities.create.path, requireAdmin, async (req, res) => {
    const input = api.entities.create.input.parse(req.body);
    const entity = await storage.createEntity(input);
    await storage.createAuditLog((req.user as any).id, "create_entity", `Created ${entity.name}`);
    res.status(201).json(entity);
  });

  app.put(api.entities.update.path, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const input = api.entities.update.input.parse(req.body);
    const entity = await storage.updateEntity(id, input);
    if (!entity) return res.status(404).json({ message: "Not found" });
    await storage.createAuditLog((req.user as any).id, "update_entity", `Updated ${entity.name}`);
    res.json(entity);
  });

  app.delete(api.entities.delete.path, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const deleted = await storage.deleteEntity(id);
    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }
    await storage.createAuditLog((req.user as any).id, "delete_entity", `Deleted entity ${id}`);
    res.status(204).send();
  });

  // === Evidence Routes ===
  app.post(api.evidence.create.path, requireAdmin, async (req, res) => {
    const input = api.evidence.create.input.parse(req.body);
    const ev = await storage.createEvidence(input);
    await storage.createAuditLog((req.user as any).id, "add_evidence", `Added evidence for entity ${input.entityId}`);
    res.status(201).json(ev);
  });

  app.delete(api.evidence.delete.path, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const deleted = await storage.deleteEvidence(id);
    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }
    await storage.createAuditLog((req.user as any).id, "delete_evidence", `Deleted evidence ${id}`);
    res.status(204).send();
  });

  // === Review Routes ===
  app.post(api.reviews.create.path, requireAuth, async (req, res) => {
    const input = api.reviews.create.input.parse(req.body);
    const review = await storage.createReview({ ...input, userId: (req.user as any).id });
    res.status(201).json(review);
  });

  app.get(api.reviews.listPending.path, requireAdmin, async (req, res) => {
    const pending = await storage.getPendingReviews();
    res.json(pending);
  });

  app.patch(api.reviews.moderate.path, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { status } = api.reviews.moderate.input.parse(req.body);
    const review = await storage.updateReviewStatus(id, status);
    if (!review) return res.status(404).json({ message: "Not found" });
    await storage.createAuditLog((req.user as any).id, "moderate_review", `${status} review ${id}`);
    res.json(review);
  });

  // === Stats Routes ===
  app.get(api.stats.dashboard.path, requireAdmin, async (req, res) => {
    const stats = await storage.getStats();
    const logs = await storage.getAuditLogs();
    res.json({ ...stats, recentLogs: logs });
  });

  // === Seed Data (Init) ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    console.log("Seeding database (base admin and demo entities)...");
    // أقوى: كلمة مرور طويلة ومعقدة للحساب الرئيسي
    const hashed = await hashPassword("Adm!n#2025_StrongPass");
    await storage.createUser({
      username: "admin",
      password: hashed,
      role: "admin",
    });

    const entity1 = await storage.createEntity({
      name: "متجر الألعاب الذهبي",
      serviceType: "game_charging",
      status: "trusted",
      isVerified: true,
      phone: "0501234567",
      image: "https://ui-avatars.com/api/?name=Golden+Games&background=22c55e&color=fff",
    });

    const entity2 = await storage.createEntity({
      name: "بائع الحسابات الوهمي",
      serviceType: "account_selling",
      status: "scammer",
      isVerified: false,
      phone: "0509999999",
      image: "https://ui-avatars.com/api/?name=Scammer+X&background=ef4444&color=fff",
    });

    await storage.createEvidence({
      entityId: entity2.id,
      title: "سكرين شوت محادثة",
      image: "https://placehold.co/600x400/png",
      description: "طلب تحويل المبلغ ثم قام بالحظر",
      rank: 1
    });
  }

  // Ensure a set of demo admin accounts exist (each with its own password)
  // usernames: 10 أحرف، وكلمات السر: 10 خانات (حروف + أرقام)
  const demoAdmins = [
    { username: "AdminTrust", password: "Ad1mN9x7Q2" },
    { username: "SecureAdm1", password: "Bx4pZ8k3T1" },
    { username: "ShieldAdm2", password: "Ck7mL2r9V5" },
    { username: "VerifyAdm3", password: "Dq9sF5w1X8" },
    { username: "TrustedAd4", password: "Ep2vH7c4Z6" },
    { username: "ControlAd5", password: "Fz6bN3t8Y9" },
    { username: "MonitorA6", password: "Gm1dQ9p5R3" },
    { username: "ProtectA7", password: "Hk8sJ2w6U4" },
    { username: "GuardAdm8", password: "Jr3vL8y1P7" },
    { username: "MasterAd9", password: "Kp5xC4z9S2" },
  ] as const;

  for (const demo of demoAdmins) {
    const exists = await storage.getUserByUsername(demo.username);
    if (!exists) {
      const hashedPassword = await hashPassword(demo.password);
      await storage.createUser({
        username: demo.username,
        password: hashedPassword,
        role: "admin",
      });
    }
  }

  console.log("Seeding complete (admins ensured).");
}
