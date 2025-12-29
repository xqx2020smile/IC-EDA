import { z } from 'zod';
import { CommandExecutor, CommandResult } from '../utils/executor.js';
import { ConfigManager, VeribleConfig } from '../utils/config.js';
import { CacheManager } from '../utils/cache.js';
import { ToolResult } from '../types/index.js';
export declare abstract class AbstractTool<TParams = any, TResult = any> {
    protected configManager: ConfigManager;
    protected cacheManager: CacheManager;
    protected executor: CommandExecutor;
    protected toolName: string;
    protected binaryName: keyof VeribleConfig['toolPaths'];
    protected schema: z.ZodType<any>;
    constructor(toolName: string, binaryName: keyof VeribleConfig['toolPaths'], configManager: ConfigManager, cacheManager: CacheManager, schema: z.ZodType<any>);
    /**
     * Execute the tool with parameters
     */
    execute(params: unknown): Promise<ToolResult<TResult>>;
    /**
     * Build command line arguments from parameters
     */
    protected abstract buildArguments(params: TParams): string[];
    /**
     * Process the command result into structured data
     */
    protected abstract processResult(result: CommandResult, params: TParams): Promise<ToolResult<TResult>>;
    /**
     * Get cache key for the operation
     */
    protected getCacheKey(params: TParams): string | null;
    /**
     * Whether to use cache for this operation
     */
    protected shouldUseCache(params: TParams): boolean;
    /**
     * Get file path from parameters (for cache invalidation)
     */
    protected getFilePath(params: TParams): string | undefined;
    /**
     * Get file dependencies (for cache invalidation)
     */
    protected getDependencies(params: TParams): string[] | undefined;
    /**
     * Get timeout for the operation
     */
    protected getTimeout(params: TParams): number;
    /**
     * Get working directory for the command
     */
    protected getCwd(params: TParams): string | undefined;
    /**
     * Get tool description for MCP
     */
    abstract getDescription(): string;
    /**
     * Get input schema for MCP
     */
    getInputSchema(): any;
}
//# sourceMappingURL=base.d.ts.map