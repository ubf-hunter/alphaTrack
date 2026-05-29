import { Card, Icon, Pill } from '@alphatrack/ui';
import { useRegionsWithSousCentres } from '../../hooks/useSousCentres';

export function SousCentresRoute(): JSX.Element {
  const { data: regions, isLoading, error } = useRegionsWithSousCentres();

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Chargement…</p>
      </Card>
    );
  }
  if (error) {
    return (
      <div className="px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
        {(error as Error).message}
      </div>
    );
  }

  const totalSousCentres = regions?.reduce((s, r) => s + r.sous_centres.length, 0) ?? 0;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Sous-centres de composition</h2>
        <p className="text-sm text-slate-500">
          {regions?.length ?? 0} régions · {totalSousCentres} sous-centres. Lecture seule en v1 —
          modification réservée au super-admin via SQL.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {regions?.map((region) => (
          <Card key={region.id} padding="lg">
            <header className="flex items-start justify-between mb-4 gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Région
                </p>
                <h3 className="text-xl font-bold text-slate-900">{region.nom}</h3>
              </div>
              <Pill tone="lime" size="md">
                {dayLabel(region.jour_composition)}
              </Pill>
            </header>

            <div className="flex flex-col gap-2">
              {region.sous_centres
                .slice()
                .sort((a, b) => a.code.localeCompare(b.code))
                .map((sc) => (
                  <div
                    key={sc.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted/60 hover:bg-surface-muted transition-colors"
                  >
                    <span className="w-9 h-9 rounded-lg bg-slate-900 text-lime-400 flex items-center justify-center shrink-0">
                      <Icon name="pin" className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{sc.nom}</p>
                      <p className="text-xs text-slate-500">{sc.ville}</p>
                    </div>
                    <span className="font-mono text-xs text-slate-500 px-2 py-1 rounded-md bg-surface-base border border-surface-border">
                      {sc.code}
                    </span>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function dayLabel(day: string): string {
  return `Composition · ${day.charAt(0).toUpperCase()}${day.slice(1)}`;
}
