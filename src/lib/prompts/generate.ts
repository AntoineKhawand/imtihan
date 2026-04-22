import type { ExamContext } from "@/types/exam";
import { buildChaptersSummary } from "@/data/curricula";

// ---------------------------------------------------------------------------
// Language instructions
// ---------------------------------------------------------------------------

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  french: `Write the entire exam in French.
- Use French mathematical and scientific notation (m/s, N, J, mol/L, Ω, etc.).
- Address students formally as "vous".
- Use French typography: guillemets «», no space before colon is wrong — leave one space before : ; ! ?
- Introduce context with "On considère...", "On dispose de...", "On donne :".
- Label given constants/data in a block starting with "Données :" or "On donne :".`,

  english: `Write the entire exam in English.
- Use international SI notation (m s⁻¹, N, J, mol dm⁻³).
- Use "Given:" or "Data:" before providing constants.
- British/international spelling preferred (centre, colour).`,

  arabic: `Write the entire exam in Modern Standard Arabic (MSA/الفصحى).
- All mathematical terms, units, and labels must be in Arabic.
- Use Arabic mathematical command verbs (see below).
- Numbers may be written in Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) or Western (0-9) — be consistent.
- Label given data as "معطيات :" or "المعطيات :".
- Exercise header: "تمرين ١", "تمرين ٢", etc.
- Sub-questions: أ)، ب)، ج) or ١)، ٢)، ٣).
- RTL text: all prose must be fully right-to-left compatible.`,
};

// ---------------------------------------------------------------------------
// Command terms and question vocabulary by curriculum + subject
// ---------------------------------------------------------------------------

const COMMAND_TERMS: Record<string, string> = {
  "bac-libanais-french": `Use authentic Bac Libanais/Bac Français question vocabulary:
CALCULATION / ALGEBRA: "Calculer", "Résoudre", "Développer", "Factoriser", "Simplifier", "Déterminer la valeur de"
PROOF / LOGIC: "Montrer que", "Démontrer que", "Vérifier que", "Justifier", "Prouver"
DERIVATION / ANALYSIS: "Dériver", "Déduire", "En déduire que", "Étudier les variations de", "Étudier le signe de"
DESCRIPTION: "Décrire", "Interpréter", "Expliquer", "Donner la nature de", "Préciser"
GRAPHICAL: "Tracer", "Représenter graphiquement", "Construire", "Lire graphiquement"
DEFINITION: "Définir", "Énoncer", "Rappeler la définition de"
PHYSICS-SPECIFIC: "Donner l'expression littérale de", "Exprimer en fonction de", "Établir l'équation de", "Appliquer la loi de"
CHEMISTRY-SPECIFIC: "Écrire l'équation-bilan de", "Identifier", "Nommer", "Classer", "Équilibrer"`,

  "bac-libanais-arabic": `Use authentic Arabic Bac Libanais question vocabulary:
CALCULATION: "احسب", "أوجد قيمة", "حل المعادلة", "بسّط", "انشر", "حلّل"
PROOF: "أثبت أن", "برهن على أن", "تحقق من", "علّل"
DERIVATION: "اشتق", "استنتج أن", "استنتج من ذلك", "ادرس إشارة", "ادرس تغيرات"
DESCRIPTION: "صف", "فسّر", "اشرح", "بيّن طبيعة"
GRAPHICAL: "ارسم", "مثّل بيانياً", "أنشئ", "اقرأ من المنحنى"
PHYSICS: "أعطِ التعبير الحرفي لـ", "عبّر بدلالة", "طبّق قانون", "أنشئ معادلة حركة"
CHEMISTRY: "اكتب معادلة التفاعل", "سمّ المركب", "صنّف", "وازن"`,

  "bac-francais-french": `Use authentic French Baccalaureate question vocabulary (Éducation nationale):
CALCULATION: "Calculer", "Déterminer", "Résoudre", "Simplifier", "Développer", "Factoriser"
PROOF: "Montrer que", "Démontrer que", "Justifier que", "Vérifier que", "En déduire"
ANALYSIS: "Étudier", "Analyser", "Interpréter", "Discuter de", "Comparer"
LIMITS/CALCULUS: "Calculer la limite de", "Étudier la continuité de", "Déterminer les asymptotes"
GRAPHICAL: "Tracer", "Représenter", "Construire le tableau de variations", "Dresser le tableau de signes"
PHYSICS: "Exprimer", "Établir l'expression de", "Appliquer la relation", "Faire le bilan de"
CHEMISTRY: "Écrire l'équation de la réaction", "Identifier", "Justifier la classification"`,

  "ib-english": `Use IB command terms with their EXACT official definitions (IBO source):

OBJECTIVE 1 — recall (typically 1 mark):
- "State" — Give a specific name, value or other brief answer without explanation or calculation.
- "Define" — Give the precise meaning of a word, phrase or physical quantity.
- "List" — Give a sequence of names or other brief answers with no explanation.
- "Draw" — Represent by means of pencil lines (labelled diagram or graph with axes and scale).
- "Label" — Add labels to a diagram.
- "Measure" — Find a value for a quantity.

OBJECTIVE 2 — understanding/application (2–3 marks):
- "Calculate" — Find a numerical answer showing the relevant stages in the working.
- "Describe" — Give a detailed account.
- "Distinguish" — Give the differences between two or more different items.
- "Estimate" — Find an approximate value for an unknown quantity.
- "Identify" — Find an answer from a given number of possibilities.
- "Outline" — Give a brief account or summary.
- "Annotate" — Add brief notes to a diagram or graph.
- "Apply" — Use an idea, equation, principle, theory or law in a new situation.
- "Sketch" — Represent by means of a graph showing a line and labelled but unscaled axes.

OBJECTIVE 3 — analysis/synthesis (3–6 marks, mainly HL):
- "Analyse" — Interpret data to reach conclusions.
- "Compare" — Give an account of similarities AND differences between two or more items.
- "Construct" — Represent or develop in graphical form.
- "Deduce" — Reach a conclusion from the information given.
- "Derive" — Manipulate a mathematical relationship(s) to give a new equation or relationship.
- "Determine" — Find the only possible answer.
- "Discuss" — Give an account including arguments for and against, where possible.
- "Evaluate" — Assess the implications and limitations.
- "Explain" — Give a detailed account of causes, reasons or mechanisms.
- "Predict" — Give an expected result.
- "Show" / "Show that" — Give the steps in a calculation or derivation; the answer is already provided, demonstrate how to reach it.
- "Solve" — Obtain an answer using algebraic and/or numerical methods.
- "Suggest" — Propose a hypothesis or other possible answer.
- "Hence" — Answer MUST follow from the previous part; alternative method earns zero.
- "Hence or otherwise" — Method from previous part recommended but not required.

MARK SCHEME RULES (MANDATORY for IB — these are non-negotiable):
- Every sub-question ends with its mark in square brackets: [1], [2], [3], [4].
- Mark scheme bullet points use "•" for each separate marking point.
- M1, M2 = method marks (awarded for correct approach even if arithmetic is wrong).
- A1, A2 = answer marks (awarded for the correct final value or statement).
- "ecf" = error carried forward — if a student uses an incorrect earlier value correctly, they still earn the subsequent mark. Write "ecf from (a)" in the scheme.
- "/" between two answers = either is acceptable.
- "Award [3] for correct final answer" = full marks if result is correct without full working.
- "Allow" = alternative phrasing or notation that is also acceptable.`,
};

// ---------------------------------------------------------------------------
// Subject-specific conventions
// ---------------------------------------------------------------------------

const SUBJECT_CONVENTIONS: Record<string, Record<string, string>> = {
  mathematics: {
    "bac-libanais": `MATH FORMAT (Bac Libanais):
- Adapt topics to the specified level (from Collège / EB4-EB9 to Lycée / Terminale).
- For Lycée: Typical structure is 3–4 exercises, 20 points total. Topics: sequences, derivatives, integration, complex numbers, probability.
- For Collège: Fractions, equations, proportionality, basic geometry, Thales/Pythagoras.
Always include a "Données :" block for formulas given. Specify calculator use if applicable.`,

    "bac-francais": `MATH FORMAT (Bac Français):
- Adapt topics to the specified level (from Collège / 5ème-3ème to Lycée / Terminale).
- For Lycée: 3 exercises + possibly a "problème" synthèse, total 20 points. Functions, integration, sequences, probability, 3D geometry.
- For Collège: Arithmetic, literal calculus, proportionality, basic statistics, transformations.
Use "On se place dans un repère orthonormal..." for geometry. Use "On admet que..." when giving a result to use without proof.`,

    ib: `MATH FORMAT (IB Mathematics AA / AI):
SL topics: Algebra, Functions, Trigonometry, Vectors (SL), Statistics, Calculus (basic).
HL topics: All SL + Complex numbers, Proof, Series/sums, Differential equations, Statistics (advanced).
- Paper 1: No GDC (Graphic Display Calculator). Exact answers required ($\\sqrt{2}$, $\\frac{\\pi}{3}$, etc.).
- Paper 2: GDC allowed. Decimal answers acceptable (3 significant figures unless stated).
- Use "Find", not "Calculate", for most math problems.
- "Show that" requires all intermediate algebra — the final line must equal the given answer exactly.
- Vectors: use bold or underline notation: $\\mathbf{a}$ or $\\underline{a}$.
- Always state the domain/range when defining a function.`,
  },

  physics: {
    "bac-libanais": `PHYSICS FORMAT (Bac Libanais):
- Adapt topics to the specified level (from Collège / EB7-EB9 to Lycée / Terminale).
- For Lycée: 3 exercises (Mécanique, Électricité, Optique ou Ondes), 20 points.
- Each exercise opens with a described scenario, then "Données :" listing constants.
- For Collège: Basic mechanics (forces, mass/weight), simple circuits, basic optics.
- Every formula must be stated in literal form before numerical application.
- Use "Donner l'expression littérale de..." before "Calculer la valeur numérique de...".`,

    "bac-francais": `PHYSICS FORMAT (Bac Français):
- Adapt topics to the specified level (from Collège / 5ème-3ème to Lycée / Terminale).
- For Lycée: 3 exercises with thematic labels.
- Each starts with a documentary context (article, experiment description).
- Data table format: "Données : [tableau ou liste]".
- For Collège: Energy sources, simple electrical circuits, light, basic forces.
- Use "Aide :" when providing a hint for a difficult sub-question.
- "Document n°" to reference any provided figure, graph, or table.
- Required: "Faire une application numérique" after every literal expression.`,

    ib: `PHYSICS FORMAT (IB Physics SL/HL):
- Always provide a context (real-world scenario, experimental setup).
- Data given as a clean block: "Data: g = 9.81 m s⁻², c = 3.00 × 10⁸ m s⁻¹, etc."
- IB Physics notation: negative exponents preferred (m s⁻¹ not m/s, J kg⁻¹ not J/kg).
- Every "Calculate" question: show full substitution then answer to 3 significant figures.
- Graphs: label axes with quantity AND unit (e.g. "Force / N", "Time / s").
- HL only: wave-particle duality, nuclear physics extended, electromagnetic induction.
- "State and explain" = 2 separate marking points (State: 1 mark, Explain: 1+ marks).`,
  },

  chemistry: {
    "bac-libanais": `CHEMISTRY FORMAT (Bac Libanais):
- Adapt topics to the specified level (from Collège / EB7-EB9 to Lycée / Terminale).
- For Lycée: 2–3 exercises (Chimie organique, Acido-basicité, Oxydoréduction, Cinétique).
- For Collège: States of matter, atoms/molecules, basic chemical reactions, solutions.
- Every reaction equation must be balanced: "Écrire et équilibrer l'équation-bilan".
- Données : include all Ka, Kb, E°, molar masses needed.
- CHEMICAL FORMULA NOTATION (CRITICAL):
  * Subscripts: write H₂O, CO₂, NaCl, CuSO₄, Ca(OH)₂ — NOT H2O, CO2, CuSO4
  * Charges: write Cu²⁺, SO₄²⁻, Fe³⁺, OH⁻ — NOT Cu+2, SO4-2
  * State symbols: (aq), (s), (l), (g) — always in parentheses
  * Coefficients BEFORE formulas: 2H₂O, 3NaCl — NOT H2O2, NaCl3
  * For mhchem in JSON: use \\ce{H2O}, \\ce{Cu^{2+}}, \\ce{SO4^{2-}} with braces around each formula`,

    "bac-francais": `CHEMISTRY FORMAT (Bac Français):
- Adapt topics to the specified level (from Collège / 5ème-3ème to Lycée / Terminale).
- For Lycée: Integrated with Physics. Organic chemistry, titrations, thermochemistry.
- For Collège: Mixtures, pH of common liquids, structure of matter, combustion.
- "Écrire l'équation de la réaction" — always balance and include state symbols (aq), (l), (g), (s).
- "Donner le nom systématique de..." for IUPAC naming.
- CHEMICAL FORMULA NOTATION (CRITICAL):
  * Subscripts: write H₂O, CO₂, NaCl, CuSO₄, Ca(OH)₂ — NOT H2O, CO2, CuSO4
  * Charges: write Cu²⁺, SO₄²⁻, Fe³⁺, OH⁻ — NOT Cu+2, SO4-2
  * State symbols: (aq), (s), (l), (g) — always in parentheses
  * Coefficients BEFORE formulas: 2H₂O, 3NaCl — NOT H2O2, NaCl3
  * For mhchem in JSON: use \\ce{H2O}, \\ce{Cu^{2+}}, \\ce{SO4^{2-}} with braces around each formula`,

    ib: `CHEMISTRY FORMAT (IB Chemistry SL/HL):
- Start with context: reaction in industry, environmental issue, biological system.
- Data booklet available — reference it: "Using Section 21 of the IB Data Booklet..."
- State symbols mandatory in equations: (s), (l), (g), (aq).
- HL only: organic mechanism arrow-pushing, crystal field theory, entropy/Gibbs.
- "Deduce" for predicting products; "Identify" for naming compounds/functional groups.
- Green chemistry context appreciated (atom economy, percentage yield).
- For titration: always ask students to "State one indicator and its colour change".
- CHEMICAL FORMULA NOTATION (CRITICAL):
  * Use IB notation: mol dm-3 (not mol/L), m s-1 (not m/s)
  * Subscripts: write H2O, CO2, NaCl, CuSO4, Ca(OH)2 -- NOT H2O, CO2, CuSO4
  * Charges: write Cu2+, SO4 2-, Fe3+, OH- -- NOT Cu+2, SO4-2
  * State symbols: (aq), (s), (l), (g) -- always in parentheses
  * For mhchem in JSON: use \\ce{H2O}, \\ce{Cu^{2+}}, \\ce{SO4^{2-}} with braces around each formula`,
  },

  biology: {
    "bac-libanais": `BIOLOGY FORMAT (Bac Libanais / SVT):
- Adapt topics to the specified level (from Collège / EB7-EB9 to Lycée / Terminale).
- For Lycée: 3–4 exercises covering Génétique, Neurophysiologie, Immunologie.
- For Collège: Digestion, respiration, environment, simple genetics.
- Heavily document-based: diagrams, micrographs, experimental results provided.
- Questions follow: "Analyser le document", "En exploitant le document, expliquer...".
- "Rédiger un texte organisé" for essay-type questions (structured paragraph).`,

    "bac-francais": `BIOLOGY FORMAT (Bac Français / SVT):
- Adapt topics to the specified level (from Collège / 5ème-3ème to Lycée / Terminale).
- Document analysis is central — always include a stimulus (figure, data, text extract).
- Three parts typically: Partie 1 (QCM), Partie 2 (Analyse), Partie 3 (Synthèse/rédaction).
- Final question often: "Rédiger un texte de synthèse" (structured written response).
- Award marks for scientific vocabulary AND logical structure of the answer.`,

    ib: `BIOLOGY FORMAT (IB Biology SL/HL):
- Always include real data, diagrams, or experimental context.
- Short-answer: "State", "Define", "List", "Outline" (1–2 marks).
- Extended response: "Explain", "Compare", "Discuss", "Evaluate" (4–8 marks).
- HL only: gene expression regulation, immunology depth, evolution clade analysis.
- Diagrams must be labelled: "Draw and label a diagram of...".
- Data analysis: "Using the data in Table 1, calculate... and comment on...".
- "Compare" requires explicit mention of both similarities AND differences.`,
  },
};

// ---------------------------------------------------------------------------
// Few-shot format examples — built from real past papers
// ---------------------------------------------------------------------------

const FEW_SHOT_EXAMPLES: Record<string, string> = {
  // Source: Bac Spécialité Mathématiques Liban 2023 (real structure)
  "bac-libanais-french": `FORMAT EXAMPLE — modelled on a real Bac Liban 2023 math paper (20 pts, 4 exercises):

Exercice 1 (5 points)

Partie A : On considère la fonction g définie sur ]0 ; +∞[ par g(x) = ln(x²) + x − 2.

1. Calculer lim g(x) quand x→0⁺ et lim g(x) quand x→+∞.
2. Étudier les variations de g sur ]0 ; +∞[.
3. a) Montrer qu'il existe un unique réel strictement positif α tel que g(α) = 0.
   b) Vérifier que 1,37 < α < 1,38.
4. Dresser le tableau de signes de g sur ]0 ; +∞[.

Partie B : On considère la fonction f définie sur ]0 ; +∞[ par f(x) = ((x−2)/x)·ln(x).

1. a) Calculer lim f(x) quand x→0⁺.
   b) En déduire l'équation de l'asymptote à la courbe Cf.
2. Montrer que f'(x) = g(x)/x².
3. Dresser le tableau de variations de f.

NOTICE in this example:
- "Partie A", "Partie B" divide the exercise into logical sections.
- Sub-questions: top-level numeric (1., 2., 3.) with nested lettered (3.a, 3.b).
- Command vocabulary: "Calculer", "Étudier les variations", "Montrer que", "Vérifier", "Dresser", "En déduire".
- No point values per sub-question — only the exercise total is given.
- The whole exercise tells a coherent mathematical story (g leads to f).`,

  // Source: Bac S Liban 2018 (real structure, numbered sub-questions with letters)
  "bac-libanais-french-alt": `ALTERNATIVE FORMAT — Bac Liban 2018 (shorter exercises, explicit sub-point values):

Exercice 2 (3 points)

On donne les formes exponentielles et trigonométriques de (1+i) et (1−i).

1. Déterminer les formes exponentielles et trigonométriques de (1+i) et (1−i).
2. Pour tout entier naturel n, on pose $S_n = (1+i)^n + (1-i)^n$.
   a) Déterminer la forme trigonométrique de $S_n$.
   b) En déduire que $S_n$ est un réel, puis préciser pour quelles valeurs de n on a $S_n = 0$.

Exercice 3 (4 points)

Données : Les trajectoires de deux sous-marins S₁ et S₂ sont représentées dans un repère orthonormal d'unité 1 km...

1. a) Donner les coordonnées de S₁ à l'instant t = 0.
   b) Calculer la vitesse du sous-marin S₁.
2. Déterminer l'angle α que fait la trajectoire de S₁ avec le plan horizontal.
3. Déterminer à quel instant les deux sous-marins sont à la même profondeur.`,

  // Source: IB Chemistry HL Paper 2 (real mark scheme format)
  "ib-english": `FORMAT EXAMPLE — modelled on a real IB Chemistry HL Paper 2 mark scheme:

Question 2: Acid-Base Equilibria

A student prepares a 0.200 mol dm⁻³ solution of ethanoic acid (pKₐ = 4.76).

(a) State an equation for the reaction of ethanoic acid with water. [1]

(b) Calculate the pH of the 0.200 mol dm⁻³ ethanoic acid solution. [3]

(c) The student adds 50.0 cm³ of 0.600 mol dm⁻³ NaOH to 50.0 cm³ of 1.00 mol dm⁻³ ethanoic acid.
   (i)  Determine the concentrations of CH₃COOH and CH₃COO⁻ after mixing. [2]
   (ii) Hence calculate the pH of the resulting solution. [2]

(d) Explain why the resulting solution in (c) acts as a buffer. [2]

MARK SCHEME:
(a) • CH₃COOH(aq) + H₂O(l) ⇌ CH₃COO⁻(aq) + H₃O⁺(aq) ✓ [A1]
    Note: reversible arrow required; H⁺(aq) acceptable / H₃O⁺(aq)

(b) • Kₐ = 10⁻⁴·⁷⁶ = 1.74 × 10⁻⁵ [M1]
    • [H⁺] = √(Kₐ × c) = √(1.74 × 10⁻⁵ × 0.200) = 1.87 × 10⁻³ mol dm⁻³ [M1]
    • pH = −log(1.87 × 10⁻³) = 2.73 [A1]
    Award [3] for correct final answer. ecf from incorrect Kₐ conversion.

(c)(i) • [CH₃COOH] = (0.050 − 0.030)/0.100 = 0.200 mol dm⁻³ [A1]
       • [CH₃COO⁻] = 0.030/0.100 = 0.300 mol dm⁻³ [A1]

(c)(ii) • pH = pKₐ + log([A⁻]/[HA]) = 4.76 + log(0.300/0.200) [M1]
        • pH = 4.76 + 0.18 = 4.94 [A1]  ecf from (c)(i)

(d) • Buffer contains both weak acid and its conjugate base [1]
    • Added H⁺ reacts with CH₃COO⁻; added OH⁻ reacts with CH₃COOH, resisting pH change [1]

NOTICE in this example:
- Marks shown after every sub-question in [brackets].
- Mark scheme uses "•" bullets, one per marking point.
- "ecf" shown explicitly where error-carry-forward applies.
- M1 = method mark, A1 = answer mark.
- "/" shows alternative acceptable responses.
- "Award [X] for correct final answer" allows full marks without intermediate steps.`,
};

// ---------------------------------------------------------------------------
// Difficulty guide
// ---------------------------------------------------------------------------

const DIFFICULTY_GUIDE = `
DIFFICULTY CALIBRATION:
- easy: Single formula/definition applied directly. A student who attended all classes should score full marks. ≤ 2 reasoning steps.
- medium: Requires combining 2–3 concepts from the same chapter. Some algebraic manipulation. Students need to understand the topic, not just memorise.
- hard: Multi-step, may cross chapter boundaries, requires strategic thinking. Weak students make errors; only prepared students score full marks.`;

// ---------------------------------------------------------------------------
// Main system prompt builder
// ---------------------------------------------------------------------------

export function buildGenerateSystemPrompt(context: ExamContext, hasDocument = false): string {
  const isUniversity = context.curriculumId === "university";

  const chaptersSummary = isUniversity
    ? null
    : buildChaptersSummary(context.curriculumId, context.levelId, context.subject, context.chapterIds);

  const langKey = context.language;
  const currKey = context.curriculumId;

  // Pick the right language instruction
  const languageInstruction = LANGUAGE_INSTRUCTIONS[langKey] ?? LANGUAGE_INSTRUCTIONS.english;

  // Pick few-shot format example
  const fewShotKey = currKey === "ib" ? "ib-english" : "bac-libanais-french";
  const fewShotExample = FEW_SHOT_EXAMPLES[fewShotKey] ?? "";

  // Pick command terms: Arabic Bac Libanais has its own block
  let commandTermKey: string;
  if (currKey === "ib") {
    commandTermKey = "ib-english";
  } else if (langKey === "arabic") {
    commandTermKey = "bac-libanais-arabic";
  } else if (currKey === "bac-francais") {
    commandTermKey = "bac-francais-french";
  } else {
    commandTermKey = "bac-libanais-french";
  }
  const commandTerms = COMMAND_TERMS[commandTermKey] ?? "";

  // Pick subject conventions
  const subjectConventions =
    SUBJECT_CONVENTIONS[context.subject]?.[currKey] ?? "";

  // Curriculum-level structural rules
  const structuralRules: Record<string, string> = {
    "bac-libanais": `STRUCTURE RULES (Bac Libanais):
- Number exercises: "Exercice 1", "Exercice 2", ... (or Roman: Exercice I, II, III).
- Sub-questions: a), b), c) — or 1), 2), 3) — with nested aa), ab) if needed.
- Each exercise shows its point value in parentheses: "Exercice 2 (7 points)".
- Always include a "Données :" block with all constants and given values.
- Total must equal exactly 20 points.
- Corrigé: use numbered steps per sub-question. Write "Barème :" at the end with point breakdown.`,

    "bac-francais": `STRUCTURE RULES (Bac Français):
- Number exercises: "Exercice 1 (X points)" or use thematic titles ("Exercice — Mécanique (6 points)").
- For longer exercises, add parts: "Partie A —", "Partie B —".
- Sub-questions: 1., 2., 3. (numeric at top level); 1.a., 1.b. for nested.
- "On donne :" or "Données :" before the constants block.
- "Aide :" prefix for optional hints on hard sub-questions.
- Total: 20 points.
- Corrigé: label each answer "Réponse 1.", "Réponse 1.a." etc. Show all intermediate algebra.`,

    ib: `STRUCTURE RULES (IB):
- Each exercise is a numbered question. Sub-questions: (a), (b), (c), (d)...
- Sub-sub-questions: (a)(i), (a)(ii), (a)(iii).
- Marks shown in square brackets immediately after the question: "... [2]"
- Sum of marks in square brackets must equal the exercise's total points.
- "Data:" block for constants at the start of each physics/chemistry exercise.
- Mark scheme (corrigé): use bullet points (•) for each marking point. Indicate M (method) or A (answer) marks. Include "ecf" where error carried forward applies.
- Do NOT write "Exercice" — IB questions are numbered: "1.", "2.", etc.`,

    university: `STRUCTURE RULES (University):
- Flexible structure. Can use "Problem 1", "Question 1", or thematic labels.
- Sub-questions: (a), (b), (c) or 1), 2), 3).
- Rigour expected: proofs must be complete, derivations step-by-step.
- Total points as specified. No fixed upper bound.`,
  };

  const structural = structuralRules[currKey] ?? "";

  const chapterBlock = isUniversity
    ? `<course_context>
University mode: use the teacher's description to determine topics exactly.
Match the rigor and notation expected at the described university level.
</course_context>`
    : `<selected_chapters>
${chaptersSummary}
Only generate exercises on these chapters. Do not introduce any concept outside this list.
</selected_chapters>`;

  return `You are an expert examiner who writes authentic, high-quality exam questions for ${
    context.curriculumId === "bac-libanais" ? "the Lebanese Baccalaureate (CRDP)"
    : context.curriculumId === "bac-francais" ? "the French Baccalaureate (Éducation nationale)"
    : context.curriculumId === "ib" ? "the International Baccalaureate (IB)"
    : "university-level courses"
  }.

${languageInstruction}

${commandTerms}

${subjectConventions}

${structural}

${DIFFICULTY_GUIDE}

${fewShotExample ? `FORMAT REFERENCE — study this real exam example before generating:
${fewShotExample}
` : ""}
${chapterBlock}

${hasDocument ? `DOCUMENT GROUNDING:
You have been given a document uploaded by the teacher (textbook chapter, past exam, or course notes).
- Read it carefully before generating any question.
- Draw numerical values, formulas, diagrams, and context directly from that document when possible.
- Questions should feel like they were written specifically for students who studied this document.
- If the document contains exercises or examples, do NOT copy them verbatim — transform them (different numbers, different variable, different scenario) while keeping the same concept.
- Vocabulary, notation, and level of rigor must match the document.
` : ""}CRITICAL RULES:
1. All calculations must be correct — verify every numerical answer before writing it.
2. Numbers must be realistic: no negative masses, no speeds exceeding c, no impossible concentrations.
3. Each exercise must stay within the selected chapters — no out-of-scope content.
4. MATH & CHEMISTRY NOTATION — JSON requires double-escaped backslashes: write \\frac, \\sqrt, \\alpha, \\vec, \\int. For chemical equations, you MUST use mhchem WITH BRACES: \\ce{CH4 + 2O2 -> CO2 + 2H2O}. NEVER write \\ce without braces (e.g. \\ceCH4 is INVALID). Single backslash is INVALID inside a JSON string and will crash the parser.
5. VISUALS — Use the following for visual elements:
   a) TABLES: Use Markdown table syntax with pipes:
       | x | f(x) |
       |---|------|
       | 0 |  1   |
       | 1 |  3   |
   b) GRAPHS/FUNCTIONS: Use Mermaid xychart-beta:
       \`\`\`mermaid
       xychart-beta
           title "Function f(x) = x²"
           x-axis [0, 1, 2, 3]
           y-axis [0, 2, 4, 6]
           line [0, 1, 4, 9]
       \`\`\`
   c) CIRCUITS/DIAGRAMS: Use Mermaid flowchart:
       \`\`\`mermaid
       flowchart LR
           A[Battery] --> B[Resistor]
           B --> C[LED]
       \`\`\`
   d) ORGANIC MECHANISMS: Use Mermaid flowchart with arrows:
       \`\`\`mermaid
       flowchart TD
           A[CH3-Br] --> B[CH3COO-]
           B -->|attack| C[Transition State]
       \`\`\`
   e) DATA PLOTS: Use Mermaid xychart-beta for experimental data:
       \`\`\`mermaid
       xychart-beta
           title "Absorption vs Concentration"
           x-axis [0, 10, 20, 30, 40]
           y-axis [0, 0.2, 0.4, 0.6, 0.8]
           line [0.05, 0.18, 0.42, 0.65, 0.79]
       \`\`\`
   IMPORTANT: Close all mermaid code blocks with \`\`\` (three backticks, no language) — NOT with ```javascript or any other language name.
6. OUTPUT: Start your response with [ and end with ]. Output ONLY the raw JSON array — no prose, no markdown fences, no explanation.

SOLUTION QUALITY — The corrigé is what differentiates Imtihan from a simple question generator:
- Write the methodology as numbered steps in the exam language ("**Étape 1 :**", "**Step 1:**", "**الخطوة ١ :**").
- Each step states WHAT is done AND WHY (the principle, theorem, or law being applied).
- Show all intermediate algebra — do not skip steps; a struggling student must be able to follow.
- State every formula in literal form before substituting numbers.
- End with a boxed final answer: "$\\\\boxed{value\\\\text{ unit}}$".
- commonMistakes: 2–3 specific errors typical students at this level make (not trivial arithmetic slips — conceptual or methodological mistakes).
- For IB: include mark allocation per step in the methodology (• Method mark [M1]: ..., • Answer mark [A1]: ...).

JSON schema for each exercise:
{
  "id": string,
  "number": number,
  "type": "multiple_choice" | "short_answer" | "problem_solving" | "proof" | "calculation" | "lab_analysis",
  "difficulty": "easy" | "medium" | "hard",
  "points": number,
  "statement": string,
  "subQuestions": [
    { "label": string, "statement": string, "points": number }
  ] | null,
  "solution": {
    "finalAnswer": string,
    "methodology": string,
    "commonMistakes": string[]
  },
  "chapterIds": string[],
  "estimatedMinutes": number
}`;
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

export function buildGenerateUserPrompt(context: ExamContext): string {
  const difficultyBreakdown = `
- Easy:   ${Math.round(context.difficultyMix.easy   * context.exerciseCount)} exercise(s) (${Math.round(context.difficultyMix.easy   * 100)}%)
- Medium: ${Math.round(context.difficultyMix.medium * context.exerciseCount)} exercise(s) (${Math.round(context.difficultyMix.medium * 100)}%)
- Hard:   ${Math.round(context.difficultyMix.hard   * context.exerciseCount)} exercise(s) (${Math.round(context.difficultyMix.hard   * 100)}%)`;

  return `Generate ${context.exerciseCount} exercises. Reply with ONLY a JSON array starting with [ and ending with ] — no markdown, no prose, no explanation. Output must be valid parseable JSON.

Curriculum : ${context.curriculumId}
Level      : ${context.levelId}
Subject    : ${context.subject}
Language   : ${context.language}
Exam type  : ${context.examType}
Duration   : ${context.duration} minutes
Total points: ${context.totalPoints} (points must sum to exactly ${context.totalPoints})
Difficulty : ${difficultyBreakdown}
${context.teacherNotes ? `\nTeacher notes:\n${context.teacherNotes}` : ""}

Return the JSON array now.`;
}

// ---------------------------------------------------------------------------
// Regenerate single exercise prompt
// ---------------------------------------------------------------------------

export function buildRegenerateExercisePrompt(
  context: ExamContext,
  exerciseNumber: number,
  currentDifficulty: string,
  targetDifficulty?: string
): string {
  const isUniversity = context.curriculumId === "university";

  const chapterBlock = isUniversity
    ? `<course_context>University mode — use the teacher's course description for topic scope.</course_context>`
    : `<selected_chapters>
${buildChaptersSummary(context.curriculumId, context.levelId, context.subject, context.chapterIds)}
</selected_chapters>`;

  return `Generate a NEW, DIFFERENT replacement for exercise #${exerciseNumber}.
Current difficulty: ${currentDifficulty}.${targetDifficulty ? `\nTarget difficulty: ${targetDifficulty}.` : " Keep the same difficulty but use fresh numbers and a different approach."}

Curriculum: ${context.curriculumId} | Level: ${context.levelId} | Subject: ${context.subject} | Language: ${context.language}

${chapterBlock}

Return ONLY a single JSON exercise object (not an array). No markdown, no prose, no explanation. Output must be valid parseable JSON.`;
}
