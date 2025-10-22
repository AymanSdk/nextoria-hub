/**
 * Automated Invoice Generation
 * Generate invoices based on project milestones and task completion
 */

import { db } from "@/src/db";
import {
  invoices,
  invoiceLineItems,
  milestones,
  projects,
} from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Generate invoice number
 */
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${year}-${random}`;
}

/**
 * Generate invoice from milestone completion
 */
export async function generateInvoiceFromMilestone(params: {
  milestoneId: string;
  clientId: string;
  workspaceId: string;
  createdBy: string;
  dueInDays?: number;
}) {
  // Get milestone details
  const [milestone] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, params.milestoneId));

  if (!milestone) {
    throw new Error("Milestone not found");
  }

  // Get project details
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, milestone.projectId));

  if (!project) {
    throw new Error("Project not found");
  }

  // Calculate amount based on project budget or default
  const milestoneAmount = project.budgetAmount
    ? Math.round(project.budgetAmount / 4) // Default to 25% of project budget
    : 50000; // Default $500

  // Create line item
  const lineItems: InvoiceLineItem[] = [
    {
      description: `${project.name} - ${milestone.name}`,
      quantity: 1,
      unitPrice: milestoneAmount,
    },
  ];

  return createInvoice({
    workspaceId: params.workspaceId,
    projectId: project.id,
    clientId: params.clientId,
    createdBy: params.createdBy,
    lineItems,
    dueInDays: params.dueInDays || 30,
  });
}

/**
 * Generate invoice from task completion
 */
export async function generateInvoiceFromTasks(params: {
  taskIds: string[];
  clientId: string;
  workspaceId: string;
  projectId: string;
  createdBy: string;
  hourlyRate?: number;
  dueInDays?: number;
}) {
  const { taskIds, hourlyRate = 10000 } = params; // Default $100/hour

  // Get tasks with time tracking
  const tasksData = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.projectId, params.projectId)));

  const relevantTasks = tasksData.filter((t) => taskIds.includes(t.id));

  // Create line items from tasks
  const lineItems: InvoiceLineItem[] = relevantTasks.map((task) => ({
    description: `${task.title} (${task.actualHours || 0} hours)`,
    quantity: task.actualHours || 0,
    unitPrice: hourlyRate,
  }));

  if (lineItems.length === 0) {
    throw new Error("No billable tasks found");
  }

  return createInvoice({
    workspaceId: params.workspaceId,
    projectId: params.projectId,
    clientId: params.clientId,
    createdBy: params.createdBy,
    lineItems,
    dueInDays: params.dueInDays || 30,
  });
}

/**
 * Create invoice with line items
 */
async function createInvoice(params: {
  workspaceId: string;
  projectId: string;
  clientId: string;
  createdBy: string;
  lineItems: InvoiceLineItem[];
  dueInDays: number;
  taxRate?: number;
}) {
  const { taxRate = 0 } = params;

  // Calculate totals
  const subtotal = params.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = Math.round((subtotal * taxRate) / 10000);
  const total = subtotal + taxAmount;

  // Create invoice
  const invoiceNumber = generateInvoiceNumber();
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + params.dueInDays);

  const [invoice] = await db
    .insert(invoices)
    .values({
      invoiceNumber,
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      clientId: params.clientId,
      status: "DRAFT",
      subtotal,
      taxRate,
      taxAmount,
      total,
      currency: "USD",
      issueDate,
      dueDate,
      createdBy: params.createdBy,
    })
    .returning();

  // Create line items
  await db.insert(invoiceLineItems).values(
    params.lineItems.map((item, idx) => ({
      invoiceId: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice,
      order: idx,
    }))
  );

  return invoice;
}

/**
 * Auto-generate recurring invoices
 * This can be run as a cron job
 */
export async function generateRecurringInvoices() {
  // Get all projects with recurring billing
  // This would need additional schema fields to track recurring settings
  // For now, this is a placeholder for the cron job logic

  console.log("Running recurring invoice generation...");

  // Example logic:
  // 1. Find projects with recurring billing enabled
  // 2. Check if invoice is due based on billing cycle
  // 3. Generate invoice automatically
  // 4. Send notification to client

  return {
    generated: 0,
    message: "Recurring invoice generation completed",
  };
}
