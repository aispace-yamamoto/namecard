import type { ParsedFields } from "./types";

// 全角→半角変換 (数字、英字、記号)
function normalizeFullWidth(text: string): string {
  return text.replace(/[\uff01-\uff5e]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
}

// メールアドレス抽出
const EMAIL_RE = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/;

// 電話番号パターン (日本の固定電話、携帯、国際)
const PHONE_RE =
  /(?:\+81|081)?[-\s]?0?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4}|0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4}/;

// 郵便番号
const POSTAL_RE = /〒?\s*\d{3}[-ー]\d{4}/;

// 都道府県
const PREFECTURES = [
  "北海道",
  "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

// 住所キーワード
const ADDRESS_KEYWORDS = ["丁目", "番地", "番", "号", "ビル", "階", "町", "市", "区", "村", "郡"];

// 会社名キーワード
const COMPANY_KEYWORDS = [
  "株式会社", "(株)", "（株）", "有限会社", "(有)", "（有）",
  "合同会社", "合資会社", "一般社団法人", "一般財団法人",
  "Inc.", "Inc", "Co.,Ltd.", "Co., Ltd.", "Corp.", "Corporation",
  "LLC", "Ltd.", "Ltd", "GmbH", "Co.", "Company",
];

// 部署キーワード
const DEPARTMENT_KEYWORDS = [
  "事業部", "本部", "支店", "支社", "営業所",
  "部", "課", "室", "グループ", "チーム", "センター", "セクション",
  "Division", "Department", "Dept.",
];

// 役職キーワード
const TITLE_KEYWORDS = [
  "代表取締役", "取締役", "代表",
  "社長", "副社長", "専務", "常務",
  "部長", "次長", "課長", "係長", "主任", "主査",
  "マネージャー", "リーダー", "ディレクター", "エンジニア",
  "CEO", "CTO", "CFO", "COO", "CIO",
  "VP", "President", "Director", "Manager", "Engineer", "Lead",
  "Senior", "Fellow", "Officer",
];

/**
 * OCR結果テキストから名刺項目を抽出する
 */
export function parseOcrText(rawText: string): ParsedFields {
  const normalized = normalizeFullWidth(rawText);
  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const used = new Set<number>();
  const result: ParsedFields = {
    name: "",
    company: "",
    department: "",
    title: "",
    email: "",
    phone: "",
    address: "",
  };

  // 1. メールアドレス
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(EMAIL_RE);
    if (match) {
      result.email = match[0];
      used.add(i);
      break;
    }
  }

  // 2. 電話番号 (FAXは除外)
  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue;
    const line = lines[i];
    if (/fax/i.test(line) || /ファクス|ファックス/.test(line)) continue;
    const match = line.match(PHONE_RE);
    if (match) {
      result.phone = match[0].replace(/\s+/g, "");
      used.add(i);
      break;
    }
  }

  // 3. 住所 (郵便番号 or 都道府県 or 住所キーワード)
  const addressLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue;
    const line = lines[i];
    const isAddress =
      POSTAL_RE.test(line) ||
      PREFECTURES.some((p) => line.includes(p)) ||
      ADDRESS_KEYWORDS.some((k) => line.includes(k));
    if (isAddress) {
      addressLines.push(line);
      used.add(i);
    }
  }
  result.address = addressLines.join(" ");

  // 4. 会社名
  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue;
    const line = lines[i];
    if (COMPANY_KEYWORDS.some((k) => line.includes(k))) {
      result.company = line;
      used.add(i);
      break;
    }
  }

  // 5. 部署
  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue;
    const line = lines[i];
    if (DEPARTMENT_KEYWORDS.some((k) => line.includes(k))) {
      result.department = line;
      used.add(i);
      break;
    }
  }

  // 6. 役職
  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue;
    const line = lines[i];
    if (TITLE_KEYWORDS.some((k) => line.includes(k))) {
      result.title = line;
      used.add(i);
      break;
    }
  }

  // 7. 氏名 (残りの行から推定)
  // 短めの漢字列、またはURLでもメールでもない短い文字列を候補にする
  const nameCandidates: { line: string; index: number; score: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue;
    const line = lines[i];
    // URL、ウェブアドレスを除外
    if (/https?:|www\.|\.com|\.co\.jp|\.jp|\.net|\.org/i.test(line)) continue;
    // 数字ばかりの行を除外
    if (/^\d[\d\s\-+().]+$/.test(line)) continue;

    let score = 0;
    // 漢字2-6文字 (典型的な日本人名)
    if (/^[\u4e00-\u9fff\s]{2,10}$/.test(line)) {
      score += 10;
      // 先頭に近いほど名前の可能性が高い
      score += Math.max(0, 5 - i);
    }
    // 英語名 (2-3単語)
    if (/^[A-Za-z]+\s+[A-Za-z]+(\s+[A-Za-z]+)?$/.test(line) && line.length < 30) {
      score += 8;
      score += Math.max(0, 5 - i);
    }
    // 短い行は名前の可能性が高い
    if (line.length <= 10) score += 3;

    if (score > 0) {
      nameCandidates.push({ line, index: i, score });
    }
  }

  if (nameCandidates.length > 0) {
    nameCandidates.sort((a, b) => b.score - a.score);
    result.name = nameCandidates[0].line;
    used.add(nameCandidates[0].index);
  }

  return result;
}
