const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" +
  GEMINI_API_KEY;

/**
 * Converts timetable image directly to JSON using Gemini Vision
 * This is MUCH better than OCR → Text → Gemini
 */
export async function parseTimetableWithGeminiVision(imageUri: string) {
  // Read the image file and convert to base64
  const base64Image = await uriToBase64(imageUri);
  
  const prompt = `
You are analyzing a college timetable TABLE IMAGE. You can SEE the table visually.

YOUR TASK:
Extract the weekly class schedule from this timetable image and convert it to JSON.

TABLE STRUCTURE:
- The table has ROWS for days of the week (Monday to Saturday)
- The table has COLUMNS for time slots
- Each cell contains a subject/class name

EXTRACTION RULES:
1. **COMPLETELY SKIP** these entries:
   - "RECESS" or "Recess" (break time)
   - "MINOR" (standalone - minor course selection)
   - "HONORS" (standalone - honors course selection)
   - "MINOR/HONORS"
   - Any cell containing "OFF"
   - Any cell with multiple subjects separated by "/" (like "ES/W&A/DBMS/OFF")
   - Empty cells or dashes

2. **Extract ONLY the subject code** from entries:
   - "IoT – MBA2/5" → Extract "IoT"
   - "W&A" → Extract "W&A"
   - "DBMS" → Extract "DBMS"
   - "SV-MBA3/3(2)" → Extract "SV"
   - "ES" → Extract "ES"
   - "WCOM" or "WC" → Extract "WCOM"
   - "MPP-I" → Extract "MPP-I"
   - "EE" → Extract "EE"
   - Remove everything after "–" or "-" (batch codes, room numbers)

3. **Lab sessions** (special handling):
   - If you see entries like "B3(DDS) B4(MRS) B1(AHH) B2"
   - Extract as: "Lab: DDS/MRS/AHH"
   - Pattern: Multiple batch codes (B1, B2, B3, B4) with subjects in parentheses
   - Combine all lab subjects with "Lab:" prefix

4. **Time format** - Convert to 24-hour format:
   - 9:00 AM → "09:00"
   - 10:00 AM → "10:00"
   - 11:00 AM → "11:00"
   - 12:00 PM → "12:00"
   - 1:00 PM → "13:00"
   - 2:00 PM → "14:00"
   - 3:00 PM → "15:00"
   - 4:00 PM → "16:00"

IMPORTANT:
- Look at the visual position of each cell to determine which day and time it belongs to
- Each day should have its own unique schedule based on its row
- Do NOT copy the same classes to all days
- Only include actual subject codes, not administrative entries

EXPECTED OUTPUT STRUCTURE:
For each day of the week, create an array of class entries with start time, end time, and subject.

OUTPUT FORMAT:
Return ONLY valid JSON with NO markdown, NO backticks, NO explanation text.

{
  "Monday": [
    {"start": "10:00", "end": "11:00", "subject": "IoT"},
    {"start": "11:00", "end": "12:00", "subject": "ES"}
  ],
  "Tuesday": [
    {"start": "10:00", "end": "11:00", "subject": "W&A"}
  ],
  "Wednesday": [
    {"start": "10:00", "end": "11:00", "subject": "EE"},
    {"start": "11:00", "end": "12:00", "subject": "ES"}
  ],
  "Thursday": [
    {"start": "10:00", "end": "11:00", "subject": "W&A"},
    {"start": "11:00", "end": "12:00", "subject": "EE"}
  ],
  "Friday": [
    {"start": "10:00", "end": "11:00", "subject": "W&A"},
    {"start": "11:00", "end": "12:00", "subject": "DBMS"},
    {"start": "12:00", "end": "13:00", "subject": "Lab: DDS/MRS/AHH"},
    {"start": "14:00", "end": "15:00", "subject": "WCOM"}
  ],
  "Saturday": [
    {"start": "11:00", "end": "12:00", "subject": "DBMS"},
    {"start": "14:00", "end": "15:00", "subject": "WCOM"}
  ]
}

VALIDATION:
- Each day must have entries based on its actual row in the table
- Time slots must be consecutive and logical
- Subject names must be clean (no batch codes or room numbers)
- Skip all RECESS, MINOR, HONORS, and entries with "OFF"

Now, analyze the timetable image and extract the schedule.
`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      topK: 20,
    },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  const json = await res.json();

  let text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("❌ Gemini returned empty response");
  }

  console.log("🧠 RAW GEMINI VISION RESPONSE:", text);

  // Clean markdown if Gemini adds it
  text = text.trim();

  if (text.startsWith("```")) {
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  }

  // Extract JSON block
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("❌ Gemini did not return JSON");
  }

  const jsonOnly = text.slice(firstBrace, lastBrace + 1);

  try {
    const parsed = JSON.parse(jsonOnly);

    console.log("✅ PARSED TIMETABLE JSON:", JSON.stringify(parsed, null, 2));

    return parsed;
  } catch (err) {
    console.error("❌ JSON PARSE FAILED. TEXT WAS:\n", jsonOnly);
    throw new Error("❌ Failed to parse timetable JSON");
  }
}

/**
 * Convert file URI to base64 string
 */
async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}