import { z } from 'zod';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import { globSync } from 'glob';
import { AbstractTool } from './base.js';
import { logger } from '../utils/logger.js';
// Schema for project tool parameters
const ProjectParamsSchema = z.object({
    root_path: z.string().describe('Root directory of the project'),
    file_list: z.string().optional().describe('File containing list of source files'),
    include_dirs: z.array(z.string()).optional().describe('Include directories'),
    exclude_patterns: z.array(z.string()).optional().describe('Patterns to exclude'),
    symbol_table: z.boolean().default(true).describe('Generate symbol table'),
    print_deps: z.boolean().default(false).describe('Print file dependencies'),
});
export class ProjectTool extends AbstractTool {
    indexManager;
    tempFileListPaths = new Map();
    constructor(configManager, cacheManager, indexManager) {
        super('verible_project', 'project', configManager, cacheManager, ProjectParamsSchema);
        this.indexManager = indexManager;
    }
    getDescription() {
        return 'Analyze entire Verilog/SystemVerilog project structure, dependencies, and symbols';
    }
    buildArguments(params) {
        const args = [];
        // 排除规则通过文件列表生效
        const fileListPath = this.resolveFileListPath(params);
        if (fileListPath) {
            args.push(`--file_list_path=${fileListPath}`);
        }
        // Add include directories
        if (params.include_dirs) {
            for (const dir of params.include_dirs) {
                args.push(`--include_dir_path=${dir}`);
            }
        }
        // Symbol table generation
        if (params.symbol_table) {
            args.push('--symbol_table');
        }
        // Print dependencies
        if (params.print_deps) {
            args.push('--print_file_deps');
        }
        // Add root path
        args.push(params.root_path);
        return args;
    }
    async processResult(result, params) {
        try {
            // Parse the project analysis output
            const symbols = this.parseSymbols(result.stdout);
            const dependencies = this.parseDependencies(result.stdout);
            const stats = this.parseProjectStats(result.stdout);
            const projectResult = {
                symbols,
                dependencies,
                fileCount: stats.fileCount,
                moduleCount: stats.moduleCount,
                stats: {
                    totalLines: stats.totalLines,
                    totalSymbols: symbols.length,
                    byKind: this.groupSymbolsByKind(symbols),
                },
            };
            let warnings;
            try {
                await this.indexManager.saveIndex(params, projectResult);
            }
            catch (error) {
                logger.warn('项目索引更新失败:', error);
                warnings = ['项目索引更新失败，请检查索引目录权限或路径配置'];
            }
            this.cleanupTempFile(params);
            return {
                success: true,
                data: projectResult,
                warnings,
            };
        }
        catch (error) {
            this.cleanupTempFile(params);
            logger.error('项目分析结果处理失败:', error);
            return {
                success: false,
                error: `项目分析失败: ${error}`,
            };
        }
    }
    parseSymbols(output) {
        const symbols = [];
        const lines = output.split('\n');
        // Parse symbol table output
        // Format expected: <file>:<line>:<column>: <kind> <name> [in <parent>]
        const symbolRegex = /^(.+?):(\d+):(\d+):\s+(\w+)\s+(\w+)(?:\s+in\s+(\w+))?/;
        for (const line of lines) {
            const match = line.match(symbolRegex);
            if (match) {
                const [, file, lineStr, columnStr, kind, name, parent] = match;
                symbols.push({
                    name,
                    kind: this.normalizeKind(kind),
                    file: path.resolve(file),
                    line: parseInt(lineStr, 10),
                    column: parseInt(columnStr, 10),
                    parent,
                });
            }
        }
        return symbols;
    }
    parseDependencies(output) {
        const dependencies = [];
        const lines = output.split('\n');
        // Parse dependency information
        // Look for include statements and module instantiations
        let currentFile = null;
        for (const line of lines) {
            // File dependency header
            if (line.startsWith('File: ')) {
                currentFile = line.substring(6).trim();
                continue;
            }
            if (currentFile) {
                // Include dependency
                if (line.includes('includes:')) {
                    const included = line.split('includes:')[1].trim();
                    dependencies.push({
                        from: currentFile,
                        to: included,
                        type: 'include',
                    });
                }
                // Module instantiation
                if (line.includes('instantiates:')) {
                    const instantiated = line.split('instantiates:')[1].trim();
                    dependencies.push({
                        from: currentFile,
                        to: instantiated,
                        type: 'instance',
                    });
                }
            }
        }
        return dependencies;
    }
    parseProjectStats(output) {
        let fileCount = 0;
        let moduleCount = 0;
        let totalLines = 0;
        const lines = output.split('\n');
        for (const line of lines) {
            // Look for summary statistics
            const fileMatch = line.match(/Total files:\s*(\d+)/);
            if (fileMatch) {
                fileCount = parseInt(fileMatch[1], 10);
            }
            const moduleMatch = line.match(/Total modules:\s*(\d+)/);
            if (moduleMatch) {
                moduleCount = parseInt(moduleMatch[1], 10);
            }
            const linesMatch = line.match(/Total lines:\s*(\d+)/);
            if (linesMatch) {
                totalLines = parseInt(linesMatch[1], 10);
            }
        }
        // If stats not found in output, count from parsed data
        if (fileCount === 0) {
            const uniqueFiles = new Set(this.parseSymbols(output).map(s => s.file));
            fileCount = uniqueFiles.size;
        }
        return { fileCount, moduleCount, totalLines };
    }
    normalizeKind(kind) {
        const normalized = kind.toLowerCase();
        if (normalized.includes('module'))
            return 'module';
        if (normalized.includes('class'))
            return 'class';
        if (normalized.includes('function'))
            return 'function';
        if (normalized.includes('variable') || normalized.includes('var'))
            return 'variable';
        if (normalized.includes('parameter') || normalized.includes('param'))
            return 'parameter';
        if (normalized.includes('port'))
            return 'port';
        return 'variable'; // default
    }
    groupSymbolsByKind(symbols) {
        const byKind = {};
        for (const symbol of symbols) {
            byKind[symbol.kind] = (byKind[symbol.kind] || 0) + 1;
        }
        return byKind;
    }
    getCacheKey(params) {
        // Don't cache project analysis as it may change frequently
        return null;
    }
    getTimeout(params) {
        // Project analysis may take longer for large projects
        return 60000; // 60 seconds
    }
    resolveFileListPath(params) {
        if (params.file_list) {
            if (params.exclude_patterns && params.exclude_patterns.length > 0) {
                logger.warn('已提供 file_list，exclude_patterns 将被忽略');
            }
            return params.file_list;
        }
        if (!params.exclude_patterns || params.exclude_patterns.length === 0) {
            return null;
        }
        return this.createFileListFromRoot(params);
    }
    createFileListFromRoot(params) {
        const rootPath = path.resolve(params.root_path);
        const ignore = this.normalizePatterns(params.exclude_patterns || []);
        const globConfig = this.buildGlobConfig(rootPath);
        if (!globConfig) {
            logger.warn('无法读取 root_path，exclude_patterns 未生效');
            return null;
        }
        const files = globSync(globConfig.pattern, {
            cwd: globConfig.cwd,
            absolute: true,
            nodir: true,
            ignore,
        });
        const key = this.buildTempFileKey(params);
        const tempPath = this.buildTempFilePath(key);
        fs.writeFileSync(tempPath, files.join('\n'), 'utf-8');
        this.tempFileListPaths.set(key, tempPath);
        return tempPath;
    }
    buildGlobConfig(rootPath) {
        try {
            const stats = fs.statSync(rootPath);
            if (stats.isDirectory()) {
                return {
                    cwd: rootPath,
                    pattern: '**/*.{v,sv,vh,svh}',
                };
            }
            return {
                cwd: path.dirname(rootPath),
                pattern: path.basename(rootPath),
            };
        }
        catch (error) {
            logger.warn('读取 root_path 失败:', error);
            return null;
        }
    }
    normalizePatterns(patterns) {
        return patterns.map((pattern) => pattern.replace(/\\/g, '/'));
    }
    buildTempFileKey(params) {
        const keyData = {
            root_path: path.resolve(params.root_path),
            file_list: params.file_list || '',
            exclude_patterns: (params.exclude_patterns || []).join('|'),
        };
        return crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex');
    }
    buildTempFilePath(key) {
        const suffix = crypto.randomBytes(4).toString('hex');
        return path.join(os.tmpdir(), `verible-mcp-project-${key}-${suffix}.txt`);
    }
    cleanupTempFile(params) {
        const key = this.buildTempFileKey(params);
        const tempPath = this.tempFileListPaths.get(key);
        if (!tempPath) {
            return;
        }
        this.tempFileListPaths.delete(key);
        try {
            fs.unlinkSync(tempPath);
        }
        catch (error) {
            logger.warn('清理临时文件失败:', error);
        }
    }
    getInputSchema() {
        return {
            type: 'object',
            properties: {
                root_path: {
                    type: 'string',
                    description: 'Root directory of the project',
                },
                file_list: {
                    type: 'string',
                    description: 'File containing list of source files',
                },
                include_dirs: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Include directories',
                },
                exclude_patterns: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Patterns to exclude',
                },
                symbol_table: {
                    type: 'boolean',
                    description: 'Generate symbol table',
                    default: true,
                },
                print_deps: {
                    type: 'boolean',
                    description: 'Print file dependencies',
                    default: false,
                },
            },
            required: ['root_path'],
        };
    }
}
//# sourceMappingURL=project.js.map