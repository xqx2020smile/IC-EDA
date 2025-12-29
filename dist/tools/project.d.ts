import { z } from 'zod';
import { AbstractTool } from './base.js';
import { CommandResult } from '../utils/executor.js';
import { ToolResult, ProjectResult } from '../types/index.js';
import { ProjectIndexManager } from '../utils/project-index.js';
declare const ProjectParamsSchema: z.ZodObject<{
    root_path: z.ZodString;
    file_list: z.ZodOptional<z.ZodString>;
    include_dirs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    exclude_patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    symbol_table: z.ZodDefault<z.ZodBoolean>;
    print_deps: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    root_path: string;
    symbol_table: boolean;
    print_deps: boolean;
    file_list?: string | undefined;
    include_dirs?: string[] | undefined;
    exclude_patterns?: string[] | undefined;
}, {
    root_path: string;
    file_list?: string | undefined;
    include_dirs?: string[] | undefined;
    exclude_patterns?: string[] | undefined;
    symbol_table?: boolean | undefined;
    print_deps?: boolean | undefined;
}>;
type ProjectParams = z.infer<typeof ProjectParamsSchema>;
export declare class ProjectTool extends AbstractTool<ProjectParams, ProjectResult> {
    private indexManager;
    private tempFileListPaths;
    constructor(configManager: any, cacheManager: any, indexManager: ProjectIndexManager);
    getDescription(): string;
    protected buildArguments(params: ProjectParams): string[];
    protected processResult(result: CommandResult, params: ProjectParams): Promise<ToolResult<ProjectResult>>;
    private parseSymbols;
    private parseDependencies;
    private parseProjectStats;
    private normalizeKind;
    private groupSymbolsByKind;
    protected getCacheKey(params: ProjectParams): string | null;
    protected getTimeout(params: ProjectParams): number;
    private resolveFileListPath;
    private createFileListFromRoot;
    private buildGlobConfig;
    private normalizePatterns;
    private buildTempFileKey;
    private buildTempFilePath;
    private cleanupTempFile;
    getInputSchema(): any;
}
export {};
//# sourceMappingURL=project.d.ts.map