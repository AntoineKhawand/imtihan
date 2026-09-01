import Link from "next/link";
import { ArrowRight, Check, Star, BookOpen, GraduationCap, Award, Printer } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SchemaOrg } from "@/components/SchemaOrg";
import { LandingFAQ, buildFaqSchema } from "@/components/landing/LandingFAQ";

export const metadata = {
  title: "Générateur d'Examen Bac Libanais IA | Imtihan",
  description: "Le premier générateur d'examen Bac Libanais intelligent. Créez des examens blancs et contrôles (Terminale SG, SV, SE, LH et Brevet EB9) avec corrigé complet en 30 secondes.",
  alternates: { canonical: "/generateur-examen-bac-libanais" },
  openGraph: {
    title: "Générateur d'Examen Bac Libanais avec IA — Imtihan",
    description: "Concevez des devoirs et contrôles conformes aux exigences officielles du Ministère de l'Éducation libanais (Dawrat, Brevet, Terminale).",
    url: "https://imtihan.live/generateur-examen-bac-libanais",
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
    body: "Prise en charge complète du Brevet (EB9) et des quatre branches du Baccalauréat Libanais (Terminale SG, SV, SE et LH). Sciences, maths, histoire-géo, philosophie..."
  },
  {
    icon: BookOpen,
    title: "Soutien du Français, Anglais et Arabe",
    body: "Concevez vos exercices en français ou en anglais pour les sciences (Maths, Physique, Chimie, SVT) et en arabe littéraire pour les matières littéraires et d'histoire-géographie."
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
    a: "Vous pouvez générer vos exercices en français ou en anglais pour les matières scientifiques (Mathématiques, Physique, Chimie, SVT), et en arabe littéraire pour l'histoire-géographie et les matières littéraires.",
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
            "description": "Le premier générateur d'examen Bac Libanais intelligent. Créez des examens blancs et contrôles (Terminale SG, SV, SE, LH et Brevet EB9) avec corrigé complet en 30 secondes.",
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

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/75 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
        <Logo size={26} />
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
            Se connecter <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <main className="flex-grow pt-24">
        {/* Hero */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-6 md:px-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.04] blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          
          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--accent)] font-bold uppercase tracking-widest mx-auto">
              <Star size={12} className="fill-[var(--accent)]" /> Modèle spécifique au programme libanais
            </div>

            <h1 className="serif text-display-xl text-[var(--text)] leading-tight tracking-tight max-w-2xl mx-auto">
              Le premier <span className="italic text-[var(--accent)]">générateur d'examen Bac Libanais</span> dopé à l'IA.
            </h1>

            <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              Dites adieu aux heures passées à recopier d'anciennes Dawrat. Rédigez votre consigne ou déposez vos cours, et Imtihan crée des exercices de physique, chimie, SVT ou mathématiques conformes aux exigences officielles libanaises.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-95 shadow-lg shadow-[var(--accent)]/15">
                Créer un examen Bac Libanais <ArrowRight size={16} />
              </Link>
              <Link href="/#how" className="inline-flex items-center justify-center h-12 px-7 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium hover:bg-[var(--surface)] transition-all">
                Voir la démonstration
              </Link>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="px-6 md:px-10 py-20 bg-[var(--bg-subtle)] border-t border-b border-[var(--border)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="serif text-display-md text-[var(--text)]">Pourquoi utiliser Imtihan pour vos classes au Liban ?</h2>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mt-2 font-semibold">Une productivité décuplée pour les enseignants libanais</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {FEATURES.map((feature, i) => (
                <div key={i} className="card p-8 bg-[var(--surface)] space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all border border-[var(--border)]/45">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                    <feature.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--text)]">{feature.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{feature.body}</p>
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
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Génération de problèmes complexes en Analyse, Géométrie, Mécanique Newtonienne, Électricité, Chimie Organique, Génétique et SVT.
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--accent)]">Terminale SE / LH</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Exercices adaptés en Statistiques, Probabilités simples, Économie de marché libanaise, Sociologie et philosophie libanaise officielle.
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[var(--accent)]">Brevet Libanais (EB9)</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Questions d'entraînements classiques en Algèbre, Théorème de Thalès/Pythagore, Physique (Optique/Forces), Chimie des solutions et SVT.
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
