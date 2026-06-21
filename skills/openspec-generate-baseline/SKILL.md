---
name: openspec-generate-baseline
description: >-
  Generates an OpenSpec baseline by reverse-engineering the code (src/, README.md, AGENTS.md) and archives it directly.
  Use when the project has code but no OpenSpec specifications.
license: MIT
metadata:
  owner: dariopalminio/agile-sddf-extension
---

# OpenSpec Baseline Generation

## Overview

Generates a baseline set of OpenSpec specifications by reverse-engineering the existing code (`src/`, `README.md`, `AGENTS.md`) and archives it as a historical reference point of the system's state when adopting OpenSpec.

**Flow:** `/opsx:propose baseline` (reverse engineering) → `/opsx:archive` (without apply)

**Capabilities:**
- Reverse-engineers the code to deduce behavior, business rules, flows, and existing capabilities.
- Creates the `baseline` change (or `baseline-YYYY-MM-DD`) and archives it directly, without an apply phase.

**Limitations:**
- Does not run `/opsx:apply` — it does not plan new work, it only documents the current state.
- The generated artifacts are an initial approximation that requires manual review for anything that cannot be inferred from the code.

## Prerequisites

- The project has source code but does **not** yet have OpenSpec specifications.
- OpenSpec is initialized (the `openspec/` directory exists).
- A source code directory exists (`src/` by default; otherwise the user indicates which one).
- The `/opsx:propose` and `/opsx:archive` skills are available.

## Execution

1. **Verify the source code directory**

   Check whether the `src/` directory exists at the project root:
   - If `src/` exists → use it as the main source directory and continue
   - If `src/` does **not** exist → list all directories at the project root and ask the user: *"The `src/` directory was not found. Which of these directories contains the source code?"*. Use the directory the user indicates.

2. **Check whether a `baseline` change already exists**

   Check whether `openspec/changes/baseline/` exists:
   - If it does **not** exist → continue to step 3
   - If it **exists** → ask the user with two options:
     - **Overwrite**: delete the existing change and create a new one named `baseline`
     - **Date suffix**: create the new change with the name `baseline-YYYY-MM-DD` (using the current date)

   Use the chosen name in all subsequent steps.

3. **Invoke `/opsx:propose` with a reverse-engineering instruction**

   Use the `/opsx:propose` skill, passing the following reverse-engineering prompt as the change description:

   > **Change name:** `baseline` (or the one chosen in step 2)
   >
   > **Instruction for the proposal:**
   > Please read exhaustively the source code in the `<source-directory>/` directory and the `README.md` and `AGENTS.md` files (if present), and generate in reverse (by reverse-engineering the code for retrofitting and deducing implemented features) the OpenSpec specification artifacts that describe:
   > - The current behavior of the system (what it does today, how it does it)
   > - The implemented business rules (validations, conditions, constraints)
   > - The main user or data flows (happy paths and detected error cases)
   > - The existing capabilities, grouped by functional domain
   >
   > The generated artifacts are an **initial approximation** based on the current code. They must be reviewed manually to complete whatever cannot be inferred from the code (business intent, design decisions not expressed in code).

   Wait for `/opsx:propose` to complete all artifacts (proposal.md, design.md, specs/, tasks.md).

4. **Skip the apply phase**

   **Do not run `/opsx:apply`.**

   The code already exists — there is no pending implementation. The baseline change documents the current state of the system; it does not plan new work.

5. **Archive the change directly**

   Invoke the `/opsx:archive` skill with the change name (`baseline` or the one chosen in step 2).

   When `/opsx:archive` requests confirmation about incomplete tasks in `tasks.md`, confirm that you want to archive anyway: in a baseline, tasks do not represent work to be done.

## Output

- A `baseline` change (or `baseline-YYYY-MM-DD`) archived in `openspec/changes/archive/YYYY-MM-DD-baseline/`.
- Capability specs generated in `openspec/specs/<capability>/spec.md`.
- A final summary shown to the user:

  ```
  ## Baseline generated and archived

  **Archived change:** openspec/changes/archive/YYYY-MM-DD-baseline/
  **Specs generated in:** openspec/specs/<capability>/spec.md

  The baseline reflects the state of the system at the time of adopting OpenSpec.
  Review the generated specs and manually complete any section marked
  as low-confidence inference or with placeholders.

  For the next real change, use `/opsx:propose` normally.
  ```

## Examples

**Manual invocation:**
`/openspec-generate-baseline`
→ Detects `src/`, invokes `/opsx:propose baseline` with a reverse-engineering instruction, skips apply, and archives the change with `/opsx:archive`, showing the final summary.
