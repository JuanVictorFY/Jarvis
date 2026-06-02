"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anthropicToolToProvider = anthropicToolToProvider;
exports.providerToolToOpenAI = providerToolToOpenAI;
exports.providerToolToGemini = providerToolToGemini;
exports.convertToolsForProvider = convertToolsForProvider;
function anthropicToolToProvider(tool) {
    return {
        name: tool.name,
        description: tool.description ?? '',
        parameters: tool.input_schema,
    };
}
function providerToolToOpenAI(tool) {
    return {
        type: 'function',
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
        },
    };
}
function providerToolToGemini(tool) {
    return {
        functionDeclarations: [
            {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
            },
        ],
    };
}
function convertToolsForProvider(tools, target) {
    const providerTools = tools.map(anthropicToolToProvider);
    switch (target) {
        case 'anthropic':
            return providerTools;
        case 'openai':
            return providerTools.map(providerToolToOpenAI);
        case 'gemini':
            return providerTools.map(providerToolToGemini);
        default:
            return providerTools;
    }
}
//# sourceMappingURL=ToolDefinitionConverter.js.map