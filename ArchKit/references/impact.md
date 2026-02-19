# Impact Map Template

## [Component or Decision Name]
DEPENDS_ON: [list of components/decisions it depends on]
DEPENDED_BY: [list of components/decisions that depend on it]
INVARIANTS: [invariants from invariants.md this touches]
SPECS: [spec files that implement this]

## How to Use
When RFC or Investigation opens, query this map:
"What depends on [changed thing]?" → everything in DEPENDED_BY
"What does [changed thing] depend on?" → everything in DEPENDS_ON
This gives the full blast radius before any decision is made.
