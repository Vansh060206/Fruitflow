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

async function checkUser() {
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

    const targetEmail = "mankanihitesh7@gmail.com";

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        
        let found = false;
        if (snapshot.exists()) {
            const users = snapshot.val();
            Object.keys(users).forEach(uid => {
                if (users[uid].email && users[uid].email.toLowerCase() === targetEmail.toLowerCase()) {
                    found = true;
                    console.log(`\n\n=== USER FOUND ===\nEmail: ${users[uid].email}\nRole: ${users[uid].role}\nName: ${users[uid].name}\nUID: ${uid}\n==================\n`);
                }
            });
            
            if (!found) {
                console.log(`\n\n=== NOT FOUND ===\nThe email ${targetEmail} does NOT exist in the users database.\n=================\n`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit(0);
    }
}

checkUser();
