import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import uglify from 'rollup-plugin-uglify-es';
import pkg from "./package.json";

export default [
  // browser-friendly UMD build
  {
    input: "src/shortcuts.js",
    output: {
      name: "shortcuts",
      file: pkg.browser,
      format: "umd"
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      uglify() // uglify
    ]
  },
  {
    input: "src/shortcuts.js",
    external: ["ms"],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" }
    ]
  }
];
