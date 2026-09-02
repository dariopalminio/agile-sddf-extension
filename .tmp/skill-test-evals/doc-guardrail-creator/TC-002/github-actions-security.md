# Guardrail: GitHub Actions Security

Applies to workflow definitions under `.github/workflows/*.yml`. Does not apply to composite
actions under `.github/actions/`, to self-hosted runner infrastructure, or to non-security aspects
of workflow design (job structure, caching, matrix strategy).

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (zizmor / gitleaks / grep)

#### Action pinning, permissions & secrets

- [ ] Every `uses:` step reference is pinned to a full 40-character commit SHA, never a branch, tag or short SHA — zizmor: `unpinned-uses` (error)
- [ ] Every job declares an explicit `permissions:` block; none relies on the default (broad) `GITHUB_TOKEN` scope — zizmor: `excessive-permissions` (error)
- [ ] No literal credential-shaped string (API key, token, password) appears in workflow YAML — gitleaks: `generic-api-key` (error)
- [ ] Every `env:` or `with:` value assigned to a key named `*_TOKEN`, `*_KEY`, `*_SECRET` or `*_PASSWORD` references `${{ secrets.* }}`, never an inline literal — grep (error)

---

### Semantic rules (AI / human review)

- [ ] A pinned commit SHA corresponds to a release actually published by the action's own maintainer, not a fork or a compromised commit.
- [ ] Secrets referenced via `secrets.*` are sourced from the repository's or organization's secret store, never smuggled in through a committed file loaded at runtime.
- [ ] The scopes granted in each job's `permissions:` block are the minimum its steps require (e.g. `contents: read` unless a step genuinely needs to write), not a copied `write-all` / `read-all` habit.

## Minimum expected structure

```
.github/
└── workflows/
    └── ci.yml                 ← permissions block per job, pinned actions, secrets via context
```

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@f43a0e5ff2bd294095638e18286ca9a3d1956744 # v4.2.2
      - name: Publish
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npm publish
```

## How to run the validation

```bash
zizmor .github/workflows/                              # unpinned-uses, excessive-permissions
gitleaks detect --no-git --source .github/workflows/    # generic-api-key and related secret patterns

# grep-level check: TOKEN/KEY/SECRET/PASSWORD keys must reference secrets.*, not a literal
grep -RnE '(TOKEN|KEY|SECRET|PASSWORD):[[:space:]]*[^$[:space:]]' .github/workflows/*.yml | grep -v 'secrets\.'
```

`zizmor` requires >= 1.0.0. `gitleaks` requires >= 8.18.0 (the version that ships the
`generic-api-key` rule in its default config).

## Verification

| Level | Action |
|-------|--------|
| Deterministic | The commands above finish with zero errors. |
| Semantic | Review the semantic checklist against the diff (AI or human) and attach the result to the PR. |
