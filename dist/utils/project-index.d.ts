import { ProjectResult, ProjectStats } from '../types/index.js';
export interface ProjectIndexParams {
    root_path: string;
    file_list?: string;
    include_dirs?: string[];
    exclude_patterns?: string[];
    symbol_table?: boolean;
    print_deps?: boolean;
}
export interface ProjectIndexRecord {
    key: string;
    rootPath: string;
    params: ProjectIndexParams;
    result: ProjectResult;
    stats: ProjectStats;
    generatedAt: string;
}
export declare class ProjectIndexManager {
    private indexDir;
    constructor(indexDir?: string);
    private normalizeRoot;
    private buildKey;
    private getIndexFilePath;
    private ensureIndexDir;
    private buildStats;
    saveIndex(params: ProjectIndexParams, result: ProjectResult): Promise<ProjectIndexRecord>;
    loadIndexByRoot(rootPath: string): Promise<ProjectIndexRecord | null>;
    loadIndexByKey(key: string): Promise<ProjectIndexRecord | null>;
    loadLatestIndex(): Promise<ProjectIndexRecord | null>;
}
//# sourceMappingURL=project-index.d.ts.map