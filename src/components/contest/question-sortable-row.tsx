"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { PaginationResponse, QuestionListSummaryResponse } from "@/api/generated/model";

import { QuestionRow } from "./question-row";

interface QuestionSortableRowProps {
    question: QuestionListSummaryResponse;
    index: number;
    contestId: string;
    pagination?: PaginationResponse;
    isSelected: boolean;
    toggleSelection: () => void;
    canReorder: boolean;
    onRemove: () => void;
}

export function QuestionSortableRow({
    question,
    index,
    contestId,
    pagination,
    isSelected,
    toggleSelection,
    canReorder,
    onRemove,
}: QuestionSortableRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: question.id,
        disabled: !canReorder,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <QuestionRow
                question={question}
                index={index}
                contestId={contestId}
                pagination={pagination}
                isSelected={isSelected}
                toggleSelection={toggleSelection}
                dragHandleProps={{ ...attributes, ...listeners }}
                canReorder={canReorder}
                onRemove={onRemove}
                isDragging={isDragging}
            />
        </div>
    );
}
