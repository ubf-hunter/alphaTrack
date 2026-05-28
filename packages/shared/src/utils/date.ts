const moisLong = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export function formatDateLongFr(iso: string): string {
  const d = new Date(iso);
  const jour = d.getDate();
  const mois = moisLong[d.getMonth()];
  const annee = d.getFullYear();
  return `${jour} ${mois} ${annee}`;
}

export function formatDateCourtFr(iso: string): string {
  const d = new Date(iso);
  const jj = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const aa = d.getFullYear().toString().slice(2);
  return `${jj}/${mm}/${aa}`;
}

export function sessionAnneeCourante(reference = new Date()): string {
  const annee = reference.getFullYear();
  const mois = reference.getMonth();
  const debut = mois >= 8 ? annee : annee - 1;
  return `${debut}-${debut + 1}`;
}
