# Contributing to Yukemuri

We welcome contributions to Yukemuri! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git >= 2.9 (for local git hooks support)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/yukemuri.git
cd yukemuri

# Install dependencies
pnpm install

# Enable git hooks (automatic on first clone due to core.hooksPath config)
# If not automatically enabled, run:
git config core.hooksPath .githooks
```

### Git Hooks Setup

This project uses **Git hooks** stored in `.githooks/` directory for automatic code quality checks. Git hooks are configured in `.git/config` with `core.hooksPath = .githooks`.

#### Pre-commit Hook
- Automatically formats staged files with Biome
- Automatically lints staged files with Biome
- Re-stages fixed files automatically
- Runs before each commit

#### Commit-msg Hook
- Validates commit message format
- Ensures minimum message length (5 characters)
- Warns if first line exceeds 72 characters

## Code Quality

This project uses **Biome** for code linting and formatting. All code must conform to Biome standards before being merged.

### Automatic Code Formatting

Format all files automatically:

```bash
pnpm run format
```

### Linting and Auto-fixing

Run linter with automatic fixes:

```bash
pnpm run lint
```

### Manual Verification

To check if code passes all quality checks without making changes:

```bash
# Check formatting
./node_modules/.pnpm/@biomejs+cli-linux-x64@2.3.6/node_modules/@biomejs/cli-linux-x64/biome format .

# Check linting
./node_modules/.pnpm/@biomejs+cli-linux-x64@2.3.6/node_modules/@biomejs/cli-linux-x64/biome check .
```

## Biome Configuration

The Biome configuration is defined in `biome.json`. Key settings include:

- **Formatter**: 2-space indentation, max line width of 100 characters
- **Linter**: Recommended rule set with some relaxed rules (e.g., warnings for static-only classes)
- **JavaScript**: ES5 trailing commas, arrow function parentheses as needed, double quotes for JSX

For more details, see the [Biome documentation](https://biomejs.dev/).

## Commit Guidelines

1. Make changes to your feature branch
2. Stage changes: `git add .`
3. Commit: `git commit -m "Your descriptive message"`
   - Pre-commit hook automatically formats and lints your changes
   - Commit-msg hook validates your message format
4. Ensure your changes don't break existing tests: `pnpm run test`

### Commit Message Format

- **Minimum length**: 5 characters
- **Recommended**: Under 72 characters for the first line
- **Format**: Use present tense ("Add feature" not "Added feature")
- **Example**: `fix: handle runtime errors in network module`

## Pull Requests

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes and ensure code quality
3. Commit your changes with descriptive messages
4. Push to your fork and create a Pull Request
5. Provide a clear description of what your PR does
6. Link any related issues

## Project Structure

- `packages/core` - Core framework
- `packages/cli` - Command-line interface
- `packages/create-yukemuri` - Project scaffolding
- `packages/plugins/*` - Framework plugins (auth, database, email, etc.)
- `.githooks/` - Git hooks for automatic code quality checks

## Building and Testing

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check

# Run development servers
pnpm dev

# Clean build artifacts
pnpm clean
```

## License

By contributing to Yukemuri, you agree that your contributions will be licensed under the MIT License.



