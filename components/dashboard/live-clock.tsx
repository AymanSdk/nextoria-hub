"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className='flex items-center gap-4 px-6 py-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-border/50 shadow-sm'>
      <div className='flex items-center gap-3'>
        <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ring-4 ring-primary/5'>
          <Clock className='h-6 w-6 text-primary' />
        </div>
        <div className='flex flex-col'>
          <div className='text-2xl font-bold tabular-nums tracking-tight'>
            {formatTime(time)}
          </div>
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5'>
            <Calendar className='h-3 w-3' />
            <span className='font-medium'>{formatDate(time)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
