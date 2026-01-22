const GEMINI_API_KEY =process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export async function cleanNotesWithGemini(topic: string, ocrText: string): Promise<string> {
  const prompt = `
Topic: ${topic}

Here is OCR text from handwritten notes (it may contain spelling mistakes, broken words, or noise):

${ocrText}

Please:
- Fix spelling and word errors
- Rewrite into clean, proper English
- Structure it as good study notes
- Only include content related to the topic
- If something is unclear, infer the most likely meaning
- Output in simple bullet points or headings
`;

const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  const data = await res.json();

  console.log("🔴 GEMINI FULL RESPONSE:", JSON.stringify(data, null, 2));

  if (data.error) {
    return "Gemini API Error: " + JSON.stringify(data.error);
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return "Gemini returned empty response.";
  }

  return text;
}
