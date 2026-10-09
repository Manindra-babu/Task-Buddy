# TaskBuddy: The Deadline Beacon 🚨
### High-Precision Windows Desktop Deadline Management System

[![Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-blue?logo=windows)](https://microsoft.com)
[![Electron](https://img.shields.io/badge/Framework-Electron%2035-47848F?logo=electron)](https://electronjs.org)
[![React](https://img.shields.io/badge/UI-React%2018%20%2B%20TypeScript-61DAFB?logo=react)](https://react.dev)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20(Local)-003B57?logo=sqlite)](https://sqlite.org)
[![Tests](https://img.shields.io/badge/Tests-33%20Passing-brightgreen?logo=vitest)](https://vitest.dev)

**TaskBuddy: The Deadline Beacon** is a dedicated Windows desktop application built with **Electron**, **React**, **TypeScript**, and **SQLite**. It is designed specifically to help students, developers, and engineers never miss critical deadlines for online tests, hackathons, project reviews, presentations, college assignments, and personal commitments.

Its signature feature is **The Deadline Beacon** — a compact, luminous, animated indicator that appears quietly at the bottom-right corner of your Windows desktop when a reminder is due. Clicking or hovering over the beacon expands it into a floating Windows 11 Fluent reminder card with actionable controls (**Start Task**, **Open Link**, **Snooze**, **Done**, and **Dismiss**).

> **Distraction-Free Design**: TaskBuddy runs quietly in your Windows System Tray. It contains zero cartoon characters or heavy 3D game engines, consuming practically 0% CPU/GPU when idle.

---

## 📸 Key Features

### 1. 🚨 The Deadline Beacon
- **Zero Desktop Clutter**: Sits discreetly in the bottom-right corner of the Windows desktop work area, safely respecting the taskbar.
- **Genuine Desktop Transparency**: Borderless, frameless, and transparent overlay with no background box or unwanted strips.
- **Urgency Pulses**:
  - 🔵 **Cobalt/Cyan**: Standard active deadline reminder
  - 🟡 **Amber/Gold**: Approaching deadline signal
  - 🔴 **Crimson/Red**: High-priority or overdue deadline
  - 🟢 **Emerald/Green**: Subtle completion wave when a task is completed
- **Full Keyboard Accessibility**: Press `Enter` to start the task or `Escape` to dismiss.

### 2. ⚡ Actionable Reminder Controls
- **Start Task**: Immediately opens the dashboard, focusing directly on the task.
- **Open Link**: If you added a destination link (Devpost submission, Canvas assignment, GitHub repo, Google Meet), opens it directly in your default browser.
- **Remind Me Later (Snooze)**:
  - ⏱️ In 15 minutes
  - ⏳ In 1 hour
  - 🌅 Tomorrow morning (9:00 AM)
- **Mark as Done**: Instantly completes the task, saves to local SQLite, cancels future alerts for this task, and triggers a subtle green celebration wave.
- **Dismiss**: Closes the card cleanly without nagging.

### 3. 📅 Multi-Stage Persistent Scheduling & Recovery
- **Automatic Multi-Stage Alerts**:
  - 📌 **2 days before** deadline (48 hours) for early preparation
  - 📌 **1 day before** deadline (24 hours) follow-up
  - 📌 **Deadline day** alert
- **Date-Only Tasks**: Default to 9:00 AM on the deadline date (configurable in Settings).
- **Sleep & Restart Recovery**: If your PC was asleep or turned off when a reminder was scheduled, TaskBuddy reconciles and surfaces missed reminders upon resume.
- **Quiet Hours**: Overnight hours (default 22:00 to 07:00) suppression with user-configurable option to allow visual beacon signals while muting audio.

### 4. 🔈 Offline Windows Speech (SAPI)
- Uses built-in Windows `System.Speech.Synthesis` (SAPI).
- **Muted by default** for quiet study and work sessions.
- **100% Offline**: Zero external network or cloud dependencies.

### 5. 🗄️ 100% Local SQLite Database
- All tasks, categories, priorities, notes, next steps, and schedules are stored locally in:  
  `%APPDATA%\TaskBuddy\taskbuddy.sqlite`
- Completely private and offline. Your data stays on your machine.

---

## 🚀 Getting Started for You and Your Friends

### Option 1: Run the Standalone App (No Coding Required)

If you just want to run TaskBuddy on your Windows PC:
1. Download or package the repository (see build instructions below).
2. Open `release\win-unpacked\TaskBuddy.exe`.
3. TaskBuddy will launch quietly in your **Windows System Tray** (look for the blue TaskBuddy icon near the clock in the bottom-right corner of your taskbar).
4. Right-click the system tray icon and select **Open Dashboard** to add your tasks!

---

### Option 2: Run & Build From Source

#### Prerequisites
- Windows 10 or 11 (64-bit)
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Git](https://git-scm.com/)

#### 1. Clone the Repository
```bash
git clone https://github.com/Manindra-babu/Task-Buddy.git
cd Task-Buddy
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Run in Development Mode
```bash
npm run dev
```
This starts the Vite React dev server and launches Electron with live hot-reload.

#### 4. Run Automated Tests
```bash
npm test
```
Runs the full Vitest suite covering date utilities, form validation, reminder policies, SQLite migrations, and scheduler logic (33 / 33 tests passing).

#### 5. Build & Package Standalone Windows Executable
```bash
# 1. Compile React frontend and Electron main process
npm run build

# 2. Package into an unpacked Windows executable folder
npx electron-builder --win --dir
```
The compiled, runnable application is generated at:
```
release\win-unpacked\TaskBuddy.exe
```
You can zip the `release\win-unpacked` folder and share it directly with your friends!

---

## 🖥️ System Tray Controls

| Tray Action | Description |
| :--- | :--- |
| **Double-Click Icon** | Opens the main TaskBuddy Dashboard |
| **Open Dashboard** | Opens the task manager window |
| **Add Task...** | Directly opens the new task modal |
| **Test Deadline Beacon** | Triggers an instant sample Deadline Beacon overlay |
| **Pause / Resume Reminders** | Temporarily pauses or resumes all background alerts |
| **Exit TaskBuddy** | Cleanly closes SQLite database, scheduler, and exits |

---

## 📁 Repository Structure

```
Task-Buddy/
├── database/
│   ├── database.ts             # Local SQLite engine (sql.js) with versioned migrations
│   ├── schema.sql              # Database schema and indexes
│   ├── task-repository.ts      # Tasks CRUD, next actions, destination URLs
│   ├── reminder-repository.ts  # Multi-stage scheduling, delivery, snooze queries
│   └── settings-repository.ts  # User preferences persistence
├── electron/
│   ├── main.ts                 # Lifecycle, single-instance lock, tray setup, scheduler
│   ├── preload.ts              # Secure typed contextBridge API
│   ├── windows.ts              # Dashboard window & transparent Beacon window manager
│   ├── tray.ts                 # Windows system tray integration & context menu
│   ├── startup.ts              # Windows launch-on-boot integration
│   └── ipc/                    # Type-safe IPC channels (tasks, reminders, settings)
├── src/
│   ├── beacon/
│   │   ├── BeaconIndicator.tsx # Glowing status beacon with concentric pulse rings
│   │   ├── ReminderCard.tsx    # Windows 11 floating reminder card with actions
│   │   ├── BeaconWindow.tsx    # Transparent desktop overlay window orchestrator
│   │   ├── BeaconPreviewStudio.tsx # Interactive testing studio
│   │   └── animations.css      # Keyframes for pulse rings, card expansion, celebration
│   ├── dashboard/
│   │   ├── components/         # Header, Sidebar, TaskCard, TaskModal, DailyBriefing
│   │   └── pages/              # DashboardView, SettingsView, OnboardingModal
│   ├── reminders/
│   │   ├── policy.ts           # 2-day, 1-day, quiet hours, and snooze logic
│   │   ├── scheduler.ts        # 30-second background ticker & event dispatcher
│   │   └── recovery.ts         # Sleep resume & PC startup reconciliation
│   ├── tasks/validation/       # Task input validation & constraints
│   ├── voice/                  # Offline Windows SAPI voice synthesizer
│   ├── shared/                 # Common interfaces, constants, date helpers
│   ├── App.tsx                 # View router (Dashboard, #beacon, #preview)
│   └── index.css               # Clean styling & window transparency rules
└── tests/
    ├── unit/                   # Unit tests (validation, dates, policy, database)
    └── integration/            # Scheduler integration & reconciliation tests
```

---

## 🔒 Privacy & Local Security

- **100% Local & Private**: No deadlines, titles, or notes are ever uploaded or transmitted across the internet.
- **Secure Electron Configuration**: Context isolation enabled, Node.js integration disabled in renderer processes.
- **SQL Injection Prevention**: Parameterized queries across all SQLite interactions.
- **Safe Link Launching**: External URLs are validated (`http:` / `https:`) and launched via Windows shell without renderer privileges.

---

## 🤝 Contributing & Feedback
Pull requests, feedback, and issue reports are welcome! Feel free to fork the repo, submit improvements, or open an issue on [GitHub](https://github.com/Manindra-babu/Task-Buddy).

Enjoy staying ahead of your deadlines with **TaskBuddy**! 🚨
