import { Navigation } from "./components/Navigation";
import { Masthead } from "./components/Masthead";
import { BlogList } from "./components/BlogList";

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] relative overflow-x-hidden">
      {/* Subtle grain texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      
      <Navigation />
      
      <main className="relative pt-14">
        <Masthead />
        <BlogList />
      </main>
      
      <footer className="border-t border-black/5 py-8 relative">
        <div className="max-w-[1400px] mx-auto px-8">
          <p className="font-mono text-[10px] text-black/30 tracking-wide">
            © 2026 Lemma Oracle — Built for decisions that matter
          </p>
        </div>
      </footer>
    </div>
  );
}