import {
    getGetQuestionApiV1QuestionsQuestionIdGetQueryKey as questionKey,
    getGetTagsApiV1QuestionsTagsGetQueryKey as tagKeys,
    useCreateQuestionApiV1QuestionsPost as useCreateQuestion,
    useCreateTagApiV1QuestionsTagsPost as useCreateTag,
    useGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGet as usePlatformLanguages,
    useGetQuestionApiV1QuestionsQuestionIdGet as useGetQuestion,
    useGetTagsApiV1QuestionsTagsGet as useTags,
} from "@/api/generated/questions/questions";

export {
    questionKey,
    tagKeys,
    useCreateQuestion,
    useCreateTag,
    useGetQuestion,
    usePlatformLanguages,
    useTags,
};
