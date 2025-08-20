import { GitHubApiService } from '../src/fetcher/githubApi';
import * as core from '@actions/core';

// Mock @actions/core
jest.mock('@actions/core');
const mockedCore = core as jest.Mocked<typeof core>;

// Mock @octokit/rest
const mockListForUser = jest.fn();
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        listForUser: mockListForUser,
      },
    },
  })),
}));

describe('GitHubApiService', () => {
  let service: GitHubApiService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Initialize the service with a fake token
    service = new GitHubApiService('fake-token');
  });

  describe('getRepositoriesWithTopic', () => {
    it('should fetch repositories with specified topic', async () => {
      const mockRepos = [
        {
          name: 'repo1',
          full_name: 'user/repo1',
          description: 'Test repository 1',
          html_url: 'https://github.com/user/repo1',
          language: 'TypeScript',
          stargazers_count: 10,
          topics: ['showcase', 'project'],
          homepage: null,
          forks_count: 5,
          updated_at: '2023-01-01T00:00:00Z',
        },
        {
          name: 'repo2',
          full_name: 'user/repo2',
          description: 'Test repository 2',
          html_url: 'https://github.com/user/repo2',
          language: 'JavaScript',
          stargazers_count: 5,
          topics: ['other-topic'],
          homepage: 'https://example.com',
          forks_count: 2,
          updated_at: '2023-01-02T00:00:00Z',
        },
        {
          name: 'repo3',
          full_name: 'user/repo3',
          description: 'Test repository 3',
          html_url: 'https://github.com/user/repo3',
          language: 'Python',
          stargazers_count: 15,
          topics: ['showcase'],
          homepage: null,
          forks_count: 8,
          updated_at: '2023-01-03T00:00:00Z',
        },
      ];

      mockListForUser.mockResolvedValue({
        data: mockRepos,
      });

      const result = await service.getRepositoriesWithTopic('testuser', 'showcase');

      expect(mockListForUser).toHaveBeenCalledWith({
        username: 'testuser',
        type: 'owner',
        sort: 'updated',
        per_page: 100,
      });

      expect(result).toHaveLength(2);

      expect(result[0]!.name).toBe('repo1');
      expect(result[1]!.name).toBe('repo3');

      expect(mockedCore.info).toHaveBeenCalledWith(
        'Fetching repositories for user: testuser with topic: showcase'
      );
      expect(mockedCore.info).toHaveBeenCalledWith('Found 2 repositories with topic: showcase');
    });

    it('should handle repositories without topics', async () => {
      const mockRepos = [
        {
          name: 'repo1',
          full_name: 'user/repo1',
          description: 'Test repository 1',
          html_url: 'https://github.com/user/repo1',
          language: 'TypeScript',
          stargazers_count: 10,
          topics: null,
          homepage: null,
          forks_count: 0,
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockListForUser.mockResolvedValue({
        data: mockRepos,
      });

      const result = await service.getRepositoriesWithTopic('testuser', 'showcase');

      expect(result).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockListForUser.mockRejectedValue(error);

      await expect(service.getRepositoriesWithTopic('testuser', 'showcase')).rejects.toThrow(
        'API Error'
      );
      expect(mockedCore.setFailed).toHaveBeenCalledWith('Failed to fetch repositories: API Error');
    });

    it('should return empty array when no repositories match', async () => {
      mockListForUser.mockResolvedValue({
        data: [],
      });

      const result = await service.getRepositoriesWithTopic('testuser', 'showcase');

      expect(result).toHaveLength(0);
      expect(mockedCore.info).toHaveBeenCalledWith('Found 0 repositories with topic: showcase');
    });
  });
});
