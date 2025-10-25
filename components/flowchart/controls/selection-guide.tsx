"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Box, MousePointer2 } from "lucide-react";

export function SelectionGuide() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has seen the guide
    const hasSeenGuide = localStorage.getItem("flowchart-selection-guide-seen");
    if (!hasSeenGuide) {
      // Show guide after 2 seconds
      const timer = setTimeout(() => {
        setShow(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("flowchart-selection-guide-seen", "true");
  };

  if (!show || dismissed) return null;

  return (
    <Card className='absolute top-24 left-1/2 -translate-x-1/2 z-50 w-[400px] shadow-2xl border-2 border-primary/50 animate-in fade-in slide-in-from-top-4'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <Box className='h-5 w-5 text-primary' />
            </div>
            <h3 className='font-semibold text-sm'>Box Selection Enabled!</h3>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 -mt-1'
            onClick={handleDismiss}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='space-y-3 text-sm'>
          <div className='flex items-start gap-3'>
            <div className='p-1.5 bg-blue-100 dark:bg-blue-950 rounded'>
              <MousePointer2 className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <p className='font-medium'>How to use:</p>
              <ol className='text-xs text-muted-foreground mt-1 space-y-1 list-decimal list-inside'>
                <li>
                  Press{" "}
                  <kbd className='px-1.5 py-0.5 bg-muted rounded text-[10px]'>V</kbd> for
                  Selection Mode
                </li>
                <li>
                  Click and <strong>drag on empty canvas</strong>
                </li>
                <li>Blue box appears - all items inside are selected</li>
                <li>Use align tools, delete, or copy selected items</li>
              </ol>
            </div>
          </div>

          <div className='text-xs text-muted-foreground bg-muted/50 p-2 rounded'>
            💡 <strong>Tip:</strong> Hold{" "}
            <kbd className='px-1.5 py-0.5 bg-background border rounded'>Ctrl</kbd> + click
            to add/remove individual items from selection
          </div>
        </div>

        <Button onClick={handleDismiss} className='w-full mt-3' size='sm'>
          Got it!
        </Button>
      </CardContent>
    </Card>
  );
}
