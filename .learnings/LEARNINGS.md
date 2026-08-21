## [LRN-20260530-001] correction

**Logged**: 2026-05-30T00:04:50+08:00
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary
For visual replica work, always compare against the reference site with real rendered measurements and/or screenshots before finalizing changes.

### Details
The user corrected that visual changes, especially typography sizing, positioning, and motion geometry, must be carefully compared with the original reference website. Do not rely only on CSS values or rough visual guessing. For this Estrela Studio replica, inspect the reference site, measure computed styles and element positions, and verify the local result against those measurements or screenshots. This recurred on the About reading orbit: repeatedly tuning a generic circle still missed the reference contract of eight clear cards plus two faded silhouettes.

### Suggested Action
Before completing future visual alignment tasks, open or fetch the reference site, compare rendered sizes/positions, make scoped edits, then verify with a local browser measurement or screenshot comparison.

### Metadata
- Source: user_feedback
- Related Files: css/style.css, index.html, about.html, js/about.js
- Tags: visual-qa, reference-site, typography, frontend
- Pattern-Key: frontend.reference_visual_qa
- Recurrence-Count: 2
- First-Seen: 2026-05-30
- Last-Seen: 2026-08-04

---

## [LRN-20260819-006] correction

**Logged**: 2026-08-19T01:20:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary
Form feedback must remain adjacent to the action and visible within the current viewport, especially inside scrollable account dialogs.

### Details
The password API rejected the submitted password under the policy active at that time, but the response message was rendered below the submit button and outside the visible part of the tall Personal Center dialog. The user reasonably experienced the click as doing nothing. The operations dashboard also reported a successful password change only in a distant footer.

### Suggested Action
Validate required fields and confirmation before the request, place the status message immediately above the submit action, show a prominent toast for success and failure, and expose a visible submitting state on the button.

### Metadata
- Source: user_feedback
- Related Files: js/admin-auth.js, css/admin-auth.css, ops/ops.js, ops/ops.css
- Tags: form-feedback, password-change, accessibility, ux
- See Also: LRN-20260818-003
- Pattern-Key: frontend.keep_form_feedback_visible
- Recurrence-Count: 1
- First-Seen: 2026-08-19
- Last-Seen: 2026-08-19

---

## [LRN-20260819-007] correction

**Logged**: 2026-08-19T01:35:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: backend

### Summary
Do not impose a generic password-length policy on this private single-administrator dashboard when the owner explicitly wants no length restriction.

### Details
The 10-to-128-character policy was added as a generic security default, but it does not match this site's intended operator experience. The owner wants to choose any non-empty password length. The rule must be removed consistently from Personal Center, the operations dashboard, the password-change endpoint, and subsequent login validation.

### Suggested Action
Accept any non-empty password, retain hashing, rate limiting, session rotation, and confirmation checks, and avoid reintroducing arbitrary length rules without a user requirement.

### Metadata
- Source: user_feedback
- Related Files: functions/_lib/ops-admin.js, functions/api/ops/login.js, functions/api/ops/password.js, js/admin-auth.js, ops/ops.js
- Tags: authentication, password-policy, product-requirement, ux
- See Also: LRN-20260819-006, LRN-20260818-003
- Pattern-Key: auth.owner_defined_password_policy
- Recurrence-Count: 1
- First-Seen: 2026-08-19
- Last-Seen: 2026-08-19

---

## [LRN-20260530-002] correction

**Logged**: 2026-05-30T00:07:36+08:00
**Priority**: high
**Status**: pending
**Area**: docs

### Summary
This project is not only a local replica; it is the user's live website at https://chaoshanai.com.

### Details
The user clarified that their personal website is formally online at chaoshanai.com. Future work should treat this as a production/live site, not merely a local Estrela Studio replica or GitHub backup. Be careful with changes, verify visually against both the reference site and the live domain when relevant, and mention production impact when appropriate.

### Suggested Action
When working on this repository, remember the production URL is https://chaoshanai.com and verify live-site assumptions before describing deployment status.

### Metadata
- Source: user_feedback
- Related Files: README.md, HANDOFF.md
- Tags: production-site, domain, docs, project-context
- Pattern-Key: project.production_domain
- Recurrence-Count: 1
- First-Seen: 2026-05-30
- Last-Seen: 2026-05-30

---

## [LRN-20260818-003] correction

**Logged**: 2026-08-18T22:45:00+08:00
**Priority**: high
**Status**: pending
**Area**: backend

### Summary
The site's administrator authentication must be a website-owned email-and-password account with in-site password changes, not a Cloudflare-secret-only login.

### Details
The temporary single-password flow created poor operator experience because changing the password required opening Cloudflare. The intended model is: the first successful login binds the administrator email using the existing default admin password; subsequent logins require that email and password; an authenticated administrator can change the password from the website. Public visitors remain unaffected.

### Suggested Action
Keep the administrator record and password hash in D1, retain the existing secret only as a one-time bootstrap credential, use server-side sessions, and expose password change controls in Personal Center and the operations dashboard.

### Metadata
- Source: user_feedback
- Related Files: functions/api/ops/, functions/_lib/, js/admin-auth.js, ops/ops.js
- Tags: authentication, admin-account, password-change, d1
- Pattern-Key: auth.website_owned_admin_account
- Recurrence-Count: 1
- First-Seen: 2026-08-18
- Last-Seen: 2026-08-18

---

## [LRN-20260819-004] correction

**Logged**: 2026-08-19T00:36:45+08:00
**Priority**: medium
**Status**: pending
**Area**: backend

### Summary
Distinguish “the platform cannot return a stored secret” from “a password value cannot be shared with its owner.”

### Details
Cloudflare does not reveal an encrypted secret after it is saved, but a user may still possess the original temporary value that was generated and delivered earlier. Saying the password “cannot be told” was inaccurate; the correct limitation is that the currently stored plaintext cannot be retrieved for comparison. A retained original value can be tried, and an invalid value should be replaced through an explicit reset.

### Suggested Action
Explain secret-retrieval limits precisely, never repeat a user-pasted credential unnecessarily, and offer a secure reset when the retained value no longer works.

### Metadata
- Source: user_feedback
- Related Files: functions/api/ops/login.js, Cloudflare Pages secrets
- Tags: authentication, secrets, communication, password-reset
- See Also: LRN-20260818-003
- Pattern-Key: auth.secret_retrieval_communication
- Recurrence-Count: 1
- First-Seen: 2026-08-19
- Last-Seen: 2026-08-19

---

## [LRN-20260819-005] knowledge_gap

**Logged**: 2026-08-19T00:50:35+08:00
**Priority**: high
**Status**: pending
**Area**: backend

### Summary
Password hashing parameters must be validated against the real Cloudflare Workers runtime, not only Node-based integration tests.

### Details
The admin bootstrap used PBKDF2 with 210,000 iterations. Node accepted that value, but Cloudflare Workers rejects iteration counts above 100,000 with `NotSupportedError`, causing the first-login request to terminate with error 1101 before the administrator record was created.

### Suggested Action
Use the Workers-supported maximum of 100,000 PBKDF2 iterations, add an explicit endpoint error boundary, and include a production-runtime-compatible authentication check before declaring login ready.

### Metadata
- Source: error
- Related Files: functions/_lib/ops-admin.js, functions/api/ops/login.js
- Tags: authentication, cloudflare-workers, pbkdf2, runtime-compatibility
- Pattern-Key: auth.validate_crypto_runtime_limits
- Recurrence-Count: 1
- First-Seen: 2026-08-19
- Last-Seen: 2026-08-19

---
