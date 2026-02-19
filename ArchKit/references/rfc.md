# RFC Template — Request for Change

## RFC-XXX: [title]
DATE:
STATUS: open / accepted / rejected / deferred
TRIGGERED_BY: [what new requirement or information caused this]

## Affected Invariants
[List invariants from invariants.md that this touches]

## Affected Specs
[List specs from .specify/ that need revision]

## Change Cost
SPECS_TO_REVISE: N
INVARIANTS_TO_CHANGE: M
ESTIMATED_EFFORT: [rough estimate]

## Options
### Option A: [name]
Description, pros, cons

### Option B: [name]
Description, pros, cons

## Decision
CHOSEN: [option]
RATIONALE: [why]
DECIDED_BY: developer
DATE_DECIDED:

## Post-Decision Actions
- [ ] Update invariants.md
- [ ] Regenerate constitution (`devkit generate-constitution`)
- [ ] Sync constitution (`devkit sync`)
- [ ] Mark affected specs as NEEDS_REVISION
- [ ] Resume SpecKit
