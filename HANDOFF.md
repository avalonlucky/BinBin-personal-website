# Maridian Space 网站交接说明

更新时间：2026-08-12

## 项目信息

- 本地目录：`/Users/luban/Documents/个人网站`
- GitHub：`https://github.com/avalonlucky/BinBin-personal-website`
- 正式站：`https://chaoshanai.com`
- Cloudflare Pages 项目：`binbin-personal-website`
- 参考网站：`https://estrela.studio`

## 当前状态

- 当前本地工作分支：`main`
- 正式发布分支：GitHub 远端 `main`
- 当前正式站代码提交：以 GitHub 远端 `main` 最新提交为准
- 正式站当前资源版本：
  - `css/style.css?v=73`
  - `css/case.css?v=3`
  - `js/main.js?v=41`
  - `js/about.js?v=4`
  - `js/case.js?v=2`

## 作品详情页（Case Study）体系

作品详情页不使用固定页面模板，而是用一套**板块积木**按项目重新排列。

### 文件结构

```
work/<slug>.html      每个作品一个独立页面
css/case.css          case-study 板块库，所有详情页共用
js/case.js            详情页滚动架构与交互，所有详情页共用
assets/work/<slug>/   该作品的图片资源
```

### 板块库（`css/case.css`，全部 `cs-` 前缀）

| 板块 | 用途 |
| --- | --- |
| `cs-hero` + `cs-hero-meta` | 深色项目头，含 Client / Role / Timeline / Deliverable |
| `cs-wall` + `cs-sheet` | 双轨反向滚动的作品墙，边缘 mask 渐隐 |
| `cs-metrics` | 深色数字计数条 |
| `cs-section` + `cs-num` / `cs-title` / `cs-lede` | 浅色正文段落 |
| `cs-stats` / `cs-cards` / `cs-question` | 数字、三栏卡片、大提问 |
| `cs-hub` | 多方汇聚图，SVG 曲线由 JS 按实际布局计算 |
| `cs-compare` | 两栏对照（问题 vs 方案），`is-mine` 标出自己那栏 |
| `cs-inst` / `cs-stages` / `cs-minutes` / `cs-docs` | 制度、流程阶段、会议纪要、文件凭证 |
| `cs-flip` | 滚动驱动的正反面翻转 |
| `cs-layouts` | 版式对比示意条 |
| `cs-pills` | 副标题 / 标签胶囊，可按数据染色 |
| `cs-flow` / `cs-specs` / `cs-phases` | 流程步骤、规范卡、三阶段 |
| `cs-palette` + `cs-swatches` | 色板 ↔ 作品预览联动 |
| `cs-gantt` / `cs-timeline` | 甘特图、里程碑时间轴 |
| `cs-delivery` / `cs-grid13` | 交付数字、作品网格 |
| `cs-scene` | 场景图位，未就位时显示占位与目标路径 |
| `cs-closing` / `cs-nav` / `cs-lb` | 深色收尾、上下篇导航、lightbox |

### 写新详情页的注意事项

1. 页面在 `work/` 下，所有资源路径要用 `../`。
2. `body` 必须带 `class="case-page"`，色彩变量定义在这个类上。
3. 深色段落用 `cs-hero` / `cs-closing`，浅色正文包在 `.cs-body` 里。
   `css/style.css` 里 `main section:not(...)` 那条规则已排除 `cs-hero`
   / `cs-closing` / `cs-section`，新增深色板块要同步加进那串 `:not()`。
4. `style.css` 有全局 `img { height:100%; object-fit:cover }`，
   `case.css` 已用 `.case-page img` 改回按比例显示。
5. 单位统一用 px，不要用 rem——根字号是 `13.28px`，rem 换算容易出错。
6. 详情页只加载 `case.js`，不要加载 `main.js`（后者是首页专用）。
7. 产品数据集中写在 `case.js` 顶部的数组里，作品墙 / 色板 / 胶囊 /
   网格 / lightbox 全部由它驱动，改一处即可。

### 昂楷科技产品单页系列（`work/ankki-product-sheets.html`）

- 首页精选作品 01 已指向该页。
- 13 款产品的名称与副标题取自单页 PDF 文本层，主色取自单页顶部色带
  实际取样，产品代号取自页脚，均非编写。
- 素材由 `彩页合集` 目录下 13 个 PDF 导出：
  `sheet/` 为 1400px 大图，`thumb/` 为 420px 缩略图，各 26 张。
- 制度文件里的同事姓名已改为「姓氏 + 职务」，避免公开真实全名。
- 待补素材（占位块会显示目标路径）：
  - `assets/work/ankki/doc/ppt-template.png`
  - `assets/work/ankki/doc/policy.png`
  - `assets/work/ankki/doc/dingtalk.png`
  - `assets/work/ankki/doc/minutes.png`
  - `assets/work/ankki/doc/gantt.png`
  - `assets/work/ankki/scene/booth.jpg`

## 已完成的主要修改

- 品牌名称已从 `Estrela Studio` 改为 `Maridian Space`。
- 已移除品牌名称旁的 `TM` 标记。
- 浏览器标签页图标已替换为 `M`。
- 首屏左右文案已替换为中文主标题和副标题。
- 顶部导航已调整为磨砂玻璃效果，去除不符合参考站的黑色阴影和描边。
- 导航中间菜单在滚动时保持显示。
- 首屏文字滚动效果已按参考站方向进行调整。
- 已移除用户认为不重要的中间展示板块。
- “精选作品”区域已改为五个横向作品矩形，并补充标题和副标题。
- 已在“精选作品”上方增加“AI 是我的第二支笔”板块，使用双轨错向滚动展示常用 AI 工具标识。
- AI 工具板块已增加“滚动 / 网格”模式切换，并收紧与“精选作品”之间的留白。
- AI 工具桌面网格模式已调整为紧凑的八列两行布局，移动端仍保持两列。
- AI 工具列表已替换为当前工作流版本：加入 Claude、Obsidian、GitHub、Remotion，并移除可灵、Perplexity、DeepSeek、Runway。
- AI 工具滚动轨道会根据视口宽度自动补足循环内容，并通过单层透明度遮罩在左右边缘自然渐隐，避免宽屏滚动时露白。
- AI 工具滚动轨道的透明度渐隐范围已扩展到左右各约 24%，让 Logo 更早进入淡出过程。
- “我怎么看设计”已移除顶部与行间描边，并恢复位于三张设计卡片下方的独立 CTA 区块及填充按钮 hover 动画。
- 顶部导航会根据页面背景切换主题：首屏与“设计之外”后的深色区域使用白字，中间浅色区域使用黑字。
- “我怎么看设计”区域已按参考站结构制作，包括三行设计服务。
- 已移除与“我怎么看设计”重复的 “What We Do” 区域及相关入口。
- Testimonials 区域已调整为“设计之外”，沿用参考站背景图与居中玻璃卡片布局。
- “设计之外”轮播已按参考站改为桌面端三卡可见、左右箭头跟随鼠标、点击循环切换，并带紫色动态描边。
- 侧边卡片仅弱化文字，不再降低整张玻璃卡片透明度，默认三卡均清晰可见。
- “设计之外”标题区已与“我怎么看设计”统一为左对齐中文标题样式，白色文字适配黑色背景。
- 已在“设计之外”下方增加“我的价值观”板块，参考 laugon.com 使用双列暗色原则卡片布局。
- “我的价值观”板块已使用本地黑白肖像作为背景，价值观卡片改为单行横向滚动玻璃卡，并加入左右箭头控制。
- “设计之外”轮播指针交互已用 requestAnimationFrame 节流，箭头跟随改为 transform-only 移动，并简化描边计算；“我的价值观”背景顶部已改为透明渐隐，肖像位置上移。
- “我的价值观”桌面端卡片流已调整为约 3.5 张可见，并把右箭头浮到卡片流右侧作为继续浏览提示。
- “设计之外”轮播紫色效果已修正为鼠标所在卡片边框上的局部渐隐描边，箭头本身不再带紫色光晕，并保持 requestAnimationFrame / transform 跟随以避免鼠标移动卡顿。
- “AI 是我的第二支笔”网格模式下的工具卡片已去掉矩形描边。
- “AI 是我的第二支笔”网格模式已恢复低对比小方块背景但无描边；“我怎么看设计”服务行改为全宽；“我的价值观”卡片去掉序号并调整标题/正文垂直居中；testimonial 紫色描边改为投射到最近边缘，减少缺口感。
- “我的价值观”右侧圆形滚动按钮已替换为低透明度滑动提示箭头；每次页面刷新后首次滚到该区域时闪烁三次后消失。
- “我的价值观”滑动提示箭头动画已调整为约 5 秒、每秒一次的较慢闪烁，并提升了可见度。
- 已新增独立 About 页面，用持续旋转的环形书籍卡片展示最近阅读内容；当前书籍以可替换文字封面呈现，色彩使用网站米黄色、黑色、橙色体系。
- About 阅读动效已按参考页源码结构重做为 8 根等角度辐条、每根两端各 1 张卡片的统一旋转圆盘；桌面端上半圈稳定显示 8 张清晰卡片，底部通过 50% 高度渐隐层留下 2 张剪影，圆盘以 60 秒匀速持续旋转。
- About 阅读圆盘已整体下移，在顶部导航与最上方书卡之间保留稳定安全距离，避免卡片与导航发生遮挡或视觉粘连。
- 首页 FAQ 已按原站代码重做：标题使用 PP Migra，问题与答案使用 PP Neue Montreal；桌面端恢复左右双栏排版、括号加号控件、独立展开、分行上滑和鼠标跟随紫色分隔线效果。
- “我的价值观”肖像背景底部已增加渐隐，与 FAQ 黑色背景自然衔接；FAQ 改为上下对称留白并整体上移，收起状态下内容在板块内垂直居中。
- FAQ 标题不再依赖原站固定左边距，而是使用内容宽度配合自动外边距，在桌面端和移动端都严格对齐视口水平中心线。
- FAQ 每一整行均可点击展开或收起，包括问题标题、答案与行内空白区域；右侧括号按钮和键盘操作继续保留。
- 页脚文字层级已按原站浏览器计算值校正：桌面端主要文字约 21px，移动端约 15px；栏目标题使用 PP Migra，导航、按钮和联系方式使用 PP Neue Montreal。
- 页脚已移除右侧装饰符号和左下角版权文字；联系电话更新为中国大陆与香港号码，并保持可点击拨号。
- 页脚 Navigation / Social 标题改为略粗的灰色无衬线字体；社交列表更新为 LinkedIn、Instagram、Twitter、Facebook、TikTok，并配套统一的线性品牌图标。
- 设计服务行已经调整比例：
  - 展开行高度约 `466px`
  - 左图约 `727 x 465px`
  - 右侧内容约 `1264px` 宽
  - 收起行高度约 `150px`
  - 图片底部与容器基本贴合，不应再出现明显留白
- 已新增作品详情页体系（`css/case.css` + `js/case.js`），以板块积木组合排版，不依赖固定页面模板。
- 已完成第一个作品详情页：昂楷科技产品单页系列，含 13 款单页作品墙、滚动翻面、13 色色板联动、交互甘特图、里程碑时间轴与正反面 lightbox。
- 首页精选作品 01 已从占位图替换为昂楷项目，并接入详情页链接。
## 用户的视觉要求

视觉修改不能只靠 CSS 猜测。每次都需要：

1. 仔细对照参考网站和用户截图。
2. 检查字号、间距、比例、颜色、边界、hover 状态和滚动状态。
3. 修改后使用浏览器实际渲染检查。
4. 同时检查默认状态、hover 状态、鼠标移开状态。
5. 发布后再去 `https://chaoshanai.com` 验证正式站，不要只验证本地。

后续所有板块的标题和副标题，优先采用左对齐、上下排版。

## 发布流程

提交并推送到正式分支：

```bash
cd /Users/luban/Documents/个人网站
git add <files>
git commit -m "<message>"
git push origin HEAD:main
```

部署 Cloudflare Pages：

```bash
rm -rf /tmp/binbin-pages-deploy
mkdir -p /tmp/binbin-pages-deploy
rsync -a --exclude='.git' --exclude='.learnings' --exclude='.DS_Store' ./ /tmp/binbin-pages-deploy/
env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy \
  npx wrangler pages deploy /tmp/binbin-pages-deploy \
  --project-name binbin-personal-website \
  --branch main \
  --commit-hash "$(git rev-parse HEAD)" \
  --commit-message "<message>"
```

注意：本机代理可能导致 Wrangler 刷新 Cloudflare token 时出现 `ECONNRESET`。部署时应使用上面的 `env -u ...` 方式绕开代理。

## 发布后验证

检查正式站资源版本：

```bash
curl -L -s https://chaoshanai.com | rg -n "style\\.css\\?v=|main\\.js\\?v="
```

如修改了 CSS，请同步增加 `index.html` 中的 CSS 查询参数版本，避免浏览器缓存旧样式。

## 最近提交

```text
1ec65e7 Match reference CTA hover animation
44c04c1 Adjust design row proportions
9066e1e Fix s-design-view to match estrela.studio reference measurements
47524bc Fill design row media column
8bb3d14 Scale design rows responsively
82b35d5 Match design row media sizing
```
