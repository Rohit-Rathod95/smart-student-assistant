const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
  GEMINI_API_KEY;

type ClassEntry = {
  start: string;
  end: string;
  subject: string;
};

export async function generateDailyPlan(params: {
  today: string;
  classes: ClassEntry[];
  freeSlots: { start: string; end: string }[];
  goals: string;
  dayStart?: string;
  dayEnd?: string;
}) {
  const { dayStart = "06:00", dayEnd = "23:00" } = params;
  
  const prompt = `
You are a smart student daily planner creating a complete day schedule.

Today is: ${params.today}
Day time range: ${dayStart} to ${dayEnd}

My classes today:
${params.classes.length > 0 
  ? params.classes.map(c => `- ${c.start}-${c.end}: ${c.subject}`).join("\n")
  : "No classes scheduled"}

My available free time slots:
${params.freeSlots.length > 0
  ? params.freeSlots.map(s => `- ${s.start} to ${s.end}`).join("\n")
  : "No free time available"}

My goals for today:
${params.goals}

Your task:
- Create a COMPLETE day plan from ${dayStart} to ${dayEnd}
- Include morning routine, study sessions, breaks, meals, and evening wind-down
- Use ONLY the free slots listed above for study/work tasks
- Do NOT schedule anything during class times
- Allocate time for:
  * Morning routine (if time before first class)
  * Study sessions for the goals mentioned
  * Lunch break (around 12:00-14:00 if free)
  * Dinner break (around 19:00-21:00 if free)
  * Short breaks between study sessions (10-15 min every 1-2 hours)
  * Evening relaxation/wind-down before ${dayEnd}
- Be realistic - don't overload free slots
- Prioritize important goals in longer free slots
- Format output as a clean timeline with emojis

Example format:
⏰ 06:00-07:00 - Morning routine & breakfast
📚 07:00-09:00 - [Your scheduled class]
...

Generate the complete day plan now.
`;

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });

  const data = await res.json();

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "❌ Failed to generate daily plan."
  );
}