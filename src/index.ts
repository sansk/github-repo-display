import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHubApiService } from './fetcher/githubApi';
import { ReadmeGenerator, GeneratorOptions } from './helper/readmeGenerator';
import { FileService } from './helper/fileService';

async function run(): Promise<void> {
  try {
    // Get inputs
    const token = core.getInput('token', { required: true });
    const username = core.getInput('username', { required: true });
    const topic = core.getInput('topic') || 'showcase';
    const format = (core.getInput('format') as 'list' | 'card' | 'table') || 'card';
    const readmePath = core.getInput('readme_path') || 'README.md';
    const title = core.getInput('title') || '🚀 Showcase Projects';
    const maxRepos = parseInt(core.getInput('max_repos') || '10');
    const showDescription = core.getBooleanInput('show_description') !== false;
    const showLanguage = core.getBooleanInput('show_language') !== false;
    const showStars = core.getBooleanInput('show_stars') !== false;
    const showForks = core.getBooleanInput('show_forks') !== false;
    const showTopics = core.getBooleanInput('show_topics') || false;
    const commitMessage = core.getInput('commit_message') || 'Update showcase projects';
    const startMarker = core.getInput('start_marker') || '<!-- SHOWCASE-START -->';
    const endMarker = core.getInput('end_marker') || '<!-- SHOWCASE-END -->';
    const commitChanges = core.getBooleanInput('commit_changes') !== false;

    core.info('🚀 Starting Showcase Projects Action');
    core.info(`Configuration:
      - Username: ${username}
      - Topic: ${topic}
      - Format: ${format}
      - README Path: ${readmePath}
      - Max Repos: ${maxRepos}
      - Commit Changes: ${commitChanges}`);

    // Initialize services
    const githubApi = new GitHubApiService(token);
    const readmeGenerator = new ReadmeGenerator();
    const fileService = new FileService(token);

    // Fetch repositories with the specified topic
    const repositories = await githubApi.getRepositoriesWithTopic(username, topic);

    if (repositories.length === 0) {
      core.warning(`No repositories found with topic: ${topic}`);
    }

    // Generate README content
    const generatorOptions: GeneratorOptions = {
      format,
      title,
      showDescription,
      showLanguage,
      showStars,
      showForks,
      showTopics,
      maxRepos,
    };

    const showcaseContent = readmeGenerator.generateContent(repositories, generatorOptions);
    core.info('Generated showcase content successfully');

    // Read current README
    const currentReadmeContent = await fileService.readReadmeFile(readmePath);

    // Update README with new content
    const updatedReadmeContent = readmeGenerator.updateReadmeContent(
      currentReadmeContent,
      showcaseContent,
      startMarker,
      endMarker
    );

    // Write updated README
    await fileService.writeReadmeFile(readmePath, updatedReadmeContent);

    // Commit changes if requested
    if (commitChanges && github.context.repo) {
      const { owner, repo } = github.context.repo;
      await fileService.commitAndPushChanges(
        owner,
        repo,
        readmePath,
        updatedReadmeContent,
        commitMessage
      );
      core.info('Changes committed and pushed successfully');
    }

    // Set outputs
    core.setOutput('repositories_count', repositories.length);
    core.setOutput('updated_content', showcaseContent);

    core.info('✅ Showcase Projects Action completed successfully');
  } catch (error) {
    core.setFailed(`Action failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Only run if this is the main module
if (require.main === module) {
  run();
}

export { run };
