/**
 * Turns rows (arrays of values) into CSV text. A value that contains the delimiter, a quote or a
 * line break is quoted, and its quotes are doubled.
 */
export function stringifyCsv(rows, { delimiter = ',' } = {}) {
  if (!Array.isArray(rows)) {
    throw new TypeError('rows must be an array of arrays');
  }
  return rows.map((row) => row.map((value) => quote(String(value ?? ''), delimiter)).join(delimiter)).join('\n');
}

function quote(value, delimiter) {
  const needsQuotes = value.includes(delimiter) || value.includes('"') || value.includes('\n');
  return needsQuotes ? `"${value.replaceAll('"', '""')}"` : value;
}
