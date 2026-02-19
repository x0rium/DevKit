import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { getStatus, formatStatus, type Phase } from '../src/status.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-disclosure');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.devkit'), { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

/**
 * U5: Progressive disclosure
 * CLI shows only phase-relevant commands and information.
 * User is not overwhelmed with options they can't use yet.
 */
describe('U5: Progressive disclosure', () => {
    it('status output includes phase-appropriate next steps', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'STATUS.md'), `# DevKit Status
MODE: greenfield
INITIALIZED: 2026-01-01
CURRENT_PHASE: research

## Progress
- [/] ResearchKit
- [ ] ProductKit
- [ ] ArchKit
- [ ] SpecKit
- [ ] QAKit
`);

        const status = getStatus(TEST_DIR);
        expect(status).not.toBeNull();
        expect(status!.phase).toBe('research');

        // formatStatus shows research-specific next step
        const output = formatStatus(status!);
        expect(output).toContain('research');
        expect(output).toContain('Next:');
    });

    it('shows different info per phase — arch vs qa', () => {
        // Arch phase
        writeFileSync(join(TEST_DIR, '.devkit', 'STATUS.md'), `# DevKit Status
MODE: greenfield
INITIALIZED: 2026-01-01
CURRENT_PHASE: arch

## Progress
- [x] ResearchKit
- [x] ProductKit
- [/] ArchKit
- [ ] SpecKit
- [ ] QAKit
`);

        const archStatus = getStatus(TEST_DIR);
        const archOutput = formatStatus(archStatus!);
        expect(archOutput).toContain('ArchKit');
        expect(archOutput).toContain('◀ current');

        // QA phase
        writeFileSync(join(TEST_DIR, '.devkit', 'STATUS.md'), `# DevKit Status
MODE: greenfield
INITIALIZED: 2026-01-01
CURRENT_PHASE: qa

## Progress
- [x] ResearchKit
- [x] ProductKit
- [x] ArchKit
- [x] SpecKit
- [/] QAKit
`);

        const qaStatus = getStatus(TEST_DIR);
        const qaOutput = formatStatus(qaStatus!);
        expect(qaOutput).toContain('QAKit');
        expect(qaOutput).toContain('◀ current');
        // QA shows different next step than Arch
        expect(qaOutput).not.toContain(archOutput.match(/Next: (.+)/)?.[1]);
    });

    it('shows only completed phases as done', () => {
        writeFileSync(join(TEST_DIR, '.devkit', 'STATUS.md'), `# DevKit Status
MODE: greenfield
INITIALIZED: 2026-01-01
CURRENT_PHASE: arch

## Progress
- [x] ResearchKit
- [x] ProductKit
- [/] ArchKit
- [ ] SpecKit
- [ ] QAKit
`);

        const status = getStatus(TEST_DIR);
        expect(status!.phaseProgress.research).toBe('done');
        expect(status!.phaseProgress.product).toBe('done');
        expect(status!.phaseProgress.arch).toBe('in_progress');
        expect(status!.phaseProgress.spec).toBe('pending');
        expect(status!.phaseProgress.qa).toBe('pending');
    });
});
