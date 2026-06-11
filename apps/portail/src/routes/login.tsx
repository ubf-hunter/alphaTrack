import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { Button, Input } from '@alphatrack/ui';

export function LoginPage() {
    const [matricule, setMatricule] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(matricule, code);
        } catch (err) {
            setError('Identifiants invalides');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-ink-400">
                        Alpha Center
                    </p>
                    <h1 className="display text-4xl text-ink-700">Connexion</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <Input
                        label="Ton matricule"
                        placeholder="AC-26-XXXX"
                        value={matricule}
                        onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                        required
                    />
                    <Input
                        label="Ton code d'accès"
                        type="password"
                        placeholder="6 chiffres"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />

                    {error && <p className="text-red-500 text-xs">{error}</p>}

                    <Button type="submit" className="w-full" loading={isLoading}>
                        Accéder à mes résultats
                    </Button>
                </form>
            </div>
        </main>
    );
}