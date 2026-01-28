import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAdminStats() {
  return useQuery({
    queryKey: [api.stats.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.stats.dashboard.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.dashboard.responses[200].parse(await res.json());
    },
  });
}

export function usePendingReviews() {
  return useQuery({
    queryKey: [api.reviews.listPending.path],
    queryFn: async () => {
      const res = await fetch(api.reviews.listPending.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pending reviews");
      return api.reviews.listPending.responses[200].parse(await res.json());
    },
  });
}

export function useModerateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "approved" | "rejected" }) => {
      const url = buildUrl(api.reviews.moderate.path, { id });
      const res = await fetch(url, {
        method: api.reviews.moderate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to moderate review");
      return api.reviews.moderate.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reviews.listPending.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.dashboard.path] });
      toast({ title: "تم تحديث حالة المراجعة" });
    },
  });
}
