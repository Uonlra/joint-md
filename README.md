# Joint MD

一个完全在浏览器本地运行的 Markdown 合并与阅读工具。它可以将多个 `.md` / `.markdown` 文件按指定顺序拼接，实时预览结果，并导出 Markdown 或通过浏览器另存为 PDF。

## 功能

- 拖拽或选择多个 `.md`、`.markdown` 文件
- 调整合并顺序：拖拽、上移、下移、移除文件
- 三种 Join Mode：Plain（空行）、Rule（分隔线）、Filename Heading（文件名标题）
- GitHub Flavored Markdown 预览，支持表格、代码块、引用和任务列表
- 导出合并后的 `.md` 文件
- 打开打印窗口并使用浏览器“另存为 PDF”
- 阅读模式：收起文件队列，专注阅读正文
- 自动生成 H1-H3 目录，可跳转到对应章节
- 调整字号、护眼纸张色
- 在浏览器中保存字号、纸张色与相同文档的阅读进度
- 所有文件仅在当前浏览器页面内处理，不上传到服务器

## 技术栈

- React 19
- TypeScript
- Vite
- react-markdown + remark-gfm
- lucide-react
- 浏览器 File API、Blob API、localStorage、原生 Drag and Drop API

第一版没有后端、数据库、账户系统或云端文件存储。

## 本地运行

环境要求：Node.js 20 或更高版本。

```bash
cd joint-md
npm install
npm run dev
```

启动后访问终端输出的本地地址，通常为：

```text
http://127.0.0.1:5173
```

生产构建：

```bash
npm run build
```

静态检查：

```bash
npm run lint
```

## 使用说明

1. 在左侧拖入或选择需要合并的 Markdown 文件。
2. 使用拖拽手柄或上下箭头确定文件顺序。
3. 选择 Join Mode，并设置导出名。
4. 在右侧确认预览结果。
5. 点击“导出 Markdown”下载合并文件，或点击“打印为 PDF”，在浏览器打印面板中选择“另存为 PDF”。
6. 点击顶部“阅读模式”进入沉浸式阅读；可使用工具栏的目录、字号和纸张色控制。

## PDF 说明

本项目的 PDF 导出使用浏览器原生打印能力，因此无需安装 Playwright、Chromium 或运行 Node 服务。点击“打印为 PDF”后，请在系统打印界面选择：

```text
目标：另存为 PDF
```

这比浏览器端截图式 PDF 更稳定，也能更好保留文本的可搜索性和复制能力。

## 当前范围

第一版不包含以下功能：

- PDF 转 Markdown
- 扫描件 OCR
- 保证复杂 PDF 的版式还原
- 云端存储、协作、账号与同步

PDF 本身通常不含完整的语义结构，PDF 转 Markdown 在复杂排版、表格、双栏文档和扫描件上很难可靠还原。因此该功能会在后续版本以独立模块评估，而不会影响当前轻量本地工具的使用。

## 项目结构

```text
joint-md/
├─ src/
│  ├─ App.tsx        # 文件合并、阅读器、导出逻辑
│  ├─ App.css        # 工作台与阅读模式样式
│  ├─ main.tsx       # React 入口
│  └─ index.css      # 全局基础样式
├─ package.json
└─ vite.config.ts
```

## 隐私

选择的文件由浏览器 File API 读取，只存在于当前页面内存中。刷新页面或关闭标签页后，文件内容会被清除；仅阅读器的字号、纸张色和滚动位置会保存到当前浏览器的 `localStorage`。
