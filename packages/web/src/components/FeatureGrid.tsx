import { ShieldCheck, FileLock, Eye } from "lucide-react";

interface FeatureItemProps {
  icon: React.ReactNode;
  heading: string;
  body: string;
}

function FeatureItem({ icon, heading, body }: FeatureItemProps) {
  return (
    <div className="border border-black/5 p-8 hover:bg-black/[0.01] transition-colors">
      <div className="mb-4 text-black/40 h-8 flex items-start">
        {icon}
      </div>
      <h3
        className="text-[24px] leading-[1.2] mb-3 tracking-[-0.01em]"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        {heading}
      </h3>
      <p className="text-[13px] text-black/60 leading-relaxed">{body}</p>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <section className="border-b border-black/5">
      <div className="max-w-[1400px] mx-auto px-8 py-20">
        <div className="grid grid-cols-3 gap-px bg-black/5">
          <FeatureItem
            icon={<ShieldCheck size={32} strokeWidth={1} />}
            heading="Verified Data for AI"
            body="Ground your AI in cryptographically verified facts. Lemma's verified-attributes API returns only ZK-proven data to your AI — eliminating hallucinations at the source."
          />
          <FeatureItem
            icon={<FileLock size={32} strokeWidth={1} />}
            heading="Privacy by Default"
            body="Your AI gets verified answers — never the raw data. Documents stay encrypted end-to-end; Lemma itself never sees plaintext."
          />
          <FeatureItem
            icon={<Eye size={32} strokeWidth={1} />}
            heading="Share Only What's Needed"
            body="Control exactly which attributes your AI can access. Prove 'age ≥ 18' without exposing the actual age, name, or address."
          />
        </div>
      </div>
    </section>
  );
}
