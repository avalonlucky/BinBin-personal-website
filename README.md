# Maridian Space 个人网站

**正式网站：** https://chaoshanai.com  
**视觉参考：** https://estrela.studio  
**本地预览：** `python3 -m http.server 8765` 然后打开 http://localhost:8765  
**复刻进度：约 98% 视觉还原**

---

## 文件结构

```
设计师网站/
├── index.html          # 主页面（唯一页面）
├── css/
│   └── style.css       # 全部样式（含 CSS 变量、字体、各 section）
├── js/
│   └── main.js         # 全部 JS（GSAP 动画、Lenis 滚动、Canvas 边框、FAQ 等）
├── fonts/
│   ├── PPMigra-Regular.woff2     # 标题字体（正文）
│   ├── PPMigra-Italic.woff2      # 标题字体（斜体，用于 exp 区块橙色字）
│   └── PPNeueMontreal-Regular.woff2  # 正文字体
├── README.md           # 本文件
└── HANDOFF.md          # AI 交接文档（技术细节 + 待办）
```

---

## 技术栈

| 库 | 版本 | 用途 |
|---|---|---|
| GSAP | 3.12.5 | 所有动画 |
| ScrollTrigger | 3.12.5 | 滚动触发 + pin（钉住）效果 |
| Lenis | 1.1.14 | 丝滑滚动 |

全部通过 CDN 引入，无需 npm/构建。

---

## 设计规范

```css
--c-black:  #020202   /* 深黑背景 */
--c-white:  #FBFBF4   /* 米白背景 */
--c-orange: #FF852D   /* 橙色高亮 */
--gutter:   4.5rem    /* 左右内边距 */
```

根字体大小：`13.28px`

---

## 各 Section 一览

| Section | 背景色 | 特殊效果 |
|---|---|---|
| Hero | 黑 | 全屏视频 + 标题飞入动画 |
| AI 工具 | 米白 | 双轨错向滚动 Logo 墙，可切换为卡片网格 |
| Work | 米白 | 横向网格：暗色特色列 + 4 个项目列，计数器动画 |
| About | 米白 | **GSAP Pin**（+=200%）+ 超大"who we are"标题 |
| 设计之外 | 黑 | 参考站背景图 + 居中玻璃卡片轮播 |
| 我的价值观 | 黑 | 肖像背景 + 单行横向滚动玻璃卡片 |
| FAQ | 黑 | 手风琴展开/折叠，GSAP 高度动画 |
| Footer | 黑 | 实时时钟（开普敦 GMT+2），大字 wordmark 视差 |

---

## 图片 / 视频资源

全部来自 Prismic CDN（原版服务器），直接用 URL 引用：
- 视频：`estrelastudio.cdn.prismic.io`
- 图片：`images.prismic.io/estrelastudio/`

**后期替换内容时，直接把这些 URL 换成自己的图片即可。**

---

## 本地运行

```bash
cd "/Users/luban/Desktop/设计师网站"
python3 -m http.server 8765
# 打开 http://localhost:8765
```
