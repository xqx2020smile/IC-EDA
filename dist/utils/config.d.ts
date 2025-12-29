export interface VeribleToolPaths {
    lint: string;
    format: string;
    syntax: string;
    diff: string;
    project: string;
    obfuscate: string;
    preprocessor: string;
    kytheExtractor: string;
    ls: string;
    patchTool: string;
}
export interface VeribleConfig {
    toolPaths: VeribleToolPaths;
    version: string;
    isAvailable: boolean;
    searchPaths: string[];
}
export declare class ConfigManager {
    private config;
    private executor;
    private initPromise;
    private defaultSearchPaths;
    constructor();
    /**
     * Initialize configuration asynchronously
     */
    initialize(): Promise<void>;
    /**
     * Get the configuration (initialize if needed)
     */
    getConfig(): Promise<VeribleConfig>;
    /**
     * Detect Verible installation and configure paths
     */
    private detectVerible;
    /**
     * Check if a specific tool is available
     */
    isToolAvailable(toolName: keyof VeribleToolPaths): Promise<boolean>;
    /**
     * Get available tools
     */
    getAvailableTools(): Promise<string[]>;
    /**
     * Load user configuration if exists
     */
    loadUserConfig(configPath?: string): Promise<void>;
}
//# sourceMappingURL=config.d.ts.map