#!/usr/bin/env node

import { program } from "commander"
import chalk from "chalk"
import ora from "ora"
import inquirer from "inquirer"
import fs from "fs/promises"
import { readFileSync } from "fs"
import path from "path"

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
  const iconsDir = path.join(projectPath, "public", "icons")
  await fs.mkdir(iconsDir, { recursive: true })

  const iconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#3b82f6"/>
  <g transform="translate(256, 256)">
    <!-- Steam -->
    <path d="M-80 -60 Q-80 -80 -60 -80 Q-40 -80 -40 -60 Q-40 -40 -60 -40 Q-80 -40 -80 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M-20 -60 Q-20 -80 0 -80 Q20 -80 20 -60 Q20 -40 0 -40 Q-20 -40 -20 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M40 -60 Q40 -80 60 -80 Q80 -80 80 -60 Q80 -40 60 -40 Q40 -40 40 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <!-- Hot spring pool -->
    <ellipse cx="0" cy="20" rx="120" ry="80" fill="white"/>
    <ellipse cx="0" cy="10" rx="100" ry="60" fill="#3b82f6"/>
  </g>
</svg>`

  const iconSizes = [
    "72x72",
    "96x96",
    "128x128",
    "144x144",
    "152x152",
    "192x192",
    "384x384",
    "512x512",
  ]

  for (const size of iconSizes) {
    const iconPath = path.join(iconsDir, `icon-${size}.svg`)
    await fs.writeFile(iconPath, iconSvg)
  }

  // Generate main icon file as well
  await fs.writeFile(path.join(iconsDir, "icon.svg"), iconSvg)

  console.log("✔ Generated PWA icon files")
}
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const packageJson = JSON.parse(readFileSync(path.join(__dirname, "../package.json"), "utf-8"))

program
  .name("create-yukemuri")
  .description("Create a new Yukemuri application")
  .version("0.1.0")
  .argument("[name]", "project name")
  .action(async (name?: string) => {
    let projectName = name

    // If no project name provided, prompt for it
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "What is your project name?",
          default: "my-yukemuri-app",
          validate: (input: string) => {
            if (!input.trim()) return "Project name is required"
            if (!/^[a-z0-9-_]+$/.test(input))
              return "Project name should only contain lowercase letters, numbers, hyphens, and underscores"
            return true
          },
        },
      ])
      projectName = answers.projectName
    }

    // At this point projectName is guaranteed to be a string
    const finalProjectName = projectName as string

    // Validate project name format
    if (!/^[a-z0-9-_]+$/.test(finalProjectName)) {
      console.error(
        chalk.red(
          "Error: Project name should only contain lowercase letters, numbers, hyphens, and underscores"
        )
      )
      process.exit(1)
    }

    const spinner = ora("Creating Yukemuri project...").start()

    try {
      await createProject(finalProjectName)
      spinner.succeed(chalk.green(`Project ${finalProjectName} created successfully! ♨️`))

      console.log()
      console.log(chalk.cyan("Next steps:"))
      console.log(chalk.gray(`  cd ${finalProjectName}`))
      console.log(chalk.gray("  npm install"))
      console.log(chalk.gray("  npm run dev"))
      console.log()
      console.log(chalk.yellow("Happy coding! ♨️"))
    } catch (error) {
      spinner.fail(chalk.red("Failed to create project"))
      console.error(error)
      process.exit(1)
    }
  })

async function createProject(projectName: string) {
  const projectPath = path.join(process.cwd(), projectName)
  const templatePath = path.join(__dirname, "../templates/base")

  try {
    // Create project directory
    await fs.mkdir(projectPath, { recursive: true })

    // Copy template files
    await copyDirectory(templatePath, projectPath)

    // Update project name in package.json
    const packageJsonPath = path.join(projectPath, "package.json")
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"))
    packageJson.name = projectName
    packageJson.description = `A Yukemuri application - ${projectName}`
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

    // Update README.md with project name
    const readmePath = path.join(projectPath, "README.md")
    let readmeContent = await fs.readFile(readmePath, "utf-8")
    readmeContent = readmeContent.replace(/# Yukemuri Application ♨️/, `# ${projectName} ♨️`)
    readmeContent = readmeContent.replace(
      /This is a new PWA built with Yukemuri framework/,
      `${projectName} is a PWA built with Yukemuri framework`
    )
    await fs.writeFile(readmePath, readmeContent)

    // Update manifest.json if it exists
    const manifestPath = path.join(projectPath, "public/manifest.json")
    try {
      const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"))
      const displayName = projectName
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      manifest.name = displayName
      manifest.short_name = displayName.substring(0, 12)
      manifest.description = `${displayName} - A Yukemuri Application`
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    } catch {
      // manifest.json might not exist yet, that's okay
    }

    // Generate biome.json configuration
    const biomeConfig = {
      $schema: "https://biomejs.dev/schemas/2.3.6/schema.json",
      files: {
        includes: [
          "*.{ts,tsx,js,jsx,json,md}",
          "src/**/*.{ts,tsx,js,jsx,json,md}",
          "app/**/*.{ts,tsx,js,jsx,json,md}",
        ],
        ignoreUnknown: true,
      },
      vcs: {
        enabled: true,
        clientKind: "git",
        useIgnoreFile: true,
      },
      linter: {
        enabled: true,
        rules: {
          recommended: true,
          complexity: {
            noStaticOnlyClass: "warn",
          },
        },
      },
      formatter: {
        enabled: true,
        indentStyle: "space",
        indentWidth: 2,
        lineWidth: 100,
      },
      javascript: {
        formatter: {
          semicolons: "asNeeded",
          trailingCommas: "es5",
          arrowParentheses: "asNeeded",
          bracketSpacing: true,
          jsxQuoteStyle: "double",
        },
      },
      json: {
        formatter: {
          trailingCommas: "none",
        },
      },
    }

    const biomeJsonPath = path.join(projectPath, "biome.json")
    await fs.writeFile(biomeJsonPath, JSON.stringify(biomeConfig, null, 2))
    console.log("✔ Generated biome.json")

    // Generate icon files
    await generateIconFiles(projectPath)

    // Setup Git hooks
    const { exec } = await import("child_process")
    const { promisify } = await import("util")
    const execAsync = promisify(exec)

    try {
      process.chdir(projectPath)
      await execAsync("git config core.hooksPath .githooks")
      console.log("✔ Git hooks configured")
    } catch {
      // Git not initialized yet, that's okay
    }

    console.log(`✔ Project ${projectName} created successfully!`)
    console.log("")
    console.log("Next steps:")
    console.log(`  cd ${projectName}`)
    console.log("  npm install")
    console.log("  git config core.hooksPath .githooks  (if not auto-configured)")
    console.log("  npm run dev")
    console.log("")
    console.log("Happy coding! ♨️")
  } catch (error) {
    console.error("Error creating project:", error)
    process.exit(1)
  }
}
program.parse()
