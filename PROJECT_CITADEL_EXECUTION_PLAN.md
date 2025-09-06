# Project Citadel – Master Execution Plan

This is the authoritative delivery plan for the Property Pasalo ecosystem refinements. It’s organized by phases and sprints with concrete, checkable actions, owners, affected files/paths, acceptance criteria, risks, and notes. This file will be updated as work proceeds; completed items will be checked off and annotated.

Last updated: 2025-09-06 (later)

## Legend

- [ ] Planned
- [~] In progress
- [x] Done

## Phase 0 – Alignment and Scope

- [x] Gather specs from blueprint documents and repo scan
- [x] Confirm decisions via clarifications (video testimonial content, edit flexibility, Embla behavior, Viewing Booked counter, events security stance, single global Agent Profile, lead flow retention, multiple featured listings rotation, SEO-first approach)
- [x] Produce Red Team Audit (Phase 1) and get green-light to implement

Outcome: Phase 0 complete.

## Phase 1 – Red Team Audit (Complete)

- [x] Audit logical flow, data structures, functions, UI/UX vs. blueprint
- [x] Identify issues and propose refinements

Outcome: Approved to proceed to implementation.

## Phase 2 – Implementation (Current)

Implementation will proceed in 10 sprints to minimize risk and keep working software at each step.

### Sprint 1 – Shared Types, Validators, Rules & Functions Baseline

Scope: Establish shared types, enforce validation, secure events, and update counters.

Tasks

- [x] Create `packages/types` with canonical interfaces and exports
  - Testimonial, Listing, AgentProfile, Client, and utility types
  - Consumers: admin-portal, public-site, status-page, functions

- [x] Validation utilities in `packages/types` (or `packages/utils` if separate)
  - Per-type testimonial validation (IMAGE/VIDEO) with helpful messages
  - YouTube URL parser to `youtubeId`

- [~] Cloud Functions
  - [x] Update `confirmLeadAndNotify` to increment `/liveStatus/viewingsBookedCount` via RTDB transaction (+1)
  - [~] Add `onClientStatusChange` RTDB trigger on `/clients/{id}` to publish “became a homeowner” events when status transitions ACTIVE_CLIENT -> HOMEOWNER
  - [~] Ensure existing email and event write behavior remain intact

- [~] Security rules
  - [x] Lock down `/events` writes to functions only (client writes disabled)
  - [ ] Keep single-admin UID gates per current stance for other writes

Acceptance Criteria

- Type definitions compile and are imported in at least one target app
- Functions deploy locally or typecheck successfully
- Events cannot be written from client SDK in local tests
- On calling `confirmLeadAndNotify`, the counter increments and event writes succeed

Risks

- Breaking existing imports: mitigate by incremental migration; alias old types temporarily
- RTDB permissions for functions: ensure service account permission to `/liveStatus`

### Sprint 2 – Admin: Testimonials Enhancements

Scope: Enforce strict data, editable client fields, better UX.

Tasks

- [x] `apps/admin-portal/src/components/TestimonialModal.tsx`
  - [x] Add `clientTitle` (editable)
  - [x] Require IMAGE: `quote`, `rating`; VIDEO: `videoTitle`, `youtubeUrl`
  - [x] Parse and store `youtubeId` for VIDEO on save
  - [x] “Sync from client” button: re-pull name/photo from `/clients/{clientId}`
  - [ ] Star rating UI, photo preview, quote length guard
  - [x] `createdAt`/`updatedAt` timestamps

- [~] `apps/admin-portal/src/app/(admin)/testimonials/page.tsx`
  - [~] Display client photo, clientTitle, rating stars or video title (client photo pending)
  - [ ] Quick search and per-type filtering (kept)

Acceptance Criteria

- Cannot save an invalid testimonial; clear errors shown
- Edits propagate to RTDB and reflect in table

Risks

- Backward data with older testimonials: guard nulls and guide admin to edit

### Sprint 3 – Admin: Site Content Settings & Agent Profile

Scope: Central curation and global agent profile management.

Tasks

- [ ] New `SiteContentSettings` admin screen
  - [ ] Homepage: `siteContent/homepage/featuredImageTestimonials`, `featuredVideoTestimonials`
  - [ ] Status Page: `siteContent/statusPage/featuredImageTestimonials`, `featuredVideoTestimonials`, `featuredListingIds` (multi)
  - [ ] Agent Profile editor: `siteContent/agentProfile` with ImageUploader, name, title, philosophy, optional contact fields (stored only)

Acceptance Criteria

- Admin can update and persist all fields and see them on reload

Risks

- None major; ensure clean UI and validation

### Sprint 4 – UI Library: Embla Carousels

Scope: Create reusable carousels with accessible UX and mobile auto-advance (gentle).

Tasks

- [~] `packages/ui/testimonials/`
  - [x] `ImageTestimonialsCarousel` (Embla) with gentle mobile auto-advance
  - [x] `VideoTestimonialsCarousel` (basic; lightbox TBD; no autoplay)
  - [x] `TestimonialCard` shared renderer (name, clientTitle, quote, badge/rating)
  - [ ] Styles with responsive tokens; respect `prefers-reduced-motion`
  - [x] Export index and types

Acceptance Criteria

- Mobile shows 1 card and subtly auto-advances until user interaction
- Desktop shows 2–3 cards; swiping/keyboard works; a11y labels present

Risks

- Autoplay on mobile can conflict with motion sensitivity: pause when `prefers-reduced-motion`

### Sprint 5 – Public Listing Page: SSR, SEO, Testimonials, Agent Profile

Scope: SEO-first listing page with curated carousels and global agent profile.

Tasks

- [x] `apps/public-site/src/app/listings/[slug]/page.tsx`
  - [x] Fetch listing by slug and return `{ id, ...listing }`
  - [ ] Implement `generateStaticParams` (slugs)
  - [x] Implement `generateMetadata` (title/OG/canonical)
  - [x] Add Breadcrumb JSON-LD (BreadcrumbList)
  - [x] Fetch testimonials by IDs (image + video) and render carousels
  - [x] Fetch `siteContent/agentProfile` and render dumb AgentProfile component

- [x] `apps/public-site/src/components/AgentProfile.tsx`
  - [x] Replace stub with dumb renderer; styles per spec; no contact by default

- [x] `apps/public-site/src/components/StickyCtaSidebar.tsx`
  - [x] Pass listing propertyName into callable modal; when present, hide that field
  - [x] Pass listingId when available

Acceptance Criteria

- Page builds with ISR (e.g., revalidate 120s) or dynamic with metadata; Breadcrumb visible; carousels render
- Lead submit includes listing context; existing flow preserved

Risks

- Slug collisions: implement uniqueness guard in admin later if needed

### Sprint 6 – Status Page: Third Pod, Featured Listings Rotation, Curated Testimonials

Scope: Complete the community hub feature set.

Tasks

- [x] `apps/status-page/src/app/page.tsx`
  - [x] Add third DataPod: “Live Site Viewings Booked” from `/liveStatus/viewingsBookedCount`
  - [x] Load `siteContent/statusPage/featuredListingIds`, fetch listings, render rotation component (manual next/prev; optional timed on mobile only)
  - [x] Load curated testimonials and render both carousels

Acceptance Criteria

- Three pods show correct counts; featured listing rotator navigates; curated testimonials visible

Risks

- Performance if many featured listings: cap to a reasonable max (e.g., 5–8)

### Sprint 7 – Lead Capture Consolidation

Scope: Unify modal usage and ensure callable flow everywhere.

Tasks

- [x] Replace imports of non-callable modal with callable version in public site (including SignupModal)
- [ ] Ensure redirect URL assembled from `siteContent/automationLinks` remains intact
- [ ] Keep Next API route only if absolutely needed as proxy (documented), otherwise remove references

Acceptance Criteria

- All CTAs use the callable modal; form submission stable; SmartBot flow confirms and increments counter

Risks

- None, minimal code churn

### Sprint 8 – Seed Data & Indexing

Scope: Align seeders with new schema and ensure performance.

Tasks

- [x] Update `seed-firebase.js`
  - [x] Seed IMAGE and VIDEO testimonials with new shape (clientTitle, rating, youtubeId, etc.)
  - [x] Seed listings with featured testimonial arrays referencing seeded IDs
  - [x] Seed `siteContent/homepage` and `siteContent/statusPage` curated arrays
  - [x] Seed `siteContent/agentProfile`
  - [x] Seed `liveStatus/viewingsBookedCount = 0`

- [ ] Ensure RTDB indexes: `listings.urlSlug` already set; no change needed

Acceptance Criteria

- Seeding runs without errors and data matches new schema

### Sprint 9 – SEO, Performance & Accessibility Polish

Scope: Final polish aligned with conversion and UX.

Tasks

- [ ] Listing page JSON-LD (Product/RealEstate) with price and location
- [ ] OG/Twitter cards for listings using thumbnail
- [ ] Lazy-load videos and gallery images; sizes attributes for images
- [ ] Modal focus trap and keyboard navigation; Embla ARIA improvements

Acceptance Criteria

- Lighthouse SEO >= 95, Accessibility >= 95 on listing page

### Sprint 10 – Hardening, QA, Docs

Scope: Stabilize and document.

Tasks

- [ ] Manual regression: image upload (admin), testimonial save, listing save, lead flow E2E, status counters
- [ ] Troubleshooting guide updates
- [ ] Release notes

Acceptance Criteria

- All critical paths pass; docs complete

## Data & Caching Strategy

- Listings pages: SSG + ISR (revalidate ~120–300s) for SEO and freshness. Test fallback to dynamic if needed
- Status page: server-render on request (or short revalidate) for near-live counters; limit feed to last N (10)
- Carousels: server fetch, client-side Embla initialization; no client listeners for testimonials

## Security Posture

- `/events` writes restricted to functions
- Single-admin UID enforced for admin writes as per current stance
- Consider App Check later for callable functions

## Storage Bucket Note (High Attention)

- Current configured value appears as `property-pasalo-main.firebasestorage.app` (a domain). GCS bucket names are typically `{project-id}.appspot.com`. Functions use `admin.storage().bucket()` default, which must match the Firebase project default bucket. Validate in console and adjust web config if needed; see Troubleshooting.

## Open Questions (Resolved)

- Video testimonials content parity: include name, clientTitle, short statement – Yes
- Allow manual edits for client fields – Yes
- Embla auto-advance on mobile – Yes (gentle, respect reduced motion)
- “Viewing Booked” approach – Option B (dedicated counter)
- Client-side event writes – Disallow; functions only
- Single global Agent Profile – Yes; no agent sidebar
- Lead flow – Keep callable write + SmartBot + confirm webhook
- Featured listings rotation – Yes, multi allowed
- SEO-first strategy – Yes; SSR/ISR configured accordingly

## Rollback Plan

- Keep changes behind small, incremental PRs
- Revert by sprint if any regression appears; avoid multi-app breaking PRs

## Ownership

- Default owner: Lead Dev
- Cloud Functions and Rules: Backend Dev
- Admin UI: Admin Frontend Dev
- Public Site & UI Package: Web Frontend Dev
