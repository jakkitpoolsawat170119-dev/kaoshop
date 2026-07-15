// สมอง AI ของ Content Studio — เรียก OpenAI สร้างคอนเทนต์ TikTok (บทพูด/แคปชั่น/แฮชแท็ก)
// server-only: อ่าน OPENAI_API_KEY จาก env เท่านั้น ห้าม import จากฝั่ง client

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

export type Tone = "warm" | "sharp" | "genz";
export type Angle = "problem" | "price" | "feature" | "compare";
export type HookStyle =
  | "mixed"
  | "question"
  | "number"
  | "story"
  | "pov"
  | "greeting";
export type Length = "short" | "medium" | "long";

export interface GenerateOptions {
  productName: string;
  features?: string; // จุดเด่น/ข้อมูลเพิ่มเติม (เช่น pros, ราคา, รีวิว)
  tone?: Tone;
  angle?: Angle; // มุมขาย
  hookStyle?: HookStyle; // สไตล์ hook (mixed = คละ/สุ่ม)
  length?: Length; // ความยาวแคปชั่น
  count?: number; // จำนวนเวอร์ชันที่ต้องการ (default 3)
  seedCaption?: string; // "ขออีก 3 แบบนี้" — ทำแนวเดียวกับแคปชั่นตัวอย่าง
}

export type RemixMode = "punchier" | "shorter";

export interface TikTokVariation {
  script: string; // บทพูด/สคริปต์วิดีโอ
  caption: string; // แคปชั่น
  hashtags: string[]; // แฮชแท็ก
}

// โทนการเขียน — ยกมาจาก Category Config ใน n8n (KaoShop Review Automation)
const TONE_VOICES: Record<Tone, string> = {
  warm: "โทนอบอุ่น เป็นกันเอง เหมือนเพื่อนสนิทเล่าให้ฟัง จริงใจ ชวนคุย",
  sharp: "โทนกระชับ เฉียบคม ตรงประเด็น จับใจความไว ไม่อ้อมค้อม",
  genz: "โทนสนุกวัยรุ่น มีคำแสลง Gen-Z พลังงานสูง กวนๆ นิดๆ",
};

// มุมขาย — ชี้ทิศทางว่าจะดันจุดไหนเป็นพระเอก
const ANGLE_TEXT: Record<Angle, string> = {
  problem: "มุมขาย: เปิดด้วยปัญหาที่ลูกค้าเจอ แล้วเสนอสินค้าเป็นทางแก้",
  price: "มุมขาย: ชูความคุ้มค่า/ราคาโดนใจเป็นจุดขายหลัก",
  feature: "มุมขาย: ชูฟีเจอร์/จุดเด่นของสินค้าเป็นหลัก",
  compare: "มุมขาย: ชูว่าดีกว่า/ต่างจากตัวเลือกทั่วไปยังไง",
};

// ความยาวแคปชั่น (จำนวนคำ)
const LENGTH_TEXT: Record<Length, string> = {
  short: "สั้นมาก 1-2 ประโยค ~15-30 คำ",
  medium: "กระชับ 2-3 ประโยค ~30-55 คำ",
  long: "ยาวขึ้นหน่อย 3-4 ประโยค ~55-85 คำ",
};

// สไตล์ hook แบบเจาะจง (ตอนผู้ใช้เลือกเอง)
const HOOK_NAMED: Record<Exclude<HookStyle, "mixed">, string> = {
  question: "เปิดด้วยคำถามชวนสงสัย",
  number: "เปิดด้วยตัวเลข/สถิติที่ช็อก",
  story: "เปิดด้วยการเล่าปัญหาแล้วเฉลยทางแก้",
  pov: "เปิดแบบ POV (มุมมองคนใช้จริง)",
  greeting: "เปิดด้วยการทักทายสดใส แล้วโยนของเด็ดทันที",
};

// รายการ hook สำหรับโหมดคละ (mixed) — กระจายให้แต่ละเวอร์ชันเปิดไม่เหมือนกัน
const HOOK_STYLES = Object.values(HOOK_NAMED);

// เลือก hook สำหรับ n เวอร์ชัน — โหมด mixed = คละไม่ซ้ำ, เจาะจง = ใช้อันเดียวทุกเวอร์ชัน (ต่างที่ถ้อยคำ)
function pickHooks(n: number, hookStyle: HookStyle): string[] {
  if (hookStyle !== "mixed") {
    return Array(n).fill(HOOK_NAMED[hookStyle]);
  }
  const pool = [...HOOK_STYLES];
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    if (pool.length === 0) pool.push(...HOOK_STYLES);
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function buildSystemPrompt(tone: Tone, length: Length): string {
  return [
    "คุณเป็น TikTok Content Creator สายรีวิวสินค้าภาษาไทย",
    `น้ำเสียงงานชิ้นนี้: ${TONE_VOICES[tone]}`,
    "",
    "สำคัญ: คอนเทนต์นี้จะแปะคู่กับ 'คลิปวิดีโอที่รีวิวสินค้าอยู่แล้ว' — แคปชั่นจึงมีหน้าที่ 'เสริมคลิป' ไม่ใช่รีวิวซ้ำ ปล่อยให้คลิปเป็นคนรีวิว",
    "",
    "แต่ละเวอร์ชันต้องมี 3 ส่วน:",
    '- "script" (บทพูด สำรองไว้เผื่ออัดคลิปเอง): ภาษาไทย 20-26 คำ โครง hook→เนื้อ→ปิดด้วย CTA',
    `- "caption": แคปชั่น "เสริมวิดีโอ" ${LENGTH_TEXT[length]} — ห้ามรีวิวซ้ำเนื้อในคลิป! ขึ้นด้วย hook ที่ทำให้หยุดดู แล้วปิดด้วย CTA (เช่น "ดูให้จบ", "ของมันต้องมี", "รายละเอียดในไบโอ") กระตุ้นให้ดูคลิป+อยากได้ ไม่ยัดสเปกยาว`,
    '- "hashtags": อาเรย์ 5-8 แฮชแท็ก ต้องมี #KaoShop #รีวิวสินค้า #ของออกใหม่ เสมอ ที่เหลือให้เกี่ยวกับสินค้า',
    "",
    "ห้ามแต่งข้อมูลเท็จเกินจริง อิงจากข้อมูลสินค้าที่ให้เท่านั้น",
    'ตอบเป็น JSON เท่านั้น รูปแบบ: {"variations":[{"script":"...","caption":"...","hashtags":["..."]}]}',
  ].join("\n");
}

function buildUserPrompt(
  opts: GenerateOptions,
  hooks: string[],
  angle: Angle
): string {
  const lines = [
    `ชื่อสินค้า: ${opts.productName}`,
    opts.features ? `ข้อมูล/จุดเด่น: ${opts.features}` : "",
    "",
    ANGLE_TEXT[angle],
    "",
    opts.seedCaption
      ? `ทำ ${hooks.length} เวอร์ชันใหม่ที่ "แนวเดียวกับตัวอย่างนี้" (โทน/จังหวะ/มุมใกล้เคียง) แต่ถ้อยคำใหม่ ไม่ซ้ำของเดิม\nตัวอย่าง: ${opts.seedCaption}`
      : `สร้าง ${hooks.length} เวอร์ชันที่แตกต่างกันชัดเจน โดยแต่ละเวอร์ชันใช้สไตล์ hook ตามนี้:\n${hooks
          .map((h, i) => `เวอร์ชัน ${i + 1}: ${h}`)
          .join("\n")}`,
  ];
  return lines.filter(Boolean).join("\n");
}

/**
 * รีมิกซ์แคปชั่นเดิม — "แรงขึ้น" หรือ "สั้นลง"
 * @throws Error ถ้าไม่ได้ตั้ง OPENAI_API_KEY หรือ API ตอบไม่ปกติ
 */
export async function remixCaption(opts: {
  caption: string;
  mode: RemixMode;
  tone?: Tone;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("ยังไม่ได้ตั้งค่า OPENAI_API_KEY ใน .env");
  }
  if (!opts.caption?.trim()) {
    throw new Error("ต้องมีแคปชั่นเดิมก่อนรีมิกซ์");
  }

  const instruction =
    opts.mode === "punchier"
      ? "เขียนแคปชั่นนี้ใหม่ให้ 'แรงขึ้น' — hook สะดุดกว่าเดิม กระตุ้นอารมณ์/ความอยากได้มากขึ้น ใส่พลังงาน แต่ความยาวใกล้เดิม"
      : "เขียนแคปชั่นนี้ใหม่ให้ 'สั้นลง' — กระชับที่สุด เหลือเฉพาะ hook + CTA ตัดส่วนเยิ่นเย้อออก";

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.85,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "คุณเป็นนักเขียนแคปชั่น TikTok ภาษาไทย ปรับแคปชั่นตามคำสั่ง คงภาษาไทยและอีโมจิที่เข้ากัน ไม่ต้องใส่แฮชแท็ก ตอบเป็น JSON เท่านั้น รูปแบบ {\"caption\":\"...\"}",
        },
        {
          role: "user",
          content: `${instruction}\n\nแคปชั่นเดิม: ${opts.caption}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI ตอบ ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  try {
    const parsed = JSON.parse(content) as { caption?: unknown };
    const caption = String(parsed.caption ?? "").trim();
    if (!caption) throw new Error("empty");
    return caption;
  } catch {
    throw new Error("แปลงผลลัพธ์รีมิกซ์เป็น JSON ไม่ได้");
  }
}

/**
 * เรียก OpenAI สร้างคอนเทนต์ TikTok หลายเวอร์ชัน
 * @throws Error ถ้าไม่ได้ตั้ง OPENAI_API_KEY หรือ API ตอบไม่ปกติ
 */
export async function generateTikTokContent(
  opts: GenerateOptions
): Promise<TikTokVariation[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("ยังไม่ได้ตั้งค่า OPENAI_API_KEY ใน .env");
  }
  if (!opts.productName?.trim()) {
    throw new Error("ต้องระบุชื่อสินค้า (productName)");
  }

  const tone: Tone = opts.tone ?? "warm";
  const angle: Angle = opts.angle ?? "feature";
  const hookStyle: HookStyle = opts.hookStyle ?? "mixed";
  const length: Length = opts.length ?? "medium";
  const count = Math.min(Math.max(opts.count ?? 3, 1), 5);
  const hooks = pickHooks(count, hookStyle);

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.9, // สูงเพื่อให้แต่ละเวอร์ชันหลากหลาย ไม่ซ้ำ
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(tone, length) },
        { role: "user", content: buildUserPrompt(opts, hooks, angle) },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI ตอบ ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("แปลงผลลัพธ์จาก OpenAI เป็น JSON ไม่ได้");
  }

  const rawList = (parsed as { variations?: unknown }).variations;
  if (!Array.isArray(rawList) || rawList.length === 0) {
    throw new Error("OpenAI ไม่ได้คืน variations ที่ใช้ได้");
  }

  return rawList.map((v): TikTokVariation => {
    const item = v as Partial<TikTokVariation> & { hashtags?: unknown };
    const hashtags = Array.isArray(item.hashtags)
      ? item.hashtags.map((h) => String(h).trim()).filter(Boolean)
      : [];
    return {
      script: String(item.script ?? "").trim(),
      caption: String(item.caption ?? "").trim(),
      hashtags,
    };
  });
}
