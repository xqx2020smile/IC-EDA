import { AbstractTool } from './base.js';
import { ToolResult } from '../types/index.js';
import { z } from 'zod';
declare const AnalyzeParamsSchema: z.ZodObject<{
    filepath: z.ZodString;
    analysis_type: z.ZodDefault<z.ZodEnum<["registers", "modules", "signals", "all", "module_detail", "signal_trace"]>>;
    recursive: z.ZodDefault<z.ZodBoolean>;
    pattern: z.ZodOptional<z.ZodString>;
    module_name: z.ZodOptional<z.ZodString>;
    signal_name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    recursive: boolean;
    filepath: string;
    analysis_type: "registers" | "modules" | "signals" | "all" | "module_detail" | "signal_trace";
    pattern?: string | undefined;
    module_name?: string | undefined;
    signal_name?: string | undefined;
}, {
    filepath: string;
    recursive?: boolean | undefined;
    analysis_type?: "registers" | "modules" | "signals" | "all" | "module_detail" | "signal_trace" | undefined;
    pattern?: string | undefined;
    module_name?: string | undefined;
    signal_name?: string | undefined;
}>;
export type AnalyzeParams = z.infer<typeof AnalyzeParamsSchema>;
interface RegisterInfo {
    name: string;
    width: number;
    type: 'flip_flop' | 'latch' | 'potential_register';
    file: string;
    line: number;
    module: string;
    clock?: string;
    reset?: string;
}
interface ModuleInfo {
    name: string;
    file: string;
    line: number;
    registerCount: number;
}
interface AnalysisResult {
    registers: RegisterInfo[];
    totalRegisters: number;
    byType: Record<string, number>;
    byModule: Record<string, RegisterInfo[]>;
    totalBits: number;
    modules?: ModuleInfo[];
}
export declare class AnalyzeTool extends AbstractTool<AnalyzeParams, AnalysisResult> {
    private syntaxTool;
    private analyzeExecutor;
    constructor(configManager: any, cacheManager: any, syntaxTool: any);
    getDescription(): string;
    protected buildArguments(params: AnalyzeParams): string[];
    protected processResult(result: any, params: AnalyzeParams): Promise<ToolResult<AnalysisResult>>;
    private getFilesToAnalyze;
    private analyzeFile;
    private parseTreeStructure;
    private findNodesByTag;
    private getModuleName;
    private extractRegistersFromModule;
    private parseDataDeclaration;
    private parsePortDeclaration;
    private refineRegisters;
    private findAssignedSignals;
    private parsePackedDimensions;
    private findFirstNodeByTag;
    private getAllLeaves;
    private getLineNumber;
    private getLineNumberFromNode;
}
export {};
//# sourceMappingURL=analyze.d.ts.map