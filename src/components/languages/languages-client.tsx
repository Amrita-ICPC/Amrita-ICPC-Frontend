"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    Check,
    Code2,
    FileCode2,
    Loader2,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import type { PlatformLanguageResponse } from "@/api/generated/model";
import {
    getGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGetQueryKey,
    useCreatePlatformLanguageApiV1QuestionsLanguagesPlatformPost,
    useDeletePlatformLanguageApiV1QuestionsLanguagesPlatformLanguageIdDelete,
    useGetJudge0LanguagesApiV1QuestionsLanguagesJudge0Get,
    useGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGet,
} from "@/api/generated/questions/questions";
import { EmptyState } from "@/components/shared/empty-state";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toApiError } from "@/lib/api/error";
import { cn } from "@/lib/utils";

const languageFormSchema = z.object({
    judge0_language_id: z.number({ error: "Select a programming language from Judge0" }),
    slug: z.string().nullish(),
    file_extension: z.string().nullish(),
    monaco_language: z.string().nullish(),
});

type LanguageFormValues = z.infer<typeof languageFormSchema>;

function getErrorMessage(error: unknown, fallback: string) {
    return toApiError(error).message || fallback;
}

interface AddLanguageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function AddLanguageDialog({ open, onOpenChange }: AddLanguageDialogProps) {
    const queryClient = useQueryClient();
    const [judge0Search, setJudge0Search] = useState("");

    const {
        data: judge0Data,
        isLoading: isLoadingJudge0,
        isError: isJudge0Error,
        error: judge0Error,
    } = useGetJudge0LanguagesApiV1QuestionsLanguagesJudge0Get({
        query: { enabled: open },
    });

    const judge0Languages = useMemo(() => judge0Data?.data ?? [], [judge0Data]);

    const filteredJudge0Languages = useMemo(() => {
        const q = judge0Search.trim().toLowerCase();
        if (!q) return judge0Languages;
        return judge0Languages.filter((lang) => lang.name.toLowerCase().includes(q));
    }, [judge0Languages, judge0Search]);

    const form = useForm<LanguageFormValues>({
        resolver: zodResolver(languageFormSchema),
        defaultValues: {
            judge0_language_id: undefined,
            slug: "",
            file_extension: "",
            monaco_language: "",
        },
    });

    const selectedJudge0Id = form.watch("judge0_language_id");
    const selectedJudge0Language = judge0Languages.find((lang) => lang.id === selectedJudge0Id);

    const { mutate: createLanguage, isPending } =
        useCreatePlatformLanguageApiV1QuestionsLanguagesPlatformPost({
            mutation: {
                onSuccess: () => {
                    toast.success("Programming language added");
                    onOpenChange(false);
                    form.reset();
                    setJudge0Search("");
                    queryClient.invalidateQueries({
                        queryKey:
                            getGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGetQueryKey(),
                    });
                },
                onError: (error) =>
                    toast.error(getErrorMessage(error, "Failed to add programming language")),
            },
        });

    function onSubmit(values: LanguageFormValues) {
        createLanguage({
            data: {
                judge0_language_id: values.judge0_language_id,
                slug: values.slug || undefined,
                file_extension: values.file_extension || undefined,
                monaco_language: values.monaco_language || undefined,
            },
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next);
                if (!next) {
                    form.reset();
                    setJudge0Search("");
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add programming language</DialogTitle>
                    <DialogDescription>
                        Pick a programming language from Judge0 to make it available on the
                        platform.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <FormField
                            control={form.control}
                            name="judge0_language_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Judge0 programming language</FormLabel>
                                    {selectedJudge0Language && (
                                        <Badge
                                            variant="secondary"
                                            className="w-fit gap-1.5 py-1 pl-2.5 pr-1.5"
                                        >
                                            <Check className="size-3 text-primary" />
                                            {selectedJudge0Language.name}
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(undefined)}
                                                className="ml-0.5 rounded-full p-0.5 hover:bg-background/80"
                                                aria-label="Clear selection"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </Badge>
                                    )}
                                    <FormControl>
                                        <div className="overflow-hidden rounded-lg border bg-popover">
                                            <div className="flex items-center gap-2 border-b px-3">
                                                <Search className="size-4 shrink-0 text-muted-foreground" />
                                                <input
                                                    value={judge0Search}
                                                    onChange={(event) =>
                                                        setJudge0Search(event.target.value)
                                                    }
                                                    placeholder="Search programming languages..."
                                                    disabled={isLoadingJudge0 || isJudge0Error}
                                                    className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                                {judge0Search && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setJudge0Search("")}
                                                        className="shrink-0 rounded-sm text-muted-foreground hover:text-foreground"
                                                        aria-label="Clear search"
                                                    >
                                                        <X className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-56 overflow-y-auto p-1">
                                                {isLoadingJudge0 ? (
                                                    <div className="flex flex-col gap-1 p-2">
                                                        {Array.from({ length: 5 }).map(
                                                            (_, index) => (
                                                                <Skeleton
                                                                    key={index}
                                                                    className="h-8 rounded-sm"
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                ) : isJudge0Error ? (
                                                    <p className="p-4 text-center text-sm text-destructive">
                                                        {getErrorMessage(
                                                            judge0Error,
                                                            "Failed to load programming languages from Judge0",
                                                        )}
                                                    </p>
                                                ) : filteredJudge0Languages.length === 0 ? (
                                                    <p className="p-6 text-center text-sm text-muted-foreground">
                                                        No programming language found.
                                                    </p>
                                                ) : (
                                                    <ul>
                                                        {filteredJudge0Languages.map((lang) => (
                                                            <li key={lang.id}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        field.onChange(lang.id)
                                                                    }
                                                                    className={cn(
                                                                        "flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                                                                        field.value === lang.id &&
                                                                            "bg-accent text-accent-foreground",
                                                                    )}
                                                                >
                                                                    {lang.name}
                                                                    <Check
                                                                        className={cn(
                                                                            "size-4 shrink-0 text-primary",
                                                                            field.value === lang.id
                                                                                ? "opacity-100"
                                                                                : "opacity-0",
                                                                        )}
                                                                    />
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Auto-generated from the language name"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="file_extension"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>File extension (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder=".py"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="monaco_language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monaco language id (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="python"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending || !selectedJudge0Language}>
                                {isPending && (
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                )}
                                Add programming language
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export function LanguagesClient() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<PlatformLanguageResponse | null>(null);

    const { data, isLoading, isError, error, refetch } =
        useGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGet();

    const { mutate: deleteLanguage, isPending: isDeleting } =
        useDeletePlatformLanguageApiV1QuestionsLanguagesPlatformLanguageIdDelete({
            mutation: {
                onSuccess: () => {
                    toast.success("Programming language deleted");
                    setDeleteTarget(null);
                    queryClient.invalidateQueries({
                        queryKey:
                            getGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGetQueryKey(),
                    });
                },
                onError: (deleteError) =>
                    toast.error(
                        getErrorMessage(deleteError, "Failed to delete programming language"),
                    ),
            },
        });

    const languages = useMemo(() => data?.data?.languages ?? [], [data]);

    const filteredLanguages = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return languages;
        return languages.filter(
            (lang) =>
                lang.name.toLowerCase().includes(q) ||
                lang.slug.toLowerCase().includes(q) ||
                (lang.file_extension ?? "").toLowerCase().includes(q) ||
                (lang.monaco_language ?? "").toLowerCase().includes(q),
        );
    }, [languages, search]);

    return (
        <div className="grid grid-cols-1 gap-5">
            <Card className="border-border/60">
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Code2 className="size-5 text-primary" />
                                Programming Language Directory
                            </CardTitle>
                            <CardDescription>
                                Programming languages available for question templates and
                                submissions.
                            </CardDescription>
                        </div>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus data-icon="inline-start" />
                            Add Programming Language
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search programming languages"
                            className="pl-9"
                        />
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} className="h-28 rounded-lg" />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
                            <AlertCircle className="size-8 text-destructive" />
                            <p className="font-semibold text-destructive">
                                Failed to load programming languages
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {getErrorMessage(error, "Please try again.")}
                            </p>
                            <Button variant="outline" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    ) : filteredLanguages.length === 0 ? (
                        <EmptyState
                            icon={Code2}
                            title="No programming languages found"
                            description={
                                languages.length === 0
                                    ? "Add a programming language from Judge0 to get started."
                                    : "Try a different search term."
                            }
                            compact
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredLanguages.map((language) => (
                                <Card
                                    key={language.id}
                                    className="group relative border-border/60 py-0 transition-all hover:border-primary/40 hover:shadow-md"
                                >
                                    <CardContent className="flex items-start gap-3 p-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Code2 className="size-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 pr-6">
                                                <h2 className="truncate font-semibold">
                                                    {language.name}
                                                </h2>
                                            </div>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                <Badge
                                                    variant="secondary"
                                                    className="font-mono text-[11px]"
                                                >
                                                    {language.slug}
                                                </Badge>
                                                {language.file_extension && (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1 font-mono text-[11px] text-muted-foreground"
                                                    >
                                                        <FileCode2 className="size-3" />
                                                        {language.file_extension}
                                                    </Badge>
                                                )}
                                                {language.monaco_language && (
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-[11px] text-muted-foreground"
                                                    >
                                                        {language.monaco_language}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-3 top-3 size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                                            disabled={isDeleting}
                                            onClick={() => setDeleteTarget(language)}
                                            aria-label={`Delete ${language.name}`}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddLanguageDialog open={createOpen} onOpenChange={setCreateOpen} />

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete &quot;{deleteTarget?.name}&quot;?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the programming language from the platform. Questions
                            or submissions using it may be affected. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                            onClick={() => {
                                if (deleteTarget) deleteLanguage({ languageId: deleteTarget.id });
                            }}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
