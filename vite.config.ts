import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {handleDshRequest} from './src/server/dshHandler.ts';

function dshApiPlugin(): Plugin {
  return {
    name: 'dsh-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/dsh')) {
          return next();
        }

        const endpoint = req.url.replace('/api/dsh', '') || '/chat';
        if (req.method === 'POST') {
          let bodyData = '';
          req.on('data', chunk => {
            bodyData += chunk;
          });
          req.on('end', async () => {
            try {
              const body = bodyData ? JSON.parse(bodyData) : {};
              const result = await handleDshRequest(endpoint, body);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Server processing error' }));
            }
          });
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ status: 'ok', service: 'DeepSeek Harness Engine API' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), dshApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Allow all Cloud Run preview hosts and custom domains
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
