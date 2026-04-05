import { defineConfig } from 'orval';

/**
 * Orval Generation Config
 * 
 * Automates the creation of TanStack Query hooks and Zod schemas 
 * from the local OpenAPI specification in /Endpoints.
 */
export default defineConfig({
  api: {
    input: './Endpoints/endpoints.json',
    output: {
      mode: 'tags-split',
      target: 'src/api/endpoints',
      schemas: 'src/api/model',
      client: 'react-query',
      httpClient: 'axios',
      prettier: true,
      override: {
        mutator: {
          path: 'src/lib/api-client.ts',
          name: 'axiosWithAuth',
        },
      },
    },
  },
  zod: {
    input: './Endpoints/endpoints.json',
    output: {
      mode: 'tags-split',
      client: 'zod',
      target: 'src/api/zod',
      fileExtension: '.zod.ts',
    },
  },
});
