# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-flows.spec.ts >> Performance Tests >> page load time under 3 seconds
- Location: e2e\user-flows.spec.ts:246:7

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 3000
Received:   4066
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - link "إ Imtihan" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]: إ
        - generic [ref=e7]: Imtihan
      - generic [ref=e8]:
        - link "How it works" [ref=e9] [cursor=pointer]:
          - /url: "#how"
        - link "Subjects" [ref=e10] [cursor=pointer]:
          - /url: "#subjects"
        - link "Reviews" [ref=e11] [cursor=pointer]:
          - /url: "#testimonials"
        - link "Pricing" [ref=e12] [cursor=pointer]:
          - /url: "#pricing"
      - generic [ref=e13]:
        - link "Sign in" [ref=e14] [cursor=pointer]:
          - /url: /auth/login
        - link "Try free" [ref=e15] [cursor=pointer]:
          - /url: /create
          - text: Try free
          - img [ref=e16]
    - generic [ref=e19]:
      - generic [ref=e20]:
        - generic "2 free exams — no credit card required" [ref=e21]:
          - img [ref=e22]
          - generic [ref=e24]: 2 free exams — no credit card required
          - img [ref=e25]
        - heading "The exam you imagined, built in minutes." [level=1] [ref=e27]:
          - text: The exam you imagined,
          - text: built in minutes.
      - paragraph [ref=e28]: Describe what you need in plain language. Imtihan generates a complete, curriculum-aligned exam with detailed solutions in seconds.
      - paragraph [ref=e29]: Supports Bac Libanais · Bac Français · IB · University courses.
      - generic [ref=e30]:
        - link "Create your first exam" [ref=e31] [cursor=pointer]:
          - /url: /create
          - text: Create your first exam
          - img [ref=e32]
        - link "See how it works" [ref=e34] [cursor=pointer]:
          - /url: "#how"
      - generic [ref=e35]:
        - generic [ref=e37]:
          - term [ref=e38]: "4"
          - definition [ref=e39]: Curricula
          - definition [ref=e40]: Bac Libanais · Bac Français · IB · Université
        - generic [ref=e42]:
          - term [ref=e43]: "32"
          - definition [ref=e44]: Subjects
          - definition [ref=e45]: Sciences · Humanités · Langues · Gestion
        - generic [ref=e47]:
          - term [ref=e48]: "3"
          - definition [ref=e49]: Languages
          - definition [ref=e50]: Français · English · العربية
        - generic [ref=e52]:
          - term [ref=e53]: ∞
          - definition [ref=e54]: Exercises
          - definition [ref=e55]: Each one verified & unique
    - generic [ref=e57]:
      - generic [ref=e58]:
        - generic [ref=e59]:
          - paragraph [ref=e60]: How it works
          - heading "From description to printed exam" [level=2] [ref=e61]:
            - text: From description
            - text: to printed exam
        - link "Try it now" [ref=e62] [cursor=pointer]:
          - /url: /create
          - text: Try it now
          - img [ref=e63]
      - generic [ref=e65]:
        - generic [ref=e68]:
          - generic [ref=e69]:
            - img [ref=e71]
            - generic [ref=e73]: "01"
          - heading "Describe in plain language" [level=3] [ref=e74]
          - paragraph [ref=e75]: Type what you need — curriculum, level, subject, chapters, duration. Or just upload your course notes and let Imtihan read them.
        - generic [ref=e78]:
          - generic [ref=e79]:
            - img [ref=e81]
            - generic [ref=e82]: "02"
          - heading "Review & fine-tune" [level=3] [ref=e83]
          - paragraph [ref=e84]: Confirm the detected context, adjust the difficulty mix, choose your exam structure and template. Full control, no forms to dig through.
        - generic [ref=e87]:
          - generic [ref=e88]:
            - img [ref=e90]
            - generic [ref=e92]: "03"
          - heading "Generate in seconds" [level=3] [ref=e93]
          - paragraph [ref=e94]: Imtihan writes every exercise and its full corrigé — with methodology, not just the final answer. Watch it stream live.
        - generic [ref=e96]:
          - generic [ref=e97]:
            - img [ref=e99]
            - generic [ref=e102]: "04"
          - heading "Export & teach" [level=3] [ref=e103]
          - paragraph [ref=e104]: Download a polished Word or PDF with your school header. Ready to print in one click.
    - generic [ref=e106]:
      - generic [ref=e107]:
        - paragraph [ref=e108]: See it in action
        - heading "One sentence. A complete exam." [level=2] [ref=e109]:
          - text: One sentence.
          - text: A complete exam.
      - generic [ref=e110]:
        - generic [ref=e116]: imtihan.live/create
        - generic [ref=e117]:
          - generic [ref=e118]:
            - generic [ref=e119]: Examen de Philosophie pour Terminale L Bac Libanais, chapitres éthique et épistémologie, 2 exercices, 1h30, en français
            - generic [ref=e120]: T
          - generic [ref=e121]:
            - generic [ref=e123]: إ
            - generic [ref=e124]:
              - paragraph [ref=e125]: Exam context identified
              - generic [ref=e126]:
                - generic [ref=e127]:
                  - generic [ref=e128]: Curriculum
                  - generic [ref=e129]: Bac Libanais
                - generic [ref=e130]:
                  - generic [ref=e131]: Level
                  - generic [ref=e132]: Terminale L
                - generic [ref=e133]:
                  - generic [ref=e134]: Subject
                  - generic [ref=e135]: Philosophie
                - generic [ref=e136]:
                  - generic [ref=e137]: Language
                  - generic [ref=e138]: Français
                - generic [ref=e139]:
                  - generic [ref=e140]: Duration
                  - generic [ref=e141]: 1h 30
                - generic [ref=e142]:
                  - generic [ref=e143]: Exercises
                  - generic [ref=e144]: "2"
              - generic [ref=e145]:
                - img [ref=e147]
                - generic [ref=e149]: High confidence · Generating exam…
          - generic [ref=e150]:
            - img [ref=e152]
            - generic [ref=e155]:
              - generic [ref=e157]: Exercice 1 — Éthique et liberté
              - generic [ref=e158]: 8 pts · Moyen
    - generic [ref=e164]:
      - generic [ref=e165]:
        - paragraph [ref=e166]: What you can generate
        - heading "Every subject. Every curriculum." [level=2] [ref=e167]:
          - text: Every subject.
          - text: Every curriculum.
      - generic [ref=e168]:
        - generic [ref=e169]:
          - generic [ref=e170]:
            - img [ref=e172]
            - generic [ref=e174]: Sciences
          - generic [ref=e175]:
            - generic [ref=e176]: Mathématiques
            - generic [ref=e177]: Physique
            - generic [ref=e178]: Chimie
            - generic [ref=e179]: Biologie
            - generic [ref=e180]: SVT
            - generic [ref=e181]: Informatique
            - generic [ref=e182]: NSI
            - generic [ref=e183]: Environnement
        - generic [ref=e184]:
          - generic [ref=e185]:
            - img [ref=e187]
            - generic [ref=e190]: Humanités & Langues
          - generic [ref=e191]:
            - generic [ref=e192]: Histoire-Géo
            - generic [ref=e193]: Philosophie
            - generic [ref=e194]: Arabe
            - generic [ref=e195]: Français
            - generic [ref=e196]: Anglais
            - generic [ref=e197]: Espagnol
            - generic [ref=e198]: Allemand
        - generic [ref=e199]:
          - generic [ref=e200]:
            - img [ref=e202]
            - generic [ref=e205]: Sciences sociales
          - generic [ref=e206]:
            - generic [ref=e207]: Économie
            - generic [ref=e208]: SES
            - generic [ref=e209]: Psychologie
            - generic [ref=e210]: Sociologie
            - generic [ref=e211]: Droit
            - generic [ref=e212]: Politique mondiale
        - generic [ref=e213]:
          - generic [ref=e214]:
            - img [ref=e216]
            - generic [ref=e219]: Université & Gestion
          - generic [ref=e220]:
            - generic [ref=e221]: Comptabilité
            - generic [ref=e222]: Management
            - generic [ref=e223]: Commerce
            - generic [ref=e224]: Médecine
            - generic [ref=e225]: Ingénierie
            - generic [ref=e226]: Architecture
    - generic [ref=e228]:
      - generic [ref=e229]:
        - paragraph [ref=e230]: Why Imtihan
        - heading "Built for how Lebanese teachers actually work" [level=2] [ref=e231]:
          - text: Built for how Lebanese
          - text: teachers actually work
      - generic [ref=e232]:
        - generic [ref=e233]:
          - img [ref=e235]
          - heading "Describe, don't click through forms" [level=3] [ref=e237]
          - paragraph [ref=e238]: Write what you want in plain language. Upload your course notes. Imtihan reads both and builds your exam automatically.
        - generic [ref=e239]:
          - img [ref=e241]
          - heading "32 subjects across all curricula" [level=3] [ref=e243]
          - paragraph [ref=e244]: Sciences, humanities, languages, economics, philosophy — every subject from Bac Libanais, Bac Français, IB, and University is covered. No hallucinated content outside your syllabus.
        - generic [ref=e245]:
          - img [ref=e247]
          - heading "French, English & Arabic" [level=3] [ref=e252]
          - paragraph [ref=e253]: The exam language follows the course. Physics in French for Terminale S, Economics in English for IB, Arabic grammar for Bac Libanais Littéraire. All three handled natively.
        - generic [ref=e254]:
          - img [ref=e256]
          - heading "Corrigé with full methodology" [level=3] [ref=e258]
          - paragraph [ref=e259]: Not just the final answer — every step, every formula, every common student mistake flagged. Grading is part of teaching.
    - generic [ref=e261]:
      - generic [ref=e262]:
        - paragraph [ref=e263]: Supported curricula
        - heading "One tool for every school in Lebanon" [level=3] [ref=e264]:
          - text: One tool for every
          - text: school in Lebanon
      - generic [ref=e265]:
        - generic [ref=e266]:
          - paragraph [ref=e267]: Bac Libanais
          - paragraph [ref=e268]: EB9 → Terminale · 3 tracks
        - generic [ref=e269]:
          - paragraph [ref=e270]: Bac Français
          - paragraph [ref=e271]: Seconde → Terminale
        - generic [ref=e272]:
          - paragraph [ref=e273]: IB Diploma
          - paragraph [ref=e274]: MYP5 · DP SL / HL
        - generic [ref=e275]:
          - paragraph [ref=e276]: Université
          - paragraph [ref=e277]: L1 → M2 · All majors
    - generic [ref=e279]:
      - paragraph [ref=e280]: What teachers say
      - generic [ref=e281]:
        - generic [ref=e282]:
          - generic [ref=e283]:
            - generic [ref=e284]:
              - img [ref=e285]
              - img [ref=e287]
              - img [ref=e289]
              - img [ref=e291]
              - img [ref=e293]
            - paragraph [ref=e295]: “J'ai généré un contrôle complet de physique Terminale en 4 minutes. Le corrigé était aussi bon que ce que j'aurais écrit moi-même.”
          - generic [ref=e296]:
            - paragraph [ref=e297]: Professeur de Physique
            - paragraph [ref=e298]: Lycée français de Beyrouth
        - generic [ref=e299]:
          - generic [ref=e300]:
            - generic [ref=e301]:
              - img [ref=e302]
              - img [ref=e304]
              - img [ref=e306]
              - img [ref=e308]
              - img [ref=e310]
            - paragraph [ref=e312]: “The Version A/B feature is exactly what I needed. My students can't share answers between sections anymore.”
          - generic [ref=e313]:
            - paragraph [ref=e314]: Math Teacher
            - paragraph [ref=e315]: International College, Beirut
        - generic [ref=e316]:
          - generic [ref=e317]:
            - generic [ref=e318]:
              - img [ref=e319]
              - img [ref=e321]
              - img [ref=e323]
              - img [ref=e325]
              - img [ref=e327]
            - paragraph [ref=e329]: “أخيراً أداة تفهم المنهج اللبناني بشكل صحيح. الأسئلة دقيقة ومطابقة للمستوى.”
          - generic [ref=e330]:
            - paragraph [ref=e331]: أستاذ رياضيات
            - paragraph [ref=e332]: المدرسة الإنجيلية اللبنانية
    - generic [ref=e334]:
      - generic [ref=e335]:
        - paragraph [ref=e336]: Pricing
        - heading "Start free, upgrade when you're convinced" [level=2] [ref=e337]
        - paragraph [ref=e338]: Simple pricing for individuals. For school-wide licenses, get in touch.
      - generic [ref=e339]:
        - generic [ref=e340]:
          - paragraph [ref=e341]: Free
          - generic [ref=e342]: 2 Free
          - paragraph [ref=e343]: 2 exams to try everything
          - list [ref=e344]:
            - listitem [ref=e345]:
              - generic [ref=e346]: ✓
              - text: 2 complete exams + corrigés
            - listitem [ref=e347]:
              - generic [ref=e348]: ✓
              - text: All curricula & subjects
            - listitem [ref=e349]:
              - generic [ref=e350]: ✓
              - text: Word + PDF export
            - listitem [ref=e351]:
              - generic [ref=e352]: ✓
              - text: Version A/B generation
          - link "Get started free" [ref=e353] [cursor=pointer]:
            - /url: /create
        - generic [ref=e354]:
          - generic [ref=e355]: Most popular
          - paragraph [ref=e356]: Pro
          - generic [ref=e357]: $5/mo
          - paragraph [ref=e358]: Unlimited exams for one teacher
          - list [ref=e359]:
            - listitem [ref=e360]:
              - generic [ref=e361]: ✓
              - text: Unlimited exams + corrigés
            - listitem [ref=e362]:
              - generic [ref=e363]: ✓
              - text: All curricula & subjects
            - listitem [ref=e364]:
              - generic [ref=e365]: ✓
              - text: Exam library — saved forever
            - listitem [ref=e366]:
              - generic [ref=e367]: ✓
              - text: Priority AI generation
            - listitem [ref=e368]:
              - generic [ref=e369]: ✓
              - text: Email delivery
            - listitem [ref=e370]:
              - generic [ref=e371]: ✓
              - text: Early access to new features
          - link "Upgrade to Pro" [ref=e372] [cursor=pointer]:
            - /url: /create
            - text: Upgrade to Pro
            - img [ref=e373]
        - generic [ref=e375]:
          - paragraph [ref=e376]: Schools
          - generic [ref=e377]: Custom
          - paragraph [ref=e378]: For departments and institutions
          - list [ref=e379]:
            - listitem [ref=e380]:
              - generic [ref=e381]: ✓
              - text: Everything in Pro
            - listitem [ref=e382]:
              - generic [ref=e383]: ✓
              - text: Centralized billing
            - listitem [ref=e384]:
              - generic [ref=e385]: ✓
              - text: Multiple teacher accounts
            - listitem [ref=e386]:
              - generic [ref=e387]: ✓
              - text: Shared question bank (v2)
            - listitem [ref=e388]:
              - generic [ref=e389]: ✓
              - text: Dedicated support
          - link "Contact sales" [ref=e390] [cursor=pointer]:
            - /url: /contact
    - generic [ref=e392]:
      - generic [ref=e393]:
        - paragraph [ref=e394]: Frequently Asked Questions
        - heading "Everything you need to know" [level=2] [ref=e395]
      - generic [ref=e396]:
        - generic [ref=e397]:
          - heading "Which curricula are supported?" [level=3] [ref=e398]
          - paragraph [ref=e399]: Imtihan is designed specifically for the Lebanese Baccalaureate (EB9 to Terminale), the French Baccalaureate (Seconde to Terminale), the International Baccalaureate (IB), as well as university courses.
        - generic [ref=e400]:
          - heading "Is the grading key (corrigé) included?" [level=3] [ref=e401]
          - paragraph [ref=e402]: Yes. For every generated exam, Imtihan produces a detailed grading key. This includes not just the final answer, but a step-by-step methodology.
        - generic [ref=e403]:
          - heading "How long does it take to generate an exam?" [level=3] [ref=e404]
          - paragraph [ref=e405]: Thanks to our AI engine, generating a complete exam (3 to 4 exercises) and its grading key usually takes under 30 seconds.
        - generic [ref=e406]:
          - heading "Can I export the exam for printing?" [level=3] [ref=e407]
          - paragraph [ref=e408]: Yes, all exams and grading keys can be exported as PDFs or Word documents (.docx), ready to be distributed to your students.
        - generic [ref=e409]:
          - heading "Is it free?" [level=3] [ref=e410]
          - paragraph [ref=e411]: You can generate your first 2 complete exams for free (no credit card required). After that, the Pro subscription unlocks unlimited generation.
    - contentinfo [ref=e412]:
      - generic [ref=e413]:
        - generic [ref=e414]:
          - generic [ref=e416]: إ
          - generic [ref=e417]: Imtihan
        - paragraph [ref=e418]: Made for Lebanese teachers · © 2026 Imtihan
        - generic [ref=e419]:
          - link "Privacy" [ref=e420] [cursor=pointer]:
            - /url: /privacy
          - link "Terms" [ref=e421] [cursor=pointer]:
            - /url: /terms
          - link "Contact" [ref=e422] [cursor=pointer]:
            - /url: /contact
  - button "Open Next.js Dev Tools" [ref=e428] [cursor=pointer]:
    - img [ref=e429]
```

# Test source

```ts
  153 |   test("navigation header works", async ({ page }) => {
  154 |     await page.goto(BASE_URL);
  155 |     
  156 |     const navLinks = page.locator("nav a, header a");
  157 |     const count = await navLinks.count();
  158 |     expect(count).toBeGreaterThan(0);
  159 |   });
  160 | 
  161 |   test("footer has required links", async ({ page }) => {
  162 |     await page.goto(BASE_URL);
  163 |     
  164 |     const footer = page.locator("footer");
  165 |     await expect(footer).toBeVisible();
  166 |   });
  167 | 
  168 |   test("dark mode toggle if exists", async ({ page }) => {
  169 |     await page.goto(BASE_URL);
  170 |     
  171 |     const darkModeButton = page.locator('button[aria-label*="Dark"], button[aria-label*="Theme"]');
  172 |     if (await darkModeButton.isVisible()) {
  173 |       await darkModeButton.click();
  174 |       await page.waitForTimeout(500);
  175 |     }
  176 |   });
  177 | 
  178 |   test("responsive sidebar navigation", async ({ page }) => {
  179 |     await page.setViewportSize({ width: 375, height: 667 });
  180 |     await page.goto(BASE_URL);
  181 |     await page.waitForLoadState("networkidle");
  182 |     await expect(page.locator("body")).toBeVisible();
  183 |   });
  184 | 
  185 |   test("error handling - 404 page", async ({ page }) => {
  186 |     const response = await page.request.get(BASE_URL + "/nonexistent-page-12345");
  187 |     expect(response.status()).toBeGreaterThanOrEqual(404);
  188 |   });
  189 | });
  190 | 
  191 | test.describe("Accessibility Deep Tests", () => {
  192 |   test("all images have alt text", async ({ page }) => {
  193 |     await page.goto(BASE_URL);
  194 |     
  195 |     const images = page.locator("img");
  196 |     const count = await images.count();
  197 |     
  198 |     for (let i = 0; i < count; i++) {
  199 |       const alt = await images.nth(i).getAttribute("alt");
  200 |       if (alt === null) {
  201 |         const src = await images.nth(i).getAttribute("src");
  202 |         console.log("Image without alt:", src);
  203 |       }
  204 |     }
  205 |   });
  206 | 
  207 |   test("form inputs have labels", async ({ page }) => {
  208 |     await page.goto(BASE_URL + "/auth/login");
  209 |     
  210 |     const inputs = page.locator("input:not([type='hidden'])");
  211 |     const count = await inputs.count();
  212 |     
  213 |     for (let i = 0; i < count; i++) {
  214 |       const label = await inputs.nth(i).getAttribute("aria-label");
  215 |       const labelled = await inputs.nth(i).getAttribute("aria-labelledby");
  216 |       const labelEl = await inputs.nth(i).locator("..").locator("label").count();
  217 |       
  218 |       if (!label && !labelled && labelEl === 0) {
  219 |         const name = await inputs.nth(i).getAttribute("name");
  220 |         console.log("Input without label:", name);
  221 |       }
  222 |     }
  223 |   });
  224 | 
  225 |   test("proper heading hierarchy", async ({ page }) => {
  226 |     await page.goto(BASE_URL);
  227 |     
  228 |     const h1 = page.locator("h1");
  229 |     const h2 = page.locator("h2");
  230 |     
  231 |     expect(await h1.count()).toBeGreaterThan(0);
  232 |   });
  233 | 
  234 |   test("focusable elements are keyboard accessible", async ({ page }) => {
  235 |     await page.goto(BASE_URL);
  236 |     
  237 |     await page.keyboard.press("Tab");
  238 |     await page.waitForTimeout(100);
  239 |     
  240 |     const focused = page.locator(":focus");
  241 |     await expect(focused).toBeVisible();
  242 |   });
  243 | });
  244 | 
  245 | test.describe("Performance Tests", () => {
  246 |   test("page load time under 3 seconds", async ({ page }) => {
  247 |     const start = Date.now();
  248 |     await page.goto(BASE_URL);
  249 |     await page.waitForLoadState("domcontentloaded");
  250 |     const loadTime = Date.now() - start;
  251 |     
  252 |     console.log("Page load time:", loadTime, "ms");
> 253 |     expect(loadTime).toBeLessThan(3000);
      |                      ^ Error: expect(received).toBeLessThan(expected)
  254 |   });
  255 | 
  256 |   test("no memory leaks from navigation", async ({ page }) => {
  257 |     await page.goto(BASE_URL);
  258 |     await page.waitForLoadState("networkidle");
  259 |     
  260 |     for (let i = 0; i < 3; i++) {
  261 |       await page.goto(BASE_URL + "/pricing");
  262 |       await page.waitForLoadState("networkidle");
  263 |       await page.goto(BASE_URL);
  264 |       await page.waitForLoadState("networkidle");
  265 |     }
  266 |     
  267 |     expect(true).toBe(true);
  268 |   });
  269 | });
```