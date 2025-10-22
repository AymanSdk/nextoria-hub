/**
 * PDF Export Service
 * Generate PDF reports for invoices, projects, analytics
 */

import { jsPDF } from "jspdf";

/**
 * Generate invoice PDF
 */
export function generateInvoicePDF(invoice: {
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  clientName: string;
  clientEmail: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  workspaceName?: string;
  workspaceLogo?: string;
}) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.text("INVOICE", 20, 20);

  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 35);
  doc.text(`Issue Date: ${invoice.issueDate.toLocaleDateString()}`, 20, 42);
  doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, 20, 49);

  // Client info
  doc.setFontSize(12);
  doc.text("Bill To:", 20, 65);
  doc.setFontSize(10);
  doc.text(invoice.clientName, 20, 72);
  doc.text(invoice.clientEmail, 20, 79);

  // Company info (right side)
  if (invoice.workspaceName) {
    doc.setFontSize(12);
    doc.text(invoice.workspaceName, 140, 65, { align: "right" });
  }

  // Line items table
  let yPos = 100;
  doc.setFontSize(10);
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos, 170, 10, "F");

  // Table headers
  doc.text("Description", 25, yPos + 7);
  doc.text("Qty", 130, yPos + 7);
  doc.text("Price", 150, yPos + 7);
  doc.text("Amount", 170, yPos + 7);

  yPos += 15;

  // Line items
  invoice.lineItems.forEach((item) => {
    doc.text(item.description, 25, yPos);
    doc.text(item.quantity.toString(), 130, yPos);
    doc.text(`${(item.unitPrice / 100).toFixed(2)}`, 150, yPos);
    doc.text(`${(item.amount / 100).toFixed(2)}`, 170, yPos);
    yPos += 7;
  });

  // Totals
  yPos += 10;
  doc.text("Subtotal:", 130, yPos);
  doc.text(
    `${invoice.currency} ${(invoice.subtotal / 100).toFixed(2)}`,
    170,
    yPos
  );

  yPos += 7;
  doc.text(`Tax (${(invoice.taxRate / 100).toFixed(1)}%):`, 130, yPos);
  doc.text(
    `${invoice.currency} ${(invoice.taxAmount / 100).toFixed(2)}`,
    170,
    yPos
  );

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Total:", 130, yPos);
  doc.text(
    `${invoice.currency} ${(invoice.total / 100).toFixed(2)}`,
    170,
    yPos
  );

  // Footer
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text("Thank you for your business!", 105, 280, { align: "center" });

  return doc;
}

/**
 * Generate project report PDF
 */
export function generateProjectReportPDF(project: {
  name: string;
  description: string;
  status: string;
  startDate?: Date;
  dueDate?: Date;
  completedTasks: number;
  totalTasks: number;
  budget?: number;
  spent?: number;
  teamMembers: Array<{ name: string; role: string }>;
}) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text("Project Report", 20, 20);

  // Project info
  doc.setFontSize(14);
  doc.text(project.name, 20, 35);

  doc.setFontSize(10);
  doc.text(`Status: ${project.status}`, 20, 45);
  if (project.startDate) {
    doc.text(`Start Date: ${project.startDate.toLocaleDateString()}`, 20, 52);
  }
  if (project.dueDate) {
    doc.text(`Due Date: ${project.dueDate.toLocaleDateString()}`, 20, 59);
  }

  // Description
  if (project.description) {
    doc.text("Description:", 20, 70);
    const lines = doc.splitTextToSize(project.description, 170);
    doc.text(lines, 20, 77);
  }

  // Progress
  const yPos = project.description ? 100 : 80;
  doc.setFontSize(12);
  doc.text("Progress", 20, yPos);

  doc.setFontSize(10);
  const progress =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0;
  doc.text(
    `${project.completedTasks} of ${project.totalTasks} tasks completed (${progress}%)`,
    20,
    yPos + 7
  );

  // Budget (if available)
  if (project.budget) {
    doc.text("Budget", 20, yPos + 20);
    doc.text(
      `Budget: $${(project.budget / 100).toLocaleString()}`,
      20,
      yPos + 27
    );
    if (project.spent) {
      doc.text(
        `Spent: $${(project.spent / 100).toLocaleString()}`,
        20,
        yPos + 34
      );
    }
  }

  // Team members
  if (project.teamMembers.length > 0) {
    const teamYPos = yPos + 50;
    doc.setFontSize(12);
    doc.text("Team Members", 20, teamYPos);

    doc.setFontSize(10);
    project.teamMembers.forEach((member, idx) => {
      doc.text(`${member.name} (${member.role})`, 20, teamYPos + 10 + idx * 7);
    });
  }

  return doc;
}

/**
 * Download PDF
 */
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}
