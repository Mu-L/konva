// import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
  // the UMD bundle has the default export only, so window.Konva is the object
  input: `src/umd.ts`,
  output: [
    {
      file: 'konva.js',
      name: 'Konva',
      format: 'umd',
      sourcemap: false,
      freeze: false,
    },
  ],
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Compile TypeScript files
    typescript({
      useTsconfigDeclarationDir: true,
      abortOnError: true,
      removeComments: false,
      tsconfigOverride: {
        compilerOptions: {
          module: 'ES2020',
        },
      },
    }),
  ],
};
