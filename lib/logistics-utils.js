import { ref, get, update, push } from "firebase/database";
import { realtimeDb } from "./firebase";

/**
 * Automatically assigns an available driver to an order.
 * @param {string} orderId - The Order ID
 * @param {string} wholesalerId - The Wholesaler ID
 * @param {string} retailerId - The Retailer ID
 * @param {object} orderData - The full order object
 */
export async function autoAssignDriver(orderId, wholesalerId, retailerId, orderData) {
  try {
    // 1. Fetch available drivers
    const usersRef = ref(realtimeDb, 'users');
    const usersSnapshot = await get(usersRef);
    
    if (!usersSnapshot.exists()) return null;

    const allUsers = usersSnapshot.val();
    const availableDrivers = Object.keys(allUsers)
      .map(uid => ({ ...allUsers[uid], uid }))
      .filter(u => u.role === 'driver' && u.driverStatus === 'available');

    if (availableDrivers.length === 0) return null;

    const selectedDriver = availableDrivers[0];
    const timestamp = Date.now();
    
    const deliveryPayload = {
      status: "assigned",
      driverId: selectedDriver.uid,
      driverName: selectedDriver.name || "Driver",
      driverPhone: selectedDriver.phone || "9999999999",
      vehicleNumber: selectedDriver.vehicleNumber || "FF-DRIVE-01",
      vehicleType: selectedDriver.vehicleType || "Truck",
      createdAt: timestamp
    };

    const updates = {};
    // WHOLESALER WRITES TO THEIR OWN PATH (SAFE)
    updates[`orders/${wholesalerId}/${orderId}/delivery`] = deliveryPayload;
    
    // RETAILER WRITES (Optional but useful for UI sync)
    if (retailerId) {
      updates[`retailer_orders/${retailerId}/${orderId}/delivery`] = deliveryPayload;
    }

    // SIGNAL CHANNEL (Public Signal)
    updates[`dispatch_alerts/${selectedDriver.uid}/${orderId}`] = {
      ...orderData,
      id: orderId,
      orderId,
      wholesalerId,
      retailerId,
      delivery: deliveryPayload,
      wholesalerLocation: orderData.wholesalerLocation || "Wholesaler Warehouse",
      createdAt: timestamp,
      type: 'assignment'
    };

    await update(ref(realtimeDb), updates);
    return selectedDriver;
  } catch (error) {
    console.error("Auto-assignment failed:", error);
    return null;
  }
}
