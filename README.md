# CRISP: Community Reporting Interface for Safety and Prevention

## Overview

CRISP is a Community Reporting Interface for Safety and Prevention. The platform enables users to report public safety incidents like broken streetlights, potholes, and other concerns. The project includes the following components:

- **React** for the web frontend
- **React Native with Expo** for the mobile app
- **Django** for the backend API
- **Firebase** for authentication, real-time database, and storage
- **PostgreSQL** for persistent database storage

## Technologies Used

- **Frontend:**
  - React
  - React Native with Expo
- **Backend:**
  - Django
  - Firebase
  - PostgreSQL
- **Other:**
  - Firebase Authentication
  - Firebase Cloud Storage

---

## Prerequisites

Ensure that you have the following installed on your machine:

- **Node.js** (for React and React Native)
- **Expo CLI** (for React Native Expo development)
- **Python 3** (for Django)
- **Pip** (for managing Python packages)
- **PostgreSQL** (for the database)
- **Firebase account** (for Firebase Authentication, Firestore, and Cloud Storage)
- **Django** (for backend API)
- **Docker** (optional, for PostgreSQL setup)

---

## Setup Instructions

Follow these steps to set up and run the CRISP application on your local machine.

---

### 1. Clone the Repository

Clone the repository to your local machine.

```bash
git clone https://github.com/your-username/crisp.git
cd crisp
```
### 2. Setup the Backend (Django)
a. Install Python Dependencies
Navigate to the backend directory and install the necessary Python packages.

```bash
cd django-firebase-psql
python -m venv venv  # Create a virtual environment (if not done already)
source venv/bin/activate  # Activate the virtual environment (Linux/Mac) or venv\Scripts\activate (Windows)
or venv\scripts\activate

cd /app
pip install -r requirements.txt  # Install dependencies
```

b. Configure Firebase
Go to the Firebase Console: https://console.firebase.google.com/

Create a new Firebase project or use an existing one.

Download the Firebase Admin SDK service account key from Firebase.

In your Django backend, place the service account JSON file in the backend/config directory (or update the path in the Django settings).

Set the environment variable GOOGLE_SERVICE_BASE64 to the base64-encoded content of your Firebase service account key (for security).

After you've downloaded the service json key from firebase

```bash
base64 /path/service_key.json
```
Copy the string put it on env
**GOOGLE_SERVICE_BASE64=base64_value**

c. c. Setup PostgreSQL
Ensure PostgreSQL is installed and running.
Create a new PostgreSQL database:
```bash
createdb crisp_db
```
Update the DATABASE_PUBLIC_URL environment variable in your .env file to match your PostgreSQL connection string, e.g.:
**Put your db credentials in settings.py**

Run the Django migrations to set up the database schema:
```bash
python manage.py migrate
```

d. Running the Django Development Server
To run the Django backend locally:

```bash
python manage.py runserver 0.0.0.0:8000
```
By default, Django will run on http://127.0.0.1:8000/.

### 3. Setup the Frontend (React)
a. Install Node.js Dependencies
Navigate to the frontend directory (where your React app is located).

```bash
cd thesis
cd website
npm install
```

b. Configure Firebase
Create a Firebase web app in the Firebase Console.

Copy the Firebase configuration from your Firebase project settings.

In your thesis/website/src/firebaseConfig.jsx, paste the Firebase configuration for both authentication and storage.


c. Running the React Development Server
To start the React app locally:
```bash
npm run dev
```

### 4. Setup the Mobile App on Development(React Native with Expo)
a. Intall Dependencies

```bash
cd Crisp
npm install
```

b. Configure Firebase
As with the web app, configure Firebase by copying your Firebase configuration into Crisp/firebase/firebaseConfig.js
**setup it on app.json**

**d. Running the Mobile App***
To run the React Native app using Expo:
```bash
npx expo start
```

**This will open the Expo development server, where you can scan the QR code with your mobile device to run the app.**



