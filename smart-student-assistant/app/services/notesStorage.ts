import AsyncStorage from "@react-native-async-storage/async-storage";

export type Note = {
  id: string;
  topic: string;
  content: string;
  createdAt: number;
};

const STORAGE_KEY = "SAVED_NOTES";

export async function saveNote(note: Note) {
  const existing = await getNotes();
  const updated = [note, ...existing];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function getNotes(): Promise<Note[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function clearNotes() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
