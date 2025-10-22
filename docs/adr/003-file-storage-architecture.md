# ADR 003: File Storage Architecture

**Date:** 2025-10-22

**Status:** Accepted

## Context

The platform needs to handle file uploads for:
- Project attachments
- Task files
- User avatars
- Invoice PDFs
- Design assets

Files can be large (up to 10MB) and need to be:
- Securely stored
- Quickly accessible
- Properly organized
- Cost-effective

## Decision

We will use **S3-compatible storage** with the following architecture:

- **Storage Provider:** AWS S3 or compatible (Cloudflare R2, MinIO, etc.)
- **Upload Method:** Presigned URLs for direct client uploads
- **Metadata:** Store file metadata in Postgres via Drizzle
- **Organization:** Folder structure by resource type (projects/tasks/general)
- **Security:** Private buckets with presigned URLs for access

### File Upload Flow

1. Client requests presigned URL from API
2. API generates presigned URL with:
   - Unique filename (nanoid)
   - Appropriate folder
   - Content-Type restriction
   - Expiration (1 hour)
3. Client uploads directly to S3
4. Client notifies API of successful upload
5. API stores file metadata in database

### File Access Flow

1. Client requests file access
2. API checks user permissions
3. API generates presigned URL for download
4. Client downloads from S3 directly

## Rationale

### S3-Compatible Storage
- Industry standard
- Highly reliable (99.999999999% durability)
- Cost-effective (pay per use)
- CDN integration available
- Many compatible providers (avoid vendor lock-in)

### Presigned URLs
- Reduces server load (direct upload/download)
- No file proxy needed
- More secure (temporary access)
- Better performance

### Metadata in Database
- Fast queries without S3 API calls
- Enables search and filtering
- Links files to projects/tasks
- Audit trail of who uploaded what

### Folder Organization
```
bucket/
├── projects/
│   └── {project-id}/
│       └── {file-id}.{ext}
├── tasks/
│   └── {task-id}/
│       └── {file-id}.{ext}
└── general/
    └── {file-id}.{ext}
```

## Consequences

### Positive
- Scalable storage solution
- Fast uploads/downloads
- No server bottleneck
- Cost-effective
- Reliable and durable

### Negative
- Need to manage S3 credentials
- Additional complexity with presigned URLs
- Need to clean up orphaned files
- Storage costs increase with usage

## Security Considerations

- Files are private by default
- Presigned URLs expire after 1 hour
- File type validation before upload
- File size limits enforced (10MB)
- Virus scanning possible via Lambda/Cloud Function

## Alternatives Considered

1. **Store in Database**
   - Rejected: Database bloat, poor performance, expensive

2. **Store on Filesystem**
   - Rejected: Doesn't work with serverless, hard to scale

3. **Cloudinary**
   - Rejected: More expensive, limited to images

4. **Supabase Storage**
   - Rejected: Vendor lock-in with Supabase

