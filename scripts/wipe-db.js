const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

// Initialize with databaseURL from your ENV
const app = initializeApp({
  databaseURL: "https://fruitflow-5ce89-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = getDatabase();

async function clearDatabase() {
  console.log("Starting full database wipe...");
  try {
    // Top-level paths to clear
    const paths = [
      'users',
      'inventory',
      'orders',
      'retailer_orders',
      'driver_orders',
      'dispatch_alerts',
      'order_alerts',
      'cart'
    ];

    for (const path of paths) {
      console.log(`Clearing ${path}...`);
      await db.ref(path).set(null);
    }

    console.log("✅ Database cleared successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Wipe failed:", err);
    process.exit(1);
  }
}

clearDatabase();
