import { useParams, Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout-navbar";
import { useEntity, useAddReview, useDeleteEntity, useDeleteEvidence, useUpdateEntity } from "@/hooks/use-entities";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, MessageSquare, Phone, Globe, Shield, User, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function EntityDetail() {
  const { id } = useParams();
  const { data: entity, isLoading } = useEntity(Number(id));
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const addReview = useAddReview();
  const deleteEntity = useDeleteEntity();
  const deleteEvidence = useDeleteEvidence();
  const updateEntity = useUpdateEntity();
  
  const [reviewContent, setReviewContent] = useState("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [statusDraft, setStatusDraft] = useState<string | null>(null);

  useEffect(() => {
    if (entity && !statusDraft) {
      setStatusDraft(entity.status);
    }
  }, [entity, statusDraft]);

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) return;
    await addReview.mutateAsync({
      entityId: Number(id),
      content: reviewContent,
    });
    setReviewContent("");
    setIsReviewOpen(false);
  };

  const handleDeleteEntity = async () => {
    if (!entity) return;
    if (!window.confirm("هل أنت متأكد من حذف هذا الشخص بجميع مراجعاته وأدلته؟ هذا الإجراء لا يمكن التراجع عنه.")) {
      return;
    }
    await deleteEntity.mutateAsync(entity.id);
    navigate("/entities");
  };

  const handleUpdateStatus = async () => {
    if (!entity || !statusDraft || statusDraft === entity.status) return;
    await updateEntity.mutateAsync({ id: entity.id, status: statusDraft as any });
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري التحميل...</div>;
  if (!entity) return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
    <h1 className="text-2xl font-bold mb-4">الصفحة غير موجودة</h1>
    <Link href="/"><Button>العودة للرئيسية</Button></Link>
  </div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header Profile */}
        <div className="glass-card rounded-3xl p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
            <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
            <Avatar className="h-32 w-32 border-4 border-black shadow-2xl ring-2 ring-white/10">
              <AvatarImage src={entity.image || ""} />
              <AvatarFallback className="text-4xl bg-zinc-800">{entity.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-3xl md:text-4xl font-black font-tajawal">{entity.name}</h1>
                {entity.isVerified && (
                  <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-bold border border-blue-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                    حساب موثق
                  </div>
                )}
                <StatusBadge status={entity.status as any} className="text-base py-1 px-4" />
              </div>

              {user?.role === "admin" && (
                <div className="mt-4 flex flex-wrap items-center gap-6">
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-400">تعديل حالة الشخص</Label>
                    <Select
                      value={statusDraft ?? entity.status}
                      onValueChange={(v) => setStatusDraft(v)}
                    >
                      <SelectTrigger className="w-56 bg-black/40 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trusted">ثقة ✅</SelectItem>
                        <SelectItem value="scammer">نصاب ❌</SelectItem>
                        <SelectItem value="investigation">تحت التحقيق ⚠️</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 flex flex-col">
                    <Label className="text-xs text-zinc-400">علامة توثيق المتجر</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={entity.isVerified}
                        onCheckedChange={(checked) =>
                          updateEntity.mutate({ id: entity.id, isVerified: checked })
                        }
                      />
                      <span className="text-xs text-zinc-300">
                        {entity.isVerified ? "موثّق ✅" : "غير موثّق"}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="mt-6"
                    disabled={updateEntity.isPending || !statusDraft || statusDraft === entity.status}
                    onClick={handleUpdateStatus}
                  >
                    {updateEntity.isPending ? "جاري حفظ الحالة..." : "حفظ الحالة"}
                  </Button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4 text-zinc-400">
                {entity.phone && (
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">{entity.phone}</span>
                  </div>
                )}
                {entity.accountLink && (
                  <a href={entity.accountLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg hover:text-primary transition-colors">
                    <Globe className="h-4 w-4" />
                    رابط الحساب
                  </a>
                )}
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                  <Shield className="h-4 w-4" />
                  {entity.serviceType}
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-3">
              {user ? (
                <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full bg-primary text-black hover:bg-primary/90 font-bold">
                      <MessageSquare className="ml-2 h-4 w-4" />
                      أضف تجربتك
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle>شاركنا تجربتك مع {entity.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Textarea 
                        placeholder="اكتب تفاصيل تجربتك هنا... (سيتم مراجعتها قبل النشر)" 
                        className="bg-black/50 border-white/10 min-h-[150px]"
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                      />
                      <Button 
                        onClick={handleSubmitReview} 
                        disabled={addReview.isPending}
                        className="w-full"
                      >
                        {addReview.isPending ? "جاري الإرسال..." : "إرسال للمراجعة"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Link href="/auth">
                  <Button variant="outline" className="w-full border-white/10">
                    سجل دخول لتكتب رأيك
                  </Button>
                </Link>
              )}
              {user?.role === "admin" && (
                <Button
                  variant="destructive"
                  className="w-full mt-2 flex items-center justify-center gap-2"
                  disabled={deleteEntity.isPending}
                  onClick={handleDeleteEntity}
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteEntity.isPending ? "جاري الحذف..." : "حذف هذا الشخص بالكامل"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="text-primary" />
              تجارب المستخدمين
            </h2>
            
            <div className="space-y-4">
              {entity.reviews.filter(r => r.status === 'approved').length > 0 ? (
                entity.reviews.filter(r => r.status === 'approved').map((review) => (
                  <div key={review.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                        <User className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-200">مستخدم موثق</div>
                        <div className="text-xs text-zinc-500">
                          {format(new Date(review.createdAt), "d MMMM yyyy", { locale: ar })}
                        </div>
                      </div>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{review.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-zinc-500">لا توجد مراجعات منشورة حتى الآن</p>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Column */}
            <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="text-primary" />
              الأدلة المرفقة
            </h2>
            
            <div className="space-y-4">
              {entity.evidence.length > 0 ? (
                entity.evidence.sort((a,b) => (a.rank||0) - (b.rank||0)).map((ev) => (
                <Dialog key={ev.id}>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer group relative rounded-xl overflow-hidden border border-white/10">
                        <div className="aspect-video bg-zinc-900 relative">
                          {/* Use Unsplash placeholder if actual URL is missing */}
                          <img 
                            src={ev.image} 
                            alt={ev.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              // Fallback image
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=800" 
                            }}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold border border-white px-4 py-2 rounded-full">عرض الدليل</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white/5">
                          <h4 className="font-bold text-sm truncate">{ev.title}</h4>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden">
                      <img src={ev.image} alt={ev.title} className="w-full h-auto max-h-[80vh] object-contain" />
                      <div className="p-4 bg-black/80 space-y-3">
                        <h3 className="text-xl font-bold mb-2">{ev.title}</h3>
                        <p className="text-zinc-400">{ev.description}</p>
                        {user?.role === "admin" && (
                          <Button
                            variant="destructive"
                            className="w-full flex items-center justify-center gap-2 mt-2"
                            disabled={deleteEvidence.isPending}
                            onClick={async () => {
                              if (!window.confirm("هل تريد بالتأكيد حذف هذا الدليل؟")) return;
                              await deleteEvidence.mutateAsync({ id: ev.id, entityId: entity.id });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            {deleteEvidence.isPending ? "جاري حذف الدليل..." : "حذف هذا الدليل"}
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-zinc-500">لا توجد أدلة مرفقة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
