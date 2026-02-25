import { Command, Options } from "@effect/cli";
import { FileSystem } from "@effect/platform";
import { NodeFileSystem, NodeContext } from "@effect/platform-node";
import { Effect, Console } from "effect";
import { join, dirname, relative } from "node:path";
import { Project, Node, SyntaxKind } from "ts-morph";

// --- TYPES & IR ---

interface IRPrimitive {
  _tag: "Primitive";
  type: "string" | "integer" | "boolean" | "unknown";
  name: string;
  default?: string | number | boolean;
  description?: string;
  isOption: boolean;
}

interface IRNested {
  _tag: "Nested";
  prefix: string;
  child: IRNode;
}

interface IRAll {
  _tag: "All";
  properties: Record<string, IRNode>;
  description?: string;
}

type IRNode = IRPrimitive | IRNested | IRAll;

interface ConfigField {
  envName: string;
  type: string;
  default?: string | number | boolean;
  description?: string;
}

interface ConfigSection {
  name: string;
  description?: string;
  fields: ConfigField[];
}

// --- AST PARSING ---

function parseConfigFile(filePath: string, variableName: string): ConfigSection[] {
  console.log(`Parsing config file: ${filePath}`);
  const project = new Project();

  try {
    project.addSourceFileAtPath(filePath);
  } catch (e) {
    console.error(`Could not add source file: ${e}`);
    return [];
  }

  const sourceFile = project.getSourceFileOrThrow(filePath);

  function extractValue(node: Node | undefined): string | number | boolean | undefined {
    if (!node) return undefined;
    if (Node.isStringLiteral(node) || Node.isNumericLiteral(node)) {
      return node.getLiteralValue();
    }
    const kind = node.getKind();
    if (kind === SyntaxKind.TrueKeyword) return true;
    if (kind === SyntaxKind.FalseKeyword) return false;
    return undefined;
  }

  function getMethodName(expr: Node): string | undefined {
    if (Node.isPropertyAccessExpression(expr)) {
      return expr.getName();
    }
    if (Node.isIdentifier(expr)) {
      return expr.getText();
    }
    return undefined;
  }

  function parseExpression(expr: Node | undefined): IRNode | undefined {
    if (!expr) return undefined;

    // 1. Identifier / Variable reference
    if (Node.isIdentifier(expr)) {
      const name = expr.getText();
      const decl = sourceFile.getVariableDeclaration(name);
      if (decl) {
        const init = decl.getInitializer();
        if (init) return parseExpression(init);
      }
      return undefined;
    }

    if (!Node.isCallExpression(expr)) return undefined;

    const caller = expr.getExpression();
    const methodName = getMethodName(caller);

    // 2. Nested call: Config.nested("PREFIX")(child)
    if (Node.isCallExpression(caller)) {
      const innerCaller = caller.getExpression();
      const innerMethodName = getMethodName(innerCaller);

      if (innerMethodName === "nested") {
        const prefixArg = caller.getArguments()[0];
        const prefix = extractValue(prefixArg);
        const childArg = expr.getArguments()[0];
        if (typeof prefix === "string" && childArg) {
          const child = parseExpression(childArg);
          if (child) {
            return { _tag: "Nested", prefix, child };
          }
        }
      }
    }

    // 3. Modifiers (pipe)
    if (methodName === "pipe") {
      let targetNode: Node | undefined;
      let modifierNodes: Node[] = [];

      if (Node.isPropertyAccessExpression(caller)) {
        targetNode = caller.getExpression();
        modifierNodes = expr.getArguments();
      } else {
        const args = expr.getArguments();
        targetNode = args[0];
        modifierNodes = args.slice(1);
      }

      const targetIR = parseExpression(targetNode);
      if (!targetIR) return undefined;

      for (const mod of modifierNodes) {
        if (Node.isCallExpression(mod)) {
          const modName = getMethodName(mod.getExpression());
          if (modName === "withDefault") {
            const val = extractValue(mod.getArguments()[0]);
            if (targetIR._tag === "Primitive") targetIR.default = val;
          } else if (modName === "withDescription") {
            const val = extractValue(mod.getArguments()[0]);
            if (typeof val === "string" && (targetIR._tag === "Primitive" || targetIR._tag === "All")) {
              targetIR.description = val;
            }
          }
        } else if (Node.isPropertyAccessExpression(mod) || Node.isIdentifier(mod)) {
          const modName = Node.isIdentifier(mod) ? mod.getText() : mod.getName();
          if (modName === "option") {
            if (targetIR._tag === "Primitive") targetIR.isOption = true;
          }
        }
      }
      return targetIR;
    }

    // 4. Primitives
    if (methodName === "string" || methodName === "integer" || methodName === "boolean") {
      const nameArg = expr.getArguments()[0];
      const name = extractValue(nameArg);
      if (typeof name === "string") {
        return { _tag: "Primitive", type: methodName as any, name, isOption: false };
      }
    }

    // 5. Config.all
    if (methodName === "all") {
      const arg = expr.getArguments()[0];
      if (arg && Node.isObjectLiteralExpression(arg)) {
        const properties: Record<string, IRNode> = {};
        for (const prop of arg.getProperties()) {
          if (Node.isPropertyAssignment(prop)) {
            const propName = prop.getName();
            const init = prop.getInitializer();
            if (init) {
              const parsed = parseExpression(init);
              if (parsed) properties[propName] = parsed;
            }
          } else if (Node.isShorthandPropertyAssignment(prop)) {
            const propName = prop.getName();
            const parsed = parseExpression(prop.getNameNode());
            if (parsed) properties[propName] = parsed;
          }
        }
        return { _tag: "All", properties };
      }
    }

    return undefined;
  }

  // --- Flattening IR to Sections ---

  const sectionsMap = new Map<string, ConfigSection>();

  function flattenIR(node: IRNode, prefix: string): void {
    const currentSectionName = prefix || "ROOT";
    if (!sectionsMap.has(currentSectionName)) {
      sectionsMap.set(currentSectionName, { name: currentSectionName, fields: [] });
    }
    const section = sectionsMap.get(currentSectionName)!;

    if (node._tag === "Primitive") {
      const envName = prefix ? `${prefix}_${node.name}` : node.name;
      section.fields.push({
        envName,
        type: node.type,
        default: node.default,
        description: node.description,
      });
    } else if (node._tag === "Nested") {
      const newPrefix = prefix ? `${prefix}_${node.prefix}` : node.prefix;
      flattenIR(node.child, newPrefix);
    } else if (node._tag === "All") {
      if (node.description) {
        section.description = node.description;
      }
      for (const child of Object.values(node.properties)) {
        flattenIR(child, prefix);
      }
    }
  }

  const decl = sourceFile.getVariableDeclaration(variableName);
  if (decl) {
    const init = decl.getInitializer();
    if (init) {
      const rootIR = parseExpression(init);
      if (rootIR) {
        flattenIR(rootIR, "");
      }
    }
  }

  // Filter out empty sections and sort by name
  return Array.from(sectionsMap.values())
    .filter((s) => s.fields.length > 0)
    .toSorted((a, b) => a.name.localeCompare(b.name));
}

// --- MARKDOWN GENERATION ---

function formatDefault(value: string | number | boolean | undefined): string {
  if (value === undefined) return "-";
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}

function generateMarkdown(sections: ConfigSection[], configPath: string, outputPath: string): string {
  // Compute relative path from output file to config file for the link
  const outputDir = dirname(outputPath);
  const relativeConfigPath = relative(outputDir, configPath);

  const parts = [
    "# Environment Variables",
    "",
    "> [!WARNING]",
    `> This file is auto-generated from [\`${relativeConfigPath}\`](${relativeConfigPath}). Do not edit directly.`,
    "",
  ];

  if (sections.length === 0) {
    parts.push("_No configuration sections found._");
  }

  for (const section of sections) {
    parts.push(`## ${section.name}`);
    if (section.description) {
      parts.push(`${section.description}\n`);
    }

    parts.push("| Variable | Type | Default | Description |");
    parts.push("|----------|------|---------|-------------|");

    for (const field of section.fields) {
      const desc = field.description ? field.description.replace(/\n/g, " ") : "-";
      parts.push(`| ${field.envName} | ${field.type} | ${formatDefault(field.default)} | ${desc} |`);
    }
    parts.push("");
  }

  return parts.join("\n").trim() + "\n";
}

// --- MAIN PROGRAM ---

const run = Command.make("generate-env-docs", {
  configPath: Options.file("configPath").pipe(
    Options.withAlias("c"),
    Options.withDescription("Path to the configuration file"),
  ),
  outputPath: Options.file("outputPath").pipe(
    Options.withAlias("o"),
    Options.withDescription("Path for the generated markdown file"),
  ),
  variableName: Options.text("variableName").pipe(
    Options.withAlias("v"),
    Options.withDescription("The name of the exported config variable"),
    Options.withDefault("ServerConfig"),
  ),
}).pipe(
  Command.withHandler(({ configPath, outputPath, variableName }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      const absoluteConfigPath = join(process.cwd(), configPath);
      const absoluteOutputPath = join(process.cwd(), outputPath);

      const sections = parseConfigFile(absoluteConfigPath, variableName);
      const markdown = generateMarkdown(sections, absoluteConfigPath, absoluteOutputPath);

      yield* fs.writeFileString(absoluteOutputPath, markdown);
      yield* Console.log(`\nGenerated env documentation: ${absoluteOutputPath}`);
    }),
  ),
);

const cli = Command.run(run, {
  name: "Env Docs Generator",
  version: "1.0.0",
});

Effect.suspend(() => cli(process.argv))
  .pipe(Effect.provide(NodeFileSystem.layer), Effect.provide(NodeContext.layer), Effect.runPromise)
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });