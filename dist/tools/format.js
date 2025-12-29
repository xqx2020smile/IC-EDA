import { z } from 'zod';
import * as fs from 'fs/promises';
import { AbstractTool } from './base.js';
import { logger } from '../utils/logger.js';
// Schema for format tool parameters
const FormatParamsSchema = z.object({
    filepath: z.string().describe('Path to the file to format'),
    inplace: z.boolean().default(false).describe('Modify the file in place'),
    indent_spaces: z.number().default(2).describe('Number of spaces for indentation'),
    line_length: z.number().default(100).describe('Maximum line length'),
    format_range: z.object({
        start: z.number(),
        end: z.number(),
    }).optional().describe('Format only specific line range'),
    verify: z.boolean().default(false).describe('Only verify formatting without changes'),
    show_diff: z.boolean().default(true).describe('Show differences'),
});
export class FormatTool extends AbstractTool {
    constructor(configManager, cacheManager) {
        super('verible_format', 'format', configManager, cacheManager, FormatParamsSchema);
    }
    getDescription() {
        return 'Format SystemVerilog/Verilog files according to style guidelines';
    }
    buildArguments(params) {
        const args = [];
        // Indentation
        args.push(`--indentation_spaces=${params.indent_spaces}`);
        // Line length
        args.push(`--column_limit=${params.line_length}`);
        // Format range if specified
        if (params.format_range) {
            args.push(`--lines=${params.format_range.start}-${params.format_range.end}`);
        }
        // Verify mode
        if (params.verify) {
            args.push('--verify');
        }
        // In-place modification
        if (params.inplace && !params.verify) {
            args.push('--inplace');
        }
        // Show diff (when not in-place)
        if (!params.inplace && params.show_diff) {
            args.push('--show_diff_on_stdout');
        }
        // Add the file path
        args.push(params.filepath);
        return args;
    }
    async processResult(result, params) {
        try {
            // Read original content for comparison
            const originalContent = await fs.readFile(params.filepath, 'utf-8');
            if (params.verify) {
                // Verify mode - check if formatting is needed
                const needsFormatting = result.exitCode !== 0;
                return {
                    success: true,
                    data: {
                        formatted: !needsFormatting,
                        content: undefined,
                        diff: needsFormatting ? 'File needs formatting' : undefined,
                        changedLines: 0,
                    },
                };
            }
            if (params.inplace) {
                // In-place mode - file was modified directly
                const newContent = await fs.readFile(params.filepath, 'utf-8');
                const hasChanges = newContent !== originalContent;
                return {
                    success: true,
                    data: {
                        formatted: true,
                        content: newContent,
                        diff: hasChanges ? this.generateSimpleDiff(originalContent, newContent) : undefined,
                        changedLines: hasChanges ? this.countChangedLines(originalContent, newContent) : 0,
                    },
                };
            }
            else {
                // Standard mode - formatted content in stdout
                const formattedContent = result.stdout;
                const hasChanges = formattedContent !== originalContent;
                return {
                    success: true,
                    data: {
                        formatted: true,
                        content: formattedContent,
                        diff: params.show_diff ? result.stdout : undefined,
                        changedLines: hasChanges ? this.countChangedLines(originalContent, formattedContent) : 0,
                    },
                };
            }
        }
        catch (error) {
            logger.error('Failed to process format result:', error);
            return {
                success: false,
                error: `Failed to format file: ${error}`,
            };
        }
    }
    generateSimpleDiff(original, formatted) {
        const originalLines = original.split('\n');
        const formattedLines = formatted.split('\n');
        const diff = [];
        const maxLines = Math.max(originalLines.length, formattedLines.length);
        for (let i = 0; i < maxLines; i++) {
            const origLine = originalLines[i] || '';
            const formLine = formattedLines[i] || '';
            if (origLine !== formLine) {
                if (i < originalLines.length) {
                    diff.push(`- ${origLine}`);
                }
                if (i < formattedLines.length) {
                    diff.push(`+ ${formLine}`);
                }
            }
        }
        return diff.join('\n');
    }
    countChangedLines(original, formatted) {
        const originalLines = original.split('\n');
        const formattedLines = formatted.split('\n');
        let changes = 0;
        const maxLines = Math.max(originalLines.length, formattedLines.length);
        for (let i = 0; i < maxLines; i++) {
            if (originalLines[i] !== formattedLines[i]) {
                changes++;
            }
        }
        return changes;
    }
    getCacheKey(params) {
        // Cache formatted content based on file and format options
        if (params.inplace || params.verify) {
            return null; // Don't cache modifications or verifications
        }
        const cacheData = {
            filepath: params.filepath,
            indent_spaces: params.indent_spaces,
            line_length: params.line_length,
            format_range: params.format_range,
        };
        return this.cacheManager.generateKey('format', cacheData);
    }
    shouldUseCache(params) {
        // Don't cache if we're modifying files
        return !params.inplace && !params.verify;
    }
    getFilePath(params) {
        return params.filepath;
    }
    getInputSchema() {
        return {
            type: 'object',
            properties: {
                filepath: {
                    type: 'string',
                    description: 'Path to the file to format',
                },
                inplace: {
                    type: 'boolean',
                    description: 'Modify the file in place',
                    default: false,
                },
                indent_spaces: {
                    type: 'number',
                    description: 'Number of spaces for indentation',
                    default: 2,
                },
                line_length: {
                    type: 'number',
                    description: 'Maximum line length',
                    default: 100,
                },
                format_range: {
                    type: 'object',
                    properties: {
                        start: { type: 'number' },
                        end: { type: 'number' },
                    },
                    description: 'Format only specific line range',
                },
                verify: {
                    type: 'boolean',
                    description: 'Only verify formatting without changes',
                    default: false,
                },
                show_diff: {
                    type: 'boolean',
                    description: 'Show differences',
                    default: true,
                },
            },
            required: ['filepath'],
        };
    }
}
//# sourceMappingURL=format.js.map