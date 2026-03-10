# 🐝 Bee Studio AI - Mobile App

**Version**: v1.2.5  
**Last Updated**: 2026-03-01  
**Supported Platforms**: iOS / Android (Built with React Native & Expo)

---

## 📋 Project Overview

- **Positioning**: The official mobile application for Bee Studio AI, providing a premium native experience.
- **Data Synchronization**: Shares the exact same Supabase backend instance with the web application (`beehive-platform`). All data (users, projects, tasks, wallet balances) is seamlessly synchronized.
- **UI Design**: Features a Dark Theme with Gold accents, aligning with the professional brand identity of the AI creator platform.

---

## ✨ Features

### Core Experience
- ✅ **Cross-Platform Native UI**: Built with native Bottom Tabs and Stack navigation, avoiding simple web-view wrappers.
- ✅ **Immersive Visuals**: Masonry list layout for project discovery, prioritizing large, high-impact visuals.
- ✅ **Authentication Upgrade**: Transitioned from Magic Links to robust **6-Digit OTP** via email, and successfully integrated seamless **Google OAuth** across Web and Mobile (utilizing `expo-auth-session` and `WebBrowser` flows). Apple login integration is structurally ready pending Apple Developer Credentials.

### Business Modules
- 🏠 **Tasks Hall**: Browse and accept cutting-edge AI creation tasks posted by the community.
- 🌍 **Discover**: Masonry feed of excellent community projects. Supports likes, follows, and participation.
- ➕ **Create**: Quickly publish new projects or tasks directly from your phone. Supports one-click cover image uploads.
- 👤 **Profile**: Account management, mock wallet balance display, activity footprint, and personal portfolio.

---

## 🔧 Tech Stack

- **Framework**: React Native with Expo (SDK 52+)
- **Language**: TypeScript (Type definitions strictly aligned with the Web client)
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **State Management**: Zustand (`src/store/authStore.ts` for global user state)
- **Backend API**: Supabase JS SDK (Direct database connection, no middleware API layer)
- **UI Components**: `@react-native-seoul/masonry-list` (Waterfall grid), `lucide-react-native` (Icons)
- **Local Storage**: Native AsyncStorage / Expo SecureStore

---

## 🚀 Directory Structure & Architecture

```text
beehive-app/
├── src/
│   ├── components/      # UI Component Library (e.g., AppInput fixing native text input bugs)
│   ├── constants/       # Global Constants (Colors.ts design tokens)
│   ├── lib/
│   │   ├── api/         # Database connection layer (projects.ts, tasks.ts, payments.ts)
│   │   └── upload.ts    # Encapsulated image picker and Supabase Storage uploader
│   ├── navigation/      # Router configurations (AppNavigator)
│   ├── screens/         # Screen-level components (HomeScreen, ProjectListScreen)
│   ├── store/           # Zustand state machines
│   └── types/           # TS definitions (cleans snake_case to camelCase)
├── App.tsx              # Application entry point
├── app.json             # Expo core configuration
└── assets/              # Local static assets (Logo, Splash screens, etc.)
```

---

## 🛠️ Development Guide

### Environment Setup

1. **Install Dependencies**: `npm install`
2. **Environment Variables**: Configure the `.env` file with the following Supabase keys:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### Running the Project

```bash
# Start the local Expo dev server (with cleared cache)
npx expo start --clear
```
*Press `i` in the terminal to launch the iOS Simulator, `a` for Android Emulator, or scan the QR code with Expo Go on your physical device.*

### ⚠️ Development Notes (For AI Assistants)

1. **Android Input Clipping Issue**: The default Android `TextInput` clips the top of characters when `paddingVertical` is applied. ALWAYS use `src/components/AppInput` instead of the native component, or explicitly set `height` and add `includeFontPadding: false`.
2. **Authentication Difference**: Unlike the Web project (Next.js), the mobile app cannot use `@supabase/ssr` (Server-Side Rendering Auth). This project uses Zustand (`authStore`) for frontend authentication protection. API functions manually check and include the User Context.
3. **Type Mapping**: Supabase returns `snake_case` (e.g., `created_at`), but frontend components strictly use `camelCase` (e.g., `createdAt`). The data cleaning mapping is handled in the `api/` layer. Pay attention to this when developing new API endpoints.
4. **Brand Context**: This codebase belongs to the **GLOBAL** version of the product, branded as **Bee Studio AI** (English UI).

---

## 📅 Next Steps (Roadmap)

1. **Finish Apple Login**: The structure is complete. Requires Apple Developer Console keys to be configured in Supabase to instantly activate Apple OAuth.
2. **Payment Loop**: Replace the current Mock payment system. Implement Apple IAP / Google Billing for mobile.
3. **Performance Optimization**: Introduce `FlashList` to replace standard `FlatList` for better scrolling frame rates on massive lists; add page transition animations.
