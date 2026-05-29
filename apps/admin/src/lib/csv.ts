/**
 * Parser CSV minimaliste — gère :
 *   - Séparateurs , ou ; (auto-détecté sur la première ligne non vide)
 *   - Champs entre guillemets avec échappement "" (RFC 4180)
 *   - Fin de ligne \n ou \r\n
 *   - BOM UTF-8 (﻿) en début de fichier
 *   - Lignes vides ignorées
 *
 * Retourne tableau de tableaux de strings. Aucune interprétation typée — c'est
 * à la couche de validation (zod) de transformer ensuite.
 */
export function parseCsv(input: string): string[][] {
  // Retirer BOM si présent
  let src = input;
  if (src.charCodeAt(0) === 0xfeff) src = src.slice(1);

  const separator = detectSeparator(src);
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;

  while (i < src.length) {
    const c = src[i]!;

    if (inQuotes) {
      if (c === '"') {
        // Échappement "" → un seul guillemet
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        // Fin de champ entre guillemets
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }

    if (c === '"' && field === '') {
      inQuotes = true;
      i++;
      continue;
    }

    if (c === separator) {
      row.push(field);
      field = '';
      i++;
      continue;
    }

    if (c === '\r') {
      // \r ou \r\n → fin de ligne
      row.push(field);
      pushRowIfNotEmpty(rows, row);
      field = '';
      row = [];
      i++;
      if (src[i] === '\n') i++;
      continue;
    }

    if (c === '\n') {
      row.push(field);
      pushRowIfNotEmpty(rows, row);
      field = '';
      row = [];
      i++;
      continue;
    }

    field += c;
    i++;
  }

  // Dernière ligne sans \n final
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    pushRowIfNotEmpty(rows, row);
  }

  return rows;
}

function pushRowIfNotEmpty(rows: string[][], row: string[]): void {
  if (row.some((c) => c.trim().length > 0)) {
    rows.push(row.map((c) => c.trim()));
  }
}

function detectSeparator(src: string): ',' | ';' {
  // Première ligne non vide
  const newlineIdx = src.indexOf('\n');
  const firstLine = newlineIdx === -1 ? src : src.slice(0, newlineIdx);
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
}

/**
 * Convertit un tableau d'objets en chaîne CSV avec en-tête.
 * Quote uniquement les champs qui contiennent séparateur, guillemet ou newline.
 */
export function objectsToCsv<T extends Record<string, string | number | null | undefined>>(
  rows: ReadonlyArray<T>,
  columns: ReadonlyArray<{ key: keyof T; header: string }>,
  separator: ',' | ';' = ',',
): string {
  const header = columns.map((c) => c.header).join(separator);
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const raw = row[c.key];
          if (raw === null || raw === undefined) return '';
          return escapeCsvField(String(raw), separator);
        })
        .join(separator),
    )
    .join('\n');
  return `﻿${header}\n${body}\n`;
}

function escapeCsvField(value: string, separator: string): string {
  if (
    value.includes(separator) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Déclenche le téléchargement d'un Blob côté navigateur. */
export function downloadFile(content: string, filename: string, mime = 'text/csv;charset=utf-8'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
