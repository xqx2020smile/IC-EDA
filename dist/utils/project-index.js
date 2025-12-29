import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { logger } from './logger.js';
export class ProjectIndexManager {
    indexDir;
    constructor(indexDir) {
        const envDir = process.env.VERIBLE_MCP_INDEX_DIR;
        this.indexDir = indexDir || envDir || path.join(os.homedir(), '.verible-mcp', 'index');
    }
    normalizeRoot(rootPath) {
        return path.resolve(rootPath);
    }
    buildKey(rootPath) {
        return crypto.createHash('sha1').update(rootPath).digest('hex');
    }
    getIndexFilePath(key) {
        return path.join(this.indexDir, `${key}.json`);
    }
    async ensureIndexDir() {
        await fs.mkdir(this.indexDir, { recursive: true });
    }
    buildStats(result) {
        const moduleCount = result.moduleCount || 0;
        const totalLines = result.stats?.totalLines || 0;
        const averageLinesPerModule = moduleCount > 0 ? Math.round(totalLines / moduleCount) : 0;
        return {
            fileCount: result.fileCount || 0,
            moduleCount,
            totalLines,
            averageLinesPerModule,
            lastUpdated: new Date().toISOString(),
        };
    }
    async saveIndex(params, result) {
        const rootPath = this.normalizeRoot(params.root_path);
        const key = this.buildKey(rootPath);
        const stats = this.buildStats(result);
        const record = {
            key,
            rootPath,
            params: { ...params, root_path: rootPath },
            result,
            stats,
            generatedAt: stats.lastUpdated,
        };
        await this.ensureIndexDir();
        await fs.writeFile(this.getIndexFilePath(key), JSON.stringify(record, null, 2), 'utf-8');
        return record;
    }
    async loadIndexByRoot(rootPath) {
        const normalizedRoot = this.normalizeRoot(rootPath);
        const key = this.buildKey(normalizedRoot);
        return this.loadIndexByKey(key);
    }
    async loadIndexByKey(key) {
        try {
            const content = await fs.readFile(this.getIndexFilePath(key), 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            if (error?.code === 'ENOENT') {
                return null;
            }
            logger.warn(`读取项目索引失败: ${error}`);
            return null;
        }
    }
    async loadLatestIndex() {
        try {
            const entries = await fs.readdir(this.indexDir, { withFileTypes: true });
            const indexFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));
            if (indexFiles.length === 0) {
                return null;
            }
            let latest = null;
            for (const entry of indexFiles) {
                const filePath = path.join(this.indexDir, entry.name);
                const stat = await fs.stat(filePath);
                if (!latest || stat.mtimeMs > latest.mtimeMs) {
                    latest = { filePath, mtimeMs: stat.mtimeMs };
                }
            }
            if (!latest) {
                return null;
            }
            const content = await fs.readFile(latest.filePath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            if (error?.code === 'ENOENT') {
                return null;
            }
            logger.warn(`读取最新项目索引失败: ${error}`);
            return null;
        }
    }
}
//# sourceMappingURL=project-index.js.map