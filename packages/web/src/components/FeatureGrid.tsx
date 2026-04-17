import { ShieldCheck, FileLock, Eye, FileSearch, FileType, Anchor } from "lucide-react";
import type { Translations } from "../i18n/translations";

interface FeatureItemProps {
  icon: React.ReactNode;
  heading: string;
  body: string;
  slug: string;
  locale: "en" | "ja";
}

function FeatureItem({ icon, heading, body, slug, locale }: FeatureItemProps) {
  const blogPath = locale === "ja" ? `/ja/blog/${slug}` : `/blog/${slug}`;

  return (
    <div className="border border-black/5 p-4 transition-colors hover:bg-black/[0.01] sm:p-6 lg:p-8">
      <div className="mb-3 flex h-6 items-start text-black/40 sm:h-7 sm:mb-4 lg:h-8">{icon}</div>
      <h3
        className="mb-2 text-xl leading-[1.2] tracking-[-0.02em] sm:text-2xl lg:text-3xl lg:mb-3"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        {heading}
      </h3>
      <p className="mb-3 text-xs leading-relaxed text-black/60 sm:text-sm sm:mb-4">{body}</p>
      <a
        href={blogPath}
        className="inline-flex items-center gap-1 font-mono text-sm tracking-wide text-black/50 transition-colors hover:text-black/80 sm:text-base"
      >
        Read the guide →
      </a>
    </div>
  );
}

interface FeatureGridProps {
  t: Translations["features"];
  locale: "en" | "ja";
}

export function FeatureGrid({ t, locale }: FeatureGridProps) {
  return (
    <section className="border-b border-black/5">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Section heading */}
        <h2
          className="mb-8 text-center text-3xl leading-[1.2] tracking-[-0.02em] sm:text-4xl sm:mb-10 lg:text-5xl lg:mb-12"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {t.sectionHeading}
        </h2>

        <div className="grid grid-cols-1 gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureItem
            icon={<ShieldCheck size={32} strokeWidth={1} />}
            heading={t.encryptHeading}
            body={t.encryptBody}
            slug="encrypt-everything-expose-nothing"
            locale={locale}
          />
          <FeatureItem
            icon={<FileLock size={32} strokeWidth={1} />}
            heading={t.proveHeading}
            body={t.proveBody}
            slug="prove-facts-with-zero-knowledge"
            locale={locale}
          />
          <FeatureItem
            icon={<Eye size={32} strokeWidth={1} />}
            heading={t.discloseHeading}
            body={t.discloseBody}
            slug="disclose-only-what-ai-needs"
            locale={locale}
          />
          <FeatureItem
            icon={<FileSearch size={32} strokeWidth={1} />}
            heading={t.queryHeading}
            body={t.queryBody}
            slug="query-verified-attributes"
            locale={locale}
          />
          <FeatureItem
            icon={<FileType size={32} strokeWidth={1} />}
            heading={t.schemaHeading}
            body={t.schemaBody}
            slug="define-your-domain-as-a-schema"
            locale={locale}
          />
          <FeatureItem
            icon={<Anchor size={32} strokeWidth={1} />}
            heading={t.provenanceHeading}
            body={t.provenanceBody}
            slug="provenance-that-never-disappears"
            locale={locale}
          />
        </div>
      </div>
    </section>
  );
}
