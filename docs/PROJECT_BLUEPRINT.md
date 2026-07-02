# Mumtaz Medical — Project Blueprint

This is the **main reference blueprint** for the project.

It should answer these questions quickly:
- project کیا ہے؟
- source code کہاں ہے؟
- R1 repo کس لیے ہے؟
- folders کس کام کے ہیں؟
- اب تک کیا کام ہو چکا ہے؟
- آگے کس direction میں جانا ہے؟

---

## 1) Project identity

### Project name
Mumtaz Medical

### Source app repo
- `Dr-Adil-Abdullah/mumtazMedicalv5`

### R1 continuity / planning repo
- `Dr-Adil-Abdullah/mumtaz-medical-r1`

### Purpose of R1 repo
یہ repo اس لیے ہے کہ:
- instructions بار بار repeat نہ کرنی پڑیں
- context lose نہ ہو
- future agent / model handoff آسان ہو
- planning, memory, and tracked work ایک جگہ محفوظ رہے

---

## 2) What the source app is

یہ ایک **local-first pharmacy / medical store management web app** ہے جس میں یہ major areas موجود ہیں:
- staff login and PIN flows
- inventory and stock batches
- POS sales
- customers / suppliers ledger
- expenses
- reports and charts
- print history
- returns and return approvals
- day session cash control
- JSON backup / restore
- barcode / scanner workflows
- WhatsApp actions
- sync foundation

---

## 3) Current known technical status

### Build condition
- source repo local build successful تھا
- project feature-rich ہے

### Known issue
- Supabase sync code موجود ہے
- لیکن client ابھی code میں disabled ہے
- یہ black-screen / IDBKeyRange-related issue سے connected لگتا ہے

### Meaning
- local-first app flows کافی حد تک workable ہیں
- cloud sync ابھی reliable / active نہیں سمجھا جائے گا جب تک proper fix نہ ہو

---

## 4) Current source folder structure summary

### Root level
- `src/` → main application code
- `public/` → static assets
- `docs/` → existing source-project docs
- `package.json` → dependencies and scripts
- `vite.config.js` → build and chunk config
- `supabase_schema.sql` → cloud schema foundation

### `src/pages/`
Main feature screens:
- Login
- FirstLaunch
- ForcePinChangePage
- POSPage
- InventoryPage
- LedgerPage
- ExpensesPage
- ReportsPage
- PrintHistoryPage
- ReturnApprovalPage
- DaySessionPage
- StaffPage
- SettingsPage
- ActivityLogPage
- UnauthorizedPage

### `src/components/`
Reusable UI and shared pieces:
- `layout/` → AppShell, Header, Sidebar, route protection, online/offline indicators
- `shared/` → barcode cards, receipt preview, scanner modal, sync indicator, section intro, WhatsApp button
- `ui/` → Button, Input, Modal, Badge, Card, PinPad, StatCard
- `reports/` → simple chart components

### `src/db/`
Data layer and local storage helpers:
- Dexie database setup
- backup / restore logic
- seed logic
- sync queue
- Supabase sync foundation
- logs helper

### `src/store/`
Zustand stores:
- auth store
- POS store
- sync store

### `src/utils/`
Business and helper utilities:
- receipt generation
- loyalty math
- WhatsApp messages / normalization
- returns / refund logic
- barcode helpers
- CSV export
- bill number generation
- PIN validation
- scope filters
- ID helpers

---

## 5) Work completed so far

### Phase A — Inspection and understanding
- source repo inspected
- code structure reviewed
- README and docs checked
- live deployment checked
- build tested

### Phase B — Large feature mapping
- source project features documented
- feature count expanded to 380
- categorized feature grouping created

### Phase C — R1 repo setup
- private R1 repo created
- agent continuity files added
- clean doc strategy defined

### Phase D — Documentation cleanup
Ab documentation intentionally simplified kar دی گئی ہے تاکہ feature work slow نہ ہو.

---

## 6) The 5-file documentation system

## Main 3 files — always update
These 3 files should be updated regularly:

### 1. `AGENT_BRAIN.md`
Permanent rules, working style, stack decision rules, documentation policy.

### 2. `TASK_LOG.md`
Current state, latest direction, next steps, key references.

### 3. `ERROR_LOG.md`
Known issues, blockers, failed attempts, warnings.

## Reference 2 files — update only when needed
These should be updated only on meaningful changes:

### 4. `docs/PROJECT_BLUEPRINT.md`
This file.
Used for overall structure, repo context, folder summary, and working model.

### 5. `docs/FEATURES_REFERENCE.md`
Grouped 380-feature reference file.

---

## 7) Documentation update rule

### Always update first
- `AGENT_BRAIN.md`
- `TASK_LOG.md`
- `ERROR_LOG.md`

### Update only when needed
- `docs/PROJECT_BLUEPRINT.md`
- `docs/FEATURES_REFERENCE.md`

### Why
یہ rule اس لیے رکھا گیا ہے تاکہ:
- workspace clean رہے
- token load کم ہو
- future agent confusion کم ہو
- اصل feature work slow نہ ہو

---

## 8) Feature reference location

Main grouped feature reference for normal use:
- `docs/FEATURES_REFERENCE.md`

Legacy detailed incremental file exists in source workspace but is **not part of the main 5-file R1 system**.

---

## 9) Recommended next technical directions

Depending on user request, next work may be:
1. current app کو R1 repo میں copy کرنا
2. exact R1 scope define کرنا
3. black-screen / sync issue track اور fix کرنا
4. targeted feature add/remove/cleanup کرنا

---

## 10) Quick handoff note

If a new agent takes over:
- first read `AGENT_BRAIN.md`
- then `TASK_LOG.md`
- then `ERROR_LOG.md`
- then read this file
- open `docs/FEATURES_REFERENCE.md` only if feature-level context is needed

---

## 11) How to start this project in a new AI

### Minimum method
Upload only these 3 files first:
1. `AGENT_BRAIN.md`
2. `TASK_LOG.md`
3. `ERROR_LOG.md`

This is enough for:
- current rules
- current branch
- current direction
- current issues

### Extended method
If the new AI needs more context, also upload:
4. `docs/PROJECT_BLUEPRINT.md`
5. `docs/FEATURES_REFERENCE.md`

### Recommended copy/paste prompt
Use this exact starter prompt:

```text
Read these files first in order:
1. AGENT_BRAIN.md
2. TASK_LOG.md
3. ERROR_LOG.md

Then use docs/PROJECT_BLUEPRINT.md only for project structure context.
Use docs/FEATURES_REFERENCE.md only when feature-level reference is needed.

Rules:
- Source reference repo must stay unchanged.
- New changes must happen only in R1 branches.
- First summarize current state, active branch, and next task.
- Then wait for my instruction before changing code.
```

### Best practice
- Do not upload too many files at first
- Start with the 3 main files
- Add the 2 reference files only when the new AI needs deeper context
