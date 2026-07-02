# ERROR_LOG

## Active Known Issues

### ERR-001 — Black-screen / sync-related issue
**Reference repo:** `Dr-Adil-Abdullah/mumtazMedicalv5`
**Working repo:** `Dr-Adil-Abdullah/mumtaz-medical-r1`

**Observed state:**
- black-screen issue appears linked to the online sync / cloud transfer layer
- source app itself is now being kept unchanged as a reference

**Action taken now:**
- any temporary source-repo fix branch / tag work was reversed
- local-only mitigation was moved into the R1 workflow instead
- active R1 stability branch exists: `feature/local-only-stability-v1`
- online sync system was removed there for stability testing
- new temporary auth-bypass branch created: `feature/temp-admin-bypass-v1`
- login / setup flow is temporarily bypassed there and app auto-enters as super admin

**Meaning:**
- reference repo stays untouched
- testing now happens only in the R1 branch
- login system is not deleted permanently; it is only bypassed temporarily in the branch

**Status:**
- mitigation implemented in R1 branch
- awaiting user testing
- production Netlify URL may still serve older build until branch preview or merge is used

### ERR-002 — IndexedDB boolean index query crash
**Branch:** `feature/temp-admin-bypass-v1`

**Error shown:**
- `Failed to execute 'bound' on 'IDBKeyRange': The parameter is not a valid key`

**Root cause found:**
- header and sidebar were querying Dexie with `where('is_return').equals(true)`
- boolean values are not safe IndexedDB key-range query values in this path
- this caused the app to crash on load

**Fix applied:**
- replaced the boolean-index query with `db.sales.toArray()` + in-memory filtering

**Status:**
- fix applied
- ready for retest

---

## Documentation Notes

### DOC-001 — Main documentation policy
Always update these first:
- `AGENT_BRAIN.md`
- `TASK_LOG.md`
- `ERROR_LOG.md`

Update these only when needed:
- `docs/PROJECT_BLUEPRINT.md`
- `docs/FEATURES_REFERENCE.md`

### DOC-002 — New AI startup / handoff rule
If work moves to a new AI:
- upload `AGENT_BRAIN.md`, `TASK_LOG.md`, and `ERROR_LOG.md` first
- upload `docs/PROJECT_BLUEPRINT.md` only for structure/context
- upload `docs/FEATURES_REFERENCE.md` only for feature-level lookup
- tell the new AI to summarize current branch and wait before changing code

---

## Reserved Error Types
- TECH CHANGE
- BUILD ERROR
- RUNTIME ERROR
- DEPLOYMENT ISSUE
- DATA ISSUE
