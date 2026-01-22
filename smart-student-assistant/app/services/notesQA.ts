const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
  GEMINI_API_KEY;

export async function askNoteQuestion(noteText: string, question: string) {
  const prompt = `
You are a smart study assistant helping a student understand THEIR OWN notes.

Rules:
- You MUST use ONLY the information present in the notes.
- You ARE ALLOWED to:
  - Explain in simple words
  - Summarize
  - Infer what is important
  - Rephrase
  - Organize points
  - Answer conceptual doubts based on the notes
- You are NOT allowed to use outside knowledge.

If the question truly cannot be answered even by analyzing the notes, say:
"I cannot find this information in your notes."

Be clear, student-friendly, and helpful.

Here are the notes:

<<<NOTE_START>>>
${noteText}
<<<NOTE_END>>>

Student's question:
${question}
`;
 
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error("Gemini API error: " + errText);
  }

  const data = await res.json();

  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No answer generated."
  );
}
