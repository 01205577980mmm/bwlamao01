import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { CheckCircle2, MoreHorizontal, Eye } from "lucide-react";
import type { Entity } from "@shared/schema";

interface EntityCardProps {
  entity: Entity & { evidenceCount?: number };
}

export function EntityCard({ entity }: EntityCardProps) {
  const serviceLabels: Record<string, string> = {
    game_charging: "شحن ألعاب",
    account_selling: "بيع حسابات",
    digital_services: "خدمات رقمية",
    other: "أخرى",
  };

  return (
    <Card className="group glass-card overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,191,0,0.1)]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-white/10 group-hover:border-primary/50 transition-colors">
            <AvatarImage src={entity.image || ""} alt={entity.name} />
            <AvatarFallback className="bg-zinc-800 text-lg font-bold">
              {entity.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-lg leading-none">{entity.name}</h3>
              {entity.isVerified && (
                <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500/10" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {serviceLabels[entity.serviceType]}
            </p>
          </div>
        </div>
        <StatusBadge status={entity.status as any} />
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex items-center justify-between text-sm text-zinc-400 mt-2 p-3 rounded-lg bg-black/20">
          <span>عدد الأدلة المرفقة:</span>
          <Badge variant="secondary" className="font-mono">
            {entity.evidenceCount || 0}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/entities/${entity.id}`} className="w-full">
          <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-primary/30">
            <Eye className="ml-2 h-4 w-4" />
            عرض التفاصيل
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
