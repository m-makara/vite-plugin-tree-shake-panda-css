# DISCLAIMER

NOT INTENDED FOR PRODUCTION USE

## What is this plugin

This is just a POC to resolve all dependencies of a project and expose the dependencies via an environment variable for the `panda.config.ts` to consume in its `include` field.
Requires for the build process ro be ran twice. The first build resolves the dependencies and saves them to an ENV variable. The second build then reads the exposed dependencies in `panda.config.ts`.
Works only in **build** mode.

## Usage

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import { treeShakePandaCss } from "@m-makara/vite-plugin-tree-shake-panda-css";

export default defineConfig({
  //...other config options
  plugins: [
    //...other plugins
    treeShakePandaCss({
      //envName -- optional. Name of the environment variable where the resolved dependencies are. Defaults to __TREE_SHAKE_PANDA_DEPENDENCIES__
      //include -- optional. PicoMatch pattern of files that should be included in dependencies. Defaults to "**/*.{js,jsx,ts,tsx}".
      //exclude -- optional. PicoMatch pattern of files that should be excluded from dependencies. Defaults to "node_modules/**/*".
    }),
  ],
});
```

### panda.config.{js,mjs,ts}

```typescript
import { defineConfig } from "@pandacss/dev";
import * as process from "process";

export default defineConfig({
  //...other config
  include:
    env.NODE_ENV === "development"
      ? ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"]
      : //Resolve and tree-shake only in production builds
        JSON.parse(env["__TREE_SHAKE_PANDA_DEPENDENCIES__"]),
});
```
