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
  - `css/case.css?v=19`
  - `js/main.js?v=41`
  - `js/about.js?v=4`
  - `js/case.js?v=10`

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
| `cs-nav` / `cs-lb` | 上下篇导航（浅底）、lightbox |
| `cs-toc` | 左侧页内目录，由 `case.js` 依正文板块自动生成 |
| `cs-lessons` / `cs-lesson` | 学习与总结：大序号 + 完整阅读宽度的长文 |
| `cs-outro` / `cs-cta-card` / `cs-ai-pill` / `cs-summary` | 页尾行动区（浅底）：项目总结 popover、邮箱↔电话切换、问问 AI |

### 写新详情页的注意事项

1. 页面在 `work/` 下，所有资源路径要用 `../`。
2. `body` 必须带 `class="case-page"`，色彩变量定义在这个类上。
3. 详情页**不带页脚**（`s-footer` 只在一级页面出现），且**页尾整段是浅底**。
   顺序是：正文最后一节 → `cs-outro`（行动区）→ `cs-nav`（上下篇）。
   `cs-closing` 深色收尾块已弃用——它叠在页脚上会让末尾出现一整屏黑区。
   想放收束型引言，用正文里的 `cs-quote-dark`，不要再单独加深色段。
4. 深色段落用 `cs-hero` / `cs-closing`，浅色正文包在 `.cs-body` 里。
   `css/style.css` 里 `main section:not(...)` 那条规则已排除 `cs-hero`
   / `cs-closing` / `cs-section`，新增深色板块要同步加进那串 `:not()`。
5. `style.css` 有全局 `img { height:100%; object-fit:cover }`，
   `case.css` 已用 `.case-page img` 改回按比例显示。
6. 单位统一用 px，不要用 rem——根字号是 `13.28px`，rem 换算容易出错。
7. 详情页只加载 `case.js`，不要加载 `main.js`（后者是首页专用）。
8. 产品数据集中写在 `case.js` 顶部的数组里，作品墙 / 色板 / 胶囊 /
   网格 / lightbox 全部由它驱动，改一处即可。
9. 页尾行动区的联系方式、AI 提示词与目标站点都写在 `case.js` 顶部的
   `CONTACT` / `ASK_PROMPT` / `AI_TARGETS` 里，改一处即可。
   只保留 **ChatGPT 与 DeepSeek**——实测这两家的 `?q=` 能自动填入，
   豆包 / 混元 / Kimi 不识别该参数，点进去是空对话框，反而更差。
   点击时仍会先把提示词写进剪贴板做兜底。
   AI 图标必须用 `mask` + `currentColor` 上色——外部 SVG 里的 `currentColor`
   在 `<img>` 中不会继承父级颜色，会渲染成黑色。
   总结面板是**贴着按钮向上弹的 popover**，不是全屏弹窗；高度上限由 JS 按
   「按钮上沿到固定导航下沿」的可用空间算出，否则会钻到导航下面挡住关闭按钮。
10. 左侧页内目录无需手写：`initToc()` 会扫描 `.cs-body` 下的
   `.cs-section`，从各段 `.cs-num`（「01 — 项目背景」）解析序号与标题，
   缺 id 的自动补 `sec-01`。标题过长时在 section 上加 `data-toc="短标题"`
   覆盖即可。目录宽度受「1180 容器居中后剩下的左侧空白」限制：
   ≥1024px 才出现；「常显标题」还是「只显序号」不写死断点，由
   `fitToc()` 实测「目录右边缘」与「正文左边缘」的空隙决定，容器
   宽度以后再调也不用回来改这里。<1024px 隐藏。
   目录是浅底深字，显隐边界按目录自身高度动态计算，确保它整体压在
   浅色正文上，不会落到深色的首屏或收尾段而看不清。

### 昂楷科技产品单页系列（`work/ankki-product-sheets.html`）

- 首页精选作品 01 已指向该页。
- 13 款产品的名称与副标题取自单页 PDF 文本层，主色取自单页顶部色带
  实际取样，产品代号取自页脚，均非编写。
- 素材由 `彩页合集` 目录下 13 个 PDF 导出：
  `sheet/` 为 1400px 大图，`thumb/` 为 420px 缩略图，各 26 张。
- 页面正文里的同事姓名已改为「姓氏 + 职务」，避免公开真实全名。
- 真实素材已全部接入，占位块已清空：

| 文件 | 内容 | 脱敏处理 |
| --- | --- | --- |
| `doc/policy-notice.webp` | 任命通知（盖章发布） | 成员名单整块模糊 |
| `doc/policy-rules.webp` | 工作制度（三阶段 / 考核） | 正文中两处人名 |
| `doc/wecom-meeting.webp` | 企业微信评审会议召集 | 群成员名单、会议号 |
| `doc/minutes.webp` | 10 月 21 日评审纪要 | 参会人、三处责任人署名、正文一处人名 |
| `doc/gantt.webp` | 《月度营销资料设计情况》 | 负责人整列、两处离职备注、一处高管称谓 |
| `doc/email-release.webp` | 全员邮件发布公告 | 6 条内部云盘链接、电子书架地址 |
| `doc/ppt-front.webp` | PPT 区块模板正面 | 无需脱敏 |
| `doc/ppt-back.webp` | PPT 区块模板反面 | 无需脱敏 |
| `scene/booth-real.webp` | 展会现场实拍 | 已裁掉所有可辨识人脸 |
| `scene/booth-render.webp` | 展位陈列效果图 | AI 生成，页面已明确标注 |

- 脱敏用 `redact.py`（局部降采样再放大回原尺寸，不可逆）。若要新增脱敏，
  先用 `magick <图> -crop WxH+X+Y +repage -resize <放大>` 反复取点定位坐标，
  不要凭肉眼估算——估算过的坐标基本都偏。
- 人数有两个口径，别混用：制度**列名 12 位核心成员**（见任命通知），
  而 13 款产品逐款推进时每款还有对应的产品负责人与销售参与，
  **实际参与约 20 人**——首屏计数条用 20，制度板块把两个口径讲清楚。
  企业微信协作群 **17 人**，10 月 21 日评审会 **参会 11 人**。
  早期草稿里的「23 人」是错的，勿沿用。
- 页面不再自绘甘特图，直接用真实进度表截图（`cs-figure` 可点击放大），
  避免与原始文件出现两套互相矛盾的数据。

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
- 昂楷详情页已接入全部真实凭证：制度文件、企业微信会议召集、评审纪要、PPT 区块模板正反面、《月度营销资料设计情况》进度表、全员邮件发布公告、展会实拍与陈列效果图，全部经脱敏处理并支持点击放大。
- 03 制度先行已补上立项动因：公司此前无彩页体系、跨四部门职责不均、评审流程不透明导致周期过长，因此先出制度再做设计。
- 02 我的角色已用真实 PPT 区块模板替换示意图，并引用模板中「字号即约束」的原话。
- 09 已用真实进度表截图替换自绘甘特图；全站人数口径按制度文件校正为 12 人。
- 详情页正文字号已整体放大（按字号分档递进，小字提升最多，首屏大标题不变）。
- 详情页已增加左侧页内目录：自动生成、滚动高亮当前板块、点击平滑定位，只在浅色正文区间显示。
- 详情页已增加「11 学习与总结」板块（三条项目复盘），目录自动收录。
- 正文容器由 1180px 加宽到 1240px；并移除了 `.cs-lede` / `.cs-lesson p` /
  `.cs-hero-sub` / `.cs-hero-title` 上多余的 `max-width`（原先 46em ≈ 860px，
  比容器可用宽度窄 200px，导致文字提前换行、两边不齐）。可用宽度 1060 → 1120。
- 首屏 meta 的 Timeline 改为 Year / 2025，并把计数条里的「6 个月」换成
  「26 面」——避免不了解决策链长度的读者把执行周期误读成效率问题。
- 01 的核心提问改为展会场景：正面抓非技术背景的参观者、背面给专业人士深读。
- 详情页页脚已移除（只保留一级页面的页脚），收尾引言下的署名一并删掉。
- 参与人数口径改为「实际参与约 20 人」，制度板块同时说明 12 位列名成员的来源。
- 页面正文与代码里不再出现真实姓名，对外统一用 **Maridian**。
  注意：制度 / 纪要 / 邮件 / 甘特图等**截图里仍有真实姓名**，见下方待办。
- 页尾已整体改为浅底：删掉深色 `cs-closing`，B 端设计观那句引言移入「11 学习与总结」末尾。
- 页尾行动区按 murynmukha.com 的形制重做：大圆角浅色 CTA 卡、药丸控件、
  分层柔和阴影 + 顶部内高光；主色沿用本站橙色（参考站的蓝配暖白纸底会显得外来）。
- AI 入口收敛为 ChatGPT + DeepSeek 两家。
- 详情页新增页尾行动区（参考 murynmukha.com）：左侧「项目总结」弹层供快速通读，
  中间联系卡支持邮箱↔电话切换与一键复制，右侧五个国内外模型入口可带提示词直接提问。
- 收尾引言已按用户要求删掉第二句，只保留「B 端产品不应该用 B 端的方式设计」那一段。
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
