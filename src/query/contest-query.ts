// Re-export generated hooks under stable names for backward compat
export { useCreateContestApiV1ContestsPost as useCreateContest } from "@/api/generated/contests/contests";
export { useUpdateContestApiV1ContestsContestIdPatch as useUpdateContest } from "@/api/generated/contests/contests";
export { useUploadImageApiV1UploadPost as useUploadContestImage } from "@/api/generated/images/images";
export { getGetAllContestsApiV1ContestsGetQueryKey as contestKeys } from "@/api/generated/contests/contests";
export { useDeleteContestApiV1ContestsContestIdDelete as useDeleteContest } from "@/api/generated/contests/contests";
export { usePublishContestApiV1ContestsContestIdPublishPost as usePublishContest } from "@/api/generated/contests/contests";
export { getGetContestApiV1ContestsContestIdGetQueryKey as contestDetailKey } from "@/api/generated/contests/contests";
export { useGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGet as usePlatformLanguages } from "@/api/generated/questions/questions";
export {
    useGetTagsApiV1QuestionsTagsGet as useTags,
    useCreateTagApiV1QuestionsTagsPost as useCreateTag,
    getGetTagsApiV1QuestionsTagsGetQueryKey as tagKeys,
} from "@/api/generated/questions/questions";
export { useGetContestQuestionApiV1ContestsContestIdQuestionsQuestionIdGet as useContestQuestion } from "@/api/generated/contests/contests";
export { getGetContestQuestionApiV1ContestsContestIdQuestionsQuestionIdGetQueryKey as contestQuestionKey } from "@/api/generated/contests/contests";
export { getGetContestQuestionsApiV1ContestsContestIdQuestionsGetQueryKey as contestQuestionsKey } from "@/api/generated/contests/contests";
// removed duplicate re-export
export { useAddQuestionToContestApiV1ContestsContestIdQuestionsPost as useAddQuestionToContest } from "@/api/generated/contests/contests";
export { useUpdateContestQuestionApiV1ContestsContestIdQuestionsQuestionIdPatch as useUpdateContestQuestion } from "@/api/generated/contests/contests";
export { useReorderContestQuestionsApiV1ContestsContestIdQuestionsReorderPatch as useReorderContestQuestions } from "@/api/generated/contests/contests";
export { useRemoveQuestionFromContestApiV1ContestsContestIdQuestionsDelete as useRemoveQuestionsFromContest } from "@/api/generated/contests/contests";
export { useCloneQuestionsFromBankApiV1ContestsContestIdQuestionsCloneFromBankPost as useCloneQuestionsFromBank } from "@/api/generated/contests/contests";

export { useGetContestApiV1ContestsContestIdGet as useGetContest } from "@/api/generated/contests/contests";
export {
    useGetContestInstructorsApiV1ContestsContestIdInstructorsGet as useGetContestInstructors,
    useAssignInstructorsToContestApiV1ContestsContestIdInstructorsPost as useAssignInstructors,
    useRemoveInstructorsFromContestApiV1ContestsContestIdInstructorsDelete as useRemoveInstructors,
    getGetContestInstructorsApiV1ContestsContestIdInstructorsGetQueryKey as instructorKeys,
} from "@/api/generated/contests/contests";
export {
    useGetContestAudiencesApiV1ContestsContestIdAudiencesGet as useGetContestAudiences,
    useAssignAudiencesToContestApiV1ContestsContestIdAudiencesPost as useAssignAudiences,
    useRemoveAudiencesFromContestApiV1ContestsContestIdAudiencesDelete as useRemoveAudiences,
    getGetContestAudiencesApiV1ContestsContestIdAudiencesGetQueryKey as contestAudiencesKeys,
} from "@/api/generated/contests/contests";
export { useListUserAudiencesApiV1AudiencesMyGet as useMyAudiences } from "@/api/generated/audiences/audiences";
export { useListUsersApiV1UsersGet as useListUsers } from "@/api/generated/users/users";
