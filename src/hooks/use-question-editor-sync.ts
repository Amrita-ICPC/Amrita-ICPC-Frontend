import { useEffect } from "react";

export type TabType = "description" | "input" | "output" | "constraints" | "notes";

interface UseQuestionEditorSyncProps {
    editor: any;
    activeTab: string;

    content: {
        description: string;
        inputFormat: string;
        outputFormat: string;
        constraints: string;
        notes: string;
    };

    setters: {
        setDescription: (val: string) => void;
        setInputFormat: (val: string) => void;
        setOutputFormat: (val: string) => void;
        setConstraints: (val: string) => void;
        setNotes: (val: string) => void;
    };
}

export function useQuestionEditorSync({
    editor,
    activeTab,
    content,
    setters,
}: UseQuestionEditorSyncProps) {
    // Sync state -> editor
    useEffect(() => {
        if (!editor) return;

        const tabContentMap: Record<string, string> = {
            description: content.description,
            input: content.inputFormat,
            output: content.outputFormat,
            constraints: content.constraints,
            notes: content.notes,
        };

        const newContent = tabContentMap[activeTab];
        const currentMarkdown = (editor.storage as any).markdown.getMarkdown();

        if (newContent !== currentMarkdown) {
            editor.commands.setContent(newContent);
        }
    }, [editor, activeTab, content]);

    // Sync editor -> state
    useEffect(() => {
        if (!editor) return;

        const handleUpdate = () => {
            const markdown = (editor.storage as any).markdown.getMarkdown();

            switch (activeTab) {
                case "description":
                    setters.setDescription(markdown);
                    break;

                case "input":
                    setters.setInputFormat(markdown);
                    break;

                case "output":
                    setters.setOutputFormat(markdown);
                    break;

                case "constraints":
                    setters.setConstraints(markdown);
                    break;

                case "notes":
                    setters.setNotes(markdown);
                    break;
            }
        };

        editor.on("update", handleUpdate);

        return () => {
            editor.off("update", handleUpdate);
        };
    }, [editor, activeTab, setters]);
}
