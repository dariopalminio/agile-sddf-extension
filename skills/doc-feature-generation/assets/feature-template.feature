# TEMPLATE: Shape of every generated feature file. Delete every "# TEMPLATE:" line and replace every
# TEMPLATE: {{...}} placeholder. For a dialect other than English, the very first line of the file is
# TEMPLATE: "# language: <code>", and keywords, titles and steps use that dialect.
# TEMPLATE: Evidence header: one "# Evidence:" line per source, repository-relative, naming a symbol,
# TEMPLATE: route, command or event rather than a line number. No absolute path, secret or personal data.
# Evidence: {{path — symbol, route, command or event that implements the behavior}}
# Tests: {{path — test names (level, test doubles), read and not run; or "no test covers it"}}
# Status: {{Confirmed | Implemented, unverified | Partial | Proposed}} — {{limit of the evidence; a confirmation names its check and who reported it}}
# See also: {{domain/capability/feature.feature — shared rule it owns or uses; delete the line if none}}
{{@status-tag}} {{optional channel or cross-cutting tags, e.g. @api @access-control; delete if none}}
Feature: {{Behavior named in the actor's words}}
  {{Who uses it and the observable result they get.}}
  {{The rules that distinguish it; never an invented business motivation.}}

  # TEMPLATE: Background only for 1-3 preconditions shared by every scenario of the file; delete otherwise.
  Background:
    Given {{shared precondition}}

  # TEMPLATE: One Rule per distinct business rule. With a single rule, or a runner older than Gherkin 6,
  # TEMPLATE: turn the Rule line into a "# Rule: ..." comment and keep its scenarios.
  Rule: {{rule stated as a constraint}}

    Scenario: {{the rule holds}}
      Given {{state that satisfies the rule}}
      When {{one action or event}}
      Then {{observable result}}

    Scenario: {{the rule is enforced}}
      Given {{state that breaks the rule}}
      When {{one action or event}}
      Then {{observable rejection or alternative result}}

  # TEMPLATE: Scenario Outline only when one flow varies by data; delete otherwise.
  Rule: {{another rule stated as a constraint}}

    Scenario Outline: {{the rule across its data variants}}
      Given {{state with <input>}}
      When {{one action or event}}
      Then {{result with <outcome>}}

      Examples:
        | input     | outcome   |
        | {{value}} | {{value}} |

  # TEMPLATE: Tag a scenario @proposed when only docs or backlog support it, or @open-question when the
  # TEMPLATE: sources conflict or the trace stopped, with a "# Question:" comment above it saying what to confirm.
