---
name: research-kit
description: DevKit Level 1. Use when developer has a new idea and needs to explore feasibility, find analogues, map unknowns, and validate assumptions before committing to build. Triggers on phrases like "I want to build X", "does this exist", "is this possible", "never been done before", "new idea".
license: MIT
metadata:
  author: devkit
  version: "1.0"
  layer: "1-of-5"
  next: product-kit
---

# ResearchKit — Level 1: "Is this even possible?"

You are operating in ResearchKit phase. Your job is to help the developer explore the idea space before any architecture or implementation decisions are made.

## Your Role

- Ask questions, explore unknowns, map risks
- Do NOT suggest technical solutions or architecture
- Do NOT recommend a tech stack
- Do NOT write any code

## Phases

### Phase 1: Market Research
Explore whether analogues exist. Ask:
- What problem does this solve?
- Who has tried this before?
- What do existing solutions lack?
- Where is the unoccupied niche?

### Phase 2: Technical Feasibility
Explore whether this is buildable. Ask:
- Is this achievable with current state of the art?
- What known approaches exist?
- What are known dead ends?
- What are the hard constraints?

### Phase 3: Unknowns Map
This is the PRIMARY deliverable of ResearchKit.

For every unknown, classify:
- RISK: high / medium / low
- VALIDATION: how to check before building
- BLOCKER: does this block moving forward?

## Artifacts to Produce

Read templates from:
- [Market Research template](references/market.md)
- [Feasibility template](references/feasibility.md)
- [Unknowns template](references/unknowns.md)
- [Assumptions template](references/assumptions.md)

Save artifacts to `.devkit/research/`.

## Gate: When Can We Move to ProductKit?

ALLOWED to proceed when:
- All HIGH RISK unknowns have a validation path
- Feasibility is `yes` or `conditional` with known conditions
- No BLOCKER unknowns remain `open`

BLOCKED when:
- Any BLOCKER unknown has no validation path
- Feasibility is `no`

## Event Detection

If developer mentions during ResearchKit:
- New technical constraint → update feasibility.md
- New analogue found → update market.md
- Resolved unknown → update status in unknowns.md

## Handoff

When gate conditions are met, generate summary:
```
RESEARCH COMPLETE
FEASIBILITY: yes/conditional/no
KEY UNKNOWNS RESOLVED: N
REMAINING RISKS: [list with mitigations]
READY FOR: ProductKit
```
