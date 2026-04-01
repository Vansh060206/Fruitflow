const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const fs = require('fs');

function loadEnv() {
    const envPath = '.env.local';
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            env[parts[0].trim()] = parts.slice(1).join('=').trim();
        }
    });
    return env;
}

async function checkUsers() {
    const env = loadEnv();
    const firebaseConfig = {
        apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        databaseURL: env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    try {
        console.log("Checking users in database...");
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            console.log("Found users:");
            Object.keys(users).forEach(uid => {
                console.log(`- ${users[uid].email} (2FA Enabled: ${users[uid].is2FAEnabled || false})`);
            });
        } else {
            console.log("No users found in database.");
        }
    } catch (error) {
        console.error("Error checking database:", error);
    }
}

checkUsers();
