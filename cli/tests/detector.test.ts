import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { detectProjectState } from '../src/detector.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-detector');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('detectProjectState', () => {
    it('returns greenfield for empty directory', () => {
        expect(detectProjectState(TEST_DIR)).toBe('greenfield');
    });

    it('returns initialized when .devkit/ exists', () => {
        mkdirSync(join(TEST_DIR, '.devkit'));
        expect(detectProjectState(TEST_DIR)).toBe('initialized');
    });

    it('returns upgrade when .specify/ exists without .devkit/', () => {
        mkdirSync(join(TEST_DIR, '.specify'));
        expect(detectProjectState(TEST_DIR)).toBe('upgrade');
    });

    it('returns brownfield when code files exist', () => {
        writeFileSync(join(TEST_DIR, 'main.ts'), 'console.log("hello")');
        expect(detectProjectState(TEST_DIR)).toBe('brownfield');
    });

    it('initialized takes precedence over brownfield', () => {
        mkdirSync(join(TEST_DIR, '.devkit'));
        writeFileSync(join(TEST_DIR, 'main.ts'), 'console.log("hello")');
        expect(detectProjectState(TEST_DIR)).toBe('initialized');
    });

    it('ignores node_modules', () => {
        mkdirSync(join(TEST_DIR, 'node_modules'), { recursive: true });
        writeFileSync(join(TEST_DIR, 'node_modules', 'index.js'), '');
        expect(detectProjectState(TEST_DIR)).toBe('greenfield');
    });
});
