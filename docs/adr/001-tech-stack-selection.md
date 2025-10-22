# ADR 001: Tech Stack Selection

**Date:** 2025-10-22

**Status:** Accepted

## Context

We need to build a modern, scalable agency operations platform that can handle project management, client collaboration, billing, and team communication. The platform must be:
- Fast and responsive
- Type-safe and maintainable
- Easy to deploy and scale
- Modern and developer-friendly

## Decision

We have chosen the following tech stack:

### Frontend
- **Next.js 16** with App Router for server-side rendering and API routes
- **TypeScript** for type safety
- **Tailwind CSS v4** for utility-first styling
- **ShadCN UI** (New York style) for component library
- **Recharts** for data visualization

### Backend
- **Next.js API Routes** for serverless endpoints
- **Drizzle ORM** for type-safe database queries
- **Neon Postgres** for serverless Postgres database
- **NextAuth v5** for authentication

### External Services
- **AWS S3** (or compatible) for file storage
- **Stripe** for payment processing
- **Nodemailer** for email notifications

## Rationale

### Next.js 16
- Excellent developer experience with hot reload
- App Router provides modern routing patterns
- Built-in API routes eliminate need for separate backend
- Automatic code splitting and optimization
- Great deployment options (Vercel, Docker, etc.)

### TypeScript
- Catch errors at compile time
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring

### Drizzle ORM
- Type-safe queries that match our TypeScript philosophy
- Zero runtime overhead
- SQL-like syntax that's familiar to developers
- Excellent migration tooling

### Neon Postgres
- Serverless architecture reduces costs
- Built-in connection pooling
- Branching for development environments
- Automatic backups

### ShadCN UI
- Modern, accessible components
- Customizable via Tailwind
- Copy-paste philosophy - own your components
- Radix UI primitives ensure accessibility

## Consequences

### Positive
- Fast development with modern tools
- Type safety reduces bugs
- Easy scaling with serverless architecture
- Great developer experience
- Strong ecosystem and community

### Negative
- Learning curve for team members new to Next.js App Router
- Vendor lock-in with Neon (mitigated by using standard Postgres)
- Need to manage multiple external services (S3, Stripe, etc.)

## Alternatives Considered

1. **MERN Stack** (MongoDB, Express, React, Node)
   - Rejected: Less type safety, separate frontend/backend complexity

2. **Laravel + Vue**
   - Rejected: PHP less modern than TypeScript, smaller ecosystem

3. **Ruby on Rails**
   - Rejected: Slower than Node.js, smaller modern community

4. **Prisma ORM**
   - Considered but chose Drizzle for better performance and SQL-like syntax

