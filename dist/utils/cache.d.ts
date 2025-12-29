export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    fileHash?: string;
    dependencies?: string[];
}
export interface CacheOptions {
    maxSize?: number;
    ttl?: number;
    updateAgeOnGet?: boolean;
    checkFileModification?: boolean;
}
export declare class CacheManager {
    private cache;
    private fileHashes;
    constructor(options?: CacheOptions);
    /**
     * Generate a cache key from tool name and parameters
     */
    generateKey(tool: string, params: any): string;
    /**
     * Get an item from cache
     */
    get<T>(key: string, filePath?: string): Promise<T | null>;
    /**
     * Set an item in cache
     */
    set<T>(key: string, data: T, filePath?: string, dependencies?: string[]): Promise<void>;
    /**
     * Clear specific cache entries
     */
    clear(pattern?: string): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        calculatedItemCount: number;
    };
    /**
     * Calculate file hash
     */
    private getFileHash;
    /**
     * Create a cached version of an async function
     */
    createCachedFunction<T extends (...args: any[]) => Promise<any>>(fn: T, keyGenerator: (...args: Parameters<T>) => string, options?: {
        ttl?: number;
        filePathExtractor?: (...args: Parameters<T>) => string | undefined;
    }): T;
}
//# sourceMappingURL=cache.d.ts.map