export declare class FileService {
    private octokit;
    constructor(token: string);
    readReadmeFile(filePath: string): Promise<string>;
    writeReadmeFile(filePath: string, content: string): Promise<void>;
    commitAndPushChanges(owner: string, repo: string, filePath: string, content: string, commitMessage: string, branch?: string): Promise<void>;
    private createDefaultReadme;
    ensureDirectoryExists(dirPath: string): Promise<void>;
}
//# sourceMappingURL=fileService.d.ts.map