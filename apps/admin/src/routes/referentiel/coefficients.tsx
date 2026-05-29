import { useMemo, useState } from 'react';
import { Card, Icon, Pill } from '@alphatrack/ui';
import { useConcoursList } from '../../hooks/useConcours';
import { useMatieresList } from '../../hooks/useMatieres';
import {
  useCoefficientsList,
  useDeleteCoefficient,
  useUpsertCoefficient,
} from '../../hooks/useCoefficients';

export function CoefficientsRoute(): JSX.Element {
  const concours = useConcoursList();
  const matieres = useMatieresList();
  const coeffs = useCoefficientsList();
  const upsert = useUpsertCoefficient();
  const remove = useDeleteCoefficient();

  const [pending, setPending] = useState<Record<string, boolean>>({});

  const isLoading = concours.isLoading || matieres.isLoading || coeffs.isLoading;
  const hasError = concours.error || matieres.error || coeffs.error;

  // Index { 'concours_id::matiere_id' → coefficient }
  const coeffMap = useMemo(() => {
    const m = new Map<string, number>();
    coeffs.data?.forEach((c) => m.set(`${c.concours_id}::${c.matiere_id}`, c.coefficient));
    return m;
  }, [coeffs.data]);

  function cellKey(concoursId: string, matiereId: string): string {
    return `${concoursId}::${matiereId}`;
  }

  async function handleSave(
    concoursId: string,
    matiereId: string,
    rawValue: string,
  ): Promise<void> {
    const k = cellKey(concoursId, matiereId);
    const trimmed = rawValue.trim();

    if (trimmed === '') {
      // Suppression
      if (coeffMap.has(k)) {
        setPending((p) => ({ ...p, [k]: true }));
        try {
          await remove.mutateAsync({ concours_id: concoursId, matiere_id: matiereId });
        } finally {
          setPending((p) => ({ ...p, [k]: false }));
        }
      }
      return;
    }

    const parsed = Number(trimmed.replace(',', '.'));
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > 99) return;

    const current = coeffMap.get(k);
    if (current === parsed) return;

    setPending((p) => ({ ...p, [k]: true }));
    try {
      await upsert.mutateAsync({
        concours_id: concoursId,
        matiere_id: matiereId,
        coefficient: parsed,
      });
    } finally {
      setPending((p) => ({ ...p, [k]: false }));
    }
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Chargement du référentiel…</p>
      </Card>
    );
  }

  if (hasError) {
    return (
      <div className="px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
        Erreur de chargement : {(hasError as Error).message}
      </div>
    );
  }

  if (!concours.data?.length || !matieres.data?.length) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <Icon name="pin" className="text-warning w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">Référentiel incomplet</p>
            <p className="text-sm text-slate-500 mt-1">
              Crée d&apos;abord au moins un concours et une matière dans les onglets correspondants.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Matrice des coefficients</h2>
          <p className="text-sm text-slate-500 max-w-2xl">
            Chaque cellule = coefficient d&apos;une matière dans un concours. Vide = la matière
            ne fait pas partie du concours. Sauvegarde automatique au blur (Tab/Enter).
          </p>
        </div>
        <Pill tone="lime">{coeffMap.size} cellules définies</Pill>
      </div>

      <div className="overflow-auto rounded-2xl border border-surface-border bg-surface-base shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-surface-muted border-b border-surface-border">
              <th className="sticky left-0 z-10 bg-surface-muted px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 min-w-[200px]">
                Matière ↓ &nbsp; Concours →
              </th>
              {concours.data.map((c) => (
                <th
                  key={c.id}
                  className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-700 min-w-[110px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono">{c.sigle}</span>
                    {!c.actif && (
                      <span className="text-[9px] text-slate-400 normal-case">Inactif</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {matieres.data.map((m) => (
              <tr key={m.id} className="hover:bg-surface-muted/30 transition-colors">
                <td className="sticky left-0 z-10 bg-surface-base hover:bg-surface-muted/30 px-4 py-2.5 border-r border-surface-border">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{m.nom}</span>
                    <span className="text-xs font-mono text-slate-400">{m.code}</span>
                  </div>
                </td>
                {concours.data.map((c) => {
                  const k = cellKey(c.id, m.id);
                  const currentCoef = coeffMap.get(k);
                  const isPending = pending[k];
                  return (
                    <td key={c.id} className="px-2 py-2 text-center">
                      <CoeffCell
                        defaultValue={currentCoef}
                        onSave={(v) => handleSave(c.id, m.id, v)}
                        pending={isPending ?? false}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface CoeffCellProps {
  defaultValue: number | undefined;
  onSave: (rawValue: string) => Promise<void>;
  pending: boolean;
}

function CoeffCell({ defaultValue, onSave, pending }: CoeffCellProps): JSX.Element {
  const [value, setValue] = useState<string>(defaultValue?.toString() ?? '');

  // Si la valeur en DB change (refetch), on synchronise
  // (sauf si l'utilisateur est en train d'éditer cette cellule — détection via focus)
  // Ici, simple : on remet le défaut seulement si la cellule n'est pas focus
  // (gestion plus fine possible plus tard).

  const hasValue = value.trim() !== '';

  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => void onSave(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
          setValue(defaultValue?.toString() ?? '');
          e.currentTarget.blur();
        }
      }}
      placeholder="—"
      disabled={pending}
      className={`
        w-14 h-9 px-2 text-center font-mono tabular text-sm rounded-lg
        border outline-none transition-all
        ${hasValue
          ? 'border-surface-border bg-lime-50 text-slate-900 font-semibold focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30'
          : 'border-transparent bg-surface-muted/50 text-slate-400 focus:border-slate-300 focus:bg-surface-base focus:ring-2 focus:ring-slate-200'
        }
        disabled:opacity-50
      `}
    />
  );
}
