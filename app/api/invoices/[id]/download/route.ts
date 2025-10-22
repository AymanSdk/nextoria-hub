import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { invoices, invoiceLineItems, users, clients, projects } from "@/src/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";

/**
 * GET /api/invoices/[id]/download
 * Download invoice as HTML (for now, can be extended to PDF)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch invoice
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check permissions for CLIENT role
    if (session.user.role === "CLIENT") {
      const [clientRecord] = await db
        .select()
        .from(clients)
        .where(eq(clients.email, session.user.email || ""))
        .limit(1);

      if (clientRecord) {
        const clientProjects = await db
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.clientId, clientRecord.id));

        const projectIds = clientProjects.map((p) => p.id);
        const hasAccess =
          invoice.clientId === clientRecord.id ||
          (invoice.projectId && projectIds.includes(invoice.projectId));

        if (!hasAccess) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Fetch line items
    const lineItems = await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, id));

    // Fetch client info
    const [client] = await db
      .select()
      .from(users)
      .where(eq(users.id, invoice.clientId))
      .limit(1);

    // Fetch project info if exists
    let project = null;
    if (invoice.projectId) {
      [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, invoice.projectId))
        .limit(1);
    }

    // Fetch creator info
    const [creator] = await db
      .select()
      .from(users)
      .where(eq(users.id, invoice.createdBy))
      .limit(1);

    // Generate HTML invoice
    const html = generateInvoiceHTML({
      invoice,
      lineItems,
      client,
      creator,
      project,
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.html"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate invoice" },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(data: {
  invoice: any;
  lineItems: any[];
  client: any;
  creator: any;
  project: any;
}) {
  const { invoice, lineItems, client, creator, project } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        
        .company-info {
            flex: 1;
        }
        
        .invoice-info {
            text-align: right;
        }
        
        .invoice-number {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            ${getStatusStyle(invoice.status)}
        }
        
        .parties {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .party {
            flex: 1;
        }
        
        .party h3 {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        
        .party p {
            margin: 5px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        
        thead {
            background: #f5f5f5;
        }
        
        th {
            text-align: left;
            padding: 12px;
            font-weight: 600;
            border-bottom: 2px solid #ddd;
        }
        
        th:last-child,
        td:last-child {
            text-align: right;
        }
        
        td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        
        .totals {
            margin-top: 30px;
            margin-left: auto;
            width: 300px;
        }
        
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        
        .totals-row.total {
            font-size: 20px;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 15px;
            margin-top: 10px;
        }
        
        .notes {
            margin-top: 40px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 4px;
        }
        
        .notes h3 {
            margin-bottom: 10px;
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
        }
        
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1>${creator?.name || "Your Company"}</h1>
            <p>${creator?.email || ""}</p>
        </div>
        <div class="invoice-info">
            <div class="invoice-number">INVOICE</div>
            <div>${invoice.invoiceNumber}</div>
            <div class="status">${invoice.status}</div>
        </div>
    </div>
    
    <div class="parties">
        <div class="party">
            <h3>Bill To:</h3>
            <p><strong>${client?.name || "Client"}</strong></p>
            <p>${client?.email || ""}</p>
        </div>
        <div class="party" style="text-align: right;">
            <p><strong>Issue Date:</strong> ${new Date(
              invoice.issueDate
            ).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(
              invoice.dueDate
            ).toLocaleDateString()}</p>
            ${project ? `<p><strong>Project:</strong> ${project.name}</p>` : ""}
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: center;">Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${lineItems
              .map(
                (item) => `
                <tr>
                    <td>${item.description}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td>$${(item.unitPrice / 100).toFixed(2)}</td>
                    <td>$${(item.amount / 100).toFixed(2)}</td>
                </tr>
            `
              )
              .join("")}
        </tbody>
    </table>
    
    <div class="totals">
        <div class="totals-row">
            <span>Subtotal:</span>
            <span>$${(invoice.subtotal / 100).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</span>
        </div>
        ${
          invoice.taxRate && invoice.taxRate > 0
            ? `
        <div class="totals-row">
            <span>Tax (${(invoice.taxRate / 100).toFixed(2)}%):</span>
            <span>$${((invoice.taxAmount || 0) / 100).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</span>
        </div>
        `
            : ""
        }
        <div class="totals-row total">
            <span>Total:</span>
            <span>$${(invoice.total / 100).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ${invoice.currency}</span>
        </div>
    </div>
    
    ${
      invoice.notes
        ? `
    <div class="notes">
        <h3>Notes:</h3>
        <p>${invoice.notes.replace(/\n/g, "<br>")}</p>
    </div>
    `
        : ""
    }
    
    ${
      invoice.terms
        ? `
    <div class="notes">
        <h3>Terms & Conditions:</h3>
        <p>${invoice.terms.replace(/\n/g, "<br>")}</p>
    </div>
    `
        : ""
    }
    
    <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <script>
        // Auto-print on load (optional)
        // window.onload = function() { window.print(); }
    </script>
</body>
</html>
`;
}

function getStatusStyle(status: string): string {
  switch (status) {
    case "PAID":
      return "background: #10b981; color: white;";
    case "SENT":
      return "background: #3b82f6; color: white;";
    case "OVERDUE":
      return "background: #ef4444; color: white;";
    case "DRAFT":
      return "background: #6b7280; color: white;";
    case "VIEWED":
      return "background: #f59e0b; color: white;";
    case "CANCELLED":
      return "background: #991b1b; color: white;";
    default:
      return "background: #6b7280; color: white;";
  }
}
