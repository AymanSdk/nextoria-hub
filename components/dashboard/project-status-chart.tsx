"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ProjectStatusChartProps {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
}

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  const chartConfig = {
    value: {
      label: "Projects",
      color: "hsl(var(--primary))",
    },
    active: {
      label: "Active",
      color: "hsl(217 91% 60%)", // Blue
    },
    completed: {
      label: "Completed",
      color: "hsl(142 76% 36%)", // Green
    },
    onHold: {
      label: "On Hold",
      color: "hsl(45 93% 47%)", // Amber/Yellow
    },
  } satisfies ChartConfig;

  // Map data with new colors
  const coloredData = data.map((item) => {
    let color = "";
    const name = item.name.toLowerCase().replace(/\s+/g, "");

    if (name === "active") color = chartConfig.active.color;
    else if (name === "completed") color = chartConfig.completed.color;
    else if (name === "onhold") color = chartConfig.onHold.color;
    else color = item.fill;

    return { ...item, fill: color };
  });

  return (
    <ChartContainer config={chartConfig} className='min-h-[300px] w-full'>
      <BarChart
        accessibilityLayer
        data={coloredData}
        margin={{
          top: 20,
          right: 12,
          left: 12,
          bottom: 12,
        }}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray='3 3'
          className='stroke-muted/30'
        />
        <XAxis dataKey='name' tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.toString()}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted)/0.1)" }}
          content={<ChartTooltipContent indicator='dot' />}
        />
        <Bar dataKey='value' radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
