import * as fs from 'fs/promises';
import * as core from '@actions/core';
import { FileService } from '../src/helper/fileService';

// Mock the entire @octokit/rest module
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        getContent: jest.fn(),
        createOrUpdateFileContents: jest.fn(),
      },
    },
  })),
}));

// Mock other dependencies
jest.mock('fs/promises');
jest.mock('@actions/core');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockCore = core as jest.Mocked<typeof core>;

// Import after mocking
const { Octokit } = require('@octokit/rest');

describe('FileService', () => {
  let fileService: FileService;
  let mockOctokitInstance: any;
  const mockToken = 'ghp_test_token';

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a fresh mock instance for each test
    mockOctokitInstance = {
      rest: {
        repos: {
          getContent: jest.fn(),
          createOrUpdateFileContents: jest.fn(),
        },
      },
    };

    (Octokit as jest.Mock).mockImplementation(() => mockOctokitInstance);
    fileService = new FileService(mockToken);
  });

  describe('readReadmeFile', () => {
    it('should read file successfully', async () => {
      const mockContent = 'file content';
      mockFs.readFile.mockResolvedValue(mockContent);

      const result = await fileService.readReadmeFile('test.md');

      expect(result).toBe(mockContent);
      expect(mockFs.readFile).toHaveBeenCalledWith('test.md', 'utf-8');
      expect(mockCore.info).toHaveBeenCalledWith('Successfully read README file: test.md');
    });

    it('should handle file not found and create default README', async () => {
      const enoentError = new Error('File not found') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(enoentError);

      const result = await fileService.readReadmeFile('nonexistent.md');

      expect(result).toContain('# Welcome to my GitHub Profile!');
      expect(result).toContain('<!-- SHOWCASE-START -->');
      expect(result).toContain('<!-- SHOWCASE-END -->');
      expect(mockCore.warning).toHaveBeenCalledWith(
        'README file not found: nonexistent.md. Creating a new one.'
      );
    });

    it('should throw error for non-ENOENT errors', async () => {
      const permissionError = new Error('Permission denied');
      mockFs.readFile.mockRejectedValue(permissionError);

      await expect(fileService.readReadmeFile('test.md')).rejects.toThrow('Permission denied');
    });
  });

  describe('writeReadmeFile', () => {
    it('should write file successfully', async () => {
      const content = 'test content';
      const filePath = 'README.md';
      mockFs.writeFile.mockResolvedValue();

      await fileService.writeReadmeFile(filePath, content);

      expect(mockFs.writeFile).toHaveBeenCalledWith(filePath, content, 'utf-8');
      expect(mockCore.info).toHaveBeenCalledWith(`Successfully wrote README file: ${filePath}`);
    });

    it('should handle write errors', async () => {
      const writeError = new Error('Write failed');
      mockFs.writeFile.mockRejectedValue(writeError);

      await expect(fileService.writeReadmeFile('test.md', 'content')).rejects.toThrow(
        'Write failed'
      );
      expect(mockCore.setFailed).toHaveBeenCalledWith('Failed to write README file: Write failed');
    });
  });

  describe('commitAndPushChanges', () => {
    const owner = 'testuser';
    const repo = 'testrepo';
    const filePath = 'README.md';
    const content = 'test content';
    const commitMessage = 'Update README';

    it('should create new file when file does not exist', async () => {
      mockOctokitInstance.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));
      mockOctokitInstance.rest.repos.createOrUpdateFileContents.mockResolvedValue({});

      await fileService.commitAndPushChanges(owner, repo, filePath, content, commitMessage);

      expect(mockOctokitInstance.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
        owner,
        repo,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(content).toString('base64'),
        branch: 'main',
      });
      expect(mockCore.info).toHaveBeenCalledWith(
        'README file does not exist in repository. Creating new file.Not Found'
      );
      expect(mockCore.info).toHaveBeenCalledWith(`Successfully committed changes to ${filePath}`);
    });

    it('should update existing file when file exists', async () => {
      const mockSha = 'abc123';
      mockOctokitInstance.rest.repos.getContent.mockResolvedValue({
        data: {
          type: 'file',
          sha: mockSha,
        },
      });
      mockOctokitInstance.rest.repos.createOrUpdateFileContents.mockResolvedValue({});

      await fileService.commitAndPushChanges(owner, repo, filePath, content, commitMessage);

      expect(mockOctokitInstance.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
        owner,
        repo,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(content).toString('base64'),
        branch: 'main',
        sha: mockSha,
      });
    });

    it('should handle custom branch', async () => {
      mockOctokitInstance.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));
      mockOctokitInstance.rest.repos.createOrUpdateFileContents.mockResolvedValue({});

      await fileService.commitAndPushChanges(
        owner,
        repo,
        filePath,
        content,
        commitMessage,
        'develop'
      );

      expect(mockOctokitInstance.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
        expect.objectContaining({
          branch: 'develop',
        })
      );
    });

    it('should handle array response from getContent', async () => {
      mockOctokitInstance.rest.repos.getContent.mockResolvedValue({
        data: [{ type: 'file' }], // Array response (directory)
      });
      mockOctokitInstance.rest.repos.createOrUpdateFileContents.mockResolvedValue({});

      await fileService.commitAndPushChanges(owner, repo, filePath, content, commitMessage);

      expect(mockOctokitInstance.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
        expect.not.objectContaining({
          sha: expect.anything(),
        })
      );
    });

    it('should handle non-file type from getContent', async () => {
      mockOctokitInstance.rest.repos.getContent.mockResolvedValue({
        data: {
          type: 'dir', // Not a file
          sha: 'someSha',
        },
      });
      mockOctokitInstance.rest.repos.createOrUpdateFileContents.mockResolvedValue({});

      await fileService.commitAndPushChanges(owner, repo, filePath, content, commitMessage);

      // Should not include sha when it's not a file
      expect(mockOctokitInstance.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
        expect.not.objectContaining({
          sha: expect.anything(),
        })
      );
    });

    it('should handle commit errors', async () => {
      const commitError = new Error('Commit failed');
      mockOctokitInstance.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));
      mockOctokitInstance.rest.repos.createOrUpdateFileContents.mockRejectedValue(commitError);

      await expect(
        fileService.commitAndPushChanges(owner, repo, filePath, content, commitMessage)
      ).rejects.toThrow('Commit failed');

      expect(mockCore.setFailed).toHaveBeenCalledWith('Failed to commit changes: Commit failed');
    });

    it('should handle getContent errors during commit and continue execution', async () => {
      const getContentError = new Error('API rate limit exceeded');
      mockOctokitInstance.rest.repos.getContent.mockRejectedValue(getContentError);
      mockOctokitInstance.rest.repos.createOrUpdateFileContents.mockResolvedValue({});

      await fileService.commitAndPushChanges(owner, repo, filePath, content, commitMessage);

      expect(mockCore.info).toHaveBeenCalledWith(
        'README file does not exist in repository. Creating new file.API rate limit exceeded'
      );
      expect(mockOctokitInstance.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
        expect.not.objectContaining({
          sha: expect.anything(),
        })
      );
    });

    // Fixed test: This should test the scenario where createOrUpdateFileContents fails after getContent fails
    it('should handle network timeout in createOrUpdateFileContents', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      mockOctokitInstance.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));
      mockOctokitInstance.rest.repos.createOrUpdateFileContents.mockRejectedValue(timeoutError);

      await expect(
        fileService.commitAndPushChanges('owner', 'repo', 'README.md', 'content', 'message')
      ).rejects.toThrow('Request timeout');

      expect(mockCore.setFailed).toHaveBeenCalledWith('Failed to commit changes: Request timeout');
    });

    it('should handle invalid repository access in createOrUpdateFileContents', async () => {
      const accessError = new Error('Repository not found');
      mockOctokitInstance.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));
      mockOctokitInstance.rest.repos.createOrUpdateFileContents.mockRejectedValue(accessError);

      await expect(
        fileService.commitAndPushChanges('invalid', 'repo', 'README.md', 'content', 'message')
      ).rejects.toThrow('Repository not found');

      expect(mockCore.setFailed).toHaveBeenCalledWith(
        'Failed to commit changes: Repository not found'
      );
    });
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory successfully', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);

      await fileService.ensureDirectoryExists('/test/dir');

      expect(mockFs.mkdir).toHaveBeenCalledWith('/test/dir', { recursive: true });
    });

    it('should handle directory already exists', async () => {
      const dirExistsError = new Error('Directory exists');
      mockFs.mkdir.mockRejectedValue(dirExistsError);

      await fileService.ensureDirectoryExists('/existing/dir');

      expect(mockCore.info).toHaveBeenCalledWith(
        expect.stringContaining('Directory exists!: /existing/dir')
      );
    });

    it('should handle permission errors on directory creation', async () => {
      const permissionError = new Error('Permission denied');
      mockFs.mkdir.mockRejectedValue(permissionError);

      await fileService.ensureDirectoryExists('/restricted/dir');

      expect(mockCore.info).toHaveBeenCalledWith(
        expect.stringContaining('Directory exists!: /restricted/dir - Permission denied')
      );
    });
  });

  describe('createDefaultReadme (private method coverage)', () => {
    it('should return default README when file not found', async () => {
      const enoentError = new Error('File not found') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(enoentError);

      const result = await fileService.readReadmeFile('nonexistent.md');

      expect(result).toContain('# Welcome to my GitHub Profile!');
      expect(result).toContain('<!-- SHOWCASE-START -->');
      expect(result).toContain('<!-- SHOWCASE-END -->');
      expect(result).toContain('Thanks for visiting my profile!');
      expect(result).toContain('👋'); // Test the emoji
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete workflow', async () => {
      const readmePath = 'README.md';
      const initialContent = '# Profile\n<!-- SHOWCASE-START -->\n<!-- SHOWCASE-END -->';
      const newContent = '# Profile\n<!-- SHOWCASE-START -->\nNew content\n<!-- SHOWCASE-END -->';

      // Mock successful read
      mockFs.readFile.mockResolvedValue(initialContent);
      // Mock successful write
      mockFs.writeFile.mockResolvedValue();

      const readResult = await fileService.readReadmeFile(readmePath);
      await fileService.writeReadmeFile(readmePath, newContent);

      expect(readResult).toBe(initialContent);
      expect(mockFs.writeFile).toHaveBeenCalledWith(readmePath, newContent, 'utf-8');
    });

    it('should handle file operations with buffer content', async () => {
      const textContent = 'text content';
      mockFs.readFile.mockResolvedValue(textContent);

      const result = await fileService.readReadmeFile('text.md');

      expect(result).toBe(textContent);
      expect(mockFs.readFile).toHaveBeenCalledWith('text.md', 'utf-8');
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle malformed file content', async () => {
      const malformedError = new Error('Invalid UTF-8');
      mockFs.readFile.mockRejectedValue(malformedError);

      await expect(fileService.readReadmeFile('malformed.md')).rejects.toThrow('Invalid UTF-8');
    });

    it('should handle filesystem errors in ensureDirectoryExists', async () => {
      const fsError = new Error('Filesystem error');
      mockFs.mkdir.mockRejectedValue(fsError);

      // Should not throw, just log
      await fileService.ensureDirectoryExists('/error/dir');

      expect(mockCore.info).toHaveBeenCalledWith(
        'Directory exists!: /error/dir - Filesystem error'
      );
    });
  });

  describe('Constructor and initialization', () => {
    it('should initialize with token', () => {
      const service = new FileService('test-token');
      expect(service).toBeInstanceOf(FileService);
      expect(Octokit).toHaveBeenCalledWith({ auth: 'test-token' });
    });

    it('should handle empty token', () => {
      const service = new FileService('');
      expect(service).toBeInstanceOf(FileService);
      expect(Octokit).toHaveBeenCalledWith({ auth: '' });
    });

    it('should handle null token', () => {
      const service = new FileService(null as any);
      expect(service).toBeInstanceOf(FileService);
      expect(Octokit).toHaveBeenCalledWith({ auth: null });
    });
  });

  describe('Additional edge cases for better coverage', () => {
    it('should handle empty file content', async () => {
      mockFs.readFile.mockResolvedValue('');

      const result = await fileService.readReadmeFile('empty.md');

      expect(result).toBe('');
    });

    it('should handle very large file content', async () => {
      const largeContent = 'x'.repeat(10000);
      mockFs.readFile.mockResolvedValue(largeContent);

      const result = await fileService.readReadmeFile('large.md');

      expect(result).toBe(largeContent);
    });

    it('should handle special characters in file paths', async () => {
      const specialPath = 'files/special-chars_123.md';
      mockFs.readFile.mockResolvedValue('content');

      await fileService.readReadmeFile(specialPath);

      expect(mockFs.readFile).toHaveBeenCalledWith(specialPath, 'utf-8');
    });

    it('should handle commit with special characters in message', async () => {
      const specialMessage = 'Update: Added 🚀 features & improvements';
      mockOctokitInstance.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));
      mockOctokitInstance.rest.repos.createOrUpdateFileContents.mockResolvedValue({});

      await fileService.commitAndPushChanges(
        'owner',
        'repo',
        'README.md',
        'content',
        specialMessage
      );

      expect(mockOctokitInstance.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
        expect.objectContaining({
          message: specialMessage,
        })
      );
    });

    it('should handle empty commit message', async () => {
      mockOctokitInstance.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));
      mockOctokitInstance.rest.repos.createOrUpdateFileContents.mockResolvedValue({});

      await fileService.commitAndPushChanges('owner', 'repo', 'README.md', 'content', '');

      expect(mockOctokitInstance.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '',
        })
      );
    });
  });
});
