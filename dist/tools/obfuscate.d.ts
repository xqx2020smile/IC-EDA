import { z } from 'zod';
import { AbstractTool } from './base.js';
import { CommandResult } from '../utils/executor.js';
import { ToolResult, ObfuscateResult } from '../types/index.js';
declare const ObfuscateParamsSchema: z.ZodObject<{
    filepath: z.ZodString;
    output_file: z.ZodOptional<z.ZodString>;
    preserve_interface: z.ZodDefault<z.ZodBoolean>;
    save_map: z.ZodDefault<z.ZodBoolean>;
    map_file: z.ZodOptional<z.ZodString>;
    load_map: z.ZodOptional<z.ZodString>;
    preserve: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    filepath: string;
    preserve_interface: boolean;
    save_map: boolean;
    output_file?: string | undefined;
    map_file?: string | undefined;
    load_map?: string | undefined;
    preserve?: string[] | undefined;
}, {
    filepath: string;
    output_file?: string | undefined;
    preserve_interface?: boolean | undefined;
    save_map?: boolean | undefined;
    map_file?: string | undefined;
    load_map?: string | undefined;
    preserve?: string[] | undefined;
}>;
type ObfuscateParams = z.infer<typeof ObfuscateParamsSchema>;
export declare class ObfuscateTool extends AbstractTool<ObfuscateParams, ObfuscateResult> {
    constructor(configManager: any, cacheManager: any);
    getDescription(): string;
    protected buildArguments(params: ObfuscateParams): string[];
    protected processResult(result: CommandResult, params: ObfuscateParams): Promise<ToolResult<ObfuscateResult>>;
    private parsePreservedIdentifiers;
    private countObfuscatedIdentifiers;
    protected getCacheKey(params: ObfuscateParams): string | null;
    protected getFilePath(params: ObfuscateParams): string;
    getInputSchema(): any;
}
export {};
//# sourceMappingURL=obfuscate.d.ts.map