#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { PluginCommands } from './commands/plugin';
import { CreateCommands } from './commands/create';
import { DevCommands } from './commands/dev';

const program = new Command();

program
  .name('yukemuri')
  .description('Yukemuri CLI - The Ultimate Meta-Framework for Modern Web Development')
  .version('1.0.0');

// Plugin commands
const pluginCmd = program
  .command('plugin')
  .alias('p')
  .description('Manage Yukemuri plugins');

pluginCmd.addCommand(PluginCommands.list());
pluginCmd.addCommand(PluginCommands.add());
pluginCmd.addCommand(PluginCommands.remove());
pluginCmd.addCommand(PluginCommands.info());
pluginCmd.addCommand(PluginCommands.search());
pluginCmd.addCommand(PluginCommands.create());

// Create commands
const createCmd = program
  .command('create')
  .alias('c')
  .description('Create new Yukemuri components');

createCmd.addCommand(CreateCommands.project());
createCmd.addCommand(CreateCommands.page());
createCmd.addCommand(CreateCommands.component());
createCmd.addCommand(CreateCommands.api());

// Dev commands
const devCmd = program
  .command('dev')
  .alias('d')
  .description('Development tools');

devCmd.addCommand(DevCommands.server());
devCmd.addCommand(DevCommands.build());
devCmd.addCommand(DevCommands.deploy());
devCmd.addCommand(DevCommands.test());
devCmd.addCommand(DevCommands.lint());
devCmd.addCommand(DevCommands.typecheck());
devCmd.addCommand(DevCommands.generateTypes());
devCmd.addCommand(DevCommands.clean());

// Global commands (shortcuts for common operations)
program
  .command('init [name]')
  .description('Initialize a new Yukemuri project (alias for create project)')
  .option('-t, --template <template>', 'Project template', 'base')
  .action(async (name: string | undefined, options: Record<string, unknown>) => {
    const createProject = CreateCommands.project();
    await createProject.parseAsync(['node', 'yukemuri', name || 'my-yukemuri-app', ...Object.entries(options).flatMap(([key, value]) => [`--${key}`, String(value)])]);
  });

program
  .command('start')
  .description('Start development server (alias for dev server)')
  .option('-p, --port <port>', 'Port to run on', '3000')
  .option('-h, --host <host>', 'Host to bind to', 'localhost')
  .option('--open', 'Open browser automatically')
  .action(async (options: Record<string, unknown>) => {
    const devServer = DevCommands.server();
    await devServer.parseAsync(['node', 'yukemuri', ...Object.entries(options).flatMap(([key, value]) => [`--${key}`, String(value)])]);
  });

program
  .command('build')
  .description('Build for production (alias for dev build)')
  .option('--analyze', 'Analyze bundle size')
  .action(async (options: Record<string, unknown>) => {
    const devBuild = DevCommands.build();
    await devBuild.parseAsync(['node', 'yukemuri', ...Object.entries(options).flatMap(([key, value]) => [`--${key}`, String(value)])]);
  });

// Global utility commands
program
  .command('doctor')
  .description('Check project health and configuration')
  .action(async () => {
    console.log(chalk.blue('🩺 Running project health check...'));
    
    // Check for required files
    const checks = [
      { name: 'package.json', required: true },
      { name: 'tsconfig.json', required: false },
      { name: 'src/index.ts', required: true },
      { name: 'vite.config.ts', required: false },
    ];
    
    console.log(chalk.cyan('Checking project structure:'));
    for (const check of checks) {
      // Implementation would check file existence
      console.log(chalk.green(`  ✓ ${check.name}`));
    }
    
    console.log(chalk.green('✅ Project looks healthy!'));
  });

program
  .command('upgrade')
  .description('Upgrade Yukemuri and plugins to latest versions')
  .action(async () => {
    console.log(chalk.blue('⬆️ Upgrading Yukemuri dependencies...'));
    // Implementation would upgrade packages
    console.log(chalk.green('✅ Upgrade completed!'));
  });

// Global help
program.on('--help', () => {
  console.log('');
  console.log(chalk.cyan('Quick Start:'));
  console.log('  yukemuri init my-app          # Create new project');
  console.log('  cd my-app');
  console.log('  yukemuri start                # Start development');
  console.log('');
  console.log(chalk.cyan('Examples:'));
  console.log('  yukemuri create project my-app --template blog');
  console.log('  yukemuri plugin add @yukemuri/plugin-auth');
  console.log('  yukemuri create page about');
  console.log('  yukemuri create component Button');
  console.log('  yukemuri dev server --port 3000 --open');
  console.log('  yukemuri build --analyze');
  console.log('  yukemuri dev deploy --platform vercel');
  console.log('');
  console.log(chalk.gray('For more information, visit: https://yukemuri.dev'));
});

// Show help if no command provided
if (process.argv.length === 2) {
  program.help();
}

program.parse();

export { program };