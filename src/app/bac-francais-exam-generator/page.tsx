import { GeneratorLandingHero, GeneratorLandingNav } from "@/components/landing/GeneratorLandingHero";
import Link from "next/link";
import { ArrowRight, Check, Star, BookOpen, Clock, Settings, GraduationCap } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SchemaOrg } from "@/components/SchemaOrg";
import { LandingFAQ, buildFaqSchema } from "@/components/landing/LandingFAQ";

export const metadata = {
  title: "Générateur de Devoir Bac Français | Imtihan",
  description: "Le générateur de devoir Bac Français pour enseignants. Créez des Devoirs Surveillés (DS) et examens blancs (Mathématiques, Physique-Chimie) de la Seconde à la Terminale.",
  alternates: { canonical: "/bac-francais-exam-generator" },
  openGraph: {
    type: "website",
    title: "Générateur de Devoir Bac Français — Imtihan",
    description: "Élaborez des contrôles et des grilles de correction conformes aux programmes officiels de l'Éducation Nationale française (AEFE).",
    url: "https://imtihan.live/bac-francais-exam-generator",
    images: [{ url: "/opengraph-image?v=20261016", width: 1200, height: 630, alt: "Imtihan — AI Exam Generator" }],
  },
};

const FRENCH_FEATURES = [
  {
    icon: GraduationCap,
    title: "Spécialités Terminale & Tronc Commun",
    body: "Couverture des enseignements de spécialité Mathématiques et Physique-Chimie de la voie générale, ainsi que le tronc commun correspondant de la Seconde à la Terminale."
  },
  {
    icon: Star,
    title: "Critères officiels du Baccalauréat",
    body: "Générez des consignes basées sur les compétences clés évaluées au Baccalauréat français : S'approprier, Analyser, Réaliser, Valider, Communiquer."
  },
  {
    icon: Settings,
    title: "Grilles de correction détaillées",
    body: "Chaque devoir est généré avec son corrigé et son barème indicatif. Idéal pour uniformiser l'évaluation et accélérer la correction de vos copies."
  },
  {
    icon: BookOpen,
    title: "Prise en compte des documents sources",
    body: "Téléversez vos chapitres de manuel ou vos notes de cours. L'IA adapte les énoncés des exercices aux notions précises étudiées en classe."
  }
];

const BAC_FRANCAIS_FAQ_ITEMS = [
  {
    q: "Le générateur suit-il les programmes officiels de l'Éducation Nationale ?",
    a: "Oui. Les devoirs générés couvrent les enseignements de spécialité Mathématiques et Physique-Chimie, ainsi que le tronc commun correspondant, de la Seconde à la Terminale, conformément aux programmes AEFE.",
  },
  {
    q: "Les consignes respectent-elles les compétences évaluées au Bac ?",
    a: "Oui, les énoncés sont formulés selon les compétences clés du Baccalauréat français : S'approprier, Analyser, Réaliser, Valider, Communiquer — les mêmes attendus que ceux des sujets officiels.",
  },
  {
    q: "Puis-je générer un Devoir Surveillé (DS) à partir de mon cours ?",
    a: "Oui. Téléversez vos chapitres de manuel, diapositives ou notes de cours : l'IA génère un DS aligné précisément sur les notions que vous avez enseignées en classe.",
  },
  {
    q: "Le corrigé et le barème sont-ils fournis automatiquement ?",
    a: "Oui, chaque devoir est livré avec sa grille de correction détaillée et son barème indicatif, ce qui uniformise l'évaluation entre plusieurs classes ou enseignants.",
  },
  {
    q: "Est-ce accessible gratuitement pour un premier essai ?",
    a: "Oui, un premier devoir complet est généré gratuitement sans carte bancaire. L'abonnement Pro débloque ensuite 10 générations par mois (20 en formule annuelle).",
  },
];

export default function FrenchBacLandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <SchemaOrg
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Imtihan — Générateur de devoir Bac Français",
            "url": "https://imtihan.live/bac-francais-exam-generator",
            "description": "Générateur intelligent de devoirs surveillés (DS) et bacs blancs conformes aux programmes officiels français (Lycée de la Seconde à la Terminale Spécialité).",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "USD",
              "category": "FreeTrial"
            },
            "educationalAlignment": [
              {
                "@type": "AlignmentObject",
                "alignmentType": "educationalSubject",
                "educationalFramework": "Ministère de l'Éducation Nationale française (AEFE)",
                "targetName": "Baccalauréat Français (Lycée Seconde, Première, Terminale Spécialité)",
                "targetUrl": "https://imtihan.live/bac-francais-exam-generator"
              }
            ]
          },
          buildFaqSchema(BAC_FRANCAIS_FAQ_ITEMS),
        ]}
      />

      <GeneratorLandingNav french={true} />
      <main className="flex-grow pt-16">
        <GeneratorLandingHero {...{
  "french": true,
  "eyebrow": "Bac Français · Seconde à Terminale",
  "title": "Des devoirs qui font réfléchir.",
  "accent": "Des corrigés qui font gagner du temps.",
  "description": "Préparez vos contrôles, devoirs surveillés et sujets d’entraînement en mathématiques ou physique-chimie. Gardez la main sur les chapitres, la difficulté, la structure et les points.",
  "cta": "Créer mon devoir gratuit",
  "preview": {
    "title": "Spécialité mathématiques",
    "level": "Terminale · Exemple de composition 2026 J1",
    "duration": "4 heures",
    "marks": "20 points",
    "instructions": "Quatre exercices obligatoires. Une référence datée pour préparer un sujet d’entraînement, avec un barème modifiable.",
    "sections": [
      {
        "title": "Exercices 1 & 2",
        "detail": "5 et 4 points · Raisonnement et application des connaissances."
      },
      {
        "title": "Exercices 3 & 4",
        "detail": "6 et 5 points · Plusieurs étapes, méthodes à justifier."
      },
      {
        "title": "Corrigé séparé",
        "detail": "Réponses, démarche et critères d’attribution des points."
      }
    ]
  }
}} />

        {/* Features */}
        <section className="px-6 md:px-10 py-20 bg-[var(--bg-subtle)] border-t border-b border-[var(--border)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="serif text-display-md text-[var(--text)]">Un outil d'évaluation rigoureux et complet</h2>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mt-2 font-semibold">Gagnez du temps tout en maintenant l'exigence académique</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {FRENCH_FEATURES.map((feature, i) => (
                <div key={i} className="card p-6 sm:p-8 bg-[var(--surface)] space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all border border-[var(--border)]/45">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                    <feature.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--text)]">{feature.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specialties and grade focus */}
        <section className="max-w-4xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="serif text-display-md text-[var(--text)]">Adapté à toutes les classes du Lycée</h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
              De la classe de Seconde pour consolider les bases jusqu'au niveau Terminale Spécialité pour l'épreuve finale du Bac.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 text-center max-w-2xl mx-auto">
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--accent)]">Physique-Chimie</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Mécanique, thermodynamique, synthèse organique, ondes, électricité, réactions chimiques. Questions de type I (synthèse) et type II (raisonnement scientifique).
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--accent)]">Mathématiques</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Suites, fonctions, limites, dérivation, probabilités discrètes, géométrie dans l'espace. Exercices complets et QCM d'entraînement.
              </p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="card p-8 border-[var(--accent)]/40 border bg-[var(--accent-light)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-[var(--accent)]/5 rounded-3xl mt-12">
            <div className="space-y-2">
              <h3 className="serif text-xl text-[var(--text)] font-semibold">Rejoignez les enseignants de l'AEFE</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md">
                Essayez le générateur gratuitement. Concevez votre premier sujet de devoir surveillé et exportez-le directement sur Word.
              </p>
            </div>
            <Link href="/auth/register" className="inline-flex items-center gap-1.5 h-11 px-6 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-95 shadow-sm whitespace-nowrap self-stretch md:self-auto justify-center">
              Commencer gratuitement <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <LandingFAQ items={BAC_FRANCAIS_FAQ_ITEMS} title="Tout ce qu'il faut savoir" eyebrow="Questions fréquentes" />
      </main>

      <PublicFooter />
    </div>
  );
}
