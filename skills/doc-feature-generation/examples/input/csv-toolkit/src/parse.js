export class CsvError extends Error {
  constructor(message, line) {
    super(`${message} (line ${line})`);
    this.line = line;
  }
}

/**
 * Parses CSV text into rows. Quoted fields may contain the delimiter, line breaks and doubled
 * quotes. With `header: true` the first row names the fields of every following row.
 */
export function parseCsv(text, { delimiter = ',', header = false } = {}) {
  if (text.trim() === '') {
    return [];
  }
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let line = 1;
  let quoteStartLine = 1;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        if (char === '\n') line += 1;
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
      quoteStartLine = line;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      line += 1;
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (quoted) {
    throw new CsvError('unterminated quoted field', quoteStartLine);
  }
  row.push(field);
  rows.push(row);

  if (!header) {
    return rows;
  }
  const [names, ...records] = rows;
  return records.map((record) => Object.fromEntries(names.map((name, i) => [name, record[i] ?? ''])));
}
