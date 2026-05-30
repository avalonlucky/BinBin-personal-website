## [LRN-20260530-001] correction

**Logged**: 2026-05-30T00:04:50+08:00
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary
For visual replica work, always compare against the reference site with real rendered measurements and/or screenshots before finalizing changes.

### Details
The user corrected that visual changes, especially typography sizing and positioning, must be carefully compared with the original reference website. Do not rely only on CSS values or rough visual guessing. For this Estrela Studio replica, inspect the reference site, measure computed styles and element positions, and verify the local result against those measurements or screenshots.

### Suggested Action
Before completing future visual alignment tasks, open or fetch the reference site, compare rendered sizes/positions, make scoped edits, then verify with a local browser measurement or screenshot comparison.

### Metadata
- Source: user_feedback
- Related Files: css/style.css, index.html
- Tags: visual-qa, reference-site, typography, frontend
- Pattern-Key: frontend.reference_visual_qa
- Recurrence-Count: 1
- First-Seen: 2026-05-30
- Last-Seen: 2026-05-30

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
