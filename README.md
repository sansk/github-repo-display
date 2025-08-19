# Github Action: Github Repo Display in README

🎬 A GitHub Action that automatically fetches your repositories with the "showcase" topic and updates your profile README with beautiful displays of your featured projects.

## ✨ Features

- 🎨 **Multiple display formats**: Choose from cards, lists, or tables
- 🏷️ **Customizable topics**: Filter repositories by any topic (defaults to "showcase")
- 👑 **Display upto 100 Repos**: Choose maximum repositories to display (defaults to 10, maximum is 100)
- 🎛️ **Flexible configuration**: Show/hide descriptions, languages, stars, forks, and topics
- 🚀 **Auto-updating**: Runs on schedule or manual trigger
- 📝 **Markdown integration**: Seamlessly integrates with your existing README
- 🔒 **Safe updates**: Uses markers to update specific sections without affecting other content
- 🐳 **Docker support**: Can run in containerized environments
- ✅ **Fully tested**: Comprehensive test suite with high coverage

## 🚀 Quick Start

### 1. Add markers to your README

Add these HTML comments to your `README.md` where you want the projects to appear:

```markdown
# Your Profile

# Place the below markers in your README.md

<!-- SHOWCASE-START -->
<!-- SHOWCASE-END -->

# The fetched repositories will be added between the markers <!-- SHOWCASE-START --> and <!-- SHOWCASE-END -->
```

### 2. Create a workflow

Create `.github/workflows/update-readme-with-github-repo.yml`:

```yaml
name: Update Profile README with Github Repo

on:
  schedule:
    - cron: '0 6 * * *' # Daily at 6 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  update-readme:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - uses: sansk/github-repo-display@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          username: ${{ github.repository_owner }}
          topic: 'portfolio'
          format: 'card'
```

### 3. Tag your repositories

Add the "showcase" topic to repositories you want to feature:

1. Go to your repository
2. Click the gear icon next to "About"
3. Add "showcase" to the topics
4. Save changes

## 📖 Usage

### Basic Usage - With the defaults

```yaml
- uses: yourusername/showcase-projects-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    username: ${{ github.repository_owner }}
```

### Advanced Configuration

```yaml
- uses: yourusername/showcase-projects-action@v1
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
    show_topics: true
    commit_message: 'docs: update featured projects'
```

## 🎛️ Configuration Options

| Input              | Description                                | Required | Default                                      |
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

#### Notes

- Values should be provided as strings (with quotes) or boolean values
- The action will only fetch repositories that have the specified topic
- Maximum of 100 repositories can be displayed
