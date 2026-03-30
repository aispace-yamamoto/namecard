import Dexie, { type EntityTable } from "dexie";
import type { BusinessCard } from "./types";

const db = new Dexie("NameCardDB") as Dexie & {
  cards: EntityTable<BusinessCard, "id">;
};

db.version(1).stores({
  cards: "++id, name, company, email, phone, createdAt",
});

export { db };
