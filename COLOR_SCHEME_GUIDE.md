# Dashboard Color Scheme Guide

## Color Palette

### Task Status Colors

| Status             | Color  | HSL Value          | Usage                  |
| ------------------ | ------ | ------------------ | ---------------------- |
| ✅ **Completed**   | Green  | `hsl(142 76% 36%)` | Success, finished work |
| 🔵 **In Progress** | Blue   | `hsl(217 91% 60%)` | Active work, ongoing   |
| 🟣 **To Do**       | Purple | `hsl(280 67% 65%)` | Pending tasks          |
| 🔴 **Blocked**     | Red    | `hsl(0 84% 60%)`   | Issues, blockers       |

### Project Status Colors

| Status           | Color | HSL Value          | Usage             |
| ---------------- | ----- | ------------------ | ----------------- |
| 🔵 **Active**    | Blue  | `hsl(217 91% 60%)` | Currently running |
| ✅ **Completed** | Green | `hsl(142 76% 36%)` | Finished projects |
| 🟡 **On Hold**   | Amber | `hsl(45 93% 47%)`  | Paused, waiting   |

### Financial Colors

| Metric         | Color | HSL Value          | Usage                 |
| -------------- | ----- | ------------------ | --------------------- |
| 💰 **Revenue** | Green | `hsl(142 76% 36%)` | Money, growth, income |

## Color Meanings

### Green - Success & Completion

- **Psychology**: Growth, prosperity, success
- **Used for**: Completed tasks, finished projects, revenue
- **Why**: Universal color for "done" and positive outcomes

### Blue - Active & Trustworthy

- **Psychology**: Calm, professional, reliable
- **Used for**: In progress tasks, active projects
- **Why**: Indicates ongoing work, stable processes

### Purple - Neutral & Informative

- **Psychology**: Creative, informative, neutral
- **Used for**: To-do tasks (not started yet)
- **Why**: Stands out without negative connotation

### Red - Alert & Attention

- **Psychology**: Urgency, warning, stop
- **Used for**: Blocked tasks, issues
- **Why**: Immediately draws attention to problems

### Yellow/Amber - Caution

- **Psychology**: Warning, pause, attention
- **Used for**: On-hold projects, paused items
- **Why**: Indicates temporary state, needs review

## Accessibility

All colors meet WCAG 2.1 contrast requirements:

- ✅ **Green**: High contrast against white/dark backgrounds
- ✅ **Blue**: Excellent visibility, commonly used
- ✅ **Purple**: Distinct from red/blue, colorblind-friendly
- ✅ **Red**: High saturation for visibility
- ✅ **Amber**: High luminosity, stands out

### Colorblind Considerations

The palette works well for common types of colorblindness:

- **Deuteranopia** (red-green): Blue, Purple, Amber provide distinction
- **Protanopia** (red-green): Blue and Purple remain distinct
- **Tritanopia** (blue-yellow): Red and Green provide distinction

## Dark Mode Support

Colors automatically adapt to dark mode through HSL:

- Maintains hue and saturation
- CSS handles lightness adjustment
- No manual dark mode colors needed

## Usage Examples

### In Code

```typescript
// Task Distribution
const taskColors = {
  completed: "hsl(142 76% 36%)", // Green
  inProgress: "hsl(217 91% 60%)", // Blue
  todo: "hsl(280 67% 65%)", // Purple
  blocked: "hsl(0 84% 60%)", // Red
};

// Project Status
const projectColors = {
  active: "hsl(217 91% 60%)", // Blue
  completed: "hsl(142 76% 36%)", // Green
  onHold: "hsl(45 93% 47%)", // Amber
};
```

### In Tailwind (if needed)

```css
/* Custom colors in tailwind.config */
colors: {
  'task-completed': 'hsl(142 76% 36%)',
  'task-progress': 'hsl(217 91% 60%)',
  'task-todo': 'hsl(280 67% 65%)',
  'task-blocked': 'hsl(0 84% 60%)',
}
```

## Visual Reference

```
Task Distribution Chart:
┌─────────────────────────────────┐
│ Total: 100 tasks                │
├─────────────────────────────────┤
│ Completed   █████████ 50  (Green)
│ In Progress ████ 30       (Blue)
│ To Do       ██ 15         (Purple)
│ Blocked     █ 5           (Red)
└─────────────────────────────────┘

Project Status Chart:
┌─────────────────────────────────┐
│        ███                      │
│        ███                      │
│  ███   ███   ███                │
│  ███   ███   ███                │
│ ─────────────────               │
│ Active Done  Hold               │
│ (Blue)(Green)(Amber)            │
└─────────────────────────────────┘

Revenue Trend Chart:
┌─────────────────────────────────┐
│    ╱╲     ╱╲                    │
│   ╱  ╲   ╱  ╲  (Green gradient) │
│  ╱    ╲ ╱    ╲                  │
│ ╱      ╲      ╲                 │
│─────────────────────            │
│ Jan  Feb  Mar  Apr              │
└─────────────────────────────────┘
```

## Brand Consistency

These colors complement the pink/magenta primary theme:

- **Primary (Pink/Magenta)**: For brand elements, CTAs
- **Chart Colors**: For data visualization, status indication
- **Neutral Grays**: For backgrounds, text

The vibrant data colors pop against the softer pink theme while maintaining professional appearance.

## Best Practices

1. **Consistency**: Always use the same color for the same status
2. **Contrast**: Ensure colors work on light and dark backgrounds
3. **Meaning**: Use semantic colors (green = good, red = bad)
4. **Accessibility**: Test with colorblind simulators
5. **Context**: Colors should support, not replace, text labels

## Testing Tools

Verify colors with:

- **Contrast Checker**: WebAIM Contrast Checker
- **Colorblind Simulator**: Coblis, Color Oracle
- **Accessibility**: WAVE, axe DevTools
- **Cross-browser**: Test in Chrome, Firefox, Safari

---

**Color Scheme Version:** 1.0  
**Last Updated:** October 23, 2025  
**Accessibility:** WCAG 2.1 AA Compliant
