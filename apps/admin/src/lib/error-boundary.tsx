import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

interface Props {
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Boundary caught:', error, info);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', padding: 40, fontFamily: 'Inter, sans-serif', background: '#fafaf7', color: '#001A51' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a5302a' }}>
            Erreur au démarrage
          </p>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, margin: '8px 0 16px' }}>
            L&apos;application n&apos;a pas pu démarrer
          </h1>
          <pre style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #e2dfd2', overflow: 'auto', fontSize: 13, color: '#a5302a' }}>
            {this.state.error.message}
          </pre>
          <p style={{ marginTop: 24, fontSize: 14, color: '#475569' }}>
            Vérifie la console du navigateur (F12 → Console) pour la stack trace complète, et
            le terminal qui exécute <code>pnpm dev:admin</code>.
          </p>
        </main>
      );
    }
    return this.props.children;
  }
}
