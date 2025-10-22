# Project Requests Feature

## Overview

The Project Requests feature allows clients to submit project requests directly through the client portal. Team members (admins, developers, designers, marketers) can review, approve, or reject these requests through a dedicated interface.

## Key Features

### For Clients

1. **Submit Project Requests**

   - Fill out a comprehensive form with project details
   - Specify priority (Low, Medium, High, Urgent)
   - Provide budget estimates and timeline preferences
   - Add objectives, target audience, and deliverables

2. **Track Request Status**

   - View all submitted requests
   - See current status (Pending, Under Review, Approved, Rejected)
   - Read team feedback and review notes
   - Delete pending requests if needed

3. **Easy Access**
   - "Project Requests" link directly in the sidebar
   - "New Request" button for quick submissions

### For Team Members

1. **Review Interface**

   - View all client project requests
   - See detailed information about each request
   - Filter by status

2. **Request Management**

   - Update request status (Pending → Under Review → Approved/Rejected)
   - Add review notes and feedback
   - Link approved requests to created projects

3. **Notifications**
   - Badge count in sidebar showing pending requests
   - Auto-refreshes every 30 seconds
   - Quick visibility of new requests

## Database Schema

### `project_requests` Table

```typescript
{
  id: string (primary key)
  title: string (required)
  description: text (required)
  workspaceId: string (foreign key)
  requestedBy: string (foreign key to users)
  clientId: string (foreign key to clients)
  priority: enum (LOW, MEDIUM, HIGH, URGENT)
  status: enum (PENDING, UNDER_REVIEW, APPROVED, REJECTED)
  estimatedBudget: integer (cents)
  budgetCurrency: string (3 chars, default: USD)
  desiredStartDate: date
  desiredDeadline: date
  objectives: text
  targetAudience: text
  deliverables: text
  additionalNotes: text
  reviewedBy: string (foreign key to users)
  reviewedAt: date
  reviewNotes: text
  createdProjectId: string
  createdAt: date
  updatedAt: date
}
```

### `project_request_comments` Table

```typescript
{
  id: string (primary key)
  requestId: string (foreign key to project_requests)
  userId: string (foreign key to users)
  content: text (required)
  createdAt: date
  updatedAt: date
}
```

## API Endpoints

### Client Endpoints

#### `POST /api/project-requests`

Create a new project request

**Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "estimatedBudget": number (optional),
  "budgetCurrency": "USD" (optional),
  "desiredStartDate": "ISO date string" (optional),
  "desiredDeadline": "ISO date string" (optional),
  "objectives": "string" (optional),
  "targetAudience": "string" (optional),
  "deliverables": "string" (optional),
  "additionalNotes": "string" (optional)
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    /* project request object */
  }
}
```

#### `GET /api/project-requests`

Get all project requests (filtered by role)

**Query Parameters:**

- `status` (optional): Filter by status

**Response:**

```json
{
  "success": true,
  "data": [
    /* array of project requests */
  ]
}
```

#### `GET /api/project-requests/[id]`

Get a single project request

**Response:**

```json
{
  "success": true,
  "data": {
    /* project request object */
  }
}
```

#### `DELETE /api/project-requests/[id]`

Delete a project request (clients can only delete their own pending requests)

**Response:**

```json
{
  "success": true
}
```

### Team Endpoints

#### `PATCH /api/project-requests/[id]`

Update project request status and add review notes

**Request Body:**

```json
{
  "status": "PENDING|UNDER_REVIEW|APPROVED|REJECTED" (optional),
  "reviewNotes": "string" (optional),
  "createdProjectId": "string" (optional)
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    /* updated project request */
  }
}
```

#### `GET /api/project-requests/stats`

Get statistics about project requests

**Response:**

```json
{
  "pendingCount": number
}
```

## Pages

### `/project-requests` (All Users)

- **Clients**: View their submitted project requests
- **Team**: View all client project requests
- Shows stats cards with counts by status
- List view with status badges and priority indicators

### `/project-requests/new` (Clients Only)

- Form to submit a new project request
- Multiple sections:
  - Basic Information (title, description, priority, budget)
  - Timeline (desired start date and deadline)
  - Project Details (objectives, target audience, deliverables, notes)

### `/project-requests/[id]` (All Users)

- **Clients**: View request details and team feedback
- **Team**: View details + review interface to update status and add notes
- Shows all request information in organized cards
- Delete option for clients (pending requests only)

## Components

### `ProjectRequestForm`

Location: `components/project-requests/project-request-form.tsx`

Client-facing form for submitting project requests with validation and error handling.

### `ProjectRequestDetail`

Location: `components/project-requests/project-request-detail.tsx`

Displays project request details with role-based interfaces:

- Client view: Read-only with feedback display
- Team view: Editable with status update controls

## Hooks

### `useProjectRequestStats`

Location: `hooks/use-project-request-stats.ts`

Custom hook for fetching and auto-refreshing project request statistics:

- Fetches pending count every 30 seconds
- Only active for non-client users
- Used for sidebar badge notifications

## Sidebar Integration

### Client Navigation

- "Project Requests" link appears directly after main nav items
- Quick access to submit and view requests

### Team Navigation

- "Project Requests" appears in Workspace section
- Shows badge with pending request count
- Badge auto-updates every 30 seconds

## User Workflows

### Client Workflow

1. **Submit Request**

   - Click "Project Requests" in sidebar
   - Click "New Request" button
   - Fill out form with project details
   - Submit request
   - Redirected to requests list

2. **Track Request**

   - View list of submitted requests
   - Click on a request to see details
   - Read team feedback when available
   - See status changes (Pending → Under Review → Approved/Rejected)

3. **Manage Requests**
   - Delete pending requests if needed
   - Cannot delete requests that are under review or decided

### Team Workflow

1. **Review Requests**

   - See badge count in sidebar for pending requests
   - Click "Project Requests" in Workspace section
   - View all client requests with status filters
   - Click on a request to review details

2. **Process Request**

   - Read all project details
   - Update status (e.g., Pending → Under Review)
   - Add review notes with feedback or questions
   - Approve or reject request
   - Link to created project if approved

3. **Monitor Requests**
   - Dashboard shows pending count
   - Auto-refreshing badge for real-time updates
   - Filter by status to manage workflow

## Security & Permissions

### Client Permissions

- ✅ Can create project requests
- ✅ Can view only their own requests
- ✅ Can delete only their own pending requests
- ❌ Cannot update request status
- ❌ Cannot view other clients' requests

### Team Permissions

- ✅ Can view all project requests
- ✅ Can update request status
- ✅ Can add review notes
- ✅ Can delete any request (if needed)
- ❌ Cannot create project requests

## Status Flow

```
PENDING → UNDER_REVIEW → APPROVED
                      ↘ REJECTED
```

### Status Definitions

1. **PENDING**: Just submitted, awaiting team review
2. **UNDER_REVIEW**: Team is actively reviewing the request
3. **APPROVED**: Request approved, project will be created
4. **REJECTED**: Request rejected with reasons in review notes

## Priority Levels

1. **LOW**: Not urgent, flexible timeline
2. **MEDIUM**: Standard priority (default)
3. **HIGH**: Important, needs attention soon
4. **URGENT**: Critical, needs immediate attention

## Future Enhancements

### Potential Features

1. **Comments System**

   - Enable back-and-forth conversation on requests
   - Use existing `project_request_comments` table
   - Real-time chat between client and team

2. **Email Notifications**

   - Notify team when new request submitted
   - Notify client when status changes
   - Notify client when feedback added

3. **File Attachments**

   - Allow clients to attach reference files
   - Support for images, PDFs, documents
   - Link to existing files system

4. **Request Templates**

   - Common project types as templates
   - Pre-filled fields for faster submission
   - Industry-specific templates

5. **Approval Workflow**

   - Multi-step approval process
   - Require approval from specific roles
   - Track approval history

6. **Convert to Project**

   - One-click conversion of approved request to project
   - Auto-populate project fields from request
   - Link back to original request

7. **Analytics Dashboard**
   - Request volume over time
   - Average response time
   - Approval/rejection rates
   - Most common request types

## Implementation Details

### Form Validation

- Title: Required, max 255 characters
- Description: Required, min 10 characters
- Priority: Enum, default "MEDIUM"
- Budget: Optional, stored in cents
- Dates: Optional, ISO format
- Text fields: Optional, no length limits

### Error Handling

- API validation errors shown with toast notifications
- Network errors caught and displayed
- Form validation prevents invalid submissions
- Detailed error messages for debugging

### Performance

- Stats endpoint cached for 30 seconds
- Pagination ready (current limit: 50)
- Indexed database queries
- Optimistic UI updates

## Testing Checklist

### Client Tests

- [ ] Submit new project request
- [ ] View list of submitted requests
- [ ] View individual request details
- [ ] Delete pending request
- [ ] Cannot delete non-pending request
- [ ] Cannot view other clients' requests
- [ ] See feedback from team
- [ ] Badge count updates correctly

### Team Tests

- [ ] View all project requests
- [ ] Filter by status
- [ ] Update request status
- [ ] Add review notes
- [ ] Badge shows correct pending count
- [ ] Badge auto-refreshes
- [ ] Cannot create project requests
- [ ] See client information

### Security Tests

- [ ] Clients cannot access other clients' requests
- [ ] Clients cannot update status
- [ ] Team cannot create requests
- [ ] Unauthenticated users redirected
- [ ] API validates user permissions

## Conclusion

The Project Requests feature provides a streamlined way for clients to request new projects and for teams to manage those requests efficiently. With role-based permissions, real-time notifications, and a comprehensive review system, it enhances collaboration and communication between clients and the agency team.
