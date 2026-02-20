import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface InjectResult {
    injected: string[];   // hooks updated/inserted
    created: string[];    // copied from bundle (file didn't exist)
    skipped: string[];    // already current
    errors: string[];
}

const MARKER_START = (hookName: string) => `<!-- DEVKIT:START:${hookName} -->`;
const MARKER_END = (hookName: string) => `<!-- DEVKIT:END:${hookName} -->`;

/**
 * Command → hook mappings.
 * Each entry: [commandBaseName, hookName, hookFragmentFile]
 */
const HOOK_MAP: Array<[string, string]> = [
    ['speckit.specify', 'invariant-guard'],
    ['speckit.clarify', 'invariant-check'],
    ['speckit.plan', 'constitution-precheck'],
    ['speckit.plan', 'plan-postcheck'],
    ['speckit.tasks', 'validate-checkpoints'],
    ['speckit.implement', 'phase-guards'],
    ['speckit.analyze', 'coverage-pass'],
    ['speckit.checklist', 'invariant-category'],
];

/** All unique command names that have hooks */
const COMMAND_NAMES = [...new Set(HOOK_MAP.map(([cmd]) => cmd))];

function getSpecKitDir(): string | null {
    const thisFile = fileURLToPath(import.meta.url);
    const distDir = dirname(thisFile);       // cli/dist/
    const cliRoot = dirname(distDir);        // cli/
    const specKitDir = join(cliRoot, 'skills', 'spec-kit');

    if (existsSync(specKitDir)) return specKitDir;
    return null;
}

function getBundledCommandPath(specKitDir: string, commandName: string): string {
    return join(specKitDir, 'commands', `${commandName}.md`);
}

function getHookFragmentPath(specKitDir: string, commandName: string, hookName: string): string {
    // Hook files follow: {commandBaseName}.{hookName}.md
    // e.g. specify.invariant-guard.md (strip 'speckit.' prefix)
    const baseName = commandName.replace('speckit.', '');
    return join(specKitDir, 'hooks', `${baseName}.${hookName}.md`);
}

function getTargetCommandPath(cwd: string, commandName: string): string {
    return join(cwd, '.claude', 'commands', `${commandName}.md`);
}

/**
 * Extract content between DEVKIT markers in a file.
 * Returns null if markers not found.
 */
function extractMarkerContent(content: string, hookName: string): string | null {
    const startMarker = MARKER_START(hookName);
    const endMarker = MARKER_END(hookName);
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;

    const afterStart = startIdx + startMarker.length;
    return content.substring(afterStart, endIdx);
}

/**
 * Replace content between DEVKIT markers, or return null if markers not found.
 */
function replaceMarkerContent(content: string, hookName: string, newInnerContent: string): string | null {
    const startMarker = MARKER_START(hookName);
    const endMarker = MARKER_END(hookName);
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;

    const before = content.substring(0, startIdx + startMarker.length);
    const after = content.substring(endIdx);

    return before + newInnerContent + after;
}

/**
 * Inject DevKit hooks into speckit commands in .claude/commands/.
 *
 * For each of 7 commands:
 *   1. No file exists → copy from bundle → "created"
 *   2. File exists + no markers → copy from bundle (overwrite with enhanced version) → "injected"
 *   3. File exists + markers + content matches → "skipped"
 *   4. File exists + markers + content differs → replace between markers → "injected"
 */
export function injectDevkitHooks(cwd: string, opts?: { force?: boolean }): InjectResult {
    const result: InjectResult = {
        injected: [],
        created: [],
        skipped: [],
        errors: [],
    };

    const specKitDir = getSpecKitDir();
    if (!specKitDir) {
        result.errors.push('Could not locate cli/skills/spec-kit/ directory');
        return result;
    }

    // Ensure .claude/commands/ exists
    const commandsDir = join(cwd, '.claude', 'commands');
    mkdirSync(commandsDir, { recursive: true });

    // Process each command
    for (const commandName of COMMAND_NAMES) {
        const targetPath = getTargetCommandPath(cwd, commandName);
        const bundledPath = getBundledCommandPath(specKitDir, commandName);

        if (!existsSync(bundledPath)) {
            result.errors.push(`Bundled command not found: ${commandName}`);
            continue;
        }

        const bundledContent = readFileSync(bundledPath, 'utf-8');

        // Case 1: Target file doesn't exist → copy from bundle
        if (!existsSync(targetPath)) {
            writeFileSync(targetPath, bundledContent, 'utf-8');
            result.created.push(commandName);
            continue;
        }

        // File exists — check each hook for this command
        let currentContent = readFileSync(targetPath, 'utf-8');
        const hooksForCommand = HOOK_MAP.filter(([cmd]) => cmd === commandName);
        let commandModified = false;
        let allHooksCurrent = true;

        for (const [, hookName] of hooksForCommand) {
            const existingHookContent = extractMarkerContent(currentContent, hookName);
            const bundledHookContent = extractMarkerContent(bundledContent, hookName);

            if (bundledHookContent === null) {
                // No hook in bundle — shouldn't happen but skip
                continue;
            }

            if (existingHookContent === null) {
                // No markers in target — need to copy the full bundled version
                // This replaces the entire file with the enhanced version
                if (opts?.force || !commandModified) {
                    currentContent = bundledContent;
                    commandModified = true;
                    allHooksCurrent = false;
                }
                break; // No point checking other hooks since we're replacing the whole file
            }

            // Markers exist — compare content
            if (existingHookContent.trim() === bundledHookContent.trim() && !opts?.force) {
                // Content matches — skip this hook
                continue;
            }

            // Content differs or force mode — replace between markers
            const updated = replaceMarkerContent(currentContent, hookName, bundledHookContent);
            if (updated) {
                currentContent = updated;
                commandModified = true;
                allHooksCurrent = false;
            }
        }

        if (commandModified) {
            writeFileSync(targetPath, currentContent, 'utf-8');
            result.injected.push(commandName);
        } else if (allHooksCurrent) {
            result.skipped.push(commandName);
        }
    }

    return result;
}

/**
 * Get the list of hook fragment files available.
 */
export function listHookFragments(): Array<{ command: string; hook: string }> {
    return HOOK_MAP.map(([cmd, hook]) => ({ command: cmd, hook }));
}
