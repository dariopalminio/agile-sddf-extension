# Guardrail: Docker Compose Service Definitions

Applies to every Docker Compose service definition (`compose.yaml` / `docker-compose.yml`,
`services:` blocks, including override files). Does not apply to Dockerfile build instructions,
Kubernetes manifests, or other orchestrators' manifest formats.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (docker compose config / jq)

#### Container hardening

- [ ] Every service's `image` is pinned to an immutable digest (`@sha256:<64-hex>`), never a mutable tag alone — jq (error)
- [ ] No service runs as root: `user` is set and is neither `root` nor UID `0` — jq (error)
- [ ] No key that looks like a secret (`PASSWORD`, `SECRET`, `TOKEN`, `API_KEY`, `PRIVATE_KEY`) appears under a service's `environment` — jq (error)
- [ ] Every service declares an active `healthcheck` (present and not `disable: true`) — jq (error)

---

### Semantic rules (AI / human review)

- [ ] The pinned digest belongs to an image the project's own pipeline built and scanned, not one resolved by hand from a public registry without verification.
- [ ] The non-root UID/GID in `user` actually owns the application's files and writable paths inside the image; changing the directive without matching file ownership in the image breaks the container at startup.
- [ ] No environment variable, regardless of its name, carries an embedded credential (a connection string, a signed URL, an API key inside a generic value); anything sensitive is moved to `secrets` and never committed as a literal.
- [ ] `healthcheck.test` exercises a real readiness signal (an HTTP endpoint, a dependency ping), never a placeholder such as `exit 0`; `interval`, `timeout` and `retries` are sized to the service's actual startup and failure behavior.

## Minimum expected structure

```
my-project/
├── compose.yaml            ← services:, top-level secrets: block
└── secrets/
    └── db_password.txt     ← git-ignored, referenced by secrets.db_password.file
```

```yaml
# compose.yaml
services:
  api:
    image: registry.example.com/api@sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
    user: "10001:10001"
    environment:
      NODE_ENV: production
    secrets:
      - db_password
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health/live"]
      interval: 10s
      timeout: 3s
      retries: 3

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

## How to run the validation

There is no published ruleset for Compose service hardening, so the deterministic layer is defined
here in full. Requires the `docker compose` CLI plugin (Compose V2; the legacy `docker-compose` V1
binary does not support `--format json`) and `jq`.

```bash
docker compose config --quiet   # the file is valid Compose Specification YAML

# every image is pinned to a sha256 digest
docker compose config --format json | jq -e '
  [.services[] | select(.image != null) |
    select(.image | test("@sha256:[0-9a-f]{64}$") | not)] | length == 0'

# no service runs as root
docker compose config --format json | jq -e '
  [.services[] | select((.user // "root") as $u |
    ($u == "root" or ($u | test("^0(:0)?$"))))] | length == 0'

# no secret-shaped key sits under `environment:`
docker compose config --format json | jq -e '
  [.services[] | (.environment // {}) | to_entries[] |
    select(.key | test("(?i)(PASSWORD|SECRET|TOKEN|API_KEY|PRIVATE_KEY)"))] | length == 0'

# every service declares an active healthcheck
docker compose config --format json | jq -e '
  [.services[] | select(.healthcheck == null or .healthcheck.disable == true)] | length == 0'
```

## Verification

| Level | Action |
|-------|--------|
| Deterministic | Run the commands above; `docker compose config --quiet` and every `jq -e` check must exit 0. |
| Semantic | Review the semantic checklist against the diff (AI or human reviewer) and attach the result to the PR. |

## Source of truth

This guardrail **summarises** Docker Compose service-level hardening: image pinning, non-root
execution, secret placement, and health checks. The authoritative expansion — full Compose file
syntax, build configuration, networks, volumes, and multi-file overrides — lives in the Compose
Specification (https://compose-spec.io). Where this file and the Compose Specification disagree,
the Compose Specification prevails.
