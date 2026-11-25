// Keep repository text useful as evidence without printing credentials or host paths.
export function safeOutput(value) {
  if (typeof value === 'string') return redact(value);
  if (Array.isArray(value)) return value.map(safeOutput);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, safeOutput(item)]));
  }
  return value;
}

function redact(value) {
  return value
    .replace(/\b(?:AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/g, '[redacted token]')
    .replace(/\bBearer\s+[^\s,;"']+/gi, 'Bearer [redacted]')
    .replace(/\b(api[_-]?key|secret|token|password|passwd|authorization)\s*([:=])\s*(["']?)[^\s"'`,;}&]+\3/gi, '$1$2[redacted]')
    .replace(/\b[A-Za-z]:[\\/][^\s"'`<>|]+/g, '[redacted path]')
    .replace(/\\\\[^\\\s]+\\[^\s"'`<>|]+/g, '[redacted path]')
    .replace(/\/(?:home|Users|root|etc|var|tmp|opt|mnt)\/[^\s"'`<>|]+/g, '[redacted path]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted email]')
    .replace(/\b[A-Za-z0-9_-]{24,}\b/g, '[redacted value]');
}
