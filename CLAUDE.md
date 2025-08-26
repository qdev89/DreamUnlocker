# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dream Unlocker** is a Jungian dream analysis application that has migrated from ASP.NET Core + SQL Server to a Firebase-only web MVP architecture. The MVP is deployed and live at https://dream-unlocker-mvp.web.app.

## Development Commands

### Frontend (React/TypeScript/Vite)
```bash
cd frontend
npm run dev          # Start development server (http://localhost:5174)
npm run build        # Build for production (outputs to frontend/dist)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (ASP.NET Core - Legacy)
```bash
cd backend
dotnet build         # Build the .NET project
dotnet run           # Run development server
```

### Firebase Deployment
```bash
npm install -g firebase-tools   # Install Firebase CLI
firebase login                  # Authenticate
firebase deploy                 # Deploy to production
firebase serve                  # Test locally with Firebase hosting
```

## Architecture Overview

This is a **dual-architecture project** currently in transition:

### Current Production (Firebase Web MVP)
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **State Management**: TanStack React Query + React Context
- **Authentication**: Firebase Auth (email/password)
- **Database**: Cloud Firestore (NoSQL)
- **Hosting**: Firebase Hosting
- **Status**: ✅ Live in production

### Legacy Backend (ASP.NET Core)
- **Framework**: .NET 9.0 with Entity Framework Core
- **Database**: SQL Server with Identity
- **Authentication**: JWT Bearer tokens
- **Status**: 🚧 Maintained but not deployed

## Key Firebase Collections Structure
```
/users/{userId}                    - User profiles
/dreams/{dreamId}                  - Dream entries
/interpretations/{dreamId}         - AI-generated interpretations
/symbols/{symbolId}                - 21 Jungian archetypal symbols
/userSymbolFrequencies/{userId_symbolId} - User symbol tracking
```

## Important File Locations

### Frontend Configuration
- `frontend/src/config/firebase.ts` - Firebase SDK configuration
- `frontend/src/types/firebase.ts` - TypeScript interfaces for Firestore
- `frontend/src/contexts/AuthContext.tsx` - Firebase Auth integration
- `frontend/src/services/firebase/` - All Firebase service abstractions

### Frontend Architecture Patterns
- **Services Pattern**: Firebase operations abstracted in `src/services/firebase/`
- **React Query Hooks**: Data fetching hooks in `src/hooks/`
- **Type Safety**: Comprehensive TypeScript interfaces in `src/types/`
- **Context Providers**: Auth state managed via React Context

### Legacy Backend Structure
- `backend/Models/` - Entity Framework models
- `backend/Services/` - Business logic services
- `backend/Controllers/` - API endpoints
- `backend/Data/` - DbContext and database configuration

## Firebase Project Details
- **Project ID**: dream-unlocker-mvp
- **Live URL**: https://dream-unlocker-mvp.web.app
- **Console**: https://console.firebase.google.com/project/dream-unlocker-mvp/overview

## Development Workflow

### Working with Firebase Frontend
1. All data operations go through `src/services/firebase/` services
2. Use React Query hooks from `src/hooks/` for data fetching
3. Firebase types are defined in `src/types/firebase.ts`
4. Authentication flows through `AuthContext`

### Firebase Security Rules
- Located in `firestore.rules`
- User-scoped data access (users can only access their own dreams)
- Deploy rules with `firebase deploy --only firestore:rules`

## Key Dependencies

### Frontend
- **React 19** + **TypeScript 5.8**
- **Firebase SDK 12** (Auth + Firestore)
- **TanStack React Query 5** for state management
- **Tailwind CSS 3** + **HeadlessUI** for styling
- **React Router 7** for navigation

### Legacy Backend
- **.NET 9** + **Entity Framework Core 9**
- **ASP.NET Core Identity** + **JWT Bearer Authentication**
- **AutoMapper** for object mapping
- **Swagger/OpenAPI** for API documentation

## Data Seeding

### Firebase Symbol Seeding
```bash
cd frontend
node seedSymbols.mjs    # Seed 21 Jungian symbols to Firestore
```

### Legacy Backend Seeding
- Automatic seeding occurs on application startup via `SymbolSeeder.cs`
- Seeds both symbols and a test user

## TypeScript Configuration
- Strict TypeScript enabled with comprehensive type checking
- Firebase Timestamp handling implemented for date conversions
- All 91 initial TypeScript errors have been resolved

## Deployment Status
- **Production**: Firebase hosting with automatic HTTPS
- **Build Output**: `frontend/dist/` contains production build
- **CI/CD**: Manual deployment via `firebase deploy`
- **Environment**: Production environment configured in Firebase console