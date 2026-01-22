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

export async function updateNote(updatedNote: Note) {
  const notes = await getNotes();

  const newNotes = notes.map((n) =>
    n.id === updatedNote.id ? updatedNote : n
  );

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
}

export async function deleteNoteById(id: string) {
  const notes = await getNotes();
  const newNotes = notes.filter((n) => n.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
}
