import { useState } from "react";
import { Navbar } from "@/components/layout-navbar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEntities } from "@/hooks/use-entities";
import { EntityCard } from "@/components/entity-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EntityList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [serviceType, setServiceType] = useState("all");

  const { data: entities, isLoading } = useEntities({ search, status, serviceType });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 space-y-4">
          <h1 className="text-3xl font-bold font-tajawal">دليل البحث</h1>
          <p className="text-muted-foreground">ابحث في قاعدة البيانات عن التجار والأفراد</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 p-6 rounded-2xl glass-card">
          <div className="md:col-span-2 relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث بالاسم أو الرقم..." 
              className="pr-10 glass-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="trusted">ثقة ✅</SelectItem>
              <SelectItem value="scammer">نصاب ❌</SelectItem>
              <SelectItem value="investigation">تحت التحقيق ⚠️</SelectItem>
            </SelectContent>
          </Select>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="نوع الخدمة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الخدمات</SelectItem>
              <SelectItem value="game_charging">شحن ألعاب</SelectItem>
              <SelectItem value="account_selling">بيع حسابات</SelectItem>
              <SelectItem value="digital_services">خدمات رقمية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[250px] w-full rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : entities && entities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity) => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <FilterX className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-zinc-500">جرب تغيير معايير البحث</p>
            <Button 
              variant="link" 
              onClick={() => { setSearch(""); setStatus("all"); setServiceType("all"); }}
              className="mt-4 text-primary"
            >
              إعادة تعيين الفلاتر
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
