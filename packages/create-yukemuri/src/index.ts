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

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
);

program
  .name('create-yukemari')
  .description('Create a new Yukemari application')
  .version(packageJson.version)
  .argument('[project-name]', 'Name of the project to create')
  .option('-t, --template <template>', 'Template to use', 'base')
  .action(async (projectName?: string, options?: { template?: string }) => {
    await createProject(projectName, options);
  });

async function createProject(
  projectName?: string, 
  options: { template?: string } = {}
) {
  try {
    // プロジェクト名を取得
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Project name:',
          default: 'my-yukemari-app',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Project name is required';
            }
            if (!/^[a-z0-9-_]+$/.test(input)) {
              return 'Project name must contain only lowercase letters, numbers, hyphens, and underscores';
            }
            return true;
          },
        },
      ]);
      projectName = answers.name;
    }

    const projectPath = path.resolve(process.cwd(), projectName!);
    
    // ディレクトリが既に存在するかチェック
    if (fs.existsSync(projectPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Directory ${projectName} already exists. Overwrite?`,
          default: false,
        },
      ]);
      
      if (!overwrite) {
        console.log(chalk.yellow('Operation cancelled.'));
        process.exit(0);
      }
      
      fs.removeSync(projectPath);
    }

    const spinner = ora(chalk.blue(`Creating ${projectName}...`)).start();

    try {
      // プロジェクトディレクトリを作成
      fs.ensureDirSync(projectPath);

      // テンプレートファイルをコピー
      const templatePath = path.join(__dirname, '../templates', options.template || 'base');
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template "${options.template}" not found`);
      }

      // テンプレートをコピー
      fs.copySync(templatePath, projectPath);

      // package.jsonを更新
      const pkgJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = fs.readJsonSync(pkgJsonPath);
        pkgJson.name = projectName;
        fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 });
      }

      spinner.succeed(chalk.green(`Project ${projectName} created successfully!`));

      // 次のステップを表示
      console.log('\nNext steps:');
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan('  npm install'));
      console.log(chalk.cyan('  npm run dev'));
      console.log('\nHappy coding! ♨️');

    } catch (error) {
      spinner.fail(chalk.red('Failed to create project'));
      throw error;
    }

  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

program.parse();