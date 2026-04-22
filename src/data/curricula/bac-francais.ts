import type { Curriculum } from "@/types/curriculum";

/**
 * Bac Français — French national curriculum as taught in Lebanese French schools
 * (Mission Laïque Française, Lycée Français de Beyrouth, etc.).
 * Source: Programmes officiels de l'Éducation Nationale française.
 */
export const bacFrancais: Curriculum = {
  id: "bac-francais",
  name: {
    fr: "Bac Français",
    en: "French Baccalaureate",
  },
  defaultLanguage: "french",
  languages: ["french", "english"],
  subjects: [
    "mathematics", "physics", "chemistry", "svt", "biology",
    "informatics", "nsi",
    "french", "english", "spanish", "german",
    "history-geography", "philosophy",
    "ses", "economics",
    "management",
  ],
  levels: [
    // ──────────────────────────────────────────────────────────
    // Cinquième (Grade 7)
    // ──────────────────────────────────────────────────────────
    {
      id: "cinquieme-fr",
      name: { fr: "Cinquième", en: "Grade 7" },
      chapters: {
        mathematics: [
          {
            id: "cinq-fr-math-numbers",
            name: { fr: "Nombres et calculs", en: "Numbers and calculations" },
            objectives: ["Calculer avec des nombres relatifs", "Utiliser les fractions simples", "Proportionnalité"],
          },
          {
            id: "cinq-fr-math-geometry",
            name: { fr: "Espace et géométrie", en: "Space and geometry" },
            objectives: ["Symétrie centrale", "Angles et triangles", "Aires et périmètres"],
          },
        ],
        french: [
          {
            id: "cinq-fr-french-texts",
            name: { fr: "Héros, héroïnes et héroïsmes", en: "Heroes and heroism" },
            objectives: ["Découvrir des textes épiques", "Comprendre la figure du héros"],
          },
        ],
        physics: [
          {
            id: "cinq-fr-phys-matter",
            name: { fr: "Organisation et transformations de la matière", en: "Matter and transformations" },
            objectives: ["États de la matière", "Mélanges et solutions"],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Quatrième (Grade 8)
    // ──────────────────────────────────────────────────────────
    {
      id: "quatrieme-fr",
      name: { fr: "Quatrième", en: "Grade 8" },
      chapters: {
        mathematics: [
          {
            id: "quat-fr-math-numbers",
            name: { fr: "Nombres et calculs", en: "Numbers and calculations" },
            objectives: ["Puissances", "Équations du 1er degré", "Théorème de Pythagore"],
          },
        ],
        french: [
          {
            id: "quat-fr-french-texts",
            name: { fr: "La fiction pour interroger le réel", en: "Fiction to question reality" },
            objectives: ["Lire des nouvelles réalistes", "Analyser des textes fantastiques"],
          },
        ],
        physics: [
          {
            id: "quat-fr-phys-electricity",
            name: { fr: "Des signaux pour observer et communiquer", en: "Signals to observe and communicate" },
            objectives: ["Loi d'Ohm", "Circuits électriques"],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Troisième (Grade 9)
    // ──────────────────────────────────────────────────────────
    {
      id: "troisieme-fr",
      name: { fr: "Troisième (Brevet)", en: "Grade 9 (Brevet)" },
      chapters: {
        mathematics: [
          {
            id: "trois-fr-math",
            name: { fr: "Algèbre et géométrie", en: "Algebra and geometry" },
            objectives: ["Théorème de Thalès", "Trigonométrie", "Fonctions affines"],
          },
        ],
        french: [
          {
            id: "trois-fr-french",
            name: { fr: "Agir dans la cité", en: "Acting in the city" },
            objectives: ["Analyser l'argumentation", "Rédiger un essai littéraire"],
          },
        ],
        physics: [
          {
            id: "trois-fr-phys",
            name: { fr: "Mouvement et interactions", en: "Movement and interactions" },
            objectives: ["Vitesse et accélération", "Forces et gravitation"],
          },
        ],
        chemistry: [
          {
            id: "trois-fr-chem",
            name: { fr: "Structure de la matière", en: "Structure of matter" },
            objectives: ["Modèle atomique", "Ions et pH"],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Seconde (Grade 10 — Common core)
    // ──────────────────────────────────────────────────────────
    {
      id: "seconde-fr",
      name: { fr: "Seconde (Tronc commun)", en: "Grade 10 (Common core)" },
      chapters: {
        mathematics: [
          {
            id: "sec-fr-math-functions",
            name: { fr: "Fonctions de référence", en: "Reference functions" },
            objectives: [
              "Étudier les fonctions affines, carré, inverse, racine",
              "Résoudre équations et inéquations graphiquement",
            ],
          },
          {
            id: "sec-fr-math-geometry",
            name: { fr: "Géométrie repérée", en: "Coordinate geometry" },
            objectives: [
              "Utiliser le repère cartésien",
              "Calculer distances, milieux, équations de droites",
            ],
          },
          {
            id: "sec-fr-math-stats",
            name: { fr: "Statistiques et probabilités", en: "Statistics and probability" },
            objectives: [
              "Calculer indicateurs statistiques",
              "Modéliser des expériences aléatoires",
            ],
          },
        ],
        physics: [
          {
            id: "sec-fr-phys-signals",
            name: { fr: "Ondes et signaux", en: "Waves and signals" },
            objectives: [
              "Étudier émission et perception des sons",
              "Appliquer les lois de l'optique",
            ],
          },
          {
            id: "sec-fr-phys-movements",
            name: { fr: "Mouvements et interactions", en: "Movements and interactions" },
            objectives: [
              "Décrire un mouvement",
              "Identifier les interactions",
            ],
          },
        ],
        chemistry: [
          {
            id: "sec-fr-chem-constitution",
            name: { fr: "Constitution et transformations de la matière", en: "Constitution and transformations of matter" },
            objectives: [
              "Décrire la constitution de la matière",
              "Modéliser une transformation chimique",
            ],
          },
        ],
        french: [
          {
            id: "sec-fr-french-texts",
            name: { fr: "Lecture et analyse de textes", en: "Reading and textual analysis" },
            objectives: [
              "Analyser des textes de genres variés (récit, argumentation, poésie)",
              "Identifier les procédés stylistiques",
              "Rédiger un commentaire et une dissertation",
            ],
          },
          {
            id: "sec-fr-french-grammar",
            name: { fr: "Langue et grammaire", en: "Language and grammar" },
            objectives: [
              "Maîtriser la syntaxe et l'orthographe",
              "Enrichir le vocabulaire",
              "Améliorer l'expression écrite",
            ],
          },
        ],
        "history-geography": [
          {
            id: "sec-fr-hist-monde",
            name: { fr: "Le monde depuis 1945", en: "The world since 1945" },
            objectives: [
              "Analyser la Guerre froide et ses enjeux",
              "Étudier la décolonisation",
              "Comprendre la mondialisation contemporaine",
            ],
          },
          {
            id: "sec-fr-geo-france",
            name: { fr: "La France dans le monde", en: "France in the world" },
            objectives: [
              "Étudier les dynamiques des territoires français",
              "Analyser la place de la France en Europe et dans le monde",
            ],
          },
        ],
        ses: [
          {
            id: "sec-fr-ses-market",
            name: { fr: "Le marché — fonctionnement et défaillances", en: "The market — how it works and fails" },
            objectives: [
              "Analyser le fonctionnement du marché concurrentiel",
              "Identifier les défaillances de marché",
              "Comprendre le rôle de l'État",
            ],
          },
          {
            id: "sec-fr-ses-social",
            name: { fr: "Sociétés et inégalités sociales", en: "Societies and social inequalities" },
            objectives: [
              "Décrire les inégalités économiques et sociales",
              "Analyser la mobilité sociale",
              "Étudier les classes sociales",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Première — Spécialité Mathématiques
    // ──────────────────────────────────────────────────────────
    {
      id: "premiere-fr-spe-math",
      name: { fr: "Première — Spécialité Mathématiques", en: "Grade 11 — Math specialty" },
      chapters: {
        mathematics: [
          {
            id: "pre-fr-math-second-degree",
            name: { fr: "Second degré", en: "Quadratic functions" },
            objectives: [
              "Résoudre équations et inéquations du second degré",
              "Étudier signe du trinôme",
              "Utiliser forme canonique",
            ],
          },
          {
            id: "pre-fr-math-derivation",
            name: { fr: "Dérivation", en: "Differentiation" },
            objectives: [
              "Calculer dérivées usuelles",
              "Étudier variations et extremums",
              "Déterminer équation de tangente",
            ],
          },
          {
            id: "pre-fr-math-exponential",
            name: { fr: "Fonction exponentielle", en: "Exponential function" },
            objectives: [
              "Utiliser les propriétés algébriques",
              "Étudier la fonction exponentielle",
              "Résoudre équations et inéquations",
            ],
          },
          {
            id: "pre-fr-math-trigonometry",
            name: { fr: "Trigonométrie", en: "Trigonometry" },
            objectives: [
              "Utiliser le cercle trigonométrique",
              "Résoudre équations trigonométriques",
            ],
          },
          {
            id: "pre-fr-math-sequences",
            name: { fr: "Suites numériques", en: "Numerical sequences" },
            objectives: [
              "Étudier suites arithmétiques et géométriques",
              "Raisonner par récurrence (initiation)",
            ],
          },
        ],
        french: [
          {
            id: "pre-fr-french-roman",
            name: { fr: "Le roman et ses personnages", en: "The novel and its characters" },
            objectives: [
              "Étudier le genre romanesque à travers les siècles",
              "Analyser les personnages et les techniques narratives",
              "Rédiger une dissertation sur une œuvre intégrale",
            ],
          },
          {
            id: "pre-fr-french-theatre",
            name: { fr: "Le théâtre — du texte à la scène", en: "Theatre — from text to stage" },
            objectives: [
              "Analyser le texte dramatique",
              "Étudier la mise en scène et les didascalies",
              "Rédiger un commentaire de texte théâtral",
            ],
          },
        ],
        "history-geography": [
          {
            id: "pre-fr-hist-xix",
            name: { fr: "Le XIXe siècle — révolutions et nations", en: "The 19th century — revolutions and nations" },
            objectives: [
              "Analyser les révolutions industrielles",
              "Étudier la construction des États-nations",
              "Comprendre le mouvement colonial",
            ],
          },
          {
            id: "pre-fr-geo-amenagement",
            name: { fr: "Aménagement des territoires", en: "Territorial development" },
            objectives: [
              "Analyser les dynamiques territoriales en France",
              "Étudier les politiques d'aménagement",
              "Comprendre les inégalités spatiales",
            ],
          },
        ],
        philosophy: [
          {
            id: "pre-fr-philo-intro",
            name: { fr: "Introduction à la philosophie", en: "Introduction to philosophy" },
            objectives: [
              "Comprendre la démarche philosophique",
              "Analyser des textes de grands philosophes",
              "Construire une argumentation rigoureuse",
            ],
          },
        ],
        ses: [
          {
            id: "pre-fr-ses-croissance",
            name: { fr: "Croissance, fluctuations et crises", en: "Growth, fluctuations and crises" },
            objectives: [
              "Mesurer et analyser la croissance économique",
              "Expliquer les fluctuations et les crises",
              "Étudier le rôle des politiques conjoncturelles",
            ],
          },
          {
            id: "pre-fr-ses-stratification",
            name: { fr: "Structure sociale et stratification", en: "Social structure and stratification" },
            objectives: [
              "Analyser la stratification sociale",
              "Étudier les processus de socialisation",
              "Comprendre les formes de déviance",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Terminale — Spécialité Mathématiques
    // ──────────────────────────────────────────────────────────
    {
      id: "terminale-fr-spe-math",
      name: { fr: "Terminale — Spécialité Mathématiques", en: "Grade 12 — Math specialty" },
      chapters: {
        mathematics: [
          {
            id: "ter-fr-math-limits",
            name: { fr: "Limites et continuité", en: "Limits and continuity" },
            objectives: [
              "Calculer limites de fonctions",
              "Appliquer théorème des valeurs intermédiaires",
            ],
          },
          {
            id: "ter-fr-math-derivation",
            name: { fr: "Dérivation et primitives", en: "Differentiation and antiderivatives" },
            objectives: [
              "Dériver composées",
              "Déterminer primitives",
              "Étudier convexité",
            ],
          },
          {
            id: "ter-fr-math-logarithm",
            name: { fr: "Fonction logarithme népérien", en: "Natural logarithm" },
            objectives: [
              "Maîtriser propriétés de ln",
              "Étudier la fonction ln",
              "Résoudre équations et inéquations",
            ],
          },
          {
            id: "ter-fr-math-integrals",
            name: { fr: "Intégration", en: "Integration" },
            objectives: [
              "Calculer intégrales et primitives",
              "Utiliser intégration par parties",
              "Calculer aires",
            ],
          },
          {
            id: "ter-fr-math-probability",
            name: { fr: "Probabilités — loi binomiale et normale", en: "Probability — binomial and normal distributions" },
            objectives: [
              "Utiliser loi binomiale",
              "Utiliser loi normale",
              "Construire intervalle de fluctuation",
            ],
          },
          {
            id: "ter-fr-math-geometry-space",
            name: { fr: "Géométrie dans l'espace", en: "3D geometry" },
            objectives: [
              "Utiliser vecteurs dans l'espace",
              "Déterminer équations de plans",
              "Résoudre problèmes d'intersections",
            ],
          },
        ],
        philosophy: [
          {
            id: "ter-fr-philo-conscience",
            name: { fr: "La conscience et l'inconscient", en: "Consciousness and the unconscious" },
            objectives: [
              "Analyser la notion de conscience",
              "Étudier les thèses freudiennes sur l'inconscient",
              "Débattre de la responsabilité morale",
            ],
          },
          {
            id: "ter-fr-philo-liberte",
            name: { fr: "Liberté et déterminisme", en: "Freedom and determinism" },
            objectives: [
              "Opposer libre arbitre et déterminisme",
              "Étudier les conceptions de la liberté",
              "Analyser la question de la responsabilité",
            ],
          },
          {
            id: "ter-fr-philo-politique",
            name: { fr: "L'État et la société politique", en: "The State and political society" },
            objectives: [
              "Analyser les théories du contrat social",
              "Étudier les formes de gouvernement",
              "Comprendre justice, droit et légitimité",
            ],
          },
          {
            id: "ter-fr-philo-bonheur",
            name: { fr: "Le bonheur et la morale", en: "Happiness and morality" },
            objectives: [
              "Comparer les conceptions du bonheur",
              "Étudier les théories éthiques",
              "Analyser le devoir moral",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Terminale — Spécialité Physique-Chimie
    // ──────────────────────────────────────────────────────────
    {
      id: "terminale-fr-spe-pc",
      name: { fr: "Terminale — Spécialité Physique-Chimie", en: "Grade 12 — Physics-Chemistry specialty" },
      chapters: {
        physics: [
          {
            id: "ter-fr-phys-mechanics",
            name: { fr: "Mécanique — mouvements", en: "Mechanics — movements" },
            objectives: [
              "Appliquer 2e loi de Newton",
              "Étudier chutes avec frottements",
              "Résoudre mouvement dans champ gravitationnel",
            ],
          },
          {
            id: "ter-fr-phys-energy",
            name: { fr: "Énergie — conversions et transferts", en: "Energy — conversions and transfers" },
            objectives: [
              "Bilan énergétique",
              "Rendement d'une conversion",
            ],
          },
          {
            id: "ter-fr-phys-waves",
            name: { fr: "Ondes et signaux", en: "Waves and signals" },
            objectives: [
              "Analyser ondes mécaniques et lumineuses",
              "Appliquer effet Doppler",
              "Étudier diffraction et interférences",
            ],
          },
        ],
        chemistry: [
          {
            id: "ter-fr-chem-equilibrium",
            name: { fr: "Équilibres chimiques", en: "Chemical equilibria" },
            objectives: [
              "Déterminer quotient de réaction",
              "Prévoir sens d'évolution",
              "Étudier acides et bases en solution",
            ],
          },
          {
            id: "ter-fr-chem-kinetics",
            name: { fr: "Cinétique chimique", en: "Chemical kinetics" },
            objectives: [
              "Suivi temporel d'une réaction",
              "Identifier catalyseurs",
              "Déterminer temps de demi-réaction",
            ],
          },
          {
            id: "ter-fr-chem-organic",
            name: { fr: "Chimie organique — stratégies de synthèse", en: "Organic chemistry — synthesis strategies" },
            objectives: [
              "Nommer molécules organiques",
              "Identifier groupes caractéristiques",
              "Proposer mécanismes simples",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Terminale — Spécialité SVT
    // ──────────────────────────────────────────────────────────
    {
      id: "terminale-fr-spe-svt",
      name: { fr: "Terminale — Spécialité SVT", en: "Grade 12 — Life & Earth Sciences specialty" },
      chapters: {
        svt: [
          {
            id: "ter-fr-svt-evolution",
            name: { fr: "Évolution et diversité du vivant", en: "Evolution and diversity of life" },
            objectives: [
              "Analyser les mécanismes évolutifs (sélection naturelle, dérive génétique)",
              "Construire et interpréter des arbres phylogénétiques",
              "Relier génétique et évolution",
            ],
          },
          {
            id: "ter-fr-svt-genet-mol",
            name: { fr: "Génétique moléculaire", en: "Molecular genetics" },
            objectives: [
              "Décrire la réplication de l'ADN",
              "Expliquer la transcription et la traduction",
              "Analyser les mutations et leurs conséquences",
            ],
          },
          {
            id: "ter-fr-svt-immunity",
            name: { fr: "Immunologie", en: "Immunology" },
            objectives: [
              "Décrire l'immunité innée et adaptative",
              "Expliquer la réponse humorale et cellulaire",
              "Analyser vaccination et maladies auto-immunes",
            ],
          },
          {
            id: "ter-fr-svt-ecology",
            name: { fr: "Écologie et environnement", en: "Ecology and environment" },
            objectives: [
              "Analyser les cycles biogéochimiques",
              "Étudier l'impact des activités humaines",
              "Comprendre les enjeux de la biodiversité",
            ],
          },
          {
            id: "ter-fr-svt-nervous",
            name: { fr: "Neurosciences — comportement et cerveau", en: "Neuroscience — behavior and brain" },
            objectives: [
              "Décrire la transmission de l'influx nerveux",
              "Relier plasticité synaptique et apprentissage",
              "Analyser les bases neurobiologiques du comportement",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Terminale — Spécialité NSI (Numérique et Sciences Informatiques)
    // ──────────────────────────────────────────────────────────
    {
      id: "terminale-fr-spe-nsi",
      name: { fr: "Terminale — Spécialité NSI", en: "Grade 12 — Digital Science & CS specialty" },
      chapters: {
        nsi: [
          {
            id: "ter-fr-nsi-structures",
            name: { fr: "Structures de données", en: "Data structures" },
            objectives: [
              "Implémenter et utiliser piles, files, listes chaînées",
              "Comprendre arbres et graphes",
              "Choisir la structure adaptée à un problème",
            ],
          },
          {
            id: "ter-fr-nsi-algorithms",
            name: { fr: "Algorithmes et complexité", en: "Algorithms and complexity" },
            objectives: [
              "Analyser la complexité temporelle et spatiale",
              "Implémenter algorithmes de tri et de recherche",
              "Appliquer la programmation dynamique et le diviser pour régner",
            ],
          },
          {
            id: "ter-fr-nsi-databases",
            name: { fr: "Bases de données", en: "Databases" },
            objectives: [
              "Modéliser avec le schéma entité-association",
              "Écrire des requêtes SQL (SELECT, JOIN, WHERE)",
              "Comprendre la normalisation",
            ],
          },
          {
            id: "ter-fr-nsi-networks",
            name: { fr: "Réseaux et protocoles", en: "Networks and protocols" },
            objectives: [
              "Décrire le modèle TCP/IP",
              "Comprendre routage et adressage IP",
              "Analyser la sécurité des réseaux",
            ],
          },
          {
            id: "ter-fr-nsi-systems",
            name: { fr: "Systèmes d'exploitation", en: "Operating systems" },
            objectives: [
              "Comprendre la gestion des processus",
              "Analyser ordonnancement et concurrence",
              "Comprendre la gestion de la mémoire",
            ],
          },
        ],
      },
    },
    // ──────────────────────────────────────────────────────────
    // Terminale — Spécialité SES
    // ──────────────────────────────────────────────────────────
    {
      id: "terminale-fr-spe-ses",
      name: { fr: "Terminale — Spécialité SES", en: "Grade 12 — Social & Economic Sciences specialty" },
      chapters: {
        ses: [
          {
            id: "ter-fr-ses-croissance",
            name: { fr: "Croissance économique et développement durable", en: "Economic growth and sustainable development" },
            objectives: [
              "Analyser les facteurs de la croissance",
              "Étudier les limites écologiques",
              "Comprendre les politiques de développement durable",
            ],
          },
          {
            id: "ter-fr-ses-mondialisation",
            name: { fr: "Mondialisation et régulation", en: "Globalization and regulation" },
            objectives: [
              "Analyser le commerce international et les flux de capitaux",
              "Étudier les acteurs de la régulation (OMC, FMI, BM)",
              "Débattre des effets de la mondialisation",
            ],
          },
          {
            id: "ter-fr-ses-justice",
            name: { fr: "Justice sociale et inégalités", en: "Social justice and inequalities" },
            objectives: [
              "Analyser les inégalités économiques et sociales",
              "Étudier les politiques de redistribution",
              "Débattre des conceptions de la justice sociale",
            ],
          },
          {
            id: "ter-fr-ses-travail",
            name: { fr: "Travail, emploi et chômage", en: "Work, employment and unemployment" },
            objectives: [
              "Analyser le marché du travail",
              "Comprendre les causes et formes du chômage",
              "Étudier les politiques de l'emploi",
            ],
          },
          {
            id: "ter-fr-ses-institutions",
            name: { fr: "Institutions politiques et démocratie", en: "Political institutions and democracy" },
            objectives: [
              "Analyser les formes de démocratie",
              "Étudier le fonctionnement des institutions",
              "Comprendre la participation politique",
            ],
          },
        ],
      },
    },
  ],
};
