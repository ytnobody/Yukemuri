/**
 * Email template definition
 */
export interface Template {
  name: string;
  subject: string;
  html: string;
  text?: string;
  variables: string[];
}

/**
 * Template engine for email rendering
 */
export class TemplateEngine {
  private templates: Map<string, Template> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  /**
   * Register default templates
   */
  private registerDefaultTemplates(): void {
    // Welcome email
    this.register({
      name: 'welcome',
      subject: 'Welcome to {{appName}}',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h1>Welcome {{firstName}}!</h1>
            <p>Thank you for joining <strong>{{appName}}</strong>.</p>
            <p>Your account has been successfully created.</p>
            <p>
              <a href="{{dashboardUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Go to Dashboard
              </a>
            </p>
            <p>Best regards,<br>The {{appName}} Team</p>
          </body>
        </html>
      `,
      text: `
        Welcome {{firstName}}!
        
        Thank you for joining {{appName}}.
        
        Your account has been successfully created.
        
        Go to Dashboard: {{dashboardUrl}}
        
        Best regards,
        The {{appName}} Team
      `,
      variables: ['firstName', 'appName', 'dashboardUrl']
    });

    // Password reset email
    this.register({
      name: 'resetPassword',
      subject: 'Reset your {{appName}} password',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h1>Password Reset Request</h1>
            <p>Hi {{firstName}},</p>
            <p>We received a request to reset your password.</p>
            <p>
              <a href="{{resetLink}}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Reset Password
              </a>
            </p>
            <p>This link will expire in {{expiryTime}} hours.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
          </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hi {{firstName}},
        
        We received a request to reset your password.
        
        Reset Password: {{resetLink}}
        
        This link will expire in {{expiryTime}} hours.
        
        If you did not request this, please ignore this email.
        
        Best regards,
        The {{appName}} Team
      `,
      variables: ['firstName', 'resetLink', 'expiryTime', 'appName']
    });

    // Email verification
    this.register({
      name: 'verifyEmail',
      subject: 'Verify your {{appName}} email',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h1>Email Verification</h1>
            <p>Hi {{firstName}},</p>
            <p>Please verify your email address to complete your account setup.</p>
            <p>
              <a href="{{verifyLink}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Verify Email
              </a>
            </p>
            <p>This link will expire in {{expiryTime}} hours.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
          </body>
        </html>
      `,
      text: `
        Email Verification
        
        Hi {{firstName}},
        
        Please verify your email address to complete your account setup.
        
        Verify Email: {{verifyLink}}
        
        This link will expire in {{expiryTime}} hours.
        
        Best regards,
        The {{appName}} Team
      `,
      variables: ['firstName', 'verifyLink', 'expiryTime', 'appName']
    });
  }

  /**
   * Register a new template
   */
  register(template: Template): void {
    this.templates.set(template.name, template);
  }

  /**
   * Get a template by name
   */
  get(name: string): Template | undefined {
    return this.templates.get(name);
  }

  /**
   * Render a template with variables
   */
  render(templateName: string, variables: Record<string, any>): { subject: string; html: string; text?: string } {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Validate variables
    const missingVars = template.variables.filter((v) => !(v in variables));
    if (missingVars.length > 0) {
      throw new Error(`Missing template variables: ${missingVars.join(', ')}`);
    }

    const subject = this.replaceVariables(template.subject, variables);
    const html = this.replaceVariables(template.html, variables);
    const text = template.text ? this.replaceVariables(template.text, variables) : undefined;

    return { subject, html, text };
  }

  /**
   * Replace variables in text
   */
  private replaceVariables(text: string, variables: Record<string, any>): string {
    let result = text;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * List all registered templates
   */
  list(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Check if template exists
   */
  exists(name: string): boolean {
    return this.templates.has(name);
  }
}
