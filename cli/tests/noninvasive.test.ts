import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { scaffoldDevkit } from '../src/scaffold.js';

const TEST_DIR = join(import.meta.dirname, '..', '.test-tmp-noninvasive');

beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

/**
 * U4: Non-invasive integration
 * DevKit must NOT modify or interfere with existing project files.
 * It should only create files inside .devkit/ and .specify/.
 */
describe('U4: Non-invasive integration', () => {
    it('does not touch existing project files during init', () => {
        // Create existing project files
        writeFileSync(join(TEST_DIR, 'package.json'), '{"name":"my-app"}');
        writeFileSync(join(TEST_DIR, 'index.ts'), 'console.log("hello")');
        mkdirSync(join(TEST_DIR, 'src'), { recursive: true });
        writeFileSync(join(TEST_DIR, 'src', 'app.ts'), 'export const app = {}');

        // Run scaffold
        scaffoldDevkit(TEST_DIR, 'brownfield');

        // Verify existing files are untouched
        expect(readFileSync(join(TEST_DIR, 'package.json'), 'utf-8')).toBe('{"name":"my-app"}');
        expect(readFileSync(join(TEST_DIR, 'index.ts'), 'utf-8')).toBe('console.log("hello")');
        expect(readFileSync(join(TEST_DIR, 'src', 'app.ts'), 'utf-8')).toBe('export const app = {}');
    });

    it('only creates files inside .devkit/ directory', () => {
        writeFileSync(join(TEST_DIR, 'README.md'), '# My Project');

        scaffoldDevkit(TEST_DIR, 'greenfield');

        // .devkit/ was created with STATUS.md
        expect(existsSync(join(TEST_DIR, '.devkit'))).toBe(true);
        expect(existsSync(join(TEST_DIR, '.devkit', 'STATUS.md'))).toBe(true);

        // README was not modified
        expect(readFileSync(join(TEST_DIR, 'README.md'), 'utf-8')).toBe('# My Project');
    });

    it('is idempotent — running init twice changes nothing', () => {
        scaffoldDevkit(TEST_DIR, 'greenfield');
        const statusAfterFirst = readFileSync(join(TEST_DIR, '.devkit', 'STATUS.md'), 'utf-8');

        scaffoldDevkit(TEST_DIR, 'greenfield');
        const statusAfterSecond = readFileSync(join(TEST_DIR, '.devkit', 'STATUS.md'), 'utf-8');

        expect(statusAfterFirst).toBe(statusAfterSecond);
    });
});
