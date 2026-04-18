// This file is intentionally kept as a re-export shim so that Orval-generated
// API clients (which reference this path in the mutator config) keep working
// without modification. All implementation lives in `./api/client`.
export { axiosInstance, axiosWithAuth, apiClient } from "@/lib/api/client";
export { default } from "@/lib/api/client";
