# Greenfield Mode

Fresh project. No code, no .devkit/, no .specify/.

## What to Do

1. Create .devkit/ structure (done by SKILL.md)
2. Run `specify init . --ai claude` (done by SKILL.md)
3. Tell developer to start with ResearchKit

## Starting Message to Developer

```
DevKit initialized for a new project.

Your development cycle:
  /research-kit  → explore feasibility and unknowns
  /product-kit   → define users and UX invariants  
  /arch-kit      → verify architecture
  /spec-kit      → implement (via spec-kit workflow)
  /qa-kit        → verify against all decisions

Start with /research-kit — describe your idea.
```

## Files to Create

Create `.devkit/STATUS.md`:

```markdown
# DevKit Status

MODE: greenfield
INITIALIZED: [date]
CURRENT_PHASE: research
SPEC_KIT: initialized

## Phase Status
- [ ] ResearchKit
- [ ] ProductKit  
- [ ] ArchKit
- [ ] SpecKit
- [ ] QAKit
```
