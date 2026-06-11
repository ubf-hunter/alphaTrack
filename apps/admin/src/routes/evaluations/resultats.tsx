import {
  Button,
  EmptyRow,
  Field,
  LoadingRow,
  Pill,
  Select,
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@alphatrack/ui';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useConcoursList } from '../../hooks/useConcours';
import { useEvaluation } from '../../hooks/useEvaluations';
import { useResultats } from '../../hooks/useResultats';
import { downloadFile, objectsToCsv } from '../../lib/csv';

export function EvaluationResultatsRoute(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [concoursId, setConcoursId] = useState('');
  const [nonClasseOnly, setNonClasseOnly] = useState(false);

  const { data: evaluation, isLoading: evalLoading, error: evalError } = useEvaluation(id);
  const concours = useConcoursList();

  const { data: resultats, isLoading: resLoading, error: resError } = useResultats(
    concoursId && evaluation
      ? {
        evaluationId: evaluation.id,
        concoursId,
        nonClasseOnly,
      }
      : undefined,
  );

  const concoursOptions = useMemo(
    () => [
      { value: '', label: 'Choisir un concours…' },
      ...(concours.data ?? [])
        .filter((c) => c.actif)
        .map((c) => ({ value: c.id, label: `${c.sigle} · ${c.nom}` })),
    ],
    [concours.data],
  );

  if (evalLoading) {
    return (
      <div className="max-w-[1400px] mx-auto py-8">
        <LoadingRow colSpan={1} rows={1} />
      </div>
    );
  }

  if (evalError || !evaluation) {
    return (
      <div className="max-w-[1400px] mx-auto py-8 text-danger text-sm">
        {(evalError as Error)?.message ?? 'Évaluation introuvable.'}
      </div>
    );
  }

  const notReady = !['calcule', 'publie', 'archive'].includes(evaluation.statut);
  const handleExport = () => {
    if (!resultats || resultats.length === 0) return;

    const columns = [
      { key: 'rang_national', header: 'Rang National' },
      { key: 'matricule', header: 'Matricule' },
      { key: 'nom_complet', header: 'Nom Complet' },
      { key: 'moyenne', header: 'Moyenne' },
      { key: 'rang_sous_centre', header: 'Rang SC' },
    ];

    // On transforme les données pour qu'elles soient "plates" pour le CSV
    const flatData = resultats.map(r => ({
      rang_national: r.rang_national ?? '—',
      matricule: r.eleve?.matricule ?? '—',
      nom_complet: `${r.eleve?.nom} ${r.eleve?.prenom}`,
      moyenne: r.moyenne?.toFixed(2) ?? '—',
      rang_sous_centre: r.rang_sous_centre ?? '—',
    }));

    const csv = objectsToCsv(flatData, columns as any);
    downloadFile(csv, `resultats_${evaluation?.libelle.replace(/\s+/g, '_')}.csv`);
  };

  return (
    <div className="max-w-[1400px] mx-auto py-2">
      <Link
        to={`/evaluations/${evaluation.id}`}
        className="inline-block text-sm text-slate-500 hover:text-slate-800 mb-4"
      >
        ← {evaluation.libelle}
      </Link>

      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Classements</h1>
          <p className="text-sm text-slate-500 mt-1">
            Moyennes et rangs national, régional et sous-centre.
          </p>
        </div>
        {resultats && resultats.length > 0 && (
          <Button onClick={handleExport} variant="secondary">
            Exporter en CSV
          </Button>
        )}
      </header>

      {notReady && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-warning/10 border border-warning/30 text-warning text-sm">
          L&apos;évaluation doit être calculée avant d&apos;afficher les classements.
        </div>
      )}

      <div className="bg-surface-base border border-surface-border rounded-2xl p-4 mb-4 shadow-sm flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <Field id="concours-res" label="Concours">
            <Select
              id="concours-res"
              value={concoursId}
              onChange={(e) => setConcoursId(e.target.value)}
              options={concoursOptions}
            />
          </Field>
        </div>
        <div className="flex items-center gap-3 pb-1">
          <Switch
            checked={nonClasseOnly}
            onChange={(e) => setNonClasseOnly(e.target.checked)}
          />
          <span className="text-sm text-slate-600">Non classés uniquement</span>
        </div>
      </div>

      {resError && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {(resError as Error).message}
        </div>
      )}

      {concoursId && (
        <Table>
          <Thead>
            <Tr>
              <Th>Rang nat.</Th>
              <Th>Rang rég.</Th>
              <Th>Rang SC</Th>
              <Th>Matricule</Th>
              <Th>Élève</Th>
              <Th>Moyenne</Th>
              <Th>Statut</Th>
            </Tr>
          </Thead>
          <Tbody>
            {resLoading && <LoadingRow colSpan={7} rows={6} />}
            {!resLoading && resultats?.length === 0 && (
              <EmptyRow colSpan={7} message="Aucun résultat pour ce concours." />
            )}
            {resultats?.map((r) => (
              <Tr key={r.inscription_id ?? `${r.eleve_id}-${r.concours_id}`}>
                <Td className="font-mono">{r.rang_national ?? '—'}</Td>
                <Td className="font-mono">{r.rang_regional ?? '—'}</Td>
                <Td className="font-mono">{r.rang_sous_centre ?? '—'}</Td>
                <Td className="font-mono text-sm">{r.eleve?.matricule ?? '—'}</Td>
                <Td className="font-medium">
                  {r.eleve ? `${r.eleve.nom} ${r.eleve.prenom}` : '—'}
                </Td>
                <Td className="font-mono">
                  {r.moyenne != null ? r.moyenne.toFixed(2) : '—'}
                </Td>
                <Td>
                  {r.non_classe ? (
                    <Pill tone="warning">Non classé</Pill>
                  ) : (
                    <Pill tone="success">Classé</Pill>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
