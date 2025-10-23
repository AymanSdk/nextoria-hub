# Dashboard Chart Components

This directory contains client-side chart components built using [shadcn/ui Charts](https://ui.shadcn.com/docs/components/chart) and Recharts.

## Components

### TaskDistributionChart

A responsive donut chart showing the distribution of tasks by status with a center label displaying total count.

**Features:**

- Donut chart with center total count
- Responsive legend layout
- Interactive tooltips
- Accessibility layer enabled
- Automatic aspect ratio for responsiveness

**Props:**

```typescript
{
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
}
```

**Usage:**

```tsx
<TaskDistributionChart data={taskDistributionData} />
```

### ProjectStatusChart

A responsive bar chart displaying project distribution by status with clean styling.

**Features:**

- Minimal grid design
- Rounded bar tops
- Interactive tooltips with dashed indicator
- Accessibility layer enabled
- Responsive margins and sizing
- Abbreviated labels on small screens

**Props:**

```typescript
{
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
}
```

**Usage:**

```tsx
<ProjectStatusChart data={projectStatusData} />
```

### RevenueTrendChart

A smooth area chart showing revenue trends with currency formatting.

**Features:**

- Natural curve interpolation for smooth lines
- Gradient fill effect
- Currency formatting on Y-axis (compact notation)
- Interactive tooltips with formatted values
- Accessibility layer enabled
- Responsive margins
- Abbreviated month labels

**Props:**

```typescript
{
  data: Array<{
    month: string;
    revenue: number;
  }>;
}
```

**Usage:**

```tsx
<RevenueTrendChart data={revenueChartData} />
```

## Why Client Components?

These components are marked with `"use client"` because:

1. **Recharts is a client-side library** - It requires browser APIs and React hooks
2. **Interactive features** - Charts need client-side interactivity for tooltips and animations
3. **Performance** - Server components can fetch and process data, then pass it to client components for rendering

## Responsive Design

All charts are fully responsive and adapt to different screen sizes:

### Mobile (< 640px)

- Charts use full container width
- Legends wrap to multiple lines
- Abbreviated labels for better readability
- Touch-friendly interactive elements

### Tablet (640px - 1024px)

- Optimized spacing and margins
- Balanced chart proportions
- Clear legends and labels

### Desktop (> 1024px)

- Maximum visual clarity
- Expanded tooltips
- Full-length labels

## Architecture

```
Server Component (page.tsx)
    ├─ Fetches data from database
    ├─ Processes and formats data
    └─ Passes data to Client Components
        ├─ TaskDistributionChart (client)
        ├─ ProjectStatusChart (client)
        └─ RevenueTrendChart (client)
```

This separation provides:

- **Better performance** - Data fetching happens on the server
- **Smaller bundle size** - Only chart rendering code is sent to client
- **Type safety** - Props are strongly typed
- **Reusability** - Charts can be used across different pages

## Customization

### Theme Colors

All charts automatically use theme colors defined in `globals.css`:

- `--chart-1` through `--chart-5` for different data series
- `--primary` for primary elements
- `--muted` for grid lines and secondary elements

### Type Safety

Charts use TypeScript's `satisfies ChartConfig` for compile-time type checking:

```typescript
const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;
```

### Accessibility

All charts include:

- `accessibilityLayer` prop for keyboard navigation
- ARIA labels for screen readers
- High contrast colors for visibility
- Focus indicators on interactive elements

### Responsive Containers

Charts automatically adapt to their container with classes like:

- `w-full` - Full width of parent
- `min-h-[300px]` - Minimum height for readability
- `aspect-square` - Maintains square aspect ratio (pie charts)
- `mx-auto` - Centers the chart horizontally

## Best Practices

### Following shadcn/ui Patterns

These components follow the official [shadcn/ui chart guidelines](https://ui.shadcn.com/docs/components/chart):

1. **Use ChartConfig type** - For type-safe chart configuration
2. **Enable accessibilityLayer** - For keyboard and screen reader support
3. **Use theme variables** - For consistent colors across light/dark modes
4. **Responsive design** - Charts adapt to container size
5. **Proper margins** - Prevents label cutoff

### Performance Tips

- Data is processed on the server before passing to charts
- Charts only re-render when data changes
- Use React.useMemo for expensive calculations
- Keep data arrays reasonably sized (< 100 points for smooth performance)

## Examples

### Custom Donut Chart

```tsx
<TaskDistributionChart
  data={[
    { name: "Completed", value: 50, fill: "hsl(var(--chart-1))" },
    { name: "In Progress", value: 30, fill: "hsl(var(--chart-2))" },
    { name: "To Do", value: 15, fill: "hsl(var(--chart-4))" },
    { name: "Blocked", value: 5, fill: "hsl(var(--chart-3))" },
  ]}
/>
```

### Custom Bar Chart

```tsx
<ProjectStatusChart
  data={[
    { name: "Active", value: 12, fill: "hsl(var(--chart-2))" },
    { name: "Completed", value: 8, fill: "hsl(var(--chart-1))" },
    { name: "On Hold", value: 3, fill: "hsl(var(--chart-4))" },
  ]}
/>
```

### Custom Area Chart

```tsx
<RevenueTrendChart
  data={[
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 18000 },
  ]}
/>
```

## References

- [shadcn/ui Charts Documentation](https://ui.shadcn.com/docs/components/chart)
- [Recharts Documentation](https://recharts.org/)
- [Accessibility Guidelines](https://www.w3.org/WAI/tutorials/images/complex/)
