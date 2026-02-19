import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Phase } from './status.js';

export interface GateCondition {
    description: string;
    satisfied: boolean;
    detail?: string;
}

export interface GateResult {
    allowed: boolean;
    currentPhase: Phase;
    nextPhase: Phase | 'production';
    conditions: GateCondition[];
}

const PHASE_MAP: Record<Phase, Phase | 'production'> = {
    research: 'product',
    product: 'arch',
    arch: 'spec',
    spec: 'qa',
    qa: 'production',
};

// --- ResearchKit Gate ---
function checkResearchGate(devkitDir: string): GateCondition[] {
    const conditions: GateCondition[] = [];
    const researchDir = join(devkitDir, 'research');

    // Check market.md exists
    const marketExists = existsSync(join(researchDir, 'market.md'));
    conditions.push({
        description: 'Market research completed (market.md)',
        satisfied: marketExists,
    });

    // Check feasibility.md exists and has verdict
    const feasPath = join(researchDir, 'feasibility.md');
    if (existsSync(feasPath)) {
        const content = readFileSync(feasPath, 'utf-8');
        const feasibleMatch = content.match(/FEASIBLE:\s*(yes|conditional)/i);
        conditions.push({
            description: 'Feasibility is "yes" or "conditional"',
            satisfied: !!feasibleMatch,
            detail: feasibleMatch ? `FEASIBLE: ${feasibleMatch[1]}` : 'FEASIBLE field not found or is "no"',
        });
    } else {
        conditions.push({
            description: 'Feasibility assessment completed (feasibility.md)',
            satisfied: false,
        });
    }

    // Check unknowns.md — no open blockers
    const unknownsPath = join(researchDir, 'unknowns.md');
    if (existsSync(unknownsPath)) {
        const content = readFileSync(unknownsPath, 'utf-8');
        const sections = content.split(/^## /m).slice(1);
        let openBlockers = 0;

        for (const section of sections) {
            const isBlocker = /BLOCKER:\s*yes/i.test(section);
            const isOpen = /STATUS:\s*open/i.test(section);
            if (isBlocker && isOpen) openBlockers++;
        }

        conditions.push({
            description: 'No open BLOCKER unknowns',
            satisfied: openBlockers === 0,
            detail: openBlockers > 0 ? `${openBlockers} open blocker(s) found` : undefined,
        });
    } else {
        conditions.push({
            description: 'Unknowns mapped (unknowns.md)',
            satisfied: false,
        });
    }

    // Check assumptions.md exists
    conditions.push({
        description: 'Assumptions documented (assumptions.md)',
        satisfied: existsSync(join(researchDir, 'assumptions.md')),
    });

    return conditions;
}

// --- ProductKit Gate ---
function checkProductGate(devkitDir: string): GateCondition[] {
    const conditions: GateCondition[] = [];
    const productDir = join(devkitDir, 'product');

    // Users defined
    const usersPath = join(productDir, 'users.md');
    if (existsSync(usersPath)) {
        const content = readFileSync(usersPath, 'utf-8');
        const hasPrimary = /## Primary User/i.test(content);
        const hasHappyPath = /HAPPY_PATH:/i.test(content);
        conditions.push({
            description: 'Primary user defined with happy path',
            satisfied: hasPrimary && hasHappyPath,
        });
    } else {
        conditions.push({ description: 'User definition completed (users.md)', satisfied: false });
    }

    // UX invariants
    const uxPath = join(productDir, 'ux_invariants.md');
    if (existsSync(uxPath)) {
        const content = readFileSync(uxPath, 'utf-8');
        const invariants = content.split(/^## U\d+/m).length - 1;
        conditions.push({
            description: 'UX invariants established',
            satisfied: invariants > 0,
            detail: `${invariants} UX invariant(s) defined`,
        });
    } else {
        conditions.push({ description: 'UX invariants defined (ux_invariants.md)', satisfied: false });
    }

    // Roadmap with anti-scope
    const roadmapPath = join(productDir, 'roadmap.md');
    if (existsSync(roadmapPath)) {
        const content = readFileSync(roadmapPath, 'utf-8');
        const hasMvp = /## MVP/i.test(content);
        const hasAntiScope = /## Never/i.test(content) || /anti-scope/i.test(content);
        conditions.push({
            description: 'Roadmap has MVP and anti-scope',
            satisfied: hasMvp && hasAntiScope,
        });
    } else {
        conditions.push({ description: 'Roadmap defined (roadmap.md)', satisfied: false });
    }

    return conditions;
}

// --- ArchKit Gate ---
function checkArchGate(devkitDir: string): GateCondition[] {
    const conditions: GateCondition[] = [];
    const archDir = join(devkitDir, 'arch');

    // Invariants exist
    const invPath = join(archDir, 'invariants.md');
    conditions.push({
        description: 'Technical invariants defined (invariants.md)',
        satisfied: existsSync(invPath),
    });

    // Constitution generated
    const constPath = join(archDir, 'constitution.md');
    conditions.push({
        description: 'Constitution generated (constitution.md)',
        satisfied: existsSync(constPath),
    });

    // No unresolved open questions in invariants
    if (existsSync(invPath)) {
        const content = readFileSync(invPath, 'utf-8');
        const hasOpenQuestions = /OPEN_QUESTION|STATUS:\s*unverified/i.test(content);
        conditions.push({
            description: 'No unverified invariants or open questions',
            satisfied: !hasOpenQuestions,
        });
    }

    return conditions;
}

// --- SpecKit Gate ---
function checkSpecGate(devkitDir: string): GateCondition[] {
    const conditions: GateCondition[] = [];

    // At least one spec implemented
    const specifyDir = join(devkitDir, '..', '.specify', 'specs');
    if (existsSync(specifyDir)) {
        const specs = readdirSync(specifyDir).filter(f => f.endsWith('.md'));
        conditions.push({
            description: 'At least one spec implemented',
            satisfied: specs.length > 0,
            detail: `${specs.length} spec(s) found`,
        });
    } else {
        conditions.push({
            description: 'Implementation specs exist (.specify/specs/)',
            satisfied: false,
        });
    }

    return conditions;
}

// --- QAKit Gate ---
function checkQaGate(devkitDir: string): GateCondition[] {
    const conditions: GateCondition[] = [];
    const qaDir = join(devkitDir, 'qa');

    conditions.push({
        description: 'Test contracts generated (test_contracts.md)',
        satisfied: existsSync(join(qaDir, 'test_contracts.md')),
    });

    conditions.push({
        description: 'Coverage map generated (coverage_map.md)',
        satisfied: existsSync(join(qaDir, 'coverage_map.md')),
    });

    // No open blocker escalations
    const escDir = join(qaDir, 'escalations');
    if (existsSync(escDir)) {
        const files = readdirSync(escDir).filter(f => f.endsWith('.md'));
        let openBlockers = 0;
        for (const file of files) {
            const content = readFileSync(join(escDir, file), 'utf-8');
            if (/STATUS:\s*open/i.test(content) && /blocker/i.test(content)) {
                openBlockers++;
            }
        }
        conditions.push({
            description: 'No open blocker escalations',
            satisfied: openBlockers === 0,
            detail: openBlockers > 0 ? `${openBlockers} open blocker escalation(s)` : undefined,
        });
    }

    return conditions;
}

export function checkGate(cwd: string, currentPhase: Phase): GateResult {
    const devkitDir = join(cwd, '.devkit');

    const checkers: Record<Phase, (dir: string) => GateCondition[]> = {
        research: checkResearchGate,
        product: checkProductGate,
        arch: checkArchGate,
        spec: checkSpecGate,
        qa: checkQaGate,
    };

    const checker = checkers[currentPhase];
    let conditions: GateCondition[];
    try {
        conditions = checker ? checker(devkitDir) : [];
    } catch (err) {
        conditions = [{
            description: 'Gate check execution',
            satisfied: false,
            detail: `Gate checker failed: ${err instanceof Error ? err.message : String(err)}`,
        }];
    }
    const allowed = conditions.length > 0 && conditions.every(c => c.satisfied);

    return {
        allowed,
        currentPhase,
        nextPhase: PHASE_MAP[currentPhase]!,
        conditions,
    };
}

const PHASE_LABELS: Record<Phase | 'production', string> = {
    research: 'ResearchKit',
    product: 'ProductKit',
    arch: 'ArchKit',
    spec: 'SpecKit',
    qa: 'QAKit',
    production: 'Production',
};

export function formatGate(result: GateResult): string {
    const lines: string[] = [];
    const from = PHASE_LABELS[result.currentPhase];
    const to = PHASE_LABELS[result.nextPhase];

    lines.push(`Gate: ${from} → ${to}\n`);

    for (const cond of result.conditions) {
        const icon = cond.satisfied ? '✅' : '❌';
        lines.push(`  ${icon} ${cond.description}`);
        if (cond.detail) {
            lines.push(`     ${cond.detail}`);
        }
    }

    lines.push('');

    if (result.allowed) {
        lines.push(`🟢 ALLOWED — ready to proceed to ${to}`);
    } else {
        const unsatisfied = result.conditions.filter(c => !c.satisfied).length;
        lines.push(`🔴 BLOCKED — ${unsatisfied} condition(s) not met`);
    }

    return lines.join('\n');
}
