export function genererMatriculeEleve(session: string, sequence: number): string {
  const yearShort = session.slice(2, 4);
  const seq = sequence.toString().padStart(4, '0');
  return `AC-${yearShort}-${seq}`;
}

export function genererMatriculeAdmin(sequence: number): string {
  return `ADM-${sequence.toString().padStart(3, '0')}`;
}

export function genererCodeAcces(): string {
  const min = 100000;
  const max = 999999;
  const n = Math.floor(Math.random() * (max - min + 1)) + min;
  return n.toString();
}
