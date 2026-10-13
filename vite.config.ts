import path from 'path';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Runs the /api/convert Vercel function locally under `vite dev`, so Cloud AI
// mode works out of the box with `npm run dev` instead of silently 404ing and
// requiring a separate `vercel dev` process. Vercel's own routing handles
// /api/* in production/preview deploys - this plugin only touches the dev server.
function vercelApiDevPlugin(): Plugin {
  return {
    name: 'vercel-api-dev',
    apply: 'serve',
    config(_, { mode }) {
      // vite only puts VITE_-prefixed vars into process.env by default; the
      // handler reads process.env.ANTHROPIC_API_KEY directly (like Vercel does),
      // so pull every var from .env* files in ourselves.
      const env = loadEnv(mode, process.cwd(), '');
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
    },
    configureServer(server) {
      server.middlewares.use('/api/convert', async (req, res, next) => {
        if (req.method !== 'POST' && req.method !== 'OPTIONS') {
          next();
          return;
        }

        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const raw = Buffer.concat(chunks).toString('utf-8');

        let body: unknown = {};
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          // leave body as {} - the handler validates the payload and responds with a proper error
        }
        (req as typeof req & { body?: unknown }).body = body;

        const devRes = res as typeof res & {
          status?: (code: number) => typeof res;
          json?: (data: unknown) => void;
        };
        devRes.status = (code: number) => {
          res.statusCode = code;
          return res;
        };
        devRes.json = (data: unknown) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        try {
          const mod = await server.ssrLoadModule('/api/convert.ts');
          await mod.default(req, devRes);
        } catch (err) {
          console.error('[dev] /api/convert crashed:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal error in dev API handler.' }));
        }
      });
    },
  };
}

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), vercelApiDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'api/**/*.test.ts'],
  },
});
