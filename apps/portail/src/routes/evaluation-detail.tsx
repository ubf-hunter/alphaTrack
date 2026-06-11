// apps/portail/src/routes/evaluation-detail.tsx
import { Icon } from '@alphatrack/ui';
import { useMesNotes } from '../hooks/useResultats';

export function EvaluationDetail({ id, onBack }: { id: string, onBack: () => void }) {
    const { data: notes, isLoading } = useMesNotes(id);

    return (
        <main className="min-h-screen bg-white">
            <header className="p-4 border-b flex items-center gap-4">
                <button onClick={onBack} className="p-2 -ml-2">
                    <Icon name="ArrowLeft" size={24} />
                </button>
                <h1 className="font-bold">Détail des notes</h1>
            </header>

            <div className="max-w-md mx-auto p-4">
                {isLoading ? (
                    <p>Chargement...</p>
                ) : (
                    <div className="space-y-3">
                        {notes?.map((n) => (
                            <div key={n.matiere.code} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div>
                                    <p className="font-medium text-slate-900">{n.matiere.nom}</p>
                                    <p className="text-xs text-slate-400">Coef. {n.matiere.coefficient}</p>
                                </div>
                                <div className="text-right">
                                    {n.absent ? (
                                        <span className="text-red-500 font-bold">ABS</span>
                                    ) : (
                                        <span className="text-lg font-bold text-blue-600">{n.valeur}/20</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}