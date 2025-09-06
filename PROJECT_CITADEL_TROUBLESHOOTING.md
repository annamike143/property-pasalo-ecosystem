# Project Citadel – Troubleshooting & Notes

Living log of issues, root causes, and resolutions during implementation. Keep concise and actionable. Update as we go.

Last updated: 2025-09-06

## Index
- Storage/Uploads
- Cloud Functions
- Database & Rules
- UI/UX (Embla, Modals)
- Lead Flow
- SEO & Build

---

## Storage / Uploads

Issue: 404 Not Found when uploading via `compressAndUploadImageV2`
- Symptom: `The specified bucket does not exist` when calling `https://storage.googleapis.com/upload/storage/v1/b/property-pasalo-main.firebasestorage.app/o?...`
- Root cause: Web config uses a domain-like string as `storageBucket` (e.g., `property-pasalo-main.firebasestorage.app`) instead of the actual GCS bucket (typically `{project-id}.appspot.com`). Cloud Functions use `admin.storage().bucket()` default bucket; mismatch causes confusion.
- Resolution:
  1) Verify default bucket in Firebase Console (Storage > Files > Bucket details)
  2) Update web configs to correct bucket value
  3) Keep ImageUploader posting to `compressAndUploadImageV2` which uploads to the default bucket on the server side
  4) Retest upload; expect public URL and thumbnail visible

Notes:
- If public access is restricted, ensure `makePublic()` succeeds or switch to signed URLs with expiry for admin previews.

## Cloud Functions

Issue: Need to increment Viewing Booked counter on SmartBot confirmation
- Action: In `confirmLeadAndNotify`, after updating inquiry to CONFIRMED, run RTDB transaction on `/liveStatus/viewingsBookedCount` +1. Create key if not present.
- Test: Call function with a test inquiryId; verify counter increments and event added.

Issue: Publish homeowner event on client status change
- Action: RTDB trigger `/clients/{id}`: on write, if status changes from `ACTIVE_CLIENT` to `HOMEOWNER`, push event into `/events`.
- Test: Manually change a client in admin; see event appear in status page feed.

## Database & Rules

Issue: Any authenticated user can write `/events`
- Action: Change rules to block client writes: `.write: false` on `/events` or require admin UID. Only Cloud Functions should write events.
- Test: Attempt client write; expect PERMISSION_DENIED.

Issue: Testimonials inconsistent shapes (legacy seed)
- Action: Update seeder to strict schema; admin UI enforces validation.
- Test: Seed then load admin testimonials; list renders without undefined fields.

## UI/UX (Embla, Modals)

Issue: Auto-advance carousel on mobile needs to be gentle
- Action: Implement light auto-advance with pause on user interaction; respect `prefers-reduced-motion`; no infinite speed.
- Test: On mobile, one card advances slowly; on desktop no auto-advance.

Issue: Modal accessibility
- Action: Add focus-trap, ESC close, aria-labelledby and aria-describedby; prevent background scroll.
- Test: Keyboard-only interaction works; no focus loss on open/close.

## Lead Flow

Flow to preserve
1) Public form -> callable `writeLeadToDb` -> returns inquiryId
2) Fetch redirect URL from `siteContent/automationLinks` -> redirect with params
3) SmartBot runs flow
4) SmartBot calls callable `confirmLeadAndNotify` -> inquiry CONFIRMED, counter +1, event + email

Common pitfalls
- Missing automation links: show graceful fallback and do not break submission
- CORS: callable handles CORS; if using onRequest proxy, set headers explicitly

## SEO & Build

Issue: Listing SSR/ISR strategy
- Action: Prefer SSG + ISR (120–300s) for SEO; for initial simplicity, dynamic with `generateMetadata` and plan upgrade.
- Test: Metadata shows correct title/OG; Breadcrumb JSON-LD validates in Rich Results Test.

## Misc Notes
- Ensure `listings.urlSlug` uniqueness in admin UI to avoid routing conflicts
- Cap featured counts (testimonials: <= 6; featured listings: <= 8) to keep pages performant

---

Append new entries above this line as issues arise.
