# DISCLAIMER

NOT INTENDED FOR PRODUCTION USE

## What is this plugin

This is just a POC to try and resolve all dependencies of a given entry point/project, delay the resolution of all `.css` files, until all other dependencies have been parsed and then expose the project dependencies via an environment variable for the `panda.config.ts` to consume in its `include` field.
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
