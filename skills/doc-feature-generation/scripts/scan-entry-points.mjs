#!/usr/bin/env node
// scan-entry-points.mjs — inventory the entry points and evidence sources of a repository scope,
// for step 3 of the doc-feature-generation skill.
//
// Usage, from the workspace root:
//   node <skill-dir>/scripts/scan-entry-points.mjs [--root <dir>] [--max-per-kind <n>] [--include-excluded]
//
// Reads the files under --root (default ".", which must lie inside the current directory) and
// prints one JSON object on stdout. It writes no file, follows no symbolic link, runs nothing —
// tests included: it reads them to list their cases, skipped cases and test doubles — and makes no
// network call; status messages go to stderr. The patterns are heuristics: every entry is a lead to
// confirm by reading the code. Exit codes: 0 done, 2 usage error.

import { lstatSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { safeOutput } from './safe-output.mjs';

const USAGE = 'Usage: node scan-entry-points.mjs [--root <dir>] [--max-per-kind <n>] [--include-excluded]';
const MAX_FILES = 50000;
const MAX_BYTES = 1024 * 1024;

const SKIP_DIRS = new Set([
  'node_modules', 'bower_components', 'jspm_packages', 'vendor', 'dist', 'build', 'out', 'target',
  'obj', 'venv', '__pycache__', 'site-packages', 'Pods', 'DerivedData', 'storybook-static',
]);
// Results of past test runs: listed as leads, never read or trusted as current.
const REPORT_DIRS = new Set(['coverage', 'test-results', 'playwright-report', 'allure-results', 'allure-report', 'mochawesome-report']);
const REPORT_FILE = /^(?:junit[\w.-]*|[\w.-]*\.junit|cucumber[\w-]*report[\w.-]*|test-?(?:report|results?)[\w.-]*)\.(?:xml|json|html)$/i;

const EXCLUDED_SEGMENTS = {
  examples: ['example', 'examples', 'sample', 'samples', 'demo', 'demos'],
  fixtures: ['fixture', 'fixtures', '__fixtures__', 'testdata', 'test-data'],
  mocks: ['mock', 'mocks', '__mocks__', 'stub', 'stubs', 'fakes'],
  generated: ['generated', '__generated__', 'gen'],
};
const GENERATED_NAME = /\.(generated|gen)\.\w+$|_pb2(_grpc)?\.py$|\.pb(\.gw)?\.go$|\.min\.(js|css)$/;
const GENERATED_MARK = /Code generated|@generated\b|DO NOT EDIT/;
const GENERATED_MARK_ANY_CASE = /\bauto-?generated\b/i;

const TEST_FILE = /[._-](test|spec|e2e-spec|steps?)\.[cm]?[jt]sx?$|^test_.*\.py$|_test\.(py|go|exs)$|Tests?\.(java|kt|cs)$|_spec\.rb$/;
const TEST_DIRS = new Set([
  'test', 'tests', '__tests__', 'e2e', 'cypress', 'playwright', 'spec', 'step_definitions', 'step-definitions', 'steps',
]);
const DOC_EXT = new Set(['.md', '.mdx', '.rst', '.adoc']);
const CONTRACT_NAME = /^(openapi|swagger|asyncapi)[\w.-]*\.(ya?ml|json)$|\.(graphql|gql|proto|avsc)$|^schema\.prisma$|\.schema\.json$/i;
const MANIFESTS = new Set([
  'package.json', 'pyproject.toml', 'setup.py', 'setup.cfg', 'requirements.txt', 'Pipfile', 'go.mod', 'go.work',
  'Cargo.toml', 'pom.xml', 'build.gradle', 'build.gradle.kts', 'composer.json', 'Gemfile', 'mix.exs',
  'pubspec.yaml', 'deno.json',
]);
const MANIFEST_EXT = /\.(csproj|fsproj|vbproj)$/;
const WORKSPACE_FILES = new Set(['pnpm-workspace.yaml', 'lerna.json', 'nx.json', 'turbo.json', 'go.work']);
const RUNNER_CONFIG = /^\.?cucumber(\.[\w-]+)?\.(js|cjs|mjs|ts|json|ya?ml)$|^(cypress|playwright)\.config\.[cm]?[jt]s$|^behave\.ini$|^(specflow|reqnroll)\.json$/;
const RUNNER_DEPS = [
  '@cucumber/cucumber', '@badeball/cypress-cucumber-preprocessor', 'playwright-bdd', 'behave', 'pytest-bdd',
  'cucumber/godog', 'io.cucumber', 'Reqnroll', 'SpecFlow',
];
const KNOWN_JS = [
  'express', '@nestjs/core', 'fastify', 'koa', 'hono', 'next', 'nuxt', '@remix-run/react', 'react', 'react-router',
  'react-router-dom', 'vue', 'vue-router', '@angular/core', 'svelte', '@sveltejs/kit', 'commander', 'yargs',
  '@oclif/core', 'kafkajs', 'amqplib', 'bull', 'bullmq', 'node-cron', 'cron', 'node-schedule', 'agenda',
  '@nestjs/schedule', '@nestjs/microservices', '@nestjs/graphql', '@apollo/server', 'type-graphql', '@trpc/server',
  '@cucumber/cucumber', '@badeball/cypress-cucumber-preprocessor', 'playwright-bdd', 'cypress', '@playwright/test',
  'jest', 'vitest', 'mocha',
];
const KNOWN_TEXT = [
  'fastapi', 'flask', 'django', 'click', 'typer', 'celery', 'behave', 'pytest-bdd', 'pytest', 'gin-gonic/gin',
  'labstack/echo', 'go-chi/chi', 'gofiber/fiber', 'spf13/cobra', 'robfig/cron', 'cucumber/godog', 'spring-boot',
  'io.cucumber', 'rails', 'sinatra', 'sidekiq', 'laravel/framework', 'symfony/', 'actix-web', 'axum', 'rocket',
  'clap', 'Microsoft.AspNetCore', 'Reqnroll', 'SpecFlow', 'phoenix',
];
const LANG_BY_EXT = {
  '.js': 'js', '.jsx': 'js', '.mjs': 'js', '.cjs': 'js', '.ts': 'js', '.tsx': 'js', '.vue': 'js', '.svelte': 'js',
  '.py': 'py', '.java': 'jvm', '.kt': 'jvm', '.kts': 'jvm', '.scala': 'jvm', '.cs': 'cs', '.go': 'go', '.rb': 'rb',
  '.php': 'php', '.rs': 'rs', '.ex': 'ex', '.exs': 'ex', '.graphql': 'gql', '.gql': 'gql', '.proto': 'proto',
  '.yaml': 'yaml', '.yml': 'yaml',
};
const ROUTER_HINT = /createBrowserRouter|createHashRouter|createMemoryRouter|RouterModule|\bRoutes\s*=|createRouter\(|VueRouter|useRoutes\(|routes\s*:\s*\[/;
const GRAPHQL_HINT = /@nestjs\/graphql|type-graphql|@Resolver\(/;

const opt = (m, i) => m[i] ?? '';
const P = (kind, langs, re, fmt, when) => ({ kind, langs: new Set(langs), re, fmt, when });

// Each pattern turns a matching line into a short "detail"; the output entry is "path:line detail".
const PATTERNS = [
  P('http', ['js'], /\b(app|server|fastify|router|routes|\w+Router)\.(get|post|put|patch|delete|all|options|head)\(\s*(['"`])([^'"`]*)\3/, (m) => `${m[2].toUpperCase()} ${m[4]}`),
  P('http', ['js'], /\b(app|server|router|\w+Router)\.use\(\s*(['"`])(\/[^'"`]*)\2/, (m) => `mount ${m[3]}`),
  P('http', ['js'], /@(Get|Post|Put|Patch|Delete|All|Options|Head)\(\s*(?:(['"`])([^'"`]*)\2)?\s*\)/, (m) => `@${m[1]} ${opt(m, 3)}`.trim()),
  P('http', ['js'], /@Controller\(\s*(?:(['"`])([^'"`]*)\1)?/, (m) => `@Controller ${opt(m, 2)}`.trim()),
  P('http', ['js'], /\.route\(\s*(['"`])(\/[^'"`]*)\1\s*\)/, (m) => `route ${m[2]}`),
  P('http', ['js'], /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/, (m) => `${m[1]} handler`),
  P('http', ['py'], /@\w+\.(get|post|put|patch|delete|route|api_route|websocket)\(\s*(['"])([^'"]*)\2/, (m) => `${m[1].toUpperCase()} ${m[3]}`),
  P('http', ['py'], /\b(?:re_)?path\(\s*r?(['"])([^'"]*)\1/, (m) => `path ${m[2]}`, (rel) => rel.endsWith('urls.py')),
  P('http', ['jvm'], /@(Get|Post|Put|Patch|Delete|Request)Mapping\b(?:\(\s*(?:(?:value|path)\s*=\s*)?"([^"]*)")?/, (m) => `@${m[1]}Mapping ${opt(m, 2)}`.trim()),
  P('http', ['jvm'], /@(GET|POST|PUT|PATCH|DELETE)\b/, (m) => `@${m[1]}`),
  P('http', ['jvm'], /@Path\(\s*"([^"]*)"/, (m) => `@Path ${m[1]}`),
  P('http', ['cs'], /\[Http(Get|Post|Put|Patch|Delete)(?:\(\s*"([^"]*)"\s*\))?\]/, (m) => `${m[1].toUpperCase()} ${opt(m, 2)}`.trim()),
  P('http', ['cs'], /\.Map(Get|Post|Put|Patch|Delete)\(\s*"([^"]*)"/, (m) => `${m[1].toUpperCase()} ${m[2]}`),
  P('http', ['cs'], /\[Route\(\s*"([^"]*)"\s*\)\]/, (m) => `route ${m[1]}`),
  P('http', ['go'], /\.(?:HandleFunc|Handle)\(\s*"([^"]+)"/, (m) => `route ${m[1]}`),
  P('http', ['go'], /\.(GET|POST|PUT|PATCH|DELETE|Get|Post|Put|Patch|Delete)\(\s*"(\/[^"]*)"/, (m) => `${m[1].toUpperCase()} ${m[2]}`),
  P('http', ['rb'], /^\s*(get|post|put|patch|delete|resources|resource|root)\b\s*\(?\s*['":]?([\w/:.#-]*)/, (m) => `${m[1]} ${m[2]}`.trim(), (rel) => rel.endsWith('routes.rb')),
  P('http', ['php'], /Route::(get|post|put|patch|delete|any|match|resource|apiResource)\(\s*(['"])([^'"]*)\2/, (m) => `${m[1].toUpperCase()} ${m[3]}`),
  P('http', ['php'], /(?:#\[|@)Route\(\s*(['"])([^'"]*)\1/, (m) => `route ${m[2]}`),
  P('http', ['rs'], /#\[(get|post|put|patch|delete)\(\s*"([^"]+)"/, (m) => `${m[1].toUpperCase()} ${m[2]}`),
  P('http', ['rs'], /\.route\(\s*"([^"]+)"/, (m) => `route ${m[1]}`),
  P('http', ['ex'], /^\s*(get|post|put|patch|delete|resources|live)\s+"([^"]+)"/, (m) => `${m[1]} ${m[2]}`, (rel) => /router\.ex$/.test(rel)),
  P('ui', ['js'], /<Route\b[^>]*?\bpath=\{?\s*(['"`])([^'"`]+)\1/, (m) => `route ${m[2]}`),
  P('ui', ['js'], /\bpath:\s*(['"`])([^'"`]*)\1/, (m) => `route ${m[2] || '/'}`, (_rel, text) => ROUTER_HINT.test(text)),
  P('ui', ['js'], /\b(createRoot|hydrateRoot|ReactDOM\.render|createApp|bootstrapApplication|bootstrapModule)\(/, (m) => `app root ${m[1]}`),
  P('ui', ['js'], /\bonSubmit=\{\s*([\w.]*)/, (m) => `form submit ${m[1]}`.trim()),
  P('cli', ['js'], /\.command\(\s*(['"`])([^'"`]+)\1/, (m) => `command ${m[2]}`),
  P('cli', ['js'], /\bnew Command\(\s*(['"`])([^'"`]+)\1/, (m) => `command ${m[2]}`),
  P('cli', ['py'], /@(?:\w+\.)?(command|group)\(/, (m) => `@${m[1]}`),
  P('cli', ['py'], /\badd_parser\(\s*(['"])([^'"]+)\1/, (m) => `subcommand ${m[2]}`),
  P('cli', ['go'], /\bUse:\s*"([^"]+)"/, (m) => `command ${m[1]}`),
  P('cli', ['jvm'], /@Command\(\s*name\s*=\s*"([^"]+)"/, (m) => `command ${m[1]}`),
  P('cli', ['rs'], /#\[derive\([^)]*\b(Parser|Subcommand)\b/, (m) => `clap ${m[1]}`),
  P('cli', ['php'], /\$signature\s*=\s*(['"])([^\s'"]+)/, (m) => `command ${m[2]}`),
  P('cli', ['rb'], /<\s*Thor\b/, () => 'thor CLI'),
  P('events', ['js'], /@(EventPattern|MessagePattern|OnEvent)\(\s*(?:(['"`])([^'"`]*)\2)?/, (m) => `@${m[1]} ${opt(m, 3)}`.trim()),
  P('events', ['js', 'py'], /\bsubscribe\(\s*(['"`])([\w.:/-]+)\1/, (m) => `subscribe ${m[2]}`),
  P('events', ['js'], /\.subscribe\(\s*\{\s*topics?\s*:/, () => 'kafka subscribe'),
  P('events', ['js'], /\.consume\(\s*(['"`])([\w.:/-]+)\1/, (m) => `consume ${m[2]}`),
  P('events', ['js'], /@Process\(\s*(?:(['"`])([^'"`]*)\1)?/, (m) => `@Process ${opt(m, 2)}`.trim()),
  P('events', ['js'], /export\s+(?:const|async\s+function|function)\s+handler\b/, () => 'serverless handler'),
  P('events', ['py'], /@(?:\w+\.)?(task|shared_task)\b/, (m) => `@${m[1]}`),
  P('events', ['py'], /def\s+\w+\(\s*event\s*,\s*context\s*\)/, () => 'serverless handler'),
  P('events', ['jvm'], /@(KafkaListener|RabbitListener|JmsListener|SqsListener|EventListener|StreamListener)\b/, (m) => `@${m[1]}`),
  P('events', ['cs'], /:\s*IConsumer<(\w+)>/, (m) => `consumer ${m[1]}`),
  P('events', ['cs'], /\[Function(?:Name)?\(\s*"([^"]+)"/, (m) => `function ${m[1]}`),
  P('events', ['go'], /\.(?:Subscribe|QueueSubscribe)\(\s*"([^"]+)"/, (m) => `subscribe ${m[1]}`),
  P('jobs', ['js'], /@(Cron|Interval|Timeout)\(\s*([^)]*)\)/, (m) => `@${m[1]} ${m[2]}`.trim()),
  P('jobs', ['js'], /\bcron\.schedule\(\s*(['"`])([^'"`]+)\1/, (m) => `cron ${m[2]}`),
  P('jobs', ['js'], /\bnew CronJob\(\s*(['"`])([^'"`]+)\1/, (m) => `cron ${m[2]}`),
  P('jobs', ['js'], /\bscheduleJob\(\s*(?:['"`][^'"`]*['"`]\s*,\s*)?(['"`])([^'"`]+)\1/, (m) => `schedule ${m[2]}`),
  P('jobs', ['js'], /\bagenda\.(?:every|schedule)\(\s*(['"`])([^'"`]+)\1/, (m) => `agenda ${m[2]}`),
  P('jobs', ['py'], /\bbeat_schedule\b|@periodic_task\b|\bschedule\.every\(|\b(?:add_job|scheduled_job)\(/, () => 'scheduled task'),
  P('jobs', ['jvm'], /@Scheduled\(([^)]*)\)/, (m) => `@Scheduled ${m[1]}`),
  P('jobs', ['cs'], /RecurringJob\.AddOrUpdate|\[TimerTrigger\(/, () => 'scheduled job'),
  P('jobs', ['go'], /\.AddFunc\(\s*"([^"]+)"/, (m) => `cron ${m[1]}`),
  P('jobs', ['rb'], /<\s*(?:ApplicationJob|ActiveJob::Base)\b|include\s+Sidekiq::(?:Job|Worker)\b/, () => 'background job'),
  P('jobs', ['php'], /->(cron|everyMinute|everyFiveMinutes|hourly|daily|dailyAt|weekly|monthly)\(/, (m) => `schedule ${m[1]}`),
  P('jobs', ['yaml'], /^\s*kind:\s*CronJob\b/, () => 'kubernetes CronJob'),
  P('jobs', ['yaml'], /^\s*-\s*schedule:\s*(.+)$/, (m) => `schedule ${m[1].trim()}`),
  P('graphql', ['js'], /@(Query|Mutation|Subscription|ResolveField|Resolver)\(/, (m) => `@${m[1]}`, (_rel, text) => GRAPHQL_HINT.test(text)),
  P('graphql', ['js', 'gql'], /\b(?:type|extend\s+type)\s+(Query|Mutation|Subscription)\b/, (m) => `type ${m[1]}`),
  P('graphql', ['js'], /^\s*(\w+)\s*:\s*\w*[pP]rocedure\b/, (m) => `trpc ${m[1]}`),
  P('graphql', ['jvm'], /@(QueryMapping|MutationMapping|SchemaMapping|SubscriptionMapping)\b/, (m) => `@${m[1]}`),
  P('graphql', ['py'], /@strawberry\.(?:type|mutation|field)\b|\(graphene\.(?:ObjectType|Mutation)\)/, () => 'graphql type'),
  P('rpc', ['proto'], /^\s*rpc\s+(\w+)\s*\(/, (m) => `rpc ${m[1]}`),
  P('rpc', ['proto'], /^\s*service\s+(\w+)/, (m) => `service ${m[1]}`),
  P('access', ['js', 'jvm', 'py'], /@(UseGuards|Roles|PreAuthorize|Secured|RolesAllowed|login_required|permission_required|user_passes_test)\b/, (m) => `@${m[1]}`),
  P('access', ['js'], /\b(requireRole|requireAuth|requiresAuth|isAuthenticated|ensureAuthenticated|checkPermission|hasRole|hasPermission)\(/, (m) => m[1]),
  P('access', ['cs'], /\[Authorize\b/, () => '[Authorize]'),
  P('access', ['py'], /\bDepends\(\s*(\w*(?:user|auth)\w*)/i, (m) => `Depends ${m[1]}`),
  P('access', ['rb'], /before_action\s+:(authenticate\w*|authorize\w*|require_\w+)/, (m) => `before_action ${m[1]}`),
  P('access', ['php'], /->middleware\(\s*\[?\s*['"](auth[\w:]*|can:[^'"]*)/, (m) => `middleware ${m[1]}`),
];
// How test cases, skipped cases and test doubles look in each language. Tests are read, never run.
const TEST_SYNTAX = {
  js: {
    cases: [/^\s*(?:it|test|specify)(?:\.(?:only|concurrent|failing))?\s*\(\s*(['"`])(.+?)\1/],
    skipCase: /^\s*(?:(?:it|test|specify)\.(?:skip|todo)|xit|xtest|xspecify)\s*\(\s*(['"`])(.+?)\1/,
    doubles: [
      ['module mocks', /\b(?:jest|vi)\.mock\(/],
      ['mock functions', /\b(?:jest|vi)\.(?:fn|spyOn)\(|\bsinon\.|\btd\.(?:func|replace)\(/],
      ['HTTP stubs', /\bnock\(|\bsetupServer\(|\bcy\.intercept\(|\bpage\.route\(/],
    ],
  },
  py: {
    cases: [/^\s*(?:async\s+)?def\s+(test_\w+)\s*\(/],
    skipMarker: /^\s*@(?:pytest\.mark\.(?:skip|skipif|xfail)|unittest\.skip\w*)\b/,
    doubles: [
      ['mocks', /\bunittest\.mock\b|\bMagicMock\(|\bAsyncMock\(|@patch\b|\bpatch\(|\bmocker\./],
      ['HTTP stubs', /\bresponses\.|\brespx\b|\brequests_mock\b|\bhttpretty\b/],
      ['monkeypatch', /\bmonkeypatch\b/],
    ],
  },
  jvm: {
    cases: [],
    annotation: /@(?:Test|ParameterizedTest|RepeatedTest)\b/,
    method: /\b(?:void|fun)\s+(`[^`]+`|\w+)\s*\(/,
    skipMarker: /@(?:Disabled|Ignore)\b/,
    doubles: [
      ['Mockito', /\bMockito\b|@Mock\b|@InjectMocks\b|@MockBean\b|@MockitoBean\b/],
      ['MockK', /\bmockk\b|@MockK\b/],
      ['HTTP stubs', /\bWireMock\b|\bMockWebServer\b/],
      ['real dependency (Testcontainers)', /\bTestcontainers\b|@Container\b/],
    ],
  },
  cs: {
    cases: [],
    annotation: /\[(?:Fact|Theory|Test|TestMethod|TestCase)\b/,
    method: /\b(?:void|Task)\s+(\w+)\s*\(/,
    skipMarker: /\[Ignore\b|\bSkip\s*=/,
    doubles: [
      ['mocks', /\bMock<|\bSubstitute\.For\b|\bA\.Fake<|\bFakeItEasy\b/],
      ['in-process host', /\bWebApplicationFactory\b|\bTestServer\b/],
    ],
  },
  go: {
    cases: [/^func\s+(Test\w+)\s*\(\s*\w+\s+\*testing\.T\s*\)/],
    skipInBody: /\bt\.Skip(?:f|Now)?\(/g,
    doubles: [['mocks', /\bgomock\b|\bmock\.Mock\b|\bmockery\b/], ['HTTP test server', /\bhttptest\./]],
  },
  rb: {
    cases: [/^\s*(?:it|specify|example|scenario)\s+(['"])(.+?)\1/, /^\s*def\s+(test_\w+)/],
    skipCase: /^\s*(?:xit|xspecify|xexample|xscenario)\s+(['"])(.+?)\1/,
    skipInBody: /^\s*(?:skip|pending)\b/gm,
    doubles: [
      ['doubles', /\b(?:double|instance_double|class_double|spy)\(|\breceive\(/],
      ['HTTP stubs', /\bstub_request\(|\bWebMock\b|\bVCR\b/],
    ],
  },
  php: {
    cases: [/function\s+(test\w+)\s*\(/, /^\s*(?:it|test)\(\s*(['"])(.+?)\1/],
    skipInBody: /markTestSkipped\(|->skip\(/g,
    doubles: [['mocks', /->createMock\(|\bMockery\b|->prophesize\(/]],
  },
  rs: {
    cases: [],
    annotation: /#\[(?:tokio::)?test\b/,
    method: /\bfn\s+(\w+)\s*\(/,
    skipMarker: /#\[ignore\b/,
    doubles: [['mocks', /\bmockall\b|\bmockito\b/]],
  },
  ex: {
    cases: [/^\s*test\s+"(.+?)"/],
    skipMarker: /@tag\s+:skip\b/,
    doubles: [['mocks', /\bMox\b/]],
  },
};

const EXPORT_LINE = [
  [/^\s*export\s+(?:default\s+)?(?:async\s+)?(?:function\*?|class|const|let|var|interface|type|enum)\s+(\w+)/, (m) => `export ${m[1]}`],
  [/^\s*export\s+default\b/, () => 'export default'],
  [/^\s*export\s*\{([^}]*)\}(?:\s*from\s*(['"])([^'"]+)\2)?/, (m) => `export {${m[1].trim()}}${m[3] ? ` from ${m[3]}` : ''}`],
  [/^\s*export\s*\*\s*(?:as\s+\w+\s+)?from\s*(['"])([^'"]+)\1/, (m) => `export * from ${m[2]}`],
  [/^\s*module\.exports\s*=\s*\{([^}]*)\}/, (m) => `module.exports {${m[1].trim()}}`],
  [/^\s*__all__\s*=\s*(.+)$/, (m) => `__all__ ${m[1].trim()}`],
];

class UsageError extends Error {}

function fail(message) {
  throw new UsageError(message);
}

function parseArgs(argv) {
  const opts = { root: '.', maxPerKind: 150, includeExcluded: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--root') opts.root = argv[(i += 1)];
    else if (arg === '--max-per-kind') opts.maxPerKind = Number(argv[(i += 1)]);
    else if (arg === '--include-excluded') opts.includeExcluded = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else fail('unknown argument');
  }
  if (!opts.root) fail('--root needs a directory');
  if (!Number.isInteger(opts.maxPerKind) || opts.maxPerKind < 1) fail('--max-per-kind must be a positive integer');
  return opts;
}

// The real location of the root (links and junctions resolved) must lie inside the current directory.
function insideCwd(target) {
  const rel = relative(realpathSync(process.cwd()), realpathSync(target));
  return rel === '' || !(rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel));
}

const toPosix = (p) => p.split(sep).join('/');

function createCollector(max) {
  const lists = new Map();
  return {
    add(kind, entry) {
      if (!lists.has(kind)) lists.set(kind, { total: 0, items: [] });
      const list = lists.get(kind);
      list.total += 1;
      if (list.items.length < max) list.items.push(entry);
    },
    items: (kind) => (lists.get(kind) || { items: [] }).items,
    truncatedKinds: () => [...lists].filter(([, l]) => l.total > l.items.length).map(([k, l]) => `${k}: ${l.total} found, ${l.items.length} listed`),
  };
}

function excludedCategory(segments, fileName) {
  for (const [category, names] of Object.entries(EXCLUDED_SEGMENTS)) {
    if (segments.some((s) => names.includes(s.toLowerCase()))) return category;
  }
  return GENERATED_NAME.test(fileName) ? 'generated' : null;
}

function fileRoute(rel) {
  const p = `/${rel}`;
  const code = /\.([cm]?[jt]sx?)$/;
  if (/\/pages\/api\//.test(p) && code.test(p)) return ['http', 'file route'];
  if (/\/app\/(.+\/)?route\.[cm]?[jt]s$/.test(p)) return ['http', 'file route'];
  if (/\/src\/routes\/(.+\/)?\+server\.[jt]s$/.test(p)) return ['http', 'file route'];
  // Skip page objects of E2E suites (LoginPage.ts), which are not routes.
  if (/\/pages\/.+\.(jsx?|tsx?|vue|svelte|mdx)$/.test(p) && !/\/pages\/_(app|document|error)\.|\/[A-Z]\w*Page\.[jt]sx?$/.test(p)) return ['ui', 'page'];
  if (/\/app\/(.+\/)?page\.(jsx?|tsx?|mdx)$/.test(p)) return ['ui', 'page'];
  if (/\/src\/routes\/(.+\/)?\+page\.svelte$/.test(p)) return ['ui', 'page'];
  if (/\/app\/routes\/.+\.(jsx?|tsx?)$/.test(p)) return ['ui', 'page'];
  return null;
}

function readText(abs) {
  try {
    return readFileSync(abs, 'utf8');
  } catch {
    return null;
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(`${USAGE}\n`);
    return;
  }
  const rootAbs = resolve(opts.root);
  if (isAbsolute(opts.root)) fail('root must be workspace-relative');
  let rootStat;
  try {
    rootStat = statSync(rootAbs);
  } catch {
    fail('root not found');
  }
  if (!rootStat.isDirectory()) fail('root is not a directory');
  if (!insideCwd(rootAbs)) fail('root must resolve inside the current directory; run the script from the workspace root');

  const out = createCollector(opts.maxPerKind);
  const excluded = {};
  const languages = {};
  const stats = { files: 0, scanned: 0, skippedLarge: 0, symlinksSkipped: 0, truncated: false };
  const manifests = [];
  const frameworks = new Set();
  const runners = [];
  const workspaces = { declared: [], packages: [] };
  const libraryFiles = new Set();
  const sources = [];
  const testFiles = [];

  const stack = [rootAbs];
  walk: while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const abs = join(dir, entry.name);
      if (entry.isSymbolicLink()) {
        stats.symlinksSkipped += 1;
        continue;
      }
      if (entry.isDirectory()) {
        if (REPORT_DIRS.has(entry.name)) out.add('reports', `${toPosix(relative(rootAbs, abs))}/ (report directory, not read)`);
        else if (!entry.name.startsWith('.') && !SKIP_DIRS.has(entry.name)) stack.push(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      stats.files += 1;
      if (stats.files > MAX_FILES) {
        stats.truncated = true;
        break walk;
      }
      const rel = toPosix(relative(rootAbs, abs));
      const segments = rel.split('/');
      const name = entry.name;
      const ext = extname(name).toLowerCase();
      if (ext) languages[ext] = (languages[ext] || 0) + 1;

      const category = opts.includeExcluded ? null : excludedCategory(segments.slice(0, -1), name);
      if (category) {
        excluded[category] = excluded[category] || { count: 0, sample: [] };
        excluded[category].count += 1;
        if (excluded[category].sample.length < 10) excluded[category].sample.push(rel);
        continue;
      }
      if (ext === '.feature') {
        const text = readText(abs) || '';
        const lang = /^\uFEFF?\s*#\s*language\s*:\s*([\w-]+)/.exec(text);
        out.add('features', `${rel} (language: ${lang ? lang[1] : 'en'})`);
        continue;
      }
      if (MANIFESTS.has(name) || MANIFEST_EXT.test(name)) {
        manifests.push(rel);
        const text = readText(abs) || '';
        if (segments.length > 1 && segments.length <= 4 && name !== 'go.work') workspaces.packages.push(segments.slice(0, -1).join('/'));
        inspectManifest(rel, name, text, { frameworks, runners, workspaces, libraryFiles, out, rootAbs });
        continue;
      }
      if (WORKSPACE_FILES.has(name)) {
        workspaces.declared.push(rel);
        continue;
      }
      if (RUNNER_CONFIG.test(name)) {
        const text = readText(abs) || '';
        const hints = text.split(/\r?\n/).filter((l) => /\.feature|paths|specPattern|features/.test(l)).slice(0, 3).map((l) => l.trim().slice(0, 120));
        runners.push(hints.length ? `${rel} — ${hints.join(' | ')}` : rel);
        continue;
      }
      if (DOC_EXT.has(ext)) {
        out.add('docs', rel);
        continue;
      }
      if (CONTRACT_NAME.test(name)) out.add('contracts', rel);
      if (REPORT_FILE.test(name)) {
        out.add('reports', rel);
        continue;
      }
      const lang = LANG_BY_EXT[ext];
      if (TEST_FILE.test(name) || segments.slice(0, -1).some((s) => TEST_DIRS.has(s))) {
        if (TEST_SYNTAX[lang]) testFiles.push({ abs, rel, lang });
        continue;
      }
      if (!lang) continue;
      const route = fileRoute(rel);
      if (route) out.add(route[0], `${rel}:1 ${route[1]}`);
      sources.push({ abs, rel, lang });
    }
  }

  for (const { abs, rel, lang } of sources) {
    const size = lstatSync(abs).size;
    if (size > MAX_BYTES) {
      stats.skippedLarge += 1;
      continue;
    }
    const text = readText(abs);
    if (text === null || text.includes('\u0000')) continue;
    const head = text.split(/\r?\n/, 5).join('\n');
    if (!opts.includeExcluded && (GENERATED_MARK.test(head) || GENERATED_MARK_ANY_CASE.test(head))) {
      excluded.generated = excluded.generated || { count: 0, sample: [] };
      excluded.generated.count += 1;
      if (excluded.generated.sample.length < 10) excluded.generated.sample.push(rel);
      continue;
    }
    stats.scanned += 1;
    const patterns = PATTERNS.filter((p) => p.langs.has(lang) && (!p.when || p.when(rel, text)));
    const lines = text.split(/\r?\n/);
    const isLibraryFile = libraryFiles.has(rel) || (lang === 'py' && rel.endsWith('__init__.py') && rel.split('/').length <= 3);
    lines.forEach((line, index) => {
      if (line.length > 2000) return;
      for (const p of patterns) {
        const m = p.re.exec(line);
        if (m) out.add(p.kind, `${rel}:${index + 1} ${p.fmt(m)}`);
      }
      if (isLibraryFile) {
        for (const [re, fmt] of EXPORT_LINE) {
          const m = re.exec(line);
          if (m) {
            out.add('library', `${rel}:${index + 1} ${fmt(m)}`);
            break;
          }
        }
      }
    });
  }

  for (const { abs, rel, lang } of testFiles) {
    if (lstatSync(abs).size > MAX_BYTES) {
      stats.skippedLarge += 1;
      out.add('tests', `${rel} — not read, larger than 1 MB`);
      continue;
    }
    const text = readText(abs);
    if (text !== null) out.add('tests', analyzeTest(rel, text, TEST_SYNTAX[lang], out));
  }

  const kinds = ['http', 'ui', 'cli', 'events', 'jobs', 'graphql', 'rpc', 'library'];
  const result = {
    root: toPosix(relative(process.cwd(), rootAbs)) || '.',
    stats,
    languages: Object.fromEntries(Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 12)),
    manifests,
    frameworks: [...frameworks].sort(),
    workspaces: { declared: workspaces.declared, packages: [...new Set(workspaces.packages)].sort() },
    runners,
    docs: out.items('docs'),
    contracts: out.items('contracts'),
    features: out.items('features'),
    tests: out.items('tests'),
    testCases: out.items('testCases'),
    reports: out.items('reports'),
    entryPoints: Object.fromEntries(kinds.map((k) => [k, out.items(k)])),
    access: out.items('access'),
    excluded,
    notes: out.truncatedKinds(),
  };
  if (stats.truncated) result.notes.push(`stopped after ${MAX_FILES} files; narrow --root`);
  const found = kinds.reduce((n, k) => n + result.entryPoints[k].length, 0);
  process.stdout.write(`${JSON.stringify(safeOutput(result), null, 2)}\n`);
  process.stderr.write(`[scan-entry-points] ${stats.files} files, ${stats.scanned} scanned, ${found} entry points listed, ${testFiles.length} test files read\n`);
}

// Reads one test file without running it: its cases (with their line), skipped cases and test doubles.
// Returns the summary line for "tests" and adds each case to "testCases".
function analyzeTest(rel, text, syntax, out) {
  let cases = 0;
  let skipped = 0;
  let skipNext = false;
  let pending = null; // an annotation (@Test, [Fact], #[test]) waiting for its method name
  const doubles = new Set();
  text.split(/\r?\n/).forEach((line, index) => {
    if (line.length > 2000) return;
    for (const [label, re] of syntax.doubles) if (re.test(line)) doubles.add(label);
    if (syntax.skipMarker && syntax.skipMarker.test(line)) skipNext = true;
    let name = null;
    let skipCase = false;
    const inline = syntax.skipCase && syntax.skipCase.exec(line);
    if (inline) {
      name = inline[inline.length - 1];
      skipCase = true;
    } else {
      for (const re of syntax.cases) {
        const m = re.exec(line);
        if (m) {
          name = m[m.length - 1];
          break;
        }
      }
    }
    if (!name && syntax.annotation) {
      if (syntax.annotation.test(line)) pending = { line: index + 1, skip: skipNext };
      if (pending) {
        const m = syntax.method.exec(line);
        if (m) name = m[1];
        else if (index + 1 - pending.line > 3) pending = null;
      }
    }
    if (!name) return;
    const isSkipped = skipCase || skipNext || Boolean(pending && pending.skip);
    cases += 1;
    if (isSkipped) skipped += 1;
    out.add('testCases', `${rel}:${index + 1} ${isSkipped ? '[skipped] ' : ''}${name.trim().slice(0, 120)}`);
    skipNext = false;
    pending = null;
  });
  if (syntax.skipInBody) skipped += (text.match(syntax.skipInBody) || []).length;
  const counts = [`${cases} case${cases === 1 ? '' : 's'}`];
  if (skipped) counts.push(`${skipped} skipped`);
  return `${rel} — ${counts.join(', ')}; doubles: ${doubles.size ? [...doubles].join(', ') : 'none found'}`;
}

function inspectManifest(rel, name, text, ctx) {
  const dir = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/') + 1) : '';
  if (name === 'package.json') {
    let pkg;
    try {
      pkg = JSON.parse(text);
    } catch {
      return;
    }
    const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
    for (const dep of KNOWN_JS) if (dep in deps) ctx.frameworks.add(dep);
    for (const dep of RUNNER_DEPS) if (dep in deps) ctx.runners.push(`dependency ${dep} (${rel})`);
    if (pkg.workspaces) ctx.workspaces.declared.push(`${rel} workspaces: ${JSON.stringify(pkg.workspaces.packages || pkg.workspaces)}`);
    const bins = typeof pkg.bin === 'string' ? { [pkg.name || 'bin']: pkg.bin } : pkg.bin || {};
    for (const [command, file] of Object.entries(bins)) ctx.out.add('cli', `${rel} bin ${command} -> ${dir}${String(file).replace(/^\.\//, '')}`);
    const libraryTargets = [pkg.module, pkg.types, pkg.typings, pkg.private ? null : pkg.main];
    const collect = (value) => {
      if (typeof value === 'string') libraryTargets.push(value);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    collect(pkg.exports);
    for (const target of libraryTargets.filter((t) => typeof t === 'string' && !t.includes('*'))) {
      const file = `${dir}${target.replace(/^\.\//, '')}`;
      ctx.libraryFiles.add(file);
      ctx.out.add('library', `${rel} entry ${file}`);
    }
    return;
  }
  for (const dep of KNOWN_TEXT) if (text.includes(dep)) ctx.frameworks.add(dep);
  for (const dep of RUNNER_DEPS) if (text.includes(dep)) ctx.runners.push(`dependency ${dep} (${rel})`);
  if (name === 'pyproject.toml') {
    const scripts = /\[(?:project\.scripts|tool\.poetry\.scripts)\]([\s\S]*?)(?:\n\[|$)/.exec(text);
    if (scripts) {
      for (const line of scripts[1].split(/\r?\n/)) {
        const m = /^\s*([\w.-]+)\s*=\s*["']([^"']+)["']/.exec(line);
        if (m) ctx.out.add('cli', `${rel} script ${m[1]} -> ${m[2]}`);
      }
    }
  }
  if (name === 'Cargo.toml' && /^\s*\[workspace\]/m.test(text)) ctx.workspaces.declared.push(`${rel} [workspace]`);
}

try {
  main();
} catch (error) {
  if (error instanceof UsageError) process.stderr.write(`[scan-entry-points] ${error.message}\n${USAGE}\n`);
  else process.stderr.write('[scan-entry-points] failed to inspect files\n');
  process.exitCode = 2;
}
