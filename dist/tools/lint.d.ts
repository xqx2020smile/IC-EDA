import { z } from 'zod';
import { AbstractTool } from './base.js';
import { CommandResult } from '../utils/executor.js';
import { ToolResult, LintResult } from '../types/index.js';
declare const LintParamsSchema: z.ZodObject<{
    filepath: z.ZodString;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    waiver_files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    fix: z.ZodDefault<z.ZodBoolean>;
    ruleset: z.ZodOptional<z.ZodString>;
    config_file: z.ZodOptional<z.ZodString>;
    show_diagnostic_context: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    filepath: string;
    fix: boolean;
    show_diagnostic_context: boolean;
    rules?: string[] | undefined;
    waiver_files?: string[] | undefined;
    ruleset?: string | undefined;
    config_file?: string | undefined;
}, {
    filepath: string;
    rules?: string[] | undefined;
    waiver_files?: string[] | undefined;
    fix?: boolean | undefined;
    ruleset?: string | undefined;
    config_file?: string | undefined;
    show_diagnostic_context?: boolean | undefined;
}>;
type LintParams = z.infer<typeof LintParamsSchema>;
export declare class LintTool extends AbstractTool<LintParams, LintResult> {
    constructor(configManager: any, cacheManager: any);
    getDescription(): string;
    protected buildArguments(params: LintParams): string[];
    protected processResult(result: CommandResult, params: LintParams): Promise<ToolResult<LintResult>>;
    private parseViolations;
    private isAutoFixAvailable;
    protected getCacheKey(params: LintParams): string | null;
    protected shouldUseCache(params: LintParams): boolean;
    protected getFilePath(params: LintParams): string;
    protected getDependencies(params: LintParams): string[] | undefined;
    getInputSchema(): any;
}
export {};
//# sourceMappingURL=lint.d.ts.map