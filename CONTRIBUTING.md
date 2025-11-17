# Contributing to Yukemuri

We welcome contributions to Yukemuri! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/yukemuri.git
cd yukemuri

# Install dependencies
pnpm install
```

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
pnpm exec biome format .

# Check linting
pnpm exec biome check .
```

## Biome Configuration

The Biome configuration is defined in `biome.json`. Key settings include:

- **Formatter**: 2-space indentation, max line width of 100 characters
- **Linter**: Recommended rule set with some relaxed rules (e.g., warnings for static-only classes)
- **JavaScript**: ES5 trailing commas, arrow function parentheses as needed, double quotes for JSX

For more details, see the [Biome documentation](https://biomejs.dev/).

## Commit Guidelines

1. Before committing, ensure your code passes all checks:
   ```bash
   pnpm run format
   pnpm run lint
   ```

2. Write descriptive commit messages
3. Reference any related issues in your commit message
4. Ensure your changes don't break existing tests: `pnpm run test`

## Pull Requests

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes and ensure code quality
3. Push to your fork and create a Pull Request
4. Provide a clear description of what your PR does
5. Link any related issues

## Project Structure

- `packages/core` - Core framework
- `packages/cli` - Command-line interface
- `packages/create-yukemuri` - Project scaffolding
- `packages/plugins/*` - Framework plugins (auth, database, email, etc.)

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


