export interface Repository {
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    topics: string[];
    homepage?: string | null;
    forks_count?: number;
    updated_at: string;
}
export declare class GitHubApiService {
    private octokit;
    constructor(token: string);
    getRepositoriesWithTopic(username: string, topic: string): Promise<Repository[]>;
}
//# sourceMappingURL=githubApi.d.ts.map