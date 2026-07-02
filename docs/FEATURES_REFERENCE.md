# Mumtaz Medical — Features Reference

This is the **reference feature file** for the project.

- It keeps the grouped 380-feature inventory in one place.
- It is a **reference file** and should be updated only when major feature structure changes.
- It replaces the need to read the older incremental `FEATURES_FIRST_100.md` during normal work.

---


This file reorganizes the **380 identified features** from the master inventory into business and technical categories.

Use this together with:
- the 3 main files (`AGENT_BRAIN.md`, `TASK_LOG.md`, `ERROR_LOG.md`) for current working context
- `docs/PROJECT_BLUEPRINT.md` for structure/context when needed

## Category summary

| Category | Feature Count |
|---|---:|
| Foundation, Setup & Shared UI | 31 |
| Authentication, Security & Session Handling | 21 |
| Roles, Permissions & Navigation | 13 |
| Staff & Workforce Management | 10 |
| Inventory, Products & Stock Control | 17 |
| Barcode, Labels & Camera Scanning | 19 |
| POS, Sales Checkout & Receipting | 47 |
| Customers, Suppliers & Ledger | 15 |
| Loyalty & Customer Retention | 12 |
| WhatsApp & Communication | 16 |
| Expenses & Purchasing | 19 |
| Reports & Analytics | 49 |
| Print History, Returns & Refund Approval | 26 |
| Day Session & Cash Reconciliation | 17 |
| Settings & Business Rules | 20 |
| Backup, Restore & Data Safety | 15 |
| Sync, Offline & Cloud Readiness | 27 |
| Audit & Activity Monitoring | 5 |
| Documentation & Meta Inventory | 1 |

## Categorized features

## Foundation, Setup & Shared UI (31)

Core app structure, initialization, shared layout, and reusable visual building blocks.

- **1** — React + Vite scaffold
- **2** — Tailwind CSS UI layer
- **3** — PWA registration
- **4** — IndexedDB local database with Dexie
- **5** — Zustand state stores
- **6** — React Router app shell
- **7** — Route-level lazy loading
- **8** — Manual vendor chunk splitting
- **9** — Runtime error boundary
- **10** — Live Dexie queries
- **11** — First-launch initialization flow
- **12** — Demo seed data
- **13** — Settings page connected to IndexedDB
- **105** — Header page context
- **113** — Module intros via SectionIntro
- **114** — Clickable summary cards
- **115** — Detail modals on major screens
- **116** — Reusable UI primitives
- **117** — Dark glass-style dashboard theme
- **118** — Responsive admin layout
- **125** — Bootstrap owner account
- **126** — Default shop settings seed
- **127** — Automatic settings patching
- **128** — Auto-seed if products are missing
- **129** — Seeded product example: Panadol Extra
- **130** — Seeded product example: Augmentin 625mg
- **131** — Seeded product example: Rigix Syrup
- **132** — Built-in medicine categories list
- **337** — First-launch loading state
- **338** — First-launch capability cards
- **380** — Modal size variants

## Authentication, Security & Session Handling (21)

Login flows, PIN security, emergency access, and session behavior.

- **14** — Staff ID login
- **15** — PIN pad login UX
- **16** — Auto-submit on 4th PIN digit
- **17** — Failed-login feedback and logging
- **18** — Emergency super-admin key
- **19** — Emergency manager key
- **20** — Emergency salesperson key
- **21** — Forced PIN change for bootstrap users
- **22** — Self-service PIN change
- **23** — Weak PIN blocking
- **24** — Session persistence in sessionStorage
- **107** — Emergency-session visual marker
- **108** — Header self-service PIN modal
- **331** — Two-mode login switcher
- **332** — Demo reset shortcut on login
- **333** — Bad-PIN shake feedback
- **334** — Camera login fill workflow
- **335** — Named emergency log entries
- **336** — Bootstrap key help panel
- **339** — Forced-PIN logout escape
- **340** — SHA-256 PIN hashing

## Roles, Permissions & Navigation (13)

Route protection, access control, scoped visibility, and role-aware navigation.

- **25** — Protected routes
- **26** — Role-based sidebar
- **27** — Granular permission matrix
- **106** — Role badge styling
- **109** — Protected-route unauthorized fallback
- **110** — Role-filtered navigation links
- **111** — Sidebar return-approval counter
- **112** — Sticky desktop sidebar
- **185** — Scoped customer visibility
- **186** — Scoped payment visibility
- **187** — Visible-pending amount calculation
- **192** — Supplier tab permission gating
- **379** — Unauthorized route echo

## Staff & Workforce Management (10)

Staff CRUD, role-safe account management, and workforce administration.

- **28** — Staff creation form
- **29** — Staff edit form
- **30** — Staff deactivate/reactivate flow
- **31** — Staff ID auto-generation
- **32** — Duplicate staff ID prevention
- **33** — Short-code generation and validation
- **34** — Role-aware assignable roles
- **35** — Admin PIN reset for staff
- **36** — Self-protection against risky staff actions
- **39** — Staff-related audit log actions

## Inventory, Products & Stock Control (17)

Product master data, stock alerts, expiry handling, batches, and inventory search.

- **40** — Product creation flow
- **41** — Product edit flow
- **42** — Product deactivate/reactivate
- **43** — Duplicate barcode check
- **44** — Batch-based stock-in
- **45** — Batch number tracking
- **46** — Expiry date tracking
- **47** — Low-stock indicators
- **48** — Near-end stock indicators
- **49** — Expired-stock indicators
- **50** — Purchase-price visibility restrictions
- **133** — Inventory search across multiple fields
- **134** — Latest-batch snapshot in inventory cards
- **135** — Per-batch low-stock alert thresholds
- **136** — Per-batch near-end thresholds
- **137** — Batch stock-in prefills from last batch
- **138** — Purchase-price hiding with operational continuity

## Barcode, Labels & Camera Scanning (19)

Barcode generation, label printing, USB scanner support, and camera scanning workflows.

- **37** — Staff barcode preview and print
- **52** — Barcode quick-add to cart
- **53** — Camera barcode scanner
- **139** — Product barcode preview modal
- **140** — Product barcode print action
- **141** — Staff barcode preview modal
- **142** — Customer barcode preview modal
- **143** — Barcode card loading state
- **144** — Dynamic jsbarcode loading
- **145** — CODE128 barcode format
- **146** — Printable barcode note field
- **147** — Camera scanner back-camera preference
- **148** — Supported scan format list
- **149** — Scanner restart on unmatched result
- **150** — Scanner cleanup on close
- **151** — Camera device selector
- **152** — Scanner status messaging
- **168** — Barcode input for USB scanners
- **169** — Enter-to-add barcode workflow

## POS, Sales Checkout & Receipting (47)

Checkout flow, cart logic, bill numbering, stock deduction, and receipt actions.

- **51** — Searchable POS product grid
- **54** — Auto-pick non-expired batch
- **55** — Manual batch selection
- **56** — Cart quantity controls
- **57** — Cash sale workflow
- **58** — Pending sale workflow
- **59** — Payback date validation
- **60** — Bill-level discount percent
- **61** — Auto bill number generation
- **62** — Batch-level stock deduction on sale
- **63** — Customer auto-create from sale
- **64** — Recent bills panel
- **65** — Receipt preview modal
- **66** — Browser receipt print
- **163** — POS recent-sales visibility scoping
- **164** — Customer lookup by exact name in POS
- **165** — Loyalty preview before checkout
- **166** — Current customer loyalty stage preview
- **167** — Projected loyalty total after sale
- **170** — Searchable POS products by multiple terms
- **171** — Expired-batch exclusion in POS
- **172** — FEFO-like batch sorting
- **173** — Sale result success panel
- **174** — Post-sale print shortcut
- **176** — Visible filtered-product summary card
- **177** — Cart summary stat card
- **178** — Live total summary stat card
- **179** — Recent-bills summary card
- **180** — Pending-sale requires customer context
- **181** — Amount-received vs amount-paid field labeling
- **182** — Payback-date input for credit sales
- **341** — Centralized POS store
- **342** — Cart item-limit enforcement
- **343** — Auto-remove on quantity decrement to zero
- **344** — clearCart resets sale form
- **345** — Empty-cart sale validation
- **346** — Cash-payment sufficiency validation
- **347** — Pending-sale minimum enforcement
- **348** — Context-aware loyalty awarding
- **349** — Device-aware bill suffix
- **350** — Active-batch validation at commit time
- **351** — Expired-batch blocking at commit time
- **352** — Negative-stock override support
- **353** — Repeat-customer upsert on sale
- **354** — Customer creator metadata on auto-create
- **355** — Sale record captures paid and change/due
- **356** — Sale-result payload for UI

## Customers, Suppliers & Ledger (15)

Customer/supplier records, payments, dues, and ledger-specific controls.

- **69** — Customer creation in Ledger
- **70** — Supplier creation in Ledger
- **71** — Pending-customer filtering
- **72** — Partial payment recording
- **73** — Pending balance tracking
- **124** — Customer ID generator
- **183** — VIP phone enforcement
- **184** — Customer-type filtering in ledger
- **193** — Supplier detail fields
- **194** — Customer creator metadata
- **195** — Payment recording guardrails
- **196** — Multi-table payment transaction
- **197** — Pending amount roll-down on payment
- **198** — Customer ledger summary cards
- **199** — Supplier list summary card

## Loyalty & Customer Retention (12)

Loyalty earning, stage progression, redemption math, and loyalty-related owner controls.

- **74** — Loyalty points earning on cash sales
- **75** — Loyalty stage and progress display
- **188** — Automatic loyalty stage calculation
- **189** — Points-to-next-stage metric
- **190** — Loyalty progress percentage
- **191** — Loyalty redeem-value estimate
- **271** — Loyalty enable/disable toggle
- **274** — Loyalty settings status badge
- **275** — Loyalty points-rate input
- **276** — Loyalty redeem-rate input
- **277** — Loyalty stage threshold inputs
- **278** — Loyalty threshold-order validation

## WhatsApp & Communication (16)

WhatsApp buttons, phone normalization, and reusable messaging templates.

- **38** — Staff WhatsApp contact action
- **68** — WhatsApp resend for old bills
- **76** — WhatsApp customer reminder actions
- **77** — WhatsApp supplier contact actions
- **153** — Reusable WhatsApp button component
- **154** — Hide-if-no-phone WhatsApp behavior
- **155** — Pakistan phone normalization
- **156** — WhatsApp deep-link generation
- **157** — Pending reminder message template
- **158** — Bill summary WhatsApp message
- **159** — Supplier contact message template
- **160** — Staff contact message template
- **161** — General customer message template
- **162** — Localized Urdu message support
- **175** — Post-sale WhatsApp shortcut
- **257** — Customer-phone lookup for bill sharing

## Expenses & Purchasing (19)

Expense entry, supplier-linked purchasing costs, and expense drill-down workflows.

- **78** — Expense creation form
- **79** — Multiple expense types
- **80** — Supplier-linked expense entries
- **81** — Enable/disable expense totals
- **301** — Preferred suppliers sorted first
- **302** — Expense type selector
- **303** — Supplier-required purchase expenses
- **304** — Expense form reset button
- **305** — Expense enabled/disabled grouping
- **306** — Enabled-only expense totals
- **307** — Monthly-expense subtotal
- **308** — Medicine-purchase subtotal
- **309** — Disabled-entry counter
- **310** — Expense toggle audit trail
- **311** — Supplier-name resolution in expense cards
- **312** — Dimmed styling for disabled expenses
- **313** — Expense detail drill-down modal
- **314** — Expense role-restriction notice
- **315** — Expense empty-state guidance

## Reports & Analytics (49)

KPIs, charts, ranking views, filters, and CSV export across all report tabs.

- **82** — Reports overview tab
- **83** — Reports products tab
- **84** — Reports category/brand tab
- **85** — Reports sales-history tab
- **86** — Reports staff tab for permitted roles
- **87** — Live KPI calculations
- **88** — Built-in charts
- **89** — Searchable report sales history
- **90** — CSV export tools
- **201** — Report date-range selector
- **202** — Tabbed reports workspace
- **203** — Permission-based staff report tab
- **204** — Revenue trend line chart
- **205** — Dual revenue-vs-expense chart
- **206** — Today range time bucketing
- **207** — 7-day daily trend buckets
- **208** — 30-day daily trend buckets
- **209** — All-time monthly trend buckets
- **210** — Payment-mode revenue chart
- **211** — Average-bill metric
- **212** — Visible-overdue customer count
- **213** — Discount-total metric
- **214** — Tax-total metric
- **215** — Top-category snapshot chart
- **216** — Product sorting by revenue
- **217** — Product sorting by units sold
- **218** — Product sorting by profit
- **219** — Top-N product limit selector
- **220** — Detailed product ranking list
- **221** — No-data chart placeholders
- **222** — Category vs brand toggle
- **223** — Donut revenue-share chart
- **224** — Horizontal breakdown bars
- **225** — Breakdown group count badge
- **226** — Searchable report sales history
- **227** — Payment-mode filter in report history
- **228** — Role-sensitive financial columns
- **229** — Overview CSV export
- **230** — Products CSV export
- **231** — Category/brand CSV export
- **232** — Sales history CSV export
- **233** — Staff performance CSV export
- **234** — Trend-series CSV export
- **235** — Staff revenue chart
- **236** — Staff ranking list
- **237** — Scoped-report warning banner
- **238** — Low-stock report metric
- **239** — Payment-mode aggregation map
- **240** — Staff-performance aggregation map

## Print History, Returns & Refund Approval (26)

Bill history, return processing, approval flows, previews, and linked return records.

- **67** — Print History search and reprint
- **91** — Return/refund from original sale
- **92** — Partial return quantities
- **93** — Mandatory return reason capture
- **94** — Return approval status tracking
- **95** — Return approval dashboard
- **104** — Header pending return badge
- **241** — Print History summary cards
- **242** — Sale vs return badges
- **243** — Return approval status badge
- **244** — Extended Print History search fields
- **245** — Linked-return grouping by original bill
- **246** — Returned-value rollup per sale
- **247** — Returnable-quantity computation
- **248** — Bill preview modal
- **249** — Preview-modal actions
- **250** — Return button state logic
- **251** — Per-line return quantity entry
- **252** — Mandatory return reason textarea
- **253** — Live return financial preview
- **254** — Action-status banners
- **255** — Pending-linked-return note on originals
- **256** — Original-bill reference on return cards
- **258** — No-bills empty state
- **259** — Return workflow explainer panel
- **260** — Auto-preview newly created return bill

## Day Session & Cash Reconciliation (17)

Open/close day workflows, expected-cash calculations, and session history.

- **96** — Day session open/close cash flow
- **103** — Header day-open badge
- **316** — Single-open-session enforcement
- **317** — Close-day requires counted cash
- **318** — Expected-cash formula
- **319** — Pending-sale cash handling in session math
- **320** — Session partial-payment inclusion
- **321** — Session enabled-expense inclusion
- **322** — DAY_OPEN audit log
- **323** — DAY_CLOSE audit log
- **324** — Session-history restriction card
- **325** — Session difference color coding
- **326** — Session bills detail modal
- **327** — Session history detail modal
- **328** — Session cash-breakdown modal
- **329** — Operator names stored on session open/close
- **330** — Session status badges in history

## Settings & Business Rules (20)

Owner-facing configuration, commercial rules, pricing/tax settings, and operational toggles.

- **261** — Settings dashboard counts
- **262** — Shop identity settings
- **263** — Minimum pending amount setting
- **264** — Receipt format setting
- **265** — Default low-stock threshold
- **266** — Default near-end threshold
- **267** — Cart item limit setting
- **268** — Maximum discount percentage setting
- **269** — Negative-stock policy toggle
- **270** — VIP phone requirement toggle
- **272** — Tax enable/disable toggle
- **273** — Auto-block overdue toggle
- **279** — Tax-percent input
- **280** — Global discount type selector
- **281** — Global discount value input
- **282** — Global discount enable toggle
- **283** — Settings change audit log
- **284** — Local save-status feedback
- **299** — IndexedDB storage hint
- **300** — Emergency-key status tile

## Backup, Restore & Data Safety (15)

JSON export/import, restore behavior, queue rebuilds, and backup metadata.

- **97** — JSON backup export/import
- **98** — Restore rebuilds the sync queue
- **290** — Backup export action
- **291** — Hidden file-input restore flow
- **292** — Selected-backup filename display
- **293** — Restore-mode explanation card
- **294** — Post-restore sync-rebuild indicator
- **295** — Backup success and error banners
- **296** — Backup audit logging
- **297** — Restore completion summary
- **358** — Backup payload metadata block
- **359** — Required-table backup validation
- **360** — Restore clears old sync queue first
- **361** — Restore appends logs rather than replacing them
- **362** — Dated backup filename

## Sync, Offline & Cloud Readiness (27)

Offline indicators, Supabase sync UI, queue helpers, realtime plumbing, and sync diagnostics.

- **99** — Manual Supabase sync foundation
- **100** — Realtime listener controls and sync indicator
- **101** — Offline status badge
- **102** — Header sync status chip
- **285** — Sync environment status badge
- **286** — Sync overview cards
- **287** — Manual sync result messaging
- **288** — Start realtime listener control
- **289** — Stop realtime listener control
- **298** — Sync-error surfacing
- **357** — Reusable sync-queue helper
- **363** — Sync store last-pull tracking
- **364** — Sync retry/error bookkeeping
- **365** — Timestamp-ordered sync push
- **366** — Full-table cloud pull replacement
- **367** — Realtime subscriptions across tracked tables
- **368** — Remote delete application
- **369** — Remote upsert application
- **370** — Online/offline event binding for sync state
- **371** — Manual sync blocks without env config
- **372** — Manual sync blocks while offline
- **373** — SYNC_PUSH audit log
- **374** — SYNC_PULL audit log
- **375** — SYNC_ERROR audit log
- **376** — Listener start/stop audit logs
- **377** — Environment introspection helper
- **378** — Supabase client intentionally disabled

## Audit & Activity Monitoring (5)

Dedicated activity-log features, filters, and logging helpers.

- **119** — Searchable activity log
- **120** — Live local audit trail
- **121** — System bootstrap log entry
- **122** — Demo-catalog seed log entry
- **123** — Simple writeLog helper

## Documentation & Meta Inventory (1)

Documentation-oriented and meta-tracking features about the project itself.

- **200** — Same-file expandable feature inventory
