#!/usr/bin/env node
// validate-feature-tree.mjs — check a living-spec feature tree, for step 9 of the
// doc-feature-generation skill.
//
// Usage, from the workspace root:
//   node <skill-dir>/scripts/validate-feature-tree.mjs --root <output-dir> [--lang <code>]
//        [--files <a.feature,b.feature>] [--inventory <root-relative-file>]
//
// --files lists the paths written in this run, relative to --root; issues in any other file are
// reported as warnings, because the run must not rewrite files it did not write.
// Reads the tree and prints one JSON object on stdout: errors, warnings and counts. It writes
// nothing and runs nothing; a summary goes to stderr. Exit codes: 0 no error, 1 errors, 2 usage.

import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { safeOutput } from './safe-output.mjs';

const USAGE = 'Usage: node validate-feature-tree.mjs --root <dir> [--lang <code>] [--files <a,b>] [--inventory <file>]';
const STATUS_TAGS = ['@confirmed', '@implemented-unverified', '@partial', '@proposed'];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DIALECT_CODE = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/;
const INVENTORY = 'feature-inventory.md';

// Keywords from the Gherkin dialect list (gherkin-languages.json); step keywords without the "* " bullet.
const DIALECTS = {
  en: {
    feature: ['Feature', 'Business Need', 'Ability'], rule: ['Rule'], background: ['Background'],
    scenario: ['Example', 'Scenario'], outline: ['Scenario Outline', 'Scenario Template'], examples: ['Examples', 'Scenarios'],
    steps: ['Given ', 'When ', 'Then ', 'And ', 'But '],
  },
  es: {
    feature: ['Característica', 'Necesidad del negocio', 'Requisito'], rule: ['Regla', 'Regla de negocio'],
    background: ['Antecedentes'], scenario: ['Ejemplo', 'Escenario'], outline: ['Esquema del escenario'], examples: ['Ejemplos'],
    steps: ['Dado ', 'Dada ', 'Dados ', 'Dadas ', 'Cuando ', 'Entonces ', 'Y ', 'E ', 'Pero '],
  },
  pt: {
    feature: ['Funcionalidade', 'Característica', 'Caracteristica'], rule: ['Regra'],
    background: ['Contexto', 'Cenário de Fundo', 'Cenario de Fundo', 'Fundo'], scenario: ['Exemplo', 'Cenário', 'Cenario'],
    outline: ['Esquema do Cenário', 'Esquema do Cenario', 'Delineação do Cenário', 'Delineacao do Cenario'],
    examples: ['Exemplos', 'Cenários', 'Cenarios'],
    steps: ['Dado ', 'Dada ', 'Dados ', 'Dadas ', 'Quando ', 'Então ', 'Entao ', 'E ', 'Mas '],
  },
  fr: {
    feature: ['Fonctionnalité'], rule: ['Règle'], background: ['Contexte'], scenario: ['Exemple', 'Scénario'],
    outline: ['Plan du scénario', 'Plan du Scénario'], examples: ['Exemples'],
    steps: ['Soit ', 'Sachant que ', "Sachant qu'", 'Sachant ', 'Etant donné que ', "Etant donné qu'", 'Etant donné ',
      'Etant donnée ', 'Etant donnés ', 'Etant données ', 'Étant donné que ', "Étant donné qu'", 'Étant donné ',
      'Étant donnée ', 'Étant donnés ', 'Étant données ', 'Quand ', 'Lorsque ', "Lorsqu'", 'Alors ', 'Donc ',
      'Et que ', "Et qu'", 'Et ', 'Mais que ', "Mais qu'", 'Mais '],
  },
  de: {
    feature: ['Funktionalität', 'Funktion'], rule: ['Rule', 'Regel'],
    background: ['Grundlage', 'Hintergrund', 'Voraussetzungen', 'Vorbedingungen'], scenario: ['Beispiel', 'Szenario'],
    outline: ['Szenariogrundriss', 'Szenarien'], examples: ['Beispiele'],
    steps: ['Angenommen ', 'Gegeben sei ', 'Gegeben seien ', 'Wenn ', 'Dann ', 'Und ', 'Aber '],
  },
  it: {
    feature: ['Funzionalità', 'Esigenza di Business', 'Abilità'], rule: ['Regola'], background: ['Contesto'],
    scenario: ['Esempio', 'Scenario'], outline: ['Schema dello scenario'], examples: ['Esempi'],
    steps: ['Dato ', 'Data ', 'Dati ', 'Date ', 'Quando ', 'Allora ', 'E ', 'Ed ', 'Ma '],
  },
};
const BLOCK_TYPES = ['feature', 'rule', 'background', 'outline', 'scenario', 'examples'];

class UsageError extends Error {}
const fail = (message) => {
  throw new UsageError(message);
};
const toPosix = (p) => p.split(sep).join('/');

function parseArgs(argv) {
  const opts = { root: null, lang: null, files: null, inventory: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--root') opts.root = argv[(i += 1)];
    else if (arg === '--lang') opts.lang = argv[(i += 1)];
    else if (arg === '--files') opts.files = (argv[(i += 1)] || '').split(',').map((f) => toPosix(f.trim()).replace(/^\.\//, '')).filter(Boolean);
    else if (arg === '--inventory') opts.inventory = argv[(i += 1)];
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else fail('unknown argument');
  }
  if (!opts.help && !opts.root) fail('--root is required');
  return opts;
}

function insideCwd(target) {
  return isWithin(realpathSync(process.cwd()), realpathSync(target));
}

function isWithin(root, target) {
  const rel = relative(root, target);
  return rel === '' || !(rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel));
}

function walk(dir, base, acc) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    const rel = toPosix(relative(base, abs));
    if (entry.isSymbolicLink()) acc.push({ rel, type: 'link' });
    else if (entry.isDirectory()) {
      acc.push({ rel, type: 'dir' });
      walk(abs, base, acc);
    } else if (entry.isFile()) acc.push({ rel, type: 'file' });
  }
  return acc;
}

function blockKeyword(line, dialect) {
  for (const type of BLOCK_TYPES) {
    for (const keyword of dialect[type]) {
      if (line.startsWith(`${keyword}:`)) return { type, keyword, title: line.slice(keyword.length + 1).trim() };
    }
  }
  return null;
}

function isStep(line, dialect) {
  return line.startsWith('* ') || dialect.steps.some((keyword) => line.startsWith(keyword));
}

function checkFeature(rel, text, expectedLang) {
  const issues = [];
  const issue = (check, message) => issues.push({ check, file: rel, message });
  if (text.startsWith('\uFEFF')) issue('encoding', 'file starts with a byte-order mark');
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const header = /^\s*#\s*language\s*:\s*([\w-]+)\s*$/.exec(lines[0] || '');
  const lang = header && DIALECT_CODE.test(header[1]) ? header[1] : header ? 'invalid' : 'en';
  if (header && lang === 'invalid') issue('language-header', 'language code has an invalid format');
  lines.forEach((line, i) => {
    if (i > 0 && /^\s*#\s*language\s*:/.test(line)) issue('language-header', `line ${i + 1}: "# language:" must be the first line`);
    if (/^\s*#\s*TEMPLATE:/.test(line)) issue('placeholder', `line ${i + 1}: template guidance left in the file`);
    if (/^\s*#/.test(line) && (/\b[A-Za-z]:[\\/]/.test(line) || /(^|[\s(])\/(Users|home|root|var|etc|opt|mnt|tmp)\//.test(line) || line.includes('file://'))) {
      issue('absolute-path', `line ${i + 1}: evidence must use repository-relative paths`);
    }
    if (/(api[_-]?key|secret|token|password|passwd)\s*[:=]\s*["'][^"']{8,}["']/i.test(line)) {
      issue('credential-literal:warn', `line ${i + 1}: looks like a credential; use synthetic values`);
    }
  });
  if (text.includes('{{') || text.includes('}}')) issue('placeholder', 'unresolved {{...}} placeholder');
  if (expectedLang && lang !== expectedLang) issue('language-header', `dialect is "${lang}", expected "${expectedLang}"`);

  const result = { lang, title: null, statusTags: [], scenarios: 0, rules: 0 };
  const dialect = DIALECTS[lang];
  let featureTags = [];
  if (!dialect) {
    issue('dialect-unsupported:warn', `dialect "${lang}" is not known to the validator; keywords were not checked`);
    for (const line of lines.map((l) => l.trim())) {
      if (!line || line.startsWith('#')) continue;
      if (line.startsWith('@')) featureTags.push(...tagsOf(line));
      else break;
    }
  } else {
    let state = 'start';
    let features = 0;
    let pendingTags = [];
    let docstring = null;
    let outline = null;
    let stepsAllowed = false;
    const closeOutline = () => {
      if (outline && !outline.hasExamples) issue('outline-examples', `line ${outline.line}: Scenario Outline without Examples`);
      outline = null;
    };
    lines.forEach((raw, i) => {
      const line = raw.trim();
      if (docstring) {
        if (line.startsWith(docstring)) docstring = null;
        return;
      }
      if (!line || line.startsWith('#')) return;
      if (line.startsWith('"""') || line.startsWith('```')) {
        if (state !== 'steps') issue('unexpected-line', `line ${i + 1}: doc string outside a step`);
        docstring = line.slice(0, 3);
        return;
      }
      if (line.startsWith('@')) {
        pendingTags.push(...tagsOf(line));
        return;
      }
      if (line.startsWith('|')) {
        if (state === 'examples' || state === 'examples-table') state = 'examples-table';
        else if (state !== 'steps') issue('unexpected-line', `line ${i + 1}: table row outside a step or Examples`);
        return;
      }
      const block = blockKeyword(line, dialect);
      if (block) {
        if (block.type !== 'examples') closeOutline();
        if (block.type !== 'feature' && features === 0) issue('feature-keyword', `line ${i + 1}: ${block.keyword} appears before the Feature line`);
        if (block.type === 'feature') {
          features += 1;
          if (features === 1) {
            featureTags = pendingTags;
            result.title = block.title;
          } else issue('feature-keyword', `line ${i + 1}: a second Feature line`);
          state = 'description';
          stepsAllowed = false;
        } else if (block.type === 'rule') {
          result.rules += 1;
          state = 'description';
          stepsAllowed = false;
        } else if (block.type === 'background') {
          state = 'description';
          stepsAllowed = true;
        } else if (block.type === 'scenario' || block.type === 'outline') {
          result.scenarios += 1;
          if (block.type === 'outline') outline = { line: i + 1, hasExamples: false };
          state = 'description';
          stepsAllowed = true;
        } else {
          if (outline) outline.hasExamples = true;
          state = 'examples';
          stepsAllowed = false;
        }
        pendingTags = [];
        return;
      }
      // As in the Gherkin parser, a step keyword counts only where a step may follow; elsewhere
      // (Feature, Rule or Examples description) the line is free description text.
      if (stepsAllowed && isStep(line, dialect)) {
        state = 'steps';
        return;
      }
      if (pendingTags.length) {
        issue('unexpected-line', `line ${i + 1}: tags must be followed by a keyword line`);
        pendingTags = [];
      }
      if (state === 'description' || state === 'examples') return;
      issue('unexpected-line', `line ${i + 1}: not a keyword, step, table, tag or comment`);
    });
    closeOutline();
    if (docstring) issue('unexpected-line', 'doc string is never closed');
    if (pendingTags.length) issue('unexpected-line', 'tags are not followed by a keyword');
    if (features === 0) issue('feature-keyword', 'no Feature line');
    if (result.scenarios === 0) issue('scenario-present', 'no Scenario, Example or Scenario Outline');
  }
  result.statusTags = featureTags.filter((t) => STATUS_TAGS.includes(t));
  if (result.statusTags.length !== 1) {
    issue('status-tag', result.statusTags.length
      ? `several status tags: ${result.statusTags.join(' ')}`
      : `no status tag on the Feature line; use one of ${STATUS_TAGS.join(' ')}`);
  }
  return { issues, result };
}

function tagsOf(line) {
  const tags = [];
  for (const token of line.split(/\s+/)) {
    if (token.startsWith('#')) break;
    if (token.startsWith('@')) tags.push(token);
  }
  return tags;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(`${USAGE}\n`);
    return;
  }
  if (isAbsolute(opts.root)) fail('root must be workspace-relative');
  if (opts.lang && !DIALECT_CODE.test(opts.lang)) fail('--lang must be a valid dialect code');
  const rootAbs = resolve(opts.root);
  if (!existsSync(rootAbs) || !statSync(rootAbs).isDirectory()) fail('root not found or not a directory');
  if (!insideCwd(rootAbs)) fail('root must resolve inside the current directory; run the script from the workspace root');
  const rootPrefix = `${toPosix(relative(process.cwd(), rootAbs))}/`;
  const owned = opts.files ? new Set(opts.files.map((f) => (f.startsWith(rootPrefix) ? f.slice(rootPrefix.length) : f))) : null;
  if (opts.inventory && isAbsolute(opts.inventory)) fail('inventory must be root-relative');
  const inventoryAbs = resolve(rootAbs, opts.inventory || INVENTORY);
  if (!isWithin(rootAbs, inventoryAbs)) fail('inventory must stay inside the root');
  if (existsSync(inventoryAbs)) {
    if (lstatSync(inventoryAbs).isSymbolicLink() || !statSync(inventoryAbs).isFile()
      || !isWithin(realpathSync(rootAbs), realpathSync(inventoryAbs))) {
      fail('inventory must be a regular file inside the root');
    }
  }
  const inventoryRel = toPosix(relative(rootAbs, inventoryAbs));

  const errors = [];
  const warnings = [];
  // Every run writes the inventory, so its issues are never downgraded.
  const report = (check, file, message) => {
    const isWarning = check.endsWith(':warn');
    const name = check.replace(/:warn$/, '');
    const preExisting = owned && file && file !== inventoryRel && !owned.has(file) && ![...owned].some((f) => f.startsWith(`${file}/`));
    if (isWarning || preExisting) warnings.push({ check: name, file, message: preExisting && !isWarning ? `pre-existing file: ${message}` : message });
    else errors.push({ check: name, file, message });
  };

  const entries = walk(rootAbs, rootAbs, []);
  const features = [];
  const titles = new Map();
  const dialects = new Set();
  const stats = { domains: 0, capabilities: 0, features: 0, scenarios: 0, rules: 0, byStatus: Object.fromEntries(STATUS_TAGS.map((t) => [t.slice(1), 0])) };

  for (const entry of entries) {
    const segments = entry.rel.split('/');
    if (entry.type === 'link') {
      report('symlink:warn', entry.rel, 'symbolic link inside the tree was not followed');
      continue;
    }
    if (entry.type === 'dir') {
      if (segments.length > 2) report('tree-depth', entry.rel, 'folder inside a capability; the tree is domain/capability/feature.feature');
      else if (!KEBAB.test(segments.at(-1))) report('kebab-case', entry.rel, 'folder name must be kebab-case ASCII');
      continue;
    }
    if (!entry.rel.endsWith('.feature')) {
      if (segments.length > 1) report('stray-file:warn', entry.rel, 'only .feature files belong inside domain and capability folders');
      continue;
    }
    if (segments.length !== 3) {
      report('tree-depth', entry.rel, 'a .feature file must sit at domain/capability/feature.feature');
    } else if (!KEBAB.test(segments[2].replace(/\.feature$/, ''))) {
      report('kebab-case', entry.rel, 'file name must be kebab-case ASCII');
    }
    const { issues, result } = checkFeature(entry.rel, readFileSync(join(rootAbs, entry.rel), 'utf8'), opts.lang);
    issues.forEach((i) => report(i.check, i.file, i.message));
    features.push(entry.rel);
    dialects.add(result.lang);
    stats.features += 1;
    stats.scenarios += result.scenarios;
    stats.rules += result.rules;
    if (result.statusTags.length === 1) stats.byStatus[result.statusTags[0].slice(1)] += 1;
    if (result.title) {
      const key = result.title.toLowerCase();
      if (titles.has(key)) report('duplicate-title:warn', entry.rel, `same Feature title as ${titles.get(key)}`);
      else titles.set(key, entry.rel);
    }
  }

  const placed = features.filter((f) => f.split('/').length === 3);
  const domains = new Set(placed.map((f) => f.split('/')[0]));
  stats.domains = domains.size;
  stats.capabilities = new Set(placed.map((f) => f.split('/').slice(0, 2).join('/'))).size;
  for (const entry of entries.filter((e) => e.type === 'dir' && e.rel.split('/').length <= 2)) {
    if (!features.some((f) => f.startsWith(`${entry.rel}/`))) report('empty-folder:warn', entry.rel, 'folder holds no feature file');
  }
  if (dialects.size > 1) report('mixed-dialects:warn', null, `files use several dialects: ${[...dialects].join(', ')}`);
  if (features.length === 0) report('feature-present', null, 'the tree holds no .feature file');

  if (!existsSync(inventoryAbs)) {
    report('inventory-sync', inventoryRel, 'inventory not found');
  } else {
    const text = readFileSync(inventoryAbs, 'utf8');
    if (text.includes('{{') || text.includes('}}') || /TEMPLATE:/.test(text)) report('placeholder', inventoryRel, 'unresolved placeholder or template comment');
    for (const feature of features) {
      if (!text.includes(feature)) report('inventory-sync', inventoryRel, `does not list ${feature}`);
    }
    const cited = new Set();
    for (const [token] of text.matchAll(/[\w./-]+\.feature\b/g)) {
      let path = token.replace(/^\.\//, '');
      const prefixed = path.startsWith(rootPrefix);
      if (prefixed) path = path.slice(rootPrefix.length);
      const parts = path.split('/');
      if (parts.length === 3 && (prefixed || domains.has(parts[0])) && !features.includes(path)) cited.add(path);
    }
    for (const path of cited) report('inventory-sync', inventoryRel, `cites ${path}, which does not exist`);
  }

  const result = { ok: errors.length === 0, root: toPosix(relative(process.cwd(), rootAbs)) || '.', dialects: [...dialects], stats, errors, warnings };
  process.stdout.write(`${JSON.stringify(safeOutput(result), null, 2)}\n`);
  process.stderr.write(`[validate-feature-tree] ${stats.features} features, ${errors.length} errors, ${warnings.length} warnings\n`);
  if (errors.length) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  if (error instanceof UsageError) process.stderr.write(`[validate-feature-tree] ${error.message}\n${USAGE}\n`);
  else process.stderr.write('[validate-feature-tree] failed to inspect files\n');
  process.exitCode = 2;
}
