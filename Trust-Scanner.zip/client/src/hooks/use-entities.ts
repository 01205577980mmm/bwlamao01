import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertEntity, InsertEvidence, InsertReview } from "@shared/schema";

export function useEntities(filters?: { search?: string; status?: string; serviceType?: string }) {
  const queryKey = [api.entities.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.entities.list.path;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.status && filters.status !== "all") params.append("status", filters.status);
        if (filters.serviceType && filters.serviceType !== "all") params.append("serviceType", filters.serviceType);
        if (params.toString()) url += `?${params.toString()}`;
      }
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch entities");
      return api.entities.list.responses[200].parse(await res.json());
    },
  });
}

export function useEntity(id: number) {
  return useQuery({
    queryKey: [api.entities.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.entities.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch entity");
      return api.entities.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertEntity) => {
      const res = await fetch(api.entities.create.path, {
        method: api.entities.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل في إضافة السجل");
      return api.entities.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.entities.list.path] });
      toast({ title: "تم الإضافة بنجاح", description: "تمت إضافة السجل الجديد لقاعدة البيانات" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء الإضافة" });
    }
  });
}

export function useUpdateEntity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertEntity>) => {
      const url = buildUrl(api.entities.update.path, { id });
      const res = await fetch(url, {
        method: api.entities.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update");
      return api.entities.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.entities.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.get.path, id] });
      toast({ title: "تم التحديث", description: "تم تحديث البيانات بنجاح" });
    },
  });
}

export function useAddEvidence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertEvidence) => {
      const res = await fetch(api.evidence.create.path, {
        method: api.evidence.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add evidence");
      return api.evidence.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.entities.get.path, variables.entityId] });
      toast({ title: "تم إضافة الدليل", description: "تم توثيق الدليل بنجاح" });
    },
  });
}

export function useDeleteEntity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.entities.delete.path, { id });
      const res = await fetch(url, {
        method: api.entities.delete.method,
        credentials: "include",
      });
      if (res.status === 404) throw new Error("السجل غير موجود");
      if (!res.ok) throw new Error("فشل في حذف السجل");
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [api.entities.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.get.path, id] });
      toast({ title: "تم حذف السجل", description: "تم حذف الشخص من قاعدة البيانات" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "خطأ في الحذف", description: error?.message || "حدث خطأ أثناء الحذف" });
    },
  });
}

export function useDeleteEvidence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, entityId }: { id: number; entityId: number }) => {
      const url = buildUrl(api.evidence.delete.path, { id });
      const res = await fetch(url, {
        method: api.evidence.delete.method,
        credentials: "include",
      });
      if (res.status === 404) throw new Error("الدليل غير موجود");
      if (!res.ok) throw new Error("فشل في حذف الدليل");
      return { entityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.entities.get.path, data.entityId] });
      toast({ title: "تم حذف الدليل", description: "تم إزالة الدليل بنجاح" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "خطأ في الحذف", description: error?.message || "حدث خطأ أثناء الحذف" });
    },
  });
}

export function useAddReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertReview, "userId">) => {
      const res = await fetch(api.reviews.create.path, {
        method: api.reviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add review");
      return api.reviews.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "تم إرسال رأيك", description: "سيتم مراجعة رأيك من قبل الإدارة قبل النشر" });
    },
  });
}
