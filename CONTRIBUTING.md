# Contributing Guidelines

Thank you for your interest in contributing to the GitHub Repository Display Action! This document provides guidelines and information for contributors to help maintain code quality and ensure a positive collaborative environment.

## 🌟 Ways to Contribute

There are many ways to contribute to this project:

- **🐛 Report bugs** by creating detailed issue reports
- **💡 Suggest features** or improvements via feature requests
- **📝 Improve documentation** including README, guides, and code comments
- **🧪 Write tests** to increase code coverage and reliability
- **💻 Submit code** via pull requests for bug fixes or new features
- **🔍 Review pull requests** to help maintain code quality
- **💬 Help others** by answering questions in issues

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** (version 18 or higher)
- **npm** package manager
- **Git** for version control
- A **GitHub account**
- Basic knowledge of **JavaScript/TypeScript** and **GitHub Actions**

### Development Setup

1. **Fork the Repository**

   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/sansk/github-repo-display.git
   cd github-repo-display
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Create Development Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

4. **Set Up Environment**
   ```bash
   # Copy and configure environment file
   cp .env.example .env.local
   # Edit .env.local with your GitHub token and test settings
   ```

### Development Workflow

1. **Make Changes**
   - Write clean, well-documented code
   - Follow existing code style and patterns
   - Add tests for new functionality

2. **Test Your Changes**

   ```bash
   # Run all tests
   npm test

   # Run tests with coverage
   npm run test:coverage

   # Test locally (see Development Testing Guide)
   npm run dev:local

   # Build and verify
   npm run build
   ```

3. **Commit Your Changes**

   ```bash
   # Stage your changes
   git add .

   # Commit with descriptive message
   git commit -m "feat: add support for custom themes"
   ```

## 📋 Contribution Standards

### Code Quality

- **Follow existing patterns**: Maintain consistency with the existing codebase
- **Write readable code**: Use clear variable names and add comments for complex logic
- **Handle errors gracefully**: Implement proper error handling and user feedback
- **Performance considerations**: Ensure changes don't negatively impact performance
- **Security awareness**: Follow security best practices, especially for token handling

### Commit Message Convention

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or modifying tests
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `chore`: Maintenance tasks

**Examples:**

```bash
feat: add table format support for repository display
fix: resolve issue with empty repository descriptions
docs: update README with new configuration options
test: add unit tests for format validation
```

### Testing Requirements

All contributions must include appropriate tests:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test feature interactions
- **Error Handling**: Test edge cases and error conditions
- **Coverage**: Aim for >80% code coverage on new code

### Documentation Requirements

- **Code Comments**: Document complex logic and API interactions
- **README Updates**: Update documentation for new features
- **Type Definitions**: Maintain TypeScript definitions
- **Examples**: Provide usage examples for new features

## 🐛 Bug Reports

When reporting bugs, please include:

### Required Information

- **Bug Description**: Clear, concise description of the issue
- **Steps to Reproduce**: Step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node.js version, GitHub Actions runner
- **Screenshots**: If applicable

### Bug Report Template

```markdown
## Bug Description

A clear description of what the bug is.

## Steps to Reproduce

Steps to reproduce the bug

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened.

## Environment

- OS: [e.g. Ubuntu 20.04]
- Node.js: [e.g. 16.14.0]
- Action Version: [e.g. v1.2.0]

## Additional Context

Any other context about the problem.
```

## 💡 Feature Requests

When suggesting new features:

### Feature Request Guidelines

- **Clear Use Case**: Explain why the feature is needed
- **Detailed Description**: Describe the feature comprehensively
- **Implementation Ideas**: Suggest how it might work
- **Backward Compatibility**: Consider impact on existing users
- **Alternative Solutions**: Mention other approaches considered

### Feature Request Template

```markdown
## Feature Description

A clear description of what you want to happen.

## Use Case

Explain the problem this feature would solve.

## Proposed Solution

Describe your proposed implementation.

## Alternative Solutions

Describe alternatives you've considered.

## Additional Context

Any other context or screenshots about the request.
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Fork the repository and create a feature branch
- [ ] Write tests for your changes
- [ ] Ensure all tests pass locally
- [ ] Update documentation as needed
- [ ] Follow the code style guidelines
- [ ] Test your changes thoroughly

### Pull Request Guidelines

1. **Descriptive Title**: Use a clear, descriptive title
2. **Detailed Description**: Explain what changes you made and why
3. **Link Issues**: Reference any related issues
4. **Breaking Changes**: Clearly mark any breaking changes
5. **Screenshots**: Include screenshots for UI changes

### Pull Request Template

```markdown
## Description

Brief description of what this PR does.

## Changes Made

- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

## Related Issues

Fixes #[issue number]

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Documentation updated

## Breaking Changes

- [ ] No breaking changes
- [ ] Breaking changes (explain below)

## Screenshots

If applicable, add screenshots to help explain your changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes or clearly documented
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Reviewers may test changes locally
4. **Feedback**: Address reviewer feedback promptly
5. **Approval**: PR approved and merged by maintainer

## 📜 Code of Conduct

### Our Commitment

We are committed to providing a welcoming and inclusive experience for all contributors, regardless of background, identity, or experience level.

### Expected Behavior

- **Be Respectful**: Treat all community members with respect
- **Be Inclusive**: Welcome newcomers and different perspectives
- **Be Collaborative**: Work together constructively
- **Be Patient**: Help others learn and grow
- **Be Professional**: Maintain professional standards in all interactions

### Unacceptable Behavior

- Harassment, discrimination, or offensive language
- Personal attacks or trolling
- Spam or off-topic discussions
- Sharing private information without permission
- Any behavior that creates an unwelcoming environment

### Enforcement

Community leaders will enforce these standards and may take appropriate action for any behavior deemed inappropriate, threatening, or harmful.

## ❓ Getting Help

### Resources

- **📖 Documentation**: Check the [README](./README.md) and [Wiki](https://github.com/sansk/github-repo-display/wiki)
- **🔧 Development Guide**: See [Development Testing Guide](./DEVELOPMENT_TESTING_GUIDE.md)
- **🐛 Issues**: Browse [existing issues](https://github.com/sansk/github-repo-display/issues)

### Getting Support

If you need help:

1. **Search existing resources** first
2. **Create a discussion** for general questions
3. **Create an issue** for bugs or feature requests

## 🏆 Recognition

We value all contributions and recognize contributors in several ways:

- **Contributors List**: All contributors are listed in our README
- **Release Notes**: Significant contributions mentioned in releases
- **Community Recognition**: Outstanding contributors highlighted in discussions

## 📞 Contact

- **Project Maintainers**: Create an issue or discussion
- **Code of Conduct Issues**: Contact project maintainers directly

---

Thank you for contributing to the GitHub Repository Display Action! Your efforts help make this project better for everyone in the community.

<div align="center">

**[⬆️ Back to Top](#contributing-guidelines)**

</div>
