# 📚 Smart Student Life Assistant

An **AI-powered personal productivity and study companion** built with **Expo React Native** that helps students manage notes, timetable, daily plans, and tasks — all in one place.

This app works **offline-first** and uses **AI (Gemini)** to understand notes, timetables, and daily goals to intelligently assist students in their academic life.

---

## 🚀 Features

### 📝 AI Notes System
- Scan handwritten or printed notes using camera
- OCR using Google ML Kit
- AI cleans, structures, and improves the notes using Gemini
- Save notes locally (offline-first)
- View, edit, delete notes
- Ask AI questions about a specific note
- Quick AI actions:
  - Summarize
  - Important points
  - MCQs
  - Explain simply

---

### 📅 Smart Timetable System
- Import timetable from **Image or PDF**
- OCR + AI parsing into structured weekly timetable
- Automatically shows:
  - Today’s classes
- Data stored locally using AsyncStorage

---

### 🧠 AI Daily Planner
- Reads:
  - Today’s classes
  - Free time slots
  - User’s goals
- Uses AI to generate a **realistic daily plan**
- Converts plan into actionable tasks

---

### ✅ Task System
- Daily task checklist
- Mark tasks as completed
- Progress persists even after app restart
- Reset day anytime

---

### 🏠 Home Dashboard
- Today’s class preview
- Quick actions:
  - Scan Notes
  - My Notes
  - Import Timetable
  - Plan My Day

---

### 🔐 Authentication
- Firebase Authentication (Google Sign-In)
- User session persistence

---

## 🧱 Tech Stack

- **Frontend:** Expo React Native
- **Navigation:** Expo Router
- **Storage:** AsyncStorage (offline-first)
- **AI:** Google Gemini API (via REST)
- **OCR:** Google ML Kit
- **Authentication:** Firebase Auth
- **Animations:** Reanimated
- **UI:** Custom design system

---

## 🏗️ Architecture Overview

- `app/services/`
  - `gemini.ts` → Notes cleanup
  - `notesQA.ts` → Ask questions on notes
  - `timetableAI.ts` → Timetable parsing
  - `dailyPlannerAI.ts` → Daily planner
  - `timeUtils.ts` → Free slot calculation
  - `*Storage.ts` → AsyncStorage logic

- Offline-first:
  - All data stored locally
  - App works without internet (except AI features)

---

## 📱 Screens

- Login
- Home Dashboard
- Scan Notes
- Notes List
- Note Detail (with AI Q&A)
- Timetable Import
- Today’s Classes
- Daily Planner
- Tasks Checklist

---

## ⚙️ Setup & Run

### 1️⃣ Install dependencies
- npm install
### 2️⃣ Start dev server
- npx expo start
### 3️⃣ Run on Android (Dev Client)
- npx expo run:android
### 🔑 Environment Variables
- Create a .env file in project root:
- EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
---

## 🛠️ Build APK for Personal Use
### Option 1: Local build
- npx expo prebuild
- npx expo run:android
### Option 2: EAS Build
- npm install -g eas-cli
- eas build -p android --profile preview
---
## 🎯 Project Vision
### To build a personal AI-powered academic OS for students that:
- Understands notes
- Understands timetables
- Plans daily life
- Tracks execution
- Helps in revision and productivity
---
## 👨‍💻 Author
### Rohit Rathod
- 3rd Year Engineering Student
- Full Stack / Backend / Mobile Developer
