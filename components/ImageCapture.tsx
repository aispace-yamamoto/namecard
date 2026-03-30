"use client";

import { useRef } from "react";

interface ImageCaptureProps {
  imageDataUrl: string | null;
  onImageSelected: (file: File) => void;
}

export default function ImageCapture({ imageDataUrl, onImageSelected }: ImageCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {/* カメラ撮影ボタン */}
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="flex-1 min-h-[52px] bg-blue-600 text-white rounded-lg font-medium active:bg-blue-700"
        >
          📷 撮影
        </button>
        {/* ファイル選択ボタン */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex-1 min-h-[52px] bg-gray-100 text-gray-800 rounded-lg font-medium active:bg-gray-200 border border-gray-300"
        >
          🖼 画像を選択
        </button>
      </div>

      {/* 非表示のinput */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {/* 画像プレビュー */}
      {imageDataUrl && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUrl}
            alt="名刺プレビュー"
            className="w-full max-h-[300px] object-contain bg-gray-50"
          />
        </div>
      )}
    </div>
  );
}
