import type { Curriculum } from "@/types/curriculum";

/**
 * Bac Libanais — official Lebanese curriculum.
 * Source: CRDP (Centre de Recherche et de Développement Pédagogiques).
 * Covers Sciences, Humanities, Languages, Economics tracks.
 */
export const bacLibanais: Curriculum = {
  id: "bac-libanais",
  name: {
    fr: "Bac Libanais",
    en: "Lebanese Baccalaureate",
    ar: "البكالوريا اللبنانية",
  },
  defaultLanguage: "french",
  languages: ["french", "english", "arabic"],
  subjects: [
    "mathematics", "physics", "chemistry", "biology", "svt",
    "arabic", "french", "english",
    "history-geography", "philosophy", "civic-education",
    "economics", "accounting", "management",
    "informatics",
  ],
  levels: [
    // ──────────────────────────────────────────────────────────
    // EB7 — Cinquième (Grade 7)
    // ──────────────────────────────────────────────────────────
    {
      id: "eb7",
      name: { fr: "Classe EB7 (Cinquième)", en: "Grade 7", ar: "السابع أساسي" },
      chapters: {
        mathematics: [
          {
            id: "eb7-math",
            name: { fr: "Algèbre et Géométrie", en: "Algebra and Geometry" },
            objectives: ["Nombres entiers et décimaux", "Fractions", "Angles et droites parallèles"],
          },
        ],
        physics: [
          {
            id: "eb7-phys",
            name: { fr: "Sciences Physiques", en: "Physical Sciences" },
            objectives: ["États de la matière", "Circuits électriques simples"],
          },
        ],
        arabic: [
          {
            id: "eb7-arabic",
            name: { fr: "Langue Arabe", en: "Arabic Language", ar: "اللغة العربية" },
            objectives: ["Lecture et compréhension", "Grammaire de base"],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // EB8 — Quatrième (Grade 8)
    // ──────────────────────────────────────────────────────────
    {
      id: "eb8",
      name: { fr: "Classe EB8 (Quatrième)", en: "Grade 8", ar: "الثامن أساسي" },
      chapters: {
        mathematics: [
          {
            id: "eb8-math",
            name: { fr: "Algèbre et Géométrie", en: "Algebra and Geometry" },
            objectives: ["Nombres relatifs", "Théorème de Pythagore", "Équations simples"],
          },
        ],
        physics: [
          {
            id: "eb8-phys",
            name: { fr: "Sciences Physiques", en: "Physical Sciences" },
            objectives: ["Tension et intensité", "Lentilles"],
          },
        ],
        chemistry: [
          {
            id: "eb8-chem",
            name: { fr: "Chimie", en: "Chemistry" },
            objectives: ["L'air et ses constituants", "Les transformations chimiques"],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // EB9 — Brevet (Grade 9)
    // ──────────────────────────────────────────────────────────
    {
      id: "eb9",
      name: { fr: "Classe EB9 (Brevet)", en: "Grade 9 (Brevet)", ar: "التاسع أساسي" },
      chapters: {
        mathematics: [
          {
            id: "eb9-math-algebra",
            name: { fr: "Calcul algébrique", en: "Algebraic computation" },
            objectives: [
              "Factoriser et développer des expressions littérales",
              "Résoudre des équations et inéquations du premier degré",
              "Manipuler les identités remarquables",
            ],
          },
          {
            id: "eb9-math-functions",
            name: { fr: "Fonctions linéaires et affines", en: "Linear and affine functions" },
            objectives: [
              "Déterminer l'expression d'une fonction affine",
              "Représenter graphiquement une fonction affine",
              "Résoudre des systèmes d'équations linéaires",
            ],
          },
          {
            id: "eb9-math-geometry",
            name: { fr: "Géométrie — Thalès et Pythagore", en: "Thales and Pythagorean theorems" },
            objectives: [
              "Appliquer le théorème de Thalès et sa réciproque",
              "Appliquer le théorème de Pythagore et sa réciproque",
              "Utiliser la trigonométrie dans le triangle rectangle",
            ],
          },
          {
            id: "eb9-math-statistics",
            name: { fr: "Statistiques", en: "Statistics" },
            objectives: [
              "Calculer la moyenne, la médiane, l'étendue",
              "Construire et interpréter des diagrammes",
            ],
          },
        ],
        physics: [
          {
            id: "eb9-phys-electricity",
            name: { fr: "Électricité — loi d'Ohm", en: "Electricity — Ohm's law" },
            objectives: [
              "Appliquer la loi d'Ohm",
              "Calculer des résistances équivalentes en série et en parallèle",
              "Utiliser la loi des nœuds et la loi des mailles",
            ],
          },
          {
            id: "eb9-phys-mechanics",
            name: { fr: "Mécanique — forces et poids", en: "Mechanics — forces and weight" },
            objectives: [
              "Distinguer poids et masse",
              "Représenter une force par un vecteur",
              "Utiliser la relation P = m·g",
            ],
          },
        ],
        chemistry: [
          {
            id: "eb9-chem-atoms",
            name: { fr: "Structure de l'atome", en: "Atomic structure" },
            objectives: [
              "Décrire la structure atomique",
              "Utiliser le tableau périodique",
              "Déterminer la configuration électronique",
            ],
          },
          {
            id: "eb9-chem-reactions",
            name: { fr: "Réactions chimiques", en: "Chemical reactions" },
            objectives: [
              "Équilibrer une équation chimique",
              "Identifier réactifs et produits",
              "Appliquer la conservation de la masse",
            ],
          },
        ],
        arabic: [
          {
            id: "eb9-arabic-grammar",
            name: { fr: "Grammaire arabe", en: "Arabic grammar", ar: "النحو والصرف" },
            objectives: [
              "Identifier les fonctions grammaticales (sujet, objet, prédicat)",
              "Appliquer les règles d'accord en genre et nombre",
              "Analyser les cas grammaticaux (رفع، نصب، جر)",
            ],
          },
          {
            id: "eb9-arabic-literature",
            name: { fr: "Textes littéraires", en: "Literary texts", ar: "النصوص الأدبية" },
            objectives: [
              "Analyser des textes poétiques et en prose",
              "Identifier les figures de style",
              "Comprendre le contexte historique des œuvres",
            ],
          },
        ],
        "history-geography": [
          {
            id: "eb9-hist-geo-liban",
            name: { fr: "Histoire du Liban", en: "History of Lebanon", ar: "تاريخ لبنان" },
            objectives: [
              "Retracer les grandes étapes de l'histoire libanaise",
              "Comprendre la formation de l'État libanais",
              "Analyser les événements contemporains",
            ],
          },
          {
            id: "eb9-hist-geo-world",
            name: { fr: "Géographie du monde arabe", en: "Geography of the Arab world", ar: "جغرافية العالم العربي" },
            objectives: [
              "Localiser les pays arabes sur une carte",
              "Identifier les ressources naturelles de la région",
              "Analyser les défis géopolitiques",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Seconde (Grade 10)
    // ──────────────────────────────────────────────────────────
    {
      id: "seconde",
      name: { fr: "Seconde", en: "Grade 10 (Seconde)" },
      chapters: {
        mathematics: [
          {
            id: "sec-math-functions",
            name: { fr: "Généralités sur les fonctions", en: "Functions — overview" },
            objectives: [
              "Étudier le sens de variation",
              "Déterminer le domaine de définition",
              "Étudier parité et symétries",
            ],
          },
          {
            id: "sec-math-vectors",
            name: { fr: "Vecteurs et géométrie analytique", en: "Vectors and analytic geometry" },
            objectives: [
              "Calculer les coordonnées d'un vecteur",
              "Utiliser la colinéarité",
              "Déterminer l'équation d'une droite",
            ],
          },
        ],
        physics: [
          {
            id: "sec-phys-optics",
            name: { fr: "Optique géométrique", en: "Geometric optics" },
            objectives: [
              "Appliquer les lois de Snell-Descartes",
              "Construire l'image par une lentille mince",
              "Utiliser la formule de conjugaison",
            ],
          },
        ],
        chemistry: [
          {
            id: "sec-chem-solutions",
            name: { fr: "Solutions aqueuses et concentrations", en: "Aqueous solutions and concentrations" },
            objectives: [
              "Calculer une concentration molaire",
              "Préparer une solution par dissolution ou dilution",
            ],
          },
        ],
        arabic: [
          {
            id: "sec-arabic-rhetoric",
            name: { fr: "Rhétorique et style", en: "Arabic rhetoric and style", ar: "البلاغة" },
            objectives: [
              "Identifier les figures de style (تشبيه، استعارة، كناية)",
              "Analyser des textes poétiques classiques et modernes",
              "Rédiger une composition argumentative",
            ],
          },
          {
            id: "sec-arabic-texts",
            name: { fr: "Lecture analytique", en: "Analytical reading", ar: "القراءة التحليلية" },
            objectives: [
              "Dégager le thème principal d'un texte",
              "Analyser structure et argumentation",
              "Formuler un commentaire littéraire",
            ],
          },
        ],
        french: [
          {
            id: "sec-french-grammar",
            name: { fr: "Grammaire et syntaxe", en: "French grammar and syntax" },
            objectives: [
              "Identifier les propositions subordonnées",
              "Maîtriser la concordance des temps",
              "Corriger les fautes d'accord",
            ],
          },
          {
            id: "sec-french-literature",
            name: { fr: "Textes et genres littéraires", en: "Literary texts and genres" },
            objectives: [
              "Distinguer roman, poésie, théâtre, essai",
              "Analyser un texte littéraire",
              "Rédiger un commentaire composé",
            ],
          },
        ],
        english: [
          {
            id: "sec-english-grammar",
            name: { fr: "Grammaire anglaise", en: "English grammar" },
            objectives: [
              "Use tenses correctly (present, past, future, conditionals)",
              "Form passive voice constructions",
              "Apply modal verbs appropriately",
            ],
          },
          {
            id: "sec-english-writing",
            name: { fr: "Expression écrite", en: "Writing skills" },
            objectives: [
              "Write structured paragraphs with topic sentences",
              "Compose argumentative and narrative essays",
              "Use linking words and cohesive devices",
            ],
          },
        ],
        "history-geography": [
          {
            id: "sec-hist-modern",
            name: { fr: "Histoire moderne — XIXe-XXe siècles", en: "Modern history — 19th–20th centuries" },
            objectives: [
              "Analyser la colonisation et la décolonisation",
              "Étudier les deux guerres mondiales",
              "Comprendre la Guerre froide",
            ],
          },
          {
            id: "sec-geo-liban",
            name: { fr: "Géographie du Liban", en: "Geography of Lebanon" },
            objectives: [
              "Décrire le relief, le climat et les régions du Liban",
              "Analyser la démographie et l'urbanisation",
              "Étudier les ressources et l'économie nationale",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Première S (Grade 11 — Sciences track)
    // ──────────────────────────────────────────────────────────
    {
      id: "premiere-s",
      name: { fr: "Première S", en: "Grade 11 — Science track" },
      chapters: {
        mathematics: [
          {
            id: "pre-math-derivation",
            name: { fr: "Dérivation", en: "Differentiation" },
            objectives: [
              "Calculer la dérivée d'une fonction",
              "Étudier les variations à l'aide de la dérivée",
              "Déterminer l'équation d'une tangente",
            ],
          },
          {
            id: "pre-math-sequences",
            name: { fr: "Suites numériques", en: "Numerical sequences" },
            objectives: [
              "Reconnaître suites arithmétiques et géométriques",
              "Calculer la somme de termes consécutifs",
              "Étudier le sens de variation",
            ],
          },
          {
            id: "pre-math-probability",
            name: { fr: "Probabilités", en: "Probability" },
            objectives: [
              "Calculer probabilités conditionnelles",
              "Utiliser l'indépendance d'événements",
            ],
          },
        ],
        physics: [
          {
            id: "pre-phys-mechanics",
            name: { fr: "Mécanique — lois de Newton", en: "Mechanics — Newton's laws" },
            objectives: [
              "Appliquer les trois lois de Newton",
              "Résoudre un mouvement uniformément accéléré",
              "Étudier les mouvements circulaires uniformes",
            ],
          },
          {
            id: "pre-phys-energy",
            name: { fr: "Énergie mécanique", en: "Mechanical energy" },
            objectives: [
              "Calculer énergies cinétique et potentielle",
              "Appliquer le théorème de l'énergie mécanique",
            ],
          },
        ],
        chemistry: [
          {
            id: "pre-chem-kinetics",
            name: { fr: "Cinétique chimique", en: "Chemical kinetics" },
            objectives: [
              "Déterminer une vitesse de réaction",
              "Identifier les facteurs cinétiques",
            ],
          },
        ],
        biology: [
          {
            id: "pre-bio-cell",
            name: { fr: "La cellule — structure et fonctions", en: "Cell structure and function" },
            objectives: [
              "Décrire les organites cellulaires et leurs rôles",
              "Distinguer cellule procaryote et eucaryote",
              "Expliquer la division cellulaire (mitose, méiose)",
            ],
          },
          {
            id: "pre-bio-genetics",
            name: { fr: "Génétique — hérédité", en: "Genetics — heredity" },
            objectives: [
              "Comprendre les lois de Mendel",
              "Analyser des croisements génétiques",
              "Lire un caryotype",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Terminale S (Grade 12 — Sciences track)
    // ──────────────────────────────────────────────────────────
    {
      id: "terminale-s",
      name: { fr: "Terminale S", en: "Grade 12 — Science track" },
      chapters: {
        mathematics: [
          {
            id: "ter-math-complex",
            name: { fr: "Nombres complexes", en: "Complex numbers" },
            objectives: [
              "Manipuler formes algébrique, trigonométrique, exponentielle",
              "Résoudre équations du second degré à coefficients complexes",
              "Utiliser les nombres complexes en géométrie",
            ],
          },
          {
            id: "ter-math-integrals",
            name: { fr: "Intégration", en: "Integration" },
            objectives: [
              "Calculer une primitive",
              "Utiliser l'intégration par parties",
              "Calculer des aires et volumes",
            ],
          },
          {
            id: "ter-math-probability",
            name: { fr: "Probabilités — lois continues", en: "Probability — continuous distributions" },
            objectives: [
              "Utiliser la loi normale",
              "Utiliser la loi exponentielle",
              "Construire un intervalle de confiance",
            ],
          },
        ],
        physics: [
          {
            id: "ter-phys-electromagnetism",
            name: { fr: "Électromagnétisme", en: "Electromagnetism" },
            objectives: [
              "Appliquer la loi de Lenz-Faraday",
              "Étudier un circuit RLC",
              "Utiliser la loi d'Ampère",
            ],
          },
          {
            id: "ter-phys-mechanics",
            name: { fr: "Mécanique — mouvements dans l'espace", en: "Mechanics — 3D motion" },
            objectives: [
              "Étudier mouvements de projectiles",
              "Appliquer les lois de Kepler",
              "Résoudre le mouvement dans un champ de pesanteur",
            ],
          },
          {
            id: "ter-phys-waves",
            name: { fr: "Ondes et physique quantique", en: "Waves and quantum physics" },
            objectives: [
              "Décrire la dualité onde-corpuscule",
              "Calculer une longueur d'onde de De Broglie",
              "Étudier l'effet photoélectrique",
            ],
          },
        ],
        chemistry: [
          {
            id: "ter-chem-acid-base",
            name: { fr: "Acides et bases — pH", en: "Acids and bases — pH" },
            objectives: [
              "Calculer le pH d'une solution",
              "Réaliser un titrage acido-basique",
              "Identifier couples acide/base",
            ],
          },
          {
            id: "ter-chem-organic",
            name: { fr: "Chimie organique", en: "Organic chemistry" },
            objectives: [
              "Nommer molécules organiques selon IUPAC",
              "Identifier groupes caractéristiques",
              "Prévoir mécanismes de réaction",
            ],
          },
        ],
        biology: [
          {
            id: "ter-bio-immunity",
            name: { fr: "Immunologie", en: "Immunology" },
            objectives: [
              "Décrire les mécanismes de l'immunité innée et adaptative",
              "Expliquer le fonctionnement des anticorps",
              "Analyser la réponse vaccinale",
            ],
          },
          {
            id: "ter-bio-nervous-system",
            name: { fr: "Système nerveux et neurotransmission", en: "Nervous system and neurotransmission" },
            objectives: [
              "Décrire le potentiel d'action",
              "Expliquer la transmission synaptique",
              "Relier structure et fonction du cerveau",
            ],
          },
          {
            id: "ter-bio-evolution",
            name: { fr: "Évolution et biodiversité", en: "Evolution and biodiversity" },
            objectives: [
              "Expliquer les mécanismes de la sélection naturelle",
              "Analyser des phylogénies",
              "Comprendre la spéciation",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Terminale L (Grade 12 — Humanities/Littéraire track)
    // ──────────────────────────────────────────────────────────
    {
      id: "terminale-l",
      name: { fr: "Terminale L (Littéraire)", en: "Grade 12 — Humanities track", ar: "الأدبي" },
      chapters: {
        arabic: [
          {
            id: "ter-l-arabic-poetry",
            name: { fr: "Poésie arabe — du classique au moderne", en: "Arabic poetry — classical to modern", ar: "الشعر العربي من القديم إلى الحديث" },
            objectives: [
              "Analyser la structure prosodique (عروض)",
              "Comparer poésie classique (عمودي) et moderne (تفعيلة)",
              "Étudier les grands poètes libanais et arabes",
            ],
          },
          {
            id: "ter-l-arabic-prose",
            name: { fr: "Prose arabe — roman et nouvelle", en: "Arabic prose — novel and short story", ar: "النثر العربي" },
            objectives: [
              "Analyser la structure narrative d'un roman",
              "Étudier les techniques de la nouvelle arabe",
              "Rédiger une dissertation littéraire",
            ],
          },
          {
            id: "ter-l-arabic-grammar",
            name: { fr: "Grammaire avancée", en: "Advanced Arabic grammar", ar: "النحو المتقدم" },
            objectives: [
              "Maîtriser l'analyse grammaticale complète (إعراب)",
              "Identifier les constructions syntaxiques complexes",
              "Appliquer les règles de l'éloquence",
            ],
          },
        ],
        french: [
          {
            id: "ter-l-french-literature",
            name: { fr: "Littérature française — grands courants", en: "French literature — major movements" },
            objectives: [
              "Étudier les mouvements (classicisme, romantisme, réalisme, surréalisme)",
              "Analyser des œuvres intégrales",
              "Rédiger une dissertation littéraire",
            ],
          },
          {
            id: "ter-l-french-composition",
            name: { fr: "Expression écrite et orale", en: "Written and oral expression" },
            objectives: [
              "Maîtriser la dissertation et le commentaire",
              "Développer l'argumentation",
              "Préparer un oral structuré",
            ],
          },
        ],
        english: [
          {
            id: "ter-l-english-literature",
            name: { fr: "Littérature anglophone", en: "English literature" },
            objectives: [
              "Analyze novels, poems and plays in English",
              "Write literary essays and commentaries",
              "Discuss themes and literary devices",
            ],
          },
          {
            id: "ter-l-english-advanced",
            name: { fr: "Anglais avancé", en: "Advanced English" },
            objectives: [
              "Understand complex texts and arguments",
              "Write formal and argumentative essays",
              "Participate in structured debates",
            ],
          },
        ],
        philosophy: [
          {
            id: "ter-l-philo-logic",
            name: { fr: "Logique et argumentation", en: "Logic and argumentation", ar: "المنطق والحجاج" },
            objectives: [
              "Construire un raisonnement valide",
              "Identifier les sophismes",
              "Distinguer argument déductif et inductif",
            ],
          },
          {
            id: "ter-l-philo-ethics",
            name: { fr: "Éthique et philosophie morale", en: "Ethics and moral philosophy", ar: "الأخلاق" },
            objectives: [
              "Comparer les théories éthiques (utilitarisme, déontologie, vertu)",
              "Appliquer l'éthique à des problèmes contemporains",
              "Rédiger une dissertation philosophique",
            ],
          },
          {
            id: "ter-l-philo-knowledge",
            name: { fr: "Épistémologie — théorie de la connaissance", en: "Epistemology — theory of knowledge", ar: "نظرية المعرفة" },
            objectives: [
              "Distinguer opinion, croyance et connaissance",
              "Analyser les sources et limites du savoir",
              "Étudier les grandes thèses (empirisme, rationalisme)",
            ],
          },
          {
            id: "ter-l-philo-politics",
            name: { fr: "Philosophie politique", en: "Political philosophy", ar: "الفلسفة السياسية" },
            objectives: [
              "Analyser les théories du contrat social",
              "Étudier les notions de liberté, justice, État",
              "Relier philosophie politique et actualité",
            ],
          },
        ],
        "history-geography": [
          {
            id: "ter-l-hist-contemporary",
            name: { fr: "Histoire contemporaine — XXe-XXIe s.", en: "Contemporary history — 20th–21st centuries" },
            objectives: [
              "Analyser les deux guerres mondiales et leurs conséquences",
              "Étudier la décolonisation et le tiers-monde",
              "Comprendre le monde après 1989",
            ],
          },
          {
            id: "ter-l-geo-mondialisation",
            name: { fr: "Mondialisation et géopolitique", en: "Globalization and geopolitics" },
            objectives: [
              "Analyser les flux commerciaux et migratoires",
              "Étudier les puissances mondiales",
              "Comprendre les conflits géopolitiques actuels",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Terminale ES (Grade 12 — Economics/Social track)
    // ──────────────────────────────────────────────────────────
    {
      id: "terminale-es",
      name: { fr: "Terminale ES (Économique)", en: "Grade 12 — Economics track", ar: "الاقتصادي الاجتماعي" },
      chapters: {
        mathematics: [
          {
            id: "ter-es-math-analysis",
            name: { fr: "Analyse mathématique (ES)", en: "Mathematical analysis (ES track)" },
            objectives: [
              "Étudier les fonctions économiques (coût, recette, profit)",
              "Calculer dérivées et optimiser",
              "Utiliser les suites pour modéliser la croissance",
            ],
          },
          {
            id: "ter-es-math-stats",
            name: { fr: "Statistiques et probabilités appliquées", en: "Applied statistics and probability" },
            objectives: [
              "Calculer indicateurs statistiques bivariés",
              "Utiliser la régression linéaire",
              "Interpréter des données économiques",
            ],
          },
        ],
        economics: [
          {
            id: "ter-es-microecon",
            name: { fr: "Microéconomie", en: "Microeconomics" },
            objectives: [
              "Analyser l'offre et la demande sur un marché",
              "Étudier la formation des prix en concurrence",
              "Comprendre les défaillances de marché",
            ],
          },
          {
            id: "ter-es-macroecon",
            name: { fr: "Macroéconomie", en: "Macroeconomics" },
            objectives: [
              "Analyser le PIB et la croissance économique",
              "Étudier l'inflation et le chômage",
              "Comprendre les politiques budgétaire et monétaire",
            ],
          },
          {
            id: "ter-es-intl-trade",
            name: { fr: "Commerce international et mondialisation", en: "International trade and globalization" },
            objectives: [
              "Expliquer les théories du commerce international",
              "Analyser la balance des paiements",
              "Évaluer les effets de la mondialisation",
            ],
          },
        ],
        accounting: [
          {
            id: "ter-es-accounting-basics",
            name: { fr: "Comptabilité générale", en: "Financial accounting" },
            objectives: [
              "Enregistrer des opérations comptables au journal",
              "Établir un bilan et un compte de résultat",
              "Calculer les soldes intermédiaires de gestion",
            ],
          },
          {
            id: "ter-es-accounting-analysis",
            name: { fr: "Analyse financière", en: "Financial analysis" },
            objectives: [
              "Lire et interpréter un bilan",
              "Calculer les ratios de liquidité et rentabilité",
              "Évaluer la santé financière d'une entreprise",
            ],
          },
        ],
        management: [
          {
            id: "ter-es-management",
            name: { fr: "Sciences de gestion", en: "Management science" },
            objectives: [
              "Analyser les fonctions de l'entreprise",
              "Étudier les structures organisationnelles",
              "Comprendre la gestion des ressources humaines",
            ],
          },
        ],
      },
    },
  ],
};
