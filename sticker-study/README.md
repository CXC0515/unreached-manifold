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
