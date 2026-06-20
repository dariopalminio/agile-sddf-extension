---
name: skill-name
description: Replace with description of the skill and when Claude should use it.
---

# Your Skill Title

## Overview

Brief description of the skill's purpose and value. One or two sentences.

**Capabilities:**
- What the skill does (specific actions).
- Key features or functionalities.

**Limitations:**
- What the skill does NOT do (to avoid misuse).
- Boundaries or restrictions.

## Prerequisites

- [Condition 1: required tools, permissions, or environment.]
- [Condition 2: files that must exist.]
- [Condition 3: installed dependencies.]

## Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `param1` | string | ✅ Yes | What this parameter controls. | `value-example` |
| `param2` | integer | ❌ No | Optional flag. | `42` |

## Execution

- **Manual**: `/your-command [parameters]` — asks for confirmation before making changes.
- **Automatic**: Called by another skill with `automated=true` — does not ask for confirmation.

## Output

Description of what the skill produces:
- Generated or modified files.
- Updates to configuration or state.
- Summary or log returned to the agent.

## Examples

**Manual invocation:**
/your-command param1=value
→ Expected result or behavior.

**Automatic invocation:**
Called from another skill with `automated=true` during a pipeline step.
→ Behavior and output.

## References

For more details, consult these reference files (loaded on demand):

- [Implementation Details](references/implementation.md) – deep dive into code structure.
- [Best Practices](references/best-practices.md) – guidelines and patterns.
- [Troubleshooting](references/troubleshooting.md) – common issues and fixes.

> These files are only loaded if the agent needs additional context.
