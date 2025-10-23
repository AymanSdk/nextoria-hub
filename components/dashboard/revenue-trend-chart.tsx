"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface RevenueTrendChartProps {
  data: Array<{
    month: string;
    revenue: number;
  }>;
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(142 76% 36%)", // Green for money/revenue
    },
  } satisfies ChartConfig;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  };

  return (
    <ChartContainer config={chartConfig} className='min-h-[300px] w-full'>
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          top: 12,
          right: 12,
          left: 12,
          bottom: 12,
        }}
      >
        <defs>
          <linearGradient id='fillRevenue' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='var(--color-revenue)' stopOpacity={0.8} />
            <stop offset='95%' stopColor='var(--color-revenue)' stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey='month'
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatCurrency}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator='dot'
              formatter={(value) => (
                <div className='flex items-baseline gap-2'>
                  <span className='font-mono font-medium'>
                    {formatCurrency(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey='revenue'
          type='natural'
          fill='url(#fillRevenue)'
          fillOpacity={0.4}
          stroke='var(--color-revenue)'
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
