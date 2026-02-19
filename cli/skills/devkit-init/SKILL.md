---
name: devkit-init
description: Initialize DevKit in any project. Use when developer wants to start using DevKit methodology — whether starting fresh, adding to an existing project with code, or upgrading from spec-kit alone. Triggers on phrases like "init devkit", "setup devkit", "start devkit", "add devkit to project", "initialize devkit".
license: MIT
metadata:
  author: devkit
  version: "1.0"
---

# DevKit Init

Initialize DevKit for any project state. Detect what exists, choose the right mode, set up what's needed.

## Step 1: Detect Project State

Check what exists in the current directory:

```
Check for:
  .devkit/          → already initialized
  .specify/         → spec-kit exists, no DevKit
  source code files → brownfield (code without DevKit)
  empty directory   → greenfield
```

Based on findings, choose mode:

| State | Mode |
|-------|------|
| .devkit/ exists | Already initialized → show status |
| .specify/ only | Upgrade mode → wrap spec-kit with DevKit |
| Code, no .devkit/ | Brownfield mode → reconstruct from code |
| Empty / no code | Greenfield mode → start fresh |

Read the mode guide:
- Greenfield: [greenfield.md](references/greenfield.md)
- Brownfield: [brownfield.md](references/brownfield.md)
- Upgrade from spec-kit: [upgrade.md](references/upgrade.md)

## Step 2: Create .devkit/ Structure

After determining mode, create the directory structure:

```
.devkit/
  research/         ← ResearchKit artifacts
  product/          ← ProductKit artifacts
  arch/
    decisions/      ← ADR, RFC, Investigation files
  qa/
    escalations/    ← QA escalation history
```

## Step 3: Install spec-kit if not present

Check if `specify` CLI is available:

```bash
specify --version
```

If not found, output instructions:
```
spec-kit not found. Install with:
  uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

Then run: specify init . --ai claude
```

If found but `.specify/` doesn't exist:
```bash
specify init . --ai claude
```

## Step 4: Confirm and Show Next Step

After init, tell developer what to do next based on mode:

Greenfield:
```
DevKit initialized. 
Start with: /research-kit
Describe your idea and we'll explore feasibility together.
```

Brownfield:
```
DevKit initialized in brownfield mode.
Reconstructed N invariants (review required).
Next: review .devkit/arch/invariants.md and confirm or correct.
Then: /arch-kit to fill gaps.
```

Upgrade:
```
DevKit initialized over existing spec-kit project.
Reconstructed constitution into ArchKit artifacts.
Next: review .devkit/arch/invariants.md
```
