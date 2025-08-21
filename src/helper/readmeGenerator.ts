import { Repository } from '../fetcher/githubApi';
import * as core from '@actions/core';

export interface GeneratorOptions {
  format: 'list' | 'card' | 'table';
  title?: string;
  showDescription?: boolean;
  showLanguage?: boolean;
  showStars?: boolean;
  showTopics?: boolean;
  showForks?: boolean;
  maxRepos?: number;
}

interface DisplayOptions {
  showDescription: boolean;
  showLanguage: boolean;
  showStars: boolean;
  showTopics: boolean;
  showForks?: boolean;
}

export class ReadmeGenerator {
  generateContent(repositories: Repository[], options: GeneratorOptions): string {
    const {
      format = 'card',
      title = '🚀 My Projects',
      showDescription = true,
      showLanguage = true,
      showStars = true,
      showTopics = false,
      showForks = false,
      maxRepos = 10,
    } = options;

    const limitedRepos = repositories.slice(0, maxRepos);

    let content = `## ${title}\n\n`;

    if (limitedRepos.length === 0) {
      content += 'No projects found.\n\n';
      return content;
    }

    switch (format) {
      case 'list':
        content += this.generateList(limitedRepos, {
          showDescription,
          showLanguage,
          showStars,
          showForks,
          showTopics,
        });
        break;
      case 'table':
        content += this.generateTable(limitedRepos, {
          showDescription,
          showLanguage,
          showStars,
          showForks,
          showTopics,
        });
        break;
      case 'card':
      default:
        content += this.generateCards(limitedRepos, {
          showDescription,
          showLanguage,
          showStars,
          showForks,
          showTopics,
        });
        break;
    }

    content += '\n---\n';
    content += `*Updated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}*\n\n`;

    return content;
  }

  private generateList(repositories: Repository[], options: DisplayOptions): string {
    let content = '';

    repositories.forEach((repo) => {
      content += `- ### 🧑‍💻 **[${repo.name}](${repo.html_url})**`;
      content += '\n';

      const badges = this.generateBadges(repo, options);
      if (badges) {
        content += `   ${badges}\n`;
      }
      content += '\n';

      if (options.showDescription && repo.description) {
        content += `   ${repo.description}\t`;
      }
      if (repo.homepage) {
        content += `   [Visit Website](${repo.homepage})\n`;
      }
      content += '\n';
    });

    return content + '\n';
  }

  private generateTable(repositories: Repository[], options: DisplayOptions): string {
    let content = '<table>\n';

    // Generate table header
    content += '  <thead>\n    <tr>\n';
    content += '      <th>Repository</th>\n';
    content += '      <th>Description</th>\n';

    if (options.showLanguage) content += '      <th>Language</th>\n';
    if (options.showStars) content += '      <th>Stars</th>\n';
    if (options.showForks) content += '      <th>Forks</th>\n';
    if (options.showTopics) content += '      <th>Topics</th>\n';

    content += '    </tr>\n  </thead>\n';

    // Generate table body
    content += '  <tbody>\n';

    repositories.forEach((repo) => {
      content += '    <tr>\n';

      // Repository name and link
      content += `      <td><a href="${repo.html_url}" target="_blank"><strong>${repo.name}</strong></a></td>\n`;

      // Description
      let description = repo.description || 'No description';
      description = description.length > 150 ? description.slice(0, 150) + '...' : description;
      const homeUrl = repo.homepage
        ? `<br><a href="${repo.homepage}" target="_blank"><strong>Live Website</strong></a>`
        : '';
      content += `      <td>${this.escapeHtml(description)} ${homeUrl}</td>\n`;

      // Language
      if (options.showLanguage) {
        const language = repo.language || 'None Detected';
        const languageWithBadge = language
          ? `<img src="https://img.shields.io/badge/-${encodeURIComponent(language)}-blue?style=flat-square" alt="${repo.language}"/>`
          : 'N/A';
        content += `      <td>${languageWithBadge}</td>\n`;
      }

      // Stars
      if (options.showStars) {
        content += `      <td>⭐ ${repo.stargazers_count}</td>\n`;
      }

      // Forks
      if (options.showForks) {
        content += `      <td>🔀 ${repo.forks_count}</td>\n`;
      }

      // Topics
      if (options.showTopics) {
        const topicBadges = repo.topics
          .slice(0, 3)
          .map(
            (topic) =>
              `<span style="background-color: #f1f8ff; color: #0366d6; padding: 2px 6px; border-radius: 3px; font-size: 12px; margin-right: 4px;">${this.escapeHtml(topic)}</span>`
          )
          .join('');
        content += `      <td>${topicBadges || 'None'}</td>\n`;
      }

      content += '    </tr>\n';
    });

    content += '  </tbody>\n</table>\n\n';

    return content;
  }

  private generateCards(repositories: Repository[], options: DisplayOptions): string {
    let content =
      '<div style="display: flex; flex-wrap: wrap; justify-content: left; gap: 4px">\n\n';

    repositories.forEach((repo, index) => {
      if (index > 0 && index % 2 === 0) {
        content += '\n';
      }

      content += `<a href="${repo.html_url}">\n`;

      // Build query parameters for github-readme-stats based on options
      const username = repo.full_name.split('/')[0] || '';
      const params = new URLSearchParams({
        username: username,
        repo: repo.name,
        theme: 'default',
        show_owner: 'true',
        description_lines_count: options.showDescription ? '2' : '0',
        hide: options.showDescription ? '' : 'description',
        hide_language: options.showLanguage ? 'false' : 'true',
        show_icons: 'true',
        show_stars: options.showStars ? 'true' : 'false',
        show_forks: options.showForks ? 'true' : 'false',
        show_topics: options.showTopics ? 'true' : 'false',
      });

      //   if (!options.showDescription) {
      //     params.append('hide', 'description');
      //   }

      //   if (!options.showLanguage) {
      //     params.append('hide_language', 'true');
      //   }

      content += `  <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?${params.toString()}" />\n`;
      content += `</a>\n`;

      if (index < repositories.length - 1 && index % 2 === 0) {
        content += '\n';
      }
    });

    content += '\n</div>\n\n';
    return content;
  }

  private generateBadges(repo: Repository, options: DisplayOptions): string {
    const badges = [];

    if (options.showLanguage && repo.language) {
      badges.push(
        `![${repo.language}](https://img.shields.io/badge/-${encodeURIComponent(repo.language)}-blue)`
      );
    }

    if (options.showStars) {
      badges.push(`![Stars](https://img.shields.io/badge/⭐-${repo.stargazers_count}-yellow)`);
    }

    if (options.showForks) {
      badges.push(`![Forks](https://img.shields.io/badge/🔀-${repo.forks_count}-orange)`);
    }

    return badges.join(' ');
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  updateReadmeContent(
    currentContent: string,
    newContent: string,
    startMarker: string,
    endMarker: string
  ): string {
    const startIndex = currentContent.indexOf(startMarker);
    const endIndex = currentContent.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
      core.warning('Markers not found in README. Appending content to the end.');
      return currentContent + '\n\n' + startMarker + '\n' + newContent + endMarker + '\n';
    }

    const before = currentContent.substring(0, startIndex + startMarker.length);
    const after = currentContent.substring(endIndex);

    return before + '\n' + newContent + after;
  }
}
