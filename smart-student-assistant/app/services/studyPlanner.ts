const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
  GEMINI_API_KEY;

export async function generateStudyPlan(data: {
  examName: string;
  subjects: string;
  examDate: string;
  dailyHours: string;
}) {
  const prompt = `
You are a smart study planner for a student.

Create a realistic, day-wise study plan.

Rules:
- Distribute subjects properly
- Include revision days
- Keep workload balanced
- Be practical and motivating
- Output in a clean day-wise list format

Exam name: ${data.examName}
Subjects/chapters: ${data.subjects}
Exam date: ${data.examDate}
Daily study hours: ${data.dailyHours}

Generate the plan now.
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

  return (
    json.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Could not generate plan."
  );
}
