import {
    useGetBankApiV1BanksBankIdGet as useGetBankDetail,
    useUpdateBankApiV1BanksBankIdPatch as useUpdateBank,
    useDeleteBankApiV1BanksBankIdDelete as useDeleteBank,
    useSoftDeleteBankApiV1BanksBankIdSoftDeleteDelete as useSoftDeleteBank,
    useUnshareBankApiV1BanksBankIdSharesTargetUserIdDelete as useUnshareBank,
    getGetBankApiV1BanksBankIdGetQueryKey as bankDetailKey,
    useGetBankSharesApiV1BanksBankIdSharesGet as useGetBankShares,
    useUpdateBankSharesApiV1BanksBankIdSharesPatch as useUpdateBankShares,
    useShareBankApiV1BanksBankIdSharesPost as useShareBank,
    getGetBankSharesApiV1BanksBankIdSharesGetQueryKey as bankSharesKey,
    useGetAllBanksApiV1BanksGet as useGetAllBanks,
    getGetAllBanksApiV1BanksGetQueryKey as allBanksKey,
} from "@/api/generated/banks/banks";

import {
    useGetBankQuestionsApiV1BanksBankIdQuestionsGet as useGetBankQuestions,
    useRemoveQuestionsFromBankApiV1BanksBankIdQuestionsDelete as useRemoveQuestionsFromBank,
    useAddQuestionsToBankApiV1BanksBankIdQuestionsPost as useAddQuestionsToBank,
    useUpdateBankQuestionApiV1BanksBankIdQuestionsQuestionIdPut as useUpdateBankQuestion,
    useCloneQuestionsBetweenBanksApiV1BanksSourceBankIdQuestionsClonePost as useCloneBankQuestions,
    getGetBankQuestionsApiV1BanksBankIdQuestionsGetQueryKey as bankQuestionsKey,
} from "@/api/generated/bank-questions/bank-questions";

export {
    useGetBankDetail,
    useUpdateBank,
    useDeleteBank,
    useSoftDeleteBank,
    useShareBank,
    useUnshareBank,
    useGetBankShares,
    useUpdateBankShares,
    bankDetailKey,
    bankSharesKey,
    useGetAllBanks,
    allBanksKey,
    useGetBankQuestions,
    useRemoveQuestionsFromBank,
    useAddQuestionsToBank,
    useUpdateBankQuestion,
    useCloneBankQuestions,
    bankQuestionsKey,
};
