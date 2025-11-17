import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import inquirer, { type QuestionCollection } from "inquirer"
import { execa } from "execa"
import fs from "fs-extra"
import path from "path"

interface ListOptions {
  verbose?: boolean
}

interface AddOptions {
  dev?: boolean
  noConfig?: boolean
}

interface PluginInfo {
  name: string
  version: string
  description?: string
  dependencies?: string[]
}

interface PluginPackageInfo {
  name: string
  version: string
  description?: string
  author?: string
  license?: string
  homepage?: string
}

interface InquirerAnswers {
  name: string
  description: string
  author: string
  template: string
}

interface SearchResult {
  name: string
  version: string
  description?: string
  downloads?: string
}

interface PackageJsonData {
  dependencies?: Record<string, unknown>
  devDependencies?: Record<string, unknown>
  [key: string]: unknown
}

export class PluginCommands {
  /**
   * List installed plugins
   */
  static list(): Command {
    return new Command("list")
      .alias("ls")
      .description("List installed plugins")
      .option("-v, --verbose", "Show detailed plugin information")
      .action(async (options: ListOptions) => {
        console.log(chalk.blue("📦 Installed Yukemuri Plugins:"))

        try {
          const plugins = await PluginCommands.getInstalledPlugins()

          if (plugins.length === 0) {
            console.log(chalk.gray("  No plugins installed"))
            return
          }

          for (const plugin of plugins) {
            if (options.verbose) {
              console.log(chalk.green(`  ✓ ${plugin.name}@${plugin.version}`))
              console.log(chalk.gray(`    ${plugin.description || "No description"}`))
              if (plugin.dependencies?.length) {
                console.log(chalk.gray(`    Dependencies: ${plugin.dependencies.join(", ")}`))
              }
              console.log()
            } else {
              console.log(chalk.green(`  ✓ ${plugin.name}@${plugin.version}`))
            }
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error"
          console.error(chalk.red(`❌ Error listing plugins: ${message}`))
        }
      })
  }

  /**
   * Add/install a plugin
   */
  static add(): Command {
    return new Command("add")
      .alias("install")
      .description("Install a Yukemuri plugin")
      .argument("<plugin>", "Plugin name or package")
      .option("-D, --dev", "Install as dev dependency")
      .option("--no-config", "Skip configuration setup")
      .action(async (plugin: string, options: AddOptions) => {
        const spinner = ora(`Installing plugin: ${plugin}`).start()

        try {
          // Install npm package
          const installArgs = ["install", plugin]
          if (options.dev) {
            installArgs.push("--save-dev")
          }

          await execa("npm", installArgs)
          spinner.succeed(`Plugin ${plugin} installed successfully`)

          // Setup configuration if needed
          if (!options.noConfig) {
            await PluginCommands.setupPluginConfig(plugin)
          }

          console.log(chalk.green(`✅ Plugin ${plugin} ready to use!`))
          console.log(chalk.gray(`💡 Add it to your Yukemuri config to activate`))
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error"
          spinner.fail(`Failed to install plugin: ${message}`)
        }
      })
  }

  /**
   * Remove/uninstall a plugin
   */
  static remove(): Command {
    return new Command("remove")
      .alias("uninstall")
      .description("Remove a Yukemuri plugin")
      .argument("<plugin>", "Plugin name")
      .action(async (plugin: string) => {
        const spinner = ora(`Removing plugin: ${plugin}`).start()

        try {
          // Remove npm package
          await execa("npm", ["uninstall", plugin])
          spinner.succeed(`Plugin ${plugin} removed successfully`)

          console.log(chalk.yellow(`⚠️ Don't forget to remove ${plugin} from your Yukemuri config`))
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error"
          spinner.fail(`Failed to remove plugin: ${message}`)
        }
      })
  }

  /**
   * Show plugin information
   */
  static info(): Command {
    return new Command("info")
      .description("Show detailed information about a plugin")
      .argument("<plugin>", "Plugin name")
      .action(async (plugin: string) => {
        try {
          console.log(chalk.blue(`📋 Plugin Information: ${plugin}`))
          console.log()

          // Get plugin package.json
          const packageInfo = await PluginCommands.getPluginPackageInfo(plugin)

          if (packageInfo) {
            console.log(chalk.green("📦 Package Details:"))
            console.log(`  Name: ${packageInfo.name}`)
            console.log(`  Version: ${packageInfo.version}`)
            console.log(`  Description: ${packageInfo.description || "N/A"}`)
            console.log(`  Author: ${packageInfo.author || "N/A"}`)
            console.log(`  License: ${packageInfo.license || "N/A"}`)
            console.log(`  Homepage: ${packageInfo.homepage || "N/A"}`)
            console.log()
          }

          // Get plugin configuration schema
          const configSchema = await PluginCommands.getPluginConfigSchema(plugin)
          if (configSchema) {
            console.log(chalk.green("⚙️ Configuration Schema:"))
            PluginCommands.printConfigSchema(configSchema)
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error"
          console.error(chalk.red(`❌ Error getting plugin info: ${message}`))
        }
      })
  }

  /**
   * Search for plugins
   */
  static search(): Command {
    return new Command("search")
      .description("Search for Yukemuri plugins")
      .argument("<query>", "Search query")
      .option("-l, --limit <number>", "Limit number of results", "10")
      .action(async (query: string, options: { limit?: string }) => {
        console.log(chalk.blue(`🔍 Searching for plugins: ${query}`))

        try {
          const limit = parseInt(options.limit || "10", 10)
          // Search npm registry for yukemuri plugins
          const results = await PluginCommands.searchPlugins(query, limit)

          if (results.length === 0) {
            console.log(chalk.gray("No plugins found"))
            return
          }

          console.log(chalk.green(`Found ${results.length} plugins:`))
          console.log()

          for (const result of results) {
            console.log(chalk.green(`  📦 ${result.name}@${result.version}`))
            console.log(chalk.gray(`     ${result.description || "No description"}`))
            console.log(chalk.gray(`     Downloads: ${result.downloads || "N/A"}`))
            console.log()
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error"
          console.error(chalk.red(`❌ Error searching plugins: ${message}`))
        }
      })
  }

  /**
   * Create a new plugin
   */
  static create(): Command {
    return new Command("create")
      .description("Create a new Yukemuri plugin")
      .argument("[name]", "Plugin name")
      .option("-t, --template <template>", "Plugin template", "basic")
      .action(async (name: string | undefined, options: { template?: string }) => {
        console.log(chalk.blue("🛠️ Creating new Yukemuri plugin..."))

        const questions: QuestionCollection = [
          {
            type: "input",
            name: "name",
            message: "Plugin name:",
            default: name,
            validate: (input: string) => {
              if (!input) return "Plugin name is required"
              if (!/^[a-z0-9-_@/]+$/.test(input)) {
                return "Invalid plugin name format"
              }
              return true
            },
          },
          {
            type: "input",
            name: "description",
            message: "Plugin description:",
          },
          {
            type: "input",
            name: "author",
            message: "Author name:",
          },
          {
            type: "list",
            name: "template",
            message: "Plugin template:",
            choices: [
              { name: "Basic Plugin", value: "basic" },
              { name: "API Plugin (with routes)", value: "api" },
              { name: "Middleware Plugin", value: "middleware" },
              { name: "Client Plugin (with components)", value: "client" },
              { name: "Full Stack Plugin", value: "fullstack" },
            ],
            default: options.template,
          },
        ]

        // Get plugin details
        const answers = (await inquirer.prompt(questions)) as InquirerAnswers

        const spinner = ora("Generating plugin structure...").start()

        try {
          await PluginCommands.generatePlugin(answers)
          spinner.succeed("Plugin created successfully!")

          console.log(chalk.green(`✅ Plugin ${answers.name} created!`))
          console.log(chalk.gray(`📁 Location: ./${answers.name}`))
          console.log()
          console.log(chalk.blue("Next steps:"))
          console.log(chalk.gray(`  cd ${answers.name}`))
          console.log(chalk.gray("  npm install"))
          console.log(chalk.gray("  npm run dev"))
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error"
          spinner.fail(`Failed to create plugin: ${message}`)
        }
      })
  }

  // Helper methods
  private static async getInstalledPlugins(): Promise<PluginInfo[]> {
    // Read package.json and find yukemuri plugins
    const packagePath = path.join(process.cwd(), "package.json")
    const packageData = (await fs.readJson(packagePath)) as PackageJsonData

    const allDeps = {
      ...(packageData.dependencies || {}),
      ...(packageData.devDependencies || {}),
    }

    const plugins: PluginInfo[] = []
    for (const [name, version] of Object.entries(allDeps)) {
      if (name.startsWith("@yukemuri/plugin-") || name.startsWith("yukemuri-plugin-")) {
        plugins.push({
          name,
          version: String(version),
          // Could load more details from node_modules
        })
      }
    }

    return plugins
  }

  private static async setupPluginConfig(plugin: string): Promise<void> {
    // Interactive configuration setup
    console.log(chalk.blue(`⚙️ Setting up configuration for ${plugin}...`))
    // Implementation would depend on plugin's config schema
  }

  private static async getPluginPackageInfo(plugin: string): Promise<PluginPackageInfo | null> {
    try {
      const packagePath = path.join(process.cwd(), "node_modules", plugin, "package.json")
      return (await fs.readJson(packagePath)) as PluginPackageInfo
    } catch {
      return null
    }
  }

  private static async getPluginConfigSchema(plugin: string): Promise<unknown> {
    // Load plugin and get its config schema
    return null
  }

  private static printConfigSchema(schema: unknown): void {
    // Format and print configuration schema
    if (schema) {
      console.log("  Configuration options available")
    }
  }

  private static async searchPlugins(query: string, limit: number): Promise<SearchResult[]> {
    // Search npm registry for yukemuri plugins
    // This would use npm search API
    return []
  }

  private static async generatePlugin(options: InquirerAnswers): Promise<void> {
    const pluginDir = path.join(process.cwd(), options.name)

    // Create plugin directory structure
    await fs.ensureDir(pluginDir)
    await fs.ensureDir(path.join(pluginDir, "src"))
    await fs.ensureDir(path.join(pluginDir, "docs"))

    // Generate package.json
    const packageJson = {
      name: options.name,
      version: "1.0.0",
      description: options.description,
      main: "dist/index.js",
      types: "dist/index.d.ts",
      author: options.author,
      license: "MIT",
      scripts: {
        build: "tsc",
        dev: "tsc --watch",
        test: "jest",
      },
      dependencies: {
        "@yukemuri/core": "^1.0.0",
      },
      devDependencies: {
        typescript: "^5.0.0",
        jest: "^29.0.0",
      },
    }

    await fs.writeJson(path.join(pluginDir, "package.json"), packageJson, { spaces: 2 })

    // Generate TypeScript config
    const tsConfig = {
      compilerOptions: {
        target: "ES2020",
        module: "ESNext",
        moduleResolution: "node",
        strict: true,
        outDir: "dist",
        declaration: true,
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"],
    }

    await fs.writeJson(path.join(pluginDir, "tsconfig.json"), tsConfig, { spaces: 2 })

    // Generate plugin source based on template
    const pluginSource = PluginCommands.generatePluginSource(options)
    await fs.writeFile(path.join(pluginDir, "src", "index.ts"), pluginSource)

    // Generate README
    const readme = PluginCommands.generatePluginReadme(options)
    await fs.writeFile(path.join(pluginDir, "README.md"), readme)
  }

  private static generatePluginSource(options: InquirerAnswers): string {
    return `import { createPlugin } from '@yukemuri/core';

export default createPlugin({
  name: '${options.name}',
  version: '1.0.0',
  description: '${options.description}',
  author: '${options.author}',
  
  init: async (context) => {
    context.logger.info('${options.name} plugin initialized');
  }
});
`
  }

  private static generatePluginReadme(options: InquirerAnswers): string {
    return `# ${options.name}

${options.description}

## Installation

\`\`\`bash
npm install ${options.name}
\`\`\`

## Usage

\`\`\`typescript
import { Yukemuri } from '@yukemuri/core';
import ${options.name.replace(/[^a-zA-Z0-9]/g, "")} from '${options.name}';

const app = new Yukemuri();
app.use(${options.name.replace(/[^a-zA-Z0-9]/g, "")});
\`\`\`

## License

MIT
`
  }
}
