import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { PublicFooter } from "@/components/layout/PublicFooter";
export const metadata = {
  title: "Copyright & uploaded materials",
  description: "How to report copyright concerns about material on Imtihan.",
  alternates: { canonical: "/copyright" },
  openGraph: {
    title: "Copyright & uploaded materials | Imtihan",
    description: "Upload rights and copyright reporting for Imtihan.",
    url: "/copyright",
  },
};
export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border)] px-6 py-5">
        <Logo size={28} />
      </header>
      <main className="mx-auto max-w-2xl space-y-8 px-6 py-16 text-sm leading-relaxed">
        <h1 className="serif text-4xl">Copyright & uploaded materials</h1>
        <p>
          Use materials you created, licensed, or otherwise have permission to
          process and share. Educational use alone does not automatically give
          permission to upload or redistribute an entire work.
        </p>
        <section className="space-y-3">
          <h2 className="serif text-2xl">Report a copyright concern</h2>
          <p>
            Email{" "}
            <a
              className="underline"
              href="mailto:admin@imtihan.live?subject=Copyright%20report"
            >
              admin@imtihan.live
            </a>{" "}
            with:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Your contact details and whether you are the rights holder or
              their representative.
            </li>
            <li>
              A description of the copyrighted work and the exact Imtihan URL or
              other information that identifies the material.
            </li>
            <li>
              An explanation of the alleged unauthorized use, and any supporting
              information.
            </li>
            <li>
              A statement that your report is accurate and that you are
              authorized to make it.
            </li>
          </ul>
          <p>
            We review reports and may restrict access to disputed material or
            accounts that repeatedly infringe others’ rights. Do not include
            unnecessary sensitive information. We may share relevant allegations
            with the uploader when needed to investigate.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="serif text-2xl">U.S. DMCA notices</h2>
          <p>
            This is a general reporting contact. It is not a claim that Imtihan
            has registered a designated DMCA agent or qualifies for a statutory
            safe harbor. For the official notice requirements, see the{" "}
            <a className="underline" href="https://www.copyright.gov/512/">
              U.S. Copyright Office’s Section 512 guidance
            </a>
            .
          </p>
        </section>
        <p>
          <Link className="underline" href="/terms#uploads">
            Uploaded document terms
          </Link>{" "}
          ·{" "}
          <Link className="underline" href="/privacy">
            Privacy policy
          </Link>
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
