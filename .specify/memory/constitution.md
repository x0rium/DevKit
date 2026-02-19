# Project Constitution

> Transformed from DevKit invariants. Regenerate with: `devkit generate-constitution && devkit sync`

## Core Principles

### I1: Init is idempotent
The system MUST: `devkit init` on an already-initialized directory is a no-op. It never overwrites existing files or directories — only creates missing ones and reports skipped.

### I2: Sequential IDs are strictly monotonic
The system MUST: RFC, INV, and ESC identifiers are assigned by incrementing the highest existing numeric suffix. Deleting a file does not reclaim its number. IDs never collide under single-process usage.

### I3: Phase ordering is a strict linear sequence
The system enforces a fixed five-phase pipeline: research -> product -> arch -> spec -> qa. Advance moves exactly one step. There is no skip and no retreat command.

### I4: Gate blocks on any single unsatisfied condition
The system MUST: Phase advancement is blocked if ANY gate condition is unsatisfied. Empty conditions array also blocks (safe-fail default via `length > 0 && every()`).

### I5: Snapshot diff is content-hash based (SHA-256)
The system MUST: File modification detection uses truncated SHA-256 content hashes (12 hex chars), not filesystem timestamps. Identical content at different times = no diff. Changed content at same second = detected.

### I6: Coverage threshold is exactly 2 sources
The system MUST: An invariant is "covered" when mentioned in >=2 distinct sources (test files + contract docs). 1 source = partial. 0 = uncovered. Partial does NOT count toward coverage percentage.

### I7: Resolution mutates files in-place without backup
The system MUST: `resolveRfc` and `resolveInvestigation` rewrite artifact files via line-prefix replacement with direct `writeFileSync`. No backup, no atomic rename, no intermediate file.

### I8: Project state detection is deterministic
The system MUST: `detectProjectState` returns one of four mutually exclusive states in strict priority: initialized > upgrade > brownfield > greenfield. Same filesystem state always produces same result.

### U1: Zero-config start [must]
The system MUST: `npx devkit init` создаёт рабочий .devkit/ без конфигурации. Автодетект состояния проекта (greenfield/brownfield/upgrade).

### U2: Status at a glance [must]
The system MUST: `devkit status` показывает текущую фазу, прогресс, blocker'ы и следующий шаг за ≤2 секунды.

### U3: Artifact validation with actionable errors [must]
The system MUST: `devkit validate` проверяет все артефакты и для каждой ошибки говорит что исправить и где.

### U4: Non-invasive integration [must]
The system MUST: DevKit CLI не ломает существующий workflow. Все команды идемпотентны. Можно остановиться в любой момент.

### U5: Progressive disclosure [should]
The system MUST: CLI показывает только релевантную информацию для текущей фазы. ResearchKit команды недоступны когда текущая фаза — SpecKit (если не эскалация).

### U6: Offline-first [should]
The system MUST: Все core команды (init, status, validate, generate-constitution) работают без интернета.

## Governance

- Any deviation from principles above requires an RFC through ArchKit (`devkit rfc`)
- New requirements touching invariants must go through impact analysis (`devkit impact`)
- Test contracts in QAKit map 1:1 to principles — every principle must be testable
- This constitution is regenerated when invariants or decisions change — do not edit manually

**Version**: 1.0.0 | **Ratified**: 2026-02-19 | **Last Amended**: 2026-02-19
