9. **DevKit Invariant Check** — after all clarifications are integrated:

   a. **Check if clarifications touch invariants**: If any clarification answer modifies or constrains behavior related to project invariants (from `.devkit/arch/invariants.md` or `.devkit/product/ux_invariants.md`), flag it:

      ```
      ⚠️ Clarification Q[N] touches invariant [ID]: [invariant name]
      Consider: devkit rfc "<description of the change>"
      ```

   b. **Run validation** to ensure spec still aligns with DevKit artifacts:
      ```bash
      devkit validate
      ```

   c. Include invariant impact in the completion report if any invariants were touched.
