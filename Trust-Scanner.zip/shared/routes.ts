import { z } from 'zod';
import { insertUserSchema, insertEntitySchema, insertEvidenceSchema, insertReviewSchema, entities, evidence, reviews, users, auditLogs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: z.object({
        username: z.string().min(3),
        password: z.string().min(6),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  entities: {
    list: {
      method: 'GET' as const,
      path: '/api/entities',
      input: z.object({
        search: z.string().optional(),
        status: z.enum(["trusted", "scammer", "investigation"]).optional(),
        serviceType: z.enum(["game_charging", "account_selling", "digital_services", "other"]).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof entities.$inferSelect & { evidenceCount: number }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/entities/:id',
      responses: {
        200: z.custom<typeof entities.$inferSelect & { evidence: typeof evidence.$inferSelect[], reviews: typeof reviews.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/entities',
      input: insertEntitySchema,
      responses: {
        201: z.custom<typeof entities.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/entities/:id',
      input: insertEntitySchema.partial(),
      responses: {
        200: z.custom<typeof entities.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/entities/:id',
      responses: {
        204: z.undefined(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  evidence: {
    create: {
      method: 'POST' as const,
      path: '/api/evidence',
      input: insertEvidenceSchema,
      responses: {
        201: z.custom<typeof evidence.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/evidence/:id',
      responses: {
        204: z.undefined(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  reviews: {
    create: {
      method: 'POST' as const,
      path: '/api/reviews',
      input: insertReviewSchema.omit({ userId: true }), // User ID from session
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    listPending: { // Admin only
      method: 'GET' as const,
      path: '/api/reviews/pending',
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect & { entityName: string, username: string }>()),
        401: errorSchemas.unauthorized,
      },
    },
    moderate: { // Admin only
      method: 'PATCH' as const,
      path: '/api/reviews/:id',
      input: z.object({ status: z.enum(["approved", "rejected"]) }),
      responses: {
        200: z.custom<typeof reviews.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  stats: {
    dashboard: { // Admin only stats
      method: 'GET' as const,
      path: '/api/stats/dashboard',
      responses: {
        200: z.object({
          totalEntities: z.number(),
          pendingReviews: z.number(),
          totalUsers: z.number(),
          recentLogs: z.array(z.custom<typeof auditLogs.$inferSelect>())
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
