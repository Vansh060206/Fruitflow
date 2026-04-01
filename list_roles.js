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

async function listRoles() {
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
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            console.log("\n📋 Account Roles List:");
            Object.keys(users).forEach(uid => {
                const user = users[uid];
                console.log(`- ${user.email}: ${user.role || 'No Role Assigned'}`);
            });
        }
    } catch (error) {
        console.error("Error fetching roles:", error);
    }
}

listRoles();
