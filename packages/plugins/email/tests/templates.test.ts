import { test } from "node:test"
import assert from "node:assert"
import { TemplateEngine } from "../src/templates"

test("TemplateEngine - Register template", async t => {
  const engine = new TemplateEngine()

  engine.register({
    name: "testTemplate",
    subject: "Test Subject",
    html: "<h1>Test</h1>",
    text: "Test",
    variables: ["var1", "var2"],
  })

  assert.ok(engine.exists("testTemplate"), "Template should be registered")
})

test("TemplateEngine - Get template", async t => {
  const engine = new TemplateEngine()

  const template = engine.get("welcome")
  assert.ok(template, "Welcome template should exist")
  assert.deepEqual(template?.name, "welcome", "Template name should be welcome")
  assert.ok(template?.html.includes("{{firstName}}"), "Template should have variables")
})

test("TemplateEngine - List templates", async t => {
  const engine = new TemplateEngine()

  const templates = engine.list()
  assert.ok(templates.includes("welcome"), "Should include welcome template")
  assert.ok(templates.includes("resetPassword"), "Should include resetPassword template")
  assert.ok(templates.includes("verifyEmail"), "Should include verifyEmail template")
})

test("TemplateEngine - Render template with variables", async t => {
  const engine = new TemplateEngine()

  const result = engine.render("welcome", {
    firstName: "John",
    appName: "MyApp",
    dashboardUrl: "https://myapp.com/dashboard",
  })

  assert.ok(result.subject.includes("MyApp"), "Subject should contain appName")
  assert.ok(result.html.includes("John"), "HTML should contain firstName")
  assert.ok(result.text?.includes("John"), "Text should contain firstName")
})

test("TemplateEngine - Render template with missing variables should fail", async t => {
  const engine = new TemplateEngine()

  try {
    engine.render("welcome", {
      firstName: "John",
      // Missing: appName, dashboardUrl
    })
    assert.fail("Should throw error for missing variables")
  } catch (error) {
    assert.ok(error instanceof Error, "Should throw Error")
    assert.match(
      (error as Error).message,
      /Missing template variables/,
      "Should mention missing variables"
    )
  }
})

test("TemplateEngine - Render nonexistent template should fail", async t => {
  const engine = new TemplateEngine()

  try {
    engine.render("nonexistent", {})
    assert.fail("Should throw error for nonexistent template")
  } catch (error) {
    assert.ok(error instanceof Error, "Should throw Error")
    assert.match(
      (error as Error).message,
      /Template not found/,
      "Should mention template not found"
    )
  }
})

test("TemplateEngine - Template variable substitution", async t => {
  const engine = new TemplateEngine()

  const result = engine.render("resetPassword", {
    firstName: "Jane",
    appName: "TestApp",
    resetLink: "https://example.com/reset?token=abc123",
    expiryTime: "24",
  })

  assert.ok(!result.subject.includes("{{"), "Subject should not have unsubstituted variables")
  assert.ok(!result.html.includes("{{"), "HTML should not have unsubstituted variables")
  assert.ok(result.subject.includes("TestApp"), "Subject should be substituted")
  assert.ok(result.html.includes("Jane"), "HTML should contain firstName")
  assert.ok(result.html.includes("abc123"), "HTML should contain reset token")
})

test("TemplateEngine - Multiple variable occurrences", async t => {
  const engine = new TemplateEngine()

  engine.register({
    name: "multiVar",
    subject: "{{name}} - {{name}} - {{name}}",
    html: "Hello {{name}} from {{name}}",
    text: "{{name}}",
    variables: ["name"],
  })

  const result = engine.render("multiVar", { name: "John" })

  // Count occurrences
  const subjectCount = (result.subject.match(/John/g) || []).length
  const htmlCount = (result.html.match(/John/g) || []).length

  assert.equal(subjectCount, 3, "Subject should have 3 occurrences of John")
  assert.equal(htmlCount, 2, "HTML should have 2 occurrences of John")
})

test("TemplateEngine - Welcome template verification", async t => {
  const engine = new TemplateEngine()

  const template = engine.get("welcome")
  assert.ok(template, "Welcome template should exist")
  assert.deepEqual(
    template?.variables,
    ["firstName", "appName", "dashboardUrl"],
    "Should have correct variables"
  )

  const result = engine.render("welcome", {
    firstName: "Alice",
    appName: "WelcomeApp",
    dashboardUrl: "https://welcome.app/dash",
  })

  assert.ok(result.subject.includes("WelcomeApp"), "Subject should include app name")
  assert.ok(result.html.includes("Alice"), "HTML should include user name")
  assert.ok(result.html.includes("Dashboard"), "HTML should have dashboard link")
  assert.ok(result.text, "Text version should be provided")
})

test("TemplateEngine - Password reset template verification", async t => {
  const engine = new TemplateEngine()

  const template = engine.get("resetPassword")
  assert.ok(template, "Reset password template should exist")

  const result = engine.render("resetPassword", {
    firstName: "Bob",
    appName: "TestApp",
    resetLink: "https://example.com/reset?token=xyz",
    expiryTime: "1",
  })

  assert.ok(result.subject.includes("TestApp"), "Subject should include app name")
  assert.ok(result.html.includes("Bob"), "HTML should include user name")
  assert.ok(result.html.includes("xyz"), "HTML should include reset token")
  assert.ok(result.html.includes("1"), "HTML should include expiry time")
})

test("TemplateEngine - Email verification template verification", async t => {
  const engine = new TemplateEngine()

  const template = engine.get("verifyEmail")
  assert.ok(template, "Email verification template should exist")

  const result = engine.render("verifyEmail", {
    firstName: "Charlie",
    appName: "MyApp",
    verifyLink: "https://example.com/verify?token=123",
    expiryTime: "48",
  })

  assert.ok(result.subject.includes("MyApp"), "Subject should include app name")
  assert.ok(result.html.includes("Charlie"), "HTML should include user name")
  assert.ok(result.html.includes("123"), "HTML should include verification token")
  assert.ok(result.html.includes("48"), "HTML should include expiry hours")
})

test("TemplateEngine - Case sensitivity in variables", async t => {
  const engine = new TemplateEngine()

  engine.register({
    name: "caseTest",
    subject: "Hello {{Name}}",
    html: "Hello {{Name}}",
    text: "Hello {{Name}}",
    variables: ["Name"],
  })

  const result = engine.render("caseTest", { Name: "Test" })
  assert.ok(result.subject.includes("Test"), "Should preserve case in variable names")
})

test("TemplateEngine - Special characters in variables", async t => {
  const engine = new TemplateEngine()

  engine.register({
    name: "specialChars",
    subject: "Hello {{name}}",
    html: "<p>{{content}}</p>",
    text: "{{content}}",
    variables: ["name", "content"],
  })

  const result = engine.render("specialChars", {
    name: "John & Co.",
    content: 'Special chars: <>&"',
  })

  assert.ok(result.subject.includes("John & Co."), "Should preserve special characters")
  assert.ok(result.html.includes("Special chars"), "Should preserve special characters in HTML")
})
