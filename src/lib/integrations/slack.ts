/**
 * Slack Integration
 * Send messages and notifications to Slack channels
 */

interface SlackMessage {
  text: string;
  channel?: string;
  username?: string;
  icon_emoji?: string;
  attachments?: Array<{
    color?: string;
    title?: string;
    text?: string;
    fields?: Array<{
      title: string;
      value: string;
      short?: boolean;
    }>;
  }>;
}

export class SlackIntegration {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  /**
   * Send a message to Slack
   */
  async sendMessage(message: SlackMessage): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error("Slack send error:", error);
      return false;
    }
  }

  /**
   * Send project update notification
   */
  async notifyProjectUpdate(data: {
    projectName: string;
    status: string;
    updatedBy: string;
    projectUrl: string;
  }): Promise<boolean> {
    return this.sendMessage({
      text: `Project "${data.projectName}" has been updated`,
      attachments: [
        {
          color: "#0070f3",
          title: data.projectName,
          fields: [
            {
              title: "Status",
              value: data.status,
              short: true,
            },
            {
              title: "Updated By",
              value: data.updatedBy,
              short: true,
            },
          ],
        },
      ],
    });
  }

  /**
   * Send task assigned notification
   */
  async notifyTaskAssigned(data: {
    taskTitle: string;
    assignedTo: string;
    projectName: string;
    taskUrl: string;
  }): Promise<boolean> {
    return this.sendMessage({
      text: `New task assigned: ${data.taskTitle}`,
      attachments: [
        {
          color: "#10b981",
          title: data.taskTitle,
          fields: [
            {
              title: "Assigned To",
              value: data.assignedTo,
              short: true,
            },
            {
              title: "Project",
              value: data.projectName,
              short: true,
            },
          ],
        },
      ],
    });
  }
}

/**
 * Initialize Slack integration from workspace settings
 */
export async function initSlackIntegration(
  workspaceId: string
): Promise<SlackIntegration | null> {
  // In production, fetch from database
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return null;
  }

  return new SlackIntegration(webhookUrl);
}

