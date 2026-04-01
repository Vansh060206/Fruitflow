const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const fs = require('fs');

function loadEnv() {
    const envPath = 'd:\\Fruitflow\\role-selection-page\\.env.local';
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/['"]/g, '');
        }
    });
    return env;
}

async function getDbSize() {
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
        const rootRef = ref(db, '/');
        const snapshot = await get(rootRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            const jsonString = JSON.stringify(data);
            const totalBytes = Buffer.byteLength(jsonString, 'utf8');
            
            console.log(`--- DB SIZE ---`);
            console.log(`${totalBytes} bytes`);
        } else {
            console.log("Database is empty.");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit(0);
    }
}

getDbSize();
