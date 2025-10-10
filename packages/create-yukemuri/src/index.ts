#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import fs from 'fs/promises'
import { readFileSync } from 'fs'
import path from 'path'

async function copyDirectory(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

async function generateIconFiles(projectPath: string) {
  const iconsDir = path.join(projectPath, 'public', 'icons')
  await fs.mkdir(iconsDir, { recursive: true })

  const iconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#3b82f6"/>
  <g transform="translate(256, 256)">
    <!-- 湯気 -->
    <path d="M-80 -60 Q-80 -80 -60 -80 Q-40 -80 -40 -60 Q-40 -40 -60 -40 Q-80 -40 -80 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M-20 -60 Q-20 -80 0 -80 Q20 -80 20 -60 Q20 -40 0 -40 Q-20 -40 -20 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M40 -60 Q40 -80 60 -80 Q80 -80 80 -60 Q80 -40 60 -40 Q40 -40 40 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <!-- 温泉プール -->
    <ellipse cx="0" cy="20" rx="120" ry="80" fill="white"/>
    <ellipse cx="0" cy="10" rx="100" ry="60" fill="#3b82f6"/>
  </g>
</svg>`

  const iconSizes = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512']
  
  for (const size of iconSizes) {
    const iconPath = path.join(iconsDir, `icon-${size}.svg`)
    await fs.writeFile(iconPath, iconSvg)
  }

  // メインアイコンファイルも作成
  await fs.writeFile(path.join(iconsDir, 'icon.svg'), iconSvg)
  
  console.log('✔ Generated PWA icon files')
}
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

  const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
)

program
  .name('create-yukemari')
  .description('Create a new Yukemari application')
  .version(packageJson.version)
  .argument('[project-name]', 'Name of the project to create')
  .option('-t, --template <template>', 'Template to use', 'base')
  .action(async (projectName?: string, options?: { template?: string }) => {
  if (projectName) {
    await createProject(projectName);
  } else {
    console.error('Project name is required');
    process.exit(1);
  }
  });

async function createProject(projectName: string) {
  const projectPath = path.join(process.cwd(), projectName)
  const templatePath = path.join(__dirname, '../templates/base')

  try {
    // プロジェクトディレクトリを作成
    await fs.mkdir(projectPath, { recursive: true })
    
    // テンプレートファイルをコピー
    await copyDirectory(templatePath, projectPath)
    
    // package.jsonのプロジェクト名を更新
    const packageJsonPath = path.join(projectPath, 'package.json')
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
    packageJson.name = projectName
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
    
    // アイコンファイルを生成
    await generateIconFiles(projectPath)
    
    console.log(`✔ Project ${projectName} created successfully!`)
    console.log('')
    console.log('Next steps:')
    console.log(`  cd ${projectName}`)
    console.log('  npm install')
    console.log('  npm run dev')
    console.log('')
    console.log('Happy coding! ♨️')
  } catch (error) {
    console.error('Error creating project:', error)
    process.exit(1)
  }
}program.parse();