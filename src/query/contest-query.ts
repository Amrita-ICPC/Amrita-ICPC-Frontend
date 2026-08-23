// Re-export generated hooks under stable names for backward compat
export { useCreateContestApiV1ContestsPost as useCreateContest } from "@/api/generated/contests/contests";
export { useUpdateContestApiV1ContestsContestIdPatch as useUpdateContest } from "@/api/generated/contests/contests";
export { getGetAllContestsApiV1ContestsGetQueryKey as contestKeys } from "@/api/generated/contests/contests";
export { useDeleteContestApiV1ContestsContestIdDelete as useDeleteContest } from "@/api/generated/contests/contests";
export { usePublishContestApiV1ContestsContestIdPublishPost as usePublishContest } from "@/api/generated/contests/contests";
export { getGetContestApiV1ContestsContestIdGetQueryKey as contestDetailKey } from "@/api/generated/contests/contests";
export { useGetContestQuestionApiV1ContestsContestIdQuestionsQuestionIdGet as useContestQuestion } from "@/api/generated/contests/contests";
export { getGetContestQuestionApiV1ContestsContestIdQuestionsQuestionIdGetQueryKey as contestQuestionKey } from "@/api/generated/contests/contests";
export { getGetContestQuestionsApiV1ContestsContestIdQuestionsGetQueryKey as contestQuestionsKey } from "@/api/generated/contests/contests";
export { useUploadImageApiV1UploadPost as useUploadContestImage } from "@/api/generated/images/images";
export { useGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGet as usePlatformLanguages } from "@/api/generated/questions/questions";
export {
    getGetTagsApiV1QuestionsTagsGetQueryKey as tagKeys,
    useCreateTagApiV1QuestionsTagsPost as useCreateTag,
    useGetTagsApiV1QuestionsTagsGet as useTags,
} from "@/api/generated/questions/questions";
// removed duplicate re-export
export { useListUserAudiencesApiV1AudiencesMyGet as useMyAudiences } from "@/api/generated/audiences/audiences";
export { useAddQuestionToContestApiV1ContestsContestIdQuestionsPost as useAddQuestionToContest } from "@/api/generated/contests/contests";
export { useUpdateContestQuestionApiV1ContestsContestIdQuestionsQuestionIdPatch as useUpdateContestQuestion } from "@/api/generated/contests/contests";
export { useReorderContestQuestionsApiV1ContestsContestIdQuestionsReorderPatch as useReorderContestQuestions } from "@/api/generated/contests/contests";
export { useRemoveQuestionFromContestApiV1ContestsContestIdQuestionsDelete as useRemoveQuestionsFromContest } from "@/api/generated/contests/contests";
export { useCloneQuestionsFromBankApiV1ContestsContestIdQuestionsCloneFromBankPost as useCloneQuestionsFromBank } from "@/api/generated/contests/contests";
export { useGetContestApiV1ContestsContestIdGet as useGetContest } from "@/api/generated/contests/contests";
export {
    getGetContestInstructorsApiV1ContestsContestIdInstructorsGetQueryKey as instructorKeys,
    useAssignInstructorsToContestApiV1ContestsContestIdInstructorsPost as useAssignInstructors,
    useGetContestInstructorsApiV1ContestsContestIdInstructorsGet as useGetContestInstructors,
    useRemoveInstructorsFromContestApiV1ContestsContestIdInstructorsDelete as useRemoveInstructors,
} from "@/api/generated/contests/contests";
export {
    getGetContestAudiencesApiV1ContestsContestIdAudiencesGetQueryKey as contestAudiencesKeys,
    useAssignAudiencesToContestApiV1ContestsContestIdAudiencesPost as useAssignAudiences,
    useGetContestAudiencesApiV1ContestsContestIdAudiencesGet as useGetContestAudiences,
    useRemoveAudiencesFromContestApiV1ContestsContestIdAudiencesDelete as useRemoveAudiences,
} from "@/api/generated/contests/contests";
export { useListUsersApiV1UsersGet as useListUsers } from "@/api/generated/users/users";
