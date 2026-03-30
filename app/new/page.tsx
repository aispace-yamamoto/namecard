"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ImageCapture from "@/components/ImageCapture";
import CardForm from "@/components/CardForm";
import { compressImage } from "@/lib/imageUtils";
import { initOcrWorker, recognizeImage, terminateOcrWorker } from "@/lib/ocr";
import { parseOcrText } from "@/lib/parser";
import { db } from "@/lib/db";
import type { OcrProgress } from "@/lib/types";

type Step = "capture" | "form";

export default function NewPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("capture");

  // 画像
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  // OCR状態
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // フォーム
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    department: "",
    title: "",
    email: "",
    phone: "",
    address: "",
    memo: "",
    rawOcrText: "",
    imageDataUrl: "",
  });
  const [saving, setSaving] = useState(false);

  const handleImageSelected = useCallback(async (file: File) => {
    try {
      const dataUrl = await compressImage(file);
      setImageDataUrl(dataUrl);
      setOcrError(null);
    } catch {
      setOcrError("画像の読み込みに失敗しました");
    }
  }, []);

  const handleOcr = useCallback(async () => {
    if (!imageDataUrl) return;
    setOcrRunning(true);
    setOcrProgress(null);
    setOcrError(null);

    try {
      await initOcrWorker((p) => setOcrProgress(p));
      const rawText = await recognizeImage(imageDataUrl);
      const parsed = parseOcrText(rawText);
      setFormData({
        ...parsed,
        memo: "",
        rawOcrText: rawText,
        imageDataUrl: imageDataUrl,
      });
      await terminateOcrWorker();
      setStep("form");
    } catch (err) {
      console.error("OCR error:", err);
      setOcrError("OCR処理に失敗しました。手入力で続けることができます。");
    } finally {
      setOcrRunning(false);
      setOcrProgress(null);
    }
  }, [imageDataUrl]);

  const handleSkipOcr = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      imageDataUrl: imageDataUrl || "",
    }));
    setStep("form");
  }, [imageDataUrl]);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const now = new Date();
      await db.cards.add({
        ...formData,
        createdAt: now,
        updatedAt: now,
      });
      router.push("/");
    } catch (err) {
      console.error("Save error:", err);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }, [formData, router]);

  const handleCancel = useCallback(() => {
    if (step === "form") {
      setStep("capture");
    } else {
      router.push("/");
    }
  }, [step, router]);

  // OCR進捗の表示テキスト
  const progressText = ocrProgress
    ? ocrProgress.status === "recognizing text"
      ? `文字認識中... ${Math.round(ocrProgress.progress * 100)}%`
      : `準備中... ${Math.round(ocrProgress.progress * 100)}%`
    : "OCR実行中...";

  if (step === "form") {
    return (
      <div className="flex flex-col min-h-dvh">
        <Header title="名刺情報を編集" showBack />
        <div className="flex-1 px-4 py-4">
          <CardForm
            card={formData}
            onChange={handleChange}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <Header title="新規登録" showBack />
      <div className="flex-1 px-4 py-4 space-y-4">
        <ImageCapture
          imageDataUrl={imageDataUrl}
          onImageSelected={handleImageSelected}
        />

        {/* OCRエラー */}
        {ocrError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {ocrError}
          </div>
        )}

        {/* OCR進捗 */}
        {ocrRunning && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 text-center">{progressText}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${ocrProgress ? Math.round(ocrProgress.progress * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* アクションボタン */}
        {imageDataUrl && !ocrRunning && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleOcr}
              className="w-full min-h-[52px] bg-blue-600 text-white rounded-lg font-medium text-lg active:bg-blue-700"
            >
              OCRで文字を読み取る
            </button>
            <button
              type="button"
              onClick={handleSkipOcr}
              className="w-full min-h-[48px] text-blue-600 font-medium active:text-blue-700"
            >
              手入力で進む
            </button>
          </div>
        )}

        {/* 画像未選択時 */}
        {!imageDataUrl && (
          <button
            type="button"
            onClick={handleSkipOcr}
            className="w-full min-h-[48px] text-gray-500 font-medium active:text-gray-700"
          >
            画像なしで手入力する
          </button>
        )}
      </div>
    </div>
  );
}
