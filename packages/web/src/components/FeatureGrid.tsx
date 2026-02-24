import { ShieldCheck, FileLock, Eye } from "lucide-react";
import type { Translations } from "../i18n/translations";

interface FeatureItemProps {
  icon: React.ReactNode;
  heading: string;
  body: string;
}

function FeatureItem({ icon, heading, body }: FeatureItemProps) {
  return (
    <div className="border border-black/5 p-8 transition-colors hover:bg-black/[0.01]">
      <div className="mb-4 flex h-8 items-start text-black/40">{icon}</div>
      <h3
        className="mb-3 text-[24px] leading-[1.2] tracking-[-0.01em]"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        {heading}
      </h3>
      <p className="text-[13px] leading-relaxed text-black/60">{body}</p>
    </div>
  );
}

interface FeatureGridProps {
  t: Translations["features"];
}

export function FeatureGrid({ t }: FeatureGridProps) {
  return (
    <section className="border-b border-black/5">
      <div className="mx-auto max-w-[1400px] px-8 py-20">
        <div className="grid grid-cols-3 gap-px bg-black/5">
          <FeatureItem
            icon={<ShieldCheck size={32} strokeWidth={1} />}
            heading={t.verifiedDataHeading}
            body={t.verifiedDataBody}
          />
          <FeatureItem
            icon={<FileLock size={32} strokeWidth={1} />}
            heading={t.privacyHeading}
            body={t.privacyBody}
          />
          <FeatureItem
            icon={<Eye size={32} strokeWidth={1} />}
            heading={t.shareHeading}
            body={t.shareBody}
          />
        </div>
      </div>
    </section>
  );
}
