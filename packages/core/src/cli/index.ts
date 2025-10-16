#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// パッケージ情報を読み込み
const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

program
  .name('yukemuri')
  .description('Yukemuri CLI - Internet edge framework for PWAs')
  .version(packageJson.version);

// add コマンド - プラグインを追加
program
  .command('add <plugin>')
  .description('Add a plugin to your Yukemuri project')
  .option('-c, --config <config>', 'Plugin configuration')
  .action(async (plugin: string, options: { config?: string }) => {
    await addPlugin(plugin, options);
  });

// dev コマンド - 開発サーバー起動
program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port number', '3000')
  .action(async (options: { port?: string }) => {
    await startDev(options);
  });

// build コマンド - プロジェクトビルド
program
  .command('build')
  .description('Build the project')
  .option('-o, --output <output>', 'Output directory', 'dist')
  .action(async (options: { output?: string }) => {
    await buildProject(options);
  });

// deploy コマンド - デプロイ
program
  .command('deploy')
  .description('Deploy to Cloudflare Workers')
  .option('--env <env>', 'Environment', 'production')
  .action(async (options: { env?: string }) => {
    await deployProject(options);
  });

/**
 * プラグインを追加する
 */
async function addPlugin(pluginName: string, options: { config?: string }) {
  const spinner = ora(chalk.blue(`Adding plugin ${pluginName}...`)).start();

  try {
    // package.jsonを読み込み
    const pkgPath = path.resolve('package.json');
    if (!fs.existsSync(pkgPath)) {
      throw new Error('package.json not found. Are you in a Yukemuri project?');
    }

    const pkg = fs.readJsonSync(pkgPath);

    // プラグインの依存関係を追加
    const pluginPackage = `@yukemuri/plugin-${pluginName}`;
    
    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies[pluginPackage] = 'latest';

    // package.jsonを更新
    fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });

    spinner.succeed(chalk.green(`Plugin ${pluginName} added successfully!`));
    
    console.log('\nNext steps:');
    console.log(chalk.cyan('  npm install'));
    console.log(chalk.cyan(`  # Configure ${pluginName} in your app`));

  } catch (error) {
    spinner.fail(chalk.red('Failed to add plugin'));
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

/**
 * 開発サーバーを起動する
 */
async function startDev(options: { port?: string }) {
  const port = parseInt(options.port || '3000');
  
  console.log(chalk.blue('Starting Yukemuri development server...'));
  
  try {
    // src/index.ts を実行
    const { spawn } = await import('child_process');
    
    const child = spawn('tsx', ['watch', 'src/index.ts'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: port.toString() }
    });

    child.on('error', (error) => {
      console.error(chalk.red('Failed to start development server:'), error);
    });

  } catch (error) {
    console.error(chalk.red('Error starting development server:'), error);
    process.exit(1);
  }
}

/**
 * プロジェクトをビルドする
 */
async function buildProject(options: { output?: string }) {
  const spinner = ora(chalk.blue('Building project...')).start();

  try {
    const { spawn } = await import('child_process');
    
    const child = spawn('tsc', [], {
      stdio: 'pipe'
    });

    let output = '';
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.stderr?.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(chalk.green('Build completed successfully!'));
      } else {
        spinner.fail(chalk.red('Build failed'));
        console.error(output);
        process.exit(1);
      }
    });

  } catch (error) {
    spinner.fail(chalk.red('Build failed'));
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

/**
 * Cloudflare Workersにデプロイする
 */
async function deployProject(options: { env?: string }) {
  const spinner = ora(chalk.blue('Deploying to Cloudflare Workers...')).start();

  try {
    const { spawn } = await import('child_process');
    
    const args = ['deploy'];
    if (options.env) {
      args.push('--env', options.env);
    }

    const child = spawn('wrangler', args, {
      stdio: 'pipe'
    });

    let output = '';
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.stderr?.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(chalk.green('Deployment completed successfully!'));
        console.log(output);
      } else {
        spinner.fail(chalk.red('Deployment failed'));
        console.error(output);
        process.exit(1);
      }
    });

  } catch (error) {
    spinner.fail(chalk.red('Deployment failed'));
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

program.parse();