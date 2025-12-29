import { z } from 'zod';
import { AbstractTool } from './base.js';
import { CommandResult } from '../utils/executor.js';
import { ToolResult, DiffResult } from '../types/index.js';
declare const DiffParamsSchema: z.ZodObject<{
    file1: z.ZodString;
    file2: z.ZodString;
    mode: z.ZodDefault<z.ZodEnum<["format", "obfuscate", "plain"]>>;
    context_lines: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    file1: string;
    file2: string;
    mode: "format" | "obfuscate" | "plain";
    context_lines: number;
}, {
    file1: string;
    file2: string;
    mode?: "format" | "obfuscate" | "plain" | undefined;
    context_lines?: number | undefined;
}>;
type DiffParams = z.infer<typeof DiffParamsSchema>;
export declare class DiffTool extends AbstractTool<DiffParams, DiffResult> {
    constructor(configManager: any, cacheManager: any);
    getDescription(): string;
    protected buildArguments(params: DiffParams): string[];
    protected processResult(result: CommandResult, params: DiffParams): Promise<ToolResult<DiffResult>>;
    private parseDiffOutput;
    protected getCacheKey(params: DiffParams): string | null;
    protected getDependencies(params: DiffParams): string[];
    getInputSchema(): any;
}
export {};
//# sourceMappingURL=diff.d.ts.map