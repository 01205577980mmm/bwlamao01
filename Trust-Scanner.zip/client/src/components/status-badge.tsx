import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "trusted" | "scammer" | "investigation";

const config = {
  trusted: {
    label: "ثقة ومضمون",
    icon: ShieldCheck,
    className: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
    iconColor: "text-green-500"
  },
  scammer: {
    label: "نصاب - احذر",
    icon: ShieldAlert,
    className: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
    iconColor: "text-red-500"
  },
  investigation: {
    label: "تحت التحقيق",
    icon: AlertTriangle,
    className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20",
    iconColor: "text-yellow-500"
  }
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { label, icon: Icon, className: badgeClass } = config[status];
  
  return (
    <Badge variant="outline" className={cn("gap-1.5 py-1 px-3", badgeClass, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
