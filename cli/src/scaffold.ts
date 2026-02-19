import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const STATUS_TEMPLATE = `# DevKit Status

MODE: {mode}
INITIALIZED: {date}
CURRENT_PHASE: research

## Phase Status
- [ ] ResearchKit
- [ ] ProductKit
- [ ] ArchKit
- [ ] SpecKit
- [ ] QAKit
`;

const DIRECTORIES = [
    '.devkit',
    '.devkit/research',
    '.devkit/product',
    '.devkit/arch',
    '.devkit/arch/decisions',
    '.devkit/qa',
    '.devkit/qa/escalations',
];

export interface ScaffoldResult {
    created: string[];
    skipped: string[];
    mode: string;
}

export function scaffoldDevkit(cwd: string, mode: string): ScaffoldResult {
    const created: string[] = [];
    const skipped: string[] = [];

    // Create directories
    for (const dir of DIRECTORIES) {
        const fullPath = join(cwd, dir);
        if (!existsSync(fullPath)) {
            mkdirSync(fullPath, { recursive: true });
            created.push(dir + '/');
        } else {
            skipped.push(dir + '/');
        }
    }

    // Create STATUS.md
    const statusPath = join(cwd, '.devkit', 'STATUS.md');
    if (!existsSync(statusPath)) {
        const today = new Date().toISOString().split('T')[0];
        const content = STATUS_TEMPLATE
            .replace('{mode}', mode)
            .replace('{date}', today!);
        writeFileSync(statusPath, content, 'utf-8');
        created.push('.devkit/STATUS.md');
    } else {
        skipped.push('.devkit/STATUS.md');
    }

    return { created, skipped, mode };
}
