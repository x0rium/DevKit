import { readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type ProjectState = 'greenfield' | 'brownfield' | 'upgrade' | 'initialized';

const CODE_EXTENSIONS = new Set([
    '.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java',
    '.c', '.cpp', '.h', '.cs', '.rb', '.php', '.swift', '.kt',
]);

function hasCodeFiles(dir: string): boolean {
    try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith('.')) continue;
            if (entry.name === 'node_modules') continue;

            if (entry.isFile()) {
                const ext = entry.name.substring(entry.name.lastIndexOf('.'));
                if (CODE_EXTENSIONS.has(ext)) return true;
            }

            if (entry.isDirectory()) {
                if (hasCodeFiles(join(dir, entry.name))) return true;
            }
        }
    } catch {
        // Permission errors, etc.
    }
    return false;
}

export function detectProjectState(cwd: string): ProjectState {
    const devkitDir = join(cwd, '.devkit');
    const specifyDir = join(cwd, '.specify');

    if (existsSync(devkitDir) && statSync(devkitDir).isDirectory()) {
        return 'initialized';
    }

    if (existsSync(specifyDir) && statSync(specifyDir).isDirectory()) {
        return 'upgrade';
    }

    if (hasCodeFiles(cwd)) {
        return 'brownfield';
    }

    return 'greenfield';
}
