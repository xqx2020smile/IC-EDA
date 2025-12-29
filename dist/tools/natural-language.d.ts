import { z } from 'zod';
import { AbstractTool } from './base.js';
import { CommandResult } from '../utils/executor.js';
import { ToolResult, NLQueryResult } from '../types/index.js';
declare const NaturalLanguageParamsSchema: z.ZodObject<{
    query: z.ZodString;
    context: z.ZodOptional<z.ZodObject<{
        current_file: z.ZodOptional<z.ZodString>;
        project_root: z.ZodOptional<z.ZodString>;
        recent_operations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        current_file?: string | undefined;
        project_root?: string | undefined;
        recent_operations?: string[] | undefined;
    }, {
        current_file?: string | undefined;
        project_root?: string | undefined;
        recent_operations?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    context?: {
        current_file?: string | undefined;
        project_root?: string | undefined;
        recent_operations?: string[] | undefined;
    } | undefined;
}, {
    query: string;
    context?: {
        current_file?: string | undefined;
        project_root?: string | undefined;
        recent_operations?: string[] | undefined;
    } | undefined;
}>;
type NaturalLanguageParams = z.infer<typeof NaturalLanguageParamsSchema>;
export declare class NaturalLanguageTool extends AbstractTool<NaturalLanguageParams, NLQueryResult> {
    private tools;
    constructor(configManager: any, cacheManager: any, tools: Map<string, AbstractTool>);
    getDescription(): string;
    protected buildArguments(params: NaturalLanguageParams): string[];
    protected processResult(result: CommandResult, params: NaturalLanguageParams): Promise<ToolResult<NLQueryResult>>;
    private parseQuery;
    private matchesLint;
    private matchesFormat;
    private matchesAnalysis;
    private matchesProject;
    private matchesDiff;
    private matchesObfuscate;
    private matchesSyntax;
    private parseLintQuery;
    private parseFormatQuery;
    private parseAnalysisQuery;
    private parseProjectQuery;
    private parseDiffQuery;
    private parseObfuscateQuery;
    private parseSyntaxQuery;
    private extractFilePath;
    private categorizeIntent;
    private getSuggestions;
    getInputSchema(): any;
}
export {};
//# sourceMappingURL=natural-language.d.ts.map