"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemPromptManager = void 0;
const BUILT_IN_PROMPTS = [
    {
        id: 'default',
        name: 'Default Jarvis',
        content: `You are Jarvis, an intelligent autonomous AI desktop agent. You have access to tools that let you read and write files, execute shell commands, browse the web, and more. Always be helpful, precise, and safety-conscious. When using tools, confirm destructive operations with the user.`,
    },
    {
        id: 'developer',
        name: 'Developer Assistant',
        content: `You are Jarvis, a senior software engineer assistant. Focus on code quality, best practices, and practical solutions. Prefer concise, well-structured code over verbose explanations. When you read code, identify issues and suggest improvements proactively.`,
    },
    {
        id: 'writer',
        name: 'Writing Assistant',
        content: `You are Jarvis, a professional writing assistant. Help with drafting, editing, and refining text. Adapt your tone to match the user's style. Focus on clarity, conciseness, and impact.`,
    },
    {
        id: 'research',
        name: 'Research Assistant',
        content: `You are Jarvis, a thorough research assistant. When answering questions, search the web for current information, cite sources, and synthesize information from multiple perspectives. Always distinguish between facts, analysis, and opinion.`,
    },
];
class SystemPromptManager {
    customPrompts = [];
    activeId = 'default';
    getActivePrompt() {
        const all = [...BUILT_IN_PROMPTS, ...this.customPrompts];
        return all.find((p) => p.id === this.activeId)?.content ?? BUILT_IN_PROMPTS[0].content;
    }
    setActive(id) {
        const all = [...BUILT_IN_PROMPTS, ...this.customPrompts];
        if (all.some((p) => p.id === id)) {
            this.activeId = id;
            return true;
        }
        return false;
    }
    addCustomPrompt(template) {
        const id = `custom-${Date.now()}`;
        this.customPrompts.push({ ...template, id });
        return id;
    }
    removeCustomPrompt(id) {
        const idx = this.customPrompts.findIndex((p) => p.id === id);
        if (idx !== -1) {
            this.customPrompts.splice(idx, 1);
        }
    }
    listAll() {
        return [
            ...BUILT_IN_PROMPTS.map((p) => ({ ...p })),
            ...this.customPrompts.map((p) => ({ ...p })),
        ];
    }
    interpolate(template, vars) {
        return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
    }
}
exports.SystemPromptManager = SystemPromptManager;
//# sourceMappingURL=SystemPromptManager.js.map