import Image from "next/image";
import { blogFigurePath, type BlogEditorial } from "@/data/blogEditorial";

const CAPTIONS = {
  blueprint:
    "An assessment blueprint connects learning objectives, questions, marks and teacher review before export.",
  marking:
    "Illustrative marking example: award separate marks for choosing a method, applying it and interpreting the result. Adapt the criteria to your subject.",
  data: "Illustrative science-question design: give measurements and units, ask students to interpret the evidence, then assess their reasoning. These are teaching examples, not measured product results.",
};
export function BlogArticleFigure({
  kind,
  french = false,
}: {
  kind: BlogEditorial["figure"];
  french?: boolean;
}) {
  const caption = french
    ? "Exemple pédagogique : partir des mesures, demander une interprétation, puis vérifier le raisonnement. Ce schéma ne présente pas des statistiques de performance du produit."
    : CAPTIONS[kind];
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <Image
        src={blogFigurePath(kind)}
        alt={CAPTIONS[kind]}
        width={1200}
        height={630}
        className="h-auto w-full"
      />
      <figcaption className="px-5 py-4 text-sm leading-relaxed text-[var(--text-secondary)]">
        {caption}
      </figcaption>
    </figure>
  );
}
