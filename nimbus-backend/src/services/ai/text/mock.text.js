// Deterministic provider for tests / offline dev (ACTIVE_TEXT_PROVIDER=mock).
export const mockText = {
    name: 'mock',
    async generateText({ prompt }) {
        return `MOCK TEXT: ${String(prompt).slice(0, 60)}`;
    },
    async generateJSON({ prompt }) {
        return { mock: true, echo: String(prompt).slice(0, 60) };
    },
};
