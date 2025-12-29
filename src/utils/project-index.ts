import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { ProjectResult, ProjectStats } from '../types/index.js';
import { logger } from './logger.js';

export interface ProjectIndexParams {
  root_path: string;
  file_list?: string;
  include_dirs?: string[];
  exclude_patterns?: string[];
  symbol_table?: boolean;
  print_deps?: boolean;
}

export interface ProjectIndexRecord {
  key: string;
  rootPath: string;
  params: ProjectIndexParams;
  result: ProjectResult;
  stats: ProjectStats;
  generatedAt: string;
}

export class ProjectIndexManager {
  private indexDir: string;

  constructor(indexDir?: string) {
    const envDir = process.env.VERIBLE_MCP_INDEX_DIR;
    this.indexDir = indexDir || envDir || path.join(os.homedir(), '.verible-mcp', 'index');
  }

  private normalizeRoot(rootPath: string): string {
    return path.resolve(rootPath);
  }

  private buildKey(rootPath: string): string {
    return crypto.createHash('sha1').update(rootPath).digest('hex');
  }

  private getIndexFilePath(key: string): string {
    return path.join(this.indexDir, `${key}.json`);
  }

  private async ensureIndexDir(): Promise<void> {
    await fs.mkdir(this.indexDir, { recursive: true });
  }

  private buildStats(result: ProjectResult): ProjectStats {
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

  async saveIndex(params: ProjectIndexParams, result: ProjectResult): Promise<ProjectIndexRecord> {
    const rootPath = this.normalizeRoot(params.root_path);
    const key = this.buildKey(rootPath);
    const stats = this.buildStats(result);
    const record: ProjectIndexRecord = {
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

  async loadIndexByRoot(rootPath: string): Promise<ProjectIndexRecord | null> {
    const normalizedRoot = this.normalizeRoot(rootPath);
    const key = this.buildKey(normalizedRoot);
    return this.loadIndexByKey(key);
  }

  async loadIndexByKey(key: string): Promise<ProjectIndexRecord | null> {
    try {
      const content = await fs.readFile(this.getIndexFilePath(key), 'utf-8');
      return JSON.parse(content) as ProjectIndexRecord;
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        return null;
      }
      logger.warn(`读取项目索引失败: ${error}`);
      return null;
    }
  }

  async loadLatestIndex(): Promise<ProjectIndexRecord | null> {
    try {
      const entries = await fs.readdir(this.indexDir, { withFileTypes: true });
      const indexFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));
      if (indexFiles.length === 0) {
        return null;
      }

      let latest: { filePath: string; mtimeMs: number } | null = null;
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
      return JSON.parse(content) as ProjectIndexRecord;
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        return null;
      }
      logger.warn(`读取最新项目索引失败: ${error}`);
      return null;
    }
  }
}
