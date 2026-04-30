"use client";

import { createContext, useContext, ReactNode } from "react";
import { useEditor, Editor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlock from "@tiptap/extension-code-block";
import Mathematics from "@tiptap/extension-mathematics";
import "katex/dist/katex.min.css";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Link as LinkIcon,
    Terminal,
    Undo,
    Redo,
    Sigma,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { MathSymbolPicker } from "../questions/math-symbol-picker";

const EditorContext = createContext<Editor | null | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                link: false,
            }),
            Markdown,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline underline-offset-4 cursor-pointer",
                },
            }),
            Placeholder.configure({
                placeholder: "Write something amazing...",
            }),
            CodeBlock.configure({
                HTMLAttributes: {
                    class: "bg-muted/50 p-4 rounded-lg border border-border/40 font-mono text-sm",
                },
            }),
            Mathematics.configure({}),
        ],
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose-base dark:prose-invert prose-headings:font-bold prose-a:text-primary focus:outline-none max-w-none p-6 [&_ul]:list-disc [&_ol]:list-decimal prose-p:my-4 prose-p:leading-relaxed whitespace-pre-wrap min-h-[400px]",
            },
        },
        immediatelyRender: false,
    });

    return <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>;
}

export function useEditorContext() {
    const editor = useContext(EditorContext);
    if (editor === undefined)
        throw new Error("useEditorContext must be used inside EditorProvider");
    return editor;
}

const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
    kbd,
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
    kbd?: string;
}) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClick}
                disabled={disabled}
                className={cn(
                    "h-8 w-8 p-0 rounded-md",
                    isActive
                        ? "bg-primary/20 text-primary hover:bg-primary/30"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
            >
                {children}
            </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="flex items-center gap-2 px-3 py-1.5 text-xs">
            <span>{title}</span>
            {kbd && (
                <Kbd className="bg-background/20 text-background border-none h-4 min-w-[1.25rem] text-[10px]">
                    {kbd}
                </Kbd>
            )}
        </TooltipContent>
    </Tooltip>
);

export function TiptapToolbar() {
    const editor = useEditorContext();

    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-1 pr-2 border-r border-border/40">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    title="Bold"
                    kbd="⌘B"
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    title="Italic"
                    kbd="⌘I"
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive("strike")}
                    title="Strikethrough"
                    kbd="⌘⇧X"
                >
                    <Strikethrough className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive("code")}
                    title="Inline Code"
                    kbd="⌘E"
                >
                    <Code className="h-4 w-4" />
                </ToolbarButton>
            </div>
            <div className="flex items-center gap-1 px-2 border-r border-border/40">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>
            </div>
            <div className="flex items-center gap-1 px-2 border-r border-border/40">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={setLink}
                    isActive={editor.isActive("link")}
                    title="Add Link"
                    kbd="⌘K"
                >
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive("codeBlock")}
                    title="Code Block"
                    kbd="⌘⌥C"
                >
                    <Terminal className="h-4 w-4" />
                </ToolbarButton>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <div>
                            <MathSymbolPicker
                                onSelect={(latex) =>
                                    editor
                                        .chain()
                                        .focus()
                                        .insertContent({
                                            type: "inlineMath",
                                            attrs: { latex },
                                        })
                                        .run()
                                }
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    >
                                        <Sigma className="h-4 w-4" />
                                    </Button>
                                }
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="px-3 py-1.5 text-xs">
                        Math Symbols
                    </TooltipContent>
                </Tooltip>
            </div>
            <div className="flex items-center gap-1 pl-2">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo"
                    kbd="⌘Z"
                >
                    <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo"
                    kbd="⌘⇧Z"
                >
                    <Redo className="h-4 w-4" />
                </ToolbarButton>
            </div>
        </div>
    );
}

export { EditorContent };
