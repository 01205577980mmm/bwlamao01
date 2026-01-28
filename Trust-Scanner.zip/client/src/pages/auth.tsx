import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ username, password });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.1)_0%,transparent_70%)]" />
      <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <Link href="/" className="absolute top-8 left-8 text-muted-foreground hover:text-white flex items-center gap-2 transition-colors z-20">
        <ArrowRight className="h-4 w-4" /> العودة للرئيسية
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 shadow-[0_0_20px_rgba(255,191,0,0.2)]">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold font-tajawal">كاشف النصب</h1>
          <p className="text-muted-foreground mt-2">سجل دخولك للمشاركة في المجتمع</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/5 mb-4">
            <TabsTrigger value="login">دخول</TabsTrigger>
            <TabsTrigger value="register">تسجيل جديد</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="glass-card border-t-4 border-t-primary">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>تسجيل الدخول</CardTitle>
                  <CardDescription>أدخل بيانات حسابك للمتابعة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-user">اسم المستخدم</Label>
                    <Input 
                      id="login-user" 
                      className="glass-input" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-pass">كلمة المرور</Label>
                    <Input 
                      id="login-pass" 
                      type="password" 
                      className="glass-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90 font-bold" disabled={login.isPending}>
                    {login.isPending ? "جاري الدخول..." : "دخول"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card className="glass-card border-t-4 border-t-blue-500">
              <form onSubmit={handleRegister}>
                <CardHeader>
                  <CardTitle>حساب جديد</CardTitle>
                  <CardDescription>انضم إلينا وشارك في كشف الحقيقة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-user">اسم المستخدم</Label>
                    <Input 
                      id="reg-user" 
                      className="glass-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-pass">كلمة المرور</Label>
                    <Input 
                      id="reg-pass" 
                      type="password" 
                      className="glass-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold" disabled={register.isPending}>
                    {register.isPending ? "جاري التسجيل..." : "إنشاء الحساب"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
