// apps/portail/src/routes/dashboard.tsx
import { useAuth } from '../lib/auth-context';
import { useMesResultats } from '../hooks/useResultats';
import { Button, Card, Pill, Icon } from '@alphatrack/ui';
import { useState } from 'react';
import { EvaluationDetail } from './evaluation-detail';

export function DashboardPage() {
    const { eleve, logout } = useAuth();
    const { data: resultats, isLoading } = useMesResultats();
    const [selectedEvalId, setSelectedEvalId] = useState<string | null>(null);

    if (selectedEvalId) {
        return <EvaluationDetail id={selectedEvalId} onBack={() => setSelectedEvalId(null)} />;
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-12">
            {/* Header Mobile-First */}
            <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
                <div className="max-w-md mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Mes Résultats</h1>
                        <p className="text-xs text-slate-500">{eleve.nom} {eleve.prenom}</p>
                    </div>
                    <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500">
                        <Icon name="LogOut" size={20} />
                    </button>
                </div>
            </header>

            <div className="max-w-md mx-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="text-center py-12 text-slate-400">Chargement...</div>
                ) : resultats?.length === 0 ? (
                    <Card className="p-8 text-center space-y-3">
                        <Icon name="Inbox" size={48} className="mx-auto text-slate-200" />
                        <p className="text-slate-500">Aucun résultat n'est encore publié.</p>
                    </Card>
                ) : (
                    resultats?.map((res) => (
                        <Card
                            key={res.evaluation_id}
                            className="p-5 hover:border-blue-300 transition-colors cursor-pointer group"
                            onClick={() => setSelectedEvalId(res.evaluation_id)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900">{res.evaluation_titre}</h3>
                                    <p className="text-xs text-slate-500">{res.concours_sigle}</p>
                                </div>
                                <Pill tone={res.moyenne >= 10 ? 'success' : 'danger'}>
                                    {res.moyenne.toFixed(2)}/20
                                </Pill>
                            </div>

                            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase text-slate-400">Rang Nat.</p>
                                    <p className="font-bold text-slate-700">{res.rang_national}e</p>
                                </div>
                                <div className="text-center border-x border-slate-100">
                                    <p className="text-[10px] uppercase text-slate-400">Rang Rég.</p>
                                    <p className="font-bold text-slate-700">{res.rang_regional}e</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] uppercase text-slate-400">Rang S.C.</p>
                                    <p className="font-bold text-slate-700">{res.rang_sous_centre}e</p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </main>
    );
}