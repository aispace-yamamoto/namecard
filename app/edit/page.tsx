"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import CardForm from "@/components/CardForm";
import { db } from "@/lib/db";

function EditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardId = Number(searchParams.get("id"));

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!cardId) {
      setLoading(false);
      return;
    }
    (async () => {
      const card = await db.cards.get(cardId);
      if (card) {
        setFormData({
          name: card.name,
          company: card.company,
          department: card.department,
          title: card.title,
          email: card.email,
          phone: card.phone,
          address: card.address,
          memo: card.memo,
          rawOcrText: card.rawOcrText,
          imageDataUrl: card.imageDataUrl,
        });
      }
      setLoading(false);
    })();
  }, [cardId]);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await db.cards.update(cardId, {
        ...formData,
        updatedAt: new Date(),
      });
      router.push(`/detail?id=${cardId}`);
    } catch (err) {
      console.error("Save error:", err);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }, [cardId, formData, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-dvh">
        <Header title="編集" showBack />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <Header title="名刺を編集" showBack />
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

export default function EditPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-dvh text-gray-400">読み込み中...</div>}>
      <EditContent />
    </Suspense>
  );
}
