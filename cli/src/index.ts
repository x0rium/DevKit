#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { detectProjectState } from './detector.js';
import { scaffoldDevkit } from './scaffold.js';
import { getStatus, formatStatus, type Phase } from './status.js';
import { validateArtifacts, formatValidation } from './validator.js';
import { checkGate, formatGate } from './gate.js';
import { generateConstitution, syncConstitution } from './constitution.js';
import { analyzeImpact, formatImpact } from './impact.js';
import { advancePhase } from './advance.js';
import { createRfc, listRfcs, resolveRfc } from './rfc.js';
import { createInvestigation, listInvestigations, resolveInvestigation } from './investigate.js';
import { createEscalation, type EscalationLevel } from './escalate.js';
import { analyzeCoverage, formatCoverage } from './coverage.js';
import { watchValidate } from './watch.js';
import { startDashboard } from './dashboard.js';
import { takeSnapshot, saveSnapshot, listSnapshots, loadSnapshot, diffSnapshots, formatDiff } from './diff.js';

const program = new Command();

program
    .name('devkit')
    .description('DevKit CLI — AI-Native Development Methodology')
    .version('0.6.0');

// ────────────────────────────── INIT ──────────────────────────────
program
    .command('init')
    .description('Initialize DevKit in the current project')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n🚀 DevKit Init\n'));

        const state = detectProjectState(cwd);
        console.log(`  Detected: ${chalk.cyan(state)} project\n`);

        if (state === 'initialized') {
            console.log(chalk.yellow('  ⚠ .devkit/ already exists. Use "devkit status" to check progress.'));
            return;
        }

        const result = scaffoldDevkit(cwd, state);

        if (result.created.length > 0) {
            console.log(chalk.green('  Created:'));
            for (const path of result.created) {
                console.log(`    + ${path}`);
            }
        }

        if (result.skipped.length > 0) {
            console.log(chalk.dim('  Skipped (already exist):'));
            for (const path of result.skipped) {
                console.log(chalk.dim(`    - ${path}`));
            }
        }

        if (result.skillsInstalled > 0) {
            console.log(chalk.green(`\n  🧠 Agent Skills: ${result.skillsInstalled} installed → .agent/skills/`));
        }

        if (!result.specKitFound) {
            console.log(chalk.yellow('\n  ⚠️  spec-kit not found. DevKit Level 4 (SpecKit) requires it.'));
            console.log(chalk.dim('    Install: uv tool install specify-cli --from git+https://github.com/github/spec-kit.git'));
            console.log(chalk.dim('    Then:    specify init . --ai claude'));
        } else {
            console.log(chalk.green('\n  ✅ spec-kit detected'));
        }

        console.log('');
        console.log(chalk.bold('  Next steps:'));

        switch (state) {
            case 'greenfield':
                console.log('    Start with: /research-kit');
                console.log('    Describe your idea and explore feasibility.');
                break;
            case 'brownfield':
                console.log('    Review: .devkit/arch/invariants.md');
                console.log('    Then: /arch-kit to fill gaps.');
                break;
            case 'upgrade':
                console.log('    Extracting spec-kit artifacts into DevKit structure...');
                console.log('    Review: .devkit/arch/invariants.md');
                break;
        }

        console.log('');
    });

// ────────────────────────────── STATUS ──────────────────────────────
program
    .command('status')
    .description('Show current DevKit phase, progress, and next step')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((opts) => {
        const cwd = opts.dir as string;
        const status = getStatus(cwd);

        if (!status) {
            console.log(chalk.red('\n  ❌ .devkit/ not found. Run "devkit init" first.\n'));
            return;
        }

        console.log('\n' + formatStatus(status));

        // Show open RFCs/INVs/ESCs
        const rfcs = listRfcs(cwd).filter(r => r.status === 'open');
        const invs = listInvestigations(cwd).filter(i => i.status === 'open');

        if (rfcs.length > 0 || invs.length > 0) {
            console.log(chalk.yellow('  ⚡ Open escalations:'));
            for (const r of rfcs) {
                console.log(chalk.yellow(`    📋 ${r.id}: ${r.title.replace(`${r.id}: `, '')} (RFC)`));
            }
            for (const i of invs) {
                console.log(chalk.yellow(`    🔬 ${i.id}: ${i.title.replace(`${i.id}: `, '')} (Investigation)`));
            }
            console.log('');
        }

        // Progressive disclosure (U5): show phase-relevant commands
        const phaseCommands = getPhaseCommands(status.phase);
        if (phaseCommands.length > 0) {
            console.log(chalk.dim('  Available commands for this phase:'));
            for (const cmd of phaseCommands) {
                console.log(chalk.dim(`    devkit ${cmd}`));
            }
            console.log('');
        }
    });

// ────────────────────────────── VALIDATE ──────────────────────────────
program
    .command('validate')
    .description('Validate all .devkit/ artifacts against schemas')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n🔍 DevKit Validate\n'));

        const result = validateArtifacts(cwd);
        console.log(formatValidation(result));
        console.log('');

        if (result.errors.length > 0) {
            process.exitCode = 1;
        }
    });

// ────────────────────────────── GATE ──────────────────────────────
program
    .command('gate')
    .description('Check if transition to next phase is allowed')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .option('-p, --phase <phase>', 'Phase to check (default: current from STATUS.md)')
    .action((opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n🚧 DevKit Gate Check\n'));

        let phase: Phase;

        if (opts.phase) {
            phase = opts.phase as Phase;
        } else {
            const status = getStatus(cwd);
            if (!status) {
                console.log(chalk.red('  ❌ .devkit/ not found. Run "devkit init" first.\n'));
                return;
            }
            phase = status.phase;
        }

        const result = checkGate(cwd, phase);
        console.log(formatGate(result));
        console.log('');

        if (!result.allowed) {
            process.exitCode = 1;
        }
    });

// ────────────────────────────── GENERATE-CONSTITUTION ──────────────────────────────
program
    .command('generate-constitution')
    .description('Generate constitution.md from invariants + decisions')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n📜 Generate Constitution\n'));

        const result = generateConstitution(cwd);

        if (!result.generated) {
            console.log(chalk.red(`  ❌ ${result.error}\n`));
            process.exitCode = 1;
            return;
        }

        console.log(chalk.green('  ✅ Constitution generated!'));
        console.log(`     Technical invariants: ${result.invariantsCount}`);
        console.log(`     UX invariants:        ${result.uxInvariantsCount}`);
        console.log(`     ADR decisions:        ${result.decisionsCount}`);
        console.log(`     Output: .devkit/arch/constitution.md`);
        console.log('');
        console.log(chalk.dim('  Run "devkit sync" to transform and sync to .specify/memory/constitution.md'));
        console.log('');
    });

// ────────────────────────────── SYNC ──────────────────────────────
program
    .command('sync')
    .description('Sync constitution to spec-kit format → .specify/memory/constitution.md')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n🔄 Sync Constitution\n'));

        const result = syncConstitution(cwd);

        if (!result.synced) {
            console.log(chalk.red(`  ❌ ${result.error}\n`));
            process.exitCode = 1;
            return;
        }

        console.log(chalk.green('  ✅ Synced!'));
        console.log(`     ${result.from} → ${result.to}`);
        console.log('');
    });

// ────────────────────────────── IMPACT ──────────────────────────────
program
    .command('impact <description>')
    .description('Analyze impact of a proposed change on invariants and components')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((description: string, opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n💥 Impact Analysis\n'));

        const result = analyzeImpact(cwd, description);
        console.log(formatImpact(result));
        console.log('');

        if (result.riskLevel === 'high') {
            process.exitCode = 1;
        }
    });

// ────────────────────────────── ADVANCE ──────────────────────────────
program
    .command('advance')
    .description('Advance to the next DevKit phase (requires passing gate)')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .option('--force', 'Skip gate check (not recommended)', false)
    .action((opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n⏩ Advance Phase\n'));

        const status = getStatus(cwd);
        if (!status) {
            console.log(chalk.red('  ❌ .devkit/ not found. Run "devkit init" first.\n'));
            return;
        }

        if (!opts.force) {
            const gateResult = checkGate(cwd, status.phase);
            if (!gateResult.allowed) {
                console.log(chalk.red('  ❌ Gate check failed. Cannot advance.\n'));
                console.log(formatGate(gateResult));
                console.log('');
                console.log(chalk.dim('  Use --force to skip gate check (not recommended)'));
                console.log('');
                process.exitCode = 1;
                return;
            }
        }

        const result = advancePhase(cwd, status.phase);

        if (!result.advanced) {
            console.log(chalk.red(`  ❌ ${result.error}\n`));
            process.exitCode = 1;
            return;
        }

        const LABELS: Record<Phase, string> = {
            research: 'ResearchKit', product: 'ProductKit', arch: 'ArchKit',
            spec: 'SpecKit', qa: 'QAKit',
        };

        console.log(chalk.green(`  ✅ Advanced: ${LABELS[result.from]} → ${LABELS[result.to]}`));
        console.log('');

        const newStatus = getStatus(cwd);
        if (newStatus) {
            console.log(formatStatus(newStatus));
        }
    });

// ────────────────────────────── RFC ──────────────────────────────
program
    .command('rfc <description>')
    .description('Create RFC with automatic impact analysis')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((description: string, opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n📋 Create RFC\n'));

        const result = createRfc(cwd, description);

        if (!result.created) {
            console.log(chalk.red(`  ❌ ${result.error}\n`));
            process.exitCode = 1;
            return;
        }

        const riskEmoji = result.riskLevel === 'high' ? '🔴' :
            result.riskLevel === 'medium' ? '🟡' : '🟢';

        console.log(chalk.green(`  ✅ Created: ${result.id}`));
        console.log(`     Path:   .devkit/${result.path}`);
        console.log(`     Risk:   ${riskEmoji} ${result.riskLevel}`);
        console.log('');

        if (result.affectedInvariants.length > 0) {
            console.log('  Affected invariants:');
            for (const inv of result.affectedInvariants) {
                console.log(`    ⚡ ${inv}`);
            }
            console.log('');
        }

        if (result.affectedSpecs.length > 0) {
            console.log('  Affected specs:');
            for (const spec of result.affectedSpecs) {
                console.log(`    📄 ${spec}`);
            }
            console.log('');
        }

        console.log(chalk.dim('  Next: Fill Options and Decision in the RFC file.'));
        console.log(chalk.dim(`  Then: devkit resolve-rfc ${result.id} "Option A" "rationale"`));
        console.log('');
    });

// ────────────────────────────── RFC LIST ──────────────────────────────
program
    .command('rfc-list')
    .description('List all RFCs')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n📋 RFCs\n'));

        const rfcs = listRfcs(cwd);

        if (rfcs.length === 0) {
            console.log('  No RFCs found.');
            console.log(chalk.dim('  Create one: devkit rfc "description"'));
            console.log('');
            return;
        }

        for (const rfc of rfcs) {
            const icon = rfc.status === 'open' ? '🟡' : rfc.status === 'accepted' ? '✅' : '⛔';
            console.log(`  ${icon} ${rfc.id}: ${rfc.title.replace(`${rfc.id}: `, '')} [${rfc.status}]`);
        }
        console.log('');
    });

// ────────────────────────────── RESOLVE RFC ──────────────────────────────
program
    .command('resolve-rfc <id> <option> <rationale>')
    .description('Resolve an RFC with chosen option and rationale')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((id: string, option: string, rationale: string, opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n📋 Resolve RFC\n'));

        const result = resolveRfc(cwd, id, option, rationale);

        if (!result.resolved) {
            console.log(chalk.red(`  ❌ ${result.error}\n`));
            process.exitCode = 1;
            return;
        }

        console.log(chalk.green(`  ✅ ${id} resolved!`));
        console.log(`     Chosen: ${option}`);
        console.log(`     Rationale: ${rationale}`);
        console.log('');
        console.log(chalk.dim('  Don\'t forget post-decision actions:'));
        console.log(chalk.dim('    devkit generate-constitution'));
        console.log(chalk.dim('    devkit sync'));
        console.log('');
    });

// ────────────────────────────── INVESTIGATE ──────────────────────────────
program
    .command('investigate <description>')
    .description('Create Investigation for a technical blocker or broken assumption')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((description: string, opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n🔬 Create Investigation\n'));

        const result = createInvestigation(cwd, description);

        if (!result.created) {
            console.log(chalk.red(`  ❌ ${result.error}\n`));
            process.exitCode = 1;
            return;
        }

        console.log(chalk.green(`  ✅ Created: ${result.id}`));
        console.log(`     Path: .devkit/${result.path}`);
        console.log('');

        if (result.adrSource) {
            console.log(`  🔗 Linked ADR: ${result.adrSource}`);
            console.log(`     Broken assumption: ${result.brokenAssumption}`);
            console.log('');
        } else {
            console.log(chalk.dim('  No ADR auto-linked. Check decisions/ manually.'));
            console.log('');
        }

        if (result.invariantsAtRisk.length > 0) {
            console.log('  Invariants at risk:');
            for (const inv of result.invariantsAtRisk) {
                console.log(`    ⚠️  ${inv}`);
            }
            console.log('');
        }

        console.log(chalk.dim('  Next: Fill Options and Decision in the Investigation file.'));
        console.log(chalk.dim(`  Then: devkit resolve-inv ${result.id} "Option A" "rationale"`));
        console.log('');
    });

// ────────────────────────────── INVESTIGATE LIST ──────────────────────────────
program
    .command('inv-list')
    .description('List all Investigations')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n🔬 Investigations\n'));

        const invs = listInvestigations(cwd);

        if (invs.length === 0) {
            console.log('  No Investigations found.');
            console.log(chalk.dim('  Create one: devkit investigate "description"'));
            console.log('');
            return;
        }

        for (const inv of invs) {
            const icon = inv.status === 'open' ? '🟡' : '✅';
            console.log(`  ${icon} ${inv.id}: ${inv.title.replace(`${inv.id}: `, '')} [${inv.status}]`);
        }
        console.log('');
    });

// ────────────────────────────── RESOLVE INVESTIGATION ──────────────────────────────
program
    .command('resolve-inv <id> <option> <rationale>')
    .description('Resolve an Investigation with chosen option and rationale')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((id: string, option: string, rationale: string, opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n🔬 Resolve Investigation\n'));

        const result = resolveInvestigation(cwd, id, option, rationale);

        if (!result.resolved) {
            console.log(chalk.red(`  ❌ ${result.error}\n`));
            process.exitCode = 1;
            return;
        }

        console.log(chalk.green(`  ✅ ${id} resolved!`));
        console.log(`     Chosen: ${option}`);
        console.log(`     Rationale: ${rationale}`);
        console.log('');
        console.log(chalk.dim('  Don\'t forget post-decision actions:'));
        console.log(chalk.dim('    devkit generate-constitution'));
        console.log(chalk.dim('    devkit sync'));
        console.log('');
    });

// ────────────────────────────── ESCALATE ──────────────────────────────
program
    .command('escalate <description>')
    .description('Create QA escalation with auto-level detection')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .option('-l, --level <level>', 'Force escalation level (speckit, archkit, productkit, researchkit)')
    .action((description: string, opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n🚨 QA Escalation\n'));

        const forceLevel = opts.level as EscalationLevel | undefined;
        const result = createEscalation(cwd, description, forceLevel);

        if (!result.created) {
            console.log(chalk.red(`  ❌ ${result.error}\n`));
            process.exitCode = 1;
            return;
        }

        const levelEmoji: Record<string, string> = {
            speckit: '🔧', archkit: '🏛️', productkit: '👤', researchkit: '🔬',
        };

        console.log(chalk.green(`  ✅ Created: ${result.id}`));
        console.log(`     Path:  .devkit/${result.path}`);
        console.log(`     Level: ${levelEmoji[result.level] ?? '?'} ${result.level}`);
        console.log(`     Why:   ${result.reason}`);
        console.log('');

        // Suggest next action based on level
        switch (result.level) {
            case 'speckit':
                console.log(chalk.dim('  Action: Fix the code to match the spec.'));
                break;
            case 'archkit':
                console.log(chalk.dim(`  Action: devkit investigate "${description}"`));
                break;
            case 'productkit':
                console.log(chalk.dim('  Action: Review .devkit/product/ux_invariants.md'));
                break;
            case 'researchkit':
                console.log(chalk.dim('  Action: Review .devkit/research/assumptions.md'));
                break;
        }
        console.log('');
    });

// ────────────────────────────── COVERAGE ──────────────────────────────
program
    .command('coverage')
    .description('Show invariant ↔ test coverage map')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n📊 Coverage Map\n'));

        const result = analyzeCoverage(cwd);
        console.log(formatCoverage(result));
    });

// ────────────────────────────── VALIDATE --WATCH ──────────────────────────────
program
    .command('watch')
    .description('Watch .devkit/ and re-validate on changes')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((opts) => {
        const cwd = opts.dir as string;
        watchValidate(cwd);
    });

// ────────────────────────────── DASHBOARD ──────────────────────────────
program
    .command('dashboard')
    .description('Open web dashboard with status, coverage, and escalations')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .option('-p, --port <port>', 'Port number', '3141')
    .action((opts) => {
        const cwd = opts.dir as string;
        const port = parseInt(opts.port as string, 10);
        startDashboard(cwd, port);
    });

// ────────────────────────────── SNAPSHOT ──────────────────────────────
program
    .command('snapshot')
    .description('Save a snapshot of current .devkit/ state for future diff')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n📸 Snapshot\n'));

        const snapshot = takeSnapshot(cwd);
        const fileName = saveSnapshot(cwd, snapshot);

        console.log(`  ✅ Saved: ${fileName}`);
        console.log(`     Phase: ${snapshot.phase}`);
        console.log(`     Files: ${Object.keys(snapshot.files).length}`);
        console.log(`     Invariants: ${snapshot.invariantCount} tech + ${snapshot.uxInvariantCount} UX`);
        console.log(`     Coverage: ${snapshot.coveragePercent}%`);
        console.log(`\n  Use "devkit diff" to compare with next snapshot.`);
        console.log('');
    });

// ────────────────────────────── SNAPSHOT LIST ──────────────────────────────
program
    .command('snapshot-list')
    .description('List all saved snapshots')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((opts) => {
        const cwd = opts.dir as string;
        const snapshots = listSnapshots(cwd);

        console.log(chalk.bold('\n📸 Snapshots\n'));

        if (snapshots.length === 0) {
            console.log('  No snapshots yet. Run "devkit snapshot" to save one.\n');
            return;
        }

        for (let i = 0; i < snapshots.length; i++) {
            const s = loadSnapshot(cwd, snapshots[i]!);
            const idx = chalk.dim(`[${i}]`);
            console.log(`  ${idx} ${snapshots[i]}`);
            console.log(`      Phase: ${s.phase} │ Files: ${Object.keys(s.files).length} │ Coverage: ${s.coveragePercent}%`);
        }
        console.log('');
    });

// ────────────────────────────── DIFF ──────────────────────────────
program
    .command('diff')
    .description('Compare two snapshots or last snapshot vs current state')
    .argument('[from]', 'Snapshot index or filename (default: last saved)')
    .argument('[to]', 'Snapshot index or filename (default: current state)')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action((fromArg, toArg, opts) => {
        const cwd = opts.dir as string;
        console.log(chalk.bold('\n🔍 Diff\n'));

        const snapshots = listSnapshots(cwd);

        let fromSnapshot: ReturnType<typeof takeSnapshot>;
        let toSnapshot: ReturnType<typeof takeSnapshot>;

        // Resolve FROM
        if (fromArg !== undefined) {
            const idx = parseInt(fromArg, 10);
            if (!isNaN(idx) && idx >= 0 && idx < snapshots.length) {
                fromSnapshot = loadSnapshot(cwd, snapshots[idx]!);
            } else if (snapshots.includes(fromArg)) {
                fromSnapshot = loadSnapshot(cwd, fromArg);
            } else {
                console.log(`  ❌ Snapshot not found: ${fromArg}`);
                console.log('  Run "devkit snapshot-list" to see available snapshots.\n');
                return;
            }
        } else if (snapshots.length > 0) {
            fromSnapshot = loadSnapshot(cwd, snapshots[snapshots.length - 1]!);
        } else {
            console.log('  ❌ No snapshots found. Run "devkit snapshot" first.\n');
            return;
        }

        // Resolve TO
        if (toArg !== undefined) {
            const idx = parseInt(toArg, 10);
            if (!isNaN(idx) && idx >= 0 && idx < snapshots.length) {
                toSnapshot = loadSnapshot(cwd, snapshots[idx]!);
            } else if (snapshots.includes(toArg)) {
                toSnapshot = loadSnapshot(cwd, toArg);
            } else {
                console.log(`  ❌ Snapshot not found: ${toArg}`);
                return;
            }
        } else {
            // Default: current state
            toSnapshot = takeSnapshot(cwd);
        }

        const result = diffSnapshots(fromSnapshot, toSnapshot);
        console.log(formatDiff(result));
    });

// ────────────────────────────── HELP (progressive disclosure) ──────────────────────────────
function getPhaseCommands(phase: Phase): string[] {
    const always = ['status', 'validate', 'gate', 'advance', 'coverage', 'dashboard', 'snapshot', 'diff'];

    const phaseSpecific: Record<Phase, string[]> = {
        research: [],
        product: [],
        arch: ['generate-constitution', 'impact "..."', 'rfc "..."', 'investigate "..."'],
        spec: ['sync', 'impact "..."', 'rfc "..."', 'investigate "..."'],
        qa: ['escalate "..."', 'rfc-list', 'inv-list'],
    };

    return [...always, ...phaseSpecific[phase]!];
}

program.parse();
