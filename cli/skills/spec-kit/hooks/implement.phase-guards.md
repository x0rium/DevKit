10. **DevKit Phase Guards** — integrate DevKit checks into implementation:

   a. **Before architecture-impacting tasks**: Run impact analysis:
      ```bash
      devkit impact "<task description>"
      ```
      If risk is HIGH, pause and suggest `devkit rfc` before proceeding.

   b. **After completing each phase**: Run validation:
      ```bash
      devkit validate
      ```
      If validation fails, halt phase progression and report the issues.

   c. **On implementation failure**: If a task fails in a way that suggests a broken assumption:
      ```bash
      devkit investigate "<description of the failure and broken assumption>"
      ```
      This creates an Investigation record linking back to relevant ADRs.

   d. **After final phase**: Run full coverage check:
      ```bash
      devkit coverage
      ```
      Include coverage summary in the implementation completion report.
