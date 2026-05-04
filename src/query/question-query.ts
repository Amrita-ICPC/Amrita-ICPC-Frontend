import {
    useGetQuestionApiV1QuestionsQuestionIdGet as useGetQuestion,
    getGetQuestionApiV1QuestionsQuestionIdGetQueryKey as questionKey,
    useCreateQuestionApiV1QuestionsPost as useCreateQuestion,
    useGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGet as usePlatformLanguages,
    useGetTagsApiV1QuestionsTagsGet as useTags,
    useCreateTagApiV1QuestionsTagsPost as useCreateTag,
    getGetTagsApiV1QuestionsTagsGetQueryKey as tagKeys,
} from "@/api/generated/questions/questions";

export {
    useGetQuestion,
    questionKey,
    useCreateQuestion,
    usePlatformLanguages,
    useTags,
    useCreateTag,
    tagKeys,
};
