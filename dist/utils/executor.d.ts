export interface CommandOptions {
    timeout?: number;
    maxBuffer?: number;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    stream?: boolean;
}
export interface CommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    duration: number;
}
export declare class CommandExecutor {
    private defaultTimeout;
    private defaultMaxBuffer;
    /**
     * Execute a command and return the result
     */
    execute(command: string, args?: string[], options?: CommandOptions): Promise<CommandResult>;
    /**
     * Execute a command with streaming output
     */
    private executeStreaming;
    /**
     * Check if a command exists in PATH
     */
    commandExists(command: string): Promise<boolean>;
    /**
     * Find command in common locations
     */
    findCommand(command: string, searchPaths: string[]): Promise<string | null>;
    /**
     * Escape shell arguments
     */
    private escapeArg;
}
//# sourceMappingURL=executor.d.ts.map