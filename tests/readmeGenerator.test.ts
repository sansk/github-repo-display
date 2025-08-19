import { ReadmeGenerator, GeneratorOptions } from '../src/helper/readmeGenerator';
import { Repository } from '../src/fetcher/githubApi';

describe('ReadmeGenerator', () => {
  let generator: ReadmeGenerator;
  let mockRepositories: Repository[];

  beforeEach(() => {
    generator = new ReadmeGenerator();
    mockRepositories = [
      {
        name: 'awesome-project',
        full_name: 'user/awesome-project',
        description: 'An awesome project that does amazing things',
        html_url: 'https://github.com/user/awesome-project',
        language: 'TypeScript',
        stargazers_count: 42,
        forks_count: 5,
        topics: ['showcase', 'typescript', 'project'],
        updated_at: '2023-01-01T00:00:00Z',
      },
      {
        name: 'cool-app',
        full_name: 'user/cool-app',
        description: 'A very cool application',
        html_url: 'https://github.com/user/cool-app',
        language: 'JavaScript',
        stargazers_count: 123,
        forks_count: 8,
        topics: ['showcase', 'javascript'],
        updated_at: '2023-01-02T00:00:00Z',
      },
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
      expect(result).toContain('<div align="left">');
      expect(result).toContain('github-readme-stats.vercel.app');
      expect(result).toContain('awesome-project');
      expect(result).toContain('cool-app');
    });

    it('should generate list format', () => {
      const options: GeneratorOptions = {
        format: 'list',
        showDescription: true,
        showLanguage: true,
        showStars: true,
      };

      const result = generator.generateContent(mockRepositories, options);

      expect(result).toContain(
        '- ### 🧑‍💻 **[awesome-project](https://github.com/user/awesome-project)**'
      );
      expect(result).toContain('![TypeScript]');
      expect(result).toContain('![Stars]');
      expect(result).toContain('An awesome project that does amazing things');
    });

    // it('should generate table format', () => {
    //   const options: GeneratorOptions = {
    //     format: 'table',
    //     showLanguage: true,
    //     showStars: true,
    //     showTopics: true,
    //   };

    //   const result = generator.generateContent(mockRepositories, options);

    //   expect(result).toContain('| Repository | Description | Language | Stars | Topics |');
    //   expect(result).toContain('|------------|-------------|----------|-------|-------|');
    //   expect(result).toContain(
    //     '| [awesome-project](https://github.com/user/awesome-project) | An awesome project that does amazing things | TypeScript | ⭐ 42'
    //   );
    //   expect(result).toContain('`showcase` `typescript` `project`');
    // });
    it('should generate table format', () => {
      const options: GeneratorOptions = {
        format: 'table',
        showLanguage: true,
        showStars: true,
        showForks: true,
        showTopics: true,
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

      // Check stars
      expect(result).toContain('⭐ 42');
      expect(result).toContain('⭐ 123');

      // Check forks
      expect(result).toContain('🔀 5');
      expect(result).toContain('🔀 8');

      // Check topics with styled spans
      expect(result).toContain('background-color: #f1f8ff');
      expect(result).toContain('showcase');
      expect(result).toContain('typescript');
      expect(result).toContain('project');

      // Check both repositories are present
      expect(result).toContain('awesome-project');
      expect(result).toContain('cool-app');

      // Check homepage link if present
      expect(result).toContain('<a href="');
      expect(result).toContain('target="_blank"');

      // Check description truncation doesn't affect these short descriptions
      expect(result).not.toContain('...');
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

    it('should include updated timestamp', () => {
      const options: GeneratorOptions = {
        format: 'list',
      };

      const result = generator.generateContent(mockRepositories, options);

      expect(result).toMatch(/\*Updated on .* \d{4}\*/);
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
    });
  });
});
