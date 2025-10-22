import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@nextoriahub.com",
      ...options,
    });
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

/**
 * Send task assigned notification
 */
export async function sendTaskAssignedEmail(data: {
  to: string;
  assigneeName: string;
  taskTitle: string;
  projectName: string;
  taskUrl: string;
}): Promise<boolean> {
  return sendEmail({
    to: data.to,
    subject: `New task assigned: ${data.taskTitle}`,
    html: `
      <h2>You've been assigned a new task</h2>
      <p>Hi ${data.assigneeName},</p>
      <p>You've been assigned to work on: <strong>${data.taskTitle}</strong></p>
      <p>Project: ${data.projectName}</p>
      <p><a href="${data.taskUrl}">View Task</a></p>
    `,
  });
}

/**
 * Send project invitation email
 */
export async function sendProjectInvitationEmail(data: {
  to: string;
  recipientName: string;
  projectName: string;
  invitedBy: string;
  acceptUrl: string;
}): Promise<boolean> {
  return sendEmail({
    to: data.to,
    subject: `You've been invited to ${data.projectName}`,
    html: `
      <h2>Project Invitation</h2>
      <p>Hi ${data.recipientName},</p>
      <p>${data.invitedBy} has invited you to collaborate on: <strong>${data.projectName}</strong></p>
      <p><a href="${data.acceptUrl}">Accept Invitation</a></p>
    `,
  });
}

/**
 * Send invoice email
 */
export async function sendInvoiceEmail(data: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  invoiceUrl: string;
}): Promise<boolean> {
  return sendEmail({
    to: data.to,
    subject: `Invoice ${data.invoiceNumber} from Nextoria Hub`,
    html: `
      <h2>New Invoice</h2>
      <p>Hi ${data.clientName},</p>
      <p>Invoice Number: <strong>${data.invoiceNumber}</strong></p>
      <p>Amount: $${(data.amount / 100).toFixed(2)}</p>
      <p>Due Date: ${data.dueDate.toLocaleDateString()}</p>
      <p><a href="${data.invoiceUrl}">View & Pay Invoice</a></p>
    `,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(data: {
  to: string;
  name: string;
}): Promise<boolean> {
  return sendEmail({
    to: data.to,
    subject: "Welcome to Nextoria Hub!",
    html: `
      <h2>Welcome to Nextoria Hub!</h2>
      <p>Hi ${data.name},</p>
      <p>Thanks for joining Nextoria Hub. We're excited to have you on board!</p>
      <p>Get started by:</p>
      <ul>
        <li>Creating your first project</li>
        <li>Inviting team members</li>
        <li>Exploring the dashboard</li>
      </ul>
    `,
  });
}

