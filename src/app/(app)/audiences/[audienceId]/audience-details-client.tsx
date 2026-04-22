"use client";

import { useRef, useState } from "react";
import { Pencil, Trash2, Upload, UserPlus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { UserRole } from "@/api/generated/model";
import { AudienceDeleteDialog } from "@/components/audience/audience-delete-dialog";
import { AudienceEditDialog } from "@/components/audience/audience-edit-dialog";
import { Button } from "@/components/ui/button";
import { AudienceDetailsHeader } from "@/components/audience/details/audience-details-header";
import { AudienceStatsGrid } from "@/components/audience/details/audience-stats-grid";
import { AudienceUsersTableCard } from "@/components/audience/details/audience-users-table-card";
import { AddAudienceUsersDialog } from "@/components/audience/details/add-audience-users-dialog";
import { ConfirmBulkUploadDialog } from "@/components/audience/details/confirm-bulk-upload-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { toApiError } from "@/lib/api/error";
import { extractEmailsFromFile } from "@/lib/utils/file-parser";
import { clampPage, clampPageSize } from "@/lib/utils/pagination";
import { toast } from "@/lib/hooks/use-toast";
import {
    useAudience,
    useAudienceUsers,
    useRemoveAudienceUsers,
    useAddAudienceUsersByEmail,
    useDeleteAudience,
} from "@/query/audience-query";

const USER_ROLES = ["student", "instructor", "manager", "admin"] as const;

type RoleFilter = UserRole | "all";

function parseRoleFilter(value: string | null): RoleFilter {
    if (!value) return "all";
    if ((USER_ROLES as readonly string[]).includes(value)) return value as UserRole;
    return "all";
}

export function AudienceDetailsClient({
    audienceId,
    initialPage,
    initialPageSize,
    initialRole,
}: {
    audienceId: string;
    initialPage: number;
    initialPageSize: number;
    initialRole: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [parsedEmails, setParsedEmails] = useState<string[] | null>(null);
    const [isConfirmingUpload, setIsConfirmingUpload] = useState(false);

    const [isRemovingUsers, setIsRemovingUsers] = useState(false);
    const [isAddUsersOpen, setIsAddUsersOpen] = useState(false);

    const [localSearch, setLocalSearch] = useState(searchParams.get("q") ?? "");
    const debouncedLocalSearch = useDebounce(localSearch, 250);

    const page = clampPage(
        Number.parseInt(searchParams.get("page") || String(initialPage || 1), 10),
    );
    const pageSize = clampPageSize(
        Number.parseInt(searchParams.get("page_size") || String(initialPageSize || 10), 10),
    );
    const roleFilter = parseRoleFilter(searchParams.get("role") || initialRole || null);

    const audienceQuery = useAudience(audienceId);
    const usersQuery = useAudienceUsers(audienceId, {
        page,
        page_size: pageSize,
        role: roleFilter === "all" ? null : roleFilter,
        q: debouncedLocalSearch.trim() || null,
    });

    const removeUsersMutation = useRemoveAudienceUsers();
    const addUsersByEmailMutation = useAddAudienceUsersByEmail();
    const deleteAudienceMutation = useDeleteAudience();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const audience = audienceQuery.data;
    const usersResponse = usersQuery.data?.data;

    const roleCounts = {
        managers: usersResponse?.manager_count ?? 0,
        instructors: usersResponse?.instructor_count ?? 0,
        students: usersResponse?.student_count ?? 0,
    };

    const totalUsers =
        audience?.total_users ?? roleCounts.managers + roleCounts.instructors + roleCounts.students;

    const visibleUsers = usersResponse?.users ?? [];

    const pagination = usersQuery.data?.pagination;

    const setPage = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", String(newPage));
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const setRole = (next: RoleFilter) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (next === "all") newParams.delete("role");
        else newParams.set("role", next);
        newParams.set("page", "1");
        router.replace(`${pathname}?${newParams.toString()}`);
    };

    const setSearch = (nextSearch: string) => {
        setLocalSearch(nextSearch);
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", "1");
        if (nextSearch.trim()) newParams.set("q", nextSearch.trim());
        else newParams.delete("q");
        router.replace(`${pathname}?${newParams.toString()}`);
    };

    const audienceError = audienceQuery.error ? toApiError(audienceQuery.error) : null;
    const usersError = usersQuery.error ? toApiError(usersQuery.error) : null;

    function onPickFile() {
        fileInputRef.current?.click();
    }

    async function onFileChange(file: File | null) {
        if (!file) return;
        setSelectedFileName(file.name);
        toast(`Processing file: ${file.name}`);

        try {
            const emails = await extractEmailsFromFile(file);
            if (emails.length === 0) {
                toast("No valid emails found in the uploaded file.");
                setSelectedFileName(null);
                setParsedEmails(null);
                setIsConfirmingUpload(false);
                return;
            }
            setParsedEmails(emails);
            setIsConfirmingUpload(true);
        } catch {
            toast("Failed to parse file.");
            setSelectedFileName(null);
            setParsedEmails(null);
            setIsConfirmingUpload(false);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    async function onConfirmUpload() {
        if (!parsedEmails || parsedEmails.length === 0) return;

        try {
            const response = await addUsersByEmailMutation.mutateAsync({
                audienceId,
                payload: {
                    emails: parsedEmails,
                },
            });

            const payload = response.data;
            if (!payload) {
                toast("Failed to get a valid response from the server.");
                return;
            }

            const added = payload.added ?? 0;
            const already_present = payload.already_present ?? 0;
            const not_found = payload.not_found ?? 0;
            const total = payload.total ?? 0;

            toast(
                `Processed ${total} emails. Added: ${added}. Already present: ${already_present}. Not found: ${not_found}.`,
            );
            setIsConfirmingUpload(false);
            setParsedEmails(null);
            setSelectedFileName(null);
        } catch (err: unknown) {
            const apiError = toApiError(err);
            toast(apiError.detail ?? apiError.message ?? "Failed to add bulk users");
        }
    }

    function onAddUsers() {
        setIsAddUsersOpen(true);
    }

    async function onRemoveUsers(userIds: string[]) {
        if (userIds.length === 0) return;
        setIsRemovingUsers(true);
        try {
            await removeUsersMutation.mutateAsync({
                audienceId,
                payload: {
                    user_ids: userIds,
                },
            });
            toast(`Successfully removed ${userIds.length} user(s) from the audience.`);
            return true;
        } catch (err) {
            const apiError = toApiError(err);
            toast(apiError.detail ?? apiError.message);
            return false;
        } finally {
            setIsRemovingUsers(false);
        }
    }

    async function onConfirmDeleteAudience() {
        try {
            await deleteAudienceMutation.mutateAsync(audienceId);
            toast("Audience deleted");
            router.push("/audiences");
            router.refresh();
        } catch (error) {
            const apiError = toApiError(error);
            toast(apiError.detail ?? apiError.message ?? "Failed to delete audience");
        } finally {
            setIsDeleteOpen(false);
        }
    }

    return (
        <div className="flex h-full flex-col space-y-6 p-8">
            <AddAudienceUsersDialog
                audienceId={audienceId}
                isOpen={isAddUsersOpen}
                onOpenChange={setIsAddUsersOpen}
            />

            <AudienceDeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                audienceName={audience?.name}
                isPending={deleteAudienceMutation.isPending}
                onConfirm={onConfirmDeleteAudience}
            />

            <AudienceEditDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                audienceId={audienceId}
                audience={audience ?? null}
            />

            <AudienceDetailsHeader
                audienceName={audience?.name}
                audienceType={audience?.audience_type ? String(audience.audience_type) : null}
                description={audience?.description}
                isLoading={audienceQuery.isLoading}
                actions={
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            className="hidden"
                            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                        />

                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(true)}
                                disabled={audienceQuery.isLoading || !audience}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                            <Button type="button" variant="outline" onClick={onAddUsers}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Users
                            </Button>

                            <Button type="button" onClick={onPickFile}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload CSV/Excel
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setIsDeleteOpen(true)}
                                disabled={deleteAudienceMutation.isPending}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>

                        {selectedFileName ? (
                            <p className="text-xs text-muted-foreground">{selectedFileName}</p>
                        ) : null}
                    </>
                }
            />

            {audienceError ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm font-medium">Failed to load audience</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {audienceError.status ? `Status: ${audienceError.status}. ` : ""}
                        {audienceError.detail ?? audienceError.message}
                    </p>
                </div>
            ) : null}

            <AudienceStatsGrid
                isLoading={usersQuery.isLoading}
                totalUsers={totalUsers}
                managers={roleCounts.managers}
                instructors={roleCounts.instructors}
                students={roleCounts.students}
            />

            <AudienceUsersTableCard
                isLoading={usersQuery.isLoading}
                isFetching={usersQuery.isFetching}
                error={
                    usersError
                        ? {
                              status: usersError.status,
                              message: usersError.message,
                              detail: usersError.detail,
                          }
                        : null
                }
                roleFilter={roleFilter}
                onRoleChange={setRole}
                localSearch={localSearch}
                onLocalSearchChange={setSearch}
                users={visibleUsers}
                pagination={
                    pagination
                        ? {
                              page: pagination.page,
                              total_pages: pagination.total_pages,
                              has_previous: pagination.has_previous,
                              has_next: pagination.has_next,
                          }
                        : null
                }
                onPageChange={setPage}
                onRemoveUsers={onRemoveUsers}
                isRemovingUsers={isRemovingUsers}
            />

            <ConfirmBulkUploadDialog
                isOpen={isConfirmingUpload}
                onOpenChange={setIsConfirmingUpload}
                parsedEmailsCount={parsedEmails?.length}
                selectedFileName={selectedFileName}
                isPending={addUsersByEmailMutation.isPending}
                onConfirm={onConfirmUpload}
                onCancel={() => {
                    setIsConfirmingUpload(false);
                    setParsedEmails(null);
                    setSelectedFileName(null);
                }}
            />
        </div>
    );
}
