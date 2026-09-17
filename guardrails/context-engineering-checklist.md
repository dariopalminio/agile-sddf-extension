# Guardrail: Context engineering

Applies to every artefact that occupies an agent's context window in this repository — `AGENTS.md`,
`CLAUDE.md` and `.claude/agents/*.md` (always loaded), and `skills/*/SKILL.md`, `skills/*/references/`,
`policies/` and `guardrails/` (loaded on demand) — and to the way an agent assembles context at run
time. Does not apply to application source code, to test fixtures, or to the functional content of
generated specs and stories.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (python / grep / git)

Every check is defined in full under *How to run the validation* — this file depends on no external
script. The Python block emits each `ctx-*` id verbatim, so breaches stay greppable in the output.
All commands run from the repository root.

#### Always-loaded context budget

- [ ] Every always-loaded file stays under 250 lines, frontmatter excluded — python: `ctx-always-loaded-lines` (error)
- [ ] No always-loaded file declares more than 150 explicit rules, counted as bullet and numbered items outside code blocks — python: `ctx-rule-count` (error)
- [ ] Every always-loaded file states what it governs in its first 10 lines, in a line beginning `Applies to` or `This file` — python: `ctx-scope-first` (error)
- [ ] No always-loaded file inlines a fenced block longer than 40 lines; long material is linked instead — python: `ctx-no-inlined-blob` (warn)

> The 250-line ceiling applies to the **always-loaded** set only. `SKILL.md` keeps its own 500-line
> ceiling from [skill-creation-checklist.md](skill-creation-checklist.md), because a skill is paid
> for only when it fires. Do not carry either number across.

#### Selection and progressive retrieval

- [ ] Every on-demand document stays under 300 lines, or opens with a section index in its first 30 — python: `ctx-ondemand-lines` (warn)
- [ ] Every relative link in a context document resolves to a file that exists — python: `ctx-links-resolve` (error)
- [ ] Each file under `skills/*/references/` is named in the `SKILL.md` that owns it — python: `ctx-reference-linked` (warn)
- [ ] Every `policies/*.md` and `guardrails/*.md` is reachable from at least one other tracked document — python: `ctx-no-orphan-doc` (warn)
- [ ] Each `policies/` and `guardrails/` file carries exactly one `# ` heading, so one file covers one domain — python: `ctx-single-h1` (error)

#### Isolation and tool budget

- [ ] A skill that declares `allowed-tools` lists each tool by name; `*` is not an accepted value — grep: `ctx-explicit-tool-list` (error)
- [ ] No image, audio, archive or dataset is committed under `skills/`, `policies/` or `guardrails/` — `git ls-files`: `ctx-no-heavy-in-context` (error)
- [ ] The scratchpad directory `.tmp/` is git-ignored, so intermediate notes never reach the tracked context surface — `git check-ignore`: `ctx-scratchpad-ignored` (error)
- [ ] No tracked document cites a source that lives in a git-ignored path — python: `ctx-no-ignored-source` (error)

---

### Semantic rules (AI / human review)

- [ ] Every block loaded into the window is attributable to the task at hand; the turn runs on the smallest effective context, not on the largest one that fits.
- [ ] Mission-critical constraints and the immediate instruction sit at the edges of the context, never buried between intermediate blocks.
- [ ] Static instructions, rules and tool definitions come first and volatile values — dates, user data, the current query — come last, and that prefix is not rewritten between turns.
- [ ] Retrieval goes cheap before it goes deep: an index or keyword pass narrows the candidates, reranking orders them, and only the selected sections are read in full.
- [ ] The number of fragments injected is in the order of ten well-ranked ones, never hundreds unfiltered.
- [ ] A document that has grown to cover two domains is split, rather than kept whole and loaded entire.
- [ ] Plans, findings and intermediate state are written to an external scratchpad instead of accumulating in the conversation.
- [ ] A summary of prior history retains the established facts, the decisions taken and the live objectives, and discards intermediate logs and noisy tool output.
- [ ] Verbose tool output, redundant records and digressions are pruned from active memory once consumed; an inflated memory is worse than none.
- [ ] Source material is current, traceable to an authoritative origin, and free of statements that contradict another document in the surface.
- [ ] When responsibilities multiply within one prompt, the work is split across subagents with focused windows and a tool set bounded to each subtask.
- [ ] External memory, stores and summarisation logic are designed up front, not patched in once degradation is already visible.
- [ ] No credentials or personal data appear in any context artefact, including examples and scratchpad notes that get promoted into the repository.

## Minimum expected structure

```
AGENTS.md                         ← always loaded, < 250 lines, scope in the first 10
CLAUDE.md                         ← always loaded, if present
policies/<domain>-policy.md       ← one domain, one H1, linked from AGENTS.md
guardrails/<domain>-checklist.md  ← one domain, one H1, linked from AGENTS.md
skills/<skill>/
├── SKILL.md                      ← loaded on demand
└── references/<topic>.md         ← read only when SKILL.md says to
.tmp/                             ← scratchpad, git-ignored, never cited as a source
```

Fixed content first, volatile content last — the shape that keeps the prompt prefix cacheable:

```markdown
# Guardrail: <domain>

Applies to <scope>. Does not apply to <exclusion>.   ← fixed: scope at the top edge

## Mandatory rules                                    ← fixed: the stable prefix
...

| Version | Date | Author |                          ← volatile: kept at the bottom edge
```

## How to run the validation

```bash
grep -rn 'allowed-tools:.*\*' skills/*/SKILL.md                  # ctx-explicit-tool-list: prints nothing
git ls-files skills policies guardrails \
  | grep -iE '\.(png|jpe?g|gif|webp|svg|mp3|wav|mp4|zip|tar|gz|csv|parquet)$'  # ctx-no-heavy-in-context
git check-ignore -q .tmp || echo 'FAIL ctx-scratchpad-ignored: .tmp is tracked'
wc -l AGENTS.md CLAUDE.md 2>/dev/null                            # quick read of the always-loaded budget

# every remaining rule — prints one "FAIL <rule-id>" line per breach, exits non-zero
python - <<'PY'
import pathlib, re, subprocess, sys

root = pathlib.Path('.')
always = [p for p in (root/'AGENTS.md', root/'CLAUDE.md') if p.exists()]
always += sorted((root/'.claude'/'agents').glob('*.md'))
ondemand = (sorted(root.glob('skills/*/SKILL.md')) + sorted(root.glob('skills/*/references/*.md'))
            + sorted(root.glob('policies/*.md')) + sorted(root.glob('guardrails/*.md')))
rule_item = re.compile(r'^\s*(?:[-*+]|\d+\.)\s+\S', re.M)
link = re.compile(r'\]\(([^)\s#]+)')
fence = re.compile(r'^```.*?^```', re.S | re.M)
fails = []

def body(p):
    return re.sub(r'\A---\n.*?\n---\n', '', p.read_text(encoding='utf-8'), flags=re.S)

def prose(p):                      # body minus fenced blocks: markup, not samples
    return fence.sub('', body(p))

def ignored(path):
    return subprocess.run(['git', 'check-ignore', '-q', str(path)]).returncode == 0

for p in always:
    txt = body(p); lines = txt.splitlines()
    if len(lines) > 250:
        fails.append(f'ctx-always-loaded-lines: {p} has {len(lines)} lines > 250')
    n = len(rule_item.findall(prose(p)))
    if n > 150:
        fails.append(f'ctx-rule-count: {p} declares {n} explicit rules > 150')
    if not re.search(r'^(Applies to|This file)\b', '\n'.join(lines[:10]), re.M):
        fails.append(f'ctx-scope-first: {p} states no scope in its first 10 lines')
    for blk in fence.findall(txt):
        if blk.count('\n') > 40:
            fails.append(f'ctx-no-inlined-blob: {p} inlines a fenced block over 40 lines')
            break

for p in ondemand:
    lines = body(p).splitlines()
    if len(lines) > 300 and '\n'.join(lines[:30]).count('](#') < 3:
        fails.append(f'ctx-ondemand-lines: {p} has {len(lines)} lines > 300 and no index')

for p in always + ondemand:
    for target in set(link.findall(prose(p))):
        if re.match(r'^[a-z]+:', target) or re.search(r'[\[\]<>{}]', target):
            continue
        resolved = (p.parent / target).resolve()
        if not resolved.exists():
            fails.append(f'ctx-links-resolve: {p} cites {target}, which does not exist')
        elif ignored(resolved):
            fails.append(f'ctx-no-ignored-source: {p} cites {target}, which is git-ignored')

for p in sorted(root.glob('policies/*.md')) + sorted(root.glob('guardrails/*.md')):
    if len(re.findall(r'^# ', prose(p), re.M)) != 1:
        fails.append(f'ctx-single-h1: {p} must carry exactly one "# " heading')

tracked = [pathlib.Path(x) for x in subprocess.run(
    ['git', 'ls-files'], capture_output=True, text=True).stdout.split()]
corpus = {p: p.read_text(encoding='utf-8', errors='ignore')
          for p in tracked if p.suffix == '.md' and p.exists()}
for p in sorted(root.glob('policies/*.md')) + sorted(root.glob('guardrails/*.md')):
    if not any(p.name in t for q, t in corpus.items() if q.name != p.name):
        fails.append(f'ctx-no-orphan-doc: {p} is linked from no other tracked document')
for ref in sorted(root.glob('skills/*/references/*.md')):
    skill = ref.parent.parent / 'SKILL.md'
    if skill.exists() and ref.name not in skill.read_text(encoding='utf-8'):
        fails.append(f'ctx-reference-linked: {ref} is not named in {skill}')

for f in fails:
    print('FAIL', f)
print(f'context surface: {len(always)} always-loaded, {len(ondemand)} on-demand, {len(fails)} breach(es)')
sys.exit(1 if fails else 0)
PY
```

The Python block needs Python 3.8+ and a `git` on `PATH`; it has no third-party dependency. On a host
whose default encoding is not UTF-8, prefix it with `PYTHONUTF8=1`.

## Verification

| Level | Action |
|-------|--------|
| Deterministic | The Python block exits 0 and each grep- and git-level check above prints nothing. |
| Semantic | Review the semantic checklist against the diff (AI or human reviewer) and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the context-engineering rules enforceable on this repository's files.
The authoritative expansion — the four strategies, the finite-budget model, the run-time operating
procedure and the rationale behind each rule — lives in
[policies/context-engineering-policy.md](../policies/context-engineering-policy.md). Where this file
and that policy disagree, the policy prevails.
