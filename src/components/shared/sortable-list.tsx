"use client";

import { ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    Modifier,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    SortingStrategy,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";

interface SortableListProps<T extends { id: string }> {
    items: T[];
    onReorder: (activeId: string, overId: string) => void;
    children: ReactNode;
    renderOverlay?: (item: T) => ReactNode;
    strategy?: SortingStrategy;
    modifiers?: Modifier[];
}

export function SortableList<T extends { id: string }>({
    items,
    onReorder,
    children,
    renderOverlay,
    strategy = verticalListSortingStrategy,
    modifiers = [restrictToVerticalAxis, restrictToWindowEdges],
}: SortableListProps<T>) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            onReorder(active.id as string, over.id as string);
        }
        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const activeItem = activeId ? items.find((i) => i.id === activeId) : null;
    const portalTarget = typeof document !== "undefined" ? document.body : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            modifiers={modifiers}
        >
            <SortableContext items={items.map((i) => i.id)} strategy={strategy}>
                {children}
            </SortableContext>

            {portalTarget
                ? createPortal(
                      <DragOverlay
                          adjustScale={false}
                          dropAnimation={{
                              sideEffects: defaultDropAnimationSideEffects({
                                  styles: {
                                      active: {
                                          opacity: "0",
                                      },
                                  },
                              }),
                          }}
                      >
                          {activeItem && renderOverlay ? (
                              <div className="w-full pointer-events-none">
                                  {renderOverlay(activeItem)}
                              </div>
                          ) : null}
                      </DragOverlay>,
                      document.body,
                  )
                : null}
        </DndContext>
    );
}
