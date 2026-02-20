**DevKit Post-Planning Validation**:

After plan generation is complete:

1. **Run validation**:
   ```bash
   devkit validate
   ```

2. **Run impact analysis** on the plan:
   ```bash
   devkit impact "<feature name>: plan generated with tech stack <key technologies>"
   ```

3. If risk is HIGH, recommend running `devkit rfc` before proceeding to task generation.

4. Include DevKit validation status and impact risk level in the plan completion report.
