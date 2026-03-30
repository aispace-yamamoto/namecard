import { createWorker, type Worker } from "tesseract.js";
import type { OcrProgress } from "./types";

let worker: Worker | null = null;

/**
 * OCRワーカーを初期化する (日本語+英語)
 */
export async function initOcrWorker(
  onProgress?: (p: OcrProgress) => void
): Promise<void> {
  if (worker) return;
  worker = await createWorker(["jpn", "eng"], 1, {
    logger: (m) => {
      if (onProgress && m.status && typeof m.progress === "number") {
        onProgress({ status: m.status, progress: m.progress });
      }
    },
  });
}

/**
 * 画像からテキストを抽出する
 */
export async function recognizeImage(image: string): Promise<string> {
  if (!worker) {
    throw new Error("OCRワーカーが初期化されていません");
  }
  const { data } = await worker.recognize(image);
  return data.text;
}

/**
 * OCRワーカーを終了する
 */
export async function terminateOcrWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
