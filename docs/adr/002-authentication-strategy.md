# ADR 002: Authentication Strategy

**Date:** 2025-10-22

**Status:** Accepted

## Context

The platform needs secure authentication supporting multiple login methods and role-based access control. Users should be able to sign in with email/password or OAuth providers.

## Decision

We will use **NextAuth v5** (Auth.js) with the following configuration:

- **Providers:**
  - Credentials provider for email/password
  - Google OAuth
  - GitHub OAuth
  
- **Storage:**
  - Drizzle adapter for storing users, accounts, and sessions in Neon Postgres
  - JWT strategy for sessions
  
- **Security:**
  - Bcrypt for password hashing (12 rounds)
  - Password strength validation
  - Email verification flow
  - Password reset via secure tokens
  
- **RBAC:**
  - 5 predefined roles: ADMIN, DEVELOPER, DESIGNER, MARKETER, CLIENT
  - Role stored in user table
  - Role included in session JWT
  - Middleware-based route guards
  - Permission checking at API level

## Rationale

### NextAuth v5
- Industry standard for Next.js authentication
- Built-in OAuth provider support
- Flexible adapter system (works with any database)
- Active community and documentation
- Security best practices built-in

### JWT Sessions
- Stateless authentication
- Better for serverless environments
- No need for session storage
- Automatic expiration handling

### Bcrypt
- Industry standard for password hashing
- Configurable work factor (we use 12 rounds)
- Built-in salt generation

### Database Storage
- User data persists across OAuth providers
- Easy to query user information
- Supports account linking
- Audit trail of logins

## Consequences

### Positive
- Secure authentication out of the box
- Easy to add new OAuth providers
- Consistent user experience
- RBAC enables multi-tenant features
- Email verification reduces spam accounts

### Negative
- JWT sessions can't be invalidated server-side
- Need to manage OAuth app credentials
- Password reset flow adds complexity

## Alternatives Considered

1. **Clerk**
   - Rejected: Paid service, vendor lock-in

2. **Auth0**
   - Rejected: Expensive for scale, overkill for our needs

3. **Custom implementation**
   - Rejected: Too much security risk, reinventing the wheel

4. **Supabase Auth**
   - Rejected: Would require using Supabase as database

