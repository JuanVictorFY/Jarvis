export interface ImageData {
  base64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  width?: number;
  height?: number;
}

export async function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve({ base64, mimeType: file.type as ImageData['mimeType'] });
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
