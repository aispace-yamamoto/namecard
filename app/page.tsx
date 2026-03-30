"use client";

import { useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import CardListItem from "@/components/CardListItem";

export default function ListPage() {
  const [search, setSearch] = useState("");

  const cards = useLiveQuery(async () => {
    const all = await db.cards.orderBy("createdAt").reverse().toArray();
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [search]);

  return (
    <div className="flex flex-col min-h-dvh">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold">名刺管理</h1>
      </header>

      {/* 検索 */}
      <div className="px-4 pt-3 pb-2">
        <input
          type="search"
          placeholder="氏名、会社名、メールで検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 一覧 */}
      <div className="flex-1 px-4 pb-24">
        {cards === undefined ? (
          <p className="text-center text-gray-400 mt-8">読み込み中...</p>
        ) : cards.length === 0 ? (
          <div className="text-center mt-12 text-gray-400">
            <p className="text-4xl mb-3">📇</p>
            <p>{search ? "該当する名刺がありません" : "名刺がまだありません"}</p>
            {!search && (
              <p className="text-sm mt-1">下のボタンから名刺を登録しましょう</p>
            )}
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {cards.map((card) => (
              <CardListItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>

      {/* 新規追加FAB */}
      <div className="fixed bottom-6 right-4 z-20" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <Link
          href="/new"
          className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg active:bg-blue-700"
          aria-label="新規登録"
        >
          +
        </Link>
      </div>
    </div>
  );
}
