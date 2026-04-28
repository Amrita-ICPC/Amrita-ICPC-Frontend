// Re-export generated hooks under stable names for backward compat
export { useCreateContestApiV1ContestsPost as useCreateContest } from "@/api/generated/contests/contests";
export { useUpdateContestApiV1ContestsContestIdPatch as useUpdateContest } from "@/api/generated/contests/contests";
export { useUploadImageApiV1UploadPost as useUploadContestImage } from "@/api/generated/images/images";
export { getGetAllContestsApiV1ContestsGetQueryKey as contestKeys } from "@/api/generated/contests/contests";
export { useDeleteContestApiV1ContestsContestIdDelete as useDeleteContest } from "@/api/generated/contests/contests";
