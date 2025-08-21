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

    it('should handle repositories with undefined/null values and apply defaults', async () => {
      const mockRepos = [
        {
          name: 'repo-with-nulls',
          full_name: 'user/repo-with-nulls',
          description: null,
          html_url: 'https://github.com/user/repo-with-nulls',
          language: null, // This will test the null coalescing for language
          stargazers_count: undefined, // This will test the undefined fallback
          topics: ['showcase'],
          homepage: undefined, // This will test the undefined fallback
          forks_count: null, // This will test the null fallback
          updated_at: null, // This will test the null fallback for updated_at
        },
        {
          name: 'repo-with-missing-fields',
          full_name: 'user/repo-with-missing-fields',
          description: 'Test repository',
          html_url: 'https://github.com/user/repo-with-missing-fields',
          // language is completely missing
          // stargazers_count is completely missing
          topics: ['showcase'],
          // homepage is completely missing
          // forks_count is completely missing
          // updated_at is completely missing
        },
      ];

      mockListForUser.mockResolvedValue({
        data: mockRepos,
      });

      const result = await service.getRepositoriesWithTopic('testuser', 'showcase');

      expect(result).toHaveLength(2);

      // Test first repo with null/undefined values
      expect(result[0]).toEqual({
        name: 'repo-with-nulls',
        full_name: 'user/repo-with-nulls',
        description: null,
        html_url: 'https://github.com/user/repo-with-nulls',
        language: null, // null coalescing should preserve null
        stargazers_count: 0, // undefined should fallback to 0
        topics: ['showcase'],
        homepage: null, // undefined should fallback to null
        forks_count: 0, // null should fallback to 0
        updated_at: expect.any(String), // null should fallback to current ISO string
      });

      // Test second repo with completely missing fields
      expect(result[1]).toEqual({
        name: 'repo-with-missing-fields',
        full_name: 'user/repo-with-missing-fields',
        description: 'Test repository',
        html_url: 'https://github.com/user/repo-with-missing-fields',
        language: null, // undefined should fallback to null
        stargazers_count: 0, // undefined should fallback to 0
        topics: ['showcase'],
        homepage: null, // undefined should fallback to null
        forks_count: 0, // undefined should fallback to 0
        updated_at: expect.any(String), // undefined should fallback to current ISO string
      });

      // Verify the updated_at fallback generates a valid ISO string
      expect(new Date(result[0]!.updated_at).toISOString()).toBe(result[0]!.updated_at);
      expect(new Date(result[1]!.updated_at).toISOString()).toBe(result[1]!.updated_at);
    });

    it('should handle repositories with empty topics array', async () => {
      const mockRepos = [
        {
          name: 'repo-with-empty-topics',
          full_name: 'user/repo-with-empty-topics',
          description: 'Test repository',
          html_url: 'https://github.com/user/repo-with-empty-topics',
          language: 'TypeScript',
          stargazers_count: 5,
          topics: [], // Empty array
          homepage: null,
          forks_count: 1,
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockListForUser.mockResolvedValue({
        data: mockRepos,
      });

      const result = await service.getRepositoriesWithTopic('testuser', 'showcase');

      expect(result).toHaveLength(0);
      expect(mockedCore.info).toHaveBeenCalledWith('Found 0 repositories with topic: showcase');
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

    it('should handle repositories with topics as undefined (fallback to empty array)', async () => {
      const mockRepos = [
        {
          name: 'repo-with-undefined-topics',
          full_name: 'user/repo-with-undefined-topics',
          description: 'Test repository',
          html_url: 'https://github.com/user/repo-with-undefined-topics',
          language: 'TypeScript',
          stargazers_count: 5,
          topics: undefined, // Undefined topics
          homepage: null,
          forks_count: 1,
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockListForUser.mockResolvedValue({
        data: mockRepos,
      });

      const result = await service.getRepositoriesWithTopic('testuser', 'showcase');

      expect(result).toHaveLength(0);
    });

    it('should preserve non-null/non-undefined values correctly', async () => {
      const mockRepos = [
        {
          name: 'repo-with-values',
          full_name: 'user/repo-with-values',
          description: 'A great repository',
          html_url: 'https://github.com/user/repo-with-values',
          language: 'TypeScript',
          stargazers_count: 42,
          topics: ['showcase', 'typescript'],
          homepage: 'https://example.com',
          forks_count: 7,
          updated_at: '2023-06-15T10:30:00Z',
        },
      ];

      mockListForUser.mockResolvedValue({
        data: mockRepos,
      });

      const result = await service.getRepositoriesWithTopic('testuser', 'showcase');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'repo-with-values',
        full_name: 'user/repo-with-values',
        description: 'A great repository',
        html_url: 'https://github.com/user/repo-with-values',
        language: 'TypeScript',
        stargazers_count: 42,
        topics: ['showcase', 'typescript'],
        homepage: 'https://example.com',
        forks_count: 7,
        updated_at: '2023-06-15T10:30:00Z',
      });
    });
  });
});
