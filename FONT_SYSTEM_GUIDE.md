# Professional Font System Guide

## Overview

Your app now uses a premium, modern font system designed for professional applications. The font stack has been carefully selected to provide excellent readability, a modern aesthetic, and technical precision.

## Font Stack

### Primary Fonts

1. **Inter** - Main sans-serif font

   - Usage: Body text, UI components, general content
   - Weights: 300, 400, 500, 600, 700, 800
   - Why: Industry-standard font used by Vercel, GitHub, and many top tech companies
   - Features: Excellent readability at all sizes, modern geometric design

2. **Outfit** - Display font

   - Usage: Headlines, page titles, important labels
   - Weights: 400, 500, 600, 700, 800
   - Why: Modern geometric sans-serif that commands attention
   - Features: Bold, clean, and contemporary look

3. **JetBrains Mono** - Monospace font
   - Usage: Code blocks, technical data, fixed-width content
   - Weights: 400, 500, 600, 700
   - Why: Designed specifically for developers with ligatures support
   - Features: Enhanced readability for code, beautiful character forms

## Typography Utilities

### Font Family Classes

```tsx
// Display font (Outfit) - for headlines and emphasis
<h1 className="font-display">Nextoria Hub</h1>

// Sans-serif (Inter) - default body font
<p className="font-sans">Regular body text</p>

// Monospace (JetBrains Mono) - for code
<code className="font-mono">const example = true;</code>
```

### Heading Styles

Use these pre-configured heading classes for consistent, professional typography:

```tsx
// Extra Large - Hero sections
<h1 className="heading-xl">Welcome to Nextoria Hub</h1>

// Large - Page titles
<h1 className="heading-lg">Dashboard Overview</h1>

// Medium - Section headings
<h2 className="heading-md">Recent Activity</h2>

// Small - Subsection headings
<h3 className="heading-sm">Team Members</h3>
```

### Body Text Variants

```tsx
// Large body - Introduction paragraphs
<p className="body-lg">
  This is your agency operations platform...
</p>

// Medium body - Standard content (default)
<p className="body-md">
  Regular paragraph text
</p>

// Small body - Secondary information
<p className="body-sm">
  Additional details and footnotes
</p>
```

### Label Styles

Perfect for form labels, badges, and metadata:

```tsx
// Large labels
<label className="label-lg">Full Name</label>

// Medium labels
<span className="label-md">Status</span>

// Small labels - uppercase, compact
<span className="label-sm">New</span>
```

### Code Styles

```tsx
// Inline code
<code className="code-inline">npm install</code>

// Code blocks
<pre className="code-block">
  function example() {
    return "Hello World";
  }
</pre>
```

### Special Utilities

```tsx
// Number displays - perfect for dashboards
<span className="number-display text-4xl">$1,234,567</span>

// Captions - image captions, helper text
<p className="caption">Last updated 5 minutes ago</p>

// Balanced text - for headlines (prevents orphans)
<h1 className="text-balance heading-lg">
  This headline will wrap beautifully
</h1>
```

## Design System Features

### Advanced Typography Features

The font system includes advanced OpenType features for professional polish:

- **Tabular numbers**: Numbers align perfectly in tables and dashboards
- **Contextual alternates**: Improved character combinations
- **Optimized ligatures**: Better character connections (especially in code)
- **Subpixel antialiasing**: Crisp rendering on all displays

### Automatic Enhancements

These are automatically applied to all text:

```css
- Font smoothing (antialiased)
- Optimized ligatures
- Optical sizing
- Optimized text rendering
- Tighter letter-spacing for modern look
```

## Best Practices

### 1. Heading Hierarchy

Always use the display font (Outfit) for headings:

```tsx
// ✅ Good
<h1 className="heading-lg">Page Title</h1>

// ❌ Avoid - missing the professional display font
<h1 className="text-4xl font-bold">Page Title</h1>
```

### 2. Body Text

Use the utility classes for consistent spacing:

```tsx
// ✅ Good
<p className="body-md">Your content here</p>

// ✅ Also good for larger text
<p className="body-lg">Introduction paragraph</p>
```

### 3. Dashboard Numbers

Use the number display class for metrics:

```tsx
// ✅ Perfect for analytics
<div className='number-display text-5xl font-bold'>{revenue.toLocaleString()}</div>
```

### 4. Code and Technical Content

Always use the monospace font for code:

```tsx
// ✅ Good
<code className='font-mono text-sm'>git commit -m "Update fonts"</code>
```

## Responsive Typography

All typography utilities work seamlessly with Tailwind's responsive modifiers:

```tsx
<h1 className="heading-md md:heading-lg lg:heading-xl">
  Responsive Heading
</h1>

<p className="body-sm md:body-md lg:body-lg">
  Scales from mobile to desktop
</p>
```

## Examples in Context

### Hero Section

```tsx
<section className='space-y-4'>
  <h1 className='heading-xl text-balance'>Build Better Agencies</h1>
  <p className='body-lg text-muted-foreground max-w-2xl'>
    Nextoria Hub helps you manage projects, clients, and teams all in one beautiful
    platform.
  </p>
</section>
```

### Dashboard Card

```tsx
<Card>
  <CardHeader>
    <CardTitle className='heading-sm'>Total Revenue</CardTitle>
    <CardDescription className='caption'>Last 30 days</CardDescription>
  </CardHeader>
  <CardContent>
    <div className='number-display text-4xl font-bold'>$45,231.89</div>
    <p className='body-sm text-muted-foreground mt-2'>+20.1% from last month</p>
  </CardContent>
</Card>
```

### Form Example

```tsx
<form className='space-y-4'>
  <div>
    <label className='label-lg block mb-2'>Email Address</label>
    <input type='email' className='font-sans body-md' placeholder='you@example.com' />
    <p className='caption mt-1'>We'll never share your email</p>
  </div>
</form>
```

## Font Loading

Fonts are loaded with optimal settings:

- `display: swap` - Prevents invisible text during load
- Subset: `latin` - Optimized file size
- Multiple weights preloaded
- Automatic font-feature-settings

## Performance

The font system is optimized for performance:

- Google Fonts CDN delivery
- Automatic font subsetting
- Preload hints for critical fonts
- Variable font features where possible
- Efficient caching headers

## Dark Mode

All typography utilities automatically adapt to dark mode with proper contrast ratios.

---

## Quick Reference

| Class            | Font           | Usage             |
| ---------------- | -------------- | ----------------- |
| `heading-xl`     | Outfit         | Hero headlines    |
| `heading-lg`     | Outfit         | Page titles       |
| `heading-md`     | Outfit         | Section headings  |
| `heading-sm`     | Outfit         | Subsections       |
| `body-lg`        | Inter          | Intros            |
| `body-md`        | Inter          | Standard text     |
| `body-sm`        | Inter          | Secondary text    |
| `label-lg/md/sm` | Inter          | Labels & badges   |
| `code-inline`    | JetBrains Mono | Inline code       |
| `code-block`     | JetBrains Mono | Code blocks       |
| `number-display` | Outfit         | Dashboard numbers |
| `caption`        | Inter          | Helper text       |

---

Enjoy your new professional font system! 🎨✨
