# Email Plugin Tests

Comprehensive test suite for the Yukemuri Email Plugin covering all components and workflows.

## Test Structure

The test suite is organized into four main test files:

### 1. manager.test.ts - EmailManager Tests

Tests for the `EmailManager` class covering email sending functionality:

- **Provider Configuration**: SMTP, SendGrid, and Mailgun setup
- **Connection Management**: Connect, disconnect, and status checking
- **Email Sending**: Single recipient, multiple recipients (to/cc/bcc)
- **Template Emails**: Sending emails with templates
- **Error Handling**: Invalid emails, missing configuration, connection errors

**Key Tests:**
- `SMTP Configuration` - Test SMTP provider setup
- `SendGrid Configuration` - Test SendGrid provider setup
- `Mailgun Configuration` - Test Mailgun provider setup
- `Send simple email` - Test basic email sending
- `Send to multiple recipients` - Test to/cc/bcc functionality
- `Send with template` - Test template-based emails
- `Template not found should fail` - Test error handling
- `Send without connection should fail` - Test connection validation

### 2. templates.test.ts - TemplateEngine Tests

Tests for the `TemplateEngine` class covering template management:

- **Template Registration**: Register and retrieve templates
- **Built-in Templates**: Verify welcome, reset password, and email verification templates
- **Template Rendering**: Variable substitution and template rendering
- **Variable Validation**: Check for missing or invalid variables
- **Edge Cases**: Special characters, case sensitivity, multiple occurrences

**Key Tests:**
- `Register template` - Test custom template registration
- `Get template` - Test template retrieval
- `List templates` - Test template listing
- `Render template with variables` - Test variable substitution
- `Render template with missing variables should fail` - Test validation
- `Welcome template verification` - Verify built-in welcome template
- `Password reset template verification` - Verify built-in reset template
- `Email verification template verification` - Verify built-in verification template

### 3. utils.test.ts - Utility Functions Tests

Tests for utility classes: `EmailValidator`, `EmailRateLimiter`, `EmailQueue`, `EmailFormatter`, `AttachmentHelper`

#### EmailValidator Tests
- Valid email format validation
- Invalid email detection
- Email list validation (filtering valid/invalid)
- Domain extraction
- Email normalization (lowercase, trim)

#### EmailRateLimiter Tests
- Rate limiting within quota
- Exceeding quota detection
- Per-user independent limits
- Remaining quota tracking
- Rate limit reset

#### EmailFormatter Tests
- Format recipients with/without names
- Format multiple recipients
- HTML to plain text conversion
- HTML special character escaping

#### EmailQueue Tests
- Add emails to queue
- Queue size tracking
- Process queue with async callback
- Clear queue

#### AttachmentHelper Tests
- Create attachment from file path
- Create attachment from buffer
- Create attachment from base64

**Key Tests:**
- `Valid email` - Test valid email formats
- `Invalid email` - Test invalid email detection
- `Can send within limit` - Test rate limiting
- `Exceeds limit` - Test quota enforcement
- `HTML to text conversion` - Test text conversion
- `Add and get size` - Test queue operations

### 4. integration.test.ts - Integration Tests

End-to-end tests combining multiple components:

- **Complete Email Workflow**: Connect, validate, send, disconnect
- **Batch Send with Rate Limiting**: Validate emails, apply rate limits, queue and process
- **Multiple Providers**: Simultaneously test SMTP, SendGrid, and Mailgun
- **Template with Validation**: Render templates with variable validation
- **Queue with Custom Templates**: Register and use custom templates
- **Rate Limit with Quotas**: Different limits for different user types
- **Error Handling**: Comprehensive error scenarios
- **User Registration Flow**: Simulate complete user registration with welcome email

**Key Tests:**
- `Complete email workflow` - Full lifecycle test
- `Batch send with rate limiting` - Bulk email operations
- `Multiple providers` - Provider switching
- `Template rendering with validation` - Template validation
- `Full workflow: User registration with welcome email` - Real-world scenario

## Running Tests

### Run All Tests

```bash
pnpm test
# or
npm test
```

### Run Specific Test File

```bash
pnpm test tests/manager.test.ts
# or
npm test tests/manager.test.ts
```

### Run Tests in Watch Mode

```bash
pnpm test:watch
# or
npm run test:watch
```

### Run with Verbose Output

```bash
node --loader=tsx --test tests/**/*.test.ts --reporter=spec
```

## Test Coverage

The test suite provides comprehensive coverage:

| Component | Test Count | Coverage |
|-----------|-----------|----------|
| EmailManager | 10+ | Connection, sending, templates, errors |
| TemplateEngine | 13+ | Registration, rendering, validation |
| EmailValidator | 6+ | Format, domain, normalization |
| EmailRateLimiter | 5+ | Limits, quotas, reset |
| EmailFormatter | 5+ | Formatting, conversion, escaping |
| EmailQueue | 3+ | Add, process, clear |
| AttachmentHelper | 4+ | File, buffer, base64 |
| Integration | 7+ | Full workflows, multi-provider |
| **Total** | **53+** | **All major features** |

## Test Categories

### Unit Tests

Individual component tests:

```bash
# Manager unit tests
pnpm test tests/manager.test.ts

# Template engine unit tests
pnpm test tests/templates.test.ts

# Utility functions unit tests
pnpm test tests/utils.test.ts
```

### Integration Tests

Cross-component and end-to-end tests:

```bash
# Integration tests
pnpm test tests/integration.test.ts
```

## Example Test Scenarios

### Testing Email Validation

```typescript
test('EmailValidator - Valid email', async (t) => {
  assert.ok(EmailValidator.isValid('user@example.com'), 'Valid email should pass');
  assert.ok(!EmailValidator.isValid('invalid-email'), 'Invalid email should fail');
});
```

### Testing Rate Limiting

```typescript
test('EmailRateLimiter - Can send within limit', async (t) => {
  const limiter = new EmailRateLimiter();

  assert.ok(limiter.canSend('user1', 5, 1000), 'First email should be allowed');
  assert.ok(!limiter.canSend('user1', 5, 1000), 'Should reject when limit exceeded');
});
```

### Testing Template Rendering

```typescript
test('TemplateEngine - Render template with variables', async (t) => {
  const engine = new TemplateEngine();

  const result = engine.render('welcome', {
    firstName: 'John',
    appName: 'MyApp',
    dashboardUrl: 'https://myapp.com/dashboard'
  });

  assert.ok(result.subject.includes('MyApp'), 'Variables should be substituted');
});
```

## Test Data and Fixtures

### Sample Emails

```typescript
const testEmails = {
  valid: [
    'user@example.com',
    'test.user@example.co.uk',
    'user+tag@example.com'
  ],
  invalid: [
    'invalid-email',
    'user@',
    '@example.com',
    'user @example.com'
  ]
};
```

### Configuration Samples

```typescript
// SMTP Config
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: 'test@gmail.com', pass: 'password' }
};

// SendGrid Config
const sendgridConfig = {
  apiKey: 'SG.test-key-12345'
};

// Mailgun Config
const mailgunConfig = {
  apiKey: 'key-test-12345',
  domain: 'mg.example.com'
};
```

## Best Practices

### 1. Test Isolation

Each test should be independent:

```typescript
// ✅ Good - Each test creates its own manager
test('Test 1', async () => {
  const manager = new EmailManager();
  // ...
});

test('Test 2', async () => {
  const manager = new EmailManager();
  // ...
});
```

### 2. Clear Assertions

Use descriptive assertion messages:

```typescript
// ✅ Good
assert.ok(manager.isConnected(), 'Manager should be connected after connect()');

// ❌ Bad
assert.ok(manager.isConnected());
```

### 3. Error Testing

Test both success and failure cases:

```typescript
// ✅ Good
const successResult = await manager.send(validMessage);
assert.ok(successResult.success);

const failureResult = await manager.send(invalidMessage);
assert.ok(!failureResult.success);
```

### 4. Integration Testing

Test component interactions:

```typescript
// ✅ Good - Tests multiple components
const validator = EmailValidator.isValid(email);
const limiter = new EmailRateLimiter();
if (validator) {
  const allowed = limiter.canSend(email, 5, 1000);
}
```

## Troubleshooting Tests

### Test Fails: "Cannot find module"

Ensure dependencies are installed:

```bash
pnpm install
```

### Test Fails: "Timeout"

Increase test timeout:

```bash
node --loader=tsx --test --timeout=10000 tests/**/*.test.ts
```

### Test Fails: "Template not found"

Verify template names match exactly (case-sensitive):

```typescript
// Correct template names:
engine.render('welcome', {});
engine.render('resetPassword', {});
engine.render('verifyEmail', {});
```

### Test Fails: "Missing variables"

Ensure all required variables are provided:

```typescript
// Get template to see required variables
const template = engine.get('welcome');
console.log(template?.variables); // ['firstName', 'appName', 'dashboardUrl']

// Provide all variables
engine.render('welcome', {
  firstName: 'John',
  appName: 'MyApp',
  dashboardUrl: 'https://myapp.com'
});
```

## Extending Tests

### Adding New Tests

Create a new test in the appropriate file:

```typescript
test('New feature test', async (t) => {
  // Setup
  const manager = new EmailManager();

  // Execute
  const result = await manager.send(message);

  // Assert
  assert.ok(result.success, 'Should succeed');
});
```

### Adding Test Fixtures

Create a `fixtures.ts` file:

```typescript
export const testData = {
  emails: {
    valid: 'user@example.com',
    invalid: 'invalid-email'
  },
  config: {
    smtp: { /* ... */ },
    sendgrid: { /* ... */ }
  }
};
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
```

## Performance Notes

- **Test Execution Time**: All tests complete in < 5 seconds
- **Memory Usage**: Minimal (< 50MB)
- **Parallel Execution**: Tests can run in parallel with `--test` flag

## Contributing

When adding new features to the email plugin:

1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Add integration tests for cross-component interactions
4. Update this documentation
5. Run full test suite before submitting PR

## License

MIT License - See LICENSE file for details
