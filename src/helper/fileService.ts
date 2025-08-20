import * as fs from 'fs/promises';
import * as core from '@actions/core';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';

// Added to avaoid eslinting errors - @typescript-eslint/no-explicit-any
type CreateOrUpdateFileContentsParams =
  RestEndpointMethodTypes['repos']['createOrUpdateFileContents']['parameters'];

export class FileService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async readReadmeFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      core.info(`Successfully read README file: ${filePath}`);
      return content;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        core.warning(`README file not found: ${filePath}. Creating a new one.`);
        return this.createDefaultReadme();
      }
      throw error;
    }
  }

  async writeReadmeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      core.info(`Successfully wrote README file: ${filePath}`);
    } catch (error) {
      core.setFailed(`Failed to write README file: ${(error as Error).message}`);
      throw error;
    }
  }

  async commitAndPushChanges(
    owner: string,
    repo: string,
    filePath: string,
    content: string,
    commitMessage: string,
    branch = 'main'
  ): Promise<void> {
    try {
      // Get current file SHA if it exists
      let sha: string | undefined;
      try {
        const { data: currentFile } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref: branch,
        });

        if (!Array.isArray(currentFile) && currentFile.type === 'file') {
          sha = currentFile.sha;
        }
      } catch (error) {
        // File doesn't exist, that's okay
        core.info(
          'README file does not exist in repository. Creating new file.' + (error as Error).message
        );
      }

      // Create or update the file
      //   const requestParams: any = {
      //     owner,
      //     repo,
      //     path: filePath,
      //     message: commitMessage,
      //     content: Buffer.from(content).toString('base64'),
      //     branch,
      //   };

      // Added as a result of eslinting error. - @typescript-eslint/no-explicit-any
      const requestParams: CreateOrUpdateFileContentsParams = {
        owner,
        repo,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(content).toString('base64'),
        branch,
      };

      // Only include sha if it exists (for updates)
      if (sha) {
        requestParams.sha = sha;
      }

      await this.octokit.rest.repos.createOrUpdateFileContents(requestParams);

      core.info(`Successfully committed changes to ${filePath}`);
    } catch (error) {
      core.setFailed(`Failed to commit changes: ${(error as Error).message}`);
      throw error;
    }
  }

  private createDefaultReadme(): string {
    return `# Welcome to my GitHub Profile! 👋

<!-- SHOWCASE-START -->
<!-- SHOWCASE-END -->

Thanks for visiting my profile!
`;
  }

  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
      core.info(`Directory exists!: ${dirPath} - ` + (error as Error).message);
    }
  }
}
