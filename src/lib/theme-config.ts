export type ThemeGroup = "light" | "dark";

export interface ThemeDefinition {
    id: string;
    name: string;
    group: ThemeGroup;
    /** 3 accent dots shown on the picker card: primary, accent, foreground */
    swatches: [string, string, string];
    /** Mini mockup preview colors */
    previewBg: string;
    previewHeader: string;
    previewButton: string;
}

export const THEMES: ThemeDefinition[] = [
    {
        id: "light",
        name: "Default",
        group: "light",
        swatches: ["#2d4fa6", "#e3ebfb", "#1b243b"],
        previewBg: "#f3f5fa",
        previewHeader: "#2d4fa6",
        previewButton: "#2d4fa6",
    },
    {
        id: "forest",
        name: "Forest",
        group: "light",
        swatches: ["#1f7a4d", "#dcefe1", "#1a2b20"],
        previewBg: "#f4f7f3",
        previewHeader: "#1f7a4d",
        previewButton: "#1f7a4d",
    },
    {
        id: "rose",
        name: "Rose",
        group: "light",
        swatches: ["#b8375a", "#f0dbe1", "#2b1c22"],
        previewBg: "#faf5f6",
        previewHeader: "#b8375a",
        previewButton: "#b8375a",
    },
    {
        id: "dark",
        name: "Default",
        group: "dark",
        swatches: ["#6f97ff", "#24356e", "#eef2ff"],
        previewBg: "#0a0f1e",
        previewHeader: "#6f97ff",
        previewButton: "#6f97ff",
    },
    {
        id: "midnight",
        name: "Midnight",
        group: "dark",
        swatches: ["#9c8bff", "#2c2760", "#ece9ff"],
        previewBg: "#0b0a1c",
        previewHeader: "#9c8bff",
        previewButton: "#9c8bff",
    },
    {
        id: "slate",
        name: "Slate",
        group: "dark",
        swatches: ["#8fa8c9", "#2a2e35", "#f2f4f6"],
        previewBg: "#0b0d10",
        previewHeader: "#8fa8c9",
        previewButton: "#8fa8c9",
    },
];

export const THEME_IDS = THEMES.map((t) => t.id);
