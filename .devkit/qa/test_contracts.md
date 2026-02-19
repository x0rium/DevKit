# Test Contracts

## TC-U1: Zero-config start
U1 is verified by scaffold and detector tests — project initializes without manual configuration.

## TC-U2: Status at a glance
U2 is verified by status, advance, and gate tests — user sees current phase and progress.

## TC-U3: Artifact validation with actionable errors
U3 is verified by validator tests — errors include file path, line, message, and fix suggestion.

## TC-U4: Non-invasive integration
U4 is verified by noninvasive.test.ts — init does not modify existing project files, only creates .devkit/.

## TC-U5: Progressive disclosure
U5 is verified by disclosure.test.ts — status shows phase-appropriate commands, different phases show different info.

## TC-U6: Offline-first
U6 is verified by all core tests — no network calls, all operations are local filesystem only.
