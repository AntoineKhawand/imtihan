import { GeneratorLandingHero, GeneratorLandingNav } from "@/components/landing/GeneratorLandingHero";
import Link from "next/link";
import { ArrowRight, Check, Star, BookOpen, GraduationCap, Award, Printer } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SchemaOrg } from "@/components/SchemaOrg";
import { LandingFAQ, buildFaqSchema } from "@/components/landing/LandingFAQ";

export const metadata = {
  title: "Générateur d'Examen Bac Libanais IA | Imtihan",
  description: "Créez des contrôles et sujets d’entraînement Bac Libanais ou Brevet avec corrigé détaillé. Relisez les chapitres, la structure et le barème avant export.",
  alternates: { canonical: "/generateur-examen-bac-libanais" },
  openGraph: {
    type: "website",
    title: "Générateur d'Examen Bac Libanais avec IA — Imtihan",
    description: "Concevez des devoirs et contrôles conformes aux exigences officielles du Ministère de l'Éducation libanais (Dawrat, Brevet, Terminale).",
    url: "https://imtihan.live/generateur-examen-bac-libanais",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Imtihan — AI Exam Generator" }],
  },
};

const FEATURES = [
  {
    icon: Award,
    title: "Conforme aux Dawrat Officielles",
    body: "Générez des questions qui respectent scrupuleusement la structure et la rigueur des examens officiels libanais pour préparer vos élèves dans les meilleures conditions."
  },
  {
    icon: GraduationCap,
    title: "Toutes les Sections Libanaises",
    body: "Prise en charge du Brevet (EB9) et des quatre branches du Baccalauréat Libanais (Terminale SG, SV, SE et LH), avec un focus sur les mathématiques, la physique et la chimie."
  },
  {
    icon: BookOpen,
    title: "Soutien du Français et de l'Anglais",
    body: "Concevez vos exercices de Mathématiques, Physique et Chimie en français ou en anglais, selon la langue d'enseignement de votre classe."
  },
  {
    icon: Printer,
    title: "Export direct Word & PDF",
    body: "Exportez vos examens prêts pour l'impression en format .docx modifiable ou PDF en un clic. La mise en page professionnelle est automatique."
  }
];

const BAC_LIBANAIS_FAQ_ITEMS = [
  {
    q: "Le générateur respecte-t-il le format des examens officiels libanais ?",
    a: "Oui. Les examens générés respectent la structure, la rigueur et le barème des Dawrat officielles du Ministère de l'Éducation libanais, pour le Brevet (EB9) comme pour les quatre sections du Baccalauréat (SG, SV, SE, LH).",
  },
  {
    q: "Dans quelles langues puis-je générer mes examens ?",
    a: "Vous pouvez générer vos exercices en français ou en anglais pour les matières scientifiques : Mathématiques, Physique et Chimie.",
  },
  {
    q: "Le corrigé est-il inclus automatiquement ?",
    a: "Oui, chaque examen généré est accompagné d'un corrigé détaillé avec méthodologie complète, formules, et barème par question — prêt à distribuer ou à garder pour la correction.",
  },
  {
    q: "Est-ce gratuit pour commencer ?",
    a: "Oui, chaque enseignant peut générer un premier examen complet gratuitement, sans carte bancaire. L'abonnement Pro débloque ensuite 10 examens par mois (20 en formule annuelle).",
  },
  {
    q: "Puis-je exporter mes examens en Word ou PDF ?",
    a: "Oui. Chaque examen et son corrigé s'exportent en un clic au format .docx modifiable ou en PDF prêt à imprimer, mise en page professionnelle incluse.",
  },
];

export default function BacLibanaisLanding() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <SchemaOrg
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Imtihan — Générateur d'examen Bac Libanais IA",
            "url": "https://imtihan.live/generateur-examen-bac-libanais",
            "description": "Créez des contrôles et sujets d’entraînement Bac Libanais ou Brevet avec corrigé détaillé. Relisez les chapitres, la structure et le barème avant export.",
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
                "educationalFramework": "Lebanese National Curriculum (CRDP Liban)",
                "targetName": "Baccalauréat Libanais (Terminale SG, SV, SE, LH)",
                "targetUrl": "https://imtihan.live/generateur-examen-bac-libanais"
              },
              {
                "@type": "AlignmentObject",
                "alignmentType": "educationalSubject",
                "educationalFramework": "Lebanese National Curriculum (CRDP Liban)",
                "targetName": "Brevet Libanais (EB9)",
                "targetUrl": "https://imtihan.live/generateur-examen-bac-libanais"
              }
            ]
          },
          buildFaqSchema(BAC_LIBANAIS_FAQ_ITEMS),
        ]}
      />

      <GeneratorLandingNav french={true} />
      <main className="flex-grow pt-16">
        <GeneratorLandingHero {...{
  "french": true,
  "eyebrow": "Bac Libanais · Brevet & Terminale",
  "title": "Vos prochains examens.",
  "accent": "Plus de temps pour enseigner.",
  "description": "Créez des exercices de mathématiques, physique et chimie à partir des chapitres enseignés. Choisissez une structure, relisez les questions et exportez un sujet avec son corrigé détaillé.",
  "cta": "Créer mon examen gratuit",
  "preview": {
    "title": "Mathématiques · Entraînement",
    "level": "Terminale Sciences générales · Référence 2024",
    "duration": "3 heures",
    "marks": "Maximum : 20 points",
    "instructions": "Exemple basé sur la session ordinaire 2024 : sept exercices proposés, cinq à traiter. La structure reste à relire avant génération.",
    "sections": [
      {
        "title": "7 exercices proposés",
        "detail": "4 points par exercice, avec des questions progressives."
      },
      {
        "title": "5 exercices au choix",
        "detail": "Le total correspond aux réponses demandées, pas à tous les exercices proposés."
      },
      {
        "title": "Un corrigé complet",
        "detail": "Méthode et barème pour chacun des sept exercices."
      }
    ]
  }
}} />

        {/* Value Proposition */}
        <section className="px-6 md:px-10 py-20 bg-[var(--bg-subtle)] border-t border-b border-[var(--border)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="serif text-display-md text-[var(--text)]">Pourquoi utiliser Imtihan pour vos classes au Liban ?</h2>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mt-2 font-semibold">Une productivité décuplée pour les enseignants libanais</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {FEATURES.map((feature, i) => (
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

        {/* Syllabus Coverage */}
        <section className="max-w-4xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="serif text-display-md text-[var(--text)]">Une couverture complète du curriculum libanais</h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              Que vous prépariez des élèves pour le Brevet national ou le Baccalauréat dans des écoles publiques ou privées à Beyrouth, Tripoli ou Saida.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--accent)]">Terminale SG / SV</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Génération de problèmes complexes en Analyse, Géométrie, Mécanique Newtonienne, Électricité et Chimie Organique.
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--accent)]">Terminale SE / LH</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Exercices adaptés en Statistiques et Probabilités simples — la partie mathématique du programme SE / LH.
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--accent)]">Brevet Libanais (EB9)</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Questions d'entraînements classiques en Algèbre, Théorème de Thalès/Pythagore, Physique (Optique/Forces) et Chimie des solutions.
              </p>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="card p-8 border-[var(--accent)]/40 border bg-[var(--accent-light)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-[var(--accent)]/5 rounded-3xl mt-12">
            <div className="space-y-2">
              <h3 className="serif text-xl text-[var(--text)] font-semibold">Essayez gratuitement dès aujourd'hui</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md">
                Générez votre premier sujet complet de Bac Libanais ou Brevet avec corrigé détaillé sans carte de crédit.
              </p>
            </div>
            <Link href="/auth/register" className="inline-flex items-center gap-1.5 h-11 px-6 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-95 shadow-sm whitespace-nowrap self-stretch md:self-auto justify-center">
              Créer mon premier examen <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <LandingFAQ items={BAC_LIBANAIS_FAQ_ITEMS} title="Tout ce qu'il faut savoir" eyebrow="Questions fréquentes" />
      </main>

      <PublicFooter />
    </div>
  );
}
