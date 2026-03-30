export interface BusinessCard {
  id?: number;
  name: string;
  company: string;
  department: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  memo: string;
  rawOcrText: string;
  imageDataUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OcrProgress {
  status: string;
  progress: number;
}

export interface ParsedFields {
  name: string;
  company: string;
  department: string;
  title: string;
  email: string;
  phone: string;
  address: string;
}

export function emptyBusinessCard(): Omit<BusinessCard, "id"> {
  const now = new Date();
  return {
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
    createdAt: now,
    updatedAt: now,
  };
}
