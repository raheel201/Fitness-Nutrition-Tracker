# Fitness & Nutrition Tracker

A modern web application for tracking workouts, nutrition, and fitness progress built with React.js, TailwindCSS, Chart.js, and Firebase.

## Features

- **User Authentication**: Sign up/login with email or Google
- **Workout Planning**: Create and track workout routines with drag-and-drop interface
- **Nutrition Tracking**: Log meals and track calories, macros with daily goals
- **Progress Analytics**: Interactive charts showing trends and progress
- **User Profiles**: Manage personal information and fitness goals
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React.js + Vite
- **Styling**: TailwindCSS
- **Charts**: Chart.js + react-chartjs-2
- **Backend**: Firebase (Authentication + Firestore)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fitness-nutrition-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy the environment template:
   ```bash
   cp .env.example .env
   ```
4. **Firebase Setup**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Copy your Firebase config values and update the `.env` file:

   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   ```

   **⚠️ Important**: Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DashboardShell.jsx
│   ├── Modal.jsx
│   └── Spinner.jsx
├── contexts/           # React Context for state management
│   └── AuthContext.jsx
├── firebase/           # Firebase configuration
│   └── config.js
├── pages/              # Page-level components
│   ├── AuthPage.jsx
│   ├── DashboardPage.jsx
│   ├── NutritionPage.jsx
│   ├── WorkoutsPage.jsx
│   ├── AnalyticsPage.jsx
│   └── ProfilePage.jsx
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## Usage

### Authentication

- Sign up with email/password or Google account
- Complete your profile with personal details and fitness goals

### Workouts

- Create custom workout routines
- Add exercises from the built-in library
- Schedule workouts and mark them as completed
- Track workout streaks

### Nutrition

- Search and add foods from the database
- Track daily calories and macronutrients
- Set and monitor daily nutrition goals
- View progress against targets

### Analytics

- View interactive charts of your progress
- Track calorie intake trends
- Monitor workout frequency
- Analyze macro distribution

## Firebase Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    match /nutrition/{nutritionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Future Enhancements

- **Wearable Integration**: Connect with Google Fit / Apple Health APIs
- **Social Features**: Add friends, share progress, compete in challenges
- **Gamification**: Badges for streaks, leaderboards
- **Meal Recommendations**: Suggest recipes based on remaining macros
- **Push Notifications**: Reminders for workouts and meals
- **Offline Support**: PWA capabilities for offline usage

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
