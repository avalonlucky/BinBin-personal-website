# Maridian Space 网站交接说明

更新时间：2026-06-02

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
  - `css/style.css?v=62`
  - `js/main.js?v=39`
  - `js/about.js?v=2`

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
- About 阅读动效已从椭圆轨迹改为正圆轨迹，卡片放大，并通过底部透明渐隐只展示上半圆，形成完整圆圈被页面裁切的视觉。
- 设计服务行已经调整比例：
  - 展开行高度约 `466px`
  - 左图约 `727 x 465px`
  - 右侧内容约 `1264px` 宽
  - 收起行高度约 `150px`
  - 图片底部与容器基本贴合，不应再出现明显留白
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
