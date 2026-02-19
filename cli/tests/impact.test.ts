import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { analyzeImpact } from '../src/impact.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-impact');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'arch'), { recursive: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'product'), { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('analyzeImpact', () => {
    it('returns low risk when no invariants match', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'product', 'ux_invariants.md'), `# UX

## U1: Fast start
STATEMENT: App starts quickly
PRIORITY: must
`);

        const result = analyzeImpact(TEST_DIR, 'change database driver');
        expect(result.riskLevel).toBe('low');
    });

    it('detects affected invariants by keyword match', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'product', 'ux_invariants.md'), `# UX

## U1: Zero config start
STATEMENT: npx devkit init creates .devkit without config
PRIORITY: must

## U2: Offline mode
STATEMENT: All commands work offline without network
PRIORITY: should
`);

        const result = analyzeImpact(TEST_DIR, 'add required config file');
        expect(result.affectedInvariants.length).toBeGreaterThan(0);
        expect(result.riskLevel).not.toBe('low');
    });

    it('returns high risk for many affected invariants', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'product', 'ux_invariants.md'), `# UX

## U1: Validation errors
STATEMENT: validate shows errors with file path
PRIORITY: must

## U2: Status display
STATEMENT: status shows phase and errors
PRIORITY: must

## U3: Error handling
STATEMENT: errors always show what happened
PRIORITY: must
`);

        const result = analyzeImpact(TEST_DIR, 'change error handling display format');
        expect(result.affectedInvariants.length).toBeGreaterThanOrEqual(3);
        expect(result.riskLevel).toBe('high');
    });
});
