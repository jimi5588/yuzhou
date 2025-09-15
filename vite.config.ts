import { defineConfig, loadEnv, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';
import path from 'path';

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src') // 关键配置
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [VantResolver()],
      }),
      Components({
        resolvers: [VantResolver()],
      }),
    ],
    server: {
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },

  });
};

// export default defineConfig({
//   const env = loadEnv(mode, process.cwd(), '');

//   server: {
//     proxy: {
//       '/api': {
//         target: env.VUE_APP_API_URL
//       }
//     }
//   },

//   plugins: [
//     vue(),
//     AutoImport({
//       resolvers: [VantResolver()],
//     }),
//     Components({
//       resolvers: [VantResolver()],
//     }),
//   ],

// })
