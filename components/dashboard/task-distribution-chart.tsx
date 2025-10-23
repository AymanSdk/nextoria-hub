"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TaskDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
}

export function TaskDistributionChart({ data }: TaskDistributionChartProps) {
  const chartConfig = {
    completed: {
      label: "Completed",
      color: "hsl(142 76% 36%)", // Green
    },
    inProgress: {
      label: "In Progress",
      color: "hsl(217 91% 60%)", // Blue
    },
    todo: {
      label: "To Do",
      color: "hsl(280 67% 65%)", // Purple
    },
    blocked: {
      label: "Blocked",
      color: "hsl(0 84% 60%)", // Red
    },
  } satisfies ChartConfig;

  // Map data with new colors
  const coloredData = data.map((item) => {
    let color = "";
    const name = item.name.toLowerCase().replace(/\s+/g, "");

    if (name === "completed") color = chartConfig.completed.color;
    else if (name === "inprogress") color = chartConfig.inProgress.color;
    else if (name === "todo") color = chartConfig.todo.color;
    else if (name === "blocked") color = chartConfig.blocked.color;
    else color = item.fill;

    return { ...item, fill: color };
  });

  const totalTasks = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Total: {totalTasks.toLocaleString()} tasks
        </p>
      </div>
      <ChartContainer config={chartConfig} className='min-h-[250px] w-full'>
        <BarChart
          accessibilityLayer
          data={coloredData}
          layout='vertical'
          margin={{
            left: 0,
            right: 12,
            top: 12,
            bottom: 12,
          }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey='name'
            type='category'
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            width={90}
          />
          <XAxis type='number' hide />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator='line' />}
          />
          <Bar dataKey='value' layout='vertical' radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
