import { defineConfig } from "orval";

export default defineConfig({
    icpc: {
        output: {
            mode: "tags-split",
            target: "src/api/generated/icpc.ts",
            schemas: "src/api/generated/model",
            client: "react-query",
            httpClient: "axios",
            mock: false,
            override: {
                mutator: {
                    path: "src/lib/api-client.ts",
                    name: "axiosWithAuth",
                },
            },
        },
        input: {
            target: "http://localhost:8000/openapi.json",
        },
    },
    icpcZod: {
        output: {
            mode: "tags-split",
            target: "src/api/generated/zod/icpc.ts",
            client: "zod",
        },
        input: {
            target: "http://localhost:8000/openapi.json",
        },
    },
});
