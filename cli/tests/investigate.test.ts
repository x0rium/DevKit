import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createInvestigation, listInvestigations, resolveInvestigation } from '../src/investigate.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-investigate');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'arch', 'decisions'), { recursive: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'product'), { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('createInvestigation', () => {
    it('creates INV-001', () => {
        const result = createInvestigation(TEST_DIR, 'SQLite performance degrades under load');
        expect(result.created).toBe(true);
        expect(result.id).toBe('INV-001');
        expect(existsSync(join(TEST_DIR, '.devkit', 'arch', 'decisions', 'INV-001.md'))).toBe(true);
    });

    it('auto-links broken ADR assumption', () => {
        // Create ADR with assumption about SQLite
        writeFileSync(join(TEST_DIR, '.devkit', 'arch', 'decisions', 'ADR-001.md'), `# ADR-001: Use SQLite

## Context
Need local storage.

## Decision
Use SQLite.

## Assumptions
SQLite handles concurrent writes well for our scale.
Performance will be sufficient for up to 10k records.
`);

        const result = createInvestigation(TEST_DIR, 'SQLite performance is too slow');
        expect(result.adrSource).toBe('ADR-001');
        expect(result.brokenAssumption).toContain('SQLite');
    });

    it('finds invariants at risk', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'product', 'ux_invariants.md'), `# UX

## U2: Fast status
STATEMENT: devkit status returns in under 2 seconds
PRIORITY: must
`);

        const result = createInvestigation(TEST_DIR, 'status command takes too long');
        expect(result.invariantsAtRisk.length).toBeGreaterThan(0);
    });
});

describe('resolveInvestigation', () => {
    it('resolves open investigation', () => {
        createInvestigation(TEST_DIR, 'Test issue');
        const result = resolveInvestigation(TEST_DIR, 'INV-001', 'Optimize queries', 'Quick win');
        expect(result.resolved).toBe(true);
    });
});
