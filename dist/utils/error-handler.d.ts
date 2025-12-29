import { McpError } from '@modelcontextprotocol/sdk/types.js';
export interface VeribleError {
    code: string;
    message: string;
    details?: any;
    suggestion?: string;
}
export declare class ErrorHandler {
    /**
     * Convert Verible tool errors to MCP errors
     */
    static toMcpError(error: any, toolName: string): McpError;
    /**
     * Parse Verible-specific error messages
     */
    private static parseVeribleError;
    /**
     * Create a user-friendly error response
     */
    static createErrorResponse(error: McpError): any;
    /**
     * Handle and log errors consistently
     */
    static handleError<T>(operation: () => Promise<T>, toolName: string, fallback?: T): Promise<T>;
    /**
     * Extract useful information from Verible output
     */
    static extractWarnings(output: string): string[];
}
//# sourceMappingURL=error-handler.d.ts.map