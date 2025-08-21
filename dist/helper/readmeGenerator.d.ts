import { Repository } from '../fetcher/githubApi';
export interface GeneratorOptions {
    format: 'list' | 'card' | 'table';
    title?: string;
    showDescription?: boolean;
    showLanguage?: boolean;
    showStars?: boolean;
    showTopics?: boolean;
    showForks?: boolean;
    maxRepos?: number;
}
export declare class ReadmeGenerator {
    generateContent(repositories: Repository[], options: GeneratorOptions): string;
    private generateList;
    private generateTable;
    private generateCards;
    private generateBadges;
    private escapeHtml;
    updateReadmeContent(currentContent: string, newContent: string, startMarker: string, endMarker: string): string;
}
//# sourceMappingURL=readmeGenerator.d.ts.map