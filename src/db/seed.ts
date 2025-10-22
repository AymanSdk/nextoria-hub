/**
 * Database Seed Script
 * 
 * Seeds the database with demo data for development and testing
 * Run with: npm run db:seed
 */

import { db } from "./index";
import { 
  users, 
  workspaces, 
  workspaceMembers, 
  projects, 
  projectMembers,
  tasks,
  comments,
  invoices,
  invoiceLineItems
} from "./schema";
import { hashPassword } from "@/src/lib/auth/password";
import { nanoid } from "nanoid";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data (careful in production!)
  console.log("Clearing existing data...");
  await db.delete(tasks);
  await db.delete(projectMembers);
  await db.delete(projects);
  await db.delete(workspaceMembers);
  await db.delete(workspaces);
  await db.delete(users);

  // Create users
  console.log("Creating users...");
  const password = await hashPassword("password123");

  const [admin, developer, designer, marketer, client] = await db
    .insert(users)
    .values([
      {
        id: nanoid(),
        email: "admin@nextoria.com",
        name: "Admin User",
        password,
        role: "ADMIN",
        isActive: true,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        email: "developer@nextoria.com",
        name: "John Developer",
        password,
        role: "DEVELOPER",
        isActive: true,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        email: "designer@nextoria.com",
        name: "Jane Designer",
        password,
        role: "DESIGNER",
        isActive: true,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        email: "marketer@nextoria.com",
        name: "Bob Marketer",
        password,
        role: "MARKETER",
        isActive: true,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        email: "client@example.com",
        name: "Alice Client",
        password,
        role: "CLIENT",
        isActive: true,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .returning();

  // Create workspace
  console.log("Creating workspace...");
  const [workspace] = await db
    .insert(workspaces)
    .values({
      id: nanoid(),
      name: "Demo Agency",
      slug: "demo-agency",
      description: "A demo workspace for Nextoria Hub",
      ownerId: admin.id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Add members to workspace
  console.log("Adding workspace members...");
  await db.insert(workspaceMembers).values([
    {
      id: nanoid(),
      workspaceId: workspace.id,
      userId: admin.id,
      role: "ADMIN",
      isActive: true,
      joinedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      workspaceId: workspace.id,
      userId: developer.id,
      role: "DEVELOPER",
      isActive: true,
      joinedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      workspaceId: workspace.id,
      userId: designer.id,
      role: "DESIGNER",
      isActive: true,
      joinedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      workspaceId: workspace.id,
      userId: marketer.id,
      role: "MARKETER",
      isActive: true,
      joinedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      workspaceId: workspace.id,
      userId: client.id,
      role: "CLIENT",
      isActive: true,
      joinedAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Create projects
  console.log("Creating projects...");
  const [project1, project2] = await db
    .insert(projects)
    .values([
      {
        id: nanoid(),
        name: "Website Redesign",
        slug: "website-redesign",
        description: "Complete overhaul of the company website with modern design",
        workspaceId: workspace.id,
        ownerId: admin.id,
        status: "ACTIVE",
        priority: 2,
        color: "#0070f3",
        startDate: new Date("2025-10-01"),
        dueDate: new Date("2025-11-30"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: "Mobile App v2.0",
        slug: "mobile-app-v2",
        description: "Next generation mobile application with new features",
        workspaceId: workspace.id,
        ownerId: admin.id,
        status: "ACTIVE",
        priority: 3,
        color: "#7928ca",
        startDate: new Date("2025-10-15"),
        dueDate: new Date("2025-12-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .returning();

  // Add members to projects
  console.log("Adding project members...");
  await db.insert(projectMembers).values([
    {
      id: nanoid(),
      projectId: project1.id,
      userId: developer.id,
      canEdit: true,
      addedAt: new Date(),
    },
    {
      id: nanoid(),
      projectId: project1.id,
      userId: designer.id,
      canEdit: true,
      addedAt: new Date(),
    },
    {
      id: nanoid(),
      projectId: project2.id,
      userId: developer.id,
      canEdit: true,
      addedAt: new Date(),
    },
  ]);

  // Create tasks
  console.log("Creating tasks...");
  await db.insert(tasks).values([
    {
      id: nanoid(),
      title: "Design homepage mockup",
      description: "Create initial homepage design in Figma",
      projectId: project1.id,
      assigneeId: designer.id,
      reporterId: admin.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      labels: "design,ui",
      dueDate: new Date("2025-10-25"),
      estimatedHours: 16,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      title: "Set up project repository",
      description: "Initialize Next.js project with required dependencies",
      projectId: project1.id,
      assigneeId: developer.id,
      reporterId: admin.id,
      status: "DONE",
      priority: "MEDIUM",
      labels: "development",
      dueDate: new Date("2025-10-20"),
      estimatedHours: 4,
      actualHours: 3,
      completedAt: new Date("2025-10-19"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      title: "Content strategy planning",
      description: "Plan website content structure and copy",
      projectId: project1.id,
      assigneeId: marketer.id,
      reporterId: admin.id,
      status: "TODO",
      priority: "MEDIUM",
      labels: "content,marketing",
      dueDate: new Date("2025-10-28"),
      estimatedHours: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log("✅ Database seeded successfully!");
  console.log("\nDemo Accounts:");
  console.log("Admin:      admin@nextoria.com / password123");
  console.log("Developer:  developer@nextoria.com / password123");
  console.log("Designer:   designer@nextoria.com / password123");
  console.log("Marketer:   marketer@nextoria.com / password123");
  console.log("Client:     client@example.com / password123");
}

seed()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

