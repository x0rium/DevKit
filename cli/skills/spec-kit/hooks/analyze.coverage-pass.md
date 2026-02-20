#### G. DevKit Invariant Coverage

- Run `devkit coverage` and capture the output
- For each invariant (technical I1-I8, UX U1-U6):
  - Check if the invariant has at least one test covering it
  - Flag uncovered invariants as findings with severity based on invariant type:
    - Technical invariant uncovered → HIGH
    - UX invariant uncovered → MEDIUM
- Add to Coverage Summary Table:
  - Row per invariant: ID, Name, Covered (yes/no), Test IDs
- Add "DevKit Invariant Coverage" section to the analysis report with:
  - Coverage percentage
  - Uncovered invariants list
  - Recommendation: `devkit coverage` for detailed map
