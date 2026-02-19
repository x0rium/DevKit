import { watch } from 'chokidar';
import { join, relative } from 'node:path';
import chalk from 'chalk';
import { validateArtifacts, formatValidation } from './validator.js';

export function watchValidate(cwd: string): void {
    const devkitDir = join(cwd, '.devkit');

    console.log(chalk.bold('\n👁️  Watch Mode — Validating on file changes\n'));
    console.log(chalk.dim(`  Watching: ${devkitDir}/**/*.md`));
    console.log(chalk.dim('  Press Ctrl+C to stop.\n'));

    // Run initial validation
    runValidation(cwd);

    // Watch .devkit/ for changes
    const watcher = watch(join(devkitDir, '**/*.md'), {
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 300,
            pollInterval: 100,
        },
    });

    watcher.on('change', (filePath) => {
        const rel = relative(cwd, filePath);
        console.log(chalk.cyan(`\n  📝 Changed: ${rel}`));
        runValidation(cwd);
    });

    watcher.on('add', (filePath) => {
        const rel = relative(cwd, filePath);
        console.log(chalk.green(`\n  ➕ Added: ${rel}`));
        runValidation(cwd);
    });

    watcher.on('unlink', (filePath) => {
        const rel = relative(cwd, filePath);
        console.log(chalk.red(`\n  ➖ Removed: ${rel}`));
        runValidation(cwd);
    });
}

function runValidation(cwd: string): void {
    const time = new Date().toLocaleTimeString();
    console.log(chalk.dim(`  ─── ${time} ───`));

    const result = validateArtifacts(cwd);
    console.log(formatValidation(result));

    if (result.errors.length === 0) {
        console.log(chalk.green('  ✅ All clear!'));
    } else {
        console.log(chalk.red(`  ❌ ${result.errors.length} error(s)`));
    }
}
