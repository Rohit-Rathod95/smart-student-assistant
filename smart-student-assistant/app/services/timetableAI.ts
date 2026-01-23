const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
  GEMINI_API_KEY;

/**
 * Converts OCR/PDF text into Weekly Timetable JSON
 */
export async function parseTimetableWithGemini(inputText: string) {
  const prompt = `
You are given text extracted from a college timetable (it may come from image OCR or PDF).

Your job:
- Understand the timetable (it may be in table/grid or messy format)
- Convert it into STRICT JSON ONLY in this format:

{
  "Monday": [
    { "start": "09:00", "end": "10:00", "subject": "Maths" },
    { "start": "11:00", "end": "12:00", "subject": "DBMS" }
  ],
  "Tuesday": [
    { "start": "10:00", "end": "11:00", "subject": "CN" }
  ]
}

CRITICAL RULES:
- Output ONLY JSON
- No explanation text
- No markdown
- No \`\`\`
- Use 24-hour time format
- If a day has no classes, omit it
- If table structure is present, interpret rows/columns properly
- If data is unclear, make best logical guess
- Subjects should be short names

Here is the extracted text:
<<<
${inputText}
>>>
`;

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  const json = await res.json();

  let text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("❌ Gemini returned empty response");
  }

  console.log("🧠 RAW GEMINI RESPONSE:", text);

  // 🛡️ Clean markdown if Gemini adds it
  text = text.trim();

  if (text.startsWith("```")) {
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  }

  // 🛡️ Extra safety: try to extract JSON block
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("❌ Gemini did not return JSON");
  }

  const jsonOnly = text.slice(firstBrace, lastBrace + 1);

  try {
    const parsed = JSON.parse(jsonOnly);

    console.log("✅ PARSED TIMETABLE JSON:", parsed);

    return parsed;
  } catch (err) {
    console.error("❌ JSON PARSE FAILED. TEXT WAS:\n", jsonOnly);
    throw new Error("❌ Failed to parse timetable JSON");
  }
}
s