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
  milestones,
  tasks,
  comments,
  invoices,
  invoiceLineItems,
  payments,
  notifications,
  chatChannels,
  chatMessages,
  chatChannelMembers,
} from "./schema";
import { hashPassword } from "@/src/lib/auth/password";
import { nanoid } from "nanoid";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data (careful in production!)
  console.log("Clearing existing data...");
  await db.delete(chatMessages);
  await db.delete(chatChannelMembers);
  await db.delete(chatChannels);
  await db.delete(notifications);
  await db.delete(comments);
  await db.delete(tasks);
  await db.delete(milestones);
  await db.delete(projectMembers);
  await db.delete(projects);
  await db.delete(payments);
  await db.delete(invoiceLineItems);
  await db.delete(invoices);
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
  const [project1, project2, project3] = await db
    .insert(projects)
    .values([
      {
        id: nanoid(),
        name: "Website Redesign",
        slug: "website-redesign",
        description:
          "Complete overhaul of the company website with modern design and improved UX",
        workspaceId: workspace.id,
        ownerId: admin.id,
        status: "ACTIVE",
        priority: 2,
        color: "#0070f3",
        startDate: new Date("2025-10-01"),
        dueDate: new Date("2025-11-30"),
        budget: 25000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: "Mobile App v2.0",
        slug: "mobile-app-v2",
        description:
          "Next generation mobile application with new features and improved performance",
        workspaceId: workspace.id,
        ownerId: admin.id,
        status: "ACTIVE",
        priority: 3,
        color: "#7928ca",
        startDate: new Date("2025-10-15"),
        dueDate: new Date("2025-12-15"),
        budget: 45000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: "Brand Identity Refresh",
        slug: "brand-identity-refresh",
        description:
          "Update company brand guidelines, logo, and marketing materials",
        workspaceId: workspace.id,
        ownerId: admin.id,
        status: "DRAFT",
        priority: 1,
        color: "#ff0080",
        startDate: new Date("2025-11-01"),
        dueDate: new Date("2026-01-15"),
        budget: 15000,
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
      userId: admin.id,
      canEdit: true,
      addedAt: new Date(),
    },
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
      projectId: project1.id,
      userId: client.id,
      canEdit: false,
      addedAt: new Date(),
    },
    {
      id: nanoid(),
      projectId: project2.id,
      userId: admin.id,
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
    {
      id: nanoid(),
      projectId: project2.id,
      userId: designer.id,
      canEdit: true,
      addedAt: new Date(),
    },
    {
      id: nanoid(),
      projectId: project3.id,
      userId: admin.id,
      canEdit: true,
      addedAt: new Date(),
    },
    {
      id: nanoid(),
      projectId: project3.id,
      userId: designer.id,
      canEdit: true,
      addedAt: new Date(),
    },
    {
      id: nanoid(),
      projectId: project3.id,
      userId: marketer.id,
      canEdit: true,
      addedAt: new Date(),
    },
  ]);

  // Create milestones
  console.log("Creating milestones...");
  const [milestone1, milestone2] = await db
    .insert(milestones)
    .values([
      {
        id: nanoid(),
        projectId: project1.id,
        name: "Design Phase Complete",
        description: "All design mockups approved and ready for development",
        dueDate: new Date("2025-10-30"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        projectId: project1.id,
        name: "Development Phase Complete",
        description: "Website fully developed and ready for testing",
        dueDate: new Date("2025-11-20"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .returning();

  // Create tasks
  console.log("Creating tasks...");
  const [task1, task2, task3, task4, task5, task6, task7, task8] = await db
    .insert(tasks)
    .values([
      {
        id: nanoid(),
        title: "Design homepage mockup",
        description:
          "Create initial homepage design in Figma with modern UI/UX principles",
        projectId: project1.id,
        milestoneId: milestone1.id,
        assigneeId: designer.id,
        reporterId: admin.id,
        status: "IN_PROGRESS",
        priority: "HIGH",
        labels: "design,ui,homepage",
        dueDate: new Date("2025-10-25"),
        estimatedHours: 16,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        title: "Set up project repository",
        description:
          "Initialize Next.js project with TypeScript, Tailwind CSS, and required dependencies",
        projectId: project1.id,
        assigneeId: developer.id,
        reporterId: admin.id,
        status: "DONE",
        priority: "HIGH",
        labels: "development,setup",
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
        description:
          "Plan website content structure, navigation, and copy guidelines",
        projectId: project1.id,
        milestoneId: milestone1.id,
        assigneeId: marketer.id,
        reporterId: admin.id,
        status: "TODO",
        priority: "MEDIUM",
        labels: "content,marketing,strategy",
        dueDate: new Date("2025-10-28"),
        estimatedHours: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        title: "Design product pages",
        description:
          "Create design mockups for product listing and detail pages",
        projectId: project1.id,
        milestoneId: milestone1.id,
        assigneeId: designer.id,
        reporterId: admin.id,
        status: "TODO",
        priority: "MEDIUM",
        labels: "design,ui,products",
        dueDate: new Date("2025-10-27"),
        estimatedHours: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        title: "Implement responsive navigation",
        description:
          "Build mobile-friendly navigation with hamburger menu and smooth transitions",
        projectId: project1.id,
        milestoneId: milestone2.id,
        assigneeId: developer.id,
        reporterId: admin.id,
        status: "IN_REVIEW",
        priority: "HIGH",
        labels: "development,frontend,navigation",
        dueDate: new Date("2025-11-05"),
        estimatedHours: 8,
        actualHours: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        title: "API integration setup",
        description: "Set up API endpoints for mobile app backend integration",
        projectId: project2.id,
        assigneeId: developer.id,
        reporterId: admin.id,
        status: "IN_PROGRESS",
        priority: "HIGH",
        labels: "development,backend,api",
        dueDate: new Date("2025-10-30"),
        estimatedHours: 24,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        title: "User authentication flow",
        description:
          "Design and implement user login, signup, and password recovery screens",
        projectId: project2.id,
        assigneeId: designer.id,
        reporterId: admin.id,
        status: "TODO",
        priority: "HIGH",
        labels: "design,authentication,mobile",
        dueDate: new Date("2025-11-01"),
        estimatedHours: 16,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        title: "Logo design concepts",
        description: "Create 3-5 logo design concepts for brand refresh",
        projectId: project3.id,
        assigneeId: designer.id,
        reporterId: admin.id,
        status: "TODO",
        priority: "MEDIUM",
        labels: "design,branding,logo",
        dueDate: new Date("2025-11-10"),
        estimatedHours: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .returning();

  // Create comments
  console.log("Creating comments...");
  await db.insert(comments).values([
    {
      id: nanoid(),
      taskId: task1.id,
      authorId: admin.id,
      content: "Great progress on the homepage! The color scheme looks modern.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      taskId: task1.id,
      authorId: designer.id,
      content:
        "Thanks! I'm thinking about adding more white space to improve readability.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      taskId: task2.id,
      authorId: developer.id,
      content:
        "Repository is set up with all the necessary configurations. Ready to start development!",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      taskId: task5.id,
      authorId: client.id,
      content:
        "The navigation looks great on mobile! Small request: can we make the menu animation slightly slower?",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Create invoices
  console.log("Creating invoices...");
  const [invoice1, invoice2] = await db
    .insert(invoices)
    .values([
      {
        id: nanoid(),
        invoiceNumber: "INV-2025-001",
        workspaceId: workspace.id,
        projectId: project1.id,
        clientId: client.id,
        createdBy: admin.id,
        status: "PAID",
        issueDate: new Date("2025-10-01"),
        dueDate: new Date("2025-10-15"),
        paidAt: new Date("2025-10-12"),
        subtotal: 5000,
        taxRate: 10,
        taxAmount: 500,
        total: 5500,
        currency: "USD",
        notes: "Initial project deposit - 20% of total budget",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        invoiceNumber: "INV-2025-002",
        workspaceId: workspace.id,
        projectId: project1.id,
        clientId: client.id,
        createdBy: admin.id,
        status: "SENT",
        issueDate: new Date("2025-10-15"),
        dueDate: new Date("2025-10-30"),
        subtotal: 7500,
        taxRate: 10,
        taxAmount: 750,
        total: 8250,
        currency: "USD",
        notes: "Design phase completion - 30% of total budget",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .returning();

  // Create invoice line items
  console.log("Creating invoice line items...");
  await db.insert(invoiceLineItems).values([
    {
      id: nanoid(),
      invoiceId: invoice1.id,
      description: "Project initiation and planning",
      quantity: 1,
      unitPrice: 2000,
      amount: 2000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      invoiceId: invoice1.id,
      description: "Initial design consultation - 20 hours @ $150/hr",
      quantity: 20,
      unitPrice: 150,
      amount: 3000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      invoiceId: invoice2.id,
      description: "Homepage design mockup - 40 hours @ $150/hr",
      quantity: 40,
      unitPrice: 150,
      amount: 6000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      invoiceId: invoice2.id,
      description: "Additional design revisions",
      quantity: 1,
      unitPrice: 1500,
      amount: 1500,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Create payment
  console.log("Creating payments...");
  await db.insert(payments).values([
    {
      id: nanoid(),
      invoiceId: invoice1.id,
      amount: 5500,
      currency: "USD",
      paymentMethod: "CREDIT_CARD",
      status: "SUCCEEDED",
      paidAt: new Date("2025-10-12"),
      transactionId: "ch_" + nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Create notifications
  console.log("Creating notifications...");
  await db.insert(notifications).values([
    {
      id: nanoid(),
      userId: admin.id,
      type: "TASK_ASSIGNED",
      title: "New task assigned",
      message: "You have been assigned to 'Content strategy planning'",
      actionUrl: `/projects/${project1.slug}`,
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      userId: designer.id,
      type: "TASK_COMMENTED",
      title: "New comment on your task",
      message: "Admin User commented on 'Design homepage mockup'",
      actionUrl: `/projects/${project1.slug}`,
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      userId: client.id,
      type: "INVOICE_SENT",
      title: "New invoice received",
      message: "Invoice INV-2025-002 has been sent to you",
      actionUrl: `/invoices`,
      isRead: true,
      createdAt: new Date("2025-10-15"),
    },
    {
      id: nanoid(),
      userId: developer.id,
      type: "SYSTEM",
      title: "Project milestone reached",
      message: "Design Phase Complete milestone is in progress",
      actionUrl: `/projects/${project1.slug}`,
      isRead: true,
      createdAt: new Date("2025-10-18"),
    },
  ]);

  // Create chat channels
  console.log("Creating chat channels...");
  const [channel1, channel2] = await db
    .insert(chatChannels)
    .values([
      {
        id: nanoid(),
        workspaceId: workspace.id,
        name: "general",
        description: "General team discussions",
        isPrivate: false,
        isArchived: false,
        createdBy: admin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        workspaceId: workspace.id,
        projectId: project1.id,
        name: "website-redesign",
        description: "Discussions about the website redesign project",
        isPrivate: false,
        isArchived: false,
        createdBy: admin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .returning();

  // Add members to channels
  console.log("Adding channel members...");
  await db.insert(chatChannelMembers).values([
    {
      id: nanoid(),
      channelId: channel1.id,
      userId: admin.id,
      joinedAt: new Date(),
    },
    {
      id: nanoid(),
      channelId: channel1.id,
      userId: developer.id,
      joinedAt: new Date(),
    },
    {
      id: nanoid(),
      channelId: channel1.id,
      userId: designer.id,
      joinedAt: new Date(),
    },
    {
      id: nanoid(),
      channelId: channel1.id,
      userId: marketer.id,
      joinedAt: new Date(),
    },
    {
      id: nanoid(),
      channelId: channel2.id,
      userId: admin.id,
      joinedAt: new Date(),
    },
    {
      id: nanoid(),
      channelId: channel2.id,
      userId: developer.id,
      joinedAt: new Date(),
    },
    {
      id: nanoid(),
      channelId: channel2.id,
      userId: designer.id,
      joinedAt: new Date(),
    },
    {
      id: nanoid(),
      channelId: channel2.id,
      userId: client.id,
      joinedAt: new Date(),
    },
  ]);

  // Create chat messages
  console.log("Creating chat messages...");
  await db.insert(chatMessages).values([
    {
      id: nanoid(),
      channelId: channel1.id,
      senderId: admin.id,
      content: "Welcome to the team! Excited to work with everyone.",
      createdAt: new Date("2025-10-01T09:00:00"),
      updatedAt: new Date("2025-10-01T09:00:00"),
    },
    {
      id: nanoid(),
      channelId: channel1.id,
      senderId: developer.id,
      content:
        "Thanks! Looking forward to building some great projects together.",
      createdAt: new Date("2025-10-01T09:15:00"),
      updatedAt: new Date("2025-10-01T09:15:00"),
    },
    {
      id: nanoid(),
      channelId: channel1.id,
      senderId: designer.id,
      content: "Hey team! Can't wait to collaborate on the designs!",
      createdAt: new Date("2025-10-01T10:30:00"),
      updatedAt: new Date("2025-10-01T10:30:00"),
    },
    {
      id: nanoid(),
      channelId: channel2.id,
      senderId: admin.id,
      content:
        "Let's kick off the website redesign project. I've created the initial milestones and tasks.",
      createdAt: new Date("2025-10-02T14:00:00"),
      updatedAt: new Date("2025-10-02T14:00:00"),
    },
    {
      id: nanoid(),
      channelId: channel2.id,
      senderId: designer.id,
      content:
        "Great! I'm starting on the homepage mockup. Should have something to review by end of week.",
      createdAt: new Date("2025-10-02T14:30:00"),
      updatedAt: new Date("2025-10-02T14:30:00"),
    },
    {
      id: nanoid(),
      channelId: channel2.id,
      senderId: developer.id,
      content:
        "Repository is all set up. Ready to start implementation once designs are approved.",
      createdAt: new Date("2025-10-02T15:00:00"),
      updatedAt: new Date("2025-10-02T15:00:00"),
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
