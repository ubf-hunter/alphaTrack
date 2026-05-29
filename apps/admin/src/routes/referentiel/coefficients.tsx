import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [savedFlash, setSavedFlash] = useState<Record<string, boolean>>({});

  const isLoading = concours.isLoading || matieres.isLoading || coeffs.isLoading;
  const hasError = concours.error || matieres.error || coeffs.error;

  const coeffMap = useMemo(() => {
    const m = new Map<string, number>();
    coeffs.data?.forEach((c) => m.set(`${c.concours_id}::${c.matiere_id}`, c.coefficient));
    return m;
  }, [coeffs.data]);

  function cellKey(concoursId: string, matiereId: string): string {
    return `${concoursId}::${matiereId}`;
  }

  function flashSaved(k: string): void {
    setSavedFlash((s) => ({ ...s, [k]: true }));
    setTimeout(() => setSavedFlash((s) => ({ ...s, [k]: false })), 1200);
  }

  async function handleSave(
    concoursId: string,
    matiereId: string,
    rawValue: string,
  ): Promise<void> {
    const k = cellKey(concoursId, matiereId);
    const trimmed = rawValue.trim();

    if (trimmed === '') {
      if (coeffMap.has(k)) {
        setPending((p) => ({ ...p, [k]: true }));
        try {
          await remove.mutateAsync({ concours_id: concoursId, matiere_id: matiereId });
          flashSaved(k);
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
      flashSaved(k);
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
      <div className="mb-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Matrice des coefficients</h2>
          <p className="text-sm text-slate-500 max-w-2xl">
            Clique sur une cellule, tape une valeur (0,01 → 99) puis{' '}
            <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-surface-base border border-surface-border rounded">
              Tab
            </kbd>{' '}
            ou{' '}
            <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-surface-base border border-surface-border rounded">
              Entrée
            </kbd>{' '}
            pour sauvegarder.{' '}
            <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-surface-base border border-surface-border rounded">
              Échap
            </kbd>{' '}
            annule. Vide la cellule pour retirer la matière du concours.
          </p>
        </div>
        <Pill tone="lime" size="md">
          {coeffMap.size} {coeffMap.size > 1 ? 'cellules' : 'cellule'} définies
        </Pill>
      </div>

      <div className="overflow-auto rounded-2xl border border-surface-border bg-surface-base shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-surface-muted border-b border-surface-border">
              <th className="sticky left-0 z-10 bg-surface-muted px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 min-w-[220px] border-r border-surface-border">
                Matière ↓ &nbsp; Concours →
              </th>
              {concours.data.map((c) => (
                <th
                  key={c.id}
                  className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-700 min-w-[120px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-slate-900">{c.sigle}</span>
                    {!c.actif && (
                      <span className="text-[9px] text-slate-400 normal-case">Inactif</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {matieres.data.map((m) => {
              const sumCoefs = concours.data.reduce((acc, c) => {
                return acc + (coeffMap.get(cellKey(c.id, m.id)) ?? 0);
              }, 0);
              return (
                <tr key={m.id} className="hover:bg-surface-muted/30 transition-colors group">
                  <td className="sticky left-0 z-10 bg-surface-base group-hover:bg-surface-muted/40 px-4 py-2.5 border-r border-surface-border transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-slate-800 truncate">{m.nom}</span>
                        <span className="text-xs font-mono text-slate-400">{m.code}</span>
                      </div>
                      {sumCoefs > 0 && (
                        <span className="shrink-0 text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-surface-muted">
                          Σ {sumCoefs}
                        </span>
                      )}
                    </div>
                  </td>
                  {concours.data.map((c) => {
                    const k = cellKey(c.id, m.id);
                    const currentCoef = coeffMap.get(k);
                    return (
                      <td key={c.id} className="px-2 py-2 text-center">
                        <CoeffCell
                          coefKey={k}
                          defaultValue={currentCoef}
                          onSave={(v) => handleSave(c.id, m.id, v)}
                          pending={pending[k] ?? false}
                          justSaved={savedFlash[k] ?? false}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          {/* Footer : total des coefficients par concours */}
          <tfoot>
            <tr className="bg-surface-muted/60 border-t-2 border-surface-border">
              <td className="sticky left-0 z-10 bg-surface-muted/80 px-4 py-2.5 border-r border-surface-border">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total coefficients
                </span>
              </td>
              {concours.data.map((c) => {
                const sum = matieres.data.reduce((acc, m) => {
                  return acc + (coeffMap.get(cellKey(c.id, m.id)) ?? 0);
                }, 0);
                return (
                  <td key={c.id} className="px-2 py-2.5 text-center">
                    {sum > 0 ? (
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-slate-900 text-lime-400 font-mono font-semibold text-xs tabular">
                        {sum}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

interface CoeffCellProps {
  coefKey: string;
  defaultValue: number | undefined;
  onSave: (rawValue: string) => Promise<void>;
  pending: boolean;
  justSaved: boolean;
}

function CoeffCell({
  coefKey,
  defaultValue,
  onSave,
  pending,
  justSaved,
}: CoeffCellProps): JSX.Element {
  const [value, setValue] = useState<string>(defaultValue?.toString() ?? '');
  const focused = useRef(false);

  // Synchronise la valeur locale avec defaultValue quand celle-ci change EN DEHORS
  // du focus utilisateur (refetch après sauvegarde, etc.)
  useEffect(() => {
    if (!focused.current) {
      setValue(defaultValue?.toString() ?? '');
    }
  }, [defaultValue, coefKey]);

  const hasValue = value.trim() !== '';

  return (
    <div className="relative inline-block">
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          void onSave(value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            setValue(defaultValue?.toString() ?? '');
            e.currentTarget.blur();
          }
        }}
        placeholder="—"
        disabled={pending}
        aria-label={`Coefficient ${coefKey}`}
        className={`
          w-16 h-10 px-2 text-center font-mono tabular text-sm rounded-lg
          border-2 outline-none transition-all cursor-text
          ${hasValue
            ? 'bg-lime-100 border-lime-300 text-slate-900 font-bold hover:bg-lime-200 hover:border-lime-400 focus:bg-lime-50 focus:border-lime-500 focus:ring-4 focus:ring-lime-400/30'
            : 'bg-surface-muted/40 border-transparent text-slate-400 hover:bg-surface-muted hover:border-slate-300 focus:bg-surface-base focus:border-slate-400 focus:ring-4 focus:ring-slate-200'
          }
          disabled:opacity-50 disabled:cursor-wait
        `.trim()}
      />
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="inline-block w-3 h-3 border-2 border-lime-600 border-r-transparent rounded-full animate-spin" />
        </span>
      )}
      {justSaved && !pending && (
        <span
          className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full pointer-events-none"
          aria-hidden
        />
      )}
    </div>
  );
}
