import type { Plugin } from "vite";
import * as process from "process";
import * as path from "path";

type ResolvePandaDependenciesConfig = {
  envName?: string;
};
export function treeShakePandaCss(
  config?: ResolvePandaDependenciesConfig
): Plugin {
  const moduleDependencies = new Map();
  const modulesToResolve: Array<() => void> = [];
  const trackDeps = new Set<string>();
  let allCssParsed = true;

  const envName = config?.envName ?? "__TREE_SHAKE_PANDA_DEPENDENCIES__";

  const removeModule = (id: string) => {
    trackDeps.delete(id);
    if (!id.endsWith(".css")) {
      allCssParsed = Array.from(trackDeps).every((moduleId) =>
        moduleId.endsWith(".css")
      );
    }
  };

  return {
    name: "vite-plugin-tree-shake-panda-css",
    apply: "build",
    enforce: "pre",

    moduleParsed(moduleInfo) {
      removeModule(moduleInfo.id);
      if (allCssParsed) {
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
      trackDeps.add(id);
      if (id.endsWith(".css")) {
        return new Promise<void>((resolve) => {
          modulesToResolve.push(resolve);
        });
      } else {
        allCssParsed = false;
      }
    },
  };
}
