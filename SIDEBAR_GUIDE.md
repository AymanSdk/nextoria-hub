# Sidebar Implementation Guide

## Overview

The Nextoria Hub now features a professional, fully-featured sidebar built using shadcn/ui's Sidebar component. This implementation provides a modern, responsive navigation experience with advanced features.

## Features

### ✨ Core Features

1. **Collapsible Sidebar**

   - Desktop: Collapses to icon-only mode
   - Mobile: Slides out as a sheet/drawer
   - Persistent state saved in cookies

2. **Keyboard Shortcuts**

   - `Cmd/Ctrl + B`: Toggle sidebar
   - Works on both desktop and mobile

3. **Smart Navigation**

   - Active state highlighting
   - Tooltips when collapsed
   - Role-based menu filtering
   - Organized into logical groups

4. **Responsive Design**

   - Desktop: Fixed sidebar with collapse
   - Tablet/Mobile: Sheet overlay
   - Adaptive header with breadcrumbs

5. **User Profile Integration**
   - Avatar with fallback initials
   - Quick access dropdown menu
   - Profile, settings, and sign out options

## Architecture

### File Structure

```
components/
├── ui/
│   └── sidebar.tsx          # shadcn sidebar components
└── layout/
    ├── app-sidebar.tsx      # Main sidebar implementation
    └── app-header.tsx       # Header with sidebar trigger

app/
└── (dashboard)/
    ├── layout.tsx           # Main dashboard layout
    └── clients/client/
        └── layout.tsx       # Client-specific layout
```

### Component Hierarchy

```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <AppHeader />
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

## Usage

### Basic Layout Setup

```tsx
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### Adding Navigation Items

Edit `components/layout/app-sidebar.tsx`:

```tsx
// Main navigation items (always visible)
const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  // Add more items...
];

// Role-restricted items
const workspaceItems: NavItem[] = [
  {
    title: "Team",
    href: "/team",
    icon: Users,
    roles: ["ADMIN"], // Only visible to admins
  },
  // Add more items...
];
```

### Navigation Item Interface

```tsx
interface NavItem {
  title: string; // Display name
  href: string; // Route path
  icon: LucideIcon; // Icon component
  badge?: number; // Optional badge count
  roles?: string[]; // Optional role restriction
}
```

## Customization

### Changing Sidebar Variant

```tsx
<Sidebar collapsible="icon">      // Default: collapses to icons
<Sidebar collapsible="offcanvas"> // Slides completely off-screen
<Sidebar collapsible="none">      // Never collapses
```

### Styling

The sidebar uses CSS variables for theming:

```css
--sidebar-width: 16rem;
--sidebar-width-icon: 3rem;
--sidebar-width-mobile: 18rem;
```

## Navigation Groups

The sidebar is organized into logical groups:

1. **Main Navigation**

   - Dashboard
   - Projects
   - Tasks

2. **Workspace**

   - Campaigns (Admin/Marketer)
   - Content Calendar (Admin/Marketer/Designer)
   - Clients (Admin/Developer/Designer/Marketer)
   - Team (Admin only)
   - Client Portal (Client only)

3. **Tools**

   - Chat
   - Files
   - Analytics (Admin/Marketer)

4. **Finance**

   - Invoices
   - Expenses

5. **Settings**
   - Notifications
   - Settings

## Header Features

### Breadcrumb Navigation

The header automatically generates breadcrumbs from the current path:

```
/ → Dashboard
/projects → Dashboard / Projects
/projects/123 → Dashboard / Projects / 123
```

### Sidebar Trigger

Click the hamburger icon or use `Cmd/Ctrl + B` to toggle the sidebar.

### Search Bar

- Desktop: Full-width search input
- Mobile: Hidden to save space

## Role-Based Access

Navigation items can be restricted by user role:

```tsx
{
  title: "Team",
  href: "/team",
  icon: Users,
  roles: ["ADMIN"], // Only admins see this
}
```

Supported roles:

- `ADMIN`
- `DEVELOPER`
- `DESIGNER`
- `MARKETER`
- `CLIENT`

## Mobile Behavior

### Desktop (≥768px)

- Sidebar is fixed
- Collapses to icons when toggled
- State persists in cookies

### Mobile (<768px)

- Sidebar appears as a sheet/drawer
- Triggered by hamburger menu
- Slides in from the left
- Overlay backdrop

## State Management

### Persistent State

The sidebar state is saved in a cookie:

- Cookie name: `sidebar_state`
- Max age: 7 days
- Automatically persists user preference

### Context API

The `SidebarProvider` manages state through React Context:

```tsx
const {
  state, // "expanded" | "collapsed"
  open, // boolean
  setOpen, // (open: boolean) => void
  isMobile, // boolean
  toggleSidebar, // () => void
} = useSidebar();
```

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Semantic HTML

## Performance

- Server components where possible
- Client components only for interactivity
- Memoized callbacks
- Optimized re-renders
- Cookie-based persistence (no API calls)

## Best Practices

### ✅ Do

- Keep navigation groups logical
- Use descriptive icon names
- Implement role-based access
- Test on mobile devices
- Use tooltips for icon-only state

### ❌ Don't

- Add too many top-level items
- Forget mobile testing
- Skip accessibility attributes
- Hardcode user data
- Nest items too deeply

## Troubleshooting

### Sidebar not collapsing

- Ensure `SidebarProvider` wraps the layout
- Check `collapsible` prop is set correctly

### Active state not working

- Verify `href` matches the route path
- Check pathname logic in `isActive`

### Role filtering not working

- Confirm session includes user role
- Verify role names match exactly

### Mobile sidebar not showing

- Check breakpoint (768px)
- Ensure `useIsMobile` hook is working
- Verify Sheet component is imported

## Migration from Old Sidebar

The old implementation has been replaced with:

1. **SidebarProvider** instead of simple div wrapper
2. **SidebarInset** instead of flex-1 div
3. **Shadcn components** instead of custom styling
4. **Role-based filtering** built-in
5. **Mobile-first** responsive design

No breaking changes to route structure or navigation items definition.

## Future Enhancements

Potential improvements:

- [ ] Sub-menu support
- [ ] Drag-to-resize sidebar
- [ ] Custom width preferences
- [ ] Pinned items
- [ ] Recent items section
- [ ] Keyboard navigation shortcuts
- [ ] Sidebar search/filter

## Support

For issues or questions:

1. Check this guide
2. Review shadcn/ui sidebar docs
3. Inspect browser console for errors
4. Verify all dependencies are installed

## Resources

- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar)
- [Next.js Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
