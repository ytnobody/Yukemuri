import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';

interface ServerOptions {
  port: string;
  host: string;
  open?: boolean;
  https?: boolean;
}

interface BuildOptions {
  analyze?: boolean;
  watch?: boolean;
}

interface DeployOptions {
  platform: string;
  env: string;
}

interface TestOptions {
  watch?: boolean;
  coverage?: boolean;
  ui?: boolean;
}

interface LintOptions {
  fix?: boolean;
}

interface TypecheckOptions {
  watch?: boolean;
}

interface GenerateTypesOptions {
  api?: boolean;
  db?: boolean;
}

interface CleanOptions {
  cache?: boolean;
}

export class DevCommands {
  /**
   * Start development server
   */
  static server(): Command {
    return new Command('server')
      .alias('dev')
      .description('Start development server')
      .option('-p, --port <port>', 'Port to run on', '3000')
      .option('-h, --host <host>', 'Host to bind to', 'localhost')
      .option('--open', 'Open browser automatically')
      .option('--https', 'Use HTTPS')
      .action(async (options: ServerOptions) => {
        console.log(chalk.blue('🚀 Starting Yukemuri development server...'));
        
        try {
          const args = ['run', 'dev'];
          
          // Set environment variables
          const env = {
            ...process.env,
            PORT: options.port,
            HOST: options.host,
            HTTPS: options.https ? 'true' : undefined
          };
          
          console.log(chalk.gray(`📡 Server will be available at http${options.https ? 's' : ''}://${options.host}:${options.port}`));
          
          // Start development server
          const child = execa('npm', args, {
            env: env as Record<string, string>,
            stdio: 'inherit'
          });
          
          // Open browser if requested
          if (options.open) {
            setTimeout(() => {
              const url = `http${options.https ? 's' : ''}://${options.host}:${options.port}`;
              execa('open', [url]).catch(() => {
                console.log(chalk.gray(`💡 Open ${url} in your browser`));
              });
            }, 2000);
          }
          
          await child;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error(chalk.red(`❌ Failed to start server: ${message}`));
        }
      });
  }

  /**
   * Build for production
   */
  static build(): Command {
    return new Command('build')
      .description('Build for production')
      .option('--analyze', 'Analyze bundle size')
      .option('--watch', 'Watch for changes')
      .action(async (options: BuildOptions) => {
        const spinner = ora('Building for production...').start();
        
        try {
          const args = ['run', 'build'];
          
          if (options.watch) {
            args.push('--', '--watch');
          }
          
          const env = { ...process.env };
          
          if (options.analyze) {
            env.ANALYZE = 'true';
          }
          
          await execa('npm', args, { env: env as Record<string, string>, stdio: 'inherit' });
          
          spinner.succeed('Build completed successfully!');
          
          console.log(chalk.green('✅ Production build ready!'));
          console.log(chalk.gray('📁 Output: dist/'));
          
          if (options.analyze) {
            console.log(chalk.blue('📊 Bundle analysis available'));
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          spinner.fail(`Build failed: ${message}`);
        }
      });
  }

  /**
   * Deploy to production
   */
  static deploy(): Command {
    return new Command('deploy')
      .description('Deploy to production')
      .option('-p, --platform <platform>', 'Deployment platform', 'cloudflare')
      .option('--env <env>', 'Environment to deploy to', 'production')
      .action(async (options: DeployOptions) => {
        console.log(chalk.blue(`🚀 Deploying to ${options.platform}...`));
        
        // First build for production
        const buildSpinner = ora('Building for production...').start();
        try {
          await execa('npm', ['run', 'build'], { stdio: 'pipe' });
          buildSpinner.succeed('Build completed');
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          buildSpinner.fail(`Build failed: ${message}`);
          return;
        }
        
        // Deploy based on platform
        const deploySpinner = ora(`Deploying to ${options.platform}...`).start();
        try {
          switch (options.platform) {
            case 'cloudflare':
              await this.deployCloudflare(options);
              break;
            case 'vercel':
              await this.deployVercel(options);
              break;
            case 'netlify':
              await this.deployNetlify(options);
              break;
            default:
              throw new Error(`Unsupported platform: ${options.platform}`);
          }
          
          deploySpinner.succeed('Deployment completed successfully!');
          console.log(chalk.green('✅ Your app is now live!'));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          deploySpinner.fail(`Deployment failed: ${message}`);
        }
      });
  }

  /**
   * Run tests
   */
  static test(): Command {
    return new Command('test')
      .description('Run tests')
      .option('--watch', 'Watch for changes')
      .option('--coverage', 'Generate coverage report')
      .option('--ui', 'Run tests with UI')
      .action(async (options: TestOptions) => {
        console.log(chalk.blue('🧪 Running tests...'));
        
        try {
          const args = ['run', 'test'];
          
          if (options.watch) {
            args.push('--', '--watch');
          }
          
          if (options.coverage) {
            args.push('--', '--coverage');
          }
          
          if (options.ui) {
            args.push('--', '--ui');
          }
          
          await execa('npm', args, { stdio: 'inherit' });
          
          console.log(chalk.green('✅ Tests completed!'));
          
          if (options.coverage) {
            console.log(chalk.gray('📊 Coverage report: coverage/index.html'));
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error(chalk.red(`❌ Tests failed: ${message}`));
        }
      });
  }

  /**
   * Lint code
   */
  static lint(): Command {
    return new Command('lint')
      .description('Lint code')
      .option('--fix', 'Automatically fix issues')
      .action(async (options: LintOptions) => {
        console.log(chalk.blue('🔍 Linting code...'));
        
        try {
          const args = ['run', 'lint'];
          
          if (options.fix) {
            args.push('--', '--fix');
          }
          
          await execa('npm', args, { stdio: 'inherit' });
          
          console.log(chalk.green('✅ Linting completed!'));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error(chalk.red(`❌ Linting failed: ${message}`));
        }
      });
  }

  /**
   * Type check
   */
  static typecheck(): Command {
    return new Command('typecheck')
      .alias('tsc')
      .description('Run TypeScript type checking')
      .option('--watch', 'Watch for changes')
      .action(async (options: TypecheckOptions) => {
        console.log(chalk.blue('🔍 Type checking...'));
        
        try {
          const args = ['run', 'typecheck'];
          
          if (options.watch) {
            args.push('--', '--watch');
          }
          
          await execa('npm', args, { stdio: 'inherit' });
          
          console.log(chalk.green('✅ Type checking completed!'));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error(chalk.red(`❌ Type errors found: ${message}`));
        }
      });
  }

  /**
   * Generate types
   */
  static generateTypes(): Command {
    return new Command('generate-types')
      .alias('gen-types')
      .description('Generate TypeScript types')
      .option('--api', 'Generate API types')
      .option('--db', 'Generate database types')
      .action(async (options: GenerateTypesOptions) => {
        console.log(chalk.blue('⚡ Generating types...'));
        
        const spinner = ora('Analyzing codebase...').start();
        
        try {
          if (options.api) {
            await this.generateApiTypes();
            spinner.text = 'Generating API types...';
          }
          
          if (options.db) {
            await this.generateDatabaseTypes();
            spinner.text = 'Generating database types...';
          }
          
          spinner.succeed('Types generated successfully!');
          console.log(chalk.green('✅ TypeScript types updated!'));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          spinner.fail(`Type generation failed: ${message}`);
        }
      });
  }

  /**
   * Clean build artifacts
   */
  static clean(): Command {
    return new Command('clean')
      .description('Clean build artifacts')
      .option('--cache', 'Also clear cache')
      .action(async (options: CleanOptions) => {
        const spinner = ora('Cleaning build artifacts...').start();
        
        try {
          // Remove common build directories
          const dirsToClean = ['dist', 'build', '.yukemuri'];
          
          for (const dir of dirsToClean) {
            if (await fs.pathExists(dir)) {
              await fs.remove(dir);
            }
          }
          
          if (options.cache) {
            // Clear cache directories
            const cacheDirs = ['node_modules/.cache', '.next', '.nuxt'];
            for (const dir of cacheDirs) {
              if (await fs.pathExists(dir)) {
                await fs.remove(dir);
              }
            }
          }
          
          spinner.succeed('Cleanup completed!');
          console.log(chalk.green('✅ Build artifacts cleaned!'));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          spinner.fail(`Cleanup failed: ${message}`);
        }
      });
  }

  // Helper methods
  private static async deployCloudflare(options: DeployOptions): Promise<void> {
    // Check for wrangler.toml
    const wranglerConfig = path.join(process.cwd(), 'wrangler.toml');
    if (!(await fs.pathExists(wranglerConfig))) {
      throw new Error('wrangler.toml not found. Run "wrangler init" first.');
    }
    
    await execa('npx', ['wrangler', 'deploy'], { stdio: 'inherit' });
  }

  private static async deployVercel(options: DeployOptions): Promise<void> {
    const args = ['vercel'];
    
    if (options.env === 'production') {
      args.push('--prod');
    }
    
    await execa('npx', args, { stdio: 'inherit' });
  }

  private static async deployNetlify(options: DeployOptions): Promise<void> {
    const args = ['netlify', 'deploy'];
    
    if (options.env === 'production') {
      args.push('--prod');
    }
    
    args.push('--dir', 'dist');
    
    await execa('npx', args, { stdio: 'inherit' });
  }

  private static async generateApiTypes(): Promise<void> {
    // Generate TypeScript types from API routes
    console.log(chalk.gray('  Generating API types...'));
    // Implementation would analyze API routes and generate types
  }

  private static async generateDatabaseTypes(): Promise<void> {
    // Generate TypeScript types from database schema
    console.log(chalk.gray('  Generating database types...'));
    // Implementation would use database schema to generate types
  }
}