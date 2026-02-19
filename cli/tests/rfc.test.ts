import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRfc, listRfcs, resolveRfc } from '../src/rfc.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-rfc');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'arch', 'decisions'), { recursive: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'product'), { recursive: true });

    // Create UX invariants for impact analysis
    writeFileSync(join(TEST_DIR, '.devkit', 'product', 'ux_invariants.md'), `# UX Invariants

## U1: Zero config
STATEMENT: Works without configuration
PRIORITY: must

## U2: Validation errors
STATEMENT: Validate shows actionable errors with file path
PRIORITY: must
`);
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('createRfc', () => {
    it('creates RFC-001 with auto impact analysis', () => {
        const result = createRfc(TEST_DIR, 'Add validation for YAML frontmatter');
        expect(result.created).toBe(true);
        expect(result.id).toBe('RFC-001');
        expect(result.affectedInvariants.length).toBeGreaterThan(0);

        // Verify file was created
        expect(existsSync(join(TEST_DIR, '.devkit', 'arch', 'decisions', 'RFC-001.md'))).toBe(true);

        // Verify content
        const content = readFileSync(join(TEST_DIR, '.devkit', 'arch', 'decisions', 'RFC-001.md'), 'utf-8');
        expect(content).toContain('STATUS: open');
        expect(content).toContain('## Options');
        expect(content).toContain('## Post-Decision Actions');
    });

    it('increments RFC IDs', () => {
        createRfc(TEST_DIR, 'First RFC');
        const second = createRfc(TEST_DIR, 'Second RFC');
        expect(second.id).toBe('RFC-002');
    });
});

describe('listRfcs', () => {
    it('returns empty for no RFCs', () => {
        expect(listRfcs(TEST_DIR)).toEqual([]);
    });

    it('lists created RFCs', () => {
        createRfc(TEST_DIR, 'Test RFC');
        const rfcs = listRfcs(TEST_DIR);
        expect(rfcs.length).toBe(1);
        expect(rfcs[0]!.status).toBe('open');
    });
});

describe('resolveRfc', () => {
    it('resolves open RFC', () => {
        createRfc(TEST_DIR, 'Resolvable RFC');
        const result = resolveRfc(TEST_DIR, 'RFC-001', 'Option A', 'Best approach');
        expect(result.resolved).toBe(true);

        const content = readFileSync(join(TEST_DIR, '.devkit', 'arch', 'decisions', 'RFC-001.md'), 'utf-8');
        expect(content).toContain('STATUS: accepted');
        expect(content).toContain('CHOSEN: Option A');
        expect(content).toContain('RATIONALE: Best approach');
    });

    it('fails for non-existent RFC', () => {
        const result = resolveRfc(TEST_DIR, 'RFC-999', 'A', 'B');
        expect(result.resolved).toBe(false);
    });
});
