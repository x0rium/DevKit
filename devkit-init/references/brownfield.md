# Brownfield Mode

Code exists. No .devkit/. May or may not have .specify/.

## Phase 1: Project Scan

Read the codebase to understand what exists:

```
Scan for:
  - Main language and framework
  - Entry points (main files, index, app)
  - Database / storage patterns
  - External services and integrations
  - Test files (understand what's already tested)
  - README or docs (understand stated intent)
  - Package files (dependencies reveal architecture)
```

Summarize findings before proceeding:
```
Found: [framework], [database], [key integrations]
Size: ~N files, ~M lines
Tests: yes/no, coverage unknown
Docs: yes/no
```

## Phase 2: Invariant Extraction

Read source code deeply. Look for patterns that reveal implicit invariants:

**Signals of technical invariants:**
- Transactions wrapping multiple operations → atomicity invariant
- Locks, mutexes, SELECT FOR UPDATE → concurrency invariant
- Retry logic → reliability invariant
- Auth checks on every endpoint → security invariant
- Validation before DB writes → data integrity invariant

**Signals of broken invariants:**
- TODO/FIXME/HACK comments
- Exception swallowed silently
- Missing error handling on critical paths
- Race conditions (no locking where needed)

For each extracted invariant, create entry with status `inferred`:

```markdown
## I1: [name]
STATEMENT: what the system appears to guarantee
STATUS: inferred
CONFIDENCE: high / medium / low
SOURCE: code-analysis
EVIDENCE: [file:line that shows this]
NEEDS_REVIEW: true
```

## Phase 3: Decision Archaeology

Look for evidence of past architectural decisions:

**Where to look:**
- Git history and commit messages
- PR descriptions (if accessible)
- Comments explaining "why" not "what"
- Unusual patterns that suggest a workaround
- Dependencies that seem overengineered for the task

For each discovered decision:

```markdown
## ADR-XXX: [inferred decision name]
STATUS: inferred
CONFIDENCE: high / medium / low
EVIDENCE: [what in code suggests this]
UNKNOWN: [what context is lost]
NEEDS_REVIEW: true
```

## Phase 4: Gap Analysis

What can't be reconstructed from code alone?

```markdown
# Gaps

## UNKNOWN: [topic]
QUESTION: what we can't determine from code
WHY_MATTERS: impact on future development
HOW_TO_RESOLVE: ask developer / check git history / accept unknown
```

Present gaps to developer and ask them to fill what they remember.

## Phase 5: Produce Artifacts

Save to `.devkit/arch/`:
- `invariants.md` — all inferred invariants (status: inferred, needs_review: true)
- `decisions/ADR-*.md` — all inferred decisions
- `impact.md` — dependency map extracted from imports/calls

## Status File

Create `.devkit/STATUS.md`:

```markdown
# DevKit Status

MODE: brownfield
INITIALIZED: [date]
CURRENT_PHASE: arch-review

## Reconstruction Summary
INVARIANTS_INFERRED: N
DECISIONS_INFERRED: M  
GAPS: K (see arch/gaps.md)

## Required Actions Before Development
- [ ] Review and confirm invariants.md
- [ ] Fill gaps in arch/gaps.md
- [ ] Run /arch-kit to verify and fill missing decisions

## Phase Status
- [~] ResearchKit (skipped — existing project)
- [~] ProductKit (partially reconstructed)
- [ ] ArchKit (review required)
- [ ] SpecKit
- [ ] QAKit
```

## Message to Developer

```
DevKit initialized in brownfield mode.

Reconstructed from your codebase:
  Invariants: N (all marked as 'inferred', need your review)
  Decisions:  M (inferred from code patterns)
  Gaps:       K unknowns that couldn't be reconstructed

Next steps:
1. Review .devkit/arch/invariants.md — confirm or correct each one
2. Check .devkit/arch/gaps.md — fill what you remember
3. Run /arch-kit to verify architecture and fill remaining gaps

Important: 'inferred' invariants are AI's best guess from code.
They may be wrong. Please review before trusting them.
```
