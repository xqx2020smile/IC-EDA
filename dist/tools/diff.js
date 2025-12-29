import { z } from 'zod';
import { AbstractTool } from './base.js';
import { logger } from '../utils/logger.js';
// Schema for diff tool parameters
const DiffParamsSchema = z.object({
    file1: z.string().describe('Path to the first file'),
    file2: z.string().describe('Path to the second file'),
    mode: z.enum(['format', 'obfuscate', 'plain']).default('plain').describe('Diff mode'),
    context_lines: z.number().default(3).describe('Number of context lines'),
});
export class DiffTool extends AbstractTool {
    constructor(configManager, cacheManager) {
        super('verible_diff', 'diff', configManager, cacheManager, DiffParamsSchema);
    }
    getDescription() {
        return 'Perform syntax-aware diff comparison between Verilog/SystemVerilog files';
    }
    buildArguments(params) {
        const args = [];
        // Add mode
        args.push(`--mode=${params.mode}`);
        // Add context lines
        if (params.context_lines !== 3) {
            args.push(`--context=${params.context_lines}`);
        }
        // Add file paths
        args.push(params.file1);
        args.push(params.file2);
        return args;
    }
    async processResult(result, params) {
        try {
            // If exit code is 0, files are identical
            if (result.exitCode === 0 && !result.stdout) {
                return {
                    success: true,
                    data: {
                        hasChanges: false,
                        additions: 0,
                        deletions: 0,
                        modifications: 0,
                        changes: [],
                    },
                };
            }
            // Parse diff output
            const changes = await this.parseDiffOutput(result.stdout, params);
            // Count change types
            let additions = 0;
            let deletions = 0;
            let modifications = 0;
            for (const change of changes) {
                switch (change.type) {
                    case 'add':
                        additions++;
                        break;
                    case 'delete':
                        deletions++;
                        break;
                    case 'modify':
                        modifications++;
                        break;
                }
            }
            const diffResult = {
                hasChanges: changes.length > 0,
                additions,
                deletions,
                modifications,
                changes,
            };
            return {
                success: true,
                data: diffResult,
            };
        }
        catch (error) {
            logger.error('Failed to process diff result:', error);
            return {
                success: false,
                error: `Failed to compare files: ${error}`,
            };
        }
    }
    async parseDiffOutput(output, params) {
        const changes = [];
        const lines = output.split('\n');
        let currentChange = null;
        let lineNumber = 0;
        for (const line of lines) {
            // Unified diff header
            if (line.startsWith('@@')) {
                const match = line.match(/@@ -(\d+),\d+ \+(\d+),\d+ @@/);
                if (match) {
                    lineNumber = parseInt(match[2], 10);
                }
                continue;
            }
            // Addition
            if (line.startsWith('+') && !line.startsWith('+++')) {
                if (currentChange && currentChange.type !== 'add') {
                    changes.push(currentChange);
                    currentChange = null;
                }
                if (!currentChange) {
                    currentChange = {
                        type: 'add',
                        file: params.file2,
                        startLine: lineNumber,
                        endLine: lineNumber,
                        content: line.substring(1),
                        description: 'Added lines',
                    };
                }
                else {
                    currentChange.endLine = lineNumber;
                    currentChange.content += '\n' + line.substring(1);
                }
                lineNumber++;
            }
            // Deletion
            else if (line.startsWith('-') && !line.startsWith('---')) {
                if (currentChange && currentChange.type !== 'delete') {
                    changes.push(currentChange);
                    currentChange = null;
                }
                if (!currentChange) {
                    currentChange = {
                        type: 'delete',
                        file: params.file1,
                        startLine: lineNumber,
                        endLine: lineNumber,
                        content: line.substring(1),
                        description: 'Deleted lines',
                    };
                }
                else {
                    currentChange.endLine = lineNumber;
                    currentChange.content += '\n' + line.substring(1);
                }
            }
            // Context or unchanged line
            else if (!line.startsWith('\\')) {
                if (currentChange) {
                    changes.push(currentChange);
                    currentChange = null;
                }
                lineNumber++;
            }
        }
        // Add last change if any
        if (currentChange) {
            changes.push(currentChange);
        }
        // Post-process to identify modifications (delete followed by add)
        const processedChanges = [];
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            const nextChange = changes[i + 1];
            if (change.type === 'delete' &&
                nextChange?.type === 'add' &&
                Math.abs(change.startLine - nextChange.startLine) <= 1) {
                // This is a modification
                processedChanges.push({
                    type: 'modify',
                    startLine: change.startLine,
                    endLine: nextChange.endLine,
                    content: `- ${change.content}\n+ ${nextChange.content}`,
                    description: 'Modified lines',
                });
                i++; // Skip the next change
            }
            else {
                processedChanges.push(change);
            }
        }
        return processedChanges;
    }
    getCacheKey(params) {
        // Cache diff results based on file paths and mode
        const cacheData = {
            file1: params.file1,
            file2: params.file2,
            mode: params.mode,
            context_lines: params.context_lines,
        };
        return this.cacheManager.generateKey('diff', cacheData);
    }
    getDependencies(params) {
        // Both files are dependencies
        return [params.file1, params.file2];
    }
    getInputSchema() {
        return {
            type: 'object',
            properties: {
                file1: {
                    type: 'string',
                    description: 'Path to the first file',
                },
                file2: {
                    type: 'string',
                    description: 'Path to the second file',
                },
                mode: {
                    type: 'string',
                    enum: ['format', 'obfuscate', 'plain'],
                    description: 'Diff mode',
                    default: 'plain',
                },
                context_lines: {
                    type: 'number',
                    description: 'Number of context lines',
                    default: 3,
                },
            },
            required: ['file1', 'file2'],
        };
    }
}
//# sourceMappingURL=diff.js.map