# TaskBuddy 🚀
### Friendly 3D Desktop Deadline Companion for Windows

TaskBuddy is a complete, native Windows desktop application built with **Electron**, **React**, **TypeScript**, and **Three.js** that helps busy students manage online tests, hackathons, project reviews, presentations, academics, and personal responsibilities.

Its defining feature is an animated 3D companion who gracefully appears at the bottom-right of the desktop when a deadline reminder is due, speaks the alert using **100% offline Windows text-to-speech (SAPI)**, and presents actionable options (**Start Task**, **Remind Me Later**, **Mark as Done**, **Dismiss**).

---

## 🌟 Key Features

1. **Animated 3D Companion**:
   - Rigged 3D companion model in GLB format with smooth skeletal animations (`Wave`, `Idle`, `Yes`, `Jump`, `No`).
   - Automatically hidden when idle (0% CPU/GPU overhead).
   - Appears at the bottom-right work area of your desktop without stealing keyboard focus (`showInactive`).
   - Draggable character body with interactive, click-safe speech bubble action buttons.
   - Companion model choice in Settings: Student 3D Rigged Boy or Expressive Robot Companion.

2. **Offline Windows Text-to-Speech**:
   - Uses local Windows `System.Speech.Synthesis` (SAPI) engine.
   - Absolutely **zero internet or cloud dependency**.
   - Configurable volume and speech rate.
   - Graceful visual fallback when voice is disabled or unconfigured.

3. **Persistent SQLite Database**:
   - Versioned migrations (`database/database.ts`).
   - Robust storage of tasks, reminder schedules, and user preferences in `%APPDATA%/taskbuddy/taskbuddy.sqlite`.
   - Transactions, parameter binding, and atomic disk persistence.

4. **Multi-Stage Reminder Scheduling & Policy**:
   - **Default 2 Days Before (48h)** reminder for early preparation.
   - **1 Day Before (24h)** follow-up reminder.
   - **Deadline Day** final reminder.
   - **Date-Only Tasks**: Defaults to 9:00 AM on the deadline date.
   - **Quiet Hours**: Overnight (e.g., 22:00 to 07:00) suppression. Reminders hold quietly until quiet hours end.
   - **Snooze Engine**: Re-schedules reminders for +15m or custom intervals.
   - **Catch-Up & Recovery**: Detects missed reminders if the computer was offline or sleeping and presents an organized catch-up briefing without spamming duplicate alerts.

5. **Windows Integration & System Tray**:
   - Idempotent Windows auto-start on user sign-in (`app.setLoginItemSettings`).
   - System Tray integration: Closing the main dashboard keeps TaskBuddy running quietly in the background.
   - Tray context menu: Open Dashboard, Add Task, Character Preview, Pause/Resume Reminders, and Exit.
   - Windows native toast notification fallback support.

6. **Light Theme Visual Design**:
   - Soft off-white and neutral surfaces with TaskBuddy blue (`#2563eb`) accents.
   - Category color coding and priority badges (Low, Medium, High).
   - Lucide icons with clear visual hierarchy.

---

## 📁 Project Architecture

```
To_do/
├── assets/
│   └── character/
│       ├── character.glb         # Rigged 3D student model with animation clips
│       └── robot.glb             # Alternative expressive companion model
├── database/
│   ├── database.ts               # SQLite engine (sql.js) with migrations & atomic write
│   ├── schema.sql                # SQLite table definitions and indexes
│   ├── task-repository.ts        # Task CRUD and state management
│   ├── reminder-repository.ts    # Reminder scheduling & state queries
│   └── settings-repository.ts    # Local user preferences persistence
├── electron/
│   ├── main.ts                   # App lifecycle, single-instance lock, scheduler bootstrap
│   ├── preload.ts                # Strict typed contextBridge API
│   ├── windows.ts                # Dashboard & transparent Character window manager
│   ├── tray.ts                   # System tray icon and menu controls
│   ├── startup.ts                # Windows login item registration
│   └── ipc/                      # Validated IPC handlers
│       ├── task-handlers.ts
│       ├── reminder-handlers.ts
│       └── settings-handlers.ts
├── src/
│   ├── character/
│   │   ├── CharacterScene.tsx    # Three.js transparent renderer & animation mixer
│   │   ├── CharacterWindow.tsx   # Floating window container & action dispatcher
│   │   └── SpeechBubble.tsx      # Interactive speech bubble UI
│   ├── dashboard/
│   │   ├── components/           # Header, Sidebar, TaskCard, TaskModal, DailyBriefing
│   │   └── pages/                # DashboardView, SettingsView, OnboardingModal
│   ├── reminders/
│   │   ├── policy.ts             # 2-day, 1-day, quiet hour & snooze rules
│   │   ├── scheduler.ts          # Background timer & event dispatcher
│   │   ├── recovery.ts           # Offline catch-up & startup reconciliation
│   │   └── delivery.ts           # Payload & message generation
│   ├── tasks/
│   │   └── validation/           # Form validation & constraints
│   ├── voice/
│   │   └── voice-service.ts      # Offline Windows SAPI adapter
│   ├── shared/
│   │   ├── types.ts              # Shared TypeScript definitions
│   │   ├── constants.ts          # Default settings and categories
│   │   └── date-utils.ts         # Time math, quiet hour detection, friendly text
│   ├── App.tsx                   # Hash router (Dashboard vs Character window)
│   ├── main.tsx                  # React DOM entry point
│   └── index.css                 # Clean light theme design system
├── tests/
│   ├── unit/                     # Validation, date math, policy, and database tests
│   └── integration/              # Controllable clock scheduler tests
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Setup & Development

### Prerequisites
- Windows 10 or 11
- Node.js v18+ (tested on Node v22.20)
- npm v10+

### Installation
```powershell
npm install
```

### Running Tests
All 30 unit and integration tests run with controllable clocks (no waiting real days):
```powershell
npm test
```

### Development Mode
Launch Vite dev server and Electron simultaneously:
```powershell
npm run dev:app
```

### Production Build
Build the React bundle and compile the Electron main process:
```powershell
npm run build
```

### Package Windows Executable
Create the unpacked Windows desktop binary or NSIS installer:
```powershell
# Full Windows NSIS Setup Installer & Portable distribution
npm run package
```
Generated artifacts in `release/`:
- **`release/TaskBuddy-Setup-1.0.0.exe`**: Complete Windows NSIS Installer (99.3 MB) with custom installation directory, Start Menu, and Desktop shortcuts.
- **`release/TaskBuddy-Setup-1.0.0.zip`**: Portable Windows distribution.
- **`release/win-unpacked/TaskBuddy.exe`**: Ready-to-run standalone desktop binary.

---

## 🧪 Automated Test Coverage

The test suite covers:
- **Task Validation**: Ensures required fields, category checks, title constraints, and deadline formatting.
- **Date & Quiet Hours Math**: Verifies boundary calculations for overnight quiet hours (e.g. 22:00 to 07:00), daytime quiet hours, and remaining time strings.
- **Reminder Policy**: Verifies 48-hour and 24-hour offsets, skipping impossible past alerts, and shifting quiet hour collisions to the morning wake boundary.
- **SQLite Persistence**: Validates table creation, migrations, CRUD, and atomic file saves.
- **Scheduler Integration**: Using a controllable test clock, validates task creation triggers, deduplication, snooze expiration, and missed reminder catch-up.

---

## 🔒 Security & Privacy

- **contextIsolation**: Enabled in all browser windows.
- **nodeIntegration**: Disabled across all windows.
- **Typed contextBridge**: A narrow, validated API is exposed in `preload.ts`.
- **100% Offline**: All speech and task storage execute entirely on your machine. No telemetry, no external API keys, and no network requests.
