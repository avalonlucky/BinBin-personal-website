# AI 交接文档 — Maridian Space 个人网站

> 给下一个接手的 AI 看的。记录了做了什么、怎么做的、还差什么。

---

## 当前状态（约 98% 还原）

该项目已正式上线，线上域名为 **https://chaoshanai.com**。当前前台品牌名为 **Maridian Space**，视觉参考站为 Estrela Studio。  
页面已完整实现，所有动画正常，视觉与原版高度一致。  
浏览器截图验证通过：页面高度精确匹配原版 **12614px**（viewport 1913×1096）。

---

## 已完成的关键问题 & 解决方案

### 1. Pin 区块之间出现黑色空白
**问题：** GSAP ScrollTrigger pin 会创建 `.pin-spacer` 占位 div，背景透明，导致页面滚动时出现黑色间隔。  
**解法：** 在 `style.css` 加：
```css
.pin-spacer { background: var(--c-white) !important; }
```

### 2. GSAP `from()` 动画让元素在触发前消失
**问题：** GSAP 默认 `immediateRender: true`，导致所有 `from()` 动画的元素在页面加载时被隐藏。  
**解法：** 所有 ScrollTrigger + `from()` 动画都加 `immediateRender: false`。

### 3. 双重 init 导致 Pin 不生效
**问题：** `initScrollAnimations()` 被调用两次，第二次 ScrollTrigger 重复注册失败。  
**解法：** 加了 guard：
```javascript
let _scrollAnimsDone = false;
function initScrollAnimations() {
  if (_scrollAnimsDone) return;
  _scrollAnimsDone = true;
  // ...
}
```

### 4. 服务区块图片视差选择器错误
**问题：** JS 里写的是 `.svc-img img`，但 HTML 里的 class 是 `.svc-fig`。  
**解法：** 改为 `'.svc-fig img, .about-img img'`。

### 5. 浏览器缓存旧版 JS/CSS
**问题：** 改了 JS/CSS 但浏览器不更新。  
**解法：** 用 `?v=N` 参数手动 busting，目前 CSS=v8，JS=v7。

### 6. 动画体感与原站不一致（2026-05-29 重做）
**问题：** 原站几乎所有揭示/视差都是 **scrub（绑定滚动位置）**，元素随滚轮连续来回运动且可逆；我的复刻原本大多是 `gsap.from()` + `start:'top 80%'` **进入视口播一次就停**，往回滚不倒放，体感"到点弹一下"而非"滚动即运动"。原站抓包：**27 个 `scrub:true`**，我原本只有 4 个。  
**解法：**
- Lenis 由 `duration:1.25` 改为 **`lerp:0.1`** 模式（跟手，贴近原站 39 处 lerp 用法），加 `syncTouch:true`。
- 把所有揭示动画从 `gsap.from(...,{start:'top 80%'})` 改写为 **`gsap.fromTo(...,{scrollTrigger:{start, end, scrub:true}})`**，绑定滚动范围、可逆。
- 验证：滚动中段 work-item op=1（已显现）、未进入范围 op=0（隐藏可逆），Services/Testimonials 各段截图无破绽。

### 7. 滚动架构 1:1 还原原站（2026-05-29）
**原站结构（抓包确认）：** `body(不滚) > div.site > main.page.lenis(滚动容器·黑底) > .page-bg + .page-scroll(装所有 section)`。Lenis 挂在 `main.page` 这个 `overflow:auto` 容器上做**原生滚动**（不是 transform 虚拟滚动，`.page-scroll` transform 恒为 none）。深色段（hero/testimonials/faq/footer）**背景透明**，露出 `main.page` 的持续黑底；浅色段（work/about/services）实白盖在上面。  
**注意：此架构在桌面端无可见差异**（持续黑底 vs 每段各自黑底视觉相同，白/黑边界是硬切无圆角无渐变）。唯一实际好处是移动端避免地址栏伸缩跳动。是按用户要求做的 1:1 结构还原。  
**实现要点：**
- HTML：`<body><div class="site"> … <main class="page"><div class="page-bg"></div><div class="page-scroll"> …sections… </div></main></div></body>`（nav/cursor/preloader 作为 fixed 浮层放在 .site 内、main 外）。
- CSS：`html,body{height:100%;overflow:hidden}`；`main.page{position:fixed;inset:0;height:100vh;overflow-y:auto;background:var(--c-black)}`；深色 section 改 `background:transparent`。
- JS：`const scroller=document.querySelector('.page')`；**`ScrollTrigger.defaults({scroller})` 必须在创建任何 trigger 之前**；Lenis 用 `new Lenis({wrapper:scroller, content:'.page-scroll', lerp:0.1, …})`。
- **坑：** 换 scroller 后所有 ScrollTrigger（含 pin）的定位都基于 `.page`。若新增 trigger 忘了走 defaults 会错位。已验证 45 个 trigger（38 scrub+2 pin）`scroller===main` 全部正常。

### 8. 对照原站录屏补的两处细节（2026-05-29）
用户提供原站首页录屏，抽帧对比后补齐：
- **导航显示策略**：原站离开 hero 顶部后会收起 `Work/About/Services/Contact` 那颗 pill，只留品牌名 + `···`；本站按用户要求做了小改动，桌面端中间导航始终保留，不再添加 `is-compact`。
- 另确认：hero 视频本来就在播放（`autoplay muted loop`），`main.js` 里的 `currentTime=7.5` 只是设初始帧，不影响循环播放，无需改动。

### 9. Work「Featured Work」段对齐原站（2026-05-29）
抓原站 DOM + 录屏抽帧对比，原站这段是 `.work-grid > .work-col-featured(深色面板) + 4×.work-col-project(纯图列)`，文字用 `.line-mask` 逐行遮罩揭示。修正我方差异：
- **面板标题置顶**：`.work-featured` 由 `justify-content:space-between` 改 `flex-start`；`.work-all-link` 加 `margin-top:auto` 推到底部；隐藏大编号（`.work-featured-num{display:none}`）。
- **项目列纯图片**：隐藏列编号（`.work-col-num{display:none}`）和常驻 meta；`.work-col-meta` 默认 `opacity:0`，`.work-col:hover` 时淡入上移揭示 client/title/tags。
- **逐行遮罩揭示动画**：标题 HTML 改成 `<span class="lmask"><span class="lmask-in">Featured</span></span>`（两行），CSS `.lmask{overflow:hidden}`，JS `fromTo(.lmask-in, {yPercent:110},{yPercent:0, stagger:.12, scrub})`。描述+链接 scrub 上升。
- **项目列交错升起**：`fromTo('.work-col',{y:70,opacity:0},{…stagger:.13, scrub, trigger:'.s-work'})`，取代原先整列一起淡入的写法。
- 注意：`#workCounter` 元素保留（仅 `display:none`），`animCounter()` 仍引用它，删元素会报错。

### 10. Work 段真正的核心动效是 hover 交互（2026-05-29，纠正第10条方向）
用户指出重点不是滚动进场，而是 **作品卡 hover/聚焦展开** + **All Work 变色**。抓原站 hover 状态确认机制：列是 flex 项，hover 哪列哪列 `active`（宽 460）、其余压缩（238），`transition:all` 平滑；激活卡显示 编号/客户/标题/标签 + 居中 `View project` 按钮；默认 active = 深色 featured 面板（最宽）；hover featured 时整个面板填充紫色 `#D08CF5`、标题描述淡出、All Work 变居中黑胶囊。
- **实现（纯 CSS hover，无需 JS）：**
  - 展开：`.work-featured,.work-col{flex:1 1 0; transition:flex-grow .65s}`；默认 `.work-featured{flex-grow:2.2}`；`.work-grid:hover .work-featured{flex-grow:.9}` + `.work-grid:hover .work-col{flex-grow:.82}`（让位）；`.work-grid:hover .work-col:hover{flex-grow:2.8}`（展开，注意特异性要靠源码顺序在后）。
  - 信息浮层 `.work-col-info`（absolute 左上）+ `.work-view-btn`（absolute 居中）默认 `opacity:0`，`.work-col:hover` 显示；`.work-col::after` 渐变暗罩保证文字可读。
  - All Work 填充：`.work-featured::before{background:#D08CF5; transform:translateY(101%)}` → `:hover{translateY(0)}`；`.work-featured:hover .work-featured-body{opacity:0}`；`.work-all-link` hover 时 `position:absolute; left/top:50%; translate(-50%,-50%)` 变黑胶囊。
  - HTML：`.work-col` 改成 `<a>`，内含 `figure.work-col-img` + `.work-col-info`(num/client/title/tags) + `.work-view-btn`。
- 第10条的「逐行遮罩 lmask」「列交错 cascade 进场」保留，作为进场动画与 hover 动效并存。

### 11. Work hover 升级：吸收用户 demo 的更优手法（2026-05-29）
用户做了独立 demo（`/Users/luban/Documents/乱七八糟/featured-work-effect-demo/`），交互更接近视频。移植了 4 个手法到正式站：
- **`:has()` 驱动整组**：用 `.work-grid:has(.work-col:hover) .work-col{flex-grow:.8}` + `…:hover{flex-grow:2.7}` 取代 `.work-grid:hover` 链，更干净且能联动面板。
- **激活卡长高 + 置顶溢出**（最关键，之前漏了）：`align-items:flex-start` + 卡片定高 `height:min(51vw,630px)`、首卡 `min(58vw,720px)`、激活 `min(66vw,860px)` + `z-index:2`；`.s-work` 加 `position:relative;z-index:2` 和 `padding-bottom` 给溢出留空间，避免被 about 段盖住。
- **View project 跟随鼠标**：`.work-view-btn{left:var(--cta-x,50%);top:var(--cta-y,50%)}` + `initWorkCta()` 里 `pointermove` 写 `--cta-x/--cta-y`（clamp 26–82% / 24–72%）。
- **meta 改半透明 chip**：`.work-col-client/.work-col-title{display:table;background:rgba(251,251,244,.16);padding:…}`。
- 经验：纯 CSS `:has()` + flex-grow/height 过渡即可做到视频级展开，无需 JS（JS 仅用于 CTA 跟随鼠标）。

---

## 关键代码结构

### main.js 函数列表
```
initCanvasBorders()   — nav pill 的 Canvas 动态边框
initPreloader()       — logo 弹入 → 页面揭开 → hero 标题飞入
initCursor()          — 自定义鼠标（Estrela bird mark SVG）
initNavTheme()        — 滚动到 .s-work 时 nav 切换 dark/light 主题
initScrollAnimations()— 所有 ScrollTrigger 动画（含 About pin）
animCounter()         — work section 数字计数器动画
initFAQ()             — FAQ 手风琴（GSAP height: auto）
initDragScroll()      — Testimonials 拖拽横滑
initHeroTilt()        — Hero 鼠标视差倾斜
initClock()           — Footer 实时时钟（开普敦时区）
```

### CSS 版本号
- `style.css?v=21`（index.html `<head>`）
- `main.js?v=14`（index.html 底部）

下次改完记得把版本号 +1，否则浏览器会缓存旧文件。

---

## Pin 区块滚动机制

一个 section 被钉住（GSAP pin）：

| Section | trigger | end | 产生的额外滚动高度 |
|---|---|---|---|
| `.s-about` | `top top` | `+=200%` | ~2192px |

**效果：** 用户在 About 区块会停留更久，内容慢慢移动。  
**注意：** pin spacer 需要 `.pin-spacer { background: var(--c-white) }` 否则显示黑色。

---

## 英雄区视频

视频文件来自 Prismic CDN，无法替换（外部链接）。  
当前在 JS 里设置了 `currentTime = 7.5` 来固定一帧最好看的画面（三根粉橙色水晶柱）。  
后期替换成自己的视频后可以删掉这行。

```javascript
// main.js 底部 INIT 区
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  const seek = () => { heroVideo.currentTime = 7.5; };
  heroVideo.readyState >= 1 ? seek() : heroVideo.addEventListener('loadedmetadata', seek, { once: true });
}
```

---

## 字体说明

本地 woff2 文件位于 `fonts/` 目录：
- `PPMigra-Regular.woff2` — 标题（serif，用于 h1/h2 等）
- `PPMigra-Italic.woff2` — 标题斜体
- `PPNeueMontreal-Regular.woff2` — 正文（sans-serif，500 weight）

**没有 Bold 字重**，footer wordmark 用的是 `font-weight: 700` + faux-bold（浏览器模拟），视觉上影响不大。  
如果要完美还原，需要找到 `PPNeueMontreal-Bold.woff2`。

---

## 待改进（可选）

1. **替换所有 Prismic 图片/视频** — 改成自己的素材
2. **添加多页面** — Work、About、Services、Contact 页面目前是空链接
3. **响应式适配** — 目前 `@media` 规则存在但未完整测试移动端
4. **PP Neue Montreal Bold** — 如果能找到字体文件，footer wordmark 会更精准

---

## 对比原版截图的结论

| 对比项 | 结果 |
|---|---|
| 页面总高度 | ✅ 12614px 完全一致 |
| 字体 | ✅ PP Migra + PP Neue Montreal |
| 配色 | ✅ --c-black / --c-white / --c-orange |
| Hero 视频帧 | ✅ t=7.5s 构图与原版接近 |
| Pin 效果 | ✅ About pin |
| 动画 | ✅ 全部实现 |
| 导航 Canvas 边框 | ✅ 动态光效 |

---

*本文档由 Claude Sonnet 4.6 生成，2026-05-28*
