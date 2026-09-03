# Security Policy

## Scope

This repository ships **instructions that AI agents execute** — the skills under `skills/`, the
guardrails and policies an agent reads, and roughly a dozen Python and Node helper scripts. It is
consumed by installing those files into someone else's working directory, where an agent then acts on
them.

So a vulnerability here is not a crash or a memory bug. **It is anything in these files that makes an
agent following them act against the person running it**: reading what it was not asked to read,
sending data somewhere it should not, running something destructive without asking, or quietly
ignoring a control the user relies on.

Out of scope:

- The applications an agent builds by *using* these skills. Their runtime, infrastructure and
  pipelines are governed by the security policy of that project.
- Model, training-data, vector-store and inference concerns. This repository hosts none of them.
- Vulnerabilities in third-party tools the documentation mentions. Report those upstream.

## Supported versions

| Line | Status |
|------|--------|
| `main` | Supported. Fixes land here. |
| `v0.1.0` and other tags | Snapshots. Not patched in place. |

Installation pulls from `main`, not from a release: both `npx skills add
dariopalminio/agile-sddf-extension` and the documented raw-file download resolve to the tip of the
default branch. There is therefore one supported line, and updating means re-installing.

## Threat model

What this repository defends against, and the rule that gates each one. Rule ids come from the two
guardrails linked below, and the checks print them verbatim.

| Threat | Gated by |
|--------|----------|
| Indirect prompt injection — text in a skill or reference that redirects a later agent away from the user's task | `ai-no-prompt-override` |
| Exfiltration — instructions that make an agent read, copy or transmit anything outside the directory the user opened | semantic review, AI guardrail |
| Unsafe action — a documented command that is destructive or outward-facing with no confirmation step in front of it | `ai-confirm-before-irreversible` |
| Supply-chain substitution — a third-party skill in `skills-lock.json` swapped, forked or tampered with | `ai-locked-skill-hash`, `ai-locked-skill-source`, `ai-locked-skill-path` |
| Hidden text — invisible or bidirectional characters carrying instructions a reviewer cannot see (ASCII smuggling, Trojan Source) | `ai-no-hidden-characters` |
| Leaked secrets and personal data committed into skills, fixtures or docs | `sec-no-credential-literal`, `sec-no-provider-token`, `sec-no-personal-data` |

Prompt injection is the one worth stating plainly: because the product is text an agent obeys, a
malicious edit to a Markdown file is a code-execution primitive here, not a documentation typo.

## Prohibited patterns

A contribution must not contain, in any file:

1. **Instruction override** — text addressed to a future agent telling it to set aside its own rules,
   its guardrails, or the user's request.
2. **Exfiltration** — steps that gather shell history, credential stores, environment dumps, or the
   contents of sibling repositories, or that send repository content to an external endpoint.
3. **Permission escalation** — flags, settings or wording whose purpose is to skip the agent's
   approval prompt, widen file permissions, or run a step with elevated privileges.
4. **Credential harvesting** — steps that ask the user for a token or key, or that read one out of a
   secret store, for any purpose other than the task the user asked for.
5. **Remote code execution** — a documented command that downloads content and feeds it straight to
   an interpreter, or that redirects package resolution to a non-official index or mirror.
6. **Opaque content** — encoded blobs, or invisible and bidirectional characters, that a reviewer
   cannot read and audit as plain text.

The guardrails themselves, and the stored eval fixtures under `.tmp/`, quote several of these
patterns as sample content — that is why the automated checks skip `guardrails/`, `.tmp/` and
`*checklist.md`. Treat that exclusion as a reviewing convention, never as a place to park a live
directive: content in those paths is read by a human precisely because a grep will not read it.

## How this repository is validated

Two guardrails carry every rule, each classified by how it is verified — deterministically by a named
command, or semantically by review:

- [guardrails/code-security-checklist.md](guardrails/code-security-checklist.md) — secrets, executable
  scripts, tracked artefacts and documented commands.
- [guardrails/ai-security-checklist.md](guardrails/ai-security-checklist.md) — agent-facing
  instructions, untrusted input, irreversible actions, and third-party skills.

Each file defines its checks in full, so they run with `git`, GNU `grep` and Python 3, with no
external scanner. To run one:

```bash
sed -n '/^```bash$/,/^```$/p' guardrails/ai-security-checklist.md | sed '1d;$d' > /tmp/run.sh
bash /tmp/run.sh
```

**These run locally, on a maintainer's machine. No CI job enforces them today.** Findings are triaged
under each guardrail's on-breach rule: an `(error)` blocks the change, a `(warn)` is fixed or
justified in the pull request. Open findings are tracked in this repository's issues rather than
listed here.

Changes that add or edit a skill also get a human read. An automated pattern match catches known
phrasings; it does not catch a well-written instruction that happens to be malicious.

## Reporting a vulnerability

**Please do not open a public issue.**

Use GitHub's private reporting: go to the
[Security tab](https://github.com/dariopalminio/agile-sddf-extension/security/advisories) of
`dariopalminio/agile-sddf-extension` and choose *Report a vulnerability*. That opens a private thread
with the maintainer.

Include, as far as you can:

- the affected file, skill or lock entry;
- the agent behaviour it induces — what an agent following it would do that the user did not ask for;
- steps to reproduce, ideally the prompt and the observed action;
- your assessment of the impact.

This is a personally maintained project, so no response deadline is promised. Reports are
acknowledged as soon as the maintainer is able to, and you will be told what is happening rather than
left waiting.

## Coordinated disclosure

The fix lands first. A public advisory and a `CHANGELOG.md` entry follow it, so people who installed
from `main` know they need to re-install. Reporters are credited by name or handle unless they ask not
to be. There is no bug bounty.

If you are unsure whether what you found is a vulnerability or just a rough edge, report it privately
anyway — deciding that is the maintainer's job, not yours.
