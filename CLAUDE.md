# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Chrome/Edge browser extension** (Manifest V3) that enhances the freee勤怠管理Plus (freee attendance management system) web interface. The extension calculates and displays flex-time balance and overtime statistics as a floating Material-UI widget overlay.

## Tech Stack

- **Frontend**: React 19.1.0 + TypeScript 5.4.5
- **UI**: Material-UI v7.1.1 with Emotion styling
- **Build**: Vite 5.2.8 + @crxjs/vite-plugin
- **Testing**: Vitest 3.2.4 with jsdom
- **i18n**: i18next for Japanese/English support

## Development Commands

```bash
# Development with auto-rebuild
npm run dev

# Production build
npm run build

# Run all tests
npm test

# Install dependencies
npm install
```

## Core Architecture

### Entry Point Flow
1. **`src/content.ts`** - Content script injected into freee website
   - Injects React root and polls DOM every 5 minutes
   - Extracts attendance data and triggers calculations

2. **`src/reactRoot.tsx`** - React application root
   - Renders the floating panel with Material-UI theming

3. **`src/components/Panel.tsx`** - Main UI component
   - Displays flex-time balance, overtime stats, and configuration

### Key Data Processing
- **`src/dom/scanDaily.ts`** - DOM scraping logic for attendance table
- **`src/functions/calculateStats.ts`** - Core business logic for flex-time calculations
- **`src/utils/localStorageHandler.ts`** - Persistent configuration management

### Directory Structure
- **`src/components/`** - React UI components
- **`src/dom/`** - DOM manipulation utilities
- **`src/functions/`** - Business logic and calculations
- **`src/utils/`** - Utility functions
- **`src/types/`** - TypeScript type definitions
- **`tests/`** - Unit tests
- **`reference/`** - Documentation and HTML analysis

## Extension Configuration

The extension targets `https://kintaiplus.freee.co.jp/*` and injects at `document_idle`. Build output goes to `dist/content.js` via the @crxjs/vite-plugin.

## Testing Strategy

Tests focus on:
- Calculation logic (`calculateStats.test.ts`)
- DOM parsing (`scanDaily.test.ts`) 
- Time parsing utilities (`parser.test.ts`)
- localStorage handling (`localStorageHandler.test.ts`)

Run individual test files with: `npm test -- <filename>`

## Data Flow

1. DOM scanning extracts work hours and scheduled hours from freee's attendance table
2. Calculations determine flex-time balance (worked - scheduled hours)
3. Statistics include averages, remaining hours, target exit times, and overtime compliance
4. Results display in a persistent floating Material-UI panel

## Key Features

- Real-time flex-time balance with progress indicators
- Overtime calculations with 36-kyotei compliance
- Configurable DOM selectors for parsing
- Japanese/English internationalization
- localStorage persistence for user preferences