import type { Plugin } from "vite";
import * as process from "process";
import * as path from "path";

type ResolvePandaDependenciesConfig = {
  entryPath: string;
  root?: string;
  envName?: string;
};
export function treeShakePandaCss({
  entryPath,
  root,
  envName = "__TREE_SHAKE_PANDA_DEPENDENCIES__",
}: ResolvePandaDependenciesConfig): Plugin {
  const moduleDependencies = new Map();
  const modulesToResolve: Array<() => void> = [];

  let configRoot: string;

  return {
    name: "vite-plugin-tree-shake-panda-css",
    apply: "build",
    enforce: "pre",

    configResolved(config) {
      configRoot = config.root;
    },

    moduleParsed(moduleInfo) {
      if (moduleInfo.id === path.resolve(root ?? configRoot, entryPath)) {
        modulesToResolve.forEach((callback) => callback());
      }
    },

    resolveId(id: string, importer: string | undefined) {
      const matcher = new RegExp(/\.(ts|tsx|js|jsx)/g);
      if (
        importer &&
        matcher.test(importer) &&
        !importer.includes("node_modules")
      ) {
        if (!moduleDependencies.get(importer)) {
          moduleDependencies.set(importer, new Set());
        }
        moduleDependencies.get(importer).add(path.resolve(id, importer));
        const result = new Set(
          ([] as string[]).concat(
            ...Array.from(moduleDependencies.values()).map((set) => [...set])
          )
        );

        process.env[envName] = JSON.stringify(Array.from(result));
      }
    },
    transform(_, id: string) {
      if (id.endsWith(".css")) {
        return new Promise<void>((resolve) => {
          modulesToResolve.push(resolve);
        });
      }
    },
  };
}
