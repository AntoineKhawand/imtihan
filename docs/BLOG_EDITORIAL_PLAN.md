# Blog generation and keyword targeting

The daily blog handler now uses English/French keyword briefs rather than asking for viral educational trends. Seeds include the reported query “IB test maker”, Lebanese/French Bac exam creation, physics/chemistry assessments, uploading PDFs, and answer-key exports. These are editorial hypotheses, not live keyword-volume or Search Console integrations.

The last 60 posts inform topic selection and are supplied to the model to discourage repeated angles. Keyword clusters rotate, with less-used clusters preferred. Persisted primary/related keywords and language allow subsequent runs to balance coverage. Near-duplicate title overlap is rejected; this does not detect all semantic duplicates.

Each brief requests a direct answer, worked teaching example, reusable prompt, steps, common mistakes, teacher checklist, contextual internal links, and three FAQs compatible with the existing FAQ renderer. The target is about 900–1300 words; the 700-word validation floor is a thin-content check, not a ranking claim. Keywords must appear naturally in the title, meta description and opening. The model receives verified product limitations and instructions against invented claims, citations, trends and official compliance.

Zod validates model fields before any write. Incomplete structure, missing keyword placement/links/FAQs, short content and near-duplicate titles return HTTP 422 without publishing. Read time is calculated from the article. Structural validation is not factual verification or a guarantee of useful writing; editorial review and performance measurement remain necessary.

The existing Vercel schedule is unchanged: 09:00 UTC daily. This change does not establish why past scheduled runs stopped, verify the deployed CRON_SECRET, or introduce run-history monitoring. No production AI generation or Firestore writes were performed during implementation. Tests mock both services.

Next editorial decisions should use actual Search Console queries, impressions and clicks to revise these briefs. Improve existing overlapping posts before publishing more articles targeting the same intent. Do not add keyword stuffing or mechanically generate one page per minor keyword variation. See [Google's people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
