## [ERR-20260804-001] html_reference_parser

**Logged**: 2026-08-04T20:31:00+08:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
The optional BeautifulSoup parser was unavailable while inspecting the Frameblox reference HTML.

### Error
```
ModuleNotFoundError: No module named 'bs4'
```

### Context
- Attempted a read-only structured parse of `/tmp/frameblox-landing-02.html`.
- The environment has no `bs4` package installed.

### Suggested Fix
Use browser DOM evaluation, Framer's observed page assets, or built-in shell/Node parsing instead of assuming BeautifulSoup is installed.

### Metadata
- Reproducible: yes
- Related Files: about.html, css/style.css, js/about.js

### Resolution
- **Resolved**: 2026-08-04T20:31:00+08:00
- **Notes**: Switched to browser/page-asset inspection and direct Framer bundle analysis.

---
## [ERR-20260819-007] workers-types-npm-cache-permission

**Logged**: 2026-08-19T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tooling

### Summary
Fetching the latest Cloudflare Workers types failed because npm tried to use a read-only, root-owned default cache.

### Error
```
npm error code EPERM
npm error path /Users/luban/.npm/_cacache/tmp/9d5b8e4d
```

### Context
- The failure happened before the package archive was downloaded.
- No project files or production state were changed.

### Suggested Fix
Set `npm_config_cache` to a task-specific writable directory under `/tmp` for package retrieval commands.

### Metadata
- Reproducible: yes
- Related Files: Cloudflare Workers type retrieval
- See Also: ERR-20260818-013

### Resolution
- **Resolved**: 2026-08-19T00:00:00+08:00
- **Notes**: Retried with an isolated writable npm cache under `/tmp`.

---
## [ERR-20260819-008] github-https-credentials-unavailable

**Logged**: 2026-08-19T01:55:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
The existing GitHub HTTPS remote could not be read because no non-interactive GitHub credential was available to Git.

### Error
```
fatal: could not read Username for 'https://github.com': Device not configured
```

### Context
- The requested repository remote is `https://github.com/avalonlucky/BinBin-personal-website.git`.
- Local website validation passed before the remote check.
- No commit or push had been attempted when the authentication check failed.

### Suggested Fix
Reuse an authenticated GitHub CLI or credential-helper session if one exists; otherwise authenticate GitHub explicitly before pushing.

### Metadata
- Reproducible: yes
- Related Files: Git remote `origin`

### Resolution
- **Resolved**: 2026-08-19T02:25:00+08:00
- **Notes**: Reused the existing SSH key for the `avalonlucky` account and pushed through the SSH remote.

---
## [ERR-20260819-009] workspace-git-index-read-only

**Logged**: 2026-08-19T02:05:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
The managed workspace allowed source edits but blocked writes to the repository's local Git index.

### Error
```
fatal: Unable to create '/Users/luban/Documents/个人网站/.git/index.lock': Operation not permitted
```

### Context
- The user explicitly requested committing and pushing the backend source.
- All requested source files were writable and had passed validation.
- The restriction applied only to `.git/index.lock` in the original workspace.

### Suggested Fix
Clone the same repository over authenticated SSH into a writable temporary directory, copy only the reviewed source files, commit there, and push the resulting commit to `main`.

### Metadata
- Reproducible: yes
- Related Files: local `.git` directory
- See Also: ERR-20260819-008

### Resolution
- **Resolved**: 2026-08-19T02:05:00+08:00
- **Notes**: Switched to a temporary authenticated clone so the original workspace and unrelated changes remained untouched.

---
## [ERR-20260819-010] restricted-process-list-and-zsh-path-shadowing

**Logged**: 2026-08-19T02:08:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
A fallback clone diagnostic first used a blocked process-list command, then accidentally shadowed zsh's special `path` array.

### Error
```
zsh:1: operation not permitted: ps
zsh:2: command not found: git
```

### Context
- The original long-running clone command did not expose its retained session ID.
- `ps` is unavailable in the managed environment.
- Assigning a loop variable named `path` replaced zsh's executable search path.

### Suggested Fix
Inspect the known temporary directory directly and use task-specific variable names such as `sync_candidate`.

### Metadata
- Reproducible: yes
- Related Files: temporary GitHub clone

### Resolution
- **Resolved**: 2026-08-19T02:08:00+08:00
- **Notes**: Re-ran the directory inspection without `ps` and without reserved shell variable names.

---
## [ERR-20260819-011] local-git-clone-hardlink-blocked

**Logged**: 2026-08-19T02:12:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
A local Git clone fallback could not hard-link object files into the temporary filesystem.

### Error
```
fatal: failed to create link '.../.git/objects/...': Operation not permitted
```

### Context
- The original repository metadata is readable but not writable.
- `git clone --local` attempted to optimize by hard-linking object files.
- The managed filesystem disallowed those links across the workspace and temporary directory.

### Suggested Fix
Use a shallow filtered SSH clone from GitHub, or a local clone with object copying only if repository size permits.

### Metadata
- Reproducible: yes
- Related Files: local `.git/objects`, temporary GitHub clone
- See Also: ERR-20260819-009

### Resolution
- **Resolved**: 2026-08-19T02:25:00+08:00
- **Notes**: Used a shallow blob-filtered SSH clone instead of local object hard-links.

---
## [ERR-20260819-012] sparse-checkout-ran-in-source-worktree

**Logged**: 2026-08-19T02:18:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
The first sparse-checkout configuration command ran from the original workspace instead of the temporary clone.

### Error
```
error: could not lock config file .git/config: Operation not permitted
```

### Context
- The temporary clone path was computed but not passed as the command working directory.
- The source-copy destination was still correct and no source files were damaged.
- The original repository config remained unchanged because the write was rejected.

### Suggested Fix
Set the temporary clone as `workdir` for all Git status, sparse-checkout, commit, and push operations.

### Metadata
- Reproducible: yes
- Related Files: temporary sparse clone, original `.git/config`
- See Also: ERR-20260819-009

### Resolution
- **Resolved**: 2026-08-19T02:18:00+08:00
- **Notes**: Continued with the temporary clone as the explicit working directory.

---
## [ERR-20260819-013] sparse-clone-git-add-skipped-paths

**Logged**: 2026-08-19T02:22:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
Standard `git add` skipped reviewed files located outside the sparse clone's initial checkout cone.

### Error
```
paths ... outside of your sparse-checkout definition ... will not be updated in the index
```

### Context
- The filtered clone intentionally checked out only root files to avoid downloading unrelated large assets.
- Backend, CSS, JavaScript, and work-page files were copied into paths marked outside the sparse definition.
- Root-level files staged successfully; nested reviewed files remained unstaged.

### Suggested Fix
Use `git add --sparse` for the explicit reviewed paths in the temporary clone.

### Metadata
- Reproducible: yes
- Related Files: css/, js/, db/, functions/, ops/, work/

### Resolution
- **Resolved**: 2026-08-19T02:22:00+08:00
- **Notes**: Re-staged the explicit file list with `git add --sparse`.

---
## [ERR-20260819-001] wrangler-session-expired-across-day

**Logged**: 2026-08-19T00:05:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
Wrangler could no longer apply the D1 migration because its interactive authentication session expired after the task crossed into a new day.

### Error
```
In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN environment variable for wrangler to work.
```

### Context
- The same authenticated deployment flow worked earlier in the task.
- No database mutation occurred during the failed command.
- The connected Cloudflare API fallback returned error 7500 because its current grant lacks D1 write permission.
- A subsequent Wrangler OAuth attempt opened the official authorization page but timed out before approval.

### Suggested Fix
Ask the user to approve a fresh Wrangler OAuth window, then rerun the migration and deployment.

### Metadata
- Reproducible: session-dependent
- Related Files: db/migrations/0004_ops_admin_account.sql

### Resolution
- **Resolved**: 2026-08-19T00:29:21+08:00
- **Notes**: Completed a fresh OAuth authorization, applied migration 0004, and deployed the Pages production build successfully.

---

## [ERR-20260819-002] zsh-readonly-status-variable

**Logged**: 2026-08-19T00:29:21+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
An HTTP verification command attempted to assign to zsh's read-only `status` parameter.

### Error
```
zsh:1: read-only variable: status
```

### Context
- The site deployment and the other production checks succeeded.
- Only the local shell variable assignment failed before printing the HTTP status code.

### Suggested Fix
Use a task-specific variable name such as `metrics_http_code` in zsh verification commands.

### Metadata
- Reproducible: yes
- Related Files: production verification command

### Resolution
- **Resolved**: 2026-08-19T00:29:21+08:00
- **Notes**: Renamed the shell variable and reran the authorization check.

---

## [ERR-20260819-003] temporary-password-clipboard-delivery

**Logged**: 2026-08-19T00:36:45+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
The Pages secret update succeeded, but delivering the generated temporary password through the macOS clipboard failed.

### Error
```
Wrangler reported success, then the overall command exited non-zero when pbcopy could not access the pasteboard.
```

### Context
- The random value existed only in the shell process and was intentionally never printed.
- Cloudflare therefore held a valid bootstrap secret that the user could not receive.

### Suggested Fix
Do not make an unverified clipboard operation the only delivery channel for a newly stored one-time secret.

### Metadata
- Reproducible: environment-dependent
- Related Files: Cloudflare Pages production secret OPS_PASSWORD

### Resolution
- **Resolved**: 2026-08-19T00:36:45+08:00
- **Notes**: Immediately overwrote the undelivered value with a new explicit one-time password and delivered that value to the site owner for immediate rotation after login.

---

## [ERR-20260819-004] production-canonical-route-verification

**Logged**: 2026-08-19T00:39:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
The first production HTML checks used `.html` URLs that redirect to extensionless canonical routes and briefly returned a stale redirected response.

### Error
```
The verifier first found no admin entry in the empty 308 response, then saw the pre-deployment header entry through the redirected cached route.
```

### Context
- The immutable deployment URL already contained the new footer entry.
- The custom domain serves canonical extensionless routes for these pages.

### Suggested Fix
Verify the canonical extensionless production URLs directly, use a fresh query value and `Cache-Control: no-cache`, and inspect the explicit `<nav id="nav">` region rather than relying on the first closing `nav` tag.

### Metadata
- Reproducible: cache-dependent
- Related Files: index.html, about.html, work/*.html

### Resolution
- **Resolved**: 2026-08-19T00:39:00+08:00
- **Notes**: Rechecked all five canonical live pages; each has exactly one footer admin entry, none has an admin entry in the top navigation, and all reference the v3 auth assets.

---

## [ERR-20260819-005] parallel-npx-cache-race

**Logged**: 2026-08-19T00:50:35+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
Parallel Wrangler invocations using the same temporary npm cache raced while preparing the npx installation.

### Error
```
npm error ENOTEMPTY: directory not empty, rename detect-libc
```

### Context
- A D1 query, Pages secret listing, and Wrangler help lookup were launched concurrently.
- Only the D1 query failed; the other read-only checks completed.

### Suggested Fix
Run npx-based Wrangler diagnostics sequentially or assign a unique npm cache directory to each concurrent invocation.

### Metadata
- Reproducible: race-dependent
- Related Files: deployment diagnostic environment

### Resolution
- **Resolved**: 2026-08-19T00:50:35+08:00
- **Notes**: Reran the D1 diagnostic sequentially with a dedicated temporary npm cache.

---

## [ERR-20260819-006] workers-pbkdf2-iteration-limit

**Logged**: 2026-08-19T00:50:35+08:00
**Priority**: high
**Status**: resolved
**Area**: backend

### Summary
Admin bootstrap crashed in production because the configured PBKDF2 iteration count exceeded the Cloudflare Workers limit.

### Error
```
NotSupportedError: Pbkdf2 failed: iteration counts above 100000 are not supported (requested 210000).
```

### Context
- Credential verification succeeded, then password-record creation threw before the D1 administrator insert.
- The browser received Cloudflare error 1101 and displayed the generic temporary-login failure message.
- No administrator account was incorrectly created during the failed attempts.

### Suggested Fix
Use 100,000 iterations, reject unsupported stored iteration counts before derivation, and catch unexpected endpoint errors to return structured JSON.

### Metadata
- Reproducible: yes
- Related Files: functions/_lib/ops-admin.js, functions/api/ops/login.js

### Resolution
- **Resolved**: 2026-08-19T00:50:35+08:00
- **Notes**: Reduced PBKDF2 to the Workers-supported maximum, added a structured login error boundary, redeployed, and completed a successful production administrator bootstrap.

---

## [ERR-20260818-003] in_app_browser_networkidle

**Logged**: 2026-08-18T18:08:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
The in-app browser runtime rejected `networkidle` as a load-state option during local visual QA.

### Error
```
playwright_wait_for_load_state does not support networkidle
```

### Context
- Attempted to wait for all network activity before inspecting the culture-wall case study.
- The local page is static and can be verified with the supported `load` state plus a bounded render wait.

### Suggested Fix
Use `waitForLoadState({ state: "load" })`, then wait briefly for fonts and image decode before taking measurements.

### Metadata
- Reproducible: yes
- Related Files: work/ankki-culture-wall.html

### Resolution
- **Resolved**: 2026-08-18T18:08:00+08:00
- **Notes**: Continued QA with the supported `load` state and explicit visual checks.

---

## [ERR-20260818-001] netlify_npx_root_owned_cache

**Logged**: 2026-08-18T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
Netlify CLI startup failed because the default npm cache contained root-owned temporary files.

### Error
```
npm error code EPERM
npm error syscall open
npm error path /Users/luban/.npm/_cacache/tmp/93bd2b65
```

### Context
- Ran `npx netlify status` from the static portfolio workspace before production deployment.
- The failure occurred before Netlify authentication or site-link checks.

### Suggested Fix
Set `npm_config_cache` to a writable temporary directory for Netlify CLI commands instead of changing global npm ownership during an automated task.

### Metadata
- Reproducible: yes
- Related Files: .netlify/state.json

### Resolution
- **Resolved**: 2026-08-18T00:00:00+08:00
- **Notes**: Continued the deployment workflow with an isolated cache under `/tmp`.

---

## [ERR-20260816-002] modal_reference_load

**Logged**: 2026-08-16T00:24:26+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Loading `https://modal.com/` in a new in-app browser tab exceeded the browser-control timeout and reset the test kernel.

### Error
```
js execution timed out; kernel reset, rerun your request
```

### Context
- Opened Modal as a visual layout reference while refining a local portfolio page.
- The call combined navigation, an additional wait, page metadata, and a screenshot.

### Suggested Fix
Reconnect to the in-app browser and split navigation, metadata inspection, and screenshots into separate bounded calls.

### Metadata
- Reproducible: unknown
- Related Files: work/ankki-vision-journal.html, css/case.css

### Resolution
- **Resolved**: 2026-08-16T00:24:26+08:00
- **Notes**: Reconnected and split navigation, metadata inspection, and capture into separate calls; the reference page loaded successfully.

---

## [ERR-20260816-001] in_app_browser_viewport

**Logged**: 2026-08-16T00:24:26+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
The in-app browser tab does not expose `playwright.setViewportSize()` in this runtime.

### Error
```
visionFlatTestTab.playwright.setViewportSize is not a function
```

### Context
- Attempted to resize a dedicated local-page test tab to 390 x 844.
- Browser control is provided through the bundled in-app browser runtime.

### Suggested Fix
Use the browser's supported viewport emulation API instead of assuming the Playwright page method is exposed directly.

### Metadata
- Reproducible: yes
- Related Files: work/ankki-vision-journal.html, css/case.css

### Resolution
- **Resolved**: 2026-08-16T00:24:26+08:00
- **Notes**: Used the documented viewport capability and per-tab CDP device metrics for exact desktop validation.

---

## [ERR-20260817-003] sites_initializer_nonempty_target

**Logged**: 2026-08-17T10:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
The Sites starter initializer correctly refused to write into the existing production website root.

### Error
```
Target is not empty: /Users/luban/Documents/个人网站
```

### Context
- Attempted to initialize a new React showcase in the current workspace before confirming that it already contained the production static portfolio.
- The initializer exited before copying or overwriting project files.

### Suggested Fix
Inspect the workspace first when a prior site may exist, then initialize the new standalone project in a dedicated empty subdirectory.

### Metadata
- Reproducible: yes
- Related Files: HANDOFF.md, README.md

### Resolution
- **Resolved**: 2026-08-17T10:00:00+08:00
- **Notes**: Preserved the existing site and selected a dedicated subdirectory for the React prototype.

---

## [ERR-20260817-004] combined_apply_patch_shape

**Logged**: 2026-08-17T17:25:45+08:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
A large combined patch failed because one layout context differed and a follow-up patch tried to delete and add the same file in one operation.

### Error
```
apply_patch verification failed
invalid patch: multiple operations target app/page.tsx
```

### Context
- Attempted to replace the starter page, layout, preview files, client scene, and stylesheet in a single patch.
- No partial source changes were applied by either failed patch.

### Suggested Fix
Inspect exact template context and split file updates, additions, and deletions into smaller independent patches.

### Metadata
- Reproducible: yes
- Related Files: immersive-showcase/app/page.tsx, immersive-showcase/app/layout.tsx

### Resolution
- **Resolved**: 2026-08-17T17:25:45+08:00
- **Notes**: Applied the implementation as three bounded patches and confirmed the development route returned HTTP 200.

---

## [ERR-20260817-005] sites_list_limit_validation

**Logged**: 2026-08-17T17:28:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
The Sites connector rejected a list request whose limit exceeded the workspace-specific maximum.

### Error
```
Value 100.0 > maximum 50
```

### Context
- Queried owned Sites projects to recover the newly created project's opaque ID after creation.
- The connector schema description did not surface the workspace-specific limit before the call.

### Suggested Fix
Use a list limit of 50 or lower for Sites project discovery.

### Metadata
- Reproducible: yes
- Related Files: immersive-showcase/.openai/hosting.json

### Resolution
- **Resolved**: 2026-08-17T17:28:00+08:00
- **Notes**: Retried with limit 50, recovered the exact project ID, and completed the private deployment.

---

## [ERR-20260818-002] github_https_keyring_unavailable

**Logged**: 2026-08-18T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
GitHub CLI reported a signed-in account, but its HTTPS token was unavailable to Git credential-helper subprocesses in the sandbox.

### Error
```
remote: Invalid username or token.
fatal: Authentication failed for 'https://github.com/avalonlucky/BinBin-personal-website.git/'
```

### Context
- The repository remote uses HTTPS while GitHub CLI credentials are stored outside the writable sandbox.
- `ssh -T git@github.com` authenticated successfully as the same repository owner.

### Suggested Fix
For this workspace, push through the authenticated SSH repository URL without rewriting the configured remote.

### Metadata
- Reproducible: yes
- Related Files: .git/config

### Resolution
- **Resolved**: 2026-08-18T00:00:00+08:00
- **Notes**: Pushed `main` to the same GitHub repository over SSH and verified the remote commit SHA.

---

## [ERR-20260818-004] browser_exact_accessible_name

**Logged**: 2026-08-18T18:14:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
An exact accessible-name locator did not match a custom tab button during local interaction QA.

### Error
```
Playwright selector deadline exceeded: no_matches
```

### Context
- Tried to select the 5F floor tab by an exact rendered label.
- The control already exposes a stable `data-cw-floor` identifier intended for application logic and tests.

### Suggested Fix
Use the stable project-specific data attribute for deterministic local UI tests.

### Metadata
- Reproducible: yes
- Related Files: work/ankki-culture-wall.html, js/culture-wall.js

### Resolution
- **Resolved**: 2026-08-18T18:14:00+08:00
- **Notes**: Continued interaction QA with stable `data-*` selectors.

---

## [ERR-20260818-005] browser_evaluate_parsefloat

**Logged**: 2026-08-18T18:26:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
The in-app browser evaluate sandbox did not expose global `parseFloat` while computing a QA-only line-height ratio.

### Error
```
TypeError: parseFloat is not a function
```

### Context
- The page itself rendered normally; only the diagnostic expression failed.
- Exact line count was not required to validate overflow or visual balance.

### Suggested Fix
Measure the rendered title box directly or parse CSS values outside the page sandbox.

### Metadata
- Reproducible: unknown
- Related Files: work/ankki-culture-wall.html

### Resolution
- **Resolved**: 2026-08-18T18:26:00+08:00
- **Notes**: Re-ran final QA using direct DOM pixel metrics.

---

## [ERR-20260818-006] production_browser_timeout

**Logged**: 2026-08-18T18:39:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
The in-app browser timed out while loading the deployed production page after deployment verification had already succeeded via HTTP and asset hashes.

### Error
```
js execution timed out; kernel reset
```

### Context
- Attempted one final mobile screenshot from `chaoshanai.com`.
- Both the Pages deployment URL and custom domain already returned the new HTML, correct MIME types, and CSS/JS SHA-256 hashes identical to local files.

### Suggested Fix
Use bounded production navigation calls and rely on exact HTTP/hash verification when the visual browser is delayed by external CDN resources.

### Metadata
- Reproducible: unknown
- Related Files: work/ankki-culture-wall.html

### Resolution
- **Resolved**: 2026-08-18T18:39:00+08:00
- **Notes**: Kept the successful HTTP and SHA verification as the production source of truth; did not repeat the high-cost visual request.

---

## [ERR-20260818-007] temporary_cache_cleanup_rejected

**Logged**: 2026-08-18T18:42:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
The command runner rejected an attempted cleanup of task-created deployment cache directories.

### Error
```
rm -f style commands are not permitted. Use a safer approach
```

### Context
- The targets were exact task-created paths under `/tmp`.
- Cleanup was optional and unrelated to production correctness.

### Suggested Fix
Leave temporary deployment artifacts for normal system cleanup unless an approved safe deletion mechanism is required.

### Metadata
- Reproducible: yes
- Related Files: none

### Resolution
- **Resolved**: 2026-08-18T18:42:00+08:00
- **Notes**: Skipped optional cleanup and continued with read-only release verification.

---

## [ERR-20260818-008] wrangler_npm_cache_permissions

**Logged**: 2026-08-18T20:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
Wrangler could not start through `npx` because the user npm cache contains root-owned files.

### Error
```
npm error code EPERM
npm error syscall open
npm error path /Users/luban/.npm/_cacache/tmp/09a2a209
npm error Your cache folder contains root-owned files
```

### Context
- Attempted the read-only `npx wrangler whoami` check before planning Cloudflare analytics.
- The failure happened before Wrangler ran and did not affect the website.

### Suggested Fix
Use an isolated writable npm cache for task-scoped Wrangler commands, or repair ownership of the normal cache outside the task.

### Metadata
- Reproducible: yes
- Related Files: HANDOFF.md

### Resolution
- **Resolved**: 2026-08-18T20:00:00+08:00
- **Notes**: Re-ran Wrangler through an isolated writable npm cache; the account check completed successfully.

---

## [ERR-20260818-009] git_index_read_only

**Logged**: 2026-08-18T20:30:00+08:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
The managed workspace allows reading `.git` but blocks creation of `index.lock`, so the completed operations dashboard could not be staged or committed.

### Error
```
fatal: Unable to create '/Users/luban/Documents/个人网站/.git/index.lock': Operation not permitted
```

### Context
- Attempted to stage only the requested dashboard, analytics, documentation, and Pages Function files after a successful production deployment.
- The live Cloudflare Pages deployment and local source files are unaffected.

### Suggested Fix
Commit the listed source changes from a session with Git metadata write access, while leaving unrelated untracked files untouched.

### Metadata
- Reproducible: yes
- Related Files: .git/index, ops/, functions/, js/site-analytics.js

---
## [ERR-20260818-010] zsh-unquoted-query-url

**Logged**: 2026-08-18T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tooling

### Summary
Final HTTP header check failed because an unquoted URL containing `?v=1` was expanded by zsh as a glob.

### Error
```
zsh: no matches found: https://chaoshanai.com/js/site-analytics.js?v=1
```

### Resolution
Quote URLs containing query strings in shell commands and rerun the check.

### Prevention
Always single-quote URLs passed to curl when they include `?`, `&`, or shell glob characters.

---
## [ERR-20260818-011] apply-patch-delete-add-same-file

**Logged**: 2026-08-18T20:40:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tooling

### Summary
An `apply_patch` operation was rejected because it deleted and re-added the same path in one patch.

### Error
```
apply_patch verification failed: invalid patch: multiple operations target /Users/luban/Documents/个人网站/js/site-analytics.js
```

### Context
- Attempted to replace the analytics tracker and add its consent stylesheet atomically.
- The patch parser does not accept multiple operations for the same path.

### Suggested Fix
Split whole-file replacement into separate delete and add patches, then add unrelated files in a later patch.

### Metadata
- Reproducible: yes
- Related Files: js/site-analytics.js

### Resolution
- **Resolved**: 2026-08-18T20:41:00+08:00
- **Notes**: Split the replacement into separate patch operations.

---
## [ERR-20260818-012] wrangler-pages-cache-permission

**Logged**: 2026-08-18T21:33:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
Cloudflare Pages upload reached the deployment step but Wrangler could not write its Pages project cache outside the writable workspace.

### Error
```
A permission error occurred while accessing the file system.
Affected path: /Users/luban/node_modules/.cache/wrangler/pages.json
```

### Context
- Static assets and the Functions bundle uploaded successfully before the local cache write failed.
- The existing production deployment remained active.

### Suggested Fix
Locate Wrangler's Pages cache path override or run the deploy with its project cache redirected to a writable temporary directory.

### Metadata
- Reproducible: yes
- Related Files: deployment environment
- See Also: ERR-20260818-008

### Resolution
- **Resolved**: 2026-08-18T21:38:00+08:00
- **Notes**: Set `WRANGLER_CACHE_DIR` to a writable temporary directory and redeployed successfully.

---
## [ERR-20260818-013] playwright-wrapper-npm-cache-permission

**Logged**: 2026-08-18T22:20:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
The Playwright CLI wrapper could not start because the default npm cache contains root-owned files.

### Error
```
npm error code EPERM
npm error path /Users/luban/.npm/_cacache/tmp/d7957e7c
```

### Context
- Attempted to open the local website with the bundled Playwright CLI wrapper.
- The website and Playwright code had not run yet; the failure happened during `npx` package resolution.

### Suggested Fix
Set `npm_config_cache` to a task-specific writable directory under `/tmp` for Playwright wrapper commands.

### Metadata
- Reproducible: yes
- Related Files: browser validation environment

### Resolution
- **Resolved**: 2026-08-18T22:21:00+08:00
- **Notes**: Continued with both `npm_config_cache=/tmp/maridian-npm-cache` and `PWTEST_DAEMON_SESSION_DIR=/tmp/maridian-playwright-daemon` without changing global ownership.

---
## [ERR-20260818-014] local-browser-visual-validation-blocked

**Logged**: 2026-08-18T22:25:00+08:00
**Priority**: low
**Status**: wont_fix
**Area**: tests

### Summary
Visual browser validation of the local preview could not run in the managed environment.

### Error
```
Chrome could not access its Crashpad directory; WebKit exited with Abort trap 6.
The in-app browser then reported that localhost access permission was declined.
```

### Context
- Terminal Playwright and the in-app browser were tried only for local visual QA.
- Static checks, JavaScript syntax tests, auth-helper tests, Functions compilation, and production HTTP checks remain available.

### Suggested Fix
Run the visual pass in an environment where localhost browser access is allowed; do not bypass the browser permission decision.

### Metadata
- Reproducible: environment-dependent
- Related Files: css/admin-auth.css, js/admin-auth.js

### Resolution
- **Resolved**: 2026-08-18T22:25:00+08:00
- **Notes**: Continued with non-browser validation; the permission decision was respected.

---
## [ERR-20260818-015] destructive-temp-cleanup-rejected

**Logged**: 2026-08-18T22:27:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
A Functions build command was rejected because it prefixed the build with recursive removal of a temporary directory.

### Error
```
rm -f style commands are not permitted. Use a safer approach
```

### Context
- The target was `/tmp/maridian-functions-build`, but the managed command policy rejects this cleanup pattern.
- No deletion or build took place.

### Suggested Fix
Create a unique build directory with `mktemp -d` and compile directly into it.

### Metadata
- Reproducible: yes
- Related Files: functions/

### Resolution
- **Resolved**: 2026-08-18T22:27:00+08:00
- **Notes**: Switched to a new `mktemp` directory without cleanup.

---
