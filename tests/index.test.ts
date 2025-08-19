// This test suite covers the main functionality of the GitHub Action, ensuring that it behaves correctly
// with various inputs and handles errors gracefully. It mocks all dependencies to isolate the action's logic
import { run } from '../src/index';
import * as core from '@actions/core';
import * as github from '@actions/github';

// Mock all dependencies
jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('../src/fetcher/githubApi');
jest.mock('../src/helper/readmeGenerator');
jest.mock('../src/helper/fileService');

const mockedCore = core as jest.Mocked<typeof core>;
const mockedGithub = github as jest.Mocked<typeof github>;

// Mock implementations
const mockGetRepositoriesWithTopic = jest.fn();
const mockGenerateContent = jest.fn();
const mockUpdateReadmeContent = jest.fn();
const mockReadReadmeFile = jest.fn();
const mockWriteReadmeFile = jest.fn();
const mockCommitAndPushChanges = jest.fn();

jest.mock('../src/fetcher/githubApi', () => ({
  GitHubApiService: jest.fn().mockImplementation(() => ({
    getRepositoriesWithTopic: mockGetRepositoriesWithTopic,
  })),
}));

jest.mock('../src/helper/readmeGenerator', () => ({
  ReadmeGenerator: jest.fn().mockImplementation(() => ({
    generateContent: mockGenerateContent,
    updateReadmeContent: mockUpdateReadmeContent,
  })),
}));

jest.mock('../src/helper/fileService', () => ({
  FileService: jest.fn().mockImplementation(() => ({
    readReadmeFile: mockReadReadmeFile,
    writeReadmeFile: mockWriteReadmeFile,
    commitAndPushChanges: mockCommitAndPushChanges,
  })),
}));

describe('Main Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockedCore.getInput.mockImplementation((name: string) => {
      const inputs: { [key: string]: string } = {
        token: 'fake-token',
        username: 'testuser',
        topic: 'showcase',
        format: 'card',
        readme_path: 'README.md',
        title: '🚀 Showcase Projects',
        max_repos: '10',
        commit_message: 'Update showcase projects',
        start_marker: '<!-- SHOWCASE-START -->',
        end_marker: '<!-- SHOWCASE-END -->',
      };
      return inputs[name] || '';
    });

    mockedCore.getBooleanInput.mockImplementation((name: string) => {
      const booleanInputs: { [key: string]: boolean } = {
        show_description: true,
        show_language: true,
        show_stars: true,
        show_topics: false,
        commit_changes: true,
      };
      return booleanInputs[name] !== undefined ? booleanInputs[name] : false;
    });

    /**
    mockedGithub.context = {
      repo: {
        owner: 'testowner',
        repo: 'testrepo',
      },
    } as any;
    **/

    Object.defineProperty(mockedGithub, 'context', {
      value: {
        repo: {
          owner: 'testowner',
          repo: 'testrepo',
        },
      },
      writable: true,
      configurable: true,
    });

    // Setup mock returns
    mockGetRepositoriesWithTopic.mockResolvedValue([
      {
        name: 'test-repo',
        full_name: 'testuser/test-repo',
        description: 'A test repository',
        html_url: 'https://github.com/testuser/test-repo',
        language: 'TypeScript',
        stargazers_count: 10,
        topics: ['showcase'],
        updated_at: '2023-01-01T00:00:00Z',
      },
    ]);

    mockGenerateContent.mockReturnValue('Generated showcase content');
    mockReadReadmeFile.mockResolvedValue('Existing README content');
    mockUpdateReadmeContent.mockReturnValue('Updated README content');
  });

  it('should successfully execute with default inputs', async () => {
    await run();

    expect(mockGetRepositoriesWithTopic).toHaveBeenCalledWith('testuser', 'showcase');
    expect(mockGenerateContent).toHaveBeenCalled();
    expect(mockReadReadmeFile).toHaveBeenCalledWith('README.md');
    expect(mockWriteReadmeFile).toHaveBeenCalledWith('README.md', 'Updated README content');
    expect(mockCommitAndPushChanges).toHaveBeenCalledWith(
      'testowner',
      'testrepo',
      'README.md',
      'Updated README content',
      'Update showcase projects'
    );

    expect(mockedCore.setOutput).toHaveBeenCalledWith('repositories_count', 1);
    expect(mockedCore.setOutput).toHaveBeenCalledWith(
      'updated_content',
      'Generated showcase content'
    );
    expect(mockedCore.info).toHaveBeenCalledWith(
      '✅ Showcase Projects Action completed successfully'
    );
  });

  it('should handle when no repositories are found', async () => {
    mockGetRepositoriesWithTopic.mockResolvedValue([]);

    await run();

    expect(mockedCore.warning).toHaveBeenCalledWith('No repositories found with topic: showcase');
    expect(mockedCore.setOutput).toHaveBeenCalledWith('repositories_count', 0);
  });

  it('should skip committing when commit_changes is false', async () => {
    mockedCore.getBooleanInput.mockImplementation((name: string) => {
      if (name === 'commit_changes') return false;
      return true;
    });

    await run();

    expect(mockCommitAndPushChanges).not.toHaveBeenCalled();
    expect(mockWriteReadmeFile).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Test error');
    mockGetRepositoriesWithTopic.mockRejectedValue(error);

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('Action failed: Test error');
  });

  it('should use custom configuration', async () => {
    mockedCore.getInput.mockImplementation((name: string) => {
      const customInputs: { [key: string]: string } = {
        token: 'custom-token',
        username: 'customuser',
        topic: 'custom-topic',
        format: 'table',
        max_repos: '5',
        title: 'My Custom Projects',
      };
      return customInputs[name] || '';
    });

    await run();

    expect(mockGetRepositoriesWithTopic).toHaveBeenCalledWith('customuser', 'custom-topic');
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        format: 'table',
        maxRepos: 5,
        title: 'My Custom Projects',
      })
    );
  });
});
