import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { generateConstitution, syncConstitution } from '../src/constitution.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-constitution');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'arch', 'decisions'), { recursive: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'product'), { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('generateConstitution', () => {
    it('fails when no invariants exist', () => {
        const result = generateConstitution(TEST_DIR);
        expect(result.generated).toBe(false);
        expect(result.error).toContain('No invariants found');
    });

    it('generates from UX invariants only', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'product', 'ux_invariants.md'), `# UX Invariants

## U1: Fast start
STATEMENT: App starts in under 2 seconds
PRIORITY: must
STATUS: active
`);

        const result = generateConstitution(TEST_DIR);
        expect(result.generated).toBe(true);
        expect(result.uxInvariantsCount).toBe(1);

        const content = readFileSync(result.outputPath, 'utf-8');
        expect(content).toContain('UX Invariants');
        expect(content).toContain('App starts in under 2 seconds');
        expect(content).toContain('[must]');
    });

    it('includes technical invariants', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'arch', 'invariants.md'), `# Technical Invariants

## I1: Data consistency
STATEMENT: No data loss on crash
FAILURE_MODE: Automatic recovery from WAL
STATUS: verified
`);

        const result = generateConstitution(TEST_DIR);
        expect(result.generated).toBe(true);
        expect(result.invariantsCount).toBe(1);

        const content = readFileSync(result.outputPath, 'utf-8');
        expect(content).toContain('Technical Invariants');
        expect(content).toContain('No data loss on crash');
        expect(content).toContain('Automatic recovery from WAL');
    });

    it('includes ADR decisions', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'product', 'ux_invariants.md'), '# UX\n\n## U1: x\nSTATEMENT: y\n');
        writeFileSync(join(TEST_DIR, '.devkit', 'arch', 'decisions', 'ADR-001.md'), `# ADR-001: Use SQLite

DECISION: Use SQLite for local storage
RATIONALE: Simplest option for single-user CLI tool
`);

        const result = generateConstitution(TEST_DIR);
        expect(result.decisionsCount).toBe(1);

        const content = readFileSync(result.outputPath, 'utf-8');
        expect(content).toContain('Architecture Decisions');
        expect(content).toContain('Use SQLite');
    });
});

describe('syncConstitution', () => {
    it('fails when constitution does not exist', () => {
        const result = syncConstitution(TEST_DIR);
        expect(result.synced).toBe(false);
    });

    it('creates .specify/ and copies constitution', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'arch', 'constitution.md'), '# Constitution\nContent here\n');

        const result = syncConstitution(TEST_DIR);
        expect(result.synced).toBe(true);
        expect(existsSync(join(TEST_DIR, '.specify', 'constitution.md'))).toBe(true);

        const content = readFileSync(join(TEST_DIR, '.specify', 'constitution.md'), 'utf-8');
        expect(content).toContain('Constitution');
    });
});
