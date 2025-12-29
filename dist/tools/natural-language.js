import { z } from 'zod';
import { AbstractTool } from './base.js';
import { logger } from '../utils/logger.js';
// Schema for natural language tool parameters
const NaturalLanguageParamsSchema = z.object({
    query: z.string().describe('Natural language query about Verilog code'),
    context: z.object({
        current_file: z.string().optional(),
        project_root: z.string().optional(),
        recent_operations: z.array(z.string()).optional(),
    }).optional(),
});
export class NaturalLanguageTool extends AbstractTool {
    tools;
    constructor(configManager, cacheManager, tools) {
        super('natural_language_query', 'syntax', configManager, cacheManager, NaturalLanguageParamsSchema);
        this.tools = tools;
    }
    getDescription() {
        return 'Process natural language queries and execute appropriate Verible tools';
    }
    buildArguments(params) {
        // This tool doesn't directly call Verible
        return [];
    }
    async processResult(result, params) {
        try {
            // Parse the natural language query
            const intent = this.parseQuery(params.query, params.context);
            if (intent.confidence < 0.5) {
                return {
                    success: true,
                    data: {
                        query: params.query,
                        intent: 'unknown',
                        parameters: {},
                        confidence: intent.confidence,
                        result: {
                            error: 'Could not understand the query. Please be more specific.',
                            suggestions: this.getSuggestions(params.query),
                        },
                    },
                };
            }
            // Execute the appropriate tool
            const tool = this.tools.get(intent.tool);
            if (!tool) {
                return {
                    success: false,
                    error: `Tool ${intent.tool} not found`,
                };
            }
            const toolResult = await tool.execute(intent.parameters);
            const nlResult = {
                query: params.query,
                intent: this.categorizeIntent(intent.tool),
                parameters: intent.parameters,
                confidence: intent.confidence,
                result: toolResult,
            };
            return {
                success: true,
                data: nlResult,
            };
        }
        catch (error) {
            logger.error('Failed to process natural language query:', error);
            return {
                success: false,
                error: `Failed to process query: ${error}`,
            };
        }
    }
    parseQuery(query, context) {
        const lowerQuery = query.toLowerCase();
        // Lint queries
        if (this.matchesLint(lowerQuery)) {
            return this.parseLintQuery(query, context);
        }
        // Format queries
        if (this.matchesFormat(lowerQuery)) {
            return this.parseFormatQuery(query, context);
        }
        // Register/analysis queries
        if (this.matchesAnalysis(lowerQuery)) {
            return this.parseAnalysisQuery(query, context);
        }
        // Project queries
        if (this.matchesProject(lowerQuery)) {
            return this.parseProjectQuery(query, context);
        }
        // Diff queries
        if (this.matchesDiff(lowerQuery)) {
            return this.parseDiffQuery(query, context);
        }
        // Obfuscate queries
        if (this.matchesObfuscate(lowerQuery)) {
            return this.parseObfuscateQuery(query, context);
        }
        // Syntax queries
        if (this.matchesSyntax(lowerQuery)) {
            return this.parseSyntaxQuery(query, context);
        }
        return {
            tool: 'unknown',
            parameters: {},
            confidence: 0,
        };
    }
    // Matching functions
    matchesLint(query) {
        const lintKeywords = ['lint', 'check', 'style', 'violation', 'rule', 'quality', 'issue', 'problem'];
        return lintKeywords.some(keyword => query.includes(keyword));
    }
    matchesFormat(query) {
        const formatKeywords = ['format', 'indent', 'align', 'beautify', 'clean', 'tidy'];
        return formatKeywords.some(keyword => query.includes(keyword));
    }
    matchesAnalysis(query) {
        const analysisKeywords = ['register', 'flip-flop', 'flop', 'latch', 'count', 'how many', 'analyze', 'find all'];
        return analysisKeywords.some(keyword => query.includes(keyword));
    }
    matchesProject(query) {
        const projectKeywords = ['project', 'symbol', 'dependency', 'dependencies', 'hierarchy', 'structure'];
        return projectKeywords.some(keyword => query.includes(keyword));
    }
    matchesDiff(query) {
        const diffKeywords = ['diff', 'compare', 'difference', 'changes', 'between'];
        return diffKeywords.some(keyword => query.includes(keyword));
    }
    matchesObfuscate(query) {
        const obfuscateKeywords = ['obfuscate', 'protect', 'hide', 'scramble', 'rename'];
        return obfuscateKeywords.some(keyword => query.includes(keyword));
    }
    matchesSyntax(query) {
        const syntaxKeywords = ['parse', 'syntax', 'ast', 'tree', 'token'];
        return syntaxKeywords.some(keyword => query.includes(keyword));
    }
    // Parsing functions
    parseLintQuery(query, context) {
        const params = {
            filepath: this.extractFilePath(query, context) || context?.current_file,
        };
        // Check for fix request
        if (query.includes('fix') || query.includes('auto')) {
            params.fix = true;
        }
        // Extract specific rules
        const ruleMatch = query.match(/rule[s]?\s+([a-z-]+)/i);
        if (ruleMatch) {
            params.rules = [ruleMatch[1]];
        }
        return {
            tool: 'verible_lint',
            parameters: params,
            confidence: params.filepath ? 0.9 : 0.6,
        };
    }
    parseFormatQuery(query, context) {
        const params = {
            filepath: this.extractFilePath(query, context) || context?.current_file,
        };
        // Check for in-place
        if (query.includes('in-place') || query.includes('inplace') || query.includes('modify')) {
            params.inplace = true;
        }
        // Extract indent spaces
        const indentMatch = query.match(/(\d+)\s*space/i);
        if (indentMatch) {
            params.indent_spaces = parseInt(indentMatch[1], 10);
        }
        return {
            tool: 'verible_format',
            parameters: params,
            confidence: params.filepath ? 0.9 : 0.6,
        };
    }
    parseAnalysisQuery(query, context) {
        const params = {
            filepath: this.extractFilePath(query, context) || context?.current_file || context?.project_root,
            analysis_type: 'registers',
        };
        // Check for recursive
        if (query.includes('all') || query.includes('project') || query.includes('directory')) {
            params.recursive = true;
        }
        return {
            tool: 'verible_analyze',
            parameters: params,
            confidence: params.filepath ? 0.85 : 0.5,
        };
    }
    parseProjectQuery(query, context) {
        const params = {
            root_path: this.extractFilePath(query, context) || context?.project_root || '.',
        };
        if (query.includes('symbol')) {
            params.symbol_table = true;
        }
        if (query.includes('depend')) {
            params.print_deps = true;
        }
        return {
            tool: 'verible_project',
            parameters: params,
            confidence: 0.8,
        };
    }
    parseDiffQuery(query, context) {
        // Try to extract two file paths
        const fileMatches = query.match(/["']([^"']+)["']/g);
        const files = fileMatches ? fileMatches.map(f => f.replace(/["']/g, '')) : [];
        if (files.length >= 2) {
            return {
                tool: 'verible_diff',
                parameters: {
                    file1: files[0],
                    file2: files[1],
                    mode: 'plain',
                },
                confidence: 0.9,
            };
        }
        return {
            tool: 'verible_diff',
            parameters: {},
            confidence: 0.3,
        };
    }
    parseObfuscateQuery(query, context) {
        const params = {
            filepath: this.extractFilePath(query, context) || context?.current_file,
        };
        // Check for interface preservation
        if (query.includes('interface') || query.includes('ports')) {
            params.preserve_interface = true;
        }
        // Extract identifiers to preserve
        const preserveMatch = query.match(/preserve\s+["']([^"']+)["']/i);
        if (preserveMatch) {
            params.preserve = preserveMatch[1].split(/[,\s]+/);
        }
        return {
            tool: 'verible_obfuscate',
            parameters: params,
            confidence: params.filepath ? 0.85 : 0.5,
        };
    }
    parseSyntaxQuery(query, context) {
        const params = {
            filepath: this.extractFilePath(query, context) || context?.current_file,
            output_format: 'tree',
        };
        if (query.includes('json')) {
            params.output_format = 'json';
        }
        else if (query.includes('token')) {
            params.output_format = 'tokens';
        }
        return {
            tool: 'verible_syntax',
            parameters: params,
            confidence: params.filepath ? 0.9 : 0.6,
        };
    }
    // Helper functions
    extractFilePath(query, context) {
        // Look for quoted paths
        const quotedMatch = query.match(/["']([^"']+\.[sv]h?)["']/);
        if (quotedMatch) {
            return quotedMatch[1];
        }
        // Look for unquoted paths
        const pathMatch = query.match(/\b(\S+\.[sv]h?)\b/);
        if (pathMatch) {
            return pathMatch[1];
        }
        // Look for "this file" or "current file"
        if (query.includes('this file') || query.includes('current file')) {
            return context?.current_file;
        }
        return null;
    }
    categorizeIntent(tool) {
        const categories = {
            verible_lint: 'lint',
            verible_format: 'format',
            verible_analyze: 'analyze',
            verible_project: 'analyze',
            verible_diff: 'analyze',
            verible_obfuscate: 'analyze',
            verible_syntax: 'analyze',
        };
        return categories[tool] || 'unknown';
    }
    getSuggestions(query) {
        return [
            'Try: "lint file.v"',
            'Try: "format this file with 4 spaces"',
            'Try: "how many registers in cpu.v"',
            'Try: "analyze project structure"',
            'Try: "compare old.v and new.v"',
            'Try: "obfuscate design.v preserving interface"',
        ];
    }
    getInputSchema() {
        return {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Natural language query about Verilog code',
                },
                context: {
                    type: 'object',
                    properties: {
                        current_file: {
                            type: 'string',
                            description: 'Current file being worked on',
                        },
                        project_root: {
                            type: 'string',
                            description: 'Project root directory',
                        },
                        recent_operations: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Recent operations performed',
                        },
                    },
                },
            },
            required: ['query'],
        };
    }
}
//# sourceMappingURL=natural-language.js.map