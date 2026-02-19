# Coverage Map

## UX Invariants Coverage
| Invariant | Contract | Status | Method |
|-----------|----------|--------|--------|
| U1        | TC-U1    | covered | unit   |
| U2        | TC-U2    | covered | unit   |
| U3        | TC-U3    | covered | unit   |
| U4        | TC-U4    | covered | unit   |
| U5        | TC-U5    | covered | unit   |
| U6        | TC-U6    | covered | unit   |

## Technical Invariants Coverage
| Invariant | Contract | Status | Method |
|-----------|----------|--------|--------|
| I1: Init is idempotent        | TC-I1 | covered | scaffold.test.ts, noninvasive.test.ts |
| I2: Sequential IDs monotonic  | TC-I2 | covered | rfc.test.ts, investigate.test.ts, escalate.test.ts |
| I3: Phase ordering linear     | TC-I3 | covered | advance.test.ts, gate.test.ts |
| I4: Gate blocks on any fail   | TC-I4 | covered | gate.test.ts |
| I5: Snapshot hash-based diff  | TC-I5 | covered | diff.test.ts |
| I6: Coverage threshold = 2    | TC-I6 | covered | coverage.test.ts |
| I7: In-place mutation no backup | TC-I7 | covered | rfc.test.ts, investigate.test.ts |
| I8: Deterministic state detect | TC-I8 | covered | detector.test.ts, scaffold.test.ts |

## Assumptions Validation

See assumption_checks.md.

## Uncovered (technical debt)

_None — all invariants covered._
