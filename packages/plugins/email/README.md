# Email Plugin for Yukemuri

A powerful email plugin for Yukemuri that supports multiple email providers (SMTP, SendGrid, Mailgun) with template support, rate limiting, and batch operations.

## Features

- **Multi-Provider Support**: SMTP, SendGrid, and Mailgun
- **Email Templates**: Built-in welcome, password reset, and email verification templates
- **Template Variables**: Easy template variable substitution
- **Rate Limiting**: Prevent email spam with configurable rate limits
- **Batch Operations**: Queue and process emails in batches
- **Validation**: Email address validation and formatting
- **Health Checks**: Monitor email service health
- **Error Handling**: Robust error handling with retry logic
- **Type-Safe**: Full TypeScript support
- **Attachments**: Support for file attachments
- **Rich Emails**: HTML and plain text support

## Installation

```bash
# Using pnpm (recommended)
pnpm add @yukemuri/plugin-email

# Using npm
npm install @yukemuri/plugin-email
```

## Configuration

### SMTP Provider

```typescript
import { emailPlugin } from '@yukemuri/plugin-email';

app.use(emailPlugin, {
  provider: 'smtp',
  from: 'noreply@example.com',
  replyTo: 'support@example.com',
  smtpConfig: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  }
});
```

### SendGrid Provider

```typescript
app.use(emailPlugin, {
  provider: 'sendgrid',
  from: 'noreply@example.com',
  replyTo: 'support@example.com',
  sendgridConfig: {
    apiKey: process.env.SENDGRID_API_KEY
  }
});
```

### Mailgun Provider

```typescript
app.use(emailPlugin, {
  provider: 'mailgun',
  from: 'noreply@example.com',
  replyTo: 'support@example.com',
  mailgunConfig: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: 'mg.example.com'
  }
});
```

## Configuration Options

### EmailConfig

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `provider` | 'smtp' \| 'sendgrid' \| 'mailgun' | Yes | Email service provider |
| `from` | string | Yes | Default "from" email address |
| `replyTo` | string | No | Default "reply-to" email address |
| `smtpConfig` | SMTPConfig | Conditional | SMTP configuration (required if provider is 'smtp') |
| `sendgridConfig` | SendGridConfig | Conditional | SendGrid config (required if provider is 'sendgrid') |
| `mailgunConfig` | MailgunConfig | Conditional | Mailgun config (required if provider is 'mailgun') |

## Usage

### Basic Email Sending

```typescript
import { useEmail } from '@yukemuri/plugin-email';

// Access email manager from app context
const emailManager = (app as any).email;

// Send simple email
const result = await emailManager.send({
  to: { email: 'user@example.com', name: 'John Doe' },
  subject: 'Hello from Yukemuri',
  html: '<h1>Welcome!</h1>',
  text: 'Welcome!'
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Failed to send email:', result.error);
}
```

### Sending to Multiple Recipients

```typescript
const result = await emailManager.send({
  to: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' }
  ],
  cc: [{ email: 'cc@example.com' }],
  bcc: [{ email: 'bcc@example.com' }],
  subject: 'Bulk email',
  html: '<p>This email sent to multiple recipients</p>'
});
```

### Using Templates

#### Built-in Templates

The plugin includes three built-in templates:

**1. Welcome Email**

```typescript
const result = await emailManager.sendWithTemplate(
  { email: 'user@example.com', name: 'John Doe' },
  'welcome',
  {
    firstName: 'John',
    appName: 'MyApp',
    dashboardUrl: 'https://myapp.com/dashboard'
  }
);
```

**2. Password Reset Email**

```typescript
const result = await emailManager.sendWithTemplate(
  { email: 'user@example.com', name: 'John Doe' },
  'resetPassword',
  {
    firstName: 'John',
    appName: 'MyApp',
    resetLink: 'https://myapp.com/reset?token=abc123',
    expiryTime: '24'
  }
);
```

**3. Email Verification**

```typescript
const result = await emailManager.sendWithTemplate(
  { email: 'user@example.com', name: 'John Doe' },
  'verifyEmail',
  {
    firstName: 'John',
    appName: 'MyApp',
    verifyLink: 'https://myapp.com/verify?token=abc123',
    expiryTime: '24'
  }
);
```

#### Custom Templates

```typescript
const templateEngine = (app as any).emailTemplates;

// Register custom template
templateEngine.register({
  name: 'orderConfirmation',
  subject: 'Order Confirmation - {{orderId}}',
  html: `
    <h1>Thank you for your order!</h1>
    <p>Order ID: {{orderId}}</p>
    <p>Total: {{total}}</p>
    <p><a href="{{trackingUrl}}">Track your order</a></p>
  `,
  text: 'Order ID: {{orderId}}, Total: {{total}}, Tracking: {{trackingUrl}}',
  variables: ['orderId', 'total', 'trackingUrl']
});

// Use custom template
const result = await emailManager.sendWithTemplate(
  { email: 'customer@example.com' },
  'orderConfirmation',
  {
    orderId: 'ORD-12345',
    total: '$99.99',
    trackingUrl: 'https://myapp.com/track/ORD-12345'
  }
);
```

### Email with Attachments

```typescript
const result = await emailManager.send({
  to: { email: 'user@example.com' },
  subject: 'Document attached',
  html: '<p>Please see attached document</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: Buffer.from(pdfData),
      contentType: 'application/pdf'
    }
  ]
});
```

### Batch Email Operations

```typescript
import { EmailQueue } from '@yukemuri/plugin-email';

const queue = new EmailQueue();

// Add emails to queue
for (let i = 0; i < 1000; i++) {
  queue.add({
    to: { email: `user${i}@example.com` },
    subject: 'Newsletter',
    html: '<p>Weekly Newsletter</p>'
  });
}

// Process queue with retries
await queue.process(async (message) => {
  const result = await emailManager.send(message);
  return result.success;
});
```

### Rate Limiting

```typescript
import { EmailRateLimiter } from '@yukemuri/plugin-email';

const rateLimiter = new EmailRateLimiter();

// Check if user can send email
const canSend = rateLimiter.canSend(userId, 10, 3600000); // 10 emails per hour

if (canSend) {
  await emailManager.send(message);
} else {
  console.warn('Rate limit exceeded for user:', userId);
}

// Check remaining quota
const remaining = rateLimiter.getRemaining(userId, 10);
console.log(`Remaining emails this hour: ${remaining}`);
```

### Email Validation

```typescript
import { EmailValidator } from '@yukemuri/plugin-email';

// Validate single email
const isValid = EmailValidator.isValid('user@example.com');

// Validate list
const { valid, invalid } = EmailValidator.validateList([
  'valid@example.com',
  'invalid-email',
  'another@example.com'
]);

console.log('Valid:', valid);
console.log('Invalid:', invalid);

// Normalize email
const normalized = EmailValidator.normalize('  USER@EXAMPLE.COM  ');
// Result: 'user@example.com'
```

### Email Formatting

```typescript
import { EmailFormatter, AttachmentHelper } from '@yukemuri/plugin-email';

// Format recipient
const formatted = EmailFormatter.formatRecipient('user@example.com', 'John Doe');
// Result: 'John Doe <user@example.com>'

// Format multiple recipients
const recipients = EmailFormatter.formatRecipients([
  { email: 'user1@example.com', name: 'User 1' },
  { email: 'user2@example.com' }
]);

// Convert HTML to plain text
const plainText = EmailFormatter.htmlToText('<h1>Hello</h1><p>World</p>');
// Result: 'Hello\nWorld'

// Escape HTML
const escaped = EmailFormatter.escapeHtml('<script>alert("xss")</script>');
```

## API Endpoints

The plugin automatically registers the following endpoints:

### Health Check

```http
GET /api/health/email
```

Response:
```json
{
  "status": "healthy",
  "provider": "sendgrid",
  "from": "noreply@example.com"
}
```

### Send Email

```http
POST /api/email/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Hello",
  "html": "<p>Hello World</p>",
  "text": "Hello World"
}
```

Response:
```json
{
  "success": true,
  "messageId": "<12345@sendgrid>"
}
```

### Send Template Email

```http
POST /api/email/send-template
Content-Type: application/json

{
  "to": "user@example.com",
  "templateName": "welcome",
  "variables": {
    "firstName": "John",
    "appName": "MyApp",
    "dashboardUrl": "https://myapp.com"
  }
}
```

### List Templates

```http
GET /api/email/templates
```

Response:
```json
{
  "templates": ["welcome", "resetPassword", "verifyEmail"]
}
```

## Type Definitions

### EmailMessage

```typescript
interface EmailMessage {
  to: EmailRecipient | EmailRecipient[];
  cc?: EmailRecipient | EmailRecipient[];
  bcc?: EmailRecipient | EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
  headers?: Record<string, string>;
}
```

### EmailRecipient

```typescript
interface EmailRecipient {
  email: string;
  name?: string;
}
```

### EmailAttachment

```typescript
interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}
```

### EmailSendResult

```typescript
interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
```

## Best Practices

### 1. Use Environment Variables

```typescript
// ✅ Good
const config = {
  provider: process.env.EMAIL_PROVIDER as 'smtp' | 'sendgrid' | 'mailgun',
  from: process.env.EMAIL_FROM,
  sendgridConfig: {
    apiKey: process.env.SENDGRID_API_KEY
  }
};

// ❌ Bad
const config = {
  provider: 'sendgrid',
  from: 'noreply@example.com',
  sendgridConfig: {
    apiKey: 'SG.xxxxxxxxxxxxx'
  }
};
```

### 2. Validate Email Addresses

```typescript
// ✅ Good
const { valid, invalid } = EmailValidator.validateList(emails);
if (invalid.length > 0) {
  console.warn('Invalid emails removed:', invalid);
}
await sendEmailsToList(valid);

// ❌ Bad - might fail with invalid addresses
await sendEmailsToList(emails);
```

### 3. Use Templates for Dynamic Content

```typescript
// ✅ Good
await emailManager.sendWithTemplate(user.email, 'welcome', {
  firstName: user.name,
  appName: 'MyApp'
});

// ❌ Bad - hard to maintain
const html = `<h1>Welcome ${user.name}!</h1>`;
await emailManager.send({ to: user.email, html });
```

### 4. Handle Errors Gracefully

```typescript
// ✅ Good
const result = await emailManager.send(message);
if (!result.success) {
  console.error('Email send failed:', result.error);
  // Retry or notify user
}

// ❌ Bad - unhandled errors
await emailManager.send(message);
```

### 5. Rate Limit User Actions

```typescript
// ✅ Good
const limiter = new EmailRateLimiter();
if (!limiter.canSend(userId, 5, 3600000)) {
  return c.json({ error: 'Too many emails sent' }, 429);
}

// ❌ Bad - allows unlimited emails
await emailManager.send(message);
```

### 6. Use Batch Processing for Bulk Emails

```typescript
// ✅ Good
const queue = new EmailQueue();
users.forEach(user => queue.add({ to: user.email, subject: 'Newsletter' }));
await queue.process(emailManager.send.bind(emailManager));

// ❌ Bad - might overwhelm the service
for (const user of users) {
  await emailManager.send({ to: user.email, subject: 'Newsletter' });
}
```

## Troubleshooting

### SMTP Authentication Failed

**Problem**: "SMTP authentication failed"

**Solution**:
1. Verify SMTP credentials
2. Check if "Less secure app access" is enabled (for Gmail)
3. Use app-specific passwords instead of main password

```typescript
smtpConfig: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-specific-password' // Not your main password
  }
}
```

### SendGrid API Key Invalid

**Problem**: "Invalid API key"

**Solution**:
1. Verify the API key from SendGrid dashboard
2. Check if API key has proper permissions
3. Ensure key hasn't expired

```typescript
sendgridConfig: {
  apiKey: process.env.SENDGRID_API_KEY // Should start with 'SG.'
}
```

### Rate Limit Exceeded

**Problem**: "Too many emails sent"

**Solution**:
1. Increase rate limit window
2. Implement queue-based sending
3. Contact email provider for limit increase

```typescript
// Increase to 100 emails per hour
const canSend = rateLimiter.canSend(userId, 100, 3600000);
```

### Template Variables Missing

**Problem**: "Missing template variables"

**Solution**:
1. Ensure all required variables are provided
2. Check template variable names

```typescript
// Check available templates
const templates = templateEngine.list();
console.log(templates); // ['welcome', 'resetPassword', 'verifyEmail']

// Provide all required variables
await emailManager.sendWithTemplate(to, 'welcome', {
  firstName: 'John',   // Required
  appName: 'MyApp',    // Required
  dashboardUrl: 'https://myapp.com' // Required
});
```

## Examples

### Welcome Email on User Registration

```typescript
app.post('/api/users/register', async (c) => {
  const body = await c.req.json();
  
  // Create user...
  const user = createUser(body);
  
  // Send welcome email
  const result = await emailManager.sendWithTemplate(
    { email: user.email, name: user.name },
    'welcome',
    {
      firstName: user.name.split(' ')[0],
      appName: 'MyApp',
      dashboardUrl: `${process.env.APP_URL}/dashboard`
    }
  );
  
  return c.json({ user, emailSent: result.success });
});
```

### Password Reset Email

```typescript
app.post('/api/auth/reset-password', async (c) => {
  const { email } = await c.req.json();
  
  const user = findUserByEmail(email);
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  // Generate reset token
  const token = generateResetToken(user.id);
  
  // Send reset email
  await emailManager.sendWithTemplate(
    { email: user.email, name: user.name },
    'resetPassword',
    {
      firstName: user.name.split(' ')[0],
      appName: 'MyApp',
      resetLink: `${process.env.APP_URL}/reset?token=${token}`,
      expiryTime: '24'
    }
  );
  
  return c.json({ message: 'Password reset email sent' });
});
```

### Newsletter Batch Send

```typescript
app.post('/api/newsletter/send', async (c) => {
  const { subject, html } = await c.req.json();
  
  // Get all subscribers
  const subscribers = getNewsletterSubscribers();
  
  // Create queue and add emails
  const queue = new EmailQueue();
  for (const subscriber of subscribers) {
    queue.add({
      to: { email: subscriber.email, name: subscriber.name },
      subject,
      html
    });
  }
  
  // Process in background
  queue.process(emailManager.send.bind(emailManager)).catch(console.error);
  
  return c.json({ queued: subscribers.length });
});
```

## Performance Considerations

1. **Batch Processing**: Use EmailQueue for large recipient lists
2. **Rate Limiting**: Implement rate limiting to avoid overwhelming the service
3. **Caching**: Cache rendered templates
4. **Async**: Always use async email sending to avoid blocking
5. **Connection Pooling**: Reuse email connections when possible

## Security Considerations

1. **API Keys**: Store in environment variables, never hardcode
2. **HTML Sanitization**: Sanitize user-generated HTML content
3. **Email Validation**: Validate email addresses before sending
4. **Rate Limiting**: Prevent abuse and spam
5. **Data Privacy**: Comply with GDPR/CCPA requirements
6. **TLS/SSL**: Always use secure connections (TLS for SMTP)

## Support

For issues or questions about the email plugin:

- Check the [Yukemuri documentation](../core/README.md)
- Open an issue on GitHub
- Check plugin examples for common patterns

## License

MIT License - See LICENSE file for details
