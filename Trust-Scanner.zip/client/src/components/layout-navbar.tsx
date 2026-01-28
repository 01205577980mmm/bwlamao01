import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, LogIn, LogOut, Menu, User, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/entities", label: "تصفح القائمة" },
    { href: "/about", label: "عن الموقع" },
  ];

  const NavContent = () => (
    <>
      {links.map((link) => (
        <Link 
          key={link.href} 
          href={link.href}
          className={`text-lg font-medium transition-colors hover:text-primary ${
            location === link.href ? "text-primary font-bold" : "text-muted-foreground"
          }`}
          onClick={() => setIsOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <ShieldCheck className="h-8 w-8 text-primary transition-all group-hover:scale-110 group-hover:text-primary/80" />
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
          </div>
          <span className="text-xl font-bold font-tajawal tracking-tight">
            اعرف مين <span className="text-primary">النصاب ومين الثقة</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavContent />
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5 hover:text-primary">
                  <User className={`h-4 w-4 ${user.role === "admin" ? "text-primary" : ""}`} />
                  <span className="hidden sm:inline flex items-center gap-1">
                    {user.username}
                    {user.role === "admin" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/40">
                        مشرف موثّق
                      </span>
                    )}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800">
                <DropdownMenuLabel>
                  حسابي {user.role === "admin" && <span className="text-[11px] text-primary ml-1">(مشرف)</span>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <LayoutDashboard className="ml-2 h-4 w-4" />
                      لوحة التحكم
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => logout.mutate()} className="text-red-500 focus:text-red-400 cursor-pointer">
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button size="sm" className="bg-primary text-black hover:bg-primary/90 font-bold shadow-[0_0_15px_rgba(255,191,0,0.3)]">
                <LogIn className="ml-2 h-4 w-4" />
                دخول / تسجيل
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-zinc-950 border-l border-zinc-800">
              <div className="flex flex-col gap-6 mt-10">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
