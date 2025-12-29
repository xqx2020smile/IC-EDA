import { z } from 'zod';
import { AbstractTool } from './base.js';
import { CommandResult } from '../utils/executor.js';
import { ToolResult, FormatResult } from '../types/index.js';
declare const FormatParamsSchema: z.ZodObject<{
    filepath: z.ZodString;
    inplace: z.ZodDefault<z.ZodBoolean>;
    indent_spaces: z.ZodDefault<z.ZodNumber>;
    line_length: z.ZodDefault<z.ZodNumber>;
    format_range: z.ZodOptional<z.ZodObject<{
        start: z.ZodNumber;
        end: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        start: number;
        end: number;
    }, {
        start: number;
        end: number;
    }>>;
    verify: z.ZodDefault<z.ZodBoolean>;
    show_diff: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    filepath: string;
    inplace: boolean;
    indent_spaces: number;
    line_length: number;
    verify: boolean;
    show_diff: boolean;
    format_range?: {
        start: number;
        end: number;
    } | undefined;
}, {
    filepath: string;
    inplace?: boolean | undefined;
    indent_spaces?: number | undefined;
    line_length?: number | undefined;
    format_range?: {
        start: number;
        end: number;
    } | undefined;
    verify?: boolean | undefined;
    show_diff?: boolean | undefined;
}>;
type FormatParams = z.infer<typeof FormatParamsSchema>;
export declare class FormatTool extends AbstractTool<FormatParams, FormatResult> {
    constructor(configManager: any, cacheManager: any);
    getDescription(): string;
    protected buildArguments(params: FormatParams): string[];
    protected processResult(result: CommandResult, params: FormatParams): Promise<ToolResult<FormatResult>>;
    private generateSimpleDiff;
    private countChangedLines;
    protected getCacheKey(params: FormatParams): string | null;
    protected shouldUseCache(params: FormatParams): boolean;
    protected getFilePath(params: FormatParams): string;
    getInputSchema(): any;
}
export {};
//# sourceMappingURL=format.d.ts.map