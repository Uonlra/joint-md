# Joint MD

Joint MD 是一个本地运行的 Markdown 与 EPUB 阅读工具。它可以把多个 Markdown 文件按指定规则连接成一个文档，提供预览和阅读功能，并将文档导出为 Markdown 或通过系统打印流程保存为 PDF。

所有文件都在当前设备上处理，不需要后端、账号或云存储。

## 当前功能

### Markdown

- 导入 `.md` 和 `.markdown` 文件
- 通过拖拽或文件选择器添加文件
- 调整文件顺序、删除文件、跳转到文件在文档中的起始位置
- 三种连接模式：
  - Plain：文件之间使用空行
  - Rule：文件之间使用水平分隔线
  - Filename Heading：使用文件名生成一级标题
- GitHub Flavored Markdown 预览
- 支持表格、任务列表、删除线、代码块和引用等 Markdown 内容
- 从一级到三级标题生成目录
- Reader Mode 阅读模式
- 调整字体大小和纸张色调
- 导出合并后的 Markdown 文件
- 通过系统打印流程保存为 PDF

### EPUB

- 导入 `.epub` 文件
- 在本地解析 EPUB 内容
- 预览章节和内嵌资源
- 使用目录、阅读模式、字体大小和纸张色调进行阅读
- 通过系统打印流程保存为 PDF

EPUB 模式不支持导出为 Markdown。

## 功能边界

当前版本只处理当前运行会话中的文件内容：

- Markdown 和 EPUB 内容保存在页面内存中
- 文件不会上传到服务器
- 关闭或刷新应用后，文件队列和文件内容会清除
- 阅读进度和阅读偏好可以保存在本地浏览器存储中
- 不提供账号、云同步、协作或服务器端文件处理
- 不支持 PDF 转 Markdown、OCR 或 EPUB 重新打包

文件大小限制：

- Markdown：每个文件最大 5 MB
- EPUB：每个文件最大 50 MB
## 快速开始
请前往 [Release 页](https://github.com/Uonlra/joint-md/releases) 下载 jointmd。

| 系统    | 架构                    | 类型     | 文件名                                      |
| ------- | ----------------------- |----------| ------------------------------------------- |
| Windows | x64                     | 安装程序 | joint-md_0.1.0_x64-setup.exe                |

## 从源码构建

### 浏览器开发

环境要求：

- Node.js 20 或更高版本
- pnpm

安装依赖并启动：

```bash
pnpm install
pnpm dev
```

打开：

```text
http://localhost:5173
```

### 浏览器生产预览

```bash
pnpm build
pnpm preview
```

项目包含 PWA 配置，可以在支持的浏览器中安装为独立窗口。PWA 只缓存应用资源，不缓存 Markdown 或 EPUB 文件内容。

### Windows 桌面开发

桌面版本使用 Tauri 2。需要安装 Rust MSVC 工具链、Microsoft C++ Build Tools 和 WebView2 Runtime。

启动桌面开发版本：

```bash
pnpm tauri dev
```

构建 Windows 发布包：

```bash
pnpm tauri build
```

如果只需要生成 Windows NSIS 安装程序：

```bash
pnpm tauri build --bundles nsis
```

构建产物位于：

```text
src-tauri/target/release/bundle/
```

NSIS 安装程序通常位于：

```text
src-tauri/target/release/bundle/nsis/
```

Tauri 桌面版的 Markdown 导出使用原生保存对话框。浏览器和 PWA 版本使用浏览器下载功能。

## 常用命令

```bash
pnpm dev       # 启动 Vite 开发服务器
pnpm build     # 类型检查并构建 Web/PWA 版本
pnpm preview   # 预览生产构建
pnpm test      # 运行测试
pnpm lint      # 运行 Oxlint
pnpm tauri dev # 启动 Tauri 桌面开发版本
pnpm tauri build # 构建 Tauri 桌面发布包
```

## 技术栈

- React 19
- TypeScript
- Vite
- Tauri 2
- `react-markdown` 与 `remark-gfm`
- `fflate`，用于 EPUB ZIP 内容处理
- `vite-plugin-pwa`
- `lucide-react`
- Vitest
- Oxlint

## 项目结构

```text
joint-md/
├─ src/
│  ├─ components/    # 文件队列、预览和布局组件
│  ├─ pages/         # 页面组件
│  ├─ tools/         # Markdown 工具
│  ├─ utils/         # 文件、Markdown、EPUB、下载和打印工具
│  ├─ workbench/     # 工作台状态与文档派生逻辑
│  └─ main.tsx       # 应用入口
├─ src-tauri/        # Tauri 2 桌面应用配置和 Rust 入口
├─ public/           # 图标和 PWA 资源
├─ docs/             # 项目文档与架构决策记录
├─ CONTEXT.md        # 领域术语和产品边界
└─ package.json
```
