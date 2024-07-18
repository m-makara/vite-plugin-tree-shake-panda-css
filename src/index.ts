import { FilterPattern, Plugin, createFilter } from "vite";
import * as process from "process";

export const defaultEnvName = "__TREE_SHAKE_PANDA_DEPENDENCIES__";

type ResolvePandaDependenciesConfig = {
  envName?: string;
  include?: FilterPattern;
  exclude?: FilterPattern;
};
export function treeShakePandaCss(
  config?: ResolvePandaDependenciesConfig
): Plugin {
  const {
    envName = defaultEnvName,
    include = "**/*.{js,jsx,ts,tsx}",
    exclude = "node_modules/**/*",
  } = config ?? {};
  const dependencies = new Set();

  const filter = createFilter(include, exclude);

  return {
    name: "vite-plugin-tree-shake-panda-css",
    apply: "build",
    enforce: "pre",

    buildEnd() {
      Array.from(this.getModuleIds()).forEach((id) => {
        if (filter(id) && this.getModuleInfo(id)?.isIncluded) {
          dependencies.add(id);
        }
      });
      process.env[envName] = JSON.stringify(Array.from(dependencies));
    },
  };
}
