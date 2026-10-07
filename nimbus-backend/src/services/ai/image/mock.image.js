// 1x1 PNG, for tests / offline dev (ACTIVE_IMAGE_PROVIDER=mock).
const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export const mockImage = {
    name: 'mock',
    async generateImage() {
        return { buffer: Buffer.from(PNG_1X1, 'base64'), mimeType: 'image/png', provider: 'mock', model: 'mock' };
    },
};
