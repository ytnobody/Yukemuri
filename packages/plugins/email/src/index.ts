import { EmailManager, type EmailConfig, type EmailMessage, type EmailSendResult } from "./manager"
import { TemplateEngine } from "./templates"

/**
 * Email plugin configuration schema
 */
const configSchema = {
  provider: {
    type: "string",
    required: true,
    description: "Email provider: smtp, sendgrid, or mailgun",
  },
  from: {
    type: "string",
    required: true,
    description: "From email address",
  },
  replyTo: {
    type: "string",
    required: false,
    description: "Reply-to email address",
  },
  smtpConfig: {
    type: "object",
    required: false,
    description: "SMTP configuration (when provider is smtp)",
  },
  sendgridConfig: {
    type: "object",
    required: false,
    description: "SendGrid configuration (when provider is sendgrid)",
  },
  mailgunConfig: {
    type: "object",
    required: false,
    description: "Mailgun configuration (when provider is mailgun)",
  },
}

/**
 * Default configuration
 */
const defaultConfig: Partial<EmailConfig> = {
  provider: "smtp",
  replyTo: undefined,
}

/**
 * Email plugin definition interface
 */
export interface EmailPluginDefinition {
  name: string
  version: string
  description: string
  configSchema: Record<string, any>
  defaultConfig: Partial<EmailConfig>
  init: (config: EmailConfig, app: any) => Promise<() => Promise<void>>
}

/**
 * Create email plugin
 */
export function createEmailPlugin(): EmailPluginDefinition {
  return {
    name: "@yukemuri/plugin-email",
    version: "1.0.0",
    description: "Email plugin for Yukemuri - Send emails via SMTP, SendGrid, or Mailgun",
    configSchema,
    defaultConfig,

    /**
     * Initialize email plugin
     */
    async init(config: EmailConfig, app: any) {
      const emailManager = new EmailManager()
      const templateEngine = new TemplateEngine()

      // Connect to email service
      await emailManager.connect(config)

      // Store email manager in app context
      ;(app as any).email = emailManager
      ;(app as any).emailTemplates = templateEngine

      // Add email health check endpoint
      app.get("/api/health/email", async (c: any) => {
        try {
          const isConnected = emailManager.isConnected()
          const emailConfig = emailManager.getConfig()
          return c.json({
            status: isConnected ? "healthy" : "disconnected",
            provider: emailConfig?.provider,
            from: emailConfig?.from,
          })
        } catch (error) {
          return c.json(
            {
              status: "error",
              message: error instanceof Error ? error.message : "Unknown error",
            },
            500
          )
        }
      })

      // Add email send endpoint for testing
      app.post("/api/email/send", async (c: any) => {
        try {
          const body = await c.req.json().catch(() => ({}))

          if (!body.to || !body.subject) {
            return c.json({ error: "Missing required fields: to, subject" }, 400)
          }

          const message: EmailMessage = {
            to: typeof body.to === "string" ? { email: body.to } : body.to,
            subject: body.subject,
            html: body.html,
            text: body.text,
          }

          const result = await emailManager.send(message)

          if (result.success) {
            return c.json({ success: true, messageId: result.messageId })
          } else {
            return c.json({ error: result.error }, 500)
          }
        } catch (error) {
          return c.json(
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
            500
          )
        }
      })

      // Add email template send endpoint
      app.post("/api/email/send-template", async (c: any) => {
        try {
          const body = await c.req.json().catch(() => ({}))

          if (!body.to || !body.templateName || !body.variables) {
            return c.json({ error: "Missing required fields: to, templateName, variables" }, 400)
          }

          const result = await emailManager.sendWithTemplate(
            typeof body.to === "string" ? { email: body.to } : body.to,
            body.templateName,
            body.variables,
            { cc: body.cc, bcc: body.bcc }
          )

          if (result.success) {
            return c.json({ success: true, messageId: result.messageId })
          } else {
            return c.json({ error: result.error }, 500)
          }
        } catch (error) {
          return c.json(
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
            500
          )
        }
      })

      // Add template list endpoint
      app.get("/api/email/templates", async (c: any) => {
        try {
          const templates = templateEngine.list()
          return c.json({ templates })
        } catch (error) {
          return c.json(
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
            500
          )
        }
      })

      /**
       * Cleanup on app shutdown
       */
      return async () => {
        await emailManager.disconnect()
      }
    },
  }
}

/**
 * Export singleton instance
 */
export const emailPlugin = createEmailPlugin()

/**
 * Export manager and types for external use
 */
export {
  EmailManager,
  type EmailConfig,
  type EmailMessage,
  type EmailSendResult,
  type EmailRecipient,
  type EmailAttachment,
} from "./manager"
export { TemplateEngine, type Template } from "./templates"

/**
 * Export plugin as default
 */
export default emailPlugin
