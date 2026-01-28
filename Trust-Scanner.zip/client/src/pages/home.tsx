import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, Users, FileText, ArrowLeft, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { EntityCard } from "@/components/entity-card";
import { useEntities } from "@/hooks/use-entities";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: recentEntities, isLoading } = useEntities(); // Fetch all (limited by backend usually, but for now lists all)

  const features = [
    { icon: Shield, title: "تحقق من المصداقية", desc: "قاعدة بيانات ضخمة للتجار والأشخاص" },
    { icon: Users, title: "شارك تجربتك", desc: "ساعد الآخرين بنشر تجربتك الحقيقية" },
    { icon: FileText, title: "أدلة موثقة", desc: "كل تقييم يتم مراجعته بدقة من المشرفين" },
  ];

  return (
    <div className="min-h-screen bg-background font-cairo">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="container relative mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight font-tajawal">
              احمِ <span className="text-primary drop-shadow-[0_0_15px_rgba(255,191,0,0.5)]">نفسك وفلوسك</span> <br />
              من الاحتيال الرقمي
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              المنصة العربية الأولى لكشف الحسابات الوهمية والنصابين، وتوثيق التجار الموثوقين.
              ابحث قبل أن تحول.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-2xl">
              <Search className="h-6 w-6 text-muted-foreground mr-3" />
              <Input
                placeholder="ابحث بالاسم، رقم الهاتف، أو اسم المتجر..."
                className="border-0 bg-transparent text-lg h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Link href={`/entities?search=${search}`}>
                <Button size="lg" className="h-12 px-8 font-bold bg-primary text-black hover:bg-primary/90">
                  بحث
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-black/30 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 text-center hover:border-primary/30 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold flex items-center gap-3 font-tajawal">
              <TrendingUp className="text-primary" />
              أحدث الإضافات
            </h2>
            <Link href="/entities">
              <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
                عرض الكل <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[200px] w-full rounded-xl bg-white/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px] bg-white/5" />
                    <Skeleton className="h-4 w-[200px] bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEntities?.slice(0, 6).map((entity) => (
                <EntityCard key={entity.id} entity={entity} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      <footer className="py-12 border-t border-white/10 text-center text-zinc-500 bg-black">
        <div className="container mx-auto px-4">
          <Shield className="h-10 w-10 mx-auto text-zinc-700 mb-4" />
          <p className="mb-4 text-sm max-w-md mx-auto">
            موقع "اعرف مين النصاب ومين الثقة" هو منصة مجتمعية غير ربحية تهدف لرفع الوعي.
            نحن لا نتحمل مسؤولية أي تعاملات مالية تتم خارج المنصة.
          </p>
          <p>© 2024 جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
