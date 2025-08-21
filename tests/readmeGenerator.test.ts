import { ReadmeGenerator, GeneratorOptions } from '../src/helper/readmeGenerator';
import { Repository } from '../src/fetcher/githubApi';
import * as core from '@actions/core';

// Mock @actions/core
jest.mock('@actions/core');
const mockCore = core as jest.Mocked<typeof core>;

describe('ReadmeGenerator', () => {
  let generator: ReadmeGenerator;
  let mockRepositories: Repository[];

  // Helper function to create Repository objects with proper typing
  const createRepository = (overrides: Partial<Repository> = {}): Repository => ({
    name: 'default-repo',
    full_name: 'user/default-repo',
    description: 'Default description',
    html_url: 'https://github.com/user/default-repo',
    language: 'TypeScript',
    stargazers_count: 0,
    forks_count: 0,
    topics: [],
    updated_at: '2023-01-01T00:00:00Z',
    homepage: null,
    ...overrides,
  });

  beforeEach(() => {
    generator = new ReadmeGenerator();
    jest.clearAllMocks();

    mockRepositories = [
      createRepository({
        name: 'awesome-project',
        full_name: 'user/awesome-project',
        description: 'An awesome project that does amazing things',
        html_url: 'https://github.com/user/awesome-project',
        language: 'TypeScript',
        stargazers_count: 42,
        forks_count: 5,
        topics: ['showcase', 'typescript', 'project'],
        updated_at: '2023-01-01T00:00:00Z',
        homepage: 'https://awesome-project.com',
      }),
      createRepository({
        name: 'cool-app',
        full_name: 'user/cool-app',
        description: 'A very cool application',
        html_url: 'https://github.com/user/cool-app',
        language: 'JavaScript',
        stargazers_count: 123,
        forks_count: 8,
        topics: ['showcase', 'javascript'],
        updated_at: '2023-01-02T00:00:00Z',
        homepage: null,
      }),
    ];
  });

  describe('generateContent', () => {
    it('should generate card format by default', () => {
      const options: GeneratorOptions = {
        format: 'card',
        title: 'Test Projects',
      };

      const result = generator.generateContent(mockRepositories, options);

      expect(result).toContain('## Test Projects');
      expect(result).toContain(
        '<div style="display: flex; flex-wrap: wrap; justify-content: left; gap: 4px">'
      );
      expect(result).toContain('github-readme-stats.vercel.app');
      expect(result).toContain('awesome-project');
      expect(result).toContain('cool-app');
    });

    it('should generate list format with all options enabled', () => {
      const options: GeneratorOptions = {
        format: 'list',
        showDescription: true,
        showLanguage: true,
        showStars: true,
        showForks: true,
        showTopics: true,
      };

      const result = generator.generateContent(mockRepositories, options);

      expect(result).toContain(
        '- ### 🧑‍💻 **[awesome-project](https://github.com/user/awesome-project)**'
      );
      expect(result).toContain('![TypeScript]');
      expect(result).toContain('![Stars]');
      expect(result).toContain('![Forks]');
      expect(result).toContain('An awesome project that does amazing things');
      expect(result).toContain('[Visit Website](https://awesome-project.com)');
    });

    it('should generate list format without homepage link when not provided', () => {
      const reposWithoutHomepage: Repository[] = [
        createRepository({
          name: 'cool-app',
          full_name: 'user/cool-app',
          description: 'A very cool application',
          html_url: 'https://github.com/user/cool-app',
          language: 'JavaScript',
          stargazers_count: 123,
          forks_count: 8,
          topics: ['showcase', 'javascript'],
          updated_at: '2023-01-02T00:00:00Z',
          homepage: null,
        }),
      ];

      const options: GeneratorOptions = {
        format: 'list',
        showDescription: true,
      };

      const result = generator.generateContent(reposWithoutHomepage, options);

      expect(result).not.toContain('[Visit Website]');
    });

    it('should generate table format with all options', () => {
      const options: GeneratorOptions = {
        format: 'table',
        showLanguage: true,
        showStars: true,
        showForks: true,
        showTopics: true,
        showDescription: true,
      };

      const result = generator.generateContent(mockRepositories, options);

      // Check table structure
      expect(result).toContain('<table>');
      expect(result).toContain('</table>');
      expect(result).toContain('<thead>');
      expect(result).toContain('<tbody>');

      // Check table headers
      expect(result).toContain('<th>Repository</th>');
      expect(result).toContain('<th>Description</th>');
      expect(result).toContain('<th>Language</th>');
      expect(result).toContain('<th>Stars</th>');
      expect(result).toContain('<th>Forks</th>');
      expect(result).toContain('<th>Topics</th>');

      // Check repository data
      expect(result).toContain(
        '<a href="https://github.com/user/awesome-project" target="_blank"><strong>awesome-project</strong></a>'
      );
      expect(result).toContain('An awesome project that does amazing things');

      // Check language badge
      expect(result).toContain('https://img.shields.io/badge/-TypeScript-blue?style=flat-square');

      // Check stars and forks
      expect(result).toContain('⭐ 42');
      expect(result).toContain('🔀 5');

      // Check topics with styled spans
      expect(result).toContain('background-color: #f1f8ff');
      expect(result).toContain('showcase');
      expect(result).toContain('typescript');

      // Check homepage link
      expect(result).toContain(
        '<a href="https://awesome-project.com" target="_blank"><strong>Live Website</strong></a>'
      );
    });

    it('should generate table format without optional columns', () => {
      const options: GeneratorOptions = {
        format: 'table',
        showLanguage: false,
        showStars: false,
        showForks: false,
        showTopics: false,
        showDescription: true,
      };

      const result = generator.generateContent(mockRepositories, options);

      // Should only have Repository and Description columns
      expect(result).toContain('<th>Repository</th>');
      expect(result).toContain('<th>Description</th>');
      expect(result).not.toContain('<th>Language</th>');
      expect(result).not.toContain('<th>Stars</th>');
      expect(result).not.toContain('<th>Forks</th>');
      expect(result).not.toContain('<th>Topics</th>');
    });

    it('should handle repositories with no language', () => {
      const reposWithoutLanguage: Repository[] = [
        createRepository({
          name: 'awesome-project',
          full_name: 'user/awesome-project',
          description: 'An awesome project that does amazing things',
          html_url: 'https://github.com/user/awesome-project',
          language: null,
          stargazers_count: 42,
          forks_count: 5,
          topics: ['showcase', 'typescript', 'project'],
          updated_at: '2023-01-01T00:00:00Z',
          homepage: 'https://awesome-project.com',
        }),
      ];

      const options: GeneratorOptions = {
        format: 'table',
        showLanguage: true,
      };

      const result = generator.generateContent(reposWithoutLanguage, options);

      expect(result).toContain('None Detected');
    });

    it('should handle repositories with no description', () => {
      const reposWithoutDescription: Repository[] = [
        createRepository({
          name: 'awesome-project',
          full_name: 'user/awesome-project',
          description: null,
          html_url: 'https://github.com/user/awesome-project',
          language: 'TypeScript',
          stargazers_count: 42,
          forks_count: 5,
          topics: ['showcase', 'typescript', 'project'],
          updated_at: '2023-01-01T00:00:00Z',
          homepage: 'https://awesome-project.com',
        }),
      ];

      const options: GeneratorOptions = {
        format: 'table',
        showDescription: true,
      };

      const result = generator.generateContent(reposWithoutDescription, options);

      expect(result).toContain('No description');
    });

    it('should handle repositories with very long descriptions', () => {
      const reposWithLongDescription: Repository[] = [
        createRepository({
          name: 'awesome-project',
          description: 'A'.repeat(200), // Very long description
        }),
      ];

      const options: GeneratorOptions = {
        format: 'table',
        showDescription: true,
      };

      const result = generator.generateContent(reposWithLongDescription, options);

      expect(result).toContain('A'.repeat(150) + '...');
    });

    it('should handle repositories with no topics', () => {
      const reposWithoutTopics: Repository[] = [
        createRepository({
          name: 'awesome-project',
          topics: [],
        }),
      ];

      const options: GeneratorOptions = {
        format: 'table',
        showTopics: true,
      };

      const result = generator.generateContent(reposWithoutTopics, options);

      expect(result).toContain('<td>None</td>');
    });

    it('should limit topics display to 3', () => {
      const reposWithManyTopics: Repository[] = [
        createRepository({
          name: 'awesome-project',
          topics: ['topic1', 'topic2', 'topic3', 'topic4', 'topic5'],
        }),
      ];

      const options: GeneratorOptions = {
        format: 'table',
        showTopics: true,
      };

      const result = generator.generateContent(reposWithManyTopics, options);

      expect(result).toContain('topic1');
      expect(result).toContain('topic2');
      expect(result).toContain('topic3');
      expect(result).not.toContain('topic4');
      expect(result).not.toContain('topic5');
    });

    it('should generate cards with different line breaks', () => {
      const manyRepos: Repository[] = Array(5)
        .fill(null)
        .map((_, i) =>
          createRepository({
            name: `repo-${i}`,
            full_name: `user/repo-${i}`,
          })
        );

      const options: GeneratorOptions = {
        format: 'card',
      };

      const result = generator.generateContent(manyRepos, options);

      expect(result).toContain('github-readme-stats.vercel.app');
      // Should have proper line breaks for even indexed items
      const lines = result.split('\n');
      const cardLines = lines.filter((line) => line.includes('github-readme-stats.vercel.app'));
      expect(cardLines.length).toBe(5);
    });

    it('should generate cards with custom options', () => {
      const options: GeneratorOptions = {
        format: 'card',
        showDescription: false,
        showLanguage: false,
        showStars: false,
        showForks: false,
        showTopics: true,
      };

      const result = generator.generateContent(mockRepositories, options);

      expect(result).toContain('description_lines_count=0');
      expect(result).toContain('hide=description');
      expect(result).toContain('hide_language=true');
      expect(result).toContain('show_stars=false');
      expect(result).toContain('show_forks=false');
      expect(result).toContain('show_topics=true');
    });

    it('should limit repositories when maxRepos is specified', () => {
      const options: GeneratorOptions = {
        format: 'list',
        maxRepos: 1,
      };

      const result = generator.generateContent(mockRepositories, options);

      expect(result).toContain('awesome-project');
      expect(result).not.toContain('cool-app');
    });

    it('should handle empty repositories array', () => {
      const options: GeneratorOptions = {
        format: 'card',
      };

      const result = generator.generateContent([], options);

      expect(result).toContain('No projects found.');
    });

    it('should use default options when not specified', () => {
      const options: GeneratorOptions = {
        format: 'card',
      };

      const result = generator.generateContent(mockRepositories, options);

      expect(result).toContain('## 🚀 My Projects'); // Default title
      expect(result).toContain('show_owner=true');
      expect(result).toContain('description_lines_count=2'); // Default showDescription
    });

    it('should include updated timestamp', () => {
      const options: GeneratorOptions = {
        format: 'list',
      };

      const result = generator.generateContent(mockRepositories, options);

      expect(result).toMatch(/\*Updated on .* \d{4}\*/);
    });

    it('should handle list format without optional badges', () => {
      const options: GeneratorOptions = {
        format: 'list',
        showDescription: true,
        showLanguage: false,
        showStars: false,
        showForks: false,
      };

      const result = generator.generateContent(mockRepositories, options);

      expect(result).toContain('awesome-project');
      expect(result).not.toContain('![TypeScript]');
      expect(result).not.toContain('![Stars]');
      expect(result).not.toContain('![Forks]');
    });

    it('should handle repositories with missing language in list format', () => {
      const reposWithoutLanguage: Repository[] = [
        createRepository({
          name: 'awesome-project',
          language: null,
        }),
      ];

      const options: GeneratorOptions = {
        format: 'list',
        showLanguage: true,
      };

      const result = generator.generateContent(reposWithoutLanguage, options);

      // Should not include language badge when language is null
      expect(result).not.toContain('![null]');
    });

    it('should handle repositories without description in list format', () => {
      const reposWithoutDescription: Repository[] = [
        createRepository({
          name: 'awesome-project',
          description: null,
        }),
      ];

      const options: GeneratorOptions = {
        format: 'list',
        showDescription: true,
      };

      const result = generator.generateContent(reposWithoutDescription, options);

      expect(result).toContain('awesome-project');
      // Description section should be minimal or not present
    });

    it('should escape HTML in table format', () => {
      const reposWithHtmlChars: Repository[] = [
        createRepository({
          name: 'awesome-project',
          description: 'Description with <script>alert("xss")</script> & "quotes"',
          topics: ['<tag>', 'safe-topic'],
        }),
      ];

      const options: GeneratorOptions = {
        format: 'table',
        showDescription: true,
        showTopics: true,
      };

      const result = generator.generateContent(reposWithHtmlChars, options);

      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&lt;tag&gt;');
    });

    it('should handle card format with repositories having no full_name username', () => {
      const reposWithoutUsername: Repository[] = [
        createRepository({
          name: 'awesome-project',
          full_name: 'awesome-project', // No slash, no username
        }),
      ];

      const options: GeneratorOptions = {
        format: 'card',
      };

      const result = generator.generateContent(reposWithoutUsername, options);

      expect(result).toContain('username=');
      // Should handle gracefully even with empty username
    });

    it('should generate default format when invalid format is provided', () => {
      const options: GeneratorOptions = {
        format: 'invalid' as any,
      };

      const result = generator.generateContent(mockRepositories, options);

      // Should default to card format
      expect(result).toContain('github-readme-stats.vercel.app');
      expect(result).toContain('<div style="display: flex');
    });
  });

  describe('updateReadmeContent', () => {
    it('should replace content between markers', () => {
      const currentContent = `# My Profile

<!-- SHOWCASE-START -->
Old content here
<!-- SHOWCASE-END -->

Other content`;

      const newContent = 'New showcase content';
      const startMarker = '<!-- SHOWCASE-START -->';
      const endMarker = '<!-- SHOWCASE-END -->';

      const result = generator.updateReadmeContent(
        currentContent,
        newContent,
        startMarker,
        endMarker
      );

      expect(result).toContain(
        '<!-- SHOWCASE-START -->\nNew showcase content<!-- SHOWCASE-END -->'
      );
      expect(result).not.toContain('Old content here');
      expect(result).toContain('# My Profile');
      expect(result).toContain('Other content');
    });

    it('should append content when markers are not found', () => {
      const currentContent = `# My Profile

Some existing content`;

      const newContent = 'New showcase content';
      const startMarker = '<!-- SHOWCASE-START -->';
      const endMarker = '<!-- SHOWCASE-END -->';

      const result = generator.updateReadmeContent(
        currentContent,
        newContent,
        startMarker,
        endMarker
      );

      expect(result).toContain('# My Profile');
      expect(result).toContain('Some existing content');
      expect(result).toContain(
        '<!-- SHOWCASE-START -->\nNew showcase content<!-- SHOWCASE-END -->'
      );
      expect(mockCore.warning).toHaveBeenCalledWith(
        'Markers not found in README. Appending content to the end.'
      );
    });

    it('should handle when only start marker is found', () => {
      const currentContent = `# My Profile

<!-- SHOWCASE-START -->
Some content without end marker`;

      const newContent = 'New showcase content';
      const startMarker = '<!-- SHOWCASE-START -->';
      const endMarker = '<!-- SHOWCASE-END -->';

      const result = generator.updateReadmeContent(
        currentContent,
        newContent,
        startMarker,
        endMarker
      );

      expect(result).toContain('# My Profile');
      expect(result).toContain(
        '<!-- SHOWCASE-START -->\nNew showcase content<!-- SHOWCASE-END -->'
      );
      expect(mockCore.warning).toHaveBeenCalledWith(
        'Markers not found in README. Appending content to the end.'
      );
    });

    it('should handle when only end marker is found', () => {
      const currentContent = `# My Profile

Some content without start marker
<!-- SHOWCASE-END -->`;

      const newContent = 'New showcase content';
      const startMarker = '<!-- SHOWCASE-START -->';
      const endMarker = '<!-- SHOWCASE-END -->';

      const result = generator.updateReadmeContent(
        currentContent,
        newContent,
        startMarker,
        endMarker
      );

      expect(result).toContain('# My Profile');
      expect(result).toContain(
        '<!-- SHOWCASE-START -->\nNew showcase content<!-- SHOWCASE-END -->'
      );
      expect(mockCore.warning).toHaveBeenCalledWith(
        'Markers not found in README. Appending content to the end.'
      );
    });

    it('should handle empty current content', () => {
      const currentContent = '';
      const newContent = 'New showcase content';
      const startMarker = '<!-- SHOWCASE-START -->';
      const endMarker = '<!-- SHOWCASE-END -->';

      const result = generator.updateReadmeContent(
        currentContent,
        newContent,
        startMarker,
        endMarker
      );

      expect(result).toContain(
        '<!-- SHOWCASE-START -->\nNew showcase content<!-- SHOWCASE-END -->'
      );
    });

    it('should handle multiple occurrences of markers (should use first occurrence)', () => {
      const currentContent = `# My Profile

<!-- SHOWCASE-START -->
First section
<!-- SHOWCASE-END -->

Some other content

<!-- SHOWCASE-START -->
Second section
<!-- SHOWCASE-END -->`;

      const newContent = 'New showcase content';
      const startMarker = '<!-- SHOWCASE-START -->';
      const endMarker = '<!-- SHOWCASE-END -->';

      const result = generator.updateReadmeContent(
        currentContent,
        newContent,
        startMarker,
        endMarker
      );

      // Should replace the first occurrence
      expect(result).toContain(
        '<!-- SHOWCASE-START -->\nNew showcase content<!-- SHOWCASE-END -->'
      );
      expect(result).not.toContain('First section');
      // Second section should remain
      expect(result).toContain('Second section');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle repositories with zero stars and forks', () => {
      const reposWithZeroStats: Repository[] = [
        createRepository({
          name: 'awesome-project',
          stargazers_count: 0,
          forks_count: 0,
        }),
      ];

      const options: GeneratorOptions = {
        format: 'table',
        showStars: true,
        showForks: true,
      };

      const result = generator.generateContent(reposWithZeroStats, options);

      expect(result).toContain('⭐ 0');
      expect(result).toContain('🔀 0');
    });

    it('should handle special characters in repository names and URLs', () => {
      const reposWithSpecialChars: Repository[] = [
        createRepository({
          name: 'repo-with-special-chars!@#$%',
          html_url: 'https://github.com/user/repo-with-special-chars!@#$%',
          language: 'C++',
        }),
      ];

      const options: GeneratorOptions = {
        format: 'list',
        showLanguage: true,
      };

      const result = generator.generateContent(reposWithSpecialChars, options);

      expect(result).toContain('repo-with-special-chars!@#$%');
      expect(result).toContain('C%2B%2B'); // URL encoded
    });

    it('should handle very large numbers for stars and forks', () => {
      const reposWithLargeStats: Repository[] = [
        createRepository({
          name: 'awesome-project',
          stargazers_count: 999999,
          forks_count: 555555,
        }),
      ];

      const options: GeneratorOptions = {
        format: 'table',
        showStars: true,
        showForks: true,
      };

      const result = generator.generateContent(reposWithLargeStats, options);

      expect(result).toContain('⭐ 999999');
      expect(result).toContain('🔀 555555');
    });

    it('should handle repositories with null/undefined values', () => {
      const reposWithNullValues: Repository[] = [
        createRepository({
          name: 'test-repo',
          full_name: 'user/test-repo',
          description: null,
          html_url: 'https://github.com/user/test-repo',
          language: null,
          stargazers_count: 0,
          forks_count: 0,
          topics: [],
          updated_at: '2023-01-01T00:00:00Z',
          homepage: null,
        }),
      ];

      const options: GeneratorOptions = {
        format: 'table',
        showDescription: true,
        showLanguage: true,
        showTopics: true,
      };

      const result = generator.generateContent(reposWithNullValues, options);

      expect(result).toContain('No description');
      expect(result).toContain('None Detected');
      expect(result).toContain('None</td>'); // Topics
    });
  });
});
