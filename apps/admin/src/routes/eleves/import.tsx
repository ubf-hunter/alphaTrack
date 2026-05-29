import { useState, useMemo, type ChangeEvent, type DragEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Icon, Pill } from '@alphatrack/ui';
import {
  validateRows,
  useBulkImportEleves,
  type ValidatedRow,
  type BulkImportSummary,
} from '../../hooks/useBulkImport';
import { downloadFile, objectsToCsv, parseCsv } from '../../lib/csv';

type Step = 'pick' | 'preview' | 'importing' | 'done';

export function ElevesImportRoute(): JSX.Element {
  const navigate = useNavigate();
  const { mutateAsync, progress, resetProgress } = useBulkImportEleves();

  const [step, setStep] = useState<Step>('pick');
  const [filename, setFilename] = useState<string>('');
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [headerErrors, setHeaderErrors] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [summary, setSummary] = useState<BulkImportSummary | null>(null);

  const validCount = useMemo(() => rows.filter((r) => r.status === 'valid').length, [rows]);
  const invalidCount = rows.length - validCount;

  async function handleFile(file: File): Promise<void> {
    setParseError(null);
    setFilename(file.name);
    try {
      const text = await file.text();
      const grid = parseCsv(text);
      const { rows: validated, headerErrors: errs } = validateRows(grid);
      setRows(validated);
      setHeaderErrors(errs);
      setStep('preview');
    } catch (err) {
      setParseError((err as Error).message);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault();
  }

  function resetAll(): void {
    setStep('pick');
    setFilename('');
    setRows([]);
    setHeaderErrors([]);
    setParseError(null);
    setSummary(null);
    resetProgress();
  }

  async function applyImport(): Promise<void> {
    setStep('importing');
    try {
      const result = await mutateAsync(rows.filter((r) => r.status === 'valid'));
      setSummary(result);
      setStep('done');
    } catch (err) {
      setParseError((err as Error).message);
      setStep('preview');
    }
  }

  function downloadTemplate(): void {
    const sample = [
      ['prenom', 'nom', 'sexe', 'date_naissance', 'telephone', 'email', 'concours_sigle', 'sous_centre_code'],
      ['Jean', 'Mbarga', 'M', '2007-03-15', '+237600000001', '', 'ENSPY', 'DSC-FOR'],
      ['Marie', 'Nkomo', 'F', '2008-01-22', '+237600000002', 'marie@example.cm', 'FMSB', 'YDE-ODZ'],
    ];
    const csv = sample.map((r) => r.join(',')).join('\n');
    downloadFile(`﻿${csv}\n`, 'modele-import-eleves.csv');
  }

  function downloadCodes(): void {
    if (!summary) return;
    const csv = objectsToCsv(
      summary.imported,
      [
        { key: 'matricule', header: 'Matricule' },
        { key: 'prenom', header: 'Prénom' },
        { key: 'nom', header: 'Nom' },
        { key: 'code_acces_clair', header: "Code d'accès" },
        { key: 'telephone', header: 'Téléphone' },
        { key: 'concours_sigle', header: 'Concours' },
        { key: 'sous_centre_code', header: 'Sous-centre' },
      ],
      ',',
    );
    const ts = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `codes-eleves-${ts}.csv`);
  }

  return (
    <div className="max-w-[1400px] mx-auto py-2">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Élèves
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Import en masse
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Importe plusieurs élèves d&apos;un coup depuis un fichier CSV. Le matricule et
            le code d&apos;accès sont générés automatiquement pour chacun. Une inscription
            initiale est créée si tu renseignes <span className="font-mono">concours_sigle</span> et{' '}
            <span className="font-mono">sous_centre_code</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/eleves')}>
            ← Retour à la liste
          </Button>
          <Button variant="secondary" onClick={downloadTemplate}>
            <Icon name="book" />
            Télécharger le modèle
          </Button>
        </div>
      </header>

      {step === 'pick' && (
        <Dropzone
          onPick={handleFile}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onInputChange={handleInputChange}
          parseError={parseError}
        />
      )}

      {step === 'preview' && (
        <Preview
          filename={filename}
          rows={rows}
          validCount={validCount}
          invalidCount={invalidCount}
          headerErrors={headerErrors}
          onCancel={resetAll}
          onApply={() => void applyImport()}
        />
      )}

      {step === 'importing' && (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-4 py-8">
            <span className="inline-block w-10 h-10 border-4 border-lime-400 border-r-transparent rounded-full animate-spin" />
            <p className="text-lg font-semibold text-slate-900">Import en cours…</p>
            <div className="w-full max-w-md">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-lime-400 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">
                {Math.round(progress)} %
              </p>
            </div>
            <p className="text-xs text-slate-400">Ne ferme pas la page.</p>
          </div>
        </Card>
      )}

      {step === 'done' && summary && (
        <ImportDone summary={summary} onDownloadCodes={downloadCodes} onRestart={resetAll} />
      )}
    </div>
  );
}

// ---------- Dropzone --------------------------------------------------------

interface DropzoneProps {
  onPick: (file: File) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  parseError: string | null;
}

function Dropzone({ onDrop, onDragOver, onInputChange, parseError }: DropzoneProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="rounded-2xl border-2 border-dashed border-surface-border bg-surface-base p-10 text-center transition-colors hover:border-slate-300 hover:bg-surface-muted/40"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="w-14 h-14 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center">
            <Icon name="plus" className="w-7 h-7" />
          </span>
          <div>
            <p className="text-lg font-bold text-slate-900">Dépose un fichier CSV ici</p>
            <p className="text-sm text-slate-500 mt-1">
              Ou clique pour en sélectionner un. Format attendu : encodage UTF-8.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 cursor-pointer transition-colors">
            <Icon name="book" />
            Choisir un fichier
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={onInputChange}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {parseError && (
        <div className="px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {parseError}
        </div>
      )}

      <Card tone="dark" padding="md">
        <div className="flex items-start gap-3">
          <Icon name="circle-check" className="text-lime-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-white mb-1">Format attendu</p>
            <p className="leading-relaxed">
              Colonnes (dans cet ordre, en-tête en première ligne) :{' '}
              <span className="font-mono text-lime-300">
                prenom, nom, sexe (M/F), date_naissance (YYYY-MM-DD), telephone, email,
                concours_sigle, sous_centre_code
              </span>
              . Les variantes <span className="font-mono">prénom</span>,{' '}
              <span className="font-mono">téléphone</span>, et séparateurs{' '}
              <span className="font-mono">;</span> sont acceptés. Si tu renseignes
              concours_sigle, sous_centre_code doit suivre (et inversement).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---------- Preview ---------------------------------------------------------

interface PreviewProps {
  filename: string;
  rows: ValidatedRow[];
  validCount: number;
  invalidCount: number;
  headerErrors: string[];
  onCancel: () => void;
  onApply: () => void;
}

function Preview({
  filename,
  rows,
  validCount,
  invalidCount,
  headerErrors,
  onCancel,
  onApply,
}: PreviewProps): JSX.Element {
  if (headerErrors.length > 0) {
    return (
      <Card padding="lg">
        <div className="flex items-start gap-3 mb-4">
          <Icon name="lock" className="text-danger shrink-0 mt-0.5 w-5 h-5" />
          <div>
            <p className="font-bold text-slate-900">Format de fichier incorrect</p>
            <p className="text-sm text-slate-500">
              {filename} — les colonnes obligatoires manquent.
            </p>
          </div>
        </div>
        <ul className="space-y-1 mb-5">
          {headerErrors.map((err, i) => (
            <li
              key={i}
              className="text-sm text-danger font-mono px-3 py-1.5 rounded-lg bg-danger/10"
            >
              {err}
            </li>
          ))}
        </ul>
        <Button variant="secondary" onClick={onCancel}>
          Choisir un autre fichier
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Pill tone="lime" size="md">
            {validCount} valide{validCount > 1 ? 's' : ''}
          </Pill>
          {invalidCount > 0 && (
            <Pill tone="danger" size="md">
              {invalidCount} erreur{invalidCount > 1 ? 's' : ''}
            </Pill>
          )}
          <span className="text-sm text-slate-500">
            depuis <span className="font-mono">{filename}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={onApply} disabled={validCount === 0}>
            Importer {validCount} élève{validCount > 1 ? 's' : ''}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface-base overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-surface-muted border-b border-surface-border">
            <tr>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-12">
                #
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-24">
                Statut
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Élève
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Naissance
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Inscription
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Erreurs
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {rows.map((row) => (
              <tr
                key={row.lineNumber}
                className={
                  row.status === 'invalid'
                    ? 'bg-danger/5'
                    : 'hover:bg-surface-muted/30 transition-colors'
                }
              >
                <td className="px-3 py-2.5 text-xs font-mono text-slate-400">{row.lineNumber}</td>
                <td className="px-3 py-2.5">
                  {row.status === 'valid' ? (
                    <Pill tone="success" size="sm">
                      OK
                    </Pill>
                  ) : (
                    <Pill tone="danger" size="sm">
                      Erreur
                    </Pill>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <div>
                    <p className="font-medium text-slate-800">
                      {row.raw['prenom']} {row.raw['nom']}
                    </p>
                    <p className="text-xs text-slate-400">
                      {row.raw['sexe']?.toUpperCase()} · {row.raw['telephone'] || '—'}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs font-mono text-slate-600">
                  {row.raw['date_naissance']}
                </td>
                <td className="px-3 py-2.5">
                  {row.raw['concours_sigle'] || row.raw['sous_centre_code'] ? (
                    <span className="text-xs">
                      <span className="font-mono font-semibold text-slate-700">
                        {row.raw['concours_sigle']}
                      </span>
                      {' @ '}
                      <span className="font-mono text-slate-500">
                        {row.raw['sous_centre_code']}
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {row.errors.length > 0 ? (
                    <ul className="text-xs text-danger space-y-0.5">
                      {row.errors.map((e, i) => (
                        <li key={i}>· {e}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-success">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Done ------------------------------------------------------------

interface ImportDoneProps {
  summary: BulkImportSummary;
  onDownloadCodes: () => void;
  onRestart: () => void;
}

function ImportDone({ summary, onDownloadCodes, onRestart }: ImportDoneProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <Card tone="dark" padding="lg" className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -bottom-12 -right-12 w-48 h-48 bg-lime-400 rounded-full blur-3xl opacity-20 pointer-events-none"
        />
        <div className="relative flex items-start gap-4">
          <span className="w-12 h-12 rounded-2xl bg-lime-400 text-slate-900 flex items-center justify-center shrink-0">
            <Icon name="circle-check" className="w-7 h-7" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-lime-300 font-semibold uppercase tracking-wider mb-1">
              Import terminé
            </p>
            <h2 className="text-xl font-bold text-white mb-1">
              {summary.imported.length} élève{summary.imported.length > 1 ? 's' : ''} importé{summary.imported.length > 1 ? 's' : ''}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Les matricules et codes d&apos;accès ont été générés. Télécharge le fichier
              ci-dessous — c&apos;est <strong>la seule fois</strong> où les codes en clair
              sont disponibles.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={onDownloadCodes} disabled={summary.imported.length === 0}>
          <Icon name="book" />
          Télécharger les codes ({summary.imported.length})
        </Button>
        <Link
          to="/eleves"
          className="inline-flex items-center justify-center gap-1.5 h-10 px-4 text-sm rounded-lg font-semibold bg-surface-base text-slate-700 border border-surface-border hover:bg-surface-muted hover:border-slate-300 transition-colors"
        >
          Voir la liste
        </Link>
        <Button variant="ghost" onClick={onRestart}>
          Nouvel import
        </Button>
      </div>

      {summary.failed.length > 0 && (
        <Card padding="md">
          <p className="font-semibold text-slate-800 mb-2">
            {summary.failed.length} ligne{summary.failed.length > 1 ? 's' : ''} non importée{summary.failed.length > 1 ? 's' : ''}
          </p>
          <ul className="space-y-1">
            {summary.failed.map((f, i) => (
              <li
                key={i}
                className="text-sm text-slate-600 font-mono bg-danger/5 px-3 py-2 rounded-lg"
              >
                Ligne {f.lineNumber} : {f.reason}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Récap des nouveaux élèves */}
      <Card padding="none">
        <div className="px-4 py-3 border-b border-surface-border">
          <p className="text-sm font-semibold text-slate-800">Élèves créés</p>
        </div>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted border-b border-surface-border sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Matricule
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Élève
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Code
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Inscription
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {summary.imported.map((row) => (
                <tr key={row.matricule}>
                  <td className="px-3 py-2 font-mono font-semibold text-slate-900">
                    {row.matricule}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {row.prenom} {row.nom}
                  </td>
                  <td className="px-3 py-2 font-mono font-bold text-slate-900 tabular tracking-wider">
                    {row.code_acces_clair}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500 font-mono">
                    {row.concours_sigle ? `${row.concours_sigle} @ ${row.sous_centre_code}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
