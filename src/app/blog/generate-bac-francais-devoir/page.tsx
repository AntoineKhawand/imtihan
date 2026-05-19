import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { BlogProgressBar } from "@/components/blog/BlogProgressBar";
import { BlogCalculator } from "@/components/blog/BlogCalculator";
import { BlogAuthor } from "@/components/blog/BlogAuthor";
import { BlogShare } from "@/components/blog/BlogShare";
import { BlogTableOfContents } from "@/components/blog/BlogTableOfContents";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { BlogRelated } from "@/components/blog/BlogRelated";

export const metadata: Metadata = {
  title: "Générateur de Devoir Bac Français : Physique-Chimie | Imtihan Blog",
  description: "Découvrez comment concevoir des Devoirs Surveillés (DS) de spécialité Physique-Chimie conformes au Baccalauréat Français (AEFE) en 5 minutes grâce à l'IA.",
};

export default function FrenchBacDevoirBlogPage() {
  const title = "Générateur de devoir Bac Français : Gagnez des heures sur vos DS de physique-chimie";
  const url = "https://imtihan.live/blog/generate-bac-francais-devoir";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <BlogProgressBar />
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/75 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
        <Logo size={26} />
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
            Essayer Imtihan <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1fr_300px] gap-12 px-6 md:px-10 py-16 md:py-24">
        <main>
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors mb-8">
            <ArrowLeft size={14} /> Retour au Blog
          </Link>
          <h1 className="serif text-display-lg text-[var(--text)] leading-[1.1] mb-8 text-balance">{title}</h1>

          <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.1rem] leading-relaxed">
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 font-medium">
              Concevoir des sujets de Physique-Chimie pour la spécialité de Terminale au Lycée Français exige un investissement considérable : recherche documentaire, adaptation aux compétences officielles et rédaction d'un corrigé détaillé.
            </p>

            <h2 id="competences" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Les exigences des DS de spécialité</h2>
            <p>
              Les devoirs de Physique-Chimie en spécialité Terminale ne se limitent plus à de simples résolutions d'équations. Ils demandent aux élèves d'analyser des documents scientifiques, de mobiliser leurs connaissances sur la thermodynamique, l'acide-base ou la mécanique de Newton, et de structurer des synthèses de documents.
            </p>
            <p>
              Pour les enseignants du réseau AEFE, élaborer ces évaluations implique de jongler entre les sujets zéro, les annales et les exigences de la grille de correction officielle par compétences (APP, ANA, REA, VAL, COM).
            </p>

            <BlogCallout 
              title="Conseil de prof" 
              content="Pour le Bac Français, veillez à toujours insérer au moins une question de raisonnement critique ou d'analyse d'incertitudes expérimentales. Ce sont des points clés de l'épreuve de Physique-Chimie." 
            />

            <h2 id="le-generateur" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Comment fonctionne le générateur Imtihan ?</h2>
            <p>
              Imtihan propose un modèle d'intelligence artificielle configuré pour le programme national français. Voici comment concevoir un sujet en 5 minutes :
            </p>
            <ol className="list-decimal pl-6 space-y-3 mt-4 text-xs text-[var(--text-secondary)]">
              <li><strong>Sélectionnez la classe et la matière :</strong> Choisissez <em>Bac Français</em>, Terminale Spécialité, et Physique-Chimie.</li>
              <li><strong>Décrivez le sujet :</strong> Saisissez vos thématiques (ex: <em>\"Mécanique céleste et lois de Kepler avec un exercice sur l'évolution temporelle d'un système chimique\"</em>).</li>
              <li><strong>Chargez vos documents :</strong> Copiez-collez vos notes de cours ou TP pour que l'IA respecte vos notations et exemples vus en classe.</li>
              <li><strong>Générez et validez :</strong> L'outil génère l'énoncé structuré et la grille d'évaluation associée. Les équations s'affichent au format LaTeX.</li>
            </ol>

            <h2 id="exportation" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Exportation fluide vers Word</h2>
            <p>
              Une fois satisfait de votre sujet, exportez-le en format Word (.docx) d'un seul clic. Vous obtiendrez un document modifiable, avec une mise en page soignée et des formules éditables sous l'éditeur de Microsoft Word. De quoi gagner un temps précieux chaque semaine.
            </p>
          </article>

          <BlogAuthor 
            name="Marc Dupont"
            role="Professeur de Physique-Chimie"
            avatarText="MD"
            bio="Marc enseigne la Physique-Chimie au sein du réseau AEFE depuis plus de 10 ans. Il participe régulièrement aux jurys de correction du Baccalauréat Français."
          />
          <BlogRelated currentSlug="generate-bac-francais-devoir" />

          {/* MOBILE WIDGETS */}
          <div className="lg:hidden mt-12 space-y-10 border-t border-[var(--border)] pt-12">
            <BlogCalculator />
            <BlogShare title={title} url={url} />
          </div>
        </main>

        <aside className="hidden lg:flex flex-col gap-10 sticky top-24 self-start">
          <BlogTableOfContents />
          <BlogCalculator />
          <BlogShare title={title} url={url} />
        </aside>
      </div>

      <footer className="px-6 md:px-10 py-12 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size={24} />
          <p className="text-xs text-[var(--text-tertiary)] text-center">© {new Date().getFullYear()} Imtihan</p>
        </div>
      </footer>
    </div>
  );
}
