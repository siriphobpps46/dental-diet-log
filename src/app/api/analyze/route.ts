import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Fallback keyword checker for mock response when API key is missing
const RISK_KEYWORDS = [
  "หวาน", "น้ำตาล", "น้ำอัดลม", "โซดา", "ชานมไข่มุก", "ชาไข่มุก",
  "เค้ก", "คุกกี้", "ลูกอม", "ท็อฟฟี่", "ช็อกโกแลต", "ไอศกรีม",
  "เยลลี่", "ขนมหวาน", "น้ำหวาน", "บิงซู", "โดนัท", "เบเกอรี่",
  "น้ำผลไม้", "ชาเย็น", "กาแฟเย็น"
];

function getMockAnalysis(description: string, water: string) {
  const combinedText = `${description} ${water}`.toLowerCase();
  const hasRisk = RISK_KEYWORDS.some((kw) => combinedText.includes(kw));

  if (hasRisk) {
    return {
      riskLevel: "high" as const,
      foodItems: [description || "ของหวาน/น้ำหวาน"],
      dentalAnalysis: "ตรวจพบอาหารหรือเครื่องดื่มที่มีส่วนผสมของน้ำตาลหรือของหวาน ซึ่งมีความเสี่ยงสูงที่จะเกิดการสะสมของคราบจุลินทรีย์และกรดที่ทำลายเคลือบฟัน",
      recommendation: "แนะนำให้ดื่มน้ำเปล่าตามทันทีหลังจากทานเสร็จ และบ้วนปากหรือแปรงฟันหลังจากทานอาหารเสร็จแล้ว 30 นาที",
    };
  }

  return {
    riskLevel: "low" as const,
    foodItems: description ? [description] : [],
    dentalAnalysis: "ไม่ตรวจพบอาหารกลุ่มเสี่ยงฟันผุเด่นชัด อาหารประเภทนี้มีความเสี่ยงต่อฟันผุค่อนข้างต่ำ",
    recommendation: "ดื่มน้ำสะอาดให้เพียงพอ และรักษาสุขอนามัยช่องปากตามปกติโดยการแปรงฟันอย่างน้อยวันละ 2 ครั้ง",
  };
}

export async function POST(request: Request) {
  try {
    const { description, water, photoUrls } = await request.json();

    // 1. Fallback to mock if API key is not configured
    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Using fallback heuristic analyzer.");
      const mockResult = getMockAnalysis(description, water);
      return NextResponse.json(mockResult);
    }

    // 2. Fetch and prepare image parts if photoUrls exist
    const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
    if (photoUrls && Array.isArray(photoUrls)) {
      for (const url of photoUrls) {
        try {
          const imgRes = await fetch(url);
          if (!imgRes.ok) continue;

          const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
          const arrayBuffer = await imgRes.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString("base64");

          imageParts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        } catch (err) {
          console.error(`Failed to fetch and convert image at URL ${url}:`, err);
        }
      }
    }

    // 3. Build contents for Gemini
    const textPrompt = `วิเคราะห์ความเสี่ยงฟันผุ (Cariogenic Risk) จากข้อมูลอาหารและรูปภาพที่แนบ (ถ้ามี)

คำอธิบายอาหาร: "${description || "ไม่ได้ระบุ"}"
น้ำดื่มร่วมด้วย: "${water || "ไม่ได้ระบุ"}"

กำหนดระดับความเสี่ยง (riskLevel):
- "high": น้ำตาลสูง, ของหวาน, เบเกอรี่, ขนมเหนียวติดฟัน, น้ำหวาน, น้ำอัดลม, ชานมไข่มุก, น้ำผลไม้เข้มข้น
- "medium": แป้งคาร์โบไฮเดรต (ข้าว ขนมปัง เส้น), ผลไม้รสเปรี้ยว, นมรสหวาน, ชา/กาแฟน้ำตาลน้อย
- "low": น้ำเปล่า, นมจืด, ชีส, ถั่ว, ผักสด, อาหารโปรตีนสูง

กฎการตอบ: dentalAnalysis และ recommendation ต้องกระชับ ไม่เกิน 1-2 ประโยคสั้น ๆ เป็นภาษาไทย`;

    const contents = [
      {
        parts: [
          { text: textPrompt },
          ...imageParts,
        ],
      },
    ];

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              riskLevel: {
                type: "STRING",
                enum: ["high", "medium", "low"],
              },
              foodItems: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
              dentalAnalysis: {
                type: "STRING",
              },
              recommendation: {
                type: "STRING",
              },
            },
            required: ["riskLevel", "foodItems", "dentalAnalysis", "recommendation"],
          },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      throw new Error(`Gemini API error (Status ${geminiRes.status}): ${errorText}`);
    }

    const resJson = await geminiRes.json();
    const candidateText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("No response text received from Gemini API");
    }

    const analysisResult = JSON.parse(candidateText.trim());
    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error("AI Analysis route error:", error);
    // Return mock response as a fallback rather than failing the request entirely
    return NextResponse.json({
      riskLevel: "low",
      foodItems: [],
      dentalAnalysis: "ไม่สามารถเชื่อมต่อระบบวิเคราะห์ด้วย AI ได้ในขณะนี้ ระบบจึงจำลองระดับความเสี่ยงต่ำไว้เพื่อความปลอดภัย",
      recommendation: "โปรดลองใหม่อีกครั้งภายหลัง หรือแปรงฟันทำความสะอาดช่องปากตามปกติหลังมื้ออาหาร",
    });
  }
}
