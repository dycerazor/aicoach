# **App Name**: AI Coach Connect

## Core Features:

- Simli AI Coaching Interface: A dedicated UI component (`MascotCoach`) to display the real-time video and audio stream from the Simli AI coach, utilizing <video> and <audio> elements.
- Simli Session Token Endpoint: A Firebase Cloud Function (v2) named `getSimliToken` to securely fetch a session token from Simli using an environment variable-based API Key.
- Gemini Multimodal Live Integration: Establish a WebSocket connection to the Gemini Multimodal Live API for real-time text and audio communication with the AI coach.
- Gemini Audio Processing Tool: A processing tool to convert the 24kHz output audio from Gemini into the 16kHz PCM format, which is required by `simliClient.sendAudioData()` for consistent audio transmission.
- Coaching Session Control: A 'Start Coaching' button that initializes both the Gemini Multimodal session (via WebSockets) and the Simli WebRTC stream simultaneously to begin an interactive session.
- Simli Client WebRTC Management: Management of the `simli-client` WebRTC stream, handling initialization, connection, and data exchange with the Simli platform.

## Style Guidelines:

- Primary color: A deep, professional blue (#385CA6), conveying trust and intelligence for the core interactive elements.
- Background color: A very light, subtle blue (#E6EAF3), providing a clean and calming backdrop for extended focus.
- Accent color: A vibrant, clear cyan (#3BCBED), used for call-to-action buttons and interactive highlights to ensure visibility.
- Body and headline font: 'Inter' (sans-serif), chosen for its modern, highly readable, and neutral appearance, suitable for clear communication in a coaching context.
- Use a set of clean, minimalist line icons for interaction controls (e.g., play/pause, microphone, send). Subtle thought bubble or neural network motifs can visually reinforce AI involvement.
- The layout will prioritize the Simli coach's video feed in a central position. Essential controls like 'Start Coaching' will be conveniently located at the bottom or a side panel for easy access, ensuring an intuitive user experience.
- Introduce subtle, smooth transition animations for interface state changes and button interactions, ensuring the application feels responsive and fluid without being distracting during live coaching.