import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAdminStats, usePendingReviews, useModerateReview } from "@/hooks/use-admin";
import { useCreateEntity, useAddEvidence, useUpdateEntity } from "@/hooks/use-entities";
import { Navbar } from "@/components/layout-navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Shield, Users, MessageSquare, AlertTriangle, Plus, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { useEntities } from "@/hooks/use-entities"; // To search for entities to add evidence to

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  if (user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const { data: stats } = useAdminStats();
  const { data: pendingReviews } = usePendingReviews();
  const moderateReview = useModerateReview();
  const createEntity = useCreateEntity();
  const addEvidence = useAddEvidence();
  const { data: entities } = useEntities(); // For dropdown in evidence tab

  // Form States
  const [newEntity, setNewEntity] = useState({ name: "", phone: "", accountLink: "", serviceType: "other" as any, status: "investigation" as any, image: "" });
  const [evidenceData, setEvidenceData] = useState({ entityId: "", title: "", image: "", description: "" });

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    createEntity.mutate(newEntity);
    setNewEntity({ name: "", phone: "", accountLink: "", serviceType: "other", status: "investigation", image: "" });
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    addEvidence.mutate({
      entityId: Number(evidenceData.entityId),
      title: evidenceData.title,
      image: evidenceData.image,
      description: evidenceData.description,
    });
    setEvidenceData({ entityId: "", title: "", image: "", description: "" });
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-tajawal text-primary">لوحة تحكم المشرفين 🔒</h1>
          <Button variant="destructive" className="gap-2">
            <Lock className="h-4 w-4" /> قفل الموقع (للطوارئ)
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">إجمالي الأشخاص</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.totalEntities || 0}</div></CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">مراجعات معلقة</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-500">{stats?.pendingReviews || 0}</div></CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">المستخدمين</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.totalUsers || 0}</div></CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">آخر نشاط</CardTitle></CardHeader>
            <CardContent><div className="text-sm text-zinc-500">{stats?.recentLogs?.[0]?.action || "لا يوجد"}</div></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="add-person" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 w-full justify-start p-1 h-auto flex-wrap">
            <TabsTrigger value="add-person" className="data-[state=active]:bg-primary data-[state=active]:text-black gap-2 p-3"><Plus className="h-4 w-4" /> إضافة شخص</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-black gap-2 p-3"><MessageSquare className="h-4 w-4" /> مراجعة الآراء</TabsTrigger>
            <TabsTrigger value="evidence" className="data-[state=active]:bg-primary data-[state=active]:text-black gap-2 p-3"><Shield className="h-4 w-4" /> رفع الأدلة</TabsTrigger>
          </TabsList>

          <TabsContent value="add-person">
            <Card className="glass-card max-w-2xl">
              <CardHeader><CardTitle>إضافة سجل جديد</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEntity} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الاسم الكامل</Label>
                      <Input value={newEntity.name} onChange={e => setNewEntity({...newEntity, name: e.target.value})} className="bg-black/20" />
                    </div>
                    <div className="space-y-2">
                      <Label>رقم الهاتف</Label>
                      <Input value={newEntity.phone} onChange={e => setNewEntity({...newEntity, phone: e.target.value})} className="bg-black/20" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>رابط الصورة (URL)</Label>
                    <Input value={newEntity.image} onChange={e => setNewEntity({...newEntity, image: e.target.value})} className="bg-black/20" placeholder="https://..." />
                  </div>

                  <div className="space-y-2">
                    <Label>رابط الحساب</Label>
                    <Input value={newEntity.accountLink} onChange={e => setNewEntity({...newEntity, accountLink: e.target.value})} className="bg-black/20" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نوع الخدمة</Label>
                      <Select value={newEntity.serviceType} onValueChange={(v: any) => setNewEntity({...newEntity, serviceType: v})}>
                        <SelectTrigger className="bg-black/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="game_charging">شحن ألعاب</SelectItem>
                          <SelectItem value="account_selling">بيع حسابات</SelectItem>
                          <SelectItem value="digital_services">خدمات رقمية</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>الحالة</Label>
                      <Select value={newEntity.status} onValueChange={(v: any) => setNewEntity({...newEntity, status: v})}>
                        <SelectTrigger className="bg-black/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trusted">ثقة ✅</SelectItem>
                          <SelectItem value="scammer">نصاب ❌</SelectItem>
                          <SelectItem value="investigation">تحت التحقيق ⚠️</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" disabled={createEntity.isPending} className="w-full bg-primary text-black hover:bg-primary/90">
                    {createEntity.isPending ? "جاري الإضافة..." : "حفظ البيانات"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="grid gap-4">
              {pendingReviews?.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">لا توجد مراجعات معلقة</div>
              ) : (
                pendingReviews?.map((review) => (
                  <Card key={review.id} className="bg-zinc-900 border-zinc-800">
                    <CardContent className="pt-6 flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{review.username}</span>
                          <span className="text-zinc-500 text-sm">عن: {review.entityName}</span>
                        </div>
                        <p className="text-zinc-300 bg-black/30 p-3 rounded-lg">{review.content}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="icon" className="bg-green-600 hover:bg-green-700" onClick={() => moderateReview.mutate({ id: review.id, status: "approved" })}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => moderateReview.mutate({ id: review.id, status: "rejected" })}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="evidence">
             <Card className="glass-card max-w-2xl">
              <CardHeader><CardTitle>رفع دليل جديد</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddEvidence} className="space-y-4">
                  <div className="space-y-2">
                    <Label>اختر الشخص</Label>
                    <Select value={evidenceData.entityId} onValueChange={(v) => setEvidenceData({...evidenceData, entityId: v})}>
                      <SelectTrigger className="bg-black/20"><SelectValue placeholder="بحث..." /></SelectTrigger>
                      <SelectContent>
                        {entities?.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>عنوان الدليل</Label>
                    <Input value={evidenceData.title} onChange={e => setEvidenceData({...evidenceData, title: e.target.value})} className="bg-black/20" placeholder="مثلاً: لقطة شاشة للمحادثة" />
                  </div>

                  <div className="space-y-2">
                    <Label>رابط الصورة</Label>
                    <Input value={evidenceData.image} onChange={e => setEvidenceData({...evidenceData, image: e.target.value})} className="bg-black/20" placeholder="https://..." />
                  </div>

                  <div className="space-y-2">
                    <Label>وصف إضافي</Label>
                    <Textarea value={evidenceData.description} onChange={e => setEvidenceData({...evidenceData, description: e.target.value})} className="bg-black/20" />
                  </div>

                  <Button type="submit" disabled={addEvidence.isPending} className="w-full bg-primary text-black hover:bg-primary/90">
                    {addEvidence.isPending ? "جاري الرفع..." : "إضافة الدليل"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
