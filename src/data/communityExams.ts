import { ExamContext, Exercise } from "@/types/exam";

export interface CommunityExam {
  id: string;
  title: string;
  author: string;
  school?: string;
  likes: number;
  downloads: number;
  tags: string[];
  context: ExamContext;
  exercises: Exercise[];
}

export const FEATURED_EXAMS: CommunityExam[] = [
  {
    id: "f1",
    title: "Physique — Mécanique et Électromagnétisme",
    author: "M. Sami Khoury",
    school: "Lycée Verdun International",
    likes: 47,
    downloads: 124,
    tags: ["mécanique", "électromagnétisme", "loi d'Ohm"],
    context: {
      curriculumId: "bac-libanais",
      levelId: "Terminale S",
      subject: "physics",
      chapterIds: ["mecanique", "electro"],
      language: "french",
      examType: "final",
      duration: 120,
      exerciseCount: 3,
      totalPoints: 20,
      difficultyMix: { easy: 0.3, medium: 0.4, hard: 0.3 },
    },
    exercises: [
      {
        id: "ex1",
        number: 1,
        type: "problem_solving",
        difficulty: "medium",
        points: 7,
        estimatedMinutes: 40,
        chapterIds: ["mecanique"],
        statement: "Un corps de masse $m = 2\\text{ kg}$ est lancé depuis le bas d'un plan incliné faisant un angle $\\theta = 30^\\circ$ avec l'horizontale. La vitesse initiale est $v_0 = 5\\text{ m/s}$. On néglige les frottements.",
        subQuestions: [
          { label: "1.", statement: "Faire le bilan des forces appliquées sur le corps et les représenter sur un schéma.", points: 2 },
          { label: "2.", statement: "En appliquant la deuxième loi de Newton, déterminer l'accélération $a$ du centre de masse du corps.", points: 3 },
          { label: "3.", statement: "Calculer la distance maximale parcourue par le corps sur le plan avant de s'arrêter.", points: 2 }
        ],
        solution: {
          finalAnswer: "$a = -4.9\\text{ m/s}^2$ et distance $d \\approx 2.55\\text{ m}$.",
          methodology: "1. Poids $\\vec{P}$ et réaction $\\vec{R}$.\n2. Projection sur l'axe x parallèle au plan: $-P\\sin(\\theta) = ma \\implies a = -g\\sin(30^\\circ)$.\n3. Équation $v^2 - v_0^2 = 2ad$.",
        }
      },
      {
        id: "ex2",
        number: 2,
        type: "problem_solving",
        difficulty: "easy",
        points: 6,
        estimatedMinutes: 30,
        chapterIds: ["electro"],
        statement: "Un circuit série comporte un générateur idéal de tension $E = 12\\text{V}$, une résistance $R = 100\\,\\Omega$ et une bobine d'inductance $L = 0.5\\text{H}$ et de résistance interne $r = 10\\,\\Omega$. L'interrupteur K est fermé à $t = 0$.",
        subQuestions: [
          { label: "1.", statement: "Établir l'équation différentielle régissant l'intensité $i(t)$ du courant.", points: 3 },
          { label: "2.", statement: "Donner l'expression de $i(t)$ et calculer sa valeur en régime permanent.", points: 3 }
        ],
        solution: {
          finalAnswer: "$i_\\infty = 0.109\\text{ A}$",
          methodology: "1. Loi d'additivité des tensions: $E = u_R + u_L = R i + L \\frac{di}{dt} + r i$.\n2. Régime permanent: $di/dt = 0$, $i_\\infty = \\frac{E}{R+r}$.",
        }
      },
      {
        id: "ex3",
        number: 3,
        type: "problem_solving",
        difficulty: "hard",
        points: 7,
        estimatedMinutes: 50,
        chapterIds: ["mecanique"],
        statement: "Un pendule élastique horizontal est constitué d'un ressort de raideur $k = 40\\text{ N/m}$ et d'un solide de masse $m = 100\\text{g}$. Il est écarté de $x_0 = 5\\text{cm}$ puis lâché sans vitesse initiale.",
        subQuestions: [
          { label: "a)", statement: "Trouver la période propre $T_0$ des oscillations.", points: 2 },
          { label: "b)", statement: "Écrire l'équation horaire du mouvement $x(t)$.", points: 2 },
          { label: "c)", statement: "Calculer l'énergie mécanique du système.", points: 3 }
        ],
        solution: {
          finalAnswer: "$T_0 = 0.314\\text{ s}$, $E_m = 0.05\\text{ J}$",
          methodology: "$T_0 = 2\\pi\\sqrt{m/k}$. $E_m = \\frac{1}{2} k x_0^2$.",
        }
      }
    ]
  },
  {
    id: "f2",
    title: "IB Chemistry HL — Organic & Equilibria",
    author: "Ms. Lara Abi Nader",
    school: "International College Beirut",
    likes: 82,
    downloads: 203,
    tags: ["organic chemistry", "equilibria", "SN2", "Le Chatelier"],
    context: {
      curriculumId: "ib",
      levelId: "DP Year 2 (HL)",
      subject: "chemistry",
      chapterIds: ["organic", "equilibria"],
      language: "english",
      examType: "midterm",
      duration: 90,
      exerciseCount: 2,
      totalPoints: 50,
      difficultyMix: { easy: 0.2, medium: 0.5, hard: 0.3 },
    },
    exercises: [
      {
        id: "ex1",
        number: 1,
        type: "short_answer",
        difficulty: "medium",
        points: 25,
        estimatedMinutes: 45,
        chapterIds: ["organic"],
        statement: "Consider the reaction between 1-bromobutane and sodium hydroxide.",
        subQuestions: [
          { label: "1.", statement: "State the name of the reaction mechanism.", points: 5 },
          { label: "2.", statement: "Draw the full mechanism using curly arrows, including the transition state.", points: 15 },
          { label: "3.", statement: "Explain how the rate of reaction changes if 2-bromo-2-methylpropane is used instead.", points: 5 }
        ],
        solution: {
          finalAnswer: "SN2 mechanism. Tertiary halocompound shifts to SN1.",
          methodology: "1-bromobutane is a primary halogenoalkane -> SN2. Draw backside attack of OH- on the delta+ Carbon. Curly arrow from lone pair of OH- to C, and from C-Br bond to Br. Transition state with dotted bonds.",
        }
      },
      {
        id: "ex2",
        number: 2,
        type: "problem_solving",
        difficulty: "hard",
        points: 25,
        estimatedMinutes: 45,
        chapterIds: ["equilibria"],
        statement: "Ammonia is produced industrially via the Haber process: $N_2(g) + 3H_2(g) \\rightleftharpoons 2NH_3(g)$ with $\\Delta H = -92\\text{ kJ/mol}$.",
        subQuestions: [
          { label: "a)", statement: "Write the expression for the equilibrium constant $K_c$.", points: 5 },
          { label: "b)", statement: "Predict and explain the effect of increasing the pressure on the yield of ammonia.", points: 10 },
          { label: "c)", statement: "If $0.5\\text{ mol}$ of $N_2$ and $1.5\\text{ mol}$ of $H_2$ are placed in a $1\\text{ dm}^3$ flask and allowed to reach equilibrium, $0.2\\text{ mol}$ of $NH_3$ is formed. Calculate $K_c$.", points: 10 }
        ],
        solution: {
          finalAnswer: "$K_c = 0.036$",
          methodology: "ICE table. Change in NH3 = +0.2, so change in N2 = -0.1 and H2 = -0.3. Eq conc: N2 = 0.4, H2 = 1.2, NH3 = 0.2. $K_c = 0.2^2 / (0.4 \\times 1.2^3)$.",
        }
      }
    ]
  }
];
