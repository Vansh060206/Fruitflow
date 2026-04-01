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

async function getEmails() {
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
        
        let totalBytes = 0;
        let emails = [];
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            Object.keys(users).forEach(uid => {
                if (users[uid].email) {
                    const email = users[uid].email;
                    emails.push(email);
                    // Calculate byte length of the email string
                    totalBytes += Buffer.byteLength(email, 'utf8');
                    // In Firebase database, keys also consume space but usually people simply want raw data size
                }
            });
            console.log("--- EMAILS ---");
            emails.forEach(e => console.log(e));
            console.log("--------------");
            console.log(`Total Emails: ${emails.length}`);
            console.log(`Total Bytes (Raw text): ${totalBytes} bytes`);
        } else {
            console.log("No users found.");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit(0);
    }
}

getEmails();
