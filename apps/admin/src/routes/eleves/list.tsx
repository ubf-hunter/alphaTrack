import { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  EmptyRow,
  Icon,
  IconButton,
  Input,
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
import { useElevesList, type EleveListItem } from '../../hooks/useEleves';
import { useConcoursList } from '../../hooks/useConcours';
import { useSousCentresList } from '../../hooks/useSousCentres';
import { useDeleteEleve } from '../../hooks/useEleves';
import { CreateEleveModal } from './create-modal';
import { ConfirmDeleteModal } from './confirm-delete';

export function ElevesListRoute(): JSX.Element {
  const [search, setSearch] = useState('');
  const [sousCentreId, setSousCentreId] = useState<string>('');
  const [concoursId, setConcoursId] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<EleveListItem | null>(null);

  const concours = useConcoursList();
  const sousCentres = useSousCentresList();
  const remove = useDeleteEleve();

  const { data, isLoading, error } = useElevesList({
    search,
    sousCentreId: sousCentreId || undefined,
    concoursId: concoursId || undefined,
  });

  const sousCentreOptions = useMemo(
    () => [
      { value: '', label: 'Tous les sous-centres' },
      ...(sousCentres.data ?? []).map((sc) => ({
        value: sc.id,
        label: `${sc.code} · ${sc.nom}`,
      })),
    ],
    [sousCentres.data],
  );

  const concoursOptions = useMemo(
    () => [
      { value: '', label: 'Tous les concours' },
      ...(concours.data ?? []).map((c) => ({ value: c.id, label: `${c.sigle} · ${c.nom}` })),
    ],
    [concours.data],
  );

  return (
    <div className="max-w-[1400px] mx-auto py-2">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Personnes
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Élèves
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Tous les élèves inscrits au centre — toutes sessions et tous concours confondus.
            Le matricule et le code d&apos;accès sont générés automatiquement à la création.
          </p>
        </div>
        <Button leftIcon={<Icon name="plus" />} onClick={() => setCreating(true)}>
          Nouvel élève
        </Button>
      </header>

      {/* Toolbar : search + filtres */}
      <div className="bg-surface-base border border-surface-border rounded-2xl p-4 mb-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1 min-w-0">
          <Input
            placeholder="Rechercher par matricule, nom, prénom…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Icon name="search" />}
          />
        </div>
        <div className="w-full md:w-64 shrink-0">
          <Select
            value={sousCentreId}
            onChange={(e) => setSousCentreId(e.target.value)}
            options={sousCentreOptions}
          />
        </div>
        <div className="w-full md:w-64 shrink-0">
          <Select
            value={concoursId}
            onChange={(e) => setConcoursId(e.target.value)}
            options={concoursOptions}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {(error as Error).message}
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {isLoading
            ? 'Chargement…'
            : `${data?.length ?? 0} élève${(data?.length ?? 0) > 1 ? 's' : ''}`}
        </p>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Élève</Th>
            <Th>Matricule</Th>
            <Th>Concours</Th>
            <Th>Sous-centre</Th>
            <Th>Paiement</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading && <LoadingRow colSpan={6} rows={4} />}
          {!isLoading && (data?.length ?? 0) === 0 && (
            <EmptyRow
              colSpan={6}
              message={
                search || sousCentreId || concoursId
                  ? 'Aucun résultat avec ces filtres.'
                  : 'Aucun élève inscrit. Crée le premier.'
              }
            />
          )}
          {data?.map((eleve) => (
            <Tr key={eleve.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar name={`${eleve.prenom} ${eleve.nom}`} src={eleve.photo_url} />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {eleve.prenom} {eleve.nom}
                    </p>
                    <p className="text-xs text-slate-400">
                      {eleve.sexe === 'F' ? 'Féminin' : 'Masculin'} ·{' '}
                      {formatDateNaissance(eleve.date_naissance)}
                    </p>
                  </div>
                </div>
              </Td>
              <Td>
                <span className="font-mono font-semibold text-slate-900">{eleve.matricule}</span>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {eleve.inscriptions.length === 0 ? (
                    <span className="text-xs text-slate-400">Aucune</span>
                  ) : (
                    eleve.inscriptions.map((i) => (
                      <Pill key={i.id} tone="lime" size="sm">
                        {i.concours?.sigle ?? '?'}
                      </Pill>
                    ))
                  )}
                </div>
              </Td>
              <Td>
                <div className="flex flex-col gap-0.5">
                  {Array.from(
                    new Set(
                      eleve.inscriptions
                        .map((i) => i.sous_centre?.code)
                        .filter((c): c is string => !!c),
                    ),
                  ).map((code) => (
                    <span key={code} className="text-xs font-mono text-slate-600">
                      {code}
                    </span>
                  ))}
                </div>
              </Td>
              <Td>
                <PaiementPill inscriptions={eleve.inscriptions} />
              </Td>
              <Td>
                <div className="flex items-center justify-end gap-1">
                  <IconButton label="Modifier" onClick={() => undefined}>
                    <Icon name="pencil" />
                  </IconButton>
                  <IconButton
                    label="Supprimer"
                    tone="danger"
                    onClick={() => setToDelete(eleve)}
                  >
                    <Icon name="trash" />
                  </IconButton>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <CreateEleveModal open={creating} onClose={() => setCreating(false)} />

      {toDelete && (
        <ConfirmDeleteModal
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          eleve={toDelete}
          isPending={remove.isPending}
          onConfirm={async () => {
            await remove.mutateAsync(toDelete.id);
            setToDelete(null);
          }}
        />
      )}
    </div>
  );
}

function formatDateNaissance(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function PaiementPill({
  inscriptions,
}: {
  inscriptions: EleveListItem['inscriptions'];
}): JSX.Element {
  if (inscriptions.length === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const statuts = new Set(inscriptions.map((i) => i.statut_paiement));

  if (statuts.size === 1) {
    const s = inscriptions[0]!.statut_paiement;
    if (s === 'paye') return <Pill tone="success" size="sm">Payé</Pill>;
    if (s === 'partiel') return <Pill tone="warning" size="sm">Partiel</Pill>;
    return <Pill tone="danger" size="sm">Non payé</Pill>;
  }

  return <Pill tone="info" size="sm">Mixte</Pill>;
}
