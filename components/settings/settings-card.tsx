import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  footer,
  className,
}: SettingsCardProps) {
  return (
    <Card className={cn("border-2 hover:border-primary/20 transition-colors", className)}>
      <CardHeader className='pb-4'>
        <div className='flex items-start gap-3'>
          {Icon && (
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5'>
              <Icon className='h-4 w-4 text-primary' />
            </div>
          )}
          <div className='flex-1 space-y-1'>
            <CardTitle className='text-lg'>{title}</CardTitle>
            {description && (
              <CardDescription className='text-sm'>{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>{children}</CardContent>
      {footer && <CardFooter className='border-t pt-6'>{footer}</CardFooter>}
    </Card>
  );
}
