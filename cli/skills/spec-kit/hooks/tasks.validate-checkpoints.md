6. **DevKit Validation Checkpoints** — add validation tasks between phases:

   After generating the task list, insert `devkit validate` checkpoint tasks at phase boundaries:

   - After Setup phase: `- [ ] [T0XX] Run devkit validate to verify project state`
   - After Foundational phase: `- [ ] [T0XX] Run devkit validate to verify foundational integrity`
   - Before Final Phase: `- [ ] [T0XX] Run devkit coverage to check invariant test coverage`

   These checkpoints ensure that DevKit invariants remain satisfied throughout implementation. Assign sequential task IDs that fit within the existing numbering scheme.

   Also include in the report:
   - Number of DevKit validation checkpoints added
   - Reminder: `devkit coverage` shows invariant ↔ test coverage map
