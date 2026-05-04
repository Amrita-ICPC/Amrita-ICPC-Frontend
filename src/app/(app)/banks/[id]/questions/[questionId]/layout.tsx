"use client";

import { EditorProvider } from "@/components/shared/TipTap";

export default function BankQuestionEditorLayout({ children }: { children: React.ReactNode }) {
    return <EditorProvider>{children}</EditorProvider>;
}
