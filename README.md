# 🚀 Video SDK for Electron

A premium, feature-rich desktop application for real-time video and audio communication built with **Electron**, **React**, and **VideoSDK**. This project demonstrates advanced capabilities such as adaptive network quality control, shared collaboration tools, and native desktop integration.

## 🌟 Key Abilities & Features

| Feature | Description |
| :--- | :--- |
| 🏗️ **Adaptive Quality Control (QC)** | Real-time network monitoring that automatically synchronizes resolution (DEGRADE/RESTORE) across all participants via PubSub to maintain stability during bandwidth fluctuations. |
| 🔔 **Slack Alert Integration** | Native webhook integration to broadcast critical quality limitation events (bandwidth, congestion, CPU) directly to Slack channels for remote monitoring. |
| 🎨 **Shared Whiteboard** | Collaborative drawing surface with a shared persistent state, allowing all participants to visualize ideas in real-time. |
| 🖼️ **Virtual Backgrounds** | AI-powered background modification including Gaussian blur and a library of custom high-quality images. |
| 📽️ **Advanced Recording** | Server-side meeting recording with customizable GRID layouts and speaker-priority themes. |
| ✋ **Smart Raise Hand** | Time-based hand-raising system with automatic cleanup and toast notifications. |
| 🔌 **Hot-Swap Devices** | Seamless switching of microphones, cameras, and speakers during live calls with permission management. |
| 🖥️ **Screen Sharing** | High-definition screen sharing with local/remote presenter detection and control. |

## 🧠 Project Architecture

### Core Components

- **[`src/meeting/MeetingContainer.js`](./src/meeting/MeetingContainer.js)**: The heart of the application. Handles meeting lifecycle, network quality logic (QC), Slack alerts, and dynamic layout switching between Grid, Whiteboard, and Screen Share modes.
- **[`src/meeting/components/BottomBar.js`](./src/meeting/components/BottomBar.js)**: A custom, brand-styled control bar using a specialized `BarBtn` component. Manages all media toggles, recording states, and collaborative tools.
- **[`src/MeetingAppContextDef.js`](./src/MeetingAppContextDef.js)**: Global state management for device preferences, permissions, and collaborative states (whiteboard, raised hands).
- **[`src/api.js`](./src/api.js)**: abstraction layer for VideoSDK's REST API for room creation and validation.

## 📦 Getting Started

### 1. Prerequisites
- **Node.js** v16 or later
- **npm** v8 or later
- A valid [Video SDK Account](https://app.videosdk.live/signup)

### 2. Setup
Clone the repository and install dependencies:
```bash
git clone https://github.com/Pranav-Abegaonkar/electron.git
cd electron
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and provide your credentials:
```env
REACT_APP_VIDEOSDK_TOKEN="YOUR_TOKEN"
REACT_APP_API_BASE_URL="YOUR_API_ENDPOINT"
REACT_APP_SLACK_WEBHOOK_URL="YOUR_SLACK_WEBHOOK" # Optional
```

### 4. Launch (Development)
Start the React dev server and Electron window:
```bash
npm run dev
```

## 🏗️ Build & Packaging

The project is configured for multi-platform distribution using `electron-builder`:

- **macOS**: `npm run build-electron`
- **Windows**: `npm run build-win`
- **Full Suite**: `npm run build-all`

## 🤝 Community & Support

- **[Documentation](https://docs.videosdk.live/)**
- **[Discord](https://discord.gg/Gpmj6eCq5u)**
- **[X](https://x.com/video_sdk)**
