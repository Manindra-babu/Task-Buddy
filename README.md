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

## 📖 About TaskBuddy

**TaskBuddy: The Deadline Beacon** is a productivity companion created for students, developers, and professionals who juggle multiple strict deadlines. Traditional to-do applications rely on intrusive banner notifications that get easily swiped away and forgotten. TaskBuddy introduces **The Deadline Beacon**: a persistent, non-intrusive luminous beacon that lives on your Windows desktop work area, giving you immediate, actionable control over your commitments without breaking your focus.

### 💡 Why TaskBuddy?
- **Separate Deadline & Reminder Times**: Set the actual date/time a task is due, and independently set when you want TaskBuddy to pop up and alert you.
- **Multi-Stage Preparation**: Default reminder policy alerts you **2 days before** for preparation, **1 day before** for follow-up, and on **deadline day**.
- **100% Offline & Private**: Built on local SQLite. No account registration, no subscriptions, and zero data leaves your PC.
- **Ultra-Lightweight & Quiet**: Runs quietly in the Windows system tray with practically 0% idle CPU footprint.
- **Action-Oriented Reminders**: Launch submission links directly in your default browser, mark tasks complete with one click, or snooze until tomorrow morning.
- **Sleep & Restart Resilient**: If your computer is asleep or powered off when a deadline reminder is due, TaskBuddy automatically catches up and alerts you upon resume.

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

### 2. ⏰ Flexible Scheduling: Deadline vs. Reminder
- **Deadline Date & Time**: When the assignment, submission, or hackathon actually closes.
- **When to Remind (Optional)**: Set an exact custom alert time, or pick from instant presets:
  - 🎯 **Same as Deadline**: Reminds you right at the deadline time.
  - ⏱️ **1 Day Before**: Reminds you 24 hours prior to deadline.
  - 🧪 **In 5 Minutes (Test)**: Sets a test reminder 5 minutes from now so you can immediately see the desktop beacon in action!
  - 🔄 **Clear**: Reverts to the automated multi-stage policy.

### 3. ⚡ Actionable Reminder Controls
- **Start Task**: Immediately opens the dashboard, focusing directly on the task.
- **Open Link**: If you added a destination link (Devpost submission, Canvas assignment, GitHub repo, Google Meet), opens it directly in your default browser.
- **Remind Me Later (Snooze)**:
  - ⏱️ In 15 minutes
  - ⏳ In 1 hour
  - 🌅 Tomorrow morning (9:00 AM)
- **Mark as Done**: Instantly completes the task, saves to local SQLite, cancels future alerts for this task, and triggers a subtle green celebration wave.
- **Dismiss**: Closes the card cleanly without nagging.

### 4. 📅 Multi-Stage Persistent Scheduling & Recovery
- **Automatic Multi-Stage Alerts**:
  - 📌 **2 days before** deadline (48 hours) for early preparation
  - 📌 **1 day before** deadline (24 hours) follow-up
  - 📌 **Deadline day** alert
- **Date-Only Tasks**: Default to 9:00 AM on the deadline date (configurable in Settings).
- **Sleep & Restart Recovery**: If your PC was asleep or turned off when a reminder was scheduled, TaskBuddy reconciles and surfaces missed reminders upon resume.
- **Quiet Hours**: Overnight hours (default 22:00 to 07:00) suppression with user-configurable option to allow visual beacon signals while muting audio.

### 5. 🔈 Offline Windows Speech (SAPI)
- Uses built-in Windows `System.Speech.Synthesis` (SAPI).
- **Muted by default** for quiet study and work sessions.
- **100% Offline**: Zero external network or cloud dependencies.

### 6. 🗄️ 100% Local SQLite Database
- All tasks, categories, priorities, notes, next steps, and schedules are stored locally in:  
  `%APPDATA%\TaskBuddy\taskbuddy.sqlite`
- Completely private and offline. Your data stays on your machine.

---

## 🛠️ Step-by-Step Setup Guide

Follow these steps to set up, run, and share TaskBuddy.

### 📋 Prerequisites

Before you start, make sure you have the following installed on your Windows machine:
1. **Windows 10 or Windows 11 (64-bit)**
2. **[Node.js](https://nodejs.org/)** — Version **18.x or 20.x+ LTS** is recommended.
   - Verify installation by opening PowerShell or Command Prompt and running:
     ```bash
     node -v
     npm -v
     ```
3. **[Git](https://git-scm.com/)** — To clone the repository.
   - Verify installation:
     ```bash
     git --version
     ```

---

### 📥 1. Clone the Repository

Open PowerShell or Command Prompt, navigate to your desired directory, and clone the project:

```bash
git clone https://github.com/Manindra-babu/Task-Buddy.git
cd Task-Buddy
```

---

### 📦 2. Install Dependencies

Install all required frontend and Electron packages:

```bash
npm install
```

> **Note**: If npm fails with permissions on Windows, ensure you are running terminal as your regular user (or run PowerShell as Administrator if restricted).

---

### 🏗️ 3. Build the Application

TaskBuddy uses **Vite** for the React frontend and **TypeScript (`tsc`)** for the Electron main process. Compile both with:

```bash
npm run build
```

This generates:
- `dist/index.html` & bundles (React Dashboard & Beacon UI)
- `dist/electron/` (Compiled Electron main process, IPC handlers, SQLite engine, and tray system)

---

### 🚀 4. Launch TaskBuddy

Now you can run the full desktop application:

```bash
npm start
```

#### 📍 What to Expect When TaskBuddy Launches:
1. TaskBuddy launches quietly in your **Windows System Tray** (notification area in the bottom-right corner of your taskbar, next to the clock and Wi-Fi icon).
2. Look for the **TaskBuddy blue icon** in the tray (if hidden, click the little `^` arrow to show hidden icons).
3. **Right-click the TaskBuddy tray icon** and click **Open Dashboard** (or double-click the tray icon) to open the task manager!

---

### 🧪 5. Run Automated Tests

To ensure everything is working correctly on your machine:

```bash
npm test
```

All 33 unit and integration tests (validation, date utilities, reminder policy, SQLite migrations, and scheduler logic) should pass cleanly:
```
 ✓ tests/unit/validation.test.ts (8 tests)
 ✓ tests/unit/date-utils.test.ts (9 tests)
 ✓ tests/unit/policy.test.ts (4 tests)
 ✓ tests/unit/database.test.ts (7 tests)
 ✓ tests/integration/scheduler.test.ts (5 tests)

 Test Files  5 passed (5)
      Tests  33 passed (33)
```

---

### 👨‍💻 6. Running in Live Development Mode (For Developers)

If you are modifying code and want hot-reload for the React dashboard:

```bash
npm run dev:app
```

This concurrently starts the Vite dev server at `http://localhost:5173` and launches Electron with live reloading.

---

### 🎁 7. Packaging a Standalone `.exe` for Friends (No Node.js Required)

Want to give TaskBuddy to friends who don't have Node.js or Git installed? You can package it into a standalone Windows application folder or installer:

#### Option A: Standalone Unpacked Application (Recommended for quick sharing)
```bash
npm run package:dir
```
- This compiles the app and generates a ready-to-run folder at:
  ```
  release\win-unpacked\
  ```
- **How to share**: Simply zip the `win-unpacked` folder and send it to your friends. They can extract it and double-click **`TaskBuddy.exe`** to run it immediately without installing Node.js!

#### Option B: Windows Installer (.exe setup)
```bash
npm run package
```
- Generates an installer executable inside the `release\` directory.

---

## 🎮 How to Use TaskBuddy & Test Reminders

### 1. Opening the Dashboard
- Find the **TaskBuddy icon** in the Windows System Tray (bottom-right near the clock, or inside the `^` overflow menu).
- Right-click and choose **Open Dashboard** (or double-click the icon).

### 2. Creating a Task with Custom Reminder
1. Click the **"+ Add Task"** button on the dashboard.
2. Enter the task details:
   - **Title**: (e.g., `OS Operating Systems Quiz`)
   - **Category**: (Exam, Assignment, Project, Hackathon, or Personal)
   - **Priority**: (Low, Medium, High, Urgent)
   - **Deadline Date & Time**: When the task is due.
3. In the **"When to Remind (Optional)"** section:
   - Set the date and time when you want the desktop beacon to alert you.
   - Or click **"In 5 Minutes (Test)"** to schedule an immediate test reminder!
4. Click **Create Task**.

### 3. Testing the Floating Deadline Beacon Right Away
You don't need to wait for a real deadline to see the beacon:
- **Instant Test via Tray**: Right-click the TaskBuddy tray icon and click **Test Deadline Beacon**.
- The glowing beacon will appear immediately in the bottom-right corner of your desktop. Hover over it or click it to reveal the reminder card!

---

## 🖥️ System Tray Controls Reference

| Tray Action | Shortcut / Behavior | Description |
| :--- | :--- | :--- |
| **Double-Click Icon** | Double-Click | Opens the main TaskBuddy Dashboard |
| **Open Dashboard** | Right-Click Menu | Opens the task manager window |
| **Add Task...** | Right-Click Menu | Opens the new task creation dialog directly |
| **Test Deadline Beacon** | Right-Click Menu | Triggers an immediate sample Deadline Beacon overlay |
| **Pause / Resume Reminders** | Right-Click Menu | Temporarily mutes or resumes all background alerts |
| **Exit TaskBuddy** | Right-Click Menu | Saves SQLite database state, stops scheduler, and exits |

---

## ❓ Frequently Asked Questions & Troubleshooting

### Q1: I ran `npm start` and no window opened. Is it running?
**Answer**: Yes! By design, TaskBuddy starts quietly in the background without stealing your focus. Look at your **Windows System Tray** (bottom-right next to the clock). If you don't see it, click the upward arrow `^` (hidden icons tray). Look for the blue TaskBuddy icon, right-click it, and select **Open Dashboard**.

### Q2: I get `Error: Cannot find module '.../dist/electron/electron/main.js'`
**Answer**: You haven't built the TypeScript files yet. Run:
```bash
npm run build
```
Once the build completes, run `npm start` again.

### Q3: PowerShell says `Execution of scripts is disabled on this system` (PSSecurityException)
**Answer**: Windows PowerShell blocks unsigned scripts by default. Open PowerShell and run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
Then run your `npm install` and `npm start` commands.

### Q4: Windows Defender / SmartScreen shows "Windows protected your PC" on the packaged `.exe`
**Answer**: Because the executable is built locally and is not signed with an expensive commercial EV code-signing certificate, Windows SmartScreen will show this prompt for any new executable. Click **"More info"** and then **"Run anyway"**.

### Q5: Where is my data saved?
**Answer**: TaskBuddy stores all your tasks and reminders locally on your machine in:
```
%APPDATA%\TaskBuddy\taskbuddy.sqlite
```
Your data is 100% private and never sent over the internet.

---

## 📁 Repository Structure

```
Task-Buddy/
├── database/
│   ├── database.ts             # Local SQLite engine (sql.js) with versioned migrations
│   ├── schema.sql              # Database schema and indexes
│   ├── task-repository.ts      # Tasks CRUD, remind_at persistence, next actions
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
│   │   ├── policy.ts           # 2-day, 1-day, custom remind_at, quiet hours logic
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
