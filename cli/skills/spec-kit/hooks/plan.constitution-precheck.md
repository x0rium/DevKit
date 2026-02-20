**DevKit Pre-Planning Validation**:

Before starting the planning workflow, run:
```bash
devkit validate
```
If validation fails with errors, resolve them before proceeding. Cross-reference the plan against invariants I1-I8 (technical) and U1-U6 (UX) from `.devkit/arch/invariants.md` and `.devkit/product/ux_invariants.md`. Any architectural decision in the plan that conflicts with an invariant must be justified or trigger `devkit rfc`.
