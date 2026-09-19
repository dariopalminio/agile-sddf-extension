# Guardrail: Custom agent creation

Applies to every custom agent definition file — `.claude/agents/` and `~/.claude/agents/` (Claude
Code), `.opencode/agents/` and `~/.config/opencode/agents/` (OpenCode), `.github/agents/*.agent.md`
(GitHub Copilot), `.agents/agents/` and `~/.gemini/config/agents/` (Antigravity) — creating one,
editing one, or reviewing its diff. Does not apply to Agent Skills, which are governed by
[guardrails/skill-creation-checklist.md](skill-creation-checklist.md), nor to policies, nor to the
code an agent produces when it runs.

Rule IDs: `AGT-NN` — unique across this project's guardrails, immutable once published:
never renumbered, never reused.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (python / grep / basename)

Every check is defined in full under *How to run the validation* — this file depends on no external
script and no CI service. Each check prints the `AGT-NN` id of the rule it enforces, so breaches
stay greppable in the output. All commands assume `AGENT=<path to the agent file>`, set once.

#### Frontmatter contract

- [ ] **AGT-01** The file opens with a `---` YAML block that parses as a mapping — python (error)
- [ ] **AGT-02** `description` is present and is a non-empty string — python (error)
- [ ] **AGT-03** `mode`, when declared, is exactly one of `primary`, `subagent`, `all` — python (error)
- [ ] **AGT-04** `model`, when declared, is written as `provider/model-id` — python (error)
- [ ] **AGT-05** `temperature` and `top_p`, when declared, are numbers in `[0, 1]` — python (error)
- [ ] **AGT-06** `steps` is an integer, `disable` and `hidden` are booleans, `color` is a string — python (error)
- [ ] **AGT-07** No frontmatter key outside `description`, `mode`, `model`, `temperature`, `top_p`, `permission`, `tools`, `steps`, `disable`, `hidden`, `color` — python (warn)

> A `name:` key is **not** part of an agent's frontmatter. Unlike `SKILL.md`, the identifier is the
> file name without its extension — `security-auditor.md` becomes `@security-auditor`. Do not carry
> `name:` over by inertia from a skill.

#### File identity & location

- [ ] **AGT-08** The file sits in one of the recognised agent directories listed in the scope above — python (error)
- [ ] **AGT-09** A file under `.github/agents/` carries the `.agent.md` extension; every other platform uses `.md` — python (error)
- [ ] **AGT-10** The identifier — the basename without extension — is lowercase alphanumeric with hyphens, and contains no space, underscore or uppercase letter — python (error)
- [ ] **AGT-11** The identifier is at most 64 characters and has no leading, trailing or doubled hyphen — python (error)
- [ ] **AGT-12** The body after the closing `---` is non-empty: the agent carries system instructions, not frontmatter alone — python (error)
- [ ] **AGT-13** A project-scoped agent is tracked by git, so the whole team gets it — `git ls-files` (warn)

#### Permissions & tools

- [ ] **AGT-14** A `permission` block is declared; capabilities are granted explicitly, never left to the platform default — python (warn)
- [ ] **AGT-15** Every value inside `permission` is `allow`, `ask` or `deny` — python (error)
- [ ] **AGT-16** `bash` is not granted blanket `allow` — either `ask`, or `allow` scoped to named command patterns — python (error)
- [ ] **AGT-17** `edit` and `write` are declared rather than implicit, so the agent's blast radius is stated in the file — python (warn)
- [ ] **AGT-18** Web access — `webfetch`, `websearch` — is declared under `permission` when the agent needs it — python (warn)
- [ ] **AGT-19** The deprecated `tools:` block is absent; its capabilities are expressed under `permission` — grep (warn)

> Secrets, private keys and tracked artefacts are checked repo-wide by
> [guardrails/code-security-checklist.md](code-security-checklist.md). Do not duplicate
> `SEC-01` here.

---

### Semantic rules (AI / human review)

- [ ] **AGT-20** The `description` answers *when to delegate to this agent*, not *how the task is done* — it is the text the platform matches against to route work, so a vague one silently never fires.
- [ ] **AGT-21** The granted permissions are the minimum the agent's stated job needs: `ask` for operations that require supervision, `deny` for operations that must never happen, `allow` only where the agent would otherwise stall.
- [ ] **AGT-22** The agent has a single, well-defined purpose; one that has grown to cover two jobs is split into two agents.
- [ ] **AGT-23** The instructions carry the project's real context — conventions, frameworks and their versions, expected code patterns — and show an example of the output shape the agent must produce.
- [ ] **AGT-24** The `model` matches the task's complexity: a cheaper, faster model for mechanical work, a stronger one only where the task genuinely needs the reasoning.
- [ ] **AGT-25** `mode` matches how the agent is actually invoked; `subagent` is chosen because the isolated context is wanted, not as a default.
- [ ] **AGT-26** The agent does not re-implement a built-in the platform already ships — Claude Code's Explore and Plan, OpenCode's `build`, `general`, `explore` and `scout`, Copilot's `@debugger`, `@git`, `@profiler`, `@test` and `@modernize`.
- [ ] **AGT-27** Scope is deliberate: a project agent is committed so the team inherits it; a user-global agent carries nothing repository-specific.
- [ ] **AGT-28** The agent was exercised on a real task in this repository before being released to the team.
- [ ] **AGT-29** The agent's prompt contains no credential, no personal data and no internal host name or URL.

## Minimum expected structure

```
.claude/agents/security-auditor.md         ← Claude Code   → @security-auditor
.opencode/agents/security-auditor.md       ← OpenCode      → @security-auditor
.github/agents/test-writer.agent.md        ← Copilot       → @test-writer
.agents/agents/security-auditor.md         ← Antigravity   → @security-auditor
```

```yaml
---
description: "Security expert that reviews code for vulnerabilities. Use before merging."
mode: subagent                  # primary | subagent | all
model: anthropic/claude-sonnet-5
temperature: 0.1
permission:
  read: allow
  edit: deny                    # least privilege — deny what must never happen
  write: deny
  bash:                         # a nested mapping — never a blanket allow
    "*": "ask"
    "npm test*": "allow"
  webfetch: allow
---

You are a software security expert. Review code for: injection, secret handling, vulnerable
dependencies and insufficient input validation. Report severity, exact location, and a fix.
```

The file name is the identifier — there is no `name:` key. The body below the frontmatter is the
agent's system prompt and must not be empty. Note that `bash: "*": "ask"` written on a single line
is **not** valid YAML and makes the whole file unloadable; command patterns go in a nested mapping,
as above.

## How to run the validation

```bash
AGENT=.claude/agents/<agent-name>.md     # set once; every command below uses it
python -m pip install --quiet pyyaml     # the only dependency of these checks

# frontmatter, identity and permission contract
# prints one "FAIL AGT-NN" line per breach, exits non-zero
python - "$AGENT" <<'PY'
import pathlib, re, sys, yaml
ALLOWED = {'description', 'mode', 'model', 'temperature', 'top_p',
           'permission', 'tools', 'steps', 'disable', 'hidden', 'color'}
DIRS = ('.claude/agents/', '.opencode/agents/', '.github/agents/',
        '.agents/agents/', '.config/opencode/agents/', '.gemini/config/agents/')
PERM = {'allow', 'ask', 'deny'}
p = pathlib.Path(sys.argv[1]); posix = p.as_posix(); fails = []
if not p.exists():
    sys.exit(f'FAIL AGT-08: {posix} not found')
if not any(d in posix for d in DIRS):
    fails.append(f'AGT-08: {posix} is not in a recognised agent directory')
copilot = '.github/agents/' in posix
if copilot != posix.endswith('.agent.md'):
    fails.append('AGT-09: .github/agents/ uses .agent.md; every other platform uses .md')
ident = p.name[:-len('.agent.md')] if posix.endswith('.agent.md') else p.stem
if not re.fullmatch(r'[a-z0-9-]+', ident):
    fails.append(f'AGT-10: {ident!r} must be lowercase alphanumeric with hyphens')
if len(ident) > 64 or not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', ident):
    fails.append(f'AGT-11: {ident!r} must be <= 64 chars, no leading/trailing/doubled hyphen')
text = p.read_text(encoding='utf-8')
m = re.match(r'^---\n(.*?)\n---\n?(.*)$', text, re.S)
if not m:
    print('FAIL AGT-01: no --- YAML block at the top of the file')
    sys.exit(1)
try:
    fm = yaml.safe_load(m.group(1))
except yaml.YAMLError as err:
    print(f'FAIL AGT-01: frontmatter is not valid YAML: {err}')
    sys.exit(1)
if not isinstance(fm, dict):
    print('FAIL AGT-01: frontmatter is not a YAML mapping')
    sys.exit(1)
if not m.group(2).strip():
    fails.append('AGT-12: no system instructions below the frontmatter')
desc = fm.get('description')
if not isinstance(desc, str) or not desc.strip():
    fails.append('AGT-02: description must be a non-empty string')
if set(fm) - ALLOWED:
    fails.append(f'AGT-07: unexpected key(s) {sorted(set(fm) - ALLOWED)}')
if 'mode' in fm and fm['mode'] not in ('primary', 'subagent', 'all'):
    fails.append(f'AGT-03: {fm["mode"]!r} must be primary, subagent or all')
if 'model' in fm and not re.fullmatch(r'[A-Za-z0-9._-]+/[A-Za-z0-9._-]+', str(fm['model'])):
    fails.append(f'AGT-04: {fm["model"]!r} must be provider/model-id')
for k in ('temperature', 'top_p'):
    v = fm.get(k)
    if k in fm and (isinstance(v, bool) or not isinstance(v, (int, float)) or not 0 <= v <= 1):
        fails.append(f'AGT-05: {k}={v!r} must be a number in [0, 1]')
for k, t in (('steps', int), ('disable', bool), ('hidden', bool), ('color', str)):
    if k in fm and (not isinstance(fm[k], t) or (t is int and isinstance(fm[k], bool))):
        fails.append(f'AGT-06: {k}={fm[k]!r} must be {t.__name__}')
perm = fm.get('permission')
if not isinstance(perm, dict):
    fails.append('AGT-14: no permission block declared (warn)')
    perm = {}
for k, v in perm.items():
    vals = list(v.values()) if isinstance(v, dict) else [v]
    for val in vals:
        if val not in PERM:
            fails.append(f'AGT-15: permission.{k} = {val!r} must be allow/ask/deny')
    if k == 'bash' and v == 'allow':
        fails.append('AGT-16: bash: allow grants every command; scope it or use ask')
    if k == 'bash' and isinstance(v, dict) and v.get('*') == 'allow':
        fails.append('AGT-16: bash "*": "allow" grants every command')
for k in ('edit', 'write'):
    if k not in perm:
        fails.append(f'AGT-17: permission.{k} is not declared (warn)')
if re.search(r'\b(webfetch|websearch|fetch|browse)\b', text, re.I) and not (
        {'webfetch', 'websearch'} & set(perm)):
    fails.append('AGT-18: the prompt mentions web access but permission does not declare it (warn)')
for f in fails:
    print('FAIL', f)
print(f'checked {ident}: {len(fails)} breach(es)')
sys.exit(1 if fails else 0)
PY

# grep- and git-level checks — each prints its rule id followed by the breach; nothing printed = pass
chk()  { [ -z "$2" ] || printf 'FAIL %s\n%s\n' "$1" "$2"; }
warn() { [ -z "$2" ] || printf 'WARN %s\n%s\n' "$1" "$2"; }
chk  AGT-19 "$(grep -n '^tools:' "$AGENT")"                                          # express it under permission
warn AGT-13 "$(git ls-files --error-unmatch "$AGENT" >/dev/null 2>&1 || echo "$AGENT is not tracked by git")"   # project-scoped agents only
```

The Python block needs Python 3.8+ and `PyYAML`; nothing else. On a host whose default encoding is
not UTF-8, prefix it with `PYTHONUTF8=1`. Run everything from Git Bash on Windows or any POSIX
shell. A check that prints nothing passes; a check that prints a line names the breach.

## Verification

| Level | Action |
|-------|--------|
| Deterministic | Run the commands above; the Python block exits 0 with no `(error)` breach, each `(warn)` line is triaged and either fixed or justified in the PR, and the grep check prints nothing. |
| Semantic | Review the semantic checklist against the diff (AI or human reviewer), citing the `AGT-NN` id of each finding, and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the contract a custom agent definition must satisfy. The authoritative
expansion — the full field reference per platform, interactive creation flows, built-in subagent
catalogues and per-platform invocation details — lives in each platform's official documentation:
[Claude Code subagents](https://docs.anthropic.com/en/docs/claude-code/sub-agents) and
[GitHub Copilot custom agents](https://github.com/github/awesome-copilot). Where this file and the
platform documentation disagree, the platform documentation prevails.

