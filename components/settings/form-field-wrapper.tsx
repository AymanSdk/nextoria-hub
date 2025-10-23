import * as React from "react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormFieldWrapperProps {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldWrapper({
  label,
  htmlFor,
  description,
  error,
  success,
  required,
  children,
  className,
}: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className='text-sm font-medium flex items-center gap-1.5'>
        {label}
        {required && <span className='text-destructive'>*</span>}
      </Label>
      {description && !error && !success && (
        <p className='text-xs text-muted-foreground'>{description}</p>
      )}
      {children}
      {error && (
        <Alert variant='destructive' className='py-2'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription className='text-xs'>{error}</AlertDescription>
        </Alert>
      )}
      {success && !error && (
        <div className='flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400'>
          <CheckCircle2 className='h-3.5 w-3.5' />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
