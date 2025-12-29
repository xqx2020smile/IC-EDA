import { z } from 'zod';
import { AbstractTool } from './base.js';
import { CommandResult } from '../utils/executor.js';
import { ToolResult, SyntaxResult } from '../types/index.js';
declare const SyntaxParamsSchema: z.ZodObject<{
    filepath: z.ZodString;
    output_format: z.ZodDefault<z.ZodEnum<["tree", "json", "tokens"]>>;
    export_json: z.ZodDefault<z.ZodBoolean>;
    printtree: z.ZodDefault<z.ZodBoolean>;
    printtokens: z.ZodDefault<z.ZodBoolean>;
    printrawtokens: z.ZodDefault<z.ZodBoolean>;
    verifytree: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    filepath: string;
    output_format: "tree" | "json" | "tokens";
    export_json: boolean;
    printtree: boolean;
    printtokens: boolean;
    printrawtokens: boolean;
    verifytree: boolean;
}, {
    filepath: string;
    output_format?: "tree" | "json" | "tokens" | undefined;
    export_json?: boolean | undefined;
    printtree?: boolean | undefined;
    printtokens?: boolean | undefined;
    printrawtokens?: boolean | undefined;
    verifytree?: boolean | undefined;
}>;
type SyntaxParams = z.infer<typeof SyntaxParamsSchema>;
export declare class SyntaxTool extends AbstractTool<SyntaxParams, SyntaxResult> {
    constructor(configManager: any, cacheManager: any);
    getDescription(): string;
    protected buildArguments(params: SyntaxParams): string[];
    protected processResult(result: CommandResult, params: SyntaxParams): Promise<ToolResult<SyntaxResult>>;
    private parseTreeOutput;
    private parseTokenOutput;
    private parsePosition;
    protected getCacheKey(params: SyntaxParams): string | null;
    protected getFilePath(params: SyntaxParams): string;
    getInputSchema(): any;
}
export {};
//# sourceMappingURL=syntax.d.ts.map