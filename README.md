# Github Action: Github Repository Display

🎬 A powerful GitHub Action that automatically showcases your featured repositories in your profile README with customizable display formats and flexible configuration options.

## Overview

This GitHub Action fetches repositories filtered by topics and automatically updates your profile README with beautiful, customizable displays. Perfect for showcasing your best work, featured projects, or portfolio pieces directly on your GitHub profile.

## ✨ Features

- 🎨 **Multiple display formats**: Choose from cards, lists, or tables to match your style
- 🏷️ **Topic-Based Filtering**: Filter repositories by any topic (defaults to "showcase")
- 👑 **Scalable Display**: Show up to 100 repositories with customizable limits
- 🎛️ **Flexible Configuration**: Control visibility of descriptions, languages, stars, forks, and topics
- 🚀 **Automated Updates**: Schedule automatic updates or trigger manually
- 🔒 **Safe Integration**: Uses HTML markers for targeted updates without affecting existing content
- 🐳 **Docker Compatible**: Runs seamlessly in containerized environments
- ✅ **Comprehensive Testing**: Full test coverage ensures reliability

## 🚀 Quick Start

### Step 1: Prepare Your README

Add HTML comment markers to your `README.md` where you want repositories to appear:

```markdown
# Your GitHub Profile

Welcome to my profile! Here are some of my featured projects:

<!-- SHOWCASE-START -->
<!-- SHOWCASE-END -->

Feel free to explore and contribute!
```

### Step 2: Create Workflow

Create `.github/workflows/update-readme.yml` in your profile repository:

```yaml
name: Update README with Featured Repositories

on:
  schedule:
    - cron: '0 6 * * *' # Daily at 6 AM UTC
  workflow_dispatch: # Manual trigger

permissions:
  contents: write

jobs:
  update-readme:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Update README with Repository Display
        uses: sansk/github-repo-display@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          username: ${{ github.repository_owner }}
          topic: 'showcase'
          format: 'card'
```

### Step 3: Tag Your Repositories

Add the "showcase" topic to repositories you want to feature:

1. Navigate to your repository on GitHub
2. Click the gear icon (⚙️) next to "About" in the sidebar
3. Add "showcase" to the topics field
4. Click "Save changes"

The action will automatically detect and display these repositories on the next run.

## 📖 Usage Examples

### Basic Configuration( With the defaults)

```yaml
- name: Update README with Repository Display
  uses: sansk/github-repo-display@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    username: ${{ github.repository_owner }}
```

### Advanced Configuration

```yaml
- name: Update README with Repository Display
  uses: sansk/github-repo-display@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    username: ${{ github.repository_owner }}
    topic: 'featured'
    format: 'table'
    title: '🌟 Featured Projects'
    max_repos: 12
    show_description: true
    show_language: true
    show_stars: true
    show_forks: true
    show_topics: true
    commit_message: 'docs: update featured projects showcase'
```

## 🎛️ Configuration Options

| Input              | Description                                | Required | Default Value                                |
| ------------------ | ------------------------------------------ | -------- | -------------------------------------------- |
| `token`            | GitHub token with repo permissions         | ✅       | `${{ github.token }}`                        |
| `username`         | GitHub username to fetch repositories      | ✅       | -                                            |
| `topic`            | Topic to filter repositories by            | ❌       | `showcase`                                   |
| `format`           | Display format: `card`, `list`, or `table` | ❌       | `card`                                       |
| `title`            | Section title                              | ❌       | `🚀 My Projects`                             |
| `max_repos`        | Maximum repositories to display            | ❌       | `10`                                         |
| `show_description` | Show repository descriptions               | ❌       | `true`                                       |
| `show_language`    | Show programming language                  | ❌       | `true`                                       |
| `show_stars`       | Show star counts                           | ❌       | `false`                                      |
| `show_forks`       | Show fork counts                           | ❌       | `false`                                      |
| `show_topics`      | Show repository topics                     | ❌       | `false`                                      |
| `commit_message`   | Commit message for updates                 | ❌       | `Update Profile README with Github Projects` |

### Configuration Notes

- All boolean parameters accept `true` or `false` values
- String parameters should be provided with quotes
- The action only fetches public repositories with the specified topic
- Maximum repository limit is enforced at 100 to maintain performance

## 🎨 Display Format Examples

### Card Format (Default)

Displays repositories as GitHub-style cards using the `github-readme-stats` service:

<!--
Working on this instead of HTML style display
![Card Format Example](https://github-readme-stats.vercel.app/api/pin/?username=octocat&repo=Spoon-Knife&theme=default)
![Card Format Example](https://github-readme-stats.vercel.app/api/pin/?username=octocat&repo=git-consortium&theme=default)
-->

---

<div style="display: flex; flex-wrap: wrap; justify-content: left; gap: 4px">

<a href="https://github.com/octocat/Spoon-Knife">
  <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?username=octocat&repo=Spoon-Knife&theme=default&show_owner=true&description_lines_count=2&hide=&hide_language=false&show_icons=true&show_stars=true&show_forks=true&show_topics=true" />
</a>

<a href="https://github.com/octocat/git-consortium">
  <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?username=octocat&repo=git-consortium&theme=default&show_owner=true&description_lines_count=2&hide=&hide_language=false&show_icons=true&show_stars=true&show_forks=true&show_topics=true" />
</a>

<a href="https://github.com/octocat/octocat.github.io">
  <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?username=octocat&repo=octocat.github.io&theme=default&show_owner=true&description_lines_count=2&hide=&hide_language=false&show_icons=true&show_stars=true&show_forks=true&show_topics=true" />
</a>

</div>

---

### List Format

Creates a clean bulleted list with optional badges and metadata:

---

- ### 🧑‍💻 **[awesome-project](https://github.com/user/awesome-project)**

  ![TypeScript](https://img.shields.io/badge/-TypeScript-blue) ![Stars](https://img.shields.io/badge/⭐-42-yellow)

  An awesome project

- **[cool-app](https://github.com/user/cool-app)**

  ![JavaScript](https://img.shields.io/badge/-JavaScript-blue) ![Stars](https://img.shields.io/badge/⭐-120-yellow) ![Forks](https://img.shields.io/badge/🔀-10-orange)

  A very cool application [Visit Website](https://example.com/)

---

### Table Format

Organizes repository information in a structured table format:

---

<table>
  <thead>
    <tr>
      <th>Repository</th>
      <th>Description</th>
      <th>Language</th>
      <th>Stars</th>
      <th>Forks</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="https://github.com/octocat/Spoon-Knife" target="_blank"><strong>Spoon-Knife</strong></a></td>
      <td>This repo is for demonstration purposes only. </td>
      <td><img src="https://img.shields.io/badge/-TypeScript-blue?style=flat-square" alt="TypeScript"/></td>
      <td>⭐ 13.2k</td>
      <td>🔀 153k</td>
    </tr>
    <tr>
      <td><a href="https://github.com/octocat/git-consortium" target="_blank"><strong>git-consortium</strong></a></td>
      <td>This repo is for demonstration purposes only.<a href="https://example.com/" target="_blank"><br><strong>Live Website</strong></a></td>
      <td><img src="https://img.shields.io/badge/-JavaScript-blue?style=flat-square" alt="JavaScript"/></td>
      <td>⭐ 455</td>
      <td>🔀 129</td>
    </tr>
    <tr>
      <td><a href="https://github.com/octocat/octocat.github.io" target="_blank"><strong>octocat.github.io</strong></a></td>
      <td></td>
      <td><img src="https://img.shields.io/badge/-JavaScript-blue?style=flat-square" alt="JavaScript"/></td>
      <td>⭐ 892</td>
      <td>🔀 433</td>
    </tr>
  </tbody>
</table>

---

## 🛠️ Development

### Prerequisites

- Node.js 18 or higher
- npm package manager
- GitHub Personal Access Token

### Local Setup

```bash
# Clone the repository
git clone https://github.com/sansk/github-repo-display.git
cd github-repo-display

# Install dependencies
npm install

# Run tests
npm test

# Build the action
npm run build
```

### Testing

Comprehensive testing instructions are available in our [Development Testing Guide](./DEVELOPMENT_TESTING_GUIDE.md).

## 🛣️ Roadmap & Feature Prospects

We're continuously working to improve the GitHub Repository Display Action.

### High Priority

[ ] Bug Fixes

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details on:

- Code of conduct
- Development workflow
- Submitting pull requests
- Reporting issues

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 💖 Show Your Support

If you're using this project and find it helpful, or would like to encourage continued development, here are some ways you can contribute:

- **🐛 Report & Request**: Help improve the project by reporting bugs or requesting features via [GitHub Issues](https://github.com/sansk/github-repo-display/issues)
- **🔗 Give Credit**: When using this action in your README, consider linking back to this repository to help others discover it
- **⭐ Star & Share**: Give the project a star on GitHub and share it with your developer community 🚀
- **☕ Buy Me a Coffee**: Support ongoing development with a [small contribution](https://github.com/sponsors/sansk) 🍵

Your support helps keep open source project like this alive and thriving. Thanks! ❤️

## 🙏 Acknowledgments

- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) for powering the card display format
- GitHub Actions team for the excellent platform

---

<div align="center">

**[⬆️ Back to Top](#github-repository-display-action)**

Made with ❤️ by [SK](https://github.com/sansk) to give back to the open source community

</div>
