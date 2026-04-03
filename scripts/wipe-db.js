// Minimal script using standard 'firebase' client SDK (already installed)
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

const firebaseConfig = {
    apiKey: "AIzaSyCEDlp4sojcMfVUPH6PRyK7nR1fdAKzMH4",
    authDomain: "fruitflow-5ce89.firebaseapp.com",
    databaseURL: "https://fruitflow-5ce89-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fruitflow-5ce89",
    storageBucket: "fruitflow-5ce89.firebasestorage.app",
    messagingSenderId: "13516956309",
    appId: "1:13516956309:web:60a30021359637502cf19c",
    measurementId: "G-MP9V2R4HEH"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function wipe() {
  const nodes = ['users', 'inventory', 'orders', 'retailer_orders', 'driver_orders', 'order_alerts', 'dispatch_alerts', 'cart', 'notifications', 'wastage'];
  console.log("🚀 Starting Database Wipe...");
  
  for (const node of nodes) {
    try {
      console.log(`Cleaning ${node}...`);
      await set(ref(db, node), null);
      console.log(`✅ ${node} empty.`);
    } catch (e) {
      console.log(`❌ Error cleaning ${node}: ${e.message}`);
      console.log(`(Note: This might be due to Rules. If so, manually clear '${node}' in Firebase Console if critical.)`);
    }
  }
}

wipe().then(() => {
  console.log("✨ Final Wipe Attempt Finished.");
  process.exit(0);
});
