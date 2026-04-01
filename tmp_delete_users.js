const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const fs = require('fs');
const { execSync } = require('child_process');

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

async function removeUsers() {
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

    const targetEmails = [
        "dhavaldhanwani2@gmail.com",
        "john@fruitflow.com",
        "retailer@freshmarket.com",
        "naikdev496@ggmail.com",
        "dhavaldhanwani07@gmail.com"
    ];

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        
        let uidsToRemove = [];
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            Object.keys(users).forEach(uid => {
                if (users[uid].email && targetEmails.includes(users[uid].email)) {
                    uidsToRemove.push(uid);
                }
            });
            
            console.log(`Found ${uidsToRemove.length} users to delete.`);
            
            uidsToRemove.forEach(uid => {
                console.log(`Executing deletion for ${uid}...`);
                try {
                    execSync(`firebase database:remove /users/${uid} --force --project fruitflow-5ce89`, { stdio: 'inherit' });
                    // Optionally delete them from Auth as well if requested! BUT using database:remove first.
                } catch (e) {
                    console.error("Firebase CLI Failed for: " + uid);
                }
            });
            
            console.log("Deletion complete!");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit(0);
    }
}

removeUsers();
