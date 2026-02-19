import { watch } from 'chokidar';
import { join } from 'node:path';
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

    watcher.on('change', (path) => {
        const relative = path.replace(cwd + '/', '');
        console.log(chalk.cyan(`\n  📝 Changed: ${relative}`));
        runValidation(cwd);
    });

    watcher.on('add', (path) => {
        const relative = path.replace(cwd + '/', '');
        console.log(chalk.green(`\n  ➕ Added: ${relative}`));
        runValidation(cwd);
    });

    watcher.on('unlink', (path) => {
        const relative = path.replace(cwd + '/', '');
        console.log(chalk.red(`\n  ➖ Removed: ${relative}`));
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
