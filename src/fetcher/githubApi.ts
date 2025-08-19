import { Octokit } from '@octokit/rest';
import * as core from '@actions/core';

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

export class GitHubApiService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async getRepositoriesWithTopic(username: string, topic: string): Promise<Repository[]> {
    try {
      core.info(`Fetching repositories for user: ${username} with topic: ${topic}`);

      const { data: repos } = await this.octokit.rest.repos.listForUser({
        username,
        type: 'owner',
        sort: 'updated',
        per_page: 100,
      });

      const showcaseRepos = repos.filter((repo) => repo.topics && repo.topics.includes(topic));

      core.info(`Found ${showcaseRepos.length} repositories with topic: ${topic}`);

      return showcaseRepos.map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language ?? null,
        stargazers_count: repo.stargazers_count ?? 0,
        topics: repo.topics || [],
        homepage: repo.homepage ?? null,
        forks_count: repo.forks_count ?? 0,
        updated_at: repo.updated_at ?? new Date().toISOString(),
      }));
    } catch (error) {
      core.setFailed(`Failed to fetch repositories: ${error}`);
      throw error;
    }
  }
}
