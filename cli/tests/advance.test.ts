import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { advancePhase } from '../src/advance.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-advance');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.devkit'), { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('advancePhase', () => {
    it('advances from research to product', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'STATUS.md'), `# DevKit Status

MODE: greenfield
CURRENT_PHASE: research

## Phase Status
- [/] ResearchKit
- [ ] ProductKit
- [ ] ArchKit
- [ ] SpecKit
- [ ] QAKit
`);

        const result = advancePhase(TEST_DIR, 'research');
        expect(result.advanced).toBe(true);
        expect(result.from).toBe('research');
        expect(result.to).toBe('product');

        const content = readFileSync(join(TEST_DIR, '.devkit', 'STATUS.md'), 'utf-8');
        expect(content).toContain('CURRENT_PHASE: product');
        expect(content).toContain('[x] ResearchKit');
        expect(content).toContain('[/] ProductKit');
    });

    it('refuses to advance past QA', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'STATUS.md'), `# DevKit Status

CURRENT_PHASE: qa

## Phase Status
- [x] ResearchKit
- [x] ProductKit
- [x] ArchKit
- [x] SpecKit
- [/] QAKit
`);

        const result = advancePhase(TEST_DIR, 'qa');
        expect(result.advanced).toBe(false);
        expect(result.error).toContain('final phase');
    });

    it('fails when STATUS.md missing', () => {
        const result = advancePhase(TEST_DIR, 'research');
        expect(result.advanced).toBe(false);
        expect(result.error).toContain('STATUS.md not found');
    });
});
