"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileToImageData = fileToImageData;
async function fileToImageData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
// multimodal patch 1
// multimodal patch 2
// multimodal patch 3
// multimodal patch 4
// multimodal patch 5
// multimodal patch 6
// multimodal patch 7
// multimodal patch 8
// multimodal patch 9
// multimodal patch 10
// multimodal patch 11
// multimodal patch 12
//# sourceMappingURL=ImageInput.js.map