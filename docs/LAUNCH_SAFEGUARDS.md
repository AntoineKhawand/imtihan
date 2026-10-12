# Reel audit and launch safeguards — October 12, 2026

Source: https://www.instagram.com/reel/DdyqycEINNe/
The accessible reel caption enumerates six legal-risk themes. Its penalty amounts and universal statements are not used as product requirements. These technical controls are not a legal compliance certification.

## Applied controls

| Theme | Finding and action |
| --- | --- |
| Age | Terms already require 18+. Explicit unchecked confirmation now blocks password signup and Google authentication (which can silently create an account from the login page). The separate student signup also requires it. No DOB collected. Profile writes record the confirmation timestamp. Existing password sign-in remains available. This is self-attestation, not verified age; direct Firebase client account creation is not a server-enforced age verification system. |
| Fonts | Fraunces uses next/font/google: downloaded at build time and served locally. Geist is local. Removed Google Fonts stylesheet/font origins from both CSP definitions. Google authentication/API origins remain required. |
| Replay and analytics | No Hotjar, Clarity, PostHog or other replay integration found. GA, Plausible and Vercel Analytics now load only after explicit acceptance. Rejection is equally prominent. Privacy choices reopen the controls; withdrawal removes GA cookies and reloads to stop loaded scripts. Events are neither sent nor queued before acceptance. Privacy wording now reflects the implementation. |
| Promotional email | Every send must declare marketing or transactional purpose. Central marketing delivery checks server-only marketing_preferences/{SHA256(normalizedEmail)}. Suppression affects newsletter, promotional welcome/backfill, activation/engagement followups, checklist/backfill, renewal promotion and admin custom/newsletter sends. A signed link plus one-click headers and an escaped physical address are added centrally. GET only displays confirmation; POST saves the opt-out without login. Requested exam and upgrade-instruction emails remain transactional. Missing config/store failures block promotional delivery. Mail cron authentication fails closed when CRON_SECRET is absent. |
| Billing | Stripe endpoint is disabled; actual upgrades use manual payment instructions. Beside the action, show total for selected period, no immediate charge, expiry and no recurring renewal. No auto-renewal system or cancellation flow invented. |
| Uploads/copyright | Step 1 states upload-rights, student-data removal and AI processing requirements. /copyright provides a report contact and explains the information required. Terms link it and allow restriction for repeat infringement. This does not assert registered DMCA-agent status or safe-harbor eligibility. |

## Owner setup still required

1. **Business mail address:** use a real business location or legitimate registered mailbox where business mail can be received. Do not invent a street address or silently expose the founder's home. Confirm suitability for the jurisdictions served. Set `MARKETING_POSTAL_ADDRESS` in Vercel production/preview; multiline supported. Promotional delivery remains paused until configured. The requested lead-magnet email is classified as promotional because its template markets the service; its retries are also paused until configuration.
2. **Unsubscribe signing:** set a stable random `MARKETING_UNSUBSCRIBE_SECRET` of at least 32 characters. Existing `CRON_SECRET` is a fallback if at least 32 characters. No secret values should enter Git. Keep the key stable: replacing it invalidates old signed links. Suppression entries persist; re-subscribing does not silently clear them. There is no mass migration/deletion of existing recipients.
3. **U.S. DMCA agent:** decide with qualified advice whether to seek Section 512 protection for the hosted/shared material. If registering, choose the actual service-provider legal name, physical street address (a P.O. box generally needs an approved waiver), alternate names (Imtihan, imtihan.live) and a reachable agent's contact details. Use the Copyright Office directory, complete registration/payment yourself, publish the registered contact accurately, and renew within three years. The current Office FAQ describes a $6 designation fee. Registration alone is not the whole safe-harbor process; establish notice handling, counter-notice review and repeat-infringer procedures. No fee has been paid and no registration claimed in this change.
4. Check analytics conversion reports with the new consent denominator: visitors declining analytics will not produce GA sign_up/exam_created events. No synthetic conversions are sent to compensate.

## Primary references (checked October 12, 2026)

- FTC COPPA scope: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- FTC commercial email: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- Next installed font documentation: next/font self-hosts assets; no browser Google Fonts requests.
- CNIL analytics/tracers: https://www.cnil.fr/fr/node/677
- Copyright Office Section 512: https://www.copyright.gov/512/
- Agent directory FAQ: https://www.copyright.gov/dmca-directory/faq.html

## Validation

Use mocked Firebase and mocked Brevo fetches for signed-link, scanner-safe GET, POST suppression, missing address, suppressed recipients, preference failures and transactional isolation. Never send real email or use production Admin credentials during tests. UI checking must not create a real account, accept terms for a user, subscribe an address, submit an unsubscribe token or make a payment.
