import AsyncStorage from "@react-native-async-storage/async-storage";

export type TimetableEntry = {
  start: string;
  end: string;
  subject: string;
};

export type WeeklyTimetable = {
  [day: string]: TimetableEntry[];
};

const STORAGE_KEY = "WEEKLY_TIMETABLE";

export async function saveTimetable(table: WeeklyTimetable) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(table));
}

export async function getTimetable(): Promise<WeeklyTimetable | null> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

export async function clearTimetable() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
