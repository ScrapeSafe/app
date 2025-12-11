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
      className: enabled ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted text-muted-foreground',
    },
    train: {
      label: 'Train',
      icon: Brain,
      className: enabled ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-muted text-muted-foreground',
    },
  };

  const { label, icon: Icon, className } = config[type];

  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};
