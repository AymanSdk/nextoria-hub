# Lightbox Toolbar Design Guide

## Overview
The file preview lightbox features a clean, modern toolbar with glassmorphism effects and smooth animations.

## Visual Design

### Toolbar Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ 🖼️ filename.png  │  [Download] [Open in Drive]          [X]   │
└─────────────────────────────────────────────────────────────────┘
```

### Components

#### 1. **File Info Badge**
- **Background**: Semi-transparent white (5% opacity)
- **Border**: Subtle white border (10% opacity)
- **Icon**: FileImage icon at 70% opacity
- **Text**: White text at 90% opacity
- **Max Width**: 300px with text truncation
- **Purpose**: Shows the current file name for context

#### 2. **Divider**
- **Height**: 2rem (32px)
- **Width**: 1px
- **Color**: White at 20% opacity
- **Margin**: 0.5rem on each side
- **Purpose**: Visual separation between file info and actions

#### 3. **Action Buttons**
Two primary action buttons with consistent styling:

**Download Button:**
- **Icon**: Download icon (4x4)
- **Label**: "Download"
- **Action**: Opens Google Drive download URL

**Open in Drive Button:**
- **Icon**: ExternalLink icon (4x4)
- **Label**: "Open in Drive"
- **Action**: Opens file in Google Drive

**Shared Button Styles:**
- **Padding**: 1rem horizontal, 0.5rem vertical
- **Border**: Semi-transparent white (10% opacity)
- **Background**: Transparent with hover effect
- **Border Radius**: Large (rounded-lg)
- **Backdrop Filter**: Blur effect
- **Hover State**:
  - Background: White at 15% opacity
  - Border: White at 20% opacity
  - Text: Pure white
  - Transform: Subtle lift effect (-1px translateY)
  - Shadow: Medium shadow
- **Active State**:
  - Transform resets
  - Shadow reduces

#### 4. **Close Button**
- **Position**: Right side
- **Shape**: Circular (rounded-full)
- **Icon**: X icon
- **Behavior**: Closes the lightbox

## Color Palette

### Base Colors
```css
Background: rgba(0, 0, 0, 0.40) with backdrop-blur-md
Border: rgba(255, 255, 255, 0.10)
```

### Text Colors
```css
Default: rgba(255, 255, 255, 0.90)
Hover: rgba(255, 255, 255, 1.00)
Icon Muted: rgba(255, 255, 255, 0.70)
```

### Hover States
```css
Button Background: rgba(255, 255, 255, 0.15)
Button Border: rgba(255, 255, 255, 0.20)
Scale: 1.05
```

## Animations

### Transitions
All interactive elements use smooth transitions:
```css
transition-all duration-200
```

### Hover Effects
1. **Background fade-in**: 200ms
2. **Border brightening**: 200ms
3. **Scale up**: 200ms with ease-out
4. **Shadow grow**: 200ms

### Active Effects
1. **Transform reset**: Immediate
2. **Shadow reduction**: 200ms

## Responsive Behavior

### Desktop (≥1024px)
- Full button labels visible
- Maximum file name width: 300px
- Button spacing: 0.75rem between elements

### Tablet (768px - 1023px)
- Full button labels visible
- Maximum file name width: 250px
- Button spacing: 0.5rem between elements

### Mobile (<768px)
- Icon-only buttons (labels hidden)
- Maximum file name width: 150px
- Compact button spacing: 0.25rem

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate between buttons
- **Enter/Space**: Activate button
- **Escape**: Close lightbox

### ARIA Labels
All buttons include:
- `title` attribute for tooltips
- Semantic HTML (`<button>` elements)
- Clear action labels

### Color Contrast
- Text meets WCAG AA standards on dark background
- Hover states provide visual feedback
- Focus indicators visible on keyboard navigation

## Implementation Details

### Custom CSS (globals.css)
```css
/* Toolbar base styling */
.yarl__toolbar {
  @apply backdrop-blur-md bg-black/40 border-b border-white/10;
  padding: 12px 20px !important;
}

/* Button hover effects */
.yarl__toolbar button[title]:hover {
  @apply shadow-md;
  transform: translateY(-1px);
}

/* Button active state */
.yarl__toolbar button[title]:active {
  transform: translateY(0);
  @apply shadow-sm;
}
```

### React Component
```tsx
<Lightbox
  toolbar={{
    buttons: [
      // File info badge
      <div className='flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10'>
        <FileImage className='h-4 w-4 text-white/70' />
        <span className='text-sm text-white/90 font-medium max-w-xs truncate'>
          {fileName}
        </span>
      </div>,
      
      // Divider
      <div className='h-8 w-px bg-white/20 mx-2' />,
      
      // Action buttons
      <button className='flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all duration-200 border border-white/10 hover:border-white/20 backdrop-blur-sm'>
        <Icon />
        <span>Label</span>
      </button>,
      
      // Close button
      "close"
    ]
  }}
/>
```

## Design Principles

### 1. **Glassmorphism**
Semi-transparent backgrounds with blur effects create depth and modern aesthetics.

### 2. **Subtle Borders**
Low-opacity borders provide definition without being distracting.

### 3. **Smooth Animations**
200ms transitions feel responsive without being jarring.

### 4. **Visual Hierarchy**
- File name is muted (informational)
- Action buttons are prominent (interactive)
- Close button is standard (utility)

### 5. **Consistent Spacing**
Predictable gaps between elements improve scannability.

## Browser Support
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Performance Optimizations
- CSS transitions use GPU-accelerated properties (transform, opacity)
- Backdrop-filter uses will-change for smoother effects
- Event handlers use stopPropagation to prevent bubbling
- Buttons render only when lightbox is open

## Future Enhancements
- [ ] Add file size display in toolbar
- [ ] Add zoom percentage indicator
- [ ] Add image dimensions display
- [ ] Add share button
- [ ] Add favorite/star button
- [ ] Add rotation controls
- [ ] Add slideshow controls

## Related Files
- `/components/files/file-preview-dialog.tsx` - Component implementation
- `/app/globals.css` - Custom lightbox styles
- `/docs/FILE_PREVIEW_IMPROVEMENTS.md` - Overall preview system docs

