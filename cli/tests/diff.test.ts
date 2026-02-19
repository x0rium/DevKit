import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { takeSnapshot, diffSnapshots } from '../src/diff.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-diff');
const DEVKIT = join(TEST_DIR, '.devkit');

function setupMinimalDevkit() {
    mkdirSync(join(DEVKIT, 'research'), { recursive: true });
    mkdirSync(join(DEVKIT, 'product'), { recursive: true });
    mkdirSync(join(DEVKIT, 'arch', 'decisions'), { recursive: true });
    mkdirSync(join(DEVKIT, 'qa', 'escalations'), { recursive: true });

    writeFileSync(join(DEVKIT, 'STATUS.md'), `# DevKit Status\nMODE: greenfield\nINITIALIZED: 2026-01-01\nCURRENT_PHASE: research\n\n## Phase Status\n- [ ] ResearchKit\n- [ ] ProductKit\n- [ ] ArchKit\n- [ ] SpecKit\n- [ ] QAKit\n`);
    writeFileSync(join(DEVKIT, 'research', 'market.md'), '# Market\n## Analogues\nNone.\n## Unoccupied Space\nAll.\n## Potential User\nDevelopers.\n');
}

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    setupMinimalDevkit();
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('takeSnapshot', () => {
    it('captures file hashes and counts', () => {
        const snap = takeSnapshot(TEST_DIR);
        expect(snap.phase).toBe('research');
        expect(Object.keys(snap.files).length).toBeGreaterThan(0);
        expect(snap.files['STATUS.md']).toBeDefined();
        expect(snap.files['research/market.md']).toBeDefined();
    });

    it('produces consistent hashes for identical content', () => {
        const snap1 = takeSnapshot(TEST_DIR);
        const snap2 = takeSnapshot(TEST_DIR);
        expect(snap1.files).toEqual(snap2.files);
    });
});

describe('diffSnapshots', () => {
    it('detects added files', () => {
        const before = takeSnapshot(TEST_DIR);
        writeFileSync(join(DEVKIT, 'research', 'feasibility.md'), '# Feasibility\n## Known Approaches\nX\n## Known Limitations\nY\n## Verdict\nFEASIBLE: yes\n');
        const after = takeSnapshot(TEST_DIR);
        const diff = diffSnapshots(before, after);
        expect(diff.added).toContain('research/feasibility.md');
        expect(diff.removed).toEqual([]);
    });

    it('detects modified files by content hash', () => {
        const before = takeSnapshot(TEST_DIR);
        writeFileSync(join(DEVKIT, 'research', 'market.md'), '# Market\n## Analogues\nUpdated content.\n## Unoccupied Space\nAll.\n## Potential User\nDevelopers.\n');
        const after = takeSnapshot(TEST_DIR);
        const diff = diffSnapshots(before, after);
        expect(diff.modified).toContain('research/market.md');
    });

    it('does NOT report unchanged files as modified', () => {
        const before = takeSnapshot(TEST_DIR);
        // Take snapshot again without changing anything
        const after = takeSnapshot(TEST_DIR);
        const diff = diffSnapshots(before, after);
        expect(diff.added).toEqual([]);
        expect(diff.removed).toEqual([]);
        expect(diff.modified).toEqual([]);
    });

    it('computes correct stats delta', () => {
        writeFileSync(join(DEVKIT, 'product', 'ux_invariants.md'), '# UX Invariants\n\n## U1: Test\nSTATEMENT: test\nRATIONALE: test\nVALIDATION: test\nPRIORITY: must\nSTATUS: active\n');
        const before = takeSnapshot(TEST_DIR);
        writeFileSync(join(DEVKIT, 'product', 'ux_invariants.md'), '# UX Invariants\n\n## U1: Test\nSTATEMENT: test\nRATIONALE: test\nVALIDATION: test\nPRIORITY: must\nSTATUS: active\n\n## U2: Second\nSTATEMENT: two\nRATIONALE: two\nVALIDATION: two\nPRIORITY: should\nSTATUS: active\n');
        const after = takeSnapshot(TEST_DIR);
        const diff = diffSnapshots(before, after);
        expect(diff.stats.uxInvariantsDelta).toBe(1);
    });
});
