# Chat Access Control Policy

## Overview
This document outlines the role-based access control (RBAC) implemented for the Nextoria Hub chat system.

## User Roles

### Team Members (Nextoria Staff)
- **ADMIN**: Full system access
- **DEVELOPER**: Code & technical tasks
- **DESIGNER**: Assets & creative work
- **MARKETER**: Campaigns & analytics

### Clients
- **CLIENT**: Portal-only access

## Access Control Rules

### Chat Channels

#### Viewing Channels
- **Team Members**: Can see ALL channels in their workspace
  - Public channels
  - Private channels
  - Project-specific channels
  
- **Clients**: Can ONLY see channels they are explicitly added to
  - Must be added as a member by a team member
  - Cannot discover or browse other channels

#### Creating Channels
- **Team Members**: Can create channels
  - Automatically become members of channels they create
  
- **Clients**: Can create channels
  - Automatically become members of channels they create
  - Other clients won't see these channels unless added

#### Sending Messages
- **Team Members**: Can send messages to any channel in the workspace
  
- **Clients**: Can only send messages to channels they're members of
  - 403 error if attempting to message non-member channels

#### Managing Channel Members
- **Team Members**: Can add/remove members from any channel
  - Can add both team members and clients
  
- **Clients**: Cannot manage channel membership
  - 403 error if attempting to add members

### Chat Messages

#### Reading Messages
- **Team Members**: Can read messages from all channels
  
- **Clients**: Can only read messages from channels they're members of
  - 403 error if attempting to access non-member channel messages

## Implementation Details

### API Endpoints

#### GET /api/chat/channels
- Team members: Returns all workspace channels
- Clients: Returns only channels where user is a member (via JOIN)

#### GET /api/chat/messages?channelId={id}
- Team members: Returns all messages
- Clients: Checks membership, returns 403 if not a member

#### POST /api/chat/messages
- Team members: Can post to any channel
- Clients: Membership check before allowing post

#### GET /api/chat/channels/[channelId]/members
- Team members: Can view all channel members
- Clients: Can only view if they're a member

#### POST /api/chat/channels/[channelId]/members
- Team members: Can add members
- Clients: Blocked with 403 error

### Helper Functions

Located in `/src/lib/constants/roles.ts`:

```typescript
// Check if user is a team member
isTeamMember(role: Role): boolean

// Check if user is a client
isClient(role: Role): boolean

// Team member roles constant
TEAM_ROLES: Role[]
```

## Use Cases

### Use Case 1: Project-Specific Communication
A project manager (DEVELOPER) creates a private channel for "Project Alpha" and adds the client. The client can now:
- See and access this channel
- Send and receive messages
- View other members
- Cannot add new members

### Use Case 2: Internal Team Discussion
Developers create an internal channel for technical discussions. Clients:
- Cannot see this channel exists
- Cannot access messages
- Will get 403 if they somehow obtain the channel ID

### Use Case 3: Client Portal Channel
When a client account is created, a team member can create a dedicated channel and add the client. The client:
- Only sees their dedicated channel(s)
- Can communicate with team members
- Has a focused, controlled experience

## Security Considerations

1. **Database-Level Filtering**: Clients use INNER JOIN with channel_members table, ensuring no unauthorized channels are returned
2. **Double-Check on Actions**: Even if a client obtains a channel ID, all write operations verify membership
3. **Role-Based Guards**: All endpoints check user role before performing sensitive operations
4. **Workspace Isolation**: All queries filter by workspaceId to ensure multi-tenant security

## Migration Considerations

If you have existing channels and want to apply this policy:

1. Ensure all team members are in the database with appropriate roles
2. Add team members to existing channels (optional, as they can access all channels anyway)
3. Review client memberships and add clients to channels they should access
4. Test with a client account to verify restricted access

## Testing Checklist

- [ ] Team member can see all channels
- [ ] Client only sees channels they're a member of
- [ ] Client gets 403 when accessing non-member channel messages
- [ ] Client gets 403 when trying to add members to a channel
- [ ] Team member can add client to a channel
- [ ] Team member can send messages to any channel
- [ ] Client can only send messages to member channels

## Future Enhancements

Potential improvements to consider:
- Channel administrators/moderators
- Public vs private workspace channels
- Temporary channel access (time-limited)
- Channel access logs for audit trail
- Notification preferences per channel

