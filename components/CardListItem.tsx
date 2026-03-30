"use client";

import Link from "next/link";
import type { BusinessCard } from "@/lib/types";

interface CardListItemProps {
  card: BusinessCard;
}

export default function CardListItem({ card }: CardListItemProps) {
  return (
    <Link
      href={`/detail?id=${card.id}`}
      className="block border border-gray-200 rounded-lg p-4 active:bg-gray-50"
    >
      <div className="flex items-start gap-3">
        {/* サムネイル */}
        {card.imageDataUrl && (
          <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.imageDataUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-base truncate">
            {card.name || "（氏名なし）"}
          </p>
          {card.company && (
            <p className="text-sm text-gray-600 truncate">{card.company}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-500">
            {card.email && <span className="truncate max-w-[180px]">{card.email}</span>}
            {card.phone && <span>{card.phone}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
