export interface ToolResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    warnings?: string[];
    executionTime?: number;
    cached?: boolean;
}
export interface LintViolation {
    file: string;
    line: number;
    column: number;
    message: string;
    rule: string;
    severity: 'error' | 'warning' | 'info';
    autoFixAvailable?: boolean;
}
export interface LintResult {
    violations: LintViolation[];
    totalViolations: number;
    fixedViolations?: number;
    byRule: Record<string, number>;
    bySeverity: Record<string, number>;
}
export interface FormatResult {
    formatted: boolean;
    content?: string;
    diff?: string;
    changedLines?: number;
}
export interface SyntaxNode {
    tag: string;
    text?: string;
    start: {
        line: number;
        column: number;
    };
    end: {
        line: number;
        column: number;
    };
    children?: SyntaxNode[];
}
export interface SyntaxResult {
    format: 'tree' | 'json' | 'tokens';
    tree?: SyntaxNode;
    json?: any;
    tokens?: Token[];
}
export interface Token {
    tag: string;
    text: string;
    start: {
        line: number;
        column: number;
    };
    end: {
        line: number;
        column: number;
    };
}
export interface ProjectSymbol {
    name: string;
    kind: 'module' | 'class' | 'function' | 'variable' | 'parameter' | 'port';
    file: string;
    line: number;
    column: number;
    parent?: string;
}
export interface ProjectDependency {
    from: string;
    to: string;
    type: 'include' | 'instance' | 'inherit';
}
export interface ProjectResult {
    symbols: ProjectSymbol[];
    dependencies: ProjectDependency[];
    fileCount: number;
    moduleCount: number;
    stats: {
        totalLines: number;
        totalSymbols: number;
        byKind: Record<string, number>;
    };
}
export interface DiffResult {
    hasChanges: boolean;
    additions: number;
    deletions: number;
    modifications: number;
    changes: DiffChange[];
}
export interface DiffChange {
    type: 'add' | 'delete' | 'modify';
    file?: string;
    startLine: number;
    endLine: number;
    content: string;
    description?: string;
}
export interface ObfuscateResult {
    obfuscated: boolean;
    content?: string;
    mappingFile?: string;
    preservedIdentifiers: string[];
    obfuscatedCount: number;
}
export interface NLQueryResult {
    query: string;
    intent: 'lint' | 'format' | 'analyze' | 'search' | 'stats' | 'unknown';
    parameters: Record<string, any>;
    confidence: number;
    result: any;
}
export interface RegisterInfo {
    name: string;
    width: number;
    type: 'flip_flop' | 'latch' | 'memory';
    clock?: string;
    reset?: string;
    file: string;
    line: number;
    module: string;
}
export interface AnalysisResult {
    registers: RegisterInfo[];
    totalRegisters: number;
    byType: Record<string, number>;
    byModule: Record<string, RegisterInfo[]>;
    totalBits: number;
    modules?: Array<{
        name: string;
        file: string;
        line: number;
        registerCount: number;
    }>;
}
export interface ProjectStats {
    fileCount: number;
    moduleCount: number;
    totalLines: number;
    averageLinesPerModule: number;
    lintViolations?: number;
    formattingIssues?: number;
    registerCount?: number;
    totalRegisterBits?: number;
    lastUpdated: string;
}
export interface ResourceContent {
    uri: string;
    mimeType: string;
    text?: string;
    data?: any;
}
//# sourceMappingURL=index.d.ts.map