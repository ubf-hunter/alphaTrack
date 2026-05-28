export function App(): JSX.Element {
  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-sm text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-ink-400">
          Alpha Center · Portail élève
        </p>
        <h1 className="display text-6xl text-ink-700 tabular">5ᵉ</h1>
        <p className="text-ink-500 leading-relaxed">
          Bientôt, tu pourras consulter ici tes résultats, ta moyenne et ton rang.
        </p>
        <p className="text-xs text-ink-300">Phase 0 — fondations</p>
      </div>
    </main>
  );
}
