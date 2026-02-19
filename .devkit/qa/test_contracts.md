# Test Contracts

## UX Invariant Contracts

## TC-U1: Zero-config start
INVARIANT: U1 from ux_invariants.md
WHAT: project initializes without manual configuration
HOW: scaffold.test.ts, detector.test.ts — init in empty, code, .specify/ dirs
VIOLATION: init requires any config file or user input before creating .devkit/
CRITICALITY: blocker

## TC-U2: Status at a glance
INVARIANT: U2 from ux_invariants.md
WHAT: user sees current phase, progress, and next step
HOW: advance.test.ts, gate.test.ts, disclosure.test.ts — status output structure
VIOLATION: status command missing phase, progress, or next step
CRITICALITY: blocker

## TC-U3: Artifact validation with actionable errors
INVARIANT: U3 from ux_invariants.md
WHAT: errors include file path, line number, message, and fix suggestion
HOW: validator.test.ts — validation errors contain all four fields
VIOLATION: error message missing file, line, or fix suggestion
CRITICALITY: blocker

## TC-U4: Non-invasive integration
INVARIANT: U4 from ux_invariants.md
WHAT: init does not modify existing project files, only creates .devkit/
HOW: noninvasive.test.ts — existing files unchanged after init
VIOLATION: any existing file modified or deleted by init
CRITICALITY: blocker

## TC-U5: Progressive disclosure
INVARIANT: U5 from ux_invariants.md
WHAT: status shows phase-appropriate commands only
HOW: disclosure.test.ts — different phases show different command sets
VIOLATION: showing all commands regardless of phase
CRITICALITY: major

## TC-U6: Offline-first
INVARIANT: U6 from ux_invariants.md
WHAT: all core commands work without network access
HOW: all tests run without network — no HTTP calls in any source file
VIOLATION: any core command making a network request
CRITICALITY: major

## Technical Invariant Contracts

## TC-I1: Init idempotency
INVARIANT: I1 from invariants.md
WHAT: second init run does not overwrite existing files
HOW: scaffold.test.ts — re-init shows only skipped entries; noninvasive.test.ts — content unchanged
VIOLATION: any file overwritten on second init
CRITICALITY: blocker

## TC-I2: Monotonic ID generation
INVARIANT: I2 from invariants.md
WHAT: RFC/INV/ESC IDs always increment, never reuse after deletion
HOW: rfc.test.ts, investigate.test.ts, escalate.test.ts — ID sequences after create/delete cycles
VIOLATION: ID collision or reuse of a previously deleted ID
CRITICALITY: major

## TC-I3: Linear phase sequence
INVARIANT: I3 from invariants.md
WHAT: advance moves exactly one step forward, no skip, no retreat
HOW: advance.test.ts — advancing from each phase; gate.test.ts — phase order validation
VIOLATION: skipping a phase or moving backwards
CRITICALITY: blocker

## TC-I4: Gate all-or-nothing
INVARIANT: I4 from invariants.md
WHAT: single unsatisfied condition blocks phase transition
HOW: gate.test.ts — one missing file blocks even when all other conditions pass
VIOLATION: gate passes with any condition unsatisfied
CRITICALITY: blocker

## TC-I5: Content-hash based diff
INVARIANT: I5 from invariants.md
WHAT: snapshot diff detects content changes, ignores timestamp-only changes
HOW: needs diff.test.ts (currently uncovered)
VIOLATION: reporting unchanged file as modified, or missing actual modification
CRITICALITY: major

## TC-I6: Coverage threshold = 2
INVARIANT: I6 from invariants.md
WHAT: invariant needs >=2 source mentions for "covered" status
HOW: coverage.test.ts — threshold logic verification
VIOLATION: single mention counted as covered
CRITICALITY: minor

## TC-I7: In-place file mutation
INVARIANT: I7 from invariants.md
WHAT: resolve-rfc and resolve-inv rewrite files via line-prefix replacement
HOW: rfc.test.ts, investigate.test.ts — resolve changes only expected lines
VIOLATION: unrelated lines modified, or file corrupted
CRITICALITY: major

## TC-I8: Deterministic state detection
INVARIANT: I8 from invariants.md
WHAT: same filesystem state always produces same detection result
HOW: detector.test.ts, scaffold.test.ts — deterministic across repeated calls
VIOLATION: non-deterministic or ambient-state-dependent result
CRITICALITY: blocker
