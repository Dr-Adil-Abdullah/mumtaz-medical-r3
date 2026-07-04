═══════════════════════════════════════════════
## 🔓 FREEDOM RULE (MOST IMPORTANT RULE)
═══════════════════════════════════════════════

NO BONDING TO ANY LANGUAGE OR FRAMEWORK.
EVER.

Every project → AI thinks fresh.
Every project → AI picks the BEST tool.
Every project → User can override anytime.

THIS IS THE LAW:
→ Never force a language
→ Never force a framework
→ Never force a database
→ Never force a hosting
→ Always pick what is BEST for THIS project
→ Always explain WHY you picked it
→ User can always say "use X instead"
→ AI switches without any problem

═══════════════════════════════════════════════
## 🧠 HOW AI CHOOSES TECHNOLOGY
═══════════════════════════════════════════════

AI ASKS ITSELF THESE QUESTIONS:

QUESTION 1: What is being built?
→ Simple website?
→ Complex web app?
→ Mobile app?
→ AI powered app?
→ Real time app?
→ E-commerce?
→ Dashboard?
→ Game?
→ API only?

QUESTION 2: What does it need?
→ Speed?
→ Simplicity?
→ Scalability?
→ Real-time?
→ Heavy data?
→ Beautiful UI?
→ AI features?
→ Payment system?
→ Authentication?

QUESTION 3: What is the complexity?
→ Small (1-5 pages)
→ Medium (5-20 pages)
→ Large (20+ pages)
→ Enterprise level

QUESTION 4: Who will use it?
→ Just the owner
→ Small team
→ Public users
→ Millions of users

THEN AI DECIDES THE BEST STACK.
THEN AI EXPLAINS THE DECISION.
THEN AI BUILDS IT.

═══════════════════════════════════════════════
## 📊 TECHNOLOGY DECISION MATRIX
═══════════════════════════════════════════════

SIMPLE WEBSITE (fast, beautiful, no backend):
Best Choice → HTML + CSS + Vanilla JS
Why → No overhead, fast, works everywhere
Deploy → Netlify / GitHub Pages / Vercel

SIMPLE WEBSITE WITH CONTENT:
Best Choice → Next.js or Astro
Why → Fast, SEO friendly, easy to manage
Deploy → Vercel

COMPLEX WEB APP (users, data, logic):
Frontend → React or Next.js
Backend → Node.js / Express or Python FastAPI
Database → PostgreSQL or MongoDB
Deploy → Vercel + Railway or AWS

REAL TIME APP (chat, live updates):
Frontend → React
Backend → Node.js + Socket.io
Database → MongoDB or Redis
Deploy → AWS or DigitalOcean

E-COMMERCE:
Best → Next.js + Stripe + PostgreSQL
OR → Shopify custom theme (if simple)
Why → SEO, payments, performance
Deploy → Vercel + Railway

DASHBOARD / ADMIN PANEL:
Frontend → React + Tailwind + Charts
Backend → Python FastAPI or Node.js
Database → PostgreSQL
Deploy → Any VPS

MOBILE APP:
Cross Platform → React Native or Flutter
iOS only → Swift
Android only → Kotlin
Simple → React Native + Expo

AI POWERED APP:
Backend → Python (best for AI)
API → FastAPI or Flask
Frontend → React or Next.js
AI Models → OpenAI / Anthropic / Local
Database → PostgreSQL + Vector DB

GAME:
Web Game → JavaScript + Phaser.js
Simple 3D → Three.js
Complex → Unity (C#)

API ONLY (no frontend):
Best → Python FastAPI
OR → Node.js Express
Database → PostgreSQL
Docs → Auto-generated Swagger

BIG ENTERPRISE APP:
Frontend → Next.js
Backend → Python FastAPI or Go
Database → PostgreSQL + Redis cache
Search → Elasticsearch
Deploy → AWS or GCP

═══════════════════════════════════════════════
## ⚡ USER OVERRIDE SYSTEM
═══════════════════════════════════════════════

USER CAN ALWAYS SAY:
→ "Use Python instead"      → AI switches
→ "Use Vue not React"       → AI switches
→ "Use MongoDB not Postgres"→ AI switches
→ "Make it simpler"         → AI simplifies
→ "Make it more powerful"   → AI upgrades
→ "I know JavaScript only"  → AI uses JS for everything
→ "Use what you think best" → AI decides

AI NEVER ARGUES.
AI NEVER SAYS "that's not the best way".
AI JUST BUILDS WHAT USER WANTS.
BUT AI ALWAYS WARNS IF SOMETHING IS A BAD IDEA.

═══════════════════════════════════════════════
## 🎯 AI DECISION ANNOUNCEMENT
═══════════════════════════════════════════════

EVERY TIME AI PICKS A STACK IT MUST SAY:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ TECHNOLOGY DECISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project: [NAME]
Type: [TYPE]

I chose:
→ Frontend: [X] because [REASON]
→ Backend: [X] because [REASON]
→ Database: [X] because [REASON]
→ Hosting: [X] because [REASON]

This gives you:
✅ [BENEFIT 1]
✅ [BENEFIT 2]
✅ [BENEFIT 3]

Want to change anything?
Say 'use X instead' and I switch.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

═══════════════════════════════════════════════
## 🔄 SWITCHING TECHNOLOGY MID PROJECT
═══════════════════════════════════════════════

IF USER WANTS TO CHANGE TECH AFTER STARTING:

AI WILL:
1. Log old tech in ERROR_LOG as "TECH CHANGE"
2. Explain what needs to be rewritten
3. Save old code as V-X.X-OLD-[LANGUAGE]
4. Rebuild in new technology
5. Update TASK_LOG with new stack
6. Update AGENT_BRAIN with new decision
7. Continue without losing any logic or features

NOTHING IS EVER LOST.
EVERYTHING IS VERSIONED.

═══════════════════════════════════════════════
## 🗂️ DOCUMENT MAINTENANCE RULE
═══════════════════════════════════════════════

TO REDUCE DOCUMENTATION LOAD DURING REAL BUILD WORK:

MAIN 3 FILES — ALWAYS UPDATE:
→ AGENT_BRAIN.md
→ TASK_LOG.md
→ ERROR_LOG.md

REFERENCE 2 FILES — UPDATE ONLY WHEN NEEDED:
→ docs/PROJECT_BLUEPRINT.md
→ docs/FEATURES_REFERENCE.md

RULE:
→ Always keep the 3 main files current
→ Update the 2 reference files only on meaningful structural changes
→ Do not create unnecessary doc churn
→ Keep focus on real feature work

FEATURE REFERENCE LOCATION:
→ docs/FEATURES_REFERENCE.md

That file keeps the grouped 380-feature reference in one place.

═══════════════════════════════════════════════
## 🌿 GIT SAFETY / ROLLBACK RULE
═══════════════════════════════════════════════

FOR EVERY RISKY CHANGE:
→ first keep stable `main`
→ create a working branch like `fix/...` or `feature/...`
→ test the branch before merge
→ commit only the focused change
→ merge to `main` only after validation

REPO RULE FOR THIS PROJECT:
→ source reference repo should stay unchanged
→ new edits should be done in the R1 repo branches
→ temporary bypasses are allowed in branches if they are reversible
→ user tests branch first
→ then approved work continues or merges later

ROLLBACK METHOD:
→ go back to `main` if the feature branch is bad
→ or discard the branch
→ never break the last stable version intentionally

═══════════════════════════════════════════════
## 🤖 NEW AI START METHOD
═══════════════════════════════════════════════

IF THIS PROJECT IS MOVED TO A NEW AI:

MINIMUM FILES TO UPLOAD:
→ AGENT_BRAIN.md
→ TASK_LOG.md
→ ERROR_LOG.md

REFERENCE FILES (ONLY IF NEEDED):
→ docs/PROJECT_BLUEPRINT.md
→ docs/FEATURES_REFERENCE.md

READ ORDER FOR THE NEW AI:
1. AGENT_BRAIN.md
2. TASK_LOG.md
3. ERROR_LOG.md
4. docs/PROJECT_BLUEPRINT.md
5. docs/FEATURES_REFERENCE.md (only if feature-level context is needed)

COPY/PASTE START PROMPT FOR A NEW AI:

"Read these files first in order:
1. AGENT_BRAIN.md
2. TASK_LOG.md
3. ERROR_LOG.md

Then use docs/PROJECT_BLUEPRINT.md only for project structure context.
Use docs/FEATURES_REFERENCE.md only when feature-level reference is needed.

Rules:
- Source reference repo must stay unchanged.
- New changes must happen only in R1 branches.
- First summarize current state, active branch, and next task.
- Then wait for my instruction before changing code."

THIS IS THE STANDARD HANDOFF METHOD FOR THIS PROJECT.

═══════════════════════════════════════════════
## 🎨 UNIFORM DESIGN PRINCIPLE
═══════════════════════════════════════════════

"Progressive Disclosure + Luxury Minimalism"

THIS IS THE DESIGN LAW FOR ALL PAGES AND LISTS.

RULE 1 — Collapsed by Default:
→ Every list, table or card (Inventory, Sales, Invoices,
  Customers, Suppliers, etc.) shows only 2-3 CORE fields:
  - Primary: Item/Person name (bold, white)
  - Secondary: Most important number (Qty, Price, or Balance)
  - Tertiary: Optional supporting detail (muted text)
→ All other fields (company, batch, expiry, seller detail,
  address, notes, etc.) stay HIDDEN.

RULE 2 — Expand on Click (Accordion):
→ When user clicks a row/card, it smoothly expands (200-300ms)
  and reveals ALL details inline.
→ Only ONE item expanded at a time (accordion behavior).
→ Details stay on the SAME page — no separate modal/page
  unless absolutely necessary.

RULE 3 — Luxury Visual Style:
→ Use whitespace and soft shadows instead of heavy borders.
→ Font weight: names BOLD, details in gray/muted tones.
→ Icons instead of labels where possible.
→ Smooth transition/animation (200-300ms) on every expand/collapse.
→ Consistent spacing and rounded corners (rounded-2xl) throughout.
→ Gradient backgrounds (from-white/[0.04] to-white/[0.01]).
→ Subtle hover effects (border brightens, slight shadow).

RULE 4 — Apply Everywhere (Reusable Component):
→ The pattern lives in <ExpandableCard /> component.
→ Located at: src/components/ui/ExpandableCard.jsx
→ Helper sub-components: <DetailRow />, <DetailDivider />
→ EVERY module reuses these — never write custom card code.
→ This ensures consistency and maintainability.

IMPLEMENTATION CHECKLIST:
□ Inventory page — ✅ Uses ExpandableCard
□ Ledger page (customers) — ✅ Uses ExpandableCard
□ Ledger page (suppliers) — ✅ Uses ExpandableCard
□ POS page — TODO: Apply pattern to cart items
□ Staff page — TODO: Apply pattern to staff list
□ Reports page — TODO: Apply pattern to report rows
□ Print History — TODO: Apply pattern to bill history
□ Expenses page — TODO: Apply pattern to expense entries
□ Day Session — TODO: Apply pattern to session entries

SEARCH INDICATOR:
→ A visible circular search icon in the header with a magnifying
  glass icon and ⌘K shortcut hint.
→ Click opens GlobalSearchModal for searching across all modules.
→ Located in: src/components/layout/Header.jsx
