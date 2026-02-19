import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { validateArtifacts } from '../src/validator.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-validator');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'research'), { recursive: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'product'), { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('validateArtifacts', () => {
    it('reports no errors for .devkit/ not found', () => {
        rmSync(TEST_DIR, { recursive: true, force: true });
        mkdirSync(TEST_DIR, { recursive: true });

        const result = validateArtifacts(TEST_DIR);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0]!.fix).toContain('devkit init');
    });

    it('validates valid market.md without errors', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'research', 'market.md'), `# Market Research

## Analogues
| Tool | What |
|------|------|

## Unoccupied Space
Something new

## Potential User
PROFILE: developer
`);

        const result = validateArtifacts(TEST_DIR);
        expect(result.errors.length).toBe(0);
        expect(result.filesValid).toBe(1);
    });

    it('detects missing required sections', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'research', 'market.md'), `# Market Research

## Analogues
| Tool | What |
|------|------|
`);

        const result = validateArtifacts(TEST_DIR);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(e => e.message.includes('Unoccupied Space'))).toBe(true);
    });

    it('detects missing structured fields in unknowns', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'research', 'unknowns.md'), `# Unknowns

## Unknown: Something we dont know
DESCRIPTION: what we dont know
RISK: high
`);
        // Missing: VALIDATION, BLOCKER, STATUS

        const result = validateArtifacts(TEST_DIR);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(e => e.field === 'VALIDATION')).toBe(true);
        expect(result.errors.some(e => e.field === 'BLOCKER')).toBe(true);
        expect(result.errors.some(e => e.field === 'STATUS')).toBe(true);
    });

    it('provides actionable fix messages', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'research', 'feasibility.md'), `# Feasibility

## Known Approaches
something
`);

        const result = validateArtifacts(TEST_DIR);
        for (const err of result.errors) {
            expect(err.fix).toBeTruthy();
            expect(err.fix.length).toBeGreaterThan(10);
        }
    });
});
