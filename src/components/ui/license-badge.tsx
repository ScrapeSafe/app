import { LicenseType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Bot, Brain } from 'lucide-react';

interface LicenseBadgeProps {
  type: LicenseType;
  enabled?: boolean;
}

export const LicenseBadge = ({ type, enabled = true }: LicenseBadgeProps) => {
  const config = {
    scrape: {
      label: 'Scrape',
      icon: Bot,
      enabledClass: 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_hsl(var(--primary)/0.3)]',
      disabledClass: 'bg-muted/50 text-muted-foreground border-border',
    },
    train: {
      label: 'Train',
      icon: Brain,
      enabledClass: 'bg-accent/20 text-accent border-accent/40 shadow-[0_0_10px_hsl(var(--accent)/0.3)]',
      disabledClass: 'bg-muted/50 text-muted-foreground border-border',
    },
  };

  const { label, icon: Icon, enabledClass, disabledClass } = config[type];

  return (
    <Badge 
      variant="outline" 
      className={`gap-1.5 font-mono text-xs px-3 py-1 ${enabled ? enabledClass : disabledClass}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};
