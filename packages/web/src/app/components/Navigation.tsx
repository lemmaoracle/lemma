export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-black/5">
      <div className="max-w-[1400px] mx-auto px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="font-mono text-[11px] tracking-wider uppercase text-black/50">
          Lemma Oracle
        </div>
        
        {/* Navigation links */}
        <ul className="flex gap-6 items-center font-mono text-[11px] tracking-wide uppercase">
          <li>
            <a href="#overview" className="hover:opacity-50 transition-opacity">
              Overview
            </a>
          </li>
          <li>
            <a href="#changelog" className="hover:opacity-50 transition-opacity">
              Changelog
            </a>
          </li>
          <li>
            <a href="#essays" className="hover:opacity-50 transition-opacity">
              Essays
            </a>
          </li>
          <li>
            <a href="#docs" className="hover:opacity-50 transition-opacity">
              Docs
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}