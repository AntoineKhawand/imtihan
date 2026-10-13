# Harvey outreach integration

Imtihan adapts the deterministic content checks from [Harvey](https://github.com/ethanplusai/harvey), pinned to commit `822e84e7c7ec665b781a92cd290a679e9166992d`. The MIT license is reproduced in `THIRD_PARTY_NOTICES.md`. This is an adaptation, not an installation of Harvey's Python runtime.

## Admin workflow

In Admin → Email, choose Outreach assistant. Enter an audience, language and verified public context. OpenAI generates three short drafts (75/75/40 word limits). Review one draft, edit it and check the review acknowledgement. Choose existing teacher accounts and explicitly send the current message. Editing the message clears the acknowledgement. Each send is limited to 25 unique accounts, with content checks repeated on the server before recipient lookups. Draft generation is limited atomically to 20 attempts per admin per UTC day. Drafts are temporary browser state and are lost on navigation/reload; there is no persistent outbox or delivery schedule.

The server checks blank/long subjects, newline injection, unresolved placeholders, excessive words/links, HTML and Harvey's banned English sales phrases. The English phrase list does not certify French copy or factual accuracy; human review is required in both languages. Plain-text content is HTML-escaped for the existing Brevo renderer. Brevo still applies suppression checks, the configured postal address and signed unsubscribe footer. Provider acceptance is not proof of delivery.

## Hosting and scope

Harvey itself requires Python, a persistent SQLite database, a continuously running process, Claude Code subscription login and a configured mailbox. These do not run inside Imtihan's serverless Next.js routes. Imtihan uses its existing server OpenAI adapter and Brevo service. No extra subscription credentials are installed or shared.

This integration does not discover schools, enrich contacts, verify prospect deliverability, read mailboxes, classify replies, stop follow-ups on reply, book meetings, or send automatically. Existing teacher account email addresses are not labeled verified prospects. Optional follow-up drafts are suggestions only and must be manually reviewed against the conversation before sending. No outreach messages are sent as part of implementation or QA.

Running the full Harvey agent would require a separate operator service and authorized mailbox/discovery setup. Keep that deployment separate from the public exam generator. Existing daily blog/marketing schedules are unaffected by this feature. Missing production marketing configuration continues to block promotional sends.
