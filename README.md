# Verible MCP 服务器

提供 Verible SystemVerilog/Verilog 工具访问的 MCP（Model Context Protocol）服务器。

## 功能

### 已实现工具

1. **verible_lint** - 风格检查与质量诊断
   - 规则与规则集配置
   - 支持 waiver 文件
   - 支持部分违规自动修复
   - 违规定位到行列信息

2. **verible_format** - 代码格式化
   - 缩进与行长配置
   - 原地格式化或预览模式
   - 支持指定行范围
   - 支持仅验证不修改

3. **verible_syntax** - 语法解析与分析
   - 解析树可视化
   - AST JSON 导出
   - Token 流分析
   - 语法校验

4. **verible_analyze** - 寄存器与模块分析
   - 检测并统计寄存器（触发器、锁存器）
   - 统计寄存器总比特数
   - 按类型与模块分组
   - 识别时钟与复位信号
   - 支持递归目录分析

5. **verible_project** - 项目级分析
   - 生成符号表
   - 文件依赖分析
   - 提取模块层级
   - 交叉引用信息
   - 项目统计
   - 支持 exclude_patterns 生成文件清单

6. **verible_diff** - 语法感知文件对比
   - 结构化 diff 对比
   - 格式感知差异
   - 可配置上下文行
   - 变更类型分类

7. **verible_obfuscate** - 代码混淆
   - 标识符重命名
   - 保留模块接口
   - 生成映射文件
   - 选择性保留

8. **natural_language_query** - 自然语言接口
   - 理解自然语言请求
   - 自动选择合适工具
   - 从上下文提取参数
   - 提供操作建议

### 资源

- `verible://project/stats` - 项目统计信息（支持 ?root= 或 ?key=）
- `verible://project/index` - 项目索引数据（支持 ?root= 或 ?key=）
- `verible://lint/summary` - Lint 违规汇总
- `verible://cache/stats` - 缓存性能与使用统计

### 提示词

- `code_review` - 综合代码质量评审
- `style_compliance` - 规范与风格检查
- `refactor_suggestions` - 重构建议
- `natural_language` - 自然语言查询引导

## 安装

1. 安装 Verible 工具（必需）：
   ```bash
   # 从 https://github.com/chipsalliance/verible/releases 下载
   # 或使用仓库内的 verible-v0.0-4007-g98bdb38a-macOS/bin/
   ```

2. 安装 MCP 服务器：
   ```bash
   npm install
   npm run build
   ```

## 使用

### Claude Desktop 集成

在 Claude Desktop 配置中添加：

```json
{
  "mcpServers": {
    "verible": {
      "command": "node",
      "args": ["/path/to/verible-mcp/dist/index.js"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### 使用示例

```javascript
// 对文件进行 lint
await useTool('verible_lint', {
  filepath: 'design.v',
  rules: ['no-trailing-spaces', 'module-filename'],
  fix: true
});

// 格式化文件
await useTool('verible_format', {
  filepath: 'design.v',
  indent_spaces: 4,
  line_length: 80,
  inplace: false
});

// 解析语法
await useTool('verible_syntax', {
  filepath: 'design.v',
  output_format: 'json'
});

// 分析寄存器
await useTool('verible_analyze', {
  filepath: 'cpu_core.v',
  analysis_type: 'registers'
});

// 递归分析目录
await useTool('verible_analyze', {
  filepath: './src',
  recursive: true,
  analysis_type: 'all'
});

// 项目分析（支持排除规则）
await useTool('verible_project', {
  root_path: './src',
  exclude_patterns: ['**/third_party/**', '**/generated/**'],
  symbol_table: true,
  print_deps: true
});

// 文件对比
await useTool('verible_diff', {
  file1: 'old_version.v',
  file2: 'new_version.v',
  mode: 'format'
});

// 代码混淆
await useTool('verible_obfuscate', {
  filepath: 'design.v',
  output_file: 'design_obfuscated.v',
  preserve: ['clk', 'rst_n'],
  save_map: true
});

// 自然语言查询
await useTool('natural_language_query', {
  query: 'cpu_core.v 有多少寄存器？',
  context: { current_file: 'cpu_core.v' }
});

await useTool('natural_language_query', {
  query: '用 4 个空格格式化这个文件',
  context: { current_file: 'design.v' }
});
```

## 配置

在项目或用户目录创建 `.verible-mcp.json`：

```json
{
  "searchPaths": [
    "/usr/local/bin",
    "/opt/verible/bin"
  ]
}
```

可选环境变量：

- `VERIBLE_MCP_INDEX_DIR` - 项目索引存放目录

## 开发

```bash
# 以开发模式运行
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint

# 类型检查
npm run typecheck
```

## TODO

- [x] 实现剩余 Verible 工具（project、diff、obfuscate 等）
- [x] 增加自然语言查询支持
- [x] 增加项目索引与统计资源（verible_project、verible://project/stats、verible://project/index）
- [ ] 大文件流式处理
- [ ] 更精细的缓存与失效策略
- [ ] 构建完整测试套件
- [ ] 支持批量操作
- [ ] 封装预处理器工具
- [ ] 语言服务器集成

## 许可证

MIT
