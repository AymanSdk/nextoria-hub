# Charts Usage Guide

## Overview

This guide explains how to use the Recharts library with the custom chart components in your Next.js application.

## Chart Components

### 1. ChartContainer

The main wrapper for all charts that provides theme integration.

```tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

// Define your chart configuration
const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
};

// Prepare your data
const data = [
  { month: "Jan", revenue: 1000, expenses: 500 },
  { month: "Feb", revenue: 1500, expenses: 700 },
];

// Render the chart
<ChartContainer config={chartConfig} className='h-[300px]'>
  <BarChart data={data}>
    <XAxis dataKey='month' />
    <YAxis />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey='revenue' fill='hsl(var(--chart-1))' />
  </BarChart>
</ChartContainer>;
```

## Available Chart Types

### Pie Chart

Perfect for showing distribution and percentages.

```tsx
<ChartContainer config={chartConfig} className='h-[300px]'>
  <PieChart>
    <Pie
      data={pieData}
      cx='50%'
      cy='50%'
      labelLine={false}
      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
      outerRadius={80}
      dataKey='value'
    >
      {pieData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.fill} />
      ))}
    </Pie>
    <ChartTooltip content={<ChartTooltipContent />} />
  </PieChart>
</ChartContainer>
```

### Bar Chart

Great for comparing values across categories.

```tsx
<ChartContainer config={chartConfig} className='h-[300px]'>
  <BarChart data={barData}>
    <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
    <XAxis dataKey='name' className='text-xs' />
    <YAxis className='text-xs' />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey='value' fill='hsl(var(--primary))' radius={[8, 8, 0, 0]} />
  </BarChart>
</ChartContainer>
```

### Area Chart

Ideal for showing trends over time.

```tsx
<ChartContainer config={chartConfig} className='h-[300px]'>
  <AreaChart data={areaData}>
    <defs>
      <linearGradient id='colorValue' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='5%' stopColor='hsl(var(--primary))' stopOpacity={0.8} />
        <stop offset='95%' stopColor='hsl(var(--primary))' stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
    <XAxis dataKey='month' className='text-xs' />
    <YAxis className='text-xs' />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Area
      type='monotone'
      dataKey='value'
      stroke='hsl(var(--primary))'
      fillOpacity={1}
      fill='url(#colorValue)'
    />
  </AreaChart>
</ChartContainer>
```

### Line Chart

Best for showing changes over continuous data.

```tsx
import { LineChart, Line } from "recharts";

<ChartContainer config={chartConfig} className='h-[300px]'>
  <LineChart data={lineData}>
    <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
    <XAxis dataKey='name' />
    <YAxis />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Line type='monotone' dataKey='value' stroke='hsl(var(--chart-1))' strokeWidth={2} />
  </LineChart>
</ChartContainer>;
```

## Theme Colors

Use these CSS variables for consistent coloring:

```tsx
// Chart colors
fill = "hsl(var(--chart-1))"; // Primary chart color (Pink/Magenta)
fill = "hsl(var(--chart-2))"; // Secondary chart color (Pink)
fill = "hsl(var(--chart-3))"; // Tertiary (Red/Orange)
fill = "hsl(var(--chart-4))"; // Quaternary (Blue)
fill = "hsl(var(--chart-5))"; // Quinary (Green)

// UI colors
fill = "hsl(var(--primary))"; // Primary brand color
fill = "hsl(var(--secondary))"; // Secondary color
fill = "hsl(var(--muted))"; // Muted/disabled
fill = "hsl(var(--destructive))"; // Error/warning
```

## Data Preparation

### For Pie Charts

```tsx
const pieData = [
  { name: "Category A", value: 400, fill: "hsl(var(--chart-1))" },
  { name: "Category B", value: 300, fill: "hsl(var(--chart-2))" },
  { name: "Category C", value: 200, fill: "hsl(var(--chart-3))" },
];
```

### For Bar/Line/Area Charts

```tsx
const chartData = [
  { month: "Jan", revenue: 1000, expenses: 500 },
  { month: "Feb", revenue: 1500, expenses: 700 },
  { month: "Mar", revenue: 1200, expenses: 600 },
];
```

## Responsive Charts

All charts automatically resize within their container. Control size with className:

```tsx
// Fixed height
<ChartContainer className="h-[300px]">

// Responsive height
<ChartContainer className="h-full min-h-[200px] max-h-[400px]">

// Aspect ratio
<ChartContainer className="aspect-video">
```

## Custom Tooltips

The `ChartTooltipContent` component automatically formats values and labels. Customize it:

```tsx
<ChartTooltip
  content={<ChartTooltipContent />}
  cursor={false}
  // ... other props
/>
```

## Best Practices

1. **Keep data simple**: Transform complex data before passing to charts
2. **Use theme colors**: Always use CSS variables for colors
3. **Set appropriate heights**: Charts need explicit height to render
4. **Handle empty data**: Show fallback UI when data is empty
5. **Optimize performance**: Limit data points for better performance
6. **Add labels**: Use descriptive labels for better UX
7. **Test responsiveness**: Ensure charts work on all screen sizes

## Common Patterns

### Multiple Data Series

```tsx
<BarChart data={data}>
  <Bar dataKey='revenue' fill='hsl(var(--chart-1))' />
  <Bar dataKey='expenses' fill='hsl(var(--chart-2))' />
</BarChart>
```

### Stacked Charts

```tsx
<BarChart data={data}>
  <Bar dataKey='value1' stackId='a' fill='hsl(var(--chart-1))' />
  <Bar dataKey='value2' stackId='a' fill='hsl(var(--chart-2))' />
</BarChart>
```

### Custom Labels

```tsx
<Pie
  label={({ name, value }) => `${name}: $${value}`}
  // ... other props
/>
```

## Troubleshooting

### Chart not rendering

- Check if container has explicit height
- Verify data is properly formatted
- Ensure recharts is installed

### Colors not showing

- Use `hsl(var(--chart-X))` format
- Check if theme CSS variables are defined
- Verify data includes `fill` property for Pie charts

### Tooltip not working

- Import and use `ChartTooltip` and `ChartTooltipContent`
- Ensure they're children of the chart component

---

**For more examples**, check `/app/(dashboard)/page.tsx`
