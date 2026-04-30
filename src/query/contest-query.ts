// Re-export generated hooks under stable names for backward compat
export { useCreateContestApiV1ContestsPost as useCreateContest } from "@/api/generated/contests/contests";
export { useUpdateContestApiV1ContestsContestIdPatch as useUpdateContest } from "@/api/generated/contests/contests";
export { useUploadImageApiV1UploadPost as useUploadContestImage } from "@/api/generated/images/images";
export { getGetAllContestsApiV1ContestsGetQueryKey as contestKeys } from "@/api/generated/contests/contests";
export { useDeleteContestApiV1ContestsContestIdDelete as useDeleteContest } from "@/api/generated/contests/contests";
export { usePublishContestApiV1ContestsContestIdPublishPost as usePublishContest } from "@/api/generated/contests/contests";
export { usePauseContestApiV1ContestsContestIdPausePost as usePauseContest } from "@/api/generated/contests/contests";
export { useResumeContestApiV1ContestsContestIdResumePost as useResumeContest } from "@/api/generated/contests/contests";
export { useCancelContestApiV1ContestsContestIdCancelPost as useCancelContest } from "@/api/generated/contests/contests";
export { getGetContestApiV1ContestsContestIdGetQueryKey as contestDetailKey } from "@/api/generated/contests/contests";
export { useGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGet as usePlatformLanguages } from "@/api/generated/questions/questions";
export {
    useGetTagsApiV1QuestionsTagsGet as useTags,
    useCreateTagApiV1QuestionsTagsPost as useCreateTag,
    getGetTagsApiV1QuestionsTagsGetQueryKey as tagKeys,
} from "@/api/generated/questions/questions";
