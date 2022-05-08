// @ts-check
import ts from "rollup-plugin-ts"
import node from "@rollup/plugin-node-resolve"
import cjs from "@rollup/plugin-commonjs"
import alias from "@rollup/plugin-alias"

const extensions = [".js", ".ts", ".mjs", ".tsx", ".json"]

/**
 * @return {import("rollup").RollupOptions}
 */
export default () => ({
  input: "./src/index.ts",
  output: {
    file: "./lib/index.js",
    format: "cjs",
    banner: "/* eslint-disable */",
  },
  plugins: [
    ts(),
    node({ extensions }),
    cjs({ extensions }), //
    alias({
      entries: [{ find: "./bcrypt", replacement: "../lib/bcrypt.mjs" }],
    }),
  ].filter(Boolean),
})
