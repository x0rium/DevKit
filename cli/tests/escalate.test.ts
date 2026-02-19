import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createEscalation } from '../src/escalate.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-escalate');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.devkit', 'qa', 'escalations'), { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('createEscalation', () => {
    it('auto-detects UX issues → productkit', () => {
        const result = createEscalation(TEST_DIR, 'user finds the interface confusing');
        expect(result.created).toBe(true);
        expect(result.level).toBe('productkit');
        expect(existsSync(join(TEST_DIR, '.devkit', 'qa', 'escalations', 'ESC-001.md'))).toBe(true);
    });

    it('auto-detects invariant issues → archkit', () => {
        const result = createEscalation(TEST_DIR, 'data loss from race condition in save');
        expect(result.level).toBe('archkit');
    });

    it('auto-detects assumption issues → researchkit', () => {
        const result = createEscalation(TEST_DIR, 'we assumed the API would be free but turns out it costs money');
        expect(result.level).toBe('researchkit');
    });

    it('defaults to speckit for code bugs', () => {
        const result = createEscalation(TEST_DIR, 'function returns wrong value');
        expect(result.level).toBe('speckit');
    });

    it('allows forced level override', () => {
        const result = createEscalation(TEST_DIR, 'something happened', 'archkit');
        expect(result.level).toBe('archkit');
    });
});
