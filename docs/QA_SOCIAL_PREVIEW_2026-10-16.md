# Social sharing preview QA - 2026-10-16

**PASS.** The final `npm run verify:fix` exited **0** after the last product edit. QA runs against the frozen source after the unsupported checkmark glyph was replaced with a CSS-drawn checkmark; the earlier gate was deliberately stopped and is not reused.

## Reviewed scope

- `src/app/opengraph-image.tsx` serves a 1200x630 PNG using the existing website logo, local Geist font files and a local Fraunces headline subset. The Fraunces source/subset scope is documented beside the bundled SIL Open Font License.
- The image route uses the Node runtime and local filesystem reads. No remote image/font request is coded into this route. The decorative checkmark uses borders rather than an unsupported glyph requiring font fallback.
- General-page Open Graph images and root Twitter metadata point to `/opengraph-image?v=20261016`. Page titles, descriptions, canonicals and article-specific blog preview routes are unchanged by this diff.
- The new isolated test reads actual local crawler-facing homepage, IB and About HTML, verifies the expected image URL/Twitter URL/dimensions, then fetches the actual local image route and checks status, PNG type/signature, dimensions and a bounded response size. The response itself is saved and attached for visual review.

Frozen image source SHA256: `E0C5FE74AE5D278B4B92B8CF5C5B661676528CAADD390557C1489C266809FD63`.

## Independent gate

`npm run verify:fix` passed after the final product edit:

- TypeScript passed.
- **804 unit/mocked integration tests across 67 files passed**, 263.60 seconds.
- **28 isolated Chromium cases passed**, 3.7 minutes, with no retries or skips. The new real metadata/image test passed in 9.6 seconds.
- `git diff --check` passed; only routine existing line-ending notices were emitted.

## Authoritative image evidence

The actual local image route returned **200**, `image/png`, the correct PNG signature, **1200x630**, and **96024 bytes**. Homepage, IB and About crawler HTML reported the exact versioned production OG URL, matching Twitter image URL, and dimensions. This validates local crawler metadata/rendering contracts; it is not a production deployment claim.

Fresh response artifact:

`test-results/social-preview-public-shar-e7e53-ned-renderable-social-image-chromium/social-preview.png`

The image is also attached as **Rendered social preview** in the Playwright report. QA manually opened this exact newly generated response image. The website logo matches the existing asset; serif headline and sans-serif supporting text render cleanly, including French accents and the illustrated formula. The card, title, curriculum chips, URL and CSS-drawn checkmark are fully visible with no clipping. No unsupported-font fallback warning appeared during this route test. No earlier preview artifact was used for this verdict.

## Isolation and limits

The new test requests the local development server, not production or paid services. Existing gate fixtures use demo Firebase configuration and mocked image/AI/email callbacks; legacy credentialed auth helpers are excluded. QA does not use real Admin credentials, provider keys, email sends, task changes, merges or deployments.

Production asset tracing/deployment and platform-specific social cache refresh remain separate release/live checks. Publication is pending the parent's review and GitHub/release process.
