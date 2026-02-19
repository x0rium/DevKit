# Impact Map

Dependency map between components and invariants.
Used for impact analysis during RFC and Investigation.

## scaffold (init)
DEPENDS_ON: [detector, status]
DEPENDED_BY: [gate, advance]
INVARIANTS: [I1, I8]

## status
DEPENDS_ON: []
DEPENDED_BY: [dashboard, gate, advance, scaffold]
INVARIANTS: [I3]

## gate
DEPENDS_ON: [status, validator]
DEPENDED_BY: [advance]
INVARIANTS: [I4]

## advance
DEPENDS_ON: [status, gate]
DEPENDED_BY: []
INVARIANTS: [I3]

## validator
DEPENDS_ON: [schemas]
DEPENDED_BY: [gate, watch, dashboard]
INVARIANTS: [I4]

## rfc
DEPENDS_ON: [impact]
DEPENDED_BY: [dashboard, constitution]
INVARIANTS: [I2, I7]

## investigate
DEPENDS_ON: []
DEPENDED_BY: [dashboard, constitution]
INVARIANTS: [I2, I7]

## escalate
DEPENDS_ON: []
DEPENDED_BY: [dashboard]
INVARIANTS: [I2]

## diff / snapshot
DEPENDS_ON: []
DEPENDED_BY: []
INVARIANTS: [I5]

## coverage
DEPENDS_ON: []
DEPENDED_BY: [dashboard]
INVARIANTS: [I6]

## detector
DEPENDS_ON: []
DEPENDED_BY: [scaffold]
INVARIANTS: [I8]

## constitution
DEPENDS_ON: [rfc, investigate]
DEPENDED_BY: [sync]
INVARIANTS: []

## dashboard
DEPENDS_ON: [status, validator, coverage, rfc, investigate, escalate]
DEPENDED_BY: []
INVARIANTS: []
