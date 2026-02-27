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
    <div className="border border-black/5 p-8 transition-colors hover:bg-black/[0.01]">
      <div className="mb-4 flex h-8 items-start text-black/40">{icon}</div>
      <h3
        className="mb-3 text-3xl leading-[1.2] tracking-[-0.02em]"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        {heading}
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-black/60">{body}</p>
      <a
        href={blogPath}
        className="inline-flex items-center gap-1 font-mono text-[11px] tracking-wide text-black/50 transition-colors hover:text-black/80"
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
      <div className="mx-auto max-w-[1400px] px-8 py-20">
        {/* Section heading */}
        <h2
          className="mb-12 text-center text-5xl leading-[1.2] tracking-[-0.02em]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {t.sectionHeading}
        </h2>

        <div className="grid grid-cols-3 gap-px bg-black/5">
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
