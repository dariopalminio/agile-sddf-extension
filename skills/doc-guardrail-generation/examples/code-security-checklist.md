# Guardrail: Code security check

Applies to every file this repository commits — the scripts under `skills/*/scripts/`, the code
templates under `assets/`, `references/` and `examples/`, and every Markdown document. Does not apply
to the applications an agent builds by *using* these skills: their runtime, their infrastructure and
their pipelines are governed by the security policy of the target project. Nor to what a skill tells
an agent to do — that is
[guardrails/ai-security-checklist.md](ai-security-checklist.md).

Rule IDs: `SEC-NN` — unique across this project's guardrails, immutable once published:
never renumbered, never reused.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (grep / git ls-files / git check-ignore)

Every check is defined in full under *How to run the validation* — this file depends on no external
scanner and no CI service. Each check prints the `SEC-NN` id of the rule it enforces, so a breach
stays greppable in the output.

#### Secrets and personal data

- [ ] **SEC-01** No credential is assigned a literal value of 20 characters or more in any tracked file — grep (error)
- [ ] **SEC-02** No private key or certificate block is tracked — grep (error)
- [ ] **SEC-03** No provider token pattern (AWS access key, GitHub token, OpenAI-style key, Slack token) appears in a tracked file — grep (error)
- [ ] **SEC-04** No credential-bearing file is tracked — `.env`, `*.pem`, `*.p12`, `*.pfx`, `*.key`, `id_rsa` — `git ls-files` (error)
- [ ] **SEC-05** E-mail addresses in docs, evals and fixtures use a reserved example domain (`example.com`, `example.org`, `test.com`, `.test`, `.invalid`) — grep (warn)
- [ ] **SEC-06** `.gitignore` covers the paths that hold local credentials and agent state: `.env`, `.claude`, `.agents`, `.temp`, `__pycache__`, `node_modules` — `git check-ignore` (error)

#### Executable code (Python, Node, TypeScript)

- [ ] **SEC-07** Scripts invoke subprocesses with an argument list; no `shell=True`, `os.system(`, `child_process.exec(` — grep (error)
- [ ] **SEC-08** Scripts evaluate no dynamically built code — no `eval(`, `exec(`, `new Function(`, `pickle.load` — grep (error)
- [ ] **SEC-09** YAML is parsed with `yaml.safe_load` or an explicit `SafeLoader` — grep (error)
- [ ] **SEC-10** Scripts keep transport verification on — no `verify=False`, `rejectUnauthorized: false`, `NODE_TLS_REJECT_UNAUTHORIZED` — grep (error)
- [ ] **SEC-11** Every path a script touches is relative to the repository or to a caller-supplied root; no drive letter and no `/home`, `/Users`, `/root`, `/etc` literal — grep (error)

#### Tracked artefacts and documented commands

- [ ] **SEC-12** No documented or scripted command redirects package resolution to an alternative index, registry or mirror — grep (error)
- [ ] **SEC-13** No documented or scripted command escalates privileges (`sudo`, `runas`) — grep (error)
- [ ] **SEC-14** No generated artefact is tracked — `__pycache__/`, `*.pyc`, `*.log` — `git ls-files` (error)
- [ ] **SEC-15** No binary or archive artefact is tracked — `*.exe`, `*.dll`, `*.so`, `*.zip`, `*.jar`, `*.skill` — `git ls-files` (error)

> Piping remote content into an interpreter is checked in the AI guardrail, under third-party
> executed content. Do not duplicate that `AIS-*` rule here.

---

### Semantic rules (AI / human review)

- [ ] **SEC-16** Every script validates its external inputs — CLI arguments, environment variables, and the JSON, YAML or Markdown it parses — by type, shape and range before using them.
- [ ] **SEC-17** A path derived from an argument is resolved and confined to the repository or to a caller-supplied root, so no input can traverse outside it.
- [ ] **SEC-18** Script output and error messages diagnose the problem without echoing a token, a full environment, or an absolute host path.
- [ ] **SEC-19** Examples, evals and fixtures use synthetic data; no real user, customer, host name or internal URL is used to make an example look realistic.
- [ ] **SEC-20** Credential values that appear in teaching material are obviously fake, and the surrounding text shows the value being read from a secret manager or environment variable rather than hardcoded.
- [ ] **SEC-21** Cryptography shown in a skill or template uses current algorithms and libraries; MD5 and SHA-1 are never presented as an example for passwords or signatures.
- [ ] **SEC-22** A new third-party dependency introduced by a script has a technical reason, and its licence, maintenance status and known vulnerabilities were checked before it was added.
- [ ] **SEC-23** A change that relaxes any control in this file states why, who decided it, and what compensating control applies.
- [ ] **SEC-24** The change considers the OWASP Top 10 risks that apply both to the code it introduces and to the code the skill teaches an agent to generate.

## Minimum expected structure

```gitignore
# .gitignore — the minimum that must be ignored
.env
.env.*
.claude
.agents
.temp
__pycache__/
*.pyc
node_modules/
```

```python
# skills/<skill>/scripts/<script>.py — the shape the deterministic rules expect
import subprocess, sys, pathlib, yaml
root = pathlib.Path(sys.argv[1]).resolve()                                  # SEC-11
if not root.is_relative_to(pathlib.Path.cwd()):
    sys.exit("path escapes the repository")                                 # SEC-17: confine to the caller's tree
config = yaml.safe_load((root / "config.yml").read_text(encoding="utf-8"))  # SEC-09
subprocess.run(["git", "ls-files", str(root)], check=True)                  # SEC-07: argument list, no shell
```

## How to run the validation

```bash
cd "$(git rev-parse --show-toplevel)"
present() { for f in "$@"; do [ -f "$f" ] && printf '%s\n' "$f"; done; }   # skip tracked-but-deleted paths
ALL=$(present $(git ls-files '*.md' '*.py' '*.mjs' '*.js' '*.ts' '*.json' '*.html' '*.feature' '*.txt' '*.yml'))
CODE=$(present $(git ls-files '*.py' '*.mjs' '*.js' '*.ts'))
SCAN=$(printf '%s\n' "$ALL" | grep -vE '^(guardrails|\.tmp)/|checklist\.md$')  # these quote the patterns by design

# each check prints its rule id followed by the offending lines; nothing printed = pass
fail=0
chk()  { [ -z "$2" ] || { printf 'FAIL %s\n%s\n' "$1" "$2"; fail=1; }; }
warn() { [ -z "$2" ] || printf 'WARN %s\n%s\n' "$1" "$2"; }

# secrets and personal data
chk  SEC-01 "$(grep -rInE '(api[_-]?key|secret|token|password|passwd)[[:space:]]*[:=][[:space:]]*["'\''][^"'\'']{20,}["'\'']' $ALL)"
chk  SEC-02 "$(grep -rIn 'BEGIN [A-Z ]*PRIVATE KEY' $ALL)"
chk  SEC-03 "$(grep -rInE '(AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})' $ALL)"
chk  SEC-04 "$(git ls-files | grep -E '(^|/)\.env|\.pem$|\.p12$|\.pfx$|\.key$|id_rsa')"
warn SEC-05 "$(grep -rhoIE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' $ALL | sort -u \
  | grep -vE '@(example\.(com|org|net)|test\.com|localhost|.*\.(test|invalid|local))$')"
chk  SEC-06 "$(for p in .env .claude .agents .temp __pycache__ node_modules; do git check-ignore -q "$p" || echo "$p is not ignored"; done)"

# executable code
chk  SEC-07 "$(grep -rInE 'shell=True|os\.system\(|child_process\.(exec|execSync)\(' $CODE)"
chk  SEC-08 "$(grep -rInE '(^|[^._[:alnum:]])(eval|exec)\(|new Function\(|pickle\.loads?\(' $CODE)"
chk  SEC-09 "$(grep -rIn 'yaml\.load(' $CODE | grep -v 'SafeLoader')"
chk  SEC-10 "$(grep -rInE -e 'verify=False' -e 'rejectUnauthorized' -e 'NODE_TLS_REJECT_UNAUTHORIZED' $CODE)"
chk  SEC-11 "$(grep -rInE '\b[A-Za-z]:[\\/]|(^|[^:[:alnum:]"])/(home|Users|root|etc)/' $CODE)"

# tracked artefacts and documented commands
chk  SEC-12 "$(grep -rInE -e '--index-url' -e '--registry' -e 'PIP_INDEX_URL' -e 'NPM_CONFIG_REGISTRY' $SCAN)"
chk  SEC-13 "$(grep -rInE '(^|[^[:alnum:]])(sudo|runas)[[:space:]]' $SCAN)"
chk  SEC-14 "$(git ls-files | grep -E '(^|/)__pycache__/|\.pyc$|\.log$')"
chk  SEC-15 "$(git ls-files | grep -E '\.(exe|dll|so|zip|jar|skill)$')"
exit $fail
```

Every command above needs only `git` and GNU `grep`; no package is installed. Run them from Git Bash
on Windows or any POSIX shell. A run that prints nothing and exits 0 passes; a `FAIL SEC-NN` line
names the rule, and the lines under it name the file and the breach.

## Verification

| Level | Action |
|-------|--------|
| Deterministic | Run the block above; it exits 0 and prints no `FAIL SEC-NN` line, and each `WARN SEC-NN` is triaged and either fixed or justified in the PR. |
| Semantic | Review the semantic checklist against the diff (AI or human reviewer), citing the `SEC-NN` id of each finding, and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the secure-development practice that applies to the content this
repository commits. The authoritative expansion — threat modelling, runtime and IaC scanning,
pipeline gates, SBOM and vulnerability SLAs — lives in the OWASP Top 10 and the
[OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/). Where this file and the security
policy of the project being built disagree, that project's policy prevails.

See also: [guardrails/ai-security-checklist.md](ai-security-checklist.md) — the other half of this
repository's security surface: what a skill instructs an agent to read, run and trust.
