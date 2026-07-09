import type { NewPhoto } from "./types";

const MAX_DIMENSION = 1440;
const JPEG_QUALITY = 0.75;

export function compressImage(file: File): Promise<NewPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("อ่านไฟล์รูปไม่สำเร็จ"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("โหลดรูปไม่สำเร็จ"));
      img.onload = () => {
        const { width, height } = scaledSize(img.width, img.height, MAX_DIMENSION);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("สร้าง canvas ไม่สำเร็จ"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("บีบอัดรูปไม่สำเร็จ"));
              return;
            }
            resolve({
              blob,
              mimeType: "image/jpeg",
              name: renameToJpg(file.name),
            });
          },
          "image/jpeg",
          JPEG_QUALITY
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function scaledSize(width: number, height: number, maxDim: number) {
  if (width <= maxDim && height <= maxDim) return { width, height };
  const ratio = width > height ? maxDim / width : maxDim / height;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

function renameToJpg(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base || "photo"}.jpg`;
}
