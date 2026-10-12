import { BlogArticleDates } from "@/components/blog/BlogArticleDates";
import { BLOG_EDITORIAL, BLOG_REFRESH_DATE, blogFigurePath } from "@/data/blogEditorial";
import { staticBlogMetadata } from "@/lib/blogMetadata";
import { buildBlogArticleSchema, buildBlogBreadcrumbSchema } from "@/lib/blogSchema";
import { BlogArticleFigure } from "@/components/blog/BlogArticleFigure";
import { BlogPracticalExample } from "@/components/blog/BlogPracticalExample";
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
import { BlogFAQ } from "@/components/blog/BlogFAQ";
import { SchemaOrg } from "@/components/SchemaOrg";
import { buildFaqSchema } from "@/components/landing/LandingFAQ";

export const metadata = staticBlogMetadata("generate-bac-francais-devoir");

const FAQ_ITEMS = [
  {
    q: "Le générateur remplace-t-il les annales et sujets zéro officiels ?",
    a: "Non. Les annales et sujets zéro restent la référence pour le format et le barème officiels. Imtihan génère un sujet inédit, de difficulté comparable, sur le même chapitre — pour tester la compréhension plutôt que la mémorisation d'un exercice déjà vu, tout en gardant les annales disponibles pour la révision.",
  },
  {
    q: "Quels chapitres de Physique-Chimie spécialité Terminale sont couverts ?",
    a: "Mécanique, énergie, ondes et signaux en physique ; équilibres chimiques et acide-base, cinétique chimique, et chimie organique (stratégies de synthèse) en chimie — les chapitres réellement présents dans la base de données curriculaire d'Imtihan pour ce niveau, validés avant génération.",
  },
  {
    q: "La grille d'évaluation générée suit-elle les compétences officielles (APP, ANA, REA, VAL, COM) ?",
    a: "Oui, la grille associée à chaque sujet généré est structurée par compétence, dans la logique de la grille officielle du Bac Français, pour rester directement utilisable en salle de classe sans reformatage.",
  },
];

export default function FrenchBacDevoirBlogPage() {
  const editorial = BLOG_EDITORIAL["generate-bac-francais-devoir"];
  const title = editorial.title;
  const url = "https://imtihan.live/blog/generate-bac-francais-devoir";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <BlogProgressBar />
      <SchemaOrg
        schema={[
          buildBlogArticleSchema({ slug: "generate-bac-francais-devoir", title, description: editorial.description, published: editorial.published, modified: BLOG_REFRESH_DATE, language: editorial.language, image: blogFigurePath(editorial.figure) }),
          buildBlogBreadcrumbSchema("generate-bac-francais-devoir", title),
          buildFaqSchema(FAQ_ITEMS),
        ]}
      />
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

          <BlogArticleDates published={editorial.published} french={editorial.language === "fr"} />
          <BlogArticleFigure kind={editorial.figure} french={editorial.language === "fr"} />

          <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.1rem] leading-relaxed">
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 font-medium">
              Un générateur de devoir Bac Français aide à préparer un brouillon de physique-chimie à partir des chapitres enseignés. Définissez la durée, les compétences et le barème, puis vérifiez les calculs et le corrigé. Le professeur reste responsable de la conformité au programme et des critères retenus.
            </p>

            <h2 id="competences" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Les exigences des DS de spécialité</h2>
            <p>
              Les devoirs de Physique-Chimie en spécialité Terminale ne se limitent plus à de simples résolutions d&apos;équations. Ils demandent aux élèves de mobiliser leurs connaissances sur la mécanique (seconde loi de Newton, mouvement dans un champ gravitationnel), l&apos;énergie (bilan et rendement d&apos;une conversion), les ondes et signaux, les équilibres chimiques et l&apos;acide-base, la cinétique chimique, ou la chimie organique — puis de structurer une synthèse de documents à partir de résultats expérimentaux, en mobilisant les cinq compétences évaluées à l&apos;écrit.
            </p>
            <p>
              Pour les enseignants du réseau AEFE, élaborer ces évaluations implique de jongler entre les sujets zéro, les annales et les exigences de la grille de correction officielle par compétences (APP, ANA, REA, VAL, COM), dont la structure de l&apos;épreuve de spécialité physique-chimie est fixée par une note de service officielle du ministère de l&apos;Éducation nationale depuis la session 2021 (
              <a href="https://www.education.gouv.fr/bo/20/Special2/MENE2001798N.htm" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2">MENE2001798N</a>
              ). Composer un sujet qui respecte à la fois le fond scientifique et cette structure par compétences prend, en pratique, plusieurs heures à un enseignant qui part d&apos;une page blanche.
            </p>

            <BlogCallout
              title="Conseil de prof"
              content="Pour le Bac Français, veillez à toujours insérer au moins une question de raisonnement critique ou d'analyse d'incertitudes expérimentales. Ce sont des points clés de l'épreuve de Physique-Chimie."
            />

            <h2 id="le-generateur" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Comment fonctionne le générateur Imtihan ?</h2>
            <p>
              Imtihan propose un modèle d&apos;intelligence artificielle configuré pour le programme national français. Voici les étapes pour préparer un brouillon à relire :
            </p>
            <ol className="list-decimal pl-6 space-y-3 mt-4 text-xs text-[var(--text-secondary)]">
              <li><strong>Sélectionnez la classe et la matière :</strong> Choisissez <em>Bac Français</em>, Terminale Spécialité, et Physique-Chimie.</li>
              <li><strong>Décrivez le sujet :</strong> Saisissez vos thématiques (ex: <em>&quot;mouvement dans un champ gravitationnel, avec un exercice sur le suivi temporel d&apos;une réaction chimique&quot;</em>).</li>
              <li><strong>Chargez vos documents :</strong> Ajoutez vos notes et indiquez si le document doit fournir le contenu, inspirer les exercices ou guider la structure. Vérifiez les notations retenues par l&apos;IA.</li>
              <li><strong>Générez et validez :</strong> L&apos;outil génère l&apos;énoncé structuré et la grille d&apos;évaluation associée. Les équations s&apos;affichent au format LaTeX.</li>
            </ol>

            <h2 id="exportation" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Exportation fluide vers Word</h2>
            <p>
              Une fois satisfait de votre sujet, exportez-le en format Word (.docx) d&apos;un seul clic. Vous obtiendrez un document modifiable, avec une mise en page soignée et des formules éditables sous l&apos;éditeur de Microsoft Word. De quoi gagner un temps précieux chaque semaine, sujet après sujet.
            </p>

            <h2 id="fidelite" className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif">Un sujet fidèle au programme officiel</h2>
            <p>
              Les chapitres sélectionnés guident la génération. Vérifiez toutefois que chaque exercice reste dans le périmètre réellement enseigné et que ses hypothèses sont explicites. Pour la physique-chimie, fournissez votre composition ou un sujet de référence ; les profils de structure intégrés ne couvrent pas toutes les matières.
            </p>
            <BlogPracticalExample slug="generate-bac-francais-devoir" />
            <BlogFAQ items={FAQ_ITEMS} />
          </article>

          <BlogAuthor
            name="Imtihan Editorial Team"
            role="Imtihan"
            avatarText="IM"
            bio="Rédigé par l'équipe éditoriale d'Imtihan, en s'appuyant sur le programme réel du Bac Français que couvre le produit."
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
