import type { Curriculum } from "@/types/curriculum";

/**
 * IB (International Baccalaureate) Diploma Programme.
 * Groups 1-6 — SL and HL offerings.
 * Source: IB subject guides (current cycle).
 */
export const ib: Curriculum = {
  id: "ib",
  name: {
    fr: "Baccalauréat International (IB)",
    en: "International Baccalaureate (IB)",
  },
  defaultLanguage: "english",
  languages: ["english", "french"],
  subjects: [
    // Group 1 — Language A
    "english", "french", "arabic",
    // Group 2 — Language acquisition
    "spanish", "german",
    // Group 3 — Individuals & Societies
    "history", "economics", "geography", "psychology", "global-politics", "management",
    // Group 4 — Sciences
    "biology", "chemistry", "physics", "environmental-systems",
    // Group 5 — Mathematics
    "mathematics",
    // Group 6 — Arts
    "visual-arts", "music",
    // Core
    "informatics",
  ],
  levels: [
    // ──────────────────────────────────────────────────────────
    // MYP Year 5 (Grade 10)
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-myp-5",
      name: { fr: "MYP Année 5 (Grade 10)", en: "MYP Year 5 (Grade 10)" },
      chapters: {
        mathematics: [
          {
            id: "myp5-math-algebra",
            name: { fr: "Algèbre", en: "Algebra" },
            objectives: [
              "Solve linear and quadratic equations",
              "Work with exponents and radicals",
              "Manipulate rational expressions",
            ],
          },
          {
            id: "myp5-math-functions",
            name: { fr: "Fonctions", en: "Functions" },
            objectives: [
              "Graph and analyze linear, quadratic, exponential functions",
              "Understand function transformations",
            ],
          },
        ],
        physics: [
          {
            id: "myp5-phys-mechanics",
            name: { fr: "Mécanique", en: "Mechanics" },
            objectives: [
              "Apply kinematic equations",
              "Apply Newton's laws",
              "Analyze energy conservation",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // DP — Mathematics: Analysis & Approaches SL
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-dp-math-aa-sl",
      name: { fr: "DP Math — Analysis & Approaches SL", en: "DP Math — Analysis & Approaches SL" },
      chapters: {
        mathematics: [
          {
            id: "ib-aa-sl-algebra",
            name: { fr: "Nombres et algèbre", en: "Number and Algebra" },
            objectives: [
              "Work with sequences, series, and the binomial theorem",
              "Use exponents and logarithms",
              "Solve systems of linear equations",
            ],
          },
          {
            id: "ib-aa-sl-functions",
            name: { fr: "Fonctions", en: "Functions" },
            objectives: [
              "Analyze linear, quadratic, exponential, logarithmic, rational functions",
              "Understand transformations and composite functions",
            ],
          },
          {
            id: "ib-aa-sl-geometry",
            name: { fr: "Géométrie et trigonométrie", en: "Geometry and Trigonometry" },
            objectives: [
              "Apply trigonometric identities",
              "Solve triangles using sine and cosine rules",
              "Work with 3D geometry",
            ],
          },
          {
            id: "ib-aa-sl-stats",
            name: { fr: "Statistiques et probabilités", en: "Statistics and Probability" },
            objectives: [
              "Calculate descriptive statistics",
              "Apply binomial and normal distributions",
              "Compute probabilities of independent and conditional events",
            ],
          },
          {
            id: "ib-aa-sl-calculus",
            name: { fr: "Calcul différentiel et intégral", en: "Calculus" },
            objectives: [
              "Find derivatives and apply them to optimization",
              "Compute definite and indefinite integrals",
              "Interpret integrals as areas",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // DP — Mathematics: Analysis & Approaches HL
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-dp-math-aa-hl",
      name: { fr: "DP Math — Analysis & Approaches HL", en: "DP Math — Analysis & Approaches HL" },
      chapters: {
        mathematics: [
          {
            id: "ib-aa-hl-algebra",
            name: { fr: "Nombres et algèbre (HL)", en: "Number and Algebra (HL)" },
            objectives: [
              "Work with complex numbers (Cartesian, polar, Euler forms)",
              "Apply proof by induction",
              "Manipulate partial fractions",
            ],
          },
          {
            id: "ib-aa-hl-calculus",
            name: { fr: "Calcul différentiel et intégral (HL)", en: "Calculus (HL)" },
            objectives: [
              "Apply limits from first principles",
              "Use integration by substitution and by parts",
              "Solve first-order differential equations",
              "Apply Maclaurin series",
            ],
          },
          {
            id: "ib-aa-hl-vectors",
            name: { fr: "Vecteurs", en: "Vectors" },
            objectives: [
              "Compute dot and cross products",
              "Find lines and planes in 3D",
              "Solve intersection problems",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // DP — Physics SL/HL
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-dp-physics-sl",
      name: { fr: "DP Physique SL/HL", en: "DP Physics SL/HL" },
      chapters: {
        physics: [
          {
            id: "ib-phys-sl-mechanics",
            name: { fr: "Mécanique", en: "Mechanics" },
            objectives: [
              "Apply equations of motion",
              "Apply Newton's laws to systems",
              "Analyze momentum and energy conservation",
            ],
          },
          {
            id: "ib-phys-sl-thermal",
            name: { fr: "Physique thermique", en: "Thermal Physics" },
            objectives: [
              "Use specific heat capacity and latent heat",
              "Apply ideal gas laws",
            ],
          },
          {
            id: "ib-phys-sl-waves",
            name: { fr: "Ondes", en: "Waves" },
            objectives: [
              "Describe wave behavior and superposition",
              "Analyze standing waves and Doppler effect",
            ],
          },
          {
            id: "ib-phys-sl-electricity",
            name: { fr: "Électricité et magnétisme", en: "Electricity and magnetism" },
            objectives: [
              "Apply Ohm's law and Kirchhoff's laws",
              "Analyze simple magnetic fields",
            ],
          },
          {
            id: "ib-phys-hl-nuclear",
            name: { fr: "Physique nucléaire et des particules", en: "Nuclear and particle physics" },
            objectives: [
              "Describe radioactive decay and nuclear reactions",
              "Calculate binding energy",
              "Describe the Standard Model",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // DP — Chemistry SL/HL
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-dp-chem-sl",
      name: { fr: "DP Chimie SL/HL", en: "DP Chemistry SL/HL" },
      chapters: {
        chemistry: [
          {
            id: "ib-chem-sl-stoichiometry",
            name: { fr: "Stœchiométrie", en: "Stoichiometric relationships" },
            objectives: [
              "Balance equations and calculate amounts",
              "Apply ideal gas law",
              "Perform solution-based stoichiometry",
            ],
          },
          {
            id: "ib-chem-sl-atomic-structure",
            name: { fr: "Structure atomique", en: "Atomic structure" },
            objectives: [
              "Describe electron configurations",
              "Interpret emission spectra",
            ],
          },
          {
            id: "ib-chem-sl-energetics",
            name: { fr: "Énergétique", en: "Energetics / Thermochemistry" },
            objectives: [
              "Apply Hess's law",
              "Calculate enthalpy changes",
            ],
          },
          {
            id: "ib-chem-sl-acids-bases",
            name: { fr: "Acides et bases", en: "Acids and bases" },
            objectives: [
              "Calculate pH of strong and weak acids/bases",
              "Apply Brønsted-Lowry theory",
            ],
          },
          {
            id: "ib-chem-sl-organic",
            name: { fr: "Chimie organique", en: "Organic chemistry" },
            objectives: [
              "Name and classify organic compounds",
              "Predict products of common reactions",
            ],
          },
          {
            id: "ib-chem-hl-kinetics",
            name: { fr: "Cinétique chimique (HL)", en: "Chemical kinetics (HL)" },
            objectives: [
              "Determine reaction orders and rate constants",
              "Apply Arrhenius equation",
              "Describe reaction mechanisms",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // DP — Biology SL/HL
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-dp-biology-sl",
      name: { fr: "DP Biologie SL/HL", en: "DP Biology SL/HL" },
      chapters: {
        biology: [
          {
            id: "ib-bio-cell-theory",
            name: { fr: "Théorie cellulaire", en: "Cell theory" },
            objectives: [
              "Describe cell structure (prokaryote vs. eukaryote)",
              "Explain membrane transport",
              "Analyze cell division (mitosis and meiosis)",
            ],
          },
          {
            id: "ib-bio-molecular",
            name: { fr: "Biologie moléculaire", en: "Molecular biology" },
            objectives: [
              "Describe DNA replication, transcription, and translation",
              "Explain enzymes and metabolic pathways",
              "Analyze gene expression",
            ],
          },
          {
            id: "ib-bio-genetics",
            name: { fr: "Génétique", en: "Genetics" },
            objectives: [
              "Apply Mendelian genetics",
              "Analyze patterns of inheritance (codominance, linkage)",
              "Interpret genetic crosses and pedigrees",
            ],
          },
          {
            id: "ib-bio-evolution",
            name: { fr: "Évolution et biodiversité", en: "Evolution and biodiversity" },
            objectives: [
              "Explain natural selection and speciation",
              "Construct and interpret cladograms",
              "Discuss the evidence for evolution",
            ],
          },
          {
            id: "ib-bio-ecology",
            name: { fr: "Écologie", en: "Ecology" },
            objectives: [
              "Analyze food webs and energy flow",
              "Study nutrient cycling",
              "Evaluate human impacts on ecosystems",
            ],
          },
          {
            id: "ib-bio-hl-physiology",
            name: { fr: "Physiologie humaine (HL)", en: "Human physiology (HL)" },
            objectives: [
              "Describe the immune system in detail",
              "Explain hormonal regulation",
              "Analyze nervous system function",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // DP — History SL/HL
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-dp-history-sl",
      name: { fr: "DP Histoire SL/HL", en: "DP History SL/HL" },
      chapters: {
        history: [
          {
            id: "ib-hist-authoritarianism",
            name: { fr: "Autoritarisme et totalitarisme", en: "Authoritarian and single-party states" },
            objectives: [
              "Analyze the rise and consolidation of authoritarian regimes",
              "Compare methods of control in different states",
              "Evaluate the impact on society and culture",
            ],
          },
          {
            id: "ib-hist-cold-war",
            name: { fr: "La Guerre froide", en: "The Cold War" },
            objectives: [
              "Trace the origins, development and end of the Cold War",
              "Analyze key crises (Korea, Cuba, Vietnam)",
              "Evaluate superpower relations",
            ],
          },
          {
            id: "ib-hist-world-wars",
            name: { fr: "Les guerres mondiales", en: "World Wars" },
            objectives: [
              "Analyze the causes and consequences of WWI and WWII",
              "Evaluate the role of ideology, nationalism, and imperialism",
              "Assess the impact on civilians and post-war reconstruction",
            ],
          },
          {
            id: "ib-hist-middle-east",
            name: { fr: "Le Moyen-Orient — conflit et résolution", en: "The Middle East — conflict and resolution" },
            objectives: [
              "Examine origins and development of the Arab-Israeli conflict",
              "Analyze regional wars and peace initiatives",
              "Evaluate the role of external powers",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // DP — Economics SL/HL
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-dp-economics-sl",
      name: { fr: "DP Économie SL/HL", en: "DP Economics SL/HL" },
      chapters: {
        economics: [
          {
            id: "ib-econ-microeconomics",
            name: { fr: "Microéconomie", en: "Microeconomics" },
            objectives: [
              "Analyze supply and demand and price determination",
              "Evaluate different market structures",
              "Apply elasticity concepts",
            ],
          },
          {
            id: "ib-econ-macroeconomics",
            name: { fr: "Macroéconomie", en: "Macroeconomics" },
            objectives: [
              "Measure GDP, unemployment, and inflation",
              "Analyze Keynesian and monetarist models",
              "Evaluate fiscal and monetary policies",
            ],
          },
          {
            id: "ib-econ-global",
            name: { fr: "Économie internationale", en: "Global economy" },
            objectives: [
              "Explain comparative advantage and trade theory",
              "Analyze exchange rates and balance of payments",
              "Evaluate free trade vs. protectionism",
            ],
          },
          {
            id: "ib-econ-development",
            name: { fr: "Développement économique", en: "Economic development" },
            objectives: [
              "Distinguish growth from development",
              "Analyze barriers to and strategies for development",
              "Evaluate the role of aid, trade, and debt",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // DP — Psychology SL/HL
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-dp-psychology-sl",
      name: { fr: "DP Psychologie SL/HL", en: "DP Psychology SL/HL" },
      chapters: {
        psychology: [
          {
            id: "ib-psych-biological",
            name: { fr: "Approche biologique", en: "Biological approach" },
            objectives: [
              "Explain the role of neurotransmitters and hormones",
              "Analyze brain research methods (MRI, twin studies)",
              "Evaluate biological explanations for behavior",
            ],
          },
          {
            id: "ib-psych-cognitive",
            name: { fr: "Approche cognitive", en: "Cognitive approach" },
            objectives: [
              "Describe models of memory and cognition",
              "Analyze cognitive biases and heuristics",
              "Evaluate the reliability of cognitive processes",
            ],
          },
          {
            id: "ib-psych-sociocultural",
            name: { fr: "Approche socioculturelle", en: "Sociocultural approach" },
            objectives: [
              "Analyze social and cultural influences on behavior",
              "Evaluate conformity, obedience, and social identity",
              "Discuss cultural psychology",
            ],
          },
          {
            id: "ib-psych-research",
            name: { fr: "Méthodes de recherche", en: "Research methodology" },
            objectives: [
              "Design experiments and evaluate their validity",
              "Analyze ethical considerations in psychology research",
              "Interpret quantitative and qualitative data",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // DP — Global Politics SL/HL
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-dp-global-politics",
      name: { fr: "DP Politique mondiale SL/HL", en: "DP Global Politics SL/HL" },
      chapters: {
        "global-politics": [
          {
            id: "ib-gp-power-sovereignty",
            name: { fr: "Pouvoir, souveraineté et gouvernance", en: "Power, sovereignty and governance" },
            objectives: [
              "Analyze different forms of power in world politics",
              "Evaluate challenges to state sovereignty",
              "Compare models of governance",
            ],
          },
          {
            id: "ib-gp-rights-justice",
            name: { fr: "Droits de l'homme et justice", en: "Human rights and justice" },
            objectives: [
              "Analyze the international human rights framework",
              "Evaluate humanitarian intervention",
              "Discuss distributive justice globally",
            ],
          },
          {
            id: "ib-gp-development",
            name: { fr: "Développement et inégalités", en: "Development and inequalities" },
            objectives: [
              "Measure and compare global development",
              "Analyze causes of inequality",
              "Evaluate strategies for sustainable development",
            ],
          },
          {
            id: "ib-gp-peace-conflict",
            name: { fr: "Paix et conflits", en: "Peace and conflict" },
            objectives: [
              "Classify types of conflicts",
              "Analyze causes and consequences of war",
              "Evaluate peacebuilding and conflict resolution",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // DP — Environmental Systems & Societies SL
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-dp-ess",
      name: { fr: "DP Sciences de l'Environnement SL", en: "DP Environmental Systems & Societies SL" },
      chapters: {
        "environmental-systems": [
          {
            id: "ib-ess-systems",
            name: { fr: "Systèmes et modèles", en: "Systems and models" },
            objectives: [
              "Define and apply systems thinking",
              "Identify feedback loops in environmental systems",
              "Construct and evaluate models",
            ],
          },
          {
            id: "ib-ess-ecosystems",
            name: { fr: "Écosystèmes", en: "Ecosystems" },
            objectives: [
              "Analyze energy flow and trophic levels",
              "Study biogeochemical cycles (carbon, nitrogen, water)",
              "Evaluate biodiversity and conservation",
            ],
          },
          {
            id: "ib-ess-climate",
            name: { fr: "Changements climatiques", en: "Climate change" },
            objectives: [
              "Explain the greenhouse effect and climate science",
              "Analyze evidence for anthropogenic climate change",
              "Evaluate mitigation and adaptation strategies",
            ],
          },
          {
            id: "ib-ess-human-systems",
            name: { fr: "Systèmes humains et ressources", en: "Human systems and resource use" },
            objectives: [
              "Analyze food and energy systems",
              "Study water and land management",
              "Evaluate sustainable resource use",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // DP — Business Management SL/HL
    // ──────────────────────────────────────────────────────────
    {
      id: "ib-dp-business",
      name: { fr: "DP Gestion d'entreprise SL/HL", en: "DP Business Management SL/HL" },
      chapters: {
        management: [
          {
            id: "ib-bm-organization",
            name: { fr: "Les organisations", en: "Business organization and environment" },
            objectives: [
              "Classify types of organizations",
              "Analyze organizational structures",
              "Evaluate stakeholder interests",
            ],
          },
          {
            id: "ib-bm-hr",
            name: { fr: "Gestion des ressources humaines", en: "Human resource management" },
            objectives: [
              "Describe HR planning and recruitment",
              "Analyze motivation theories (Maslow, Herzberg, Taylor)",
              "Evaluate organizational culture",
            ],
          },
          {
            id: "ib-bm-marketing",
            name: { fr: "Marketing", en: "Marketing" },
            objectives: [
              "Apply the marketing mix (4 Ps)",
              "Analyze market research methods",
              "Evaluate digital and traditional marketing strategies",
            ],
          },
          {
            id: "ib-bm-finance",
            name: { fr: "Finance et comptabilité", en: "Finance and accounts" },
            objectives: [
              "Analyze financial statements (P&L, balance sheet, cash flow)",
              "Calculate and interpret financial ratios",
              "Evaluate investment appraisal methods",
            ],
          },
          {
            id: "ib-bm-operations",
            name: { fr: "Opérations et gestion de la production", en: "Operations management" },
            objectives: [
              "Analyze production methods and quality management",
              "Evaluate lean production and supply chain management",
              "Apply break-even analysis",
            ],
          },
        ],
      },
    },
  ],
};
