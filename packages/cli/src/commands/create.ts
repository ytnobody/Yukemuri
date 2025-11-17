import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import inquirer, { type QuestionCollection } from "inquirer"
import { execa } from "execa"
import fs from "fs-extra"
import path from "path"

interface ProjectOptions {
  template?: string
  install?: boolean
}

interface ProjectAnswers {
  name: string
  description: string
  template: string
  typescript: boolean
  features: string[]
}

interface PageOptions {
  route?: string
  layout?: string
}

interface ComponentOptions {
  story?: boolean
  test?: boolean
}

interface ApiOptions {
  methods?: string
}

interface PackageJsonData {
  name?: string
  description?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: unknown
}

export class CreateCommands {
  /**
   * Create a new Yukemuri project
   */
  static project(): Command {
    return new Command("project")
      .alias("app")
      .description("Create a new Yukemuri project")
      .argument("[name]", "Project name")
      .option("-t, --template <template>", "Project template", "base")
      .option("--no-install", "Skip npm install")
      .action(async (name: string | undefined, options: ProjectOptions) => {
        console.log(chalk.blue("🚀 Creating new Yukemuri project..."))

        const questions: QuestionCollection = [
          {
            type: "input",
            name: "name",
            message: "Project name:",
            default: name || "my-yukemuri-app",
            validate: (input: string) => {
              if (!input) return "Project name is required"
              if (!/^[a-z0-9-_]+$/.test(input)) {
                return "Project name must be lowercase alphanumeric with dashes/underscores"
              }
              return true
            },
          },
          {
            type: "input",
            name: "description",
            message: "Project description:",
            default: "A new Yukemuri application",
          },
          {
            type: "list",
            name: "template",
            message: "Project template:",
            choices: [
              { name: "Base Template (minimal setup)", value: "base" },
              { name: "Blog Template (with content management)", value: "blog" },
              { name: "E-commerce Template (with shopping features)", value: "ecommerce" },
              { name: "Dashboard Template (with admin features)", value: "dashboard" },
              { name: "API Template (backend only)", value: "api" },
            ],
            default: options.template,
          },
          {
            type: "confirm",
            name: "typescript",
            message: "Use TypeScript?",
            default: true,
          },
          {
            type: "checkbox",
            name: "features",
            message: "Select additional features:",
            choices: [
              { name: "Authentication (user login/signup)", value: "auth" },
              { name: "Database (SQLite with Drizzle)", value: "database" },
              { name: "Email (transactional emails)", value: "email" },
              { name: "File Upload (image/file handling)", value: "upload" },
              { name: "Analytics (user tracking)", value: "analytics" },
              { name: "PWA Features (offline support)", value: "pwa" },
            ],
          },
        ]

        // Get project details
        const answers = (await inquirer.prompt(questions)) as ProjectAnswers

        const spinner = ora("Generating project structure...").start()

        try {
          await CreateCommands.generateProject(answers, !options.install)
          spinner.succeed("Project created successfully!")

          console.log(chalk.green(`✅ Project ${answers.name} created!`))
          console.log(chalk.gray(`📁 Location: ./${answers.name}`))
          console.log()
          console.log(chalk.blue("Next steps:"))
          console.log(chalk.gray(`  cd ${answers.name}`))
          if (options.install) {
            console.log(chalk.gray("  npm install"))
          }
          console.log(chalk.gray("  npm run dev"))
          console.log()
          console.log(chalk.gray("📖 Visit http://localhost:3000 when ready!"))
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error"
          spinner.fail(`Failed to create project: ${message}`)
        }
      })
  }

  /**
   * Create a new page
   */
  static page(): Command {
    return new Command("page")
      .description("Create a new page")
      .argument("<name>", "Page name")
      .option("-r, --route <route>", "Custom route path")
      .option("-l, --layout <layout>", "Layout to use")
      .action(async (name: string, options: PageOptions) => {
        const spinner = ora(`Creating page: ${name}`).start()

        try {
          await CreateCommands.generatePage(name, options)
          spinner.succeed(`Page ${name} created successfully`)

          console.log(chalk.green(`✅ Page ${name} created!`))
          console.log(chalk.gray(`📁 Location: app/pages/${name}.tsx`))
          console.log(chalk.gray(`🌐 Route: /${options.route || name}`))
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error"
          spinner.fail(`Failed to create page: ${message}`)
        }
      })
  }

  /**
   * Create a new component
   */
  static component(): Command {
    return new Command("component")
      .alias("comp")
      .description("Create a new component")
      .argument("<name>", "Component name")
      .option("-s, --story", "Create Storybook story")
      .option("-t, --test", "Create test file")
      .action(async (name: string, options: ComponentOptions) => {
        const spinner = ora(`Creating component: ${name}`).start()

        try {
          await CreateCommands.generateComponent(name, options)
          spinner.succeed(`Component ${name} created successfully`)

          console.log(chalk.green(`✅ Component ${name} created!`))
          console.log(chalk.gray(`📁 Location: app/components/${name}.tsx`))
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error"
          spinner.fail(`Failed to create component: ${message}`)
        }
      })
  }

  /**
   * Create a new API route
   */
  static api(): Command {
    return new Command("api")
      .alias("route")
      .description("Create a new API route")
      .argument("<path>", "API path (e.g., /api/users)")
      .option("-m, --methods <methods>", "HTTP methods (comma-separated)", "GET,POST")
      .action(async (apiPath: string, options: ApiOptions) => {
        const spinner = ora(`Creating API route: ${apiPath}`).start()

        try {
          await CreateCommands.generateApiRoute(apiPath, options)
          spinner.succeed(`API route ${apiPath} created successfully`)

          console.log(chalk.green(`✅ API route ${apiPath} created!`))
          console.log(chalk.gray(`📁 Location: app/api/${apiPath}.ts`))
          console.log(chalk.gray(`🌐 Methods: ${options.methods}`))
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error"
          spinner.fail(`Failed to create API route: ${message}`)
        }
      })
  }

  // Helper methods
  private static async generateProject(
    options: ProjectAnswers,
    skipInstall: boolean
  ): Promise<void> {
    const projectDir = path.join(process.cwd(), options.name)

    // Clone template from create-yukemuri package
    const templatePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "create-yukemuri",
      "templates",
      options.template
    )

    if (await fs.pathExists(templatePath)) {
      await fs.copy(templatePath, projectDir)
    } else {
      // Fallback to base template
      const baseTemplatePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "create-yukemuri",
        "templates",
        "base"
      )
      await fs.copy(baseTemplatePath, projectDir)
    }

    // Update package.json with project details
    const packageJsonPath = path.join(projectDir, "package.json")
    const packageJson = (await fs.readJson(packageJsonPath)) as PackageJsonData

    packageJson.name = options.name
    packageJson.description = options.description

    if (!packageJson.dependencies) packageJson.dependencies = {}

    // Add feature dependencies
    if (options.features.includes("auth")) {
      packageJson.dependencies["@yukemuri/plugin-auth"] = "^1.0.0"
    }
    if (options.features.includes("database")) {
      packageJson.dependencies["@yukemuri/plugin-database"] = "^1.0.0"
    }
    if (options.features.includes("email")) {
      packageJson.dependencies["@yukemuri/plugin-email"] = "^1.0.0"
    }
    if (options.features.includes("upload")) {
      packageJson.dependencies["@yukemuri/plugin-upload"] = "^1.0.0"
    }
    if (options.features.includes("analytics")) {
      packageJson.dependencies["@yukemuri/plugin-analytics"] = "^1.0.0"
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })

    // Update yukemuri config with selected features
    await CreateCommands.updateYukemuriConfig(projectDir, options.features)

    // Install dependencies
    if (!skipInstall) {
      await execa("npm", ["install"], { cwd: projectDir })
    }
  }

  private static async updateYukemuriConfig(projectDir: string, features: string[]): Promise<void> {
    const configPath = path.join(projectDir, "src", "index.ts")

    if (await fs.pathExists(configPath)) {
      let configContent = await fs.readFile(configPath, "utf-8")

      // Add plugin imports and configuration
      const imports: string[] = []
      const plugins: string[] = []

      if (features.includes("auth")) {
        imports.push("import authPlugin from '@yukemuri/plugin-auth';")
        plugins.push("authPlugin()")
      }
      if (features.includes("database")) {
        imports.push("import databasePlugin from '@yukemuri/plugin-database';")
        plugins.push("databasePlugin()")
      }
      if (features.includes("email")) {
        imports.push("import emailPlugin from '@yukemuri/plugin-email';")
        plugins.push("emailPlugin()")
      }
      if (features.includes("upload")) {
        imports.push("import uploadPlugin from '@yukemuri/plugin-upload';")
        plugins.push("uploadPlugin()")
      }
      if (features.includes("analytics")) {
        imports.push("import analyticsPlugin from '@yukemuri/plugin-analytics';")
        plugins.push("analyticsPlugin()")
      }

      // Insert imports after existing imports
      const importSection = imports.join("\n")
      configContent = configContent.replace(
        /(import.*?from.*?['"].*?['"];?\n)+/,
        `$&${importSection}\n`
      )

      // Add plugins to configuration
      if (plugins.length > 0) {
        const pluginSection = `  plugins: [\n    ${plugins.join(",\n    ")}\n  ],`
        configContent = configContent.replace(
          /export default new Yukemuri\(\{/,
          `export default new Yukemuri({\n${pluginSection}`
        )
      }

      await fs.writeFile(configPath, configContent)
    }
  }

  private static async generatePage(name: string, options: PageOptions): Promise<void> {
    const pagesDir = path.join(process.cwd(), "app", "pages")
    await fs.ensureDir(pagesDir)

    const pageName = name.charAt(0).toUpperCase() + name.slice(1)
    const fileName = `${name}.tsx`
    const filePath = path.join(pagesDir, fileName)

    const pageContent = `import { FC } from 'preact/compat';

interface ${pageName}PageProps {
  // Add props here
}

const ${pageName}Page: FC<${pageName}PageProps> = () => {
  return (
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">${pageName}</h1>
      <p class="text-gray-600">
        Welcome to the ${pageName.toLowerCase()} page.
      </p>
    </div>
  );
};

export default ${pageName}Page;
`

    await fs.writeFile(filePath, pageContent)

    // Add route if needed
    const routePath = options.route || name
    await CreateCommands.addRoute(routePath, fileName)
  }

  private static async generateComponent(name: string, options: ComponentOptions): Promise<void> {
    const componentsDir = path.join(process.cwd(), "app", "components")
    await fs.ensureDir(componentsDir)

    const componentName = name.charAt(0).toUpperCase() + name.slice(1)
    const fileName = `${componentName}.tsx`
    const filePath = path.join(componentsDir, fileName)

    const componentContent = `import { FC } from 'preact/compat';

interface ${componentName}Props {
  // Add props here
}

const ${componentName}: FC<${componentName}Props> = () => {
  return (
    <div class="${name.toLowerCase()}">
      <p>${componentName} component</p>
    </div>
  );
};

export default ${componentName};
`

    await fs.writeFile(filePath, componentContent)

    // Generate test file if requested
    if (options.test) {
      const testContent = `import { render } from '@testing-library/preact';
import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  it('renders correctly', () => {
    const { getByText } = render(<${componentName} />);
    expect(getByText('${componentName} component')).toBeInTheDocument();
  });
});
`

      await fs.writeFile(filePath.replace(".tsx", ".test.tsx"), testContent)
    }
  }

  private static async generateApiRoute(apiPath: string, options: ApiOptions): Promise<void> {
    const apiDir = path.join(process.cwd(), "app", "api")
    await fs.ensureDir(apiDir)

    const fileName = `${apiPath.replace(/^\/api\//, "").replace(/\//g, "_")}.ts`
    const filePath = path.join(apiDir, fileName)

    const methods = (options.methods || "GET,POST")
      .split(",")
      .map((m: string) => m.trim().toUpperCase())

    let routeContent = `import { Hono } from 'hono';
import type { YukemuriContext } from '@yukemuri/core';

const ${fileName.replace(".ts", "")} = new Hono<YukemuriContext>();

`

    // Generate method handlers
    for (const method of methods) {
      const methodLower = method.toLowerCase()
      routeContent += `${fileName.replace(".ts", "")}.${methodLower}('${apiPath}', async (c) => {
  try {
    // TODO: Implement ${method} ${apiPath}
    return c.json({ 
      message: '${method} ${apiPath} endpoint',
      data: null 
    });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

`
    }

    routeContent += `export default ${fileName.replace(".ts", "")};
`

    await fs.writeFile(filePath, routeContent)
  }

  private static async addRoute(routePath: string, fileName: string): Promise<void> {
    // This would update the router configuration
    // Implementation depends on how routing is set up in the project
    console.log(`Route ${routePath} from ${fileName} would be added to the router`)
  }
}
