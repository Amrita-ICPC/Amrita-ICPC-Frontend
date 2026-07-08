"use client";

import "katex/dist/katex.min.css";

import { mergeAttributes, Node } from "@tiptap/core";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import Mathematics from "@tiptap/extension-mathematics";
import Placeholder from "@tiptap/extension-placeholder";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    Bold,
    Code,
    Heading1,
    Heading2,
    ImagePlus,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Loader2,
    Redo,
    Sigma,
    Strikethrough,
    Terminal,
    Undo,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { createContext, ReactNode, useContext, useRef } from "react";
import { toast } from "sonner";
import { Markdown } from "tiptap-markdown";

import { useUploadImageApiV1UploadPost } from "@/api/generated/images/images";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { MathSymbolPicker } from "../questions/math-symbol-picker";

const EditorContext = createContext<Editor | null | undefined>(undefined);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const Image = Node.create({
    name: "image",

    inline: true,
    group: "inline",
    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            title: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [{ tag: "img[src]" }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "img",
            mergeAttributes(HTMLAttributes, {
                class: "my-4 inline-block max-w-full rounded-lg border border-border/60 bg-muted/20 shadow-sm",
                loading: "lazy",
            }),
        ];
    },

    addStorage() {
        return {
            markdown: {
                serialize(state: any, node: any) {
                    const { src, alt, title } = node.attrs;
                    const safeAlt = state.esc(alt ?? "");
                    const safeSrc = state.esc(src ?? "");
                    const safeTitle = title ? ` ${state.quote(title)}` : "";

                    state.write(`![${safeAlt}](${safeSrc}${safeTitle})`);
                },
            },
        };
    },
});

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
            Image,
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
                class: "prose prose-sm sm:prose-base dark:prose-invert prose-headings:font-bold prose-a:text-primary focus:outline-none max-w-none p-6 [&_ul]:list-disc [&_ol]:list-decimal prose-p:my-4 prose-p:leading-relaxed whitespace-pre-wrap min-h-[650px] [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-border/60 [&_img]:bg-muted/20 [&_img]:shadow-sm",
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
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const uploadImage = useUploadImageApiV1UploadPost();

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

    const insertImage = (src: string, alt?: string, title?: string) => {
        editor
            .chain()
            .focus()
            .insertContent({
                type: "image",
                attrs: {
                    src,
                    alt: alt || "Question image",
                    title: title || null,
                },
            })
            .run();
    };

    const insertImageFromUrl = () => {
        const url = window.prompt("Image URL");
        if (!url) return;

        const alt = window.prompt("Alt text", "Question image") ?? "Question image";
        insertImage(url, alt);
    };

    const handleImageFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file");
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            toast.error("Image must be 5MB or smaller");
            return;
        }

        try {
            const response = await uploadImage.mutateAsync({ data: { file } });
            const url = response.data?.url;

            if (!url) {
                toast.error("Upload completed, but no image URL was returned");
                return;
            }

            const alt = file.name
                .replace(/\.[^.]+$/, "")
                .replace(/[-_]+/g, " ")
                .trim();
            insertImage(url, alt || "Question image", file.name);
            toast.success("Image added to the statement");
        } catch {
            toast.error("Could not upload image");
        }
    };

    const handleImageInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        await handleImageFile(file);
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/40 bg-muted/20">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleImageInputChange}
            />
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

                <ToolbarButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadImage.isPending}
                    title={uploadImage.isPending ? "Uploading image" : "Upload Image"}
                >
                    {uploadImage.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <ImagePlus className="h-4 w-4" />
                    )}
                </ToolbarButton>
                <ToolbarButton onClick={insertImageFromUrl} title="Insert Image URL">
                    <ImagePlus className="h-4 w-4" />
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
