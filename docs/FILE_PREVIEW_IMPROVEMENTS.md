# File Preview Improvements

## Overview

The file preview system has been upgraded to provide a superior user experience with proper dynamic sizing and no unnecessary scrolling.

## Technology Stack

### Yet Another React Lightbox

We use **yet-another-react-lightbox** (v3.25.0) for images and videos:

- ✅ **Automatic dynamic sizing** - Content fits perfectly without scrolling
- ✅ **Zoom support** - Click to zoom in/out
- ✅ **Touch gestures** - Pinch to zoom on mobile
- ✅ **Keyboard navigation** - ESC to close, arrow keys for navigation
- ✅ **Modern UI** - Beautiful overlay with dark background
- ✅ **Performance** - Optimized for large images and videos

### Custom Dialog

For PDFs and Google Docs, we continue to use a custom dialog with iframe embedding.

## Implementation

### 1. Installation

```bash
bun add yet-another-react-lightbox
```

### 2. Usage

**Images & Videos:**

```tsx
<Lightbox
  open={open}
  close={() => onOpenChange(false)}
  slides={[{ src: imageUrl, alt: fileName }]}
  toolbar={{
    buttons: ["download", "open in drive", "close"],
  }}
/>
```

**PDFs & Google Docs:**

```tsx
<Dialog>
  <iframe src={documentUrl} />
</Dialog>
```

## Features

### Images

- ✅ Automatic sizing to fit viewport
- ✅ No vertical/horizontal scrolling needed
- ✅ Click to zoom
- ✅ Drag to pan (when zoomed)
- ✅ Download button
- ✅ Open in Drive button
- ✅ Keyboard shortcuts

### Videos

- ✅ Native HTML5 video player
- ✅ Play/pause controls
- ✅ Volume control
- ✅ Fullscreen support
- ✅ Proper aspect ratio

### PDFs & Google Docs

- ✅ Embedded viewer
- ✅ Minimum 600px height
- ✅ Scrollable content
- ✅ Fallback to "Open in Drive" if embedding fails

### Unsupported Files

- ✅ Clear message
- ✅ File icon and info
- ✅ "Open in Drive" button

## User Experience

### Before

❌ Fixed dialog size (95vh height, 6xl width)
❌ Required vertical scrolling to see entire image
❌ Wasted empty space
❌ No zoom functionality
❌ Duplicate close buttons

### After

✅ **Dynamic sizing** - Dialog fits content perfectly
✅ **No scrolling** - Entire image/video visible at once
✅ **Zoom support** - Click to zoom in/out
✅ **Smart layout** - Small files = small dialog, large files = larger dialog
✅ **Single close button** - Clean UI
✅ **Better performance** - Optimized rendering

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## File Type Support

| Type                         | Method          | Features                            |
| ---------------------------- | --------------- | ----------------------------------- |
| Images (JPG, PNG, GIF, WebP) | Lightbox        | Zoom, Pan, Download                 |
| Videos (MP4, WebM)           | Lightbox        | Play, Fullscreen, Download          |
| PDFs                         | Dialog + iframe | Scroll, Zoom (via viewer), Download |
| Google Docs                  | Dialog + iframe | View, Download, Open in Drive       |
| Google Sheets                | Dialog + iframe | View, Download, Open in Drive       |
| Google Slides                | Dialog + iframe | View, Download, Open in Drive       |
| Other                        | Dialog          | File info, Open in Drive            |

## Keyboard Shortcuts

- `ESC` - Close preview
- `Arrow Keys` - Navigate (if multiple images)
- `+` / `-` - Zoom in/out
- Click - Zoom toggle

## Mobile Support

- ✅ Touch gestures (swipe, pinch to zoom)
- ✅ Responsive layout
- ✅ Full-screen preview
- ✅ Optimized for small screens

## Performance

- ✅ Lazy loading of images
- ✅ Efficient memory usage
- ✅ Smooth animations (60fps)
- ✅ Cached resources

## Future Enhancements

- [ ] Add support for multiple file previews in one lightbox
- [ ] Add rotation controls for images
- [ ] Add slideshow mode
- [ ] Add sharing functionality
- [ ] Add annotations/comments
- [ ] Add comparison view (side-by-side)

## Troubleshooting

### Image not loading

1. Check if Google Drive access token is valid
2. Verify file permissions
3. Check browser console for errors

### Video playback issues

1. Ensure browser supports the video codec
2. Check network connection
3. Try opening in Google Drive directly

### PDF not displaying

1. Check if browser supports PDF embedding
2. Try the "Open in Drive" button
3. Ensure file isn't corrupted

## Related Documentation

- [Google Drive Integration](./GOOGLE_DRIVE_SETUP.md)
- [File Browser System](./FILE_BROWSER.md)
- [API Routes](./API_ROUTES.md)
