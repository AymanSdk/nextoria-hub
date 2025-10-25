# Google Drive Integration Security

## 🔒 Admin-Only Integration Management (Slack/ClickUp Model)

This document outlines the **critical security measures** implemented for Google Drive integration management.

## Security Philosophy

Like Slack and ClickUp, **only workspace administrators** should be able to:

- **Connect** workspace integrations
- **Disconnect** workspace integrations
- **Configure** integration settings (folder access, permissions)

This prevents data leaks and ensures centralized control over workspace resources.

## Security Model

### Role-Based Access Control (RBAC)

Only users with the **ADMIN** role can:

### Integration Management (Admin Only)

- **Connect** Google Drive to workspace
- **Disconnect** Google Drive from workspace
- View the "Manage Folders" button
- Access the folder selection dialog
- Update which folders are accessible to the workspace
- Configure folder restrictions

### File Access (All Roles)

- View and use files from Google Drive (respecting folder restrictions)
- Link Drive files to projects/tasks/clients

### Permission Matrix

| Role      | Connect/Disconnect | View/Use Files | Manage Folders | Configure Restrictions |
| --------- | ------------------ | -------------- | -------------- | ---------------------- |
| ADMIN     | ✅                 | ✅             | ✅             | ✅                     |
| DEVELOPER | ❌                 | ✅             | ❌             | ❌                     |
| DESIGNER  | ❌                 | ✅             | ❌             | ❌                     |
| MARKETER  | ❌                 | ✅             | ❌             | ❌                     |
| CLIENT    | ❌                 | ✅             | ❌             | ❌                     |

**Legend:**

- ✅ = Allowed
- ❌ = Forbidden (returns 403)

## Implementation Details

### Backend Security

All integration management endpoints enforce **strict admin-only access**:

#### 1. **GET /api/integrations/google-drive/auth** 🔒 ADMIN ONLY

- Initiates OAuth flow to connect Google Drive
- Returns **403 Forbidden** if user is not admin
- Validates workspace admin role before redirecting to Google

#### 2. **GET /api/integrations/google-drive/callback** 🔒 ADMIN ONLY

- Completes OAuth flow and saves credentials
- Returns **403 Forbidden** if user is not admin
- Double-checks admin status even after OAuth redirect

#### 3. **POST /api/integrations/google-drive/disconnect** 🔒 ADMIN ONLY

- Disconnects Google Drive integration
- Returns **403 Forbidden** if user is not admin
- Prevents data loss by restricting to admins only

#### 4. **GET /api/integrations/google-drive/folders** 🔒 ADMIN ONLY

- Lists all folders for selection
- Returns **403 Forbidden** if user is not admin
- Used by the folder selector dialog

#### 5. **POST /api/integrations/google-drive/folders/update** 🔒 ADMIN ONLY

- Updates allowed folder IDs
- Returns **403 Forbidden** if user is not admin
- Validates folderIds array format

#### 6. **GET /api/integrations/google-drive/status**

- Returns connection status and admin flag
- **Everyone** can check status
- Only admins see management UI options

#### 7. **GET /api/integrations/google-drive/files**

- Respects folder restrictions for **ALL users**
- Filters files based on `allowedFolderIds` in integration config
- No bypass possible - enforced at API level

### Frontend Security

The UI implements **defense-in-depth** with multiple layers:

#### For Admins:

1. **Connect Button**: Shown when not connected
2. **Disconnect Option**: Available in dropdown menu
3. **Manage Folders Button**: Visible when connected
4. **Full Control**: Can configure all integration settings

#### For Non-Admins:

1. **No Connect Button**: Replaced with "Contact admin" message
2. **No Disconnect Option**: Hidden from dropdown menu
3. **No Manage Folders**: Button completely hidden
4. **Info Messages**: Clear guidance to contact admin
5. **View-Only Access**: Can use files but not manage integration

#### Defense Layers:

1. **UI Hiding**: Buttons/options hidden for non-admins
2. **Client Validation**: Checks admin status before API calls
3. **API Enforcement**: Server validates admin role for ALL management operations
4. **Error Messages**: Clear feedback when non-admins attempt restricted actions

### Security Checks Flow

```
User Request → getCurrentWorkspace() → Get User Role → isAdmin() Check
                                                              ↓
                                                         If not admin
                                                              ↓
                                                    Return 403 Forbidden
```

## Data Storage

Folder restrictions are stored per workspace in the `integrations` table:

```json
{
  "config": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_at": 123456789,
    "scope": "...",
    "email": "user@example.com",
    "allowedFolderIds": ["folder_id_1", "folder_id_2"]
  }
}
```

## User Experience

### For Admins:

- See "Manage Folders" button with badge showing count
- Can select/deselect folders with search functionality
- Changes apply immediately to all workspace members
- Clear feedback on restrictions

### For Non-Admins:

- No folder management options visible
- See informative banner when restrictions are active
- Can only view files from allowed folders
- Clear message to contact admin if needed

## Security Best Practices

✅ **Server-side enforcement**: All checks happen on the backend  
✅ **Role-based permissions**: Uses existing RBAC system  
✅ **Defense in depth**: Multiple layers of security  
✅ **Workspace isolation**: Restrictions are per-workspace  
✅ **Audit trail**: Changes can be tracked via integration updates

## Preventing Data Leaks

1. **Query-Level Filtering**: Google Drive API query is modified to only include allowed folders
2. **No Client-Side Filtering**: Filtering happens on server, not in browser
3. **Permission Validation**: Every folder management request validates admin role
4. **Workspace Context**: All requests tied to current workspace context
5. **Database Security**: Integration config only accessible via authenticated APIs

## Example Scenarios

### Scenario 1: Restricting Client Data Access

Admin selects only "Client Deliverables" folder → All users can only see files from that folder → Sensitive internal documents remain hidden

### Scenario 2: Non-Admin Attempts Access

Developer tries to modify folder restrictions → API returns 403 Forbidden → No changes made → Admin notified (optional)

### Scenario 3: Workspace Switching

User switches workspaces → New workspace has different folder restrictions → Files filtered according to new workspace settings

## Testing Security

To verify security measures:

1. **Test as Non-Admin**:

   - Login as Developer/Designer/Marketer/Client
   - Verify "Manage Folders" button is hidden
   - Try direct API calls to folder endpoints (should return 403)

2. **Test as Admin**:

   - Login as Admin
   - Verify "Manage Folders" button is visible
   - Select specific folders
   - Switch to non-admin account and verify restrictions work

3. **Test API Directly**:

   ```bash
   # Try to access folders endpoint as non-admin (should fail)
   curl -X GET /api/integrations/google-drive/folders
   # Response: {"error": "Forbidden: Only admins can manage folder access"}

   # Try to update folders as non-admin (should fail)
   curl -X POST /api/integrations/google-drive/folders/update \
     -H "Content-Type: application/json" \
     -d '{"folderIds": ["some_id"]}'
   # Response: {"error": "Forbidden: Only admins can update folder permissions"}
   ```

## Additional Security Considerations

- **Token Security**: Google Drive tokens are stored securely and never exposed to non-admins
- **Rate Limiting**: Consider implementing rate limits on folder management endpoints
- **Audit Logging**: Consider logging all folder restriction changes
- **Notification**: Consider notifying workspace members when folder restrictions change

## Questions?

If you have security concerns or need to modify permissions, please review:

- `/src/lib/auth/rbac.ts` - Role definitions and permission checks
- `/src/lib/workspace/context.ts` - Workspace context management
- `/src/lib/constants/roles.ts` - Role hierarchy and descriptions
