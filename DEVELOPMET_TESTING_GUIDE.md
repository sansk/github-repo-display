# Development Testing Guide

This guide provides comprehensive instructions for testing this Repo(Action) locally before submitting pull requests or deploying changes.

## Prerequisites

- Node.js (v18+)
- npm package manager
- Valid GitHub Personal Access Token
- Git

## Pre-Submission Checklist

Before submitting pull requests or pushing changes to the repository, ensure all of the following tests pass:

- [ ] **Unit Tests**: All test suites pass (`npm test`)
- [ ] **Build Process**: Application builds successfully (`npm run build`)
- [ ] **API Integration**: Action works correctly with real GitHub API
- [ ] **Documentation**: README file updates properly respect start/end markers
- [ ] **Error Handling**: Invalid tokens and usernames are handled gracefully
- [ ] **Output Formats**: All supported formats (card, list, table) render correctly
- [ ] **Edge Cases**: Empty repositories, missing descriptions, and boundary conditions work as expected

## Environment Setup

### 1. Repository Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/sansk/github-repo-display.git
cd github-repo-display
npm install
```

### 2. Environment Configuration

Create a local environment file in the project root:

**`.env.local`**

```bash
# GitHub Authentication
GITHUB_TOKEN=ghp_your_personal_access_token_here

# Action Configuration
INPUT_USERNAME=your-github-username
INPUT_TOPIC=projects
INPUT_FORMAT=card
INPUT_README_PATH=./scripts/README-DevTest.md
INPUT_TITLE=🚀 My Test Projects
INPUT_MAX_REPOS=5

# Display Options
INPUT_SHOW_DESCRIPTION=true
INPUT_SHOW_LANGUAGE=true
INPUT_SHOW_STARS=true
INPUT_SHOW_FORKS=true

# Commit Settings (for testing, keep false)
INPUT_COMMIT_CHANGES=false
INPUT_COMMIT_MESSAGE=Update showcase projects
```

> ⚠️ **Security Note**: Never commit the `.env.local` file to version control. It should be added to your `.gitignore`.

### 3. Test README File

Create a test README file at `./scripts/README-DevTest.md`:

```markdown
# My GitHub Profile

Welcome to my profile!

<!-- SHOWCASE-START -->
<!-- SHOWCASE-END -->

Thanks for visiting!
```

## Testing Methods

### Method 1: Local Development Script (Recommended)

#### Option A: NPM Dev Script

Execute the following command to run the complete build and test cycle:

```bash
npm run dev:local
```

This command:

- Builds the project (`npm run build`)
- Runs the action with local environment variables
- Updates the test README file

#### Option B: Dedicated Test Script

Run the development test script directly:

```bash
npm run dev
```

This uses the dedicated development script located at `./scripts/devTestScript.js`.

### Method 2: GitHub Actions Local Runner (Act)

> ⚠️ **Status:** This method has not been validated by the project maintainer. Community testing and feedback are welcome to verify its functionality.

#### Installation

Install Act based on your operating system:

```bash
# macOS
brew install act

# Windows (Chocolatey)
choco install act-cli

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

#### Workflow Configuration

Create a test workflow at `.github/workflows/test-local.yml`:

```yaml
name: Local Development Test
on:
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Test GitHub Repository Display Action
        uses: ./
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          username: ${{ github.repository_owner }}
          topic: 'showcase'
          format: 'card'
          readme_path: './scripts/README-DevTest.md'
          commit_changes: false
```

#### Execution

```bash
# Create secrets file
echo "GITHUB_TOKEN=ghp_your_token_here" > .secrets

# Run the workflow
act workflow_dispatch -W .github/workflows/test-local.yml --secret-file .secrets

# Alternative: Run specific job
act -j test --secret-file .secrets
```

### Method 3: Docker Testing

> ⚠️ **Status:** This method has not been validated by the project maintainer. Community testing and feedback are welcome to verify its functionality.

#### Build and Test

```bash
# Build Docker image
docker build -t github-repo-display-test .

# Run action in Docker container
docker run --rm \
  -e GITHUB_TOKEN=ghp_your_token_here \
  -e INPUT_USERNAME=your-username \
  -e INPUT_TOPIC=showcase \
  -e INPUT_FORMAT=card \
  -e INPUT_COMMIT_CHANGES=false \
  -e INPUT_README_PATH=/tmp/README-DevTest.md \
  -v $(pwd)/README-DevTest.md:/tmp/README-DevTest.md \
  github-repo-display-test
```

## Troubleshooting

### Common Issues

**Build Failures**

- Ensure all dependencies are installed: `npm install`
- Verify Node.js version compatibility (v18+)

**API Authentication Errors**

- Validate GitHub Personal Access Token permissions
- Check token expiration date
- Ensure token has appropriate repository access

**File Path Issues**

- Verify test README file exists at specified path
- Check file permissions for write access
- Ensure directory structure matches configuration

### Getting Help

- Check existing [GitHub Issues](https://github.com/sansk/github-repo-display/issues)
- Review the [main README](../README.md) for additional configuration options
- Submit a new issue with detailed error information and steps to reproduce

## Contributing

After successfully testing your changes:

1. Ensure all tests in the checklist pass
2. Update documentation if necessary
3. Submit a pull request with a clear description of changes
4. Reference any related issues in your PR description

---

> **Note**: Method 1 (Local Development Script) is the recommended approach for most development scenarios. Methods 2 and 3 are provided for advanced use cases and may require additional configuration.
