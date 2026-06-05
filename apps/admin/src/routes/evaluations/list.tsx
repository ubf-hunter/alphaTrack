import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EVALUATION_STATUTS, Utils, type EvaluationStatut } from '@alphatrack/shared';
import {
  Button,
  EmptyRow,
  Icon,
  IconButton,
  LoadingRow,
  Pill,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@alphatrack/ui';
import {
  useCreateEvaluation,
  useEvaluationsList,
  useDeleteEvaluation,
  type EvaluationListFilters,
} from '../../hooks/useEvaluations';
import { evalStatutLabel, evalStatutTone } from '../../lib/evaluation-statut';
import { EvaluationFormModal } from './form-modal';

export function EvaluationsListRoute(): JSX.Element {
  const [sessionFilter, setSessionFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [creating, setCreating] = useState(false);

  const create = useCreateEvaluation();
  const remove = useDeleteEvaluation();

  const filters = useMemo((): EvaluationListFilters | undefined => {
    const f: EvaluationListFilters = {};
    if (sessionFilter) f.session = sessionFilter;
    if (statutFilter && EVALUATION_STATUTS.includes(statutFilter as EvaluationStatut)) {
      f.statut = statutFilter as EvaluationStatut;
    }
    return Object.keys(f).length > 0 ? f : undefined;
  }, [sessionFilter, statutFilter]);

  const { data: list, isLoading, error } = useEvaluationsList(filters);

  const sessionOptions = useMemo(() => {
    const sessions = new Set(list?.map((e) => e.session) ?? []);
    sessions.add(Utils.sessionAnneeCourante());
    return [
      { value: '', label: 'Toutes les sessions' },
      ...[...sessions].sort().reverse().map((s) => ({ value: s, label: s })),
    ];
  }, [list]);

  const statutOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'composition', label: 'En composition' },
    { value: 'saisie', label: 'Saisie en cours' },
    { value: 'calcule', label: 'Calculée' },
    { value: 'publie', label: 'Publiée' },
    { value: 'archive', label: 'Archivée' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto py-2">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Évaluations
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Évaluations blanches
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Crée et pilote le cycle de vie des évaluations : composition, saisie des notes,
            calcul des rangs et publication.
          </p>
        </div>
        <Button leftIcon={<Icon name="plus" />} onClick={() => setCreating(true)}>
          Nouvelle évaluation
        </Button>
      </header>

      <div className="bg-surface-base border border-surface-border rounded-2xl p-4 mb-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="w-full md:w-56">
          <Select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            options={sessionOptions}
          />
        </div>
        <div className="w-full md:w-56">
          <Select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            options={statutOptions}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {(error as Error).message}
        </div>
      )}

      <Table>
        <Thead>
          <Tr>
            <Th>Libellé</Th>
            <Th>N°</Th>
            <Th>Session</Th>
            <Th>Yaoundé</Th>
            <Th>Dschang</Th>
            <Th>Statut</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading && <LoadingRow colSpan={7} rows={4} />}
          {!isLoading && list?.length === 0 && (
            <EmptyRow colSpan={7} message="Aucune évaluation. Crée la première." />
          )}
          {list?.map((ev) => (
            <Tr key={ev.id}>
              <Td>
                <Link
                  to={`/evaluations/${ev.id}`}
                  className="font-medium text-slate-900 hover:text-lime-700 transition-colors"
                >
                  {ev.libelle}
                </Link>
              </Td>
              <Td className="font-mono text-slate-600">{ev.numero}</Td>
              <Td className="font-mono text-slate-600">{ev.session}</Td>
              <Td className="text-slate-600">{Utils.formatDateCourtFr(ev.date_yaounde)}</Td>
              <Td className="text-slate-600">{Utils.formatDateCourtFr(ev.date_dschang)}</Td>
              <Td>
                <Pill tone={evalStatutTone(ev.statut)}>{evalStatutLabel(ev.statut)}</Pill>
              </Td>
              <Td>
                <div className="flex items-center justify-end gap-1">
                  <Link to={`/evaluations/${ev.id}`}>
                    <IconButton label="Voir le détail">
                      <Icon name="chevron-right" />
                    </IconButton>
                  </Link>
                  {ev.statut === 'brouillon' && (
                    <IconButton
                      label="Supprimer"
                      tone="danger"
                      onClick={() => {
                        if (window.confirm(`Supprimer « ${ev.libelle} » ?`)) {
                          void remove.mutateAsync(ev.id);
                        }
                      }}
                    >
                      <Icon name="trash" />
                    </IconButton>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <EvaluationFormModal
        open={creating}
        onClose={() => setCreating(false)}
        title="Nouvelle évaluation"
        submitLabel="Créer"
        onSubmit={async (values) => {
          await create.mutateAsync({
            ...values,
            statut: 'brouillon',
          });
          setCreating(false);
        }}
      />
    </div>
  );
}
