# PresenceCV

A dynamic and elegant online resume builder currently built as a Single-Page Application using React, Vite, and Firebase. 
This project focuses on rich layout editing, responsive previews, and secure user data management.

## Environment Variables Setup

For security purposes, this project uses environment variables to store configuration values (like Firebase settings). 
Before running or building the app, you need to set up a `.env` file at the root.

1. **Copy the `.env.example` file**:
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values in the `.env` file**:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

Note: Because the application uses Vite, environment variables meant to be accessed safely on the frontend must always be prefixed with `VITE_`.

## Security Features

- **Auth Restriction:** Google OAuth with custom prompt selections to prevent accidental overrides.
- **Resource Limitation:** Firebase rules isolate records stringently matching user UIDs per request payload.
- **Data Encapsulation:** Sign out explicitly clears the browser's `localStorage` and triggers robust cleanup.
