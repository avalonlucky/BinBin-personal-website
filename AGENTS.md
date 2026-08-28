# Codex 项目规范

## UI 组件参考（涉及界面时必读）

任何新增、重做或替换首页、作品页、导航、页尾、卡片、切换控件、手风琴或动效前，必须先完整阅读 `UI-SYSTEM-REFERENCE.md`，随后遵循 `CASE-STUDY-GUIDE.md` 的案例页规范。不得直接拼贴外部组件库的视觉；优先复用文档中定义的本站组件、状态、移动端策略与性能边界。

## 自动化浏览器必须清理

- 使用 Playwright、浏览器测试脚本或任何会启动 Chrome/Chromium 的自动化工具时，必须为本次任务使用唯一且可识别的会话名称。
- 自动化验证完成后，无论验证成功、失败还是被中断，都必须显式关闭本次任务启动的每一个浏览器页面、浏览器上下文、浏览器进程和 Playwright 会话。
- 使用项目现有的 Playwright CLI 包装脚本时，执行过 `open` 后必须在任务结束前对同一个会话执行对应的 `close`，不得只退出调用脚本而把后台 daemon 或无头 Chrome 留在系统中。
- 清理必须放在可靠的收尾路径中（例如 shell `trap`、`try/finally` 或等效机制），保证命令报错时同样执行。
- 任务结束前必须检查本次任务启动的 Playwright/Chrome 进程是否仍然存在；若存在，应只清理属于本次会话的进程，不得使用可能误杀用户正常 Chrome 或其他任务的宽泛 `pkill`。
- 不得把无窗口的 Chrome、临时 `playwright_chromiumdev_profile-*` 或 `playwright-core ... cliDaemon.js` 进程留给用户手动强制退出。
- 最终回复中应简短说明自动化浏览器已经关闭并完成残留检查。
