# Contributing to task-scheduler-builder

Thank you for considering contributing to task-scheduler-builder! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-scheduler-builder
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the project**
   ```bash
   pnpm build
   ```

4. **Run tests**
   ```bash
   pnpm test
   ```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following the existing style
   - Add tests for new features
   - Update documentation as needed

3. **Run tests and linting**
   ```bash
   pnpm test
   pnpm lint:fix
   pnpm typecheck
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `test:` - Test additions or changes
   - `refactor:` - Code refactoring
   - `chore:` - Build/tooling changes

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style

- Follow the ESLint configuration
- Use TypeScript for all code
- Write descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Testing

- Write tests for all new features
- Maintain or improve code coverage
- Integration tests should be conditional on Windows platform
- Use descriptive test names

Example:
```typescript
describe('feature name', () => {
  it('should do something specific', () => {
    // Test implementation
  })
})
```

## Documentation

- Update README.md for user-facing changes
- Add examples for new features
- Update API reference section
- Include inline code documentation

## Pull Request Guidelines

- Provide a clear description of the changes
- Link related issues
- Ensure all tests pass
- Update CHANGELOG.md
- Keep PRs focused on a single feature/fix

## Reporting Issues

When reporting issues, please include:

- Operating System version
- Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Error messages or logs

## Questions?

Feel free to open an issue for questions or discussions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
