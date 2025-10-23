import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
          <Icon className='h-5 w-5 text-primary' />
        </div>
        <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
      </div>
      {description && (
        <p className='text-muted-foreground text-sm md:text-base'>{description}</p>
      )}
    </div>
  );
}
