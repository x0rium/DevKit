import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';
import { SCHEMAS, STRUCTURED_FIELDS, type ArtifactSchema } from './schemas.js';

export interface ValidationError {
    file: string;
    line: number;
    field: string;
    message: string;
    fix: string;
}

export interface ValidationResult {
    errors: ValidationError[];
    warnings: ValidationError[];
    filesChecked: number;
    filesValid: number;
}

function findSections(content: string): Map<string, number> {
    const sections = new Map<string, number>();
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const match = lines[i]!.match(/^##\s+(.+)/);
        if (match) {
            sections.set(match[1]!.trim(), i + 1);
        }
    }
    return sections;
}

function findStructuredFields(
    content: string,
    sectionStart: number,
    nextSectionStart: number | null,
): Map<string, { line: number; value: string }> {
    const fields = new Map<string, { line: number; value: string }>();
    const lines = content.split('\n');
    const end = nextSectionStart ? nextSectionStart - 1 : lines.length;

    for (let i = sectionStart; i < end; i++) {
        const match = lines[i]!.match(/^([A-Z_]+):\s*(.*)/);
        if (match) {
            fields.set(match[1]!, { line: i + 1, value: match[2]!.trim() });
        }
    }
    return fields;
}

function detectSectionType(sectionName: string): string | null {
    const lower = sectionName.toLowerCase();
    if (lower.startsWith('unknown:') || lower.startsWith('unknown ')) return 'unknown';
    if (lower.startsWith('assumption:') || lower.startsWith('assumption ')) return 'assumption';
    if (lower.startsWith('i') && /^i\d+:/.test(lower)) return 'invariant';
    if (lower.startsWith('u') && /^u\d+:/.test(lower)) return 'ux_invariant';
    if (lower.startsWith('tc-i')) return 'test_contract';
    if (lower.startsWith('adr-')) return 'adr';
    if (lower.startsWith('rfc-')) return 'rfc';
    if (lower.startsWith('inv-') || lower.startsWith('investigation-')) return 'investigation';
    return null;
}

function validateFile(
    filePath: string,
    schema: ArtifactSchema,
    devkitDir: string,
): ValidationError[] {
    const errors: ValidationError[] = [];
    const relPath = relative(devkitDir, filePath);

    if (!existsSync(filePath)) return [];

    const content = readFileSync(filePath, 'utf-8');
    const sections = findSections(content);

    // Check required sections
    for (const required of schema.requiredSections) {
        // Case-insensitive check
        const found = [...sections.keys()].some(
            s => s.toLowerCase().includes(required.toLowerCase())
        );
        if (!found) {
            errors.push({
                file: relPath,
                line: 1,
                field: required,
                message: `Missing required section: ## ${required}`,
                fix: `Add "## ${required}" section to ${basename(filePath)}`,
            });
        }
    }

    // Check structured fields in dynamic sections
    const sectionEntries = [...sections.entries()];
    for (let i = 0; i < sectionEntries.length; i++) {
        const [name, startLine] = sectionEntries[i]!;
        const nextLine = sectionEntries[i + 1]?.[1] ?? null;
        const sectionType = detectSectionType(name);

        if (sectionType && STRUCTURED_FIELDS[sectionType]) {
            const fields = findStructuredFields(content, startLine, nextLine);
            const requiredFields = STRUCTURED_FIELDS[sectionType]!;

            for (const fieldName of requiredFields) {
                if (!fields.has(fieldName)) {
                    errors.push({
                        file: relPath,
                        line: startLine,
                        field: fieldName,
                        message: `Missing field ${fieldName} in section "${name}"`,
                        fix: `Add "${fieldName}: <value>" under "## ${name}" in ${basename(filePath)}`,
                    });
                } else {
                    const field = fields.get(fieldName)!;
                    if (!field.value || field.value === '[fill when validated]') {
                        // Warning, not error — field exists but empty
                    }
                }
            }
        }
    }

    return errors;
}

export function validateArtifacts(cwd: string): ValidationResult {
    const devkitDir = join(cwd, '.devkit');
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let filesChecked = 0;
    let filesValid = 0;

    if (!existsSync(devkitDir)) {
        errors.push({
            file: '.devkit/',
            line: 0,
            field: 'directory',
            message: '.devkit/ directory not found',
            fix: 'Run "devkit init" to create .devkit/ structure',
        });
        return { errors, warnings, filesChecked: 0, filesValid: 0 };
    }

    // Check each known artifact
    for (const schema of SCHEMAS) {
        const filePath = join(devkitDir, schema.directory, schema.file);
        if (!existsSync(filePath)) continue;

        filesChecked++;
        const fileErrors = validateFile(filePath, schema, devkitDir);
        if (fileErrors.length === 0) {
            filesValid++;
        }
        errors.push(...fileErrors);
    }

    // Also check decision files (ADR, RFC, INV)
    const decisionsDir = join(devkitDir, 'arch', 'decisions');
    if (existsSync(decisionsDir)) {
        const files = readdirSync(decisionsDir).filter(f => f.endsWith('.md'));
        for (const file of files) {
            const filePath = join(decisionsDir, file);
            filesChecked++;

            let schemaType: ArtifactSchema | undefined;
            if (file.startsWith('ADR-')) {
                schemaType = { id: 'arch.adr', file, directory: 'arch/decisions', requiredSections: [] };
            } else if (file.startsWith('RFC-')) {
                schemaType = { id: 'arch.rfc', file, directory: 'arch/decisions', requiredSections: [] };
            } else if (file.startsWith('INV-')) {
                schemaType = { id: 'arch.inv', file, directory: 'arch/decisions', requiredSections: [] };
            }

            if (schemaType) {
                const fileErrors = validateFile(filePath, schemaType, devkitDir);
                if (fileErrors.length === 0) filesValid++;
                errors.push(...fileErrors);
            }
        }
    }

    return { errors, warnings, filesChecked, filesValid };
}

export function formatValidation(result: ValidationResult): string {
    const lines: string[] = [];

    if (result.filesChecked === 0) {
        lines.push('⚠️  No artifacts found to validate.');
        lines.push('   Run "devkit init" and create artifacts in .devkit/');
        return lines.join('\n');
    }

    lines.push(`Checked ${result.filesChecked} artifact(s)\n`);

    if (result.errors.length === 0) {
        lines.push(`✅ All ${result.filesValid} artifact(s) valid!`);
        return lines.join('\n');
    }

    lines.push(`❌ Found ${result.errors.length} error(s):\n`);

    // Group by file
    const byFile = new Map<string, ValidationError[]>();
    for (const err of result.errors) {
        const list = byFile.get(err.file) ?? [];
        list.push(err);
        byFile.set(err.file, list);
    }

    for (const [file, errs] of byFile) {
        lines.push(`  📄 ${file}`);
        for (const err of errs) {
            const loc = err.line > 0 ? `:${err.line}` : '';
            lines.push(`     ✖ ${err.message}`);
            lines.push(`       → Fix: ${err.fix}`);
        }
        lines.push('');
    }

    lines.push(`${result.filesValid}/${result.filesChecked} valid`);
    return lines.join('\n');
}
