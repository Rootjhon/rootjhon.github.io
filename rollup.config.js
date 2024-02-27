import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import license from 'rollup-plugin-license';
import path from 'path';

const JS_SRC = '_javascript';
const JS_DIST = 'assets/js/dist';
const isProd = process.env.NODE_ENV === 'production';

function build(filename) {
  return {
    input: [`${SRC_DEFAULT}/${filename}.js`],
    output: {
      file: `${DIST_DEFAULT}/${filename}.min.js`,
      format: 'iife',
      name: 'Chirpy',
      sourcemap: !isProd
    },
    watch: {
      include: `${SRC_DEFAULT}/**`
    },
    plugins: [
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/env'],
        plugins: ['@babel/plugin-transform-class-properties']
      }),
      license({
        banner: {
          commentStyle: 'ignored',
          content: { file: path.join(__dirname, JS_SRC, '_copyright') }
        }
      }),
      isProd && terser()
    ]
  };
}

export default [
  build('commons'),
  build('home'),
  build('categories'),
  build('page'),
  build('post'),
  build('misc')
];
