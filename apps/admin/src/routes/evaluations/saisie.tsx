import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Button,
  EmptyRow,
  Field,
  Icon,
  Input,
  LoadingRow,
  Select,
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@alphatrack/ui';
import { useAuth } from '../../lib/auth-context';
import { useConcoursList } from '../../hooks/useConcours';
import { useCoefficientsList } from '../../hooks/useCoefficients';
import { useMatieresList } from '../../hooks/useMatieres';
import { useEvaluation } from '../../hooks/useEvaluations';
import { useNotesGrid, useUpsertNotesBatch, type NoteGridRow } from '../../hooks/useNotes';

export function EvaluationSaisieRoute(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { admin } = useAuth();

  const [concoursId, setConcoursId] = useState('');
  const [matiereId, setMatiereId] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { note: string; absent: boolean }>>({});

  const { data: evaluation, isLoading: evalLoading, error: evalError } = useEvaluation(id);
  const concours = useConcoursList();
  const matieres = useMatieresList();
  const coefficients = useCoefficientsList();

  const sousCentreId =
    admin?.role === 'saisie' ? (admin.sous_centre_id ?? undefined) : undefined;

  const gridParams = useMemo(() => {
    if (!evaluation || !concoursId || !matiereId) return undefined;
    const base = {
      evaluationId: evaluation.id,
      concoursId,
      matiereId,
      session: evaluation.session,
    };
    return sousCentreId ? { ...base, sousCentreId } : base;
  }, [evaluation, concoursId, matiereId, sousCentreId]);

  const { data: rows, isLoading: gridLoading, error: gridError } = useNotesGrid(gridParams);
  const saveBatch = useUpsertNotesBatch();

  const matieresForConcours = useMemo(() => {
    if (!concoursId || !coefficients.data || !matieres.data) return [];
    const matiereIds = new Set(
      coefficients.data.filter((c) => c.concours_id === concoursId).map((c) => c.matiere_id),
    );
    return matieres.data.filter((m) => matiereIds.has(m.id));
  }, [concoursId, coefficients.data, matieres.data]);

  const concoursOptions = useMemo(
    () => [
      { value: '', label: 'Choisir un concours…' },
      ...(concours.data ?? [])
        .filter((c) => c.actif)
        .map((c) => ({ value: c.id, label: `${c.sigle} · ${c.nom}` })),
    ],
    [concours.data],
  );

  const matiereOptions = useMemo(
    () => [
      { value: '', label: 'Choisir une matière…' },
      ...matieresForConcours.map((m) => ({
        value: m.id,
        label: `${m.code} · ${m.nom}`,
      })),
    ],
    [matieresForConcours],
  );

  function getDraft(row: NoteGridRow): { note: string; absent: boolean } {
    return (
      drafts[row.inscription_id] ?? {
        note: row.note != null ? String(row.note) : '',
        absent: row.absent,
      }
    );
  }

  function updateDraft(inscriptionId: string, patch: Partial<{ note: string; absent: boolean }>) {
    setDrafts((prev) => {
      const row = rows?.find((r) => r.inscription_id === inscriptionId);
      const base = prev[inscriptionId] ?? {
        note: row?.note != null ? String(row.note) : '',
        absent: row?.absent ?? false,
      };
      return { ...prev, [inscriptionId]: { ...base, ...patch } };
    });
  }

  async function handleSaveAll(): Promise<void> {
    if (!evaluation || !matiereId || !rows) return;

    const items = rows.map((row) => {
      const draft = getDraft(row);
      const absent = draft.absent;
      const note = absent ? null : draft.note.trim() === '' ? null : parseFloat(draft.note.replace(',', '.'));
      return {
        inscription_id: row.inscription_id,
        evaluation_id: evaluation.id,
        matiere_id: matiereId,
        note: absent ? null : note,
        absent,
        saisie_par: admin?.id ?? null,
      };
    }).filter((item) => item.absent || item.note !== null);

    await saveBatch.mutateAsync(items);
    setDrafts({});
  }

  const saisieBlocked =
    evaluation &&
    evaluation.statut !== 'saisie' &&
    admin?.role === 'saisie';

  if (evalLoading) {
    return (
      <div className="max-w-[1200px] mx-auto py-8">
        <LoadingRow colSpan={1} rows={1} />
      </div>
    );
  }

  if (evalError || !evaluation) {
    return (
      <div className="max-w-[1200px] mx-auto py-8 text-danger text-sm">
        {(evalError as Error)?.message ?? 'Évaluation introuvable.'}
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto py-2">
      <Link
        to={`/evaluations/${evaluation.id}`}
        className="inline-block text-sm text-slate-500 hover:text-slate-800 mb-4"
      >
        ← {evaluation.libelle}
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Saisie des notes</h1>
        <p className="text-sm text-slate-500 mt-1">
          Session {evaluation.session}
          {admin?.role === 'saisie' && ' · Ton sous-centre uniquement'}
        </p>
      </header>

      {saisieBlocked && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-warning/10 border border-warning/30 text-warning text-sm">
          La saisie n&apos;est pas ouverte pour cette évaluation (statut : {evaluation.statut}).
        </div>
      )}

      <div className="bg-surface-base border border-surface-border rounded-2xl p-4 mb-4 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field id="concours" label="Concours">
          <Select
            id="concours"
            value={concoursId}
            onChange={(e) => {
              setConcoursId(e.target.value);
              setMatiereId('');
            }}
            options={concoursOptions}
          />
        </Field>
        <Field id="matiere" label="Matière">
          <Select
            id="matiere"
            value={matiereId}
            onChange={(e) => setMatiereId(e.target.value)}
            options={matiereOptions}
            disabled={!concoursId}
          />
        </Field>
      </div>

      {(gridError || saveBatch.error) && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {((gridError ?? saveBatch.error) as Error).message}
        </div>
      )}

      {concoursId && matiereId && (
        <>
          <div className="flex justify-between items-center mb-3 gap-3 flex-wrap">
            <p className="text-sm text-slate-500">
              {rows ? `${rows.length} élève(s)` : 'Chargement…'}
            </p>
            <Button
              leftIcon={<Icon name="check" />}
              loading={saveBatch.isPending}
              disabled={saisieBlocked || !rows?.length}
              onClick={() => void handleSaveAll()}
            >
              Enregistrer les notes
            </Button>
          </div>

          <Table>
            <Thead>
              <Tr>
                <Th>Matricule</Th>
                <Th>Nom</Th>
                {admin?.role === 'admin' && <Th>Sous-centre</Th>}
                <Th>Note (/20)</Th>
                <Th>Absent</Th>
              </Tr>
            </Thead>
            <Tbody>
              {gridLoading && <LoadingRow colSpan={admin?.role === 'admin' ? 5 : 4} rows={5} />}
              {!gridLoading && rows?.length === 0 && (
                <EmptyRow
                  colSpan={admin?.role === 'admin' ? 5 : 4}
                  message="Aucun élève inscrit pour ce concours et cette session."
                />
              )}
              {rows?.map((row) => {
                const draft = getDraft(row);
                return (
                  <Tr key={row.inscription_id}>
                    <Td className="font-mono text-sm">{row.matricule}</Td>
                    <Td className="font-medium">
                      {row.nom} {row.prenom}
                    </Td>
                    {admin?.role === 'admin' && (
                      <Td className="font-mono text-slate-500">{row.sous_centre_code}</Td>
                    )}
                    <Td>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        step={0.01}
                        className="max-w-[100px]"
                        value={draft.absent ? '' : draft.note}
                        disabled={draft.absent || !!saisieBlocked}
                        placeholder="—"
                        onChange={(e) =>
                          updateDraft(row.inscription_id, { note: e.target.value })
                        }
                      />
                    </Td>
                    <Td>
                      <Switch
                        checked={draft.absent}
                        disabled={!!saisieBlocked}
                        onChange={(e) =>
                          updateDraft(row.inscription_id, {
                            absent: e.target.checked,
                            note: e.target.checked ? '' : draft.note,
                          })
                        }
                      />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </>
      )}
    </div>
  );
}
