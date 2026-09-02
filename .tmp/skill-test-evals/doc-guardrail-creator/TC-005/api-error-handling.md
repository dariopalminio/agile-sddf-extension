# Guardrail: API Error Handling

Applies to every HTTP JSON API endpoint that can return an error response (4xx/5xx). Does not apply
to GraphQL resolvers, gRPC services, or webhook callbacks, which use different error-reporting
conventions.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (Spectral / grep)

#### Error response contract

- [ ] Every 4xx/5xx response declares `Content-Type: application/problem+json` — Spectral: `api-error-content-type` (error)
- [ ] No stack trace (exception class name, file path, or line number from a raised error) is ever serialised into a response body — grep (error)

---

### Semantic rules (AI / human review)

- [ ] The message returned to the client explains the problem in plain, meaningful language for the end user — not a copy of an internal exception message or validation-library output.
- [ ] No response exposes internal domain vocabulary to the client — internal class or service names, module or package paths, database column names, or other implementation detail.

## Minimum expected structure

```json
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{
  "type": "https://example.com/errors/user-not-found",
  "title": "User not found",
  "status": 404,
  "detail": "We couldn't find an account with that email address."
}
```

## How to run the validation

```bash
npx @stoplight/spectral-cli lint <openapi-spec>.yaml --ruleset .spectral.yaml   # api-error-content-type

# grep-level check — a stack trace must never leave the process boundary
grep -rnE "(res(ponse)?\.(json|send)\([^)]*\.stack|JSON\.stringify\([^)]*\.stack)" --include="*.ts" --include="*.js" . \
  && exit 1 || echo "OK: no stack trace serialised into a response"
```

This guardrail assumes Spectral CLI v6 or newer (`@stoplight/spectral-cli`). `api-error-content-type`
is not a built-in Spectral rule — no stock rule enforces this exact contract, so it is defined here
in full as a custom ruleset:

```yaml
# .spectral.yaml
rules:
  api-error-content-type:
    description: Every 4xx/5xx response must be served as application/problem+json
    message: "api-error-content-type: {{property}} response must declare content.application/problem+json"
    severity: error
    given: "$.paths[*][*].responses[?(@property.match(/^(4|5)/))]"
    then:
      field: "content.application/problem+json"
      function: truthy
```

## Verification

| Level | Action |
|-------|--------|
| Deterministic | The commands above finish with zero errors. |
| Semantic | Review the semantic checklist against the diff (AI or human) and attach the result to the PR. |
