# 造景贴纸素材处理

从 `/Users/cxc/Projects/personal/new` 读取五张 Gemini JPEG，按 `manifest.json` 裁切 21 件贴纸，生成透明 PNG 和两张静态场景预览。脚本不修改原图，也不修改个人主页。

## 运行

先检查，不写文件：

```bash
bash /Users/cxc/Projects/personal/unreached-manifold-sticker-garden/sticker-study/run.sh --dry-run
```

实际生成：

```bash
bash /Users/cxc/Projects/personal/unreached-manifold-sticker-garden/sticker-study/run.sh
```

也可以把两行一起复制到终端，先看第一行成功再让第二行继续：

```bash
bash /Users/cxc/Projects/personal/unreached-manifold-sticker-garden/sticker-study/run.sh --dry-run && bash /Users/cxc/Projects/personal/unreached-manifold-sticker-garden/sticker-study/run.sh
```

默认输出到本目录的 `generated/`。其中 `stickers/` 是 21 张透明 PNG，`proof-contact-sheet.png` 用于逐张检查边缘，`preview-initial.png` 和 `preview-complete.png` 是初始与完成状态，`report.json` 记录裁切范围、像素数量和来源文件哈希。

如果输出目录已有文件，脚本会停止而不覆盖。重新生成时指定一个新目录，例如：

```bash
bash /Users/cxc/Projects/personal/unreached-manifold-sticker-garden/sticker-study/run.sh --output-dir /Users/cxc/Projects/personal/unreached-manifold-sticker-garden/sticker-study/generated-v2
```

`manifest.json` 中的 `crop`、`seed` 和 `place` 分别控制每张贴纸的来源范围、抠图起点及场景中的位置。初始轮廓和完成贴纸共用 `place`，因此位置必然一致。贴纸源图的灰底是 JPEG，自动抠图后仍需检查白边、树枝空隙、三段路的接缝和桥与池塘的组合效果。

## 自由摆放网页

抠图完成后，运行下面一行命令并保持终端窗口打开：

```bash
bash /Users/cxc/Projects/personal/unreached-manifold-sticker-garden/sticker-study/serve-editor.sh
```

浏览器打开 `http://127.0.0.1:8765/unreached-manifold-sticker-garden/sticker-study/editor.html`。编辑页从空画布开始，可拖放或点击添加贴纸，选中后缩放、旋转、调整层级、复制或移除。位置自动保存在当前浏览器的本地存储；点击“导出摆放 JSON”可以把布局文件发来继续制作。网页只在本机的 `127.0.0.1` 提供服务，不接入现有主页。

## 拼贴试玩页

同一个本地服务启动后，打开 `http://127.0.0.1:8765/unreached-manifold-sticker-garden/sticker-study/garden.html`。`layout.json` 是用户在编辑器导出的 23 件贴纸布局，保留位置、大小、旋转和层级；其中路灯和花圃各有两张。

试玩时拖贴纸靠近对应轮廓即可吸附；也可以先点贴纸，再点轮廓。完成全部 23 件后相机可拍摄，展示基于现有主页文案的作品介绍；顶部始终保留“直接看作品”。进度只存在当前浏览器的本地存储。此页是独立实验，没有接入主页，也没有真实拍照、作品详情页或部署。

## 完整主页预览

`home.html` 是贴纸花园版个人主页预览，仍留在独立 worktree，不替换现有首页。它把贴纸包放到底板左侧纸面，包内每页显示四张贴纸；右侧 23 件目标的位置、比例与层级仍由 `layout.json` 决定。页面下方有 AI 产品作品、空间探索和个人介绍；「直接看作品」始终可用。

启动同一个本地服务后打开：

```text
http://127.0.0.1:8765/unreached-manifold-sticker-garden/sticker-study/home.html
```

`assets/` 保存了此预览需要的底板、贴纸包与 21 种贴纸 WebP，原始 Gemini JPEG 与生成的 PNG 均未改动。摄影区当前是明确标注的插画示意；拍摄按钮生成网页内的模拟相纸，不调用设备相机。
完整主页预览只依赖 `assets/`，即使未运行贴纸 PNG 生成脚本，也可以用 `serve-editor.sh` 打开；原编辑页与试玩页仍需要 `generated/stickers/`。
