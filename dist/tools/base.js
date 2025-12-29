import { CommandExecutor } from '../utils/executor.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { logger } from '../utils/logger.js';
export class AbstractTool {
    configManager;
    cacheManager;
    executor;
    toolName;
    binaryName;
    schema;
    constructor(toolName, binaryName, configManager, cacheManager, schema) {
        this.configManager = configManager;
        this.cacheManager = cacheManager;
        this.toolName = toolName;
        this.binaryName = binaryName;
        this.executor = new CommandExecutor();
        this.schema = schema;
    }
    /**
     * Execute the tool with parameters
     */
    async execute(params) {
        const startTime = Date.now();
        try {
            // Validate parameters
            const validatedParams = this.schema.parse(params);
            // Check if tool is available
            const config = await this.configManager.getConfig();
            if (!config.isAvailable) {
                throw new Error('Verible is not installed or not found in PATH');
            }
            const toolPath = config.toolPaths[this.binaryName];
            const available = await this.configManager.isToolAvailable(this.binaryName);
            if (!available) {
                throw new Error(`Verible tool '${this.binaryName}' is not available`);
            }
            // Check cache if applicable
            const cacheKey = this.getCacheKey(validatedParams);
            if (cacheKey && this.shouldUseCache(validatedParams)) {
                const cached = await this.cacheManager.get(cacheKey, this.getFilePath(validatedParams));
                if (cached !== null) {
                    logger.debug(`Cache hit for ${this.toolName}`);
                    return {
                        success: true,
                        data: cached,
                        cached: true,
                        executionTime: Date.now() - startTime,
                    };
                }
            }
            // Build command arguments
            const args = this.buildArguments(validatedParams);
            logger.info(`Executing ${this.toolName} with args:`, args);
            // Execute command
            const result = await this.executor.execute(toolPath, args, {
                timeout: this.getTimeout(validatedParams),
                cwd: this.getCwd(validatedParams),
            });
            // Process result
            const processedResult = await this.processResult(result, validatedParams);
            // Cache if applicable
            if (cacheKey && this.shouldUseCache(validatedParams) && processedResult.success) {
                await this.cacheManager.set(cacheKey, processedResult.data, this.getFilePath(validatedParams), this.getDependencies(validatedParams));
            }
            // Extract warnings
            const warnings = ErrorHandler.extractWarnings(result.stderr);
            if (warnings.length > 0) {
                processedResult.warnings = warnings;
            }
            processedResult.executionTime = Date.now() - startTime;
            return processedResult;
        }
        catch (error) {
            logger.error(`Error in ${this.toolName}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime: Date.now() - startTime,
            };
        }
    }
    /**
     * Get cache key for the operation
     */
    getCacheKey(params) {
        // Default implementation - override if caching is desired
        return null;
    }
    /**
     * Whether to use cache for this operation
     */
    shouldUseCache(params) {
        // Default implementation - override if needed
        return true;
    }
    /**
     * Get file path from parameters (for cache invalidation)
     */
    getFilePath(params) {
        // Default implementation - override if needed
        return undefined;
    }
    /**
     * Get file dependencies (for cache invalidation)
     */
    getDependencies(params) {
        // Default implementation - override if needed
        return undefined;
    }
    /**
     * Get timeout for the operation
     */
    getTimeout(params) {
        // Default 30 seconds - override if needed
        return 30000;
    }
    /**
     * Get working directory for the command
     */
    getCwd(params) {
        // Default to current directory - override if needed
        return undefined;
    }
    /**
     * Get input schema for MCP
     */
    getInputSchema() {
        // Convert Zod schema to JSON Schema
        // This is a simplified version - in production, use a proper converter
        return {
            type: 'object',
            properties: {},
            required: [],
        };
    }
}
//# sourceMappingURL=base.js.map