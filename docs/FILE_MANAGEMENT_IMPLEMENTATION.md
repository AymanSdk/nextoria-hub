# File Management System for Client Deliverables

## Overview

A complete file management system has been implemented for handling client deliverables in Nextoria Hub. The system uses **S3-compatible storage** which is superior to blob storage.

## Why S3-Compatible Storage > Blob Storage

### Advantages of S3-Compatible Storage:

1. ✅ **Industry Standard** - Works with AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces, etc.
2. ✅ **Presigned URLs** - Direct upload/download without server bottleneck
3. ✅ **Highly Scalable** - 99.999999999% durability
4. ✅ **Cost-Effective** - Pay only for what you use, typically cheaper at scale
5. ✅ **CDN Integration** - Easy to integrate with CDNs for global delivery
6. ✅ **No Vendor Lock-in** - Can switch between providers easily
7. ✅ **Better Performance** - Direct client-to-storage communication

### Blob Storage Limitations:

- Often vendor-specific (e.g., Azure Blob Storage)
- Less flexible for presigned URLs
- More expensive at scale
- Fewer compatible providers
- Typically requires proxy server for uploads/downloads

## What Was Implemented

### 1. Database Schema Updates

**File:** `src/db/schema/files.ts`

- Added `clientId` field to link files to specific clients
- Supports polymorphic file attachments (projects, tasks, clients)
- Includes versioning, tags, and description support
- File access logging for audit trail

**File:** `src/db/schema/index.ts`

- Added file relations for clients
- Created `filesRelations` for proper Drizzle ORM queries

### 2. API Routes

#### `/api/deliverables` (GET, POST)

- **GET**: List all deliverables for a specific client
- **POST**: Upload a new deliverable file (max 50MB)
- Supports file type validation
- Stores metadata in PostgreSQL

#### `/api/deliverables/[fileId]/download` (GET)

- Generates presigned download URLs (valid for 1 hour)
- Logs file access for security audit
- Returns download URL with file metadata

#### `/api/deliverables/[fileId]` (DELETE)

- Soft delete by archiving files
- Permission checks (must be uploader or admin)
- Removes file from S3 storage

### 3. Client Components

#### `DeliverableUpload` Component

**Location:** `components/deliverables/deliverable-upload.tsx`

Features:

- Drag & drop file upload
- Multiple file support
- Real-time upload progress
- File type validation (images, PDFs, documents, videos, archives)
- Optional description and tags
- Custom trigger button support
- Beautiful modal dialog interface

#### `DeliverablesList` Component

**Location:** `components/deliverables/deliverables-list.tsx`

Features:

- Display all client deliverables
- File icons based on type (images, videos, PDFs, etc.)
- Download functionality with presigned URLs
- Delete capability (with confirmation dialog)
- Shows file metadata (size, upload date, uploader)
- Tag display
- Loading states
- Empty state handling

### 4. Integration in Client Portal

#### Client Portal Page

**File:** `app/(dashboard)/client-portal/page.tsx`

- Integrated DeliverablesList and DeliverableUpload
- Shows deliverables for authenticated clients
- Upload permission for non-client users (team members)
- Delete permission for team members only

#### Client Workspace View

**File:** `app/(dashboard)/clients/client/[workspaceId]/page.tsx`

- Real-time deliverable display
- Upload functionality for team members
- Client-specific file access

## File Upload Flow

```
┌─────────┐
│ Client  │
│  (UI)   │
└────┬────┘
     │
     │ 1. Request upload
     ▼
┌─────────────────┐
│ DeliverableUpload│
│   Component      │
└────┬─────────────┘
     │
     │ 2. POST /api/deliverables
     ▼
┌──────────────────┐
│  API Route       │
│  Validates file  │
└────┬─────────────┘
     │
     │ 3. Upload to S3
     ▼
┌──────────────────┐
│   S3 Storage     │
│ (via AWS SDK)    │
└────┬─────────────┘
     │
     │ 4. Store metadata
     ▼
┌──────────────────┐
│   PostgreSQL     │
│  (files table)   │
└──────────────────┘
```

## File Download Flow

```
┌─────────┐
│ Client  │
│  (UI)   │
└────┬────┘
     │
     │ 1. Click download
     ▼
┌─────────────────────┐
│ DeliverablesList    │
│   Component         │
└────┬────────────────┘
     │
     │ 2. GET /api/deliverables/[fileId]/download
     ▼
┌──────────────────────┐
│  API Route           │
│  Check permissions   │
└────┬─────────────────┘
     │
     │ 3. Generate presigned URL
     ▼
┌──────────────────────┐
│   S3 Storage         │
│ (presigned URL)      │
└────┬─────────────────┘
     │
     │ 4. Direct download
     ▼
┌──────────────────────┐
│   Client Browser     │
└──────────────────────┘
```

## Configuration Required

### Environment Variables

Add to your `.env` file:

```env
# S3 Storage Configuration
S3_ENDPOINT="https://s3.amazonaws.com"              # Or your S3-compatible endpoint
S3_REGION="us-east-1"                               # Your region
S3_BUCKET_NAME="nextoria-hub-files"                 # Your bucket name
S3_ACCESS_KEY_ID="your-access-key-id"               # Your access key
S3_SECRET_ACCESS_KEY="your-secret-access-key"       # Your secret key
```

### Cloudflare R2 (RECOMMENDED - 10GB FREE!)

**Best option for files** - Perfect for your use case!

```env
# Cloudflare R2 - 10GB FREE Forever
STORAGE_PROVIDER="r2"
S3_ENDPOINT="https://[account-id].r2.cloudflarestoage.com"
S3_REGION="auto"
S3_BUCKET_NAME="nextoria-hub-files"
S3_ACCESS_KEY_ID="your-r2-access-key-id"
S3_SECRET_ACCESS_KEY="your-r2-secret-access-key"
# Optional: Custom domain
R2_PUBLIC_URL="https://files.yourdomain.com"
```

**Why R2?**:

- ✅ 10GB FREE storage (forever)
- ✅ ZERO bandwidth costs
- ✅ No credit card required
- ✅ S3-compatible (code works as-is)

See `docs/CLOUDFLARE_R2_SETUP.md` for setup guide.

### Alternative Providers

**DigitalOcean Spaces**:

```env
S3_ENDPOINT="https://nyc3.digitaloceanspaces.com"
S3_REGION="nyc3"
S3_BUCKET_NAME="nextoria-hub-files"
S3_ACCESS_KEY_ID="your-spaces-access-key"
S3_SECRET_ACCESS_KEY="your-spaces-secret-key"
```

**MinIO (Self-hosted)**:

```env
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_BUCKET_NAME="nextoria-hub-files"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
```

## Database Migration

Run the following command to apply the schema changes:

```bash
bun run db:push
```

This will:

1. Add `client_id` column to the `files` table
2. Create foreign key constraint to `clients` table
3. Enable cascade delete (when client is deleted, their files are deleted)

## Supported File Types

- **Images**: PNG, JPG, JPEG, GIF, WebP, SVG
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Text**: TXT, CSV, MD
- **Video**: MP4, MOV, AVI, MKV
- **Archives**: ZIP, RAR

Maximum file size: **50MB** (configurable)

## Security Features

1. **Authentication Required**: All endpoints require valid session
2. **File Type Validation**: Only allowed file types can be uploaded
3. **File Size Limits**: 50MB maximum to prevent abuse
4. **Presigned URLs**: Temporary access (1 hour expiration)
5. **Access Logging**: All downloads are logged with user, IP, and timestamp
6. **Soft Delete**: Files are archived, not permanently deleted
7. **Permission Checks**: Only uploader or admin can delete files

## Usage Examples

### For Team Members (Uploading)

```tsx
import { DeliverableUpload } from "@/components/deliverables/deliverable-upload";

<DeliverableUpload
  clientId='client-123'
  onUploadComplete={(file) => {
    console.log("File uploaded:", file);
    // Refresh list or show notification
  }}
/>;
```

### For Clients (Viewing)

```tsx
import { DeliverablesList } from "@/components/deliverables/deliverables-list";

<DeliverablesList
  clientId='client-123'
  canDelete={false} // Clients cannot delete
/>;
```

### For Team Members (Viewing & Managing)

```tsx
import { DeliverablesList } from "@/components/deliverables/deliverables-list";

<DeliverablesList
  clientId='client-123'
  canDelete={true} // Team members can delete
/>;
```

## Folder Structure in S3

```
bucket-name/
├── clients/
│   └── {client-id}/
│       └── deliverables/
│           ├── {nanoid}.pdf
│           ├── {nanoid}.png
│           └── {nanoid}.docx
├── projects/
│   └── {project-id}/
│       └── {nanoid}.zip
└── tasks/
    └── {task-id}/
        └── {nanoid}.jpg
```

## Performance Optimizations

1. **Direct Upload**: Files go directly from client to S3 (no server proxy)
2. **Presigned URLs**: Temporary URLs reduce server load
3. **Lazy Loading**: File lists are fetched only when needed
4. **Optimistic Updates**: UI updates immediately, syncs in background
5. **Metadata Caching**: File info stored in PostgreSQL for fast queries

## Future Enhancements

- [ ] File preview functionality (images, PDFs)
- [ ] Bulk upload support
- [ ] File versioning UI
- [ ] Advanced search and filtering
- [ ] File sharing with expiration links
- [ ] Virus scanning integration
- [ ] Image thumbnail generation
- [ ] Download statistics and analytics

## Troubleshooting

### Files not uploading?

1. Check S3 credentials in `.env`
2. Verify S3 bucket exists and has correct permissions
3. Check browser console for errors
4. Verify file size is under 50MB

### Files not downloading?

1. Check if presigned URLs are being generated correctly
2. Verify S3 endpoint is accessible from browser
3. Check CORS settings on your S3 bucket
4. Ensure user has permission to access the file

### Database errors?

1. Run `bun run db:push` to apply schema changes
2. Check if `clientId` column exists in `files` table
3. Verify foreign key constraints are properly set

## Dependencies Installed

- `react-dropzone@14.3.8` - For drag & drop file upload functionality
- `@aws-sdk/client-s3` - Already installed for S3 operations
- `@aws-sdk/s3-request-presigner` - Already installed for presigned URLs

## Testing

To test the file management system:

1. Create a test client in your database
2. Navigate to the client portal page
3. Upload a test file (image, PDF, etc.)
4. Verify file appears in the deliverables list
5. Click download and verify the file downloads correctly
6. Test delete functionality (if you're a team member)

## Support

For issues or questions:

- Check the documentation in `docs/adr/003-file-storage-architecture.md`
- Review API route implementations in `app/api/deliverables/`
- Inspect component code in `components/deliverables/`

---

**Implementation Date**: October 22, 2025
**Status**: ✅ Complete and Ready for Use
