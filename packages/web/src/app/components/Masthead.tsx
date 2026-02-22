export function Masthead() {
  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-8 py-24">
      {/* Large horizontal pill-shaped photograph */}
      <div
        className="w-full max-w-[1100px] h-[420px] rounded-full overflow-hidden mb-16 shadow-[0_2px_40px_rgba(0,0,0,0.08)]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1767477665589-3e729f5909f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBjaXJjdWl0JTIwZGF0YSUyMHZpc3VhbGl6YXRpb258ZW58MXx8fHwxNzcxNzYyOTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Centered title and subtitle */}
      <div className="max-w-[600px] text-center">
        <h1
          className="text-[64px] leading-[1] tracking-[-0.02em] mb-5"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Lemma Oracle
        </h1>
        <p className="font-mono text-[13px] text-black/60 tracking-wide leading-relaxed">
          A reasoning engine for long‑horizon decisions
        </p>
      </div>
    </section>
  );
}
