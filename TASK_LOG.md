# TASK_LOG

## Project
Mumtaz Medical # R1

## Documentation System
### Main 3 files — always update
1. `AGENT_BRAIN.md`
2. `TASK_LOG.md`
3. `ERROR_LOG.md`

### Reference 2 files — update only when needed
4. `docs/PROJECT_BLUEPRINT.md`
5. `docs/FEATURES_REFERENCE.md`

## Current Status
- R1 repo created
- clean 5-file documentation structure selected
- source app already inspected earlier
- grouped 380-feature reference preserved in one file
- workspace simplified to reduce documentation overhead
- source reference repo restored and left unchanged
- local-only app copy prepared inside R1 working branch for testing
- temporary admin bypass branch created to disable login/setup flow for testing
- Phase 1 premium layout branch started for responsive UI and sidebar improvements
- Phase 1 branch now also includes global search, better return discoverability, and light-theme readability fixes
- new branch created for admin-controlled dark/light color palette settings
- 3 preset themes added for dark mode and 3 preset themes added for light mode

## Repo Roles
### Source app repo
- `Dr-Adil-Abdullah/mumtazMedicalv5`
- this is the actual inspected application codebase

### R1 repo
- `Dr-Adil-Abdullah/mumtaz-medical-r1`
- this is the planning, continuity, tracking, and future R1 work repo

## Latest Important User Instructions
- keep workspace clean
- avoid too many docs files
- maintain only 3 main always-updated files
- keep at most 2 extra reference files
- keep grouped feature reference available
- do not waste focus on unnecessary documentation churn

## Key Reference Locations
- blueprint: `docs/PROJECT_BLUEPRINT.md`
- grouped features: `docs/FEATURES_REFERENCE.md`

## Active Git Safety Setup
### Source reference repo
- `Dr-Adil-Abdullah/mumtazMedicalv5`
- kept unchanged again

### Active R1 working branch
- previous stability branch: `feature/local-only-stability-v1`
- auth bypass base branch: `feature/temp-admin-bypass-v1`
- Phase 1 UI branch: `feature/premium-layout-phase1-v1`
- current theme settings branch: `feature/theme-palette-settings-v1`
- preview PR: `https://github.com/Dr-Adil-Abdullah/mumtaz-medical-r1/pull/5`

### Branch workflow rule
- changes happen in R1 branch first
- user tests that branch
- only after approval should those changes move forward

## Current Known Direction
Recommended first category to work on:
- **Stability / Core Runtime**

Recommended implementation order after that:
1. Stability / black-screen / local-only mode
2. POS + Inventory core flows
3. Ledger + Returns + Day Session
4. Reports + Settings polish
5. Cloud sync only after everything else is stable

## New AI Handoff / Start Method
### Minimum handoff
Upload these 3 files to the new AI:
1. `AGENT_BRAIN.md`
2. `TASK_LOG.md`
3. `ERROR_LOG.md`

### Optional reference files
4. `docs/PROJECT_BLUEPRINT.md`
5. `docs/FEATURES_REFERENCE.md`

### Copy/paste prompt for a new AI
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

## Next Tasks
- branch preview deploy should now target `feature/theme-palette-settings-v1`
- user tests admin-controlled palette editing in Settings
- confirm colors can be edited separately for dark and light mode
- confirm theme toggle still works after saving
- if approved: continue Phase 2 from this branch family or merge later into `main`

## Latest Work — feature/luxury-minimalism-v1
### Created on this branch (2026-07-03):
- Created reusable `ExpandableCard` component at `src/components/ui/ExpandableCard.jsx`
  - Includes `DetailRow` and `DetailDivider` sub-components
  - Accordion behavior: only one item expanded at a time
  - Luxury visual style: soft shadows, gradients, rounded corners, smooth animations
  - Controlled + uncontrolled mode support
  - Keyboard accessible (Enter/Space to toggle)
  - Right-slot for inline action buttons
- Added prominent Search icon button in Header
  - Circular magnifying glass icon with ring indicator
  - ⌘K keyboard shortcut support
  - Opens GlobalSearchModal on click
- Applied ExpandableCard to InventoryPage (product list)
  - Shows: name, sale price, brand + stock count
  - Expands: category, unit, barcode, pricing, batch details, actions
- Applied ExpandableCard to LedgerPage (customer list)
  - Shows: name, pending amount, purchases + loyalty points
  - Expands: phone, ID, purchase history, loyalty progress bar, pending bills with payment input
- Applied ExpandableCard to LedgerPage (supplier list)
  - Shows: name, phone, email
  - Expands: full contact details, WhatsApp action
- Documented design principle in AGENT_BRAIN.md
- Updated TASK_LOG.md

### Remaining work:
- Apply ExpandableCard to Staff page
- Apply ExpandableCard to POS cart items
- Apply ExpandableCard to Reports page rows
- Apply ExpandableCard to Print History
- Apply ExpandableCard to Expenses page
- Apply ExpandableCard to Day Session entries
- User tests branch `feature/luxury-minimalism-v1`
- If approved: merge to main
