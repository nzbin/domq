import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const banner = `
/*!
 * ${pkg.name} - v${pkg.version}
 * ${pkg.description}
 * ${pkg.homepage}
 *
 * Copyright (c) 2018 ${pkg.author}
 * Released under ${pkg.license} License
 */
`;


export default [
  {
    input: 'src/core.js',
    output: [
      {
        name: 'd',
        banner,
        file: "dist/d.js",
        format: 'umd',
        sourcemap: true
      },
      {
        banner,
        file: 'dist/d.common.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        banner,
        file: 'dist/d.esm.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      babel({ exclude: 'node_modules/**' }),
      resolve(),
      commonjs(),
    ],
  },
];
