# Responsive Design Standards

This document outlines the unified responsive design system used throughout the Nextoria Hub application.

## 📐 Layout System

### Layout Hierarchy

The application uses a hierarchical layout system where responsive constraints are applied at different levels:

1. **Root Layout** (`app/layout.tsx`) - Global styles
2. **Dashboard Layout** (`app/(dashboard)/layout.tsx`) - Dashboard-wide container
3. **Nested Layouts** - Section-specific layouts (e.g., Settings)
4. **Page Level** - Individual page constraints

## 🎯 Max-Width Standards

We use a **content-type-based** approach to max-width, ensuring optimal readability and usability for different page types:

### Dashboard Layout (Global)

- **Max Width**: `1600px` (`max-w-[1600px]`)
- **Applies to**: All dashboard pages by default
- **Responsive Padding**: `p-4 md:p-6 lg:p-8`
- **Use Case**: Data-heavy pages, lists, tables, dashboards

```tsx
// app/(dashboard)/layout.tsx
<div className='w-full mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8'>{children}</div>
```

### Page-Level Overrides

When pages need specific max-widths for better UX, use these standards:

#### 📄 Documentation & Settings

- **Max Width**: `1280px` (`max-w-7xl`)
- **Use Case**: Long-form content, documentation, settings with sidebars
- **Example Pages**:
  - `/docs`
  - `/settings/*` (via settings layout)

```tsx
<div className='max-w-7xl mx-auto'>{/* Documentation content */}</div>
```

#### 👥 Team & List Management

- **Max Width**: `1152px` (`max-w-6xl`)
- **Use Case**: Team management, notification lists
- **Example Pages**:
  - `/team`
  - `/notifications`

```tsx
<div className='max-w-6xl mx-auto space-y-6'>{/* Team/list content */}</div>
```

#### 🔍 Detail & View Pages

- **Max Width**: `1024px` (`max-w-5xl`)
- **Use Case**: Single item detail views, project requests
- **Example Pages**:
  - `/project-requests/[id]`

```tsx
<div className='max-w-5xl mx-auto space-y-6'>{/* Detail view content */}</div>
```

#### 📝 Forms & Create Pages

- **Max Width**: `896px` (`max-w-4xl`)
- **Use Case**: Create/edit forms
- **Example Pages**:
  - `/projects/new`
  - `/project-requests/new`

```tsx
<div className='max-w-4xl mx-auto'>{/* Form content */}</div>
```

#### 💬 Full-Bleed Pages

- **Max Width**: None (full width)
- **Use Case**: Chat, collaborative tools
- **Example Pages**: `/chat`
- **Note**: Uses negative margins to override layout padding

```tsx
<div className='hidden md:flex gap-0 h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8'>
  {/* Full-bleed chat interface */}
</div>
```

## 📱 Responsive Padding System

### Layout-Level Padding

Applied at the dashboard layout level:

- **Mobile**: `p-4` (16px)
- **Tablet** (md): `p-6` (24px)
- **Desktop** (lg): `p-8` (32px)

### When to Override Padding

Only override layout padding for:

1. **Full-bleed interfaces** (chat, canvas)
2. **Custom spacing requirements** (settings with sidebars)

## 🎨 Implementation Guidelines

### ✅ DO

```tsx
// Use consistent max-width based on content type
export default function FormPage() {
  return (
    <div className='max-w-4xl mx-auto'>
      {/* Form content inherits padding from layout */}
    </div>
  );
}
```

```tsx
// Use semantic spacing utilities
<div className='space-y-6'>
  <Card />
  <Card />
</div>
```

### ❌ DON'T

```tsx
// Don't use arbitrary max-widths
<div className='max-w-[973px]'> {/* ❌ */}

// Don't add conflicting padding
<div className='max-w-5xl mx-auto p-8'> {/* ❌ Layout already has padding */}

// Don't use full width for forms
<div className='w-full max-w-full'> {/* ❌ Too wide for forms */}
```

## 🏗️ Architecture Overview

```
Root Layout
  └── Dashboard Layout (max-w-[1600px] + responsive padding)
      ├── Settings Layout (max-w-7xl)
      │   └── Settings Pages (inherit from settings layout)
      ├── Form Pages (max-w-4xl override)
      ├── Detail Pages (max-w-5xl override)
      ├── List Pages (max-w-6xl override)
      ├── Docs (max-w-7xl override)
      └── Other Pages (inherit 1600px from layout)
```

## 📊 Quick Reference Table

| Page Type          | Max Width   | Tailwind Class   | Pixels | Example                    |
| ------------------ | ----------- | ---------------- | ------ | -------------------------- |
| Dashboard/Lists    | Default     | `max-w-[1600px]` | 1600px | `/`, `/projects`, `/tasks` |
| Documentation      | Extra Large | `max-w-7xl`      | 1280px | `/docs`, `/settings/*`     |
| Team/Notifications | Large       | `max-w-6xl`      | 1152px | `/team`, `/notifications`  |
| Detail Views       | Medium      | `max-w-5xl`      | 1024px | `/project-requests/[id]`   |
| Forms              | Small       | `max-w-4xl`      | 896px  | `/projects/new`            |
| Chat               | Full Bleed  | None             | 100%   | `/chat`                    |

## 🔄 Consistency Checklist

When creating a new page:

- [ ] Identify the content type (form, list, detail, etc.)
- [ ] Apply appropriate max-width from standards above
- [ ] Use `mx-auto` for horizontal centering
- [ ] Let layout handle padding (don't override unless necessary)
- [ ] Test on mobile, tablet, and wide desktop screens
- [ ] Ensure content is readable at all breakpoints

## 🛠️ Breakpoints

Tailwind CSS default breakpoints used:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 📝 Notes

1. **Settings has nested layout**: The settings section has its own layout (`app/(dashboard)/settings/layout.tsx`) with `max-w-7xl`, which overrides the dashboard layout for all settings pages.

2. **Chat is intentionally full-bleed**: The chat page uses negative margins to break out of the layout padding for an immersive experience.

3. **Consistent centering**: Always use `mx-auto` with max-width classes to center content.

4. **Mobile-first approach**: Start with smallest padding/constraints and scale up with breakpoints.

## 🎯 Future Considerations

- Consider adding container queries for component-level responsiveness
- Monitor user feedback on reading comfort at different widths
- Review analytics for common viewport sizes
- Consider adding `max-w-8xl` (1408px) tier if needed between 7xl and 1600px

---

**Last Updated**: October 24, 2025  
**Maintained By**: Development Team
