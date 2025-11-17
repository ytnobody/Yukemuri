import { test } from "node:test"
import assert from "node:assert"
import { EmailManager, type EmailConfig } from "../src/manager"
import { TemplateEngine } from "../src/templates"
import { EmailValidator, EmailRateLimiter, EmailQueue, EmailFormatter } from "../src/utils"

test("Integration - Complete email workflow", async t => {
  // Initialize manager and engine
  const manager = new EmailManager()
  const engine = new TemplateEngine()

  const config: EmailConfig = {
    provider: "smtp",
    from: "noreply@example.com",
    replyTo: "support@example.com",
    smtpConfig: {
      host: "localhost",
      port: 1025,
      secure: false,
      auth: { user: "test", pass: "test" },
    },
  }

  // Connect
  await manager.connect(config)
  assert.ok(manager.isConnected(), "Should be connected")

  // Validate email
  const email = "user@example.com"
  assert.ok(EmailValidator.isValid(email), "Email should be valid")

  // Format recipient
  const formatted = EmailFormatter.formatRecipient(email, "John Doe")
  assert.ok(formatted.includes("John Doe"), "Recipient should be formatted")

  // Send template
  const result = await manager.sendWithTemplate({ email, name: "John Doe" }, "welcome", {
    firstName: "John",
    appName: "MyApp",
    dashboardUrl: "https://myapp.com/dashboard",
  })

  assert.ok(result.success, "Email should be sent")

  // Cleanup
  await manager.disconnect()
  assert.ok(!manager.isConnected(), "Should be disconnected")
})

test("Integration - Batch send with rate limiting", async t => {
  const manager = new EmailManager()
  const limiter = new EmailRateLimiter()
  const queue = new EmailQueue()

  const config: EmailConfig = {
    provider: "sendgrid",
    from: "noreply@example.com",
    sendgridConfig: {
      apiKey: "SG.test-key",
    },
  }

  await manager.connect(config)

  // Validate emails
  const recipients = [
    "user1@example.com",
    "user2@example.com",
    "invalid-email",
    "user3@example.com",
  ]

  const { valid, invalid } = EmailValidator.validateList(recipients)
  assert.equal(valid.length, 3, "Should have 3 valid emails")
  assert.equal(invalid.length, 1, "Should have 1 invalid email")

  // Check rate limits and queue
  for (const email of valid) {
    if (limiter.canSend(email, 2, 1000)) {
      queue.add({
        to: { email },
        subject: "Batch Email",
        html: "<p>Test</p>",
      })
    }
  }

  assert.equal(queue.size(), 3, "Should have 3 queued emails")

  // Process queue
  let sent = 0
  await queue.process(async () => {
    sent++
    return true
  })

  assert.equal(sent, 3, "Should process all 3 emails")
  assert.equal(queue.size(), 0, "Queue should be empty")

  await manager.disconnect()
})

test("Integration - Multiple providers", async t => {
  const managers = {
    smtp: new EmailManager(),
    sendgrid: new EmailManager(),
    mailgun: new EmailManager(),
  }

  // Initialize each provider
  await managers.smtp.connect({
    provider: "smtp",
    from: "noreply@example.com",
    smtpConfig: {
      host: "localhost",
      port: 1025,
      secure: false,
      auth: { user: "test", pass: "test" },
    },
  })

  await managers.sendgrid.connect({
    provider: "sendgrid",
    from: "noreply@example.com",
    sendgridConfig: {
      apiKey: "SG.test-key",
    },
  })

  await managers.mailgun.connect({
    provider: "mailgun",
    from: "noreply@example.com",
    mailgunConfig: {
      apiKey: "key-test",
      domain: "mg.example.com",
    },
  })

  // Verify all connected
  assert.ok(managers.smtp.isConnected(), "SMTP should be connected")
  assert.ok(managers.sendgrid.isConnected(), "SendGrid should be connected")
  assert.ok(managers.mailgun.isConnected(), "Mailgun should be connected")

  // Send with each provider
  const result1 = await managers.smtp.send({
    to: { email: "user@example.com" },
    subject: "SMTP Test",
    html: "<p>Test</p>",
  })

  const result2 = await managers.sendgrid.send({
    to: { email: "user@example.com" },
    subject: "SendGrid Test",
    html: "<p>Test</p>",
  })

  const result3 = await managers.mailgun.send({
    to: { email: "user@example.com" },
    subject: "Mailgun Test",
    html: "<p>Test</p>",
  })

  assert.ok(result1.success, "SMTP send should succeed")
  assert.ok(result2.success, "SendGrid send should succeed")
  assert.ok(result3.success, "Mailgun send should succeed")

  // Cleanup
  await managers.smtp.disconnect()
  await managers.sendgrid.disconnect()
  await managers.mailgun.disconnect()
})

test("Integration - Template rendering with validation", async t => {
  const engine = new TemplateEngine()
  const validator = new EmailValidator()

  // Get template
  const template = engine.get("resetPassword")
  assert.ok(template, "Template should exist")

  // Validate variables
  const variables = {
    firstName: "Alice",
    appName: "TestApp",
    resetLink: "https://example.com/reset?token=abc123",
    expiryTime: "24",
  }

  // Check all required variables present
  const missingVars = template!.variables.filter(v => !(v in variables))
  assert.equal(missingVars.length, 0, "All variables should be provided")

  // Render
  const result = engine.render("resetPassword", variables)

  assert.ok(result.subject, "Subject should be rendered")
  assert.ok(result.html, "HTML should be rendered")
  assert.ok(!result.subject.includes("{{"), "Subject should not have variables")
  assert.ok(!result.html.includes("{{"), "HTML should not have variables")
})

test("Integration - Queue with custom template", async t => {
  const manager = new EmailManager()
  const engine = new TemplateEngine()
  const queue = new EmailQueue()

  // Register custom template
  engine.register({
    name: "customNotification",
    subject: "Notification from {{appName}}",
    html: "<h1>{{title}}</h1><p>{{message}}</p>",
    text: "{{title}}\n{{message}}",
    variables: ["appName", "title", "message"],
  })

  const config: EmailConfig = {
    provider: "smtp",
    from: "noreply@example.com",
    smtpConfig: {
      host: "localhost",
      port: 1025,
      secure: false,
      auth: { user: "test", pass: "test" },
    },
  }

  await manager.connect(config)

  // Queue multiple custom template emails
  const recipients = ["user1@example.com", "user2@example.com", "user3@example.com"]

  for (const email of recipients) {
    const template = engine.render("customNotification", {
      appName: "MyApp",
      title: "Important Update",
      message: "We have an update for you",
    })

    queue.add({
      to: { email },
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  assert.equal(queue.size(), 3, "Should have 3 emails in queue")

  // Process and verify
  let processed = 0
  await queue.process(async message => {
    processed++
    assert.ok(message.subject.includes("MyApp"), "Subject should be substituted")
    return true
  })

  assert.equal(processed, 3, "Should process all emails")

  await manager.disconnect()
})

test("Integration - Rate limit with per-template quotas", async t => {
  const limiter = new EmailRateLimiter()

  // Different quotas for different user types
  const premiumUser = "premium@example.com"
  const freeUser = "free@example.com"

  // Premium user: 1000 emails/hour
  for (let i = 0; i < 50; i++) {
    assert.ok(limiter.canSend(premiumUser, 1000, 3600000), "Premium user should have high limit")
  }

  // Free user: 10 emails/hour
  for (let i = 0; i < 10; i++) {
    assert.ok(limiter.canSend(freeUser, 10, 3600000), "Free user should reach limit")
  }

  assert.ok(!limiter.canSend(freeUser, 10, 3600000), "Free user should be rate limited")
  assert.ok(limiter.canSend(premiumUser, 1000, 3600000), "Premium user should not be affected")
})

test("Integration - Error handling across components", async t => {
  const manager = new EmailManager()
  const engine = new TemplateEngine()

  // Attempt to use nonexistent template
  try {
    engine.render("nonexistent", {})
    assert.fail("Should throw error")
  } catch (error) {
    assert.ok(error instanceof Error, "Should be Error instance")
  }

  // Attempt to send without connection
  let errorThrown = false
  try {
    await manager.send({
      to: { email: "user@example.com" },
      subject: "Test",
      html: "<p>Test</p>",
    })
  } catch (error) {
    errorThrown = true
    assert.ok(error instanceof Error, "Should throw Error instance")
  }

  assert.ok(errorThrown, "Should throw error without connection")

  // Attempt invalid config
  try {
    await manager.connect({
      provider: "unknown" as any,
      from: "test@example.com",
    })
    assert.fail("Should throw error")
  } catch (error) {
    assert.ok(error instanceof Error, "Should throw Error")
  }
})

test("Integration - Full workflow: User registration with welcome email", async t => {
  // Simulate user registration
  const user = {
    email: "newuser@example.com",
    name: "New User",
    firstName: "New",
  }

  // Step 1: Validate email
  const isValidEmail = EmailValidator.isValid(user.email)
  assert.ok(isValidEmail, "User email should be valid")

  // Step 2: Initialize email service
  const manager = new EmailManager()
  const engine = new TemplateEngine()

  const config: EmailConfig = {
    provider: "smtp",
    from: "noreply@example.com",
    smtpConfig: {
      host: "localhost",
      port: 1025,
      secure: false,
      auth: { user: "test", pass: "test" },
    },
  }

  await manager.connect(config)

  // Step 3: Check rate limit
  const limiter = new EmailRateLimiter()
  assert.ok(limiter.canSend(user.email, 5, 3600000), "Should be able to send")

  // Step 4: Send welcome email
  const result = await manager.sendWithTemplate({ email: user.email, name: user.name }, "welcome", {
    firstName: user.firstName,
    appName: "MyAwesomeApp",
    dashboardUrl: "https://myapp.com/dashboard",
  })

  assert.ok(result.success, "Welcome email should be sent")
  assert.ok(result.messageId, "Should have message ID")

  // Step 5: Cleanup
  await manager.disconnect()
})
