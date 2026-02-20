import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { injectDevkitHooks } from '../src/inject.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-inject');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('injectDevkitHooks', () => {
    it('creates .claude/commands/ if missing and copies bundled commands', () => {
        const result = injectDevkitHooks(TEST_DIR);

        expect(result.errors).toEqual([]);
        expect(result.created.length).toBeGreaterThan(0);
        expect(existsSync(join(TEST_DIR, '.claude', 'commands', 'speckit.specify.md'))).toBe(true);
        expect(existsSync(join(TEST_DIR, '.claude', 'commands', 'speckit.clarify.md'))).toBe(true);
        expect(existsSync(join(TEST_DIR, '.claude', 'commands', 'speckit.plan.md'))).toBe(true);
        expect(existsSync(join(TEST_DIR, '.claude', 'commands', 'speckit.tasks.md'))).toBe(true);
        expect(existsSync(join(TEST_DIR, '.claude', 'commands', 'speckit.implement.md'))).toBe(true);
        expect(existsSync(join(TEST_DIR, '.claude', 'commands', 'speckit.analyze.md'))).toBe(true);
        expect(existsSync(join(TEST_DIR, '.claude', 'commands', 'speckit.checklist.md'))).toBe(true);
    });

    it('created files contain DEVKIT markers', () => {
        injectDevkitHooks(TEST_DIR);

        const specify = readFileSync(join(TEST_DIR, '.claude', 'commands', 'speckit.specify.md'), 'utf-8');
        expect(specify).toContain('<!-- DEVKIT:START:invariant-guard -->');
        expect(specify).toContain('<!-- DEVKIT:END:invariant-guard -->');

        const plan = readFileSync(join(TEST_DIR, '.claude', 'commands', 'speckit.plan.md'), 'utf-8');
        expect(plan).toContain('<!-- DEVKIT:START:constitution-precheck -->');
        expect(plan).toContain('<!-- DEVKIT:END:constitution-precheck -->');
        expect(plan).toContain('<!-- DEVKIT:START:plan-postcheck -->');
        expect(plan).toContain('<!-- DEVKIT:END:plan-postcheck -->');
    });

    it('is idempotent — skips on second run', () => {
        const first = injectDevkitHooks(TEST_DIR);
        expect(first.created.length).toBe(7);
        expect(first.skipped.length).toBe(0);

        const second = injectDevkitHooks(TEST_DIR);
        expect(second.created.length).toBe(0);
        expect(second.injected.length).toBe(0);
        expect(second.skipped.length).toBe(7);
    });

    it('re-injects when markers are removed from a file', () => {
        injectDevkitHooks(TEST_DIR);

        // Remove markers from speckit.specify.md
        const specifyPath = join(TEST_DIR, '.claude', 'commands', 'speckit.specify.md');
        const original = readFileSync(specifyPath, 'utf-8');
        const startIdx = original.indexOf('<!-- DEVKIT:START:invariant-guard -->');
        const endIdx = original.indexOf('<!-- DEVKIT:END:invariant-guard -->') + '<!-- DEVKIT:END:invariant-guard -->'.length;
        const stripped = original.substring(0, startIdx) + original.substring(endIdx);
        writeFileSync(specifyPath, stripped, 'utf-8');

        const result = injectDevkitHooks(TEST_DIR);
        expect(result.injected).toContain('speckit.specify');

        // Verify markers are back
        const updated = readFileSync(specifyPath, 'utf-8');
        expect(updated).toContain('<!-- DEVKIT:START:invariant-guard -->');
        expect(updated).toContain('<!-- DEVKIT:END:invariant-guard -->');
    });

    it('replaces outdated marker content', () => {
        injectDevkitHooks(TEST_DIR);

        // Modify content between markers
        const specifyPath = join(TEST_DIR, '.claude', 'commands', 'speckit.specify.md');
        const content = readFileSync(specifyPath, 'utf-8');
        const modified = content.replace(
            /<!-- DEVKIT:START:invariant-guard -->[\s\S]*?<!-- DEVKIT:END:invariant-guard -->/,
            '<!-- DEVKIT:START:invariant-guard -->\nOLD CONTENT\n<!-- DEVKIT:END:invariant-guard -->'
        );
        writeFileSync(specifyPath, modified, 'utf-8');

        const result = injectDevkitHooks(TEST_DIR);
        expect(result.injected).toContain('speckit.specify');

        const updated = readFileSync(specifyPath, 'utf-8');
        expect(updated).not.toContain('OLD CONTENT');
        expect(updated).toContain('devkit impact');
    });

    it('force mode re-injects even when current', () => {
        injectDevkitHooks(TEST_DIR);

        const result = injectDevkitHooks(TEST_DIR, { force: true });
        expect(result.skipped.length).toBe(0);
        expect(result.injected.length + result.created.length).toBe(7);
    });

    it('preserves non-DevKit content in existing files', () => {
        injectDevkitHooks(TEST_DIR);

        // Add custom content to a file
        const planPath = join(TEST_DIR, '.claude', 'commands', 'speckit.plan.md');
        const content = readFileSync(planPath, 'utf-8');
        const withCustom = content + '\n## My Custom Section\nCustom content here\n';
        writeFileSync(planPath, withCustom, 'utf-8');

        // Modify marker content to trigger re-injection
        const modified = withCustom.replace(
            /<!-- DEVKIT:START:constitution-precheck -->[\s\S]*?<!-- DEVKIT:END:constitution-precheck -->/,
            '<!-- DEVKIT:START:constitution-precheck -->\nOLD\n<!-- DEVKIT:END:constitution-precheck -->'
        );
        writeFileSync(planPath, modified, 'utf-8');

        injectDevkitHooks(TEST_DIR);

        const updated = readFileSync(planPath, 'utf-8');
        expect(updated).toContain('My Custom Section');
        expect(updated).toContain('Custom content here');
        expect(updated).not.toContain('OLD');
    });

    it('handles all 7 commands', () => {
        const result = injectDevkitHooks(TEST_DIR);
        const allCommands = [...result.created, ...result.injected, ...result.skipped];
        expect(allCommands).toContain('speckit.specify');
        expect(allCommands).toContain('speckit.clarify');
        expect(allCommands).toContain('speckit.plan');
        expect(allCommands).toContain('speckit.tasks');
        expect(allCommands).toContain('speckit.implement');
        expect(allCommands).toContain('speckit.analyze');
        expect(allCommands).toContain('speckit.checklist');
    });

    it('speckit.plan has two hooks', () => {
        injectDevkitHooks(TEST_DIR);

        const plan = readFileSync(join(TEST_DIR, '.claude', 'commands', 'speckit.plan.md'), 'utf-8');
        const starts = plan.match(/<!-- DEVKIT:START:/g);
        expect(starts?.length).toBe(2);
    });
});
