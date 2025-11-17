import { test } from "node:test"
import assert from "node:assert"
import {
  EmailValidator,
  EmailRateLimiter,
  EmailQueue,
  EmailFormatter,
  AttachmentHelper,
} from "../src/utils"

// ========== EmailValidator Tests ==========

test("EmailValidator - Valid email", async t => {
  assert.ok(EmailValidator.isValid("user@example.com"), "Valid email should pass")
  assert.ok(EmailValidator.isValid("test.user@example.co.uk"), "Email with dots should pass")
  assert.ok(EmailValidator.isValid("user+tag@example.com"), "Email with plus should pass")
})

test("EmailValidator - Invalid email", async t => {
  assert.ok(!EmailValidator.isValid("invalid-email"), "Email without @ should fail")
  assert.ok(!EmailValidator.isValid("user@"), "Email without domain should fail")
  assert.ok(!EmailValidator.isValid("@example.com"), "Email without user should fail")
  assert.ok(!EmailValidator.isValid("user @example.com"), "Email with space should fail")
})

test("EmailValidator - Validate email list", async t => {
  const { valid, invalid } = EmailValidator.validateList([
    "valid@example.com",
    "also-valid@test.com",
    "invalid-email",
    "@nodomain.com",
    "another@example.org",
  ])

  assert.equal(valid.length, 3, "Should have 3 valid emails")
  assert.equal(invalid.length, 2, "Should have 2 invalid emails")
  assert.ok(valid.includes("valid@example.com"), "Should include first valid email")
})

test("EmailValidator - Get domain", async t => {
  const domain = EmailValidator.getDomain("user@example.com")
  assert.equal(domain, "example.com", "Should extract correct domain")

  const noAt = EmailValidator.getDomain("invalid-email")
  assert.equal(noAt, null, "Should return null for invalid email")
})

test("EmailValidator - Normalize email", async t => {
  const normalized = EmailValidator.normalize("  USER@EXAMPLE.COM  ")
  assert.equal(normalized, "user@example.com", "Should lowercase and trim")
})

// ========== EmailRateLimiter Tests ==========

test("EmailRateLimiter - Can send within limit", async t => {
  const limiter = new EmailRateLimiter()

  assert.ok(limiter.canSend("user1", 5, 1000), "First email should be allowed")
  assert.ok(limiter.canSend("user1", 5, 1000), "Second email should be allowed")
  assert.ok(limiter.canSend("user1", 5, 1000), "Third email should be allowed")
})

test("EmailRateLimiter - Exceeds limit", async t => {
  const limiter = new EmailRateLimiter()

  for (let i = 0; i < 5; i++) {
    limiter.canSend("user2", 5, 1000)
  }

  assert.ok(!limiter.canSend("user2", 5, 1000), "Should reject when limit exceeded")
})

test("EmailRateLimiter - Different users independent", async t => {
  const limiter = new EmailRateLimiter()

  limiter.canSend("user3", 2, 1000)
  limiter.canSend("user3", 2, 1000)

  assert.ok(limiter.canSend("user4", 2, 1000), "User4 should have independent limit")
  assert.ok(!limiter.canSend("user3", 2, 1000), "User3 should be at limit")
})

test("EmailRateLimiter - Get remaining quota", async t => {
  const limiter = new EmailRateLimiter()

  limiter.canSend("user5", 10, 1000)
  limiter.canSend("user5", 10, 1000)

  const remaining = limiter.getRemaining("user5", 10)
  assert.equal(remaining, 8, "Should have 8 emails remaining")
})

test("EmailRateLimiter - Reset counter", async t => {
  const limiter = new EmailRateLimiter()

  limiter.canSend("user6", 5, 1000)
  limiter.canSend("user6", 5, 1000)
  limiter.reset("user6")

  const remaining = limiter.getRemaining("user6", 5)
  assert.equal(remaining, 5, "Should reset to full quota")
})

// ========== EmailFormatter Tests ==========

test("EmailFormatter - Format recipient with name", async t => {
  const formatted = EmailFormatter.formatRecipient("user@example.com", "John Doe")
  assert.equal(formatted, "John Doe <user@example.com>", "Should format correctly with name")
})

test("EmailFormatter - Format recipient without name", async t => {
  const formatted = EmailFormatter.formatRecipient("user@example.com")
  assert.equal(formatted, "user@example.com", "Should format without name")
})

test("EmailFormatter - Format multiple recipients", async t => {
  const recipients = EmailFormatter.formatRecipients([
    { email: "user1@example.com", name: "User 1" },
    { email: "user2@example.com" },
    { email: "user3@example.com", name: "User 3" },
  ])

  assert.equal(recipients.length, 3, "Should format 3 recipients")
  assert.ok(recipients[0].includes("User 1"), "Should include name for first recipient")
  assert.ok(recipients[1].includes("user2@example.com"), "Should handle no name")
})

test("EmailFormatter - HTML to text conversion", async t => {
  const html = "<h1>Hello</h1><p>World</p><br><strong>Test</strong>"
  const text = EmailFormatter.htmlToText(html)

  assert.ok(!text.includes("<"), "Should remove HTML tags")
  assert.ok(text.includes("Hello"), "Should preserve text content")
  assert.ok(text.includes("World"), "Should preserve paragraph text")
})

test("EmailFormatter - Escape HTML special characters", async t => {
  const html = '<script>alert("xss")</script>'
  const escaped = EmailFormatter.escapeHtml(html)

  assert.ok(!escaped.includes("<script>"), "Should escape script tags")
  assert.ok(escaped.includes("&lt;"), "Should convert < to &lt;")
  assert.ok(escaped.includes("&gt;"), "Should convert > to &gt;")
})

// ========== EmailQueue Tests ==========

test("EmailQueue - Add and get size", async t => {
  const queue = new EmailQueue()

  queue.add({ to: "user1@example.com", subject: "Test" })
  queue.add({ to: "user2@example.com", subject: "Test" })

  assert.equal(queue.size(), 2, "Should have 2 items in queue")
})

test("EmailQueue - Process queue", async t => {
  const queue = new EmailQueue()
  const sent: any[] = []

  queue.add({ to: "user1@example.com" })
  queue.add({ to: "user2@example.com" })

  await queue.process(async message => {
    sent.push(message)
    return true
  })

  assert.equal(sent.length, 2, "Should send 2 emails")
  assert.equal(queue.size(), 0, "Queue should be empty after processing")
})

test("EmailQueue - Clear queue", async t => {
  const queue = new EmailQueue()

  queue.add({ to: "user1@example.com" })
  queue.add({ to: "user2@example.com" })

  queue.clear()

  assert.equal(queue.size(), 0, "Queue should be empty after clear")
})

// ========== AttachmentHelper Tests ==========

test("AttachmentHelper - From file", async t => {
  const attachment = AttachmentHelper.fromFile("/path/to/document.pdf", "invoice.pdf")

  assert.equal(attachment.filename, "invoice.pdf", "Should use provided filename")
  assert.equal(attachment.content, "/path/to/document.pdf", "Should preserve content")
})

test("AttachmentHelper - From file with auto filename", async t => {
  const attachment = AttachmentHelper.fromFile("/path/to/document.pdf")

  assert.equal(attachment.filename, "document.pdf", "Should extract filename from path")
})

test("AttachmentHelper - From buffer", async t => {
  const buffer = Buffer.from("test content")
  const attachment = AttachmentHelper.fromBuffer(buffer, "test.txt")

  assert.equal(attachment.filename, "test.txt", "Should use provided filename")
  assert.ok(attachment.content instanceof Buffer, "Content should be Buffer")
})

test("AttachmentHelper - From base64", async t => {
  const base64 = Buffer.from("test content").toString("base64")
  const attachment = AttachmentHelper.fromBase64(base64, "test.txt", "text/plain")

  assert.equal(attachment.filename, "test.txt", "Should have correct filename")
  assert.equal(attachment.contentType, "text/plain", "Should have correct content type")
  assert.ok(attachment.content instanceof Buffer, "Content should be Buffer")
})

// ========== Integration Tests ==========

test("EmailValidator + EmailFormatter integration", async t => {
  const email = "  INVALID  "
  const normalized = EmailValidator.normalize(email)
  const isValid = EmailValidator.isValid(normalized)

  assert.ok(!isValid, "Should not be valid after normalize")
})

test("EmailValidator + EmailRateLimiter integration", async t => {
  const email = "user@example.com"
  const isValid = EmailValidator.isValid(email)
  const limiter = new EmailRateLimiter()

  if (isValid) {
    assert.ok(limiter.canSend(email, 10, 1000), "Should allow valid email")
  }
})

test("Multiple formatters on same recipient", async t => {
  const email = "  USER@EXAMPLE.COM  "
  const normalized = EmailValidator.normalize(email)
  const formatted = EmailFormatter.formatRecipient(normalized, "User Name")

  assert.equal(formatted, "User Name <user@example.com>", "Should normalize then format")
})
