"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { db } from "@/lib/db";
import type { BusinessCard } from "@/lib/types";

function DetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardId = Number(searchParams.get("id"));

  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!cardId) {
      setLoading(false);
      return;
    }
    (async () => {
      const c = await db.cards.get(cardId);
      setCard(c || null);
      setLoading(false);
    })();
  }, [cardId]);

  const handleDelete = useCallback(async () => {
    try {
      await db.cards.delete(cardId);
      router.push("/");
    } catch (err) {
      console.error("Delete error:", err);
      alert("削除に失敗しました");
    }
  }, [cardId, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-dvh">
        <Header title="詳細" showBack />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          読み込み中...
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex flex-col min-h-dvh">
        <Header title="詳細" showBack />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          名刺が見つかりません
        </div>
      </div>
    );
  }

  const fields: { label: string; value: string; href?: string }[] = [
    { label: "氏名", value: card.name },
    { label: "会社名", value: card.company },
    { label: "部署名", value: card.department },
    { label: "役職", value: card.title },
    { label: "メールアドレス", value: card.email, href: card.email ? `mailto:${card.email}` : undefined },
    { label: "電話番号", value: card.phone, href: card.phone ? `tel:${card.phone}` : undefined },
    { label: "住所", value: card.address },
    { label: "メモ", value: card.memo },
  ];

  return (
    <div className="flex flex-col min-h-dvh">
      <Header
        title="名刺詳細"
        showBack
        rightAction={
          <Link
            href={`/edit?id=${card.id}`}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600 font-medium"
          >
            編集
          </Link>
        }
      />

      <div className="flex-1 px-4 py-4 space-y-4">
        {card.imageDataUrl && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.imageDataUrl}
              alt="名刺画像"
              className="w-full max-h-[250px] object-contain bg-gray-50"
            />
          </div>
        )}

        <div className="space-y-3">
          {fields.map(
            ({ label, value, href }) =>
              value && (
                <div key={label}>
                  <p className="text-xs text-gray-500">{label}</p>
                  {href ? (
                    <a href={href} className="text-blue-600 text-base break-all">
                      {value}
                    </a>
                  ) : (
                    <p className="text-base whitespace-pre-wrap">{value}</p>
                  )}
                </div>
              )
          )}
        </div>

        {card.rawOcrText && (
          <div>
            <p className="text-xs text-gray-500 mb-1">OCR生テキスト</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
              {card.rawOcrText}
            </p>
          </div>
        )}

        <div className="pt-4 pb-8">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full min-h-[48px] text-red-600 border border-red-300 rounded-lg font-medium active:bg-red-50"
          >
            この名刺を削除
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-xl w-full max-w-sm p-5 space-y-4">
            <p className="text-center font-medium">この名刺を削除しますか？</p>
            <p className="text-center text-sm text-gray-500">この操作は元に戻せません</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 min-h-[44px] border border-gray-300 rounded-lg font-medium"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 min-h-[44px] bg-red-600 text-white rounded-lg font-medium active:bg-red-700"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-dvh text-gray-400">読み込み中...</div>}>
      <DetailContent />
    </Suspense>
  );
}
