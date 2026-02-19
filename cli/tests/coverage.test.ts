import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { analyzeCoverage } from '../src/coverage.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-coverage');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'product'), { recursive: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'arch'), { recursive: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'qa'), { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('analyzeCoverage', () => {
    it('returns empty with no invariants', () => {
        const result = analyzeCoverage(TEST_DIR);
        expect(result.totalInvariants).toBe(0);
        expect(result.percentage).toBe(0);
    });

    it('detects uncovered UX invariants', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'product', 'ux_invariants.md'), `# UX
## U1: Zero-config
STATEMENT: Works without config
PRIORITY: must

## U2: Fast
STATEMENT: Fast startup
PRIORITY: must
`);

        const result = analyzeCoverage(TEST_DIR);
        expect(result.totalInvariants).toBe(2);
        expect(result.uncovered).toBe(2);
        expect(result.percentage).toBe(0);
    });

    it('detects covered invariants via test_contracts', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'product', 'ux_invariants.md'), `# UX
## U1: Zero-config
STATEMENT: Works without config
PRIORITY: must
`);

        writeFileSync(join(TEST_DIR, '.devkit', 'qa', 'test_contracts.md'), `# Test Contracts
## TC-U1: Zero-config test
Verifies U1 works without any configuration.
`);

        writeFileSync(join(TEST_DIR, '.devkit', 'qa', 'coverage_map.md'), `# Coverage
U1 is covered by TC-U1
`);

        const result = analyzeCoverage(TEST_DIR);
        expect(result.totalInvariants).toBe(1);
        expect(result.covered).toBe(1);
        expect(result.percentage).toBe(100);
    });
});
