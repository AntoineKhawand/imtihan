# Architecture — Imtihan

Technical rationale behind every major decision.

---

## Request Lifecycle

### Step 1 → /api/analyze

```
Teacher writes description + uploads file
            ↓
Client sends POST /api/analyze
  { description: string, documentBase64?: string, documentMimeType?: string }
            ↓
Server builds Claude messages:
  - System: inject curriculum reference (all IDs)
  - User: teacher description + optional PDF/image block
            ↓
Claude Sonnet 4.5 returns JSON (ExamContext)
            ↓
Zod validates schema + auto-corrects difficultyMix sum
            ↓
Returns { success: true, context: ExamContext }
            ↓
Client stores in sessionStorage, navigates to /create/confirm
```

### Step 4 → /api/generate

```
Client sends POST /api/generate
  { context: ExamContext, templateId: string }
            ↓
Server builds system prompt:
  - Curriculum chapter details (objectives)
  - Language instructions (fr/en/ar conventions)
  - Curriculum style (Bac vs IB formatting)
  - Difficulty guide
            ↓
Claude Sonnet 4.5 streams JSON array of exercises
            ↓
Server pipes SSE stream to client
  → Client renders exercises as they arrive
  → On message_stop: parse, validate, signal done
```

---

## AI Grounding & RAG Strategy

To ensure generated content is accurate and curriculum-aligned, we employ a Retrieval-Augmented Generation (RAG) strategy.

### v1 (MVP): Direct Context Injection

The current implementation uses a simple form of RAG. In the `/api/analyze` step, any uploaded document (PDF, DOCX) is sent directly to Gemini along with the user's text prompt.

```
User Prompt + Base64 Encoded Document → Gemini API → Structured ExamContext
```

**Pros:** Simple to implement, effective for single-document analysis.
**Cons:** Not scalable to multiple documents, inefficient, and limited by the model's context window. Uploaded files are not persisted.

### v1.1+ (Future): Vector Database RAG

The long-term vision is to implement a full RAG pipeline using a vector database (e.g., Firebase Vector Search, Pinecone).

1.  **Indexing:** All official curriculum documents and teacher-uploaded materials will be chunked, vectorized, and stored in a vector database.
2.  **Retrieval:** When a user makes a request, their prompt is used to search the vector database for the most relevant document chunks.
3.  **Augmentation:** These retrieved chunks are then injected into the prompt sent to Gemini, providing highly relevant, targeted context.

This approach is more scalable, faster at runtime, and allows for grounding across a vast library of trusted sources, perfectly aligning with the project's goal of accuracy.

**Note:** The primary materials for this RAG pipeline, especially for the "University" curriculum, should be sourced according to the guide in `docs/DATA_SOURCING.md`.

---

## Data Flow — State Management

The workflow uses **sessionStorage** for cross-page state during the 5-step flow. This avoids the complexity of a global state manager for MVP.

```
Step 1 → sessionStorage.set("imtihan_context", JSON)
Step 2 → reads + updates context, writes back
Step 3 → reads + updates, writes back
Step 4 → reads final context, calls /api/generate
Step 5 → saves Exam to Firestore, clears sessionStorage
```

After export, the exam is saved to Firestore under `users/{uid}/exams/{examId}`.

**v2 consideration:** When we add collaborative features or multi-device sync, this becomes a proper server-side session. For MVP, sessionStorage is fine — teachers don't close mid-flow.

---

## Firestore Schema (detailed)

```
users/{uid}
  email: string
  displayName: string
  role: "school_teacher" | "university_teacher" | "tutor"
  school: string?
  country: string (default "LB")
  createdAt: Timestamp
  examsGenerated: number
  subscription: {
    status: "active" | "trialing" | "past_due" | "canceled" | "none"
    tier: "free" | "individual" | "school"
    stripeCustomerId: string?
    renewsAt: Timestamp?
  }

users/{uid}/exams/{examId}
  title: string
  context: ExamContext (full object)
  exercises: Exercise[]
  header: { schoolName?, className?, teacherName?, date? }
  versionB: Exercise[]?   ← null if Version B not generated
  templateId: string
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
```

### Firestore Rules Logic

```javascript
// User can only read/write their own data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;

  match /exams/{examId} {
    allow read, write: if request.auth.uid == userId;
  }
}
```

---

## Document Generation

### Word (.docx)

Generated server-side using the `docx` npm package. Structure:
1. Template selection (4 predefined templates)
2. Map `Exercise[]` to docx Paragraphs, Tables (for sub-questions), TextRuns
3. Apply template styles (fonts, borders, spacing)
4. LaTeX in exam → rendered as MathType-compatible fields
5. Return as Buffer → sent as download

**Note on LaTeX:** The `docx` library doesn't natively render LaTeX. In v1, math expressions are written in Unicode approximations (acceptable for most use cases). In v2, we can integrate `mathjax-node` to pre-render to SVG then embed as images.

### PDF (@react-pdf/renderer)

Rendered on the server via a React component tree. Advantages:
- Single React codebase for both web preview and PDF
- Font embedding works reliably
- No headless browser required (unlike puppeteer)

Math in PDF: same Unicode approximation approach as Word in MVP. Full LaTeX rendering in v2.

---

## AI Prompt Versioning

Each prompt function in `src/lib/prompts/` follows this convention:

```typescript
// BAD — inline prompt, unversioned
const response = await claude.messages.create({
  messages: [{ role: "user", content: `Generate an exam about ${subject}` }]
})

// GOOD — named, versioned, testable
import { buildGenerateSystemPrompt, buildGenerateUserPrompt } from "@/lib/prompts/generate";
const systemPrompt = buildGenerateSystemPrompt(context);  // v1 — deterministic
const userPrompt = buildGenerateUserPrompt(context);
```

When a prompt is changed, add a comment `// v2 — reason for change` and test against golden examples.

---

## Free Tier Enforcement

The 2-exam free limit is enforced **server-side** in `/api/generate`:

```typescript // v2 - updated free exam limit
const uid = await verifyIdToken(request);  // Firebase Admin
const userDoc = await adminDb.doc(`users/${uid}`).get();
const { examsGenerated, subscription } = userDoc.data();

if (subscription.tier === "free" && examsGenerated >= FREE_EXAM_LIMIT) {
  return NextResponse.json({ error: "quota_exceeded" }, { status: 402 });
}

// ... generate ...

await adminDb.doc(`users/${uid}`).update({
  examsGenerated: FieldValue.increment(1)
});
```

Never trust the client for quota enforcement.

---

## Streaming Architecture

The `/api/generate` endpoint uses **Server-Sent Events (SSE)** to stream exercises as Claude generates them:

```
Server: data: {"chunk": "[\n  {\n    \"id\": \"ex_abc\",\n"}\n\n
Server: data: {"chunk": "    \"statement\": \"Calculer...\","}\n\n
...
Server: data: {"done": true, "exercises": [...]}\n\n
```

Client-side, the `/create/generate` page listens to this stream:
```typescript
const eventSource = new EventSource("/api/generate-stream?id=...");
eventSource.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (data.done) {
    setExercises(data.exercises);
    eventSource.close();
  }
};
```

Advantage: teacher sees exercises appear one by one — feels fast and magical — rather than waiting 30 seconds for a spinner.

---

## Security Considerations

1. **API keys** — never exposed to client. `ANTHROPIC_API_KEY` is server-only (no `NEXT_PUBLIC_` prefix).
2. **Firebase Admin** — imported only in route handlers. Build will fail if accidentally imported in client components.
3. **Quota enforcement** — server-side only. Client UI reflects quota status but is not the authority.
4. **File uploads** — base64-encoded and sent in the API request body. Max 10MB enforced both client and server. Files are not stored — they're passed directly to Claude for analysis.
5. **Zod validation** — every incoming request and every AI response is validated. Malformed Claude output shows a graceful error, not a 500.
6. **Auth on all app routes** — middleware will redirect unauthenticated users to `/auth/login` for any route under `/(app)/`.

---

## Performance Notes

- **Cold starts:** Vercel serverless functions have ~200ms cold starts. The `/api/generate` route is the hot path — watch for cold start impact on streaming latency.
- **Curriculum data:** Static JSON, imported at build time. Zero DB lookups for chapter/objective data.
- **Image optimization:** Next.js `<Image>` for any uploaded images. Firebase Storage serves with CDN.
- **Font loading:** Google Fonts loaded with `display=swap`. Fraunces is a variable font, so a single file handles all weights.
