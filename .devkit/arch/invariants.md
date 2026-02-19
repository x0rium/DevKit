# Technical Invariants

## I1: Init is idempotent
STATEMENT: `devkit init` on an already-initialized directory is a no-op. It never overwrites existing files or directories — only creates missing ones and reports skipped.
RATIONALE: Idempotency eliminates fear of accidental data loss. Users can safely re-run init without consequences.
VERIFICATION: Run `devkit init` twice on the same directory. Second run shows only "Skipped" entries. File contents unchanged (compare SHA-256 before/after).
FAILURE_MODE: If `existsSync` guard is removed, re-running init resets STATUS.md to `CURRENT_PHASE: research`, losing all phase progress.
STATUS: verified

## I2: Sequential IDs are strictly monotonic
STATEMENT: RFC, INV, and ESC identifiers are assigned by incrementing the highest existing numeric suffix. Deleting a file does not reclaim its number. IDs never collide under single-process usage.
RATIONALE: Monotonic IDs ensure git history references remain stable. Two different decisions never share the same identifier.
VERIFICATION: Create RFC-001, delete it, create new RFC. Verify new ID is RFC-002 not RFC-001. Repeat for INV and ESC prefixes.
FAILURE_MODE: All three (RFC/INV/ESC) now use max-scan. No file locking — concurrent processes can still collide (acceptable for single-user CLI).
STATUS: verified

## I3: Phase ordering is a strict linear sequence
STATEMENT: The system enforces a fixed five-phase pipeline: research -> product -> arch -> spec -> qa. Advance moves exactly one step. There is no skip and no retreat command.
RATIONALE: Linear phases enforce discipline. Each level's artifacts are inputs for the next. Skipping creates gaps.
VERIFICATION: Set CURRENT_PHASE to qa, run `devkit advance`. Confirm "Already at final phase" error. Verify no retreat/rollback command exists in CLI.
FAILURE_MODE: Manually editing STATUS.md to an unknown phase now falls back to `research` (validated in getStatus). Gate checker failures are caught with try/catch.
STATUS: verified

## I4: Gate blocks on any single unsatisfied condition
STATEMENT: Phase advancement is blocked if ANY gate condition is unsatisfied. Empty conditions array also blocks (safe-fail default via `length > 0 && every()`).
RATIONALE: One unresolved blocker can invalidate an entire phase. All-or-nothing prevents partial transitions.
VERIFICATION: Leave one required file missing (e.g. delete feasibility.md in research phase). Run `devkit gate`. Confirm BLOCKED even if all other conditions pass.
FAILURE_MODE: Gate checker exceptions are now caught — returns `satisfied: false` with error detail instead of crashing.
STATUS: verified

## I5: Snapshot diff is content-hash based (SHA-256)
STATEMENT: File modification detection uses truncated SHA-256 content hashes (12 hex chars), not filesystem timestamps. Identical content at different times = no diff. Changed content at same second = detected.
RATIONALE: Content-based detection is deterministic and reproducible across machines, unlike mtime which varies by filesystem and OS.
VERIFICATION: Save snapshot. `touch` a .md file without changing content. Run `devkit diff`. File must NOT appear as modified. Change one byte — file MUST appear as modified.
FAILURE_MODE: 12-char hash prefix has ~2^48 collision space — negligible in practice. Only .md files are tracked; non-markdown artifacts are invisible to diff.
STATUS: verified

## I6: Coverage threshold is exactly 2 sources
STATEMENT: An invariant is "covered" when mentioned in >=2 distinct sources (test files + contract docs). 1 source = partial. 0 = uncovered. Partial does NOT count toward coverage percentage.
RATIONALE: Two independent sources (contract definition + actual test) provide cross-validation. A single mention could be aspirational.
VERIFICATION: Create invariant referenced in exactly one file. Run `devkit coverage`. Status must be `partial`, percentage unchanged. Add second reference — status becomes `covered`.
FAILURE_MODE: Keyword matching can false-positive on common words. Invariant "I1: Data Integrity" matches any file containing "data" or "integrity" as substring.
STATUS: verified

## I7: Resolution mutates files in-place without backup
STATEMENT: `resolveRfc` and `resolveInvestigation` rewrite artifact files via line-prefix replacement with direct `writeFileSync`. No backup, no atomic rename, no intermediate file.
RATIONALE: Simplicity — artifacts are in git, so git history serves as the backup mechanism.
VERIFICATION: Resolve an RFC. Check git diff to confirm only expected lines changed. Verify no .bak or .tmp files created.
FAILURE_MODE: Process kill between read and write corrupts the file (empty or partial). A `STATUS:` field in freeform text will be incorrectly rewritten by the prefix matcher.
STATUS: assumed

## I8: Project state detection is deterministic
STATEMENT: `detectProjectState` returns one of four mutually exclusive states in strict priority: initialized > upgrade > brownfield > greenfield. Same filesystem state always produces same result.
RATIONALE: Deterministic detection means init behavior is predictable and testable. No ambient state or config affects the result.
VERIFICATION: Create .devkit/ — result must be `initialized`. Remove it, create .specify/ — `upgrade`. Remove it, add .ts file — `brownfield`. Empty dir — `greenfield`.
FAILURE_MODE: `hasCodeFiles` now has MAX_SCAN_DEPTH=5. Permission errors are silently swallowed (by design — non-readable dirs are skipped).
STATUS: verified
