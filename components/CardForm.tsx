"use client";

import type { BusinessCard } from "@/lib/types";

interface CardFormProps {
  card: Omit<BusinessCard, "id" | "createdAt" | "updatedAt">;
  onChange: (field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
}

const FIELDS: { key: string; label: string; type?: string; multiline?: boolean }[] = [
  { key: "name", label: "氏名" },
  { key: "company", label: "会社名" },
  { key: "department", label: "部署名" },
  { key: "title", label: "役職" },
  { key: "email", label: "メールアドレス", type: "email" },
  { key: "phone", label: "電話番号", type: "tel" },
  { key: "address", label: "住所", multiline: true },
  { key: "memo", label: "メモ", multiline: true },
];

export default function CardForm({ card, onChange, onSave, onCancel, saving }: CardFormProps) {
  return (
    <div className="space-y-4">
      {/* 画像サムネイル */}
      {card.imageDataUrl && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.imageDataUrl}
            alt="名刺画像"
            className="w-full max-h-[200px] object-contain bg-gray-50"
          />
        </div>
      )}

      {/* 入力フィールド */}
      {FIELDS.map(({ key, label, type, multiline }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          {multiline ? (
            <textarea
              value={(card as Record<string, string>)[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <input
              type={type || "text"}
              value={(card as Record<string, string>)[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      ))}

      {/* OCR生テキスト (読み取り専用) */}
      {card.rawOcrText && (
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            OCR生テキスト
          </label>
          <textarea
            value={card.rawOcrText}
            readOnly
            rows={5}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50"
          />
        </div>
      )}

      {/* ボタン */}
      <div className="flex gap-3 pt-2 pb-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-h-[48px] border border-gray-300 rounded-lg font-medium text-gray-700 active:bg-gray-100"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex-1 min-h-[48px] bg-blue-600 text-white rounded-lg font-medium active:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
