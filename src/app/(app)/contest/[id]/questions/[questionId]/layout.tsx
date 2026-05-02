"use client";

import { EditorProvider } from "@/components/shared/TipTap";

export default function ContestQuestionEditorLayout({ children }: { children: React.ReactNode }) {
    return <EditorProvider>{children}</EditorProvider>;
}
