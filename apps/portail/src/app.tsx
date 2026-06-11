import { AuthProvider, useAuth } from './lib/auth-context';
import { DashboardPage } from './routes/dashboard';
import { LoginPage } from './routes/login';

function AppContent() {
  const { eleve, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si pas connecté, on montre le login
  if (!eleve) {
    return <LoginPage />;
  }

  // Si connecté, on montre le dashboard
  return <DashboardPage />;
}

export function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}