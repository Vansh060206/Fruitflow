"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { Search, Package, Plus, Pencil, Trash2, AlertTriangle, X, DollarSign } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { ref, onValue, set, remove, update, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { nanoid } from "nanoid";
import { toast } from "sonner";

// Sample inventory data
const inventoryData = [
  {
    id: 1,
    name: "Red Apples",
    quantity: 450,
    maxQuantity: 500,
    freshness: 95,
    pricePerKg: 3.5,
    status: "in-stock",
    image: "🍎",
  },
  {
    id: 2,
    name: "Bananas",
    quantity: 35,
    maxQuantity: 400,
    freshness: 88,
    pricePerKg: 2.2,
    status: "low-stock",
    image: "🍌",
  },
  {
    id: 3,
    name: "Oranges",
    quantity: 380,
    maxQuantity: 450,
    freshness: 92,
    pricePerKg: 2.8,
    status: "in-stock",
    image: "🍊",
  },
  {
    id: 4,
    name: "Mangoes",
    quantity: 15,
    maxQuantity: 300,
    freshness: 78,
    pricePerKg: 4.5,
    status: "low-stock",
    image: "🥭",
  },
  {
    id: 5,
    name: "Grapes",
    quantity: 285,
    maxQuantity: 350,
    freshness: 90,
    pricePerKg: 5.2,
    status: "in-stock",
    image: "🍇",
  },
  {
    id: 6,
    name: "Strawberries",
    quantity: 8,
    maxQuantity: 200,
    freshness: 65,
    pricePerKg: 6.8,
    status: "low-stock",
    image: "🍓",
  },
  {
    id: 7,
    name: "Watermelon",
    quantity: 125,
    maxQuantity: 150,
    freshness: 94,
    pricePerKg: 1.8,
    status: "in-stock",
    image: "🍉",
  },
  {
    id: 8,
    name: "Pineapple",
    quantity: 220,
    maxQuantity: 250,
    freshness: 87,
    pricePerKg: 3.9,
    status: "in-stock",
    image: "🍍",
  },
  {
    id: 9,
    name: "Cherries",
    quantity: 95,
    maxQuantity: 180,
    freshness: 85,
    pricePerKg: 7.5,
    status: "in-stock",
    image: "🍒",
  },
];


function InventoryPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("name"); // "name", "quantity", "price"
  const [mounted, setMounted] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dump/Spoil Modal State
  const [isDumpModalOpen, setIsDumpModalOpen] = useState(false);
  const [dumpItem, setDumpItem] = useState(null);
  const [dumpQuantity, setDumpQuantity] = useState("");

  const [newItem, setNewItem] = useState({
    name: "",
    image: "🍎",
    quantity: "",
    maxQuantity: "",
    pricePerKg: "",
    freshness: "100"
  });

  const { t } = useLanguage();
  const { userData } = useAuth();

  const fruitIcons = [
    { emoji: "🍎", name: "Apple" }, { emoji: "🥭", name: "Mango" }, { emoji: "🍊", name: "Orange" },
    { emoji: "🍌", name: "Banana" }, { emoji: "🍉", name: "Watermelon" }, { emoji: "🍇", name: "Grapes" },
    { emoji: "🍓", name: "Strawberry" }, { emoji: "🍍", name: "Pineapple" }, { emoji: "🥥", name: "Coconut" },
    { emoji: "🍒", name: "Cherry" }, { emoji: "🍑", name: "Peach" }, { emoji: "🍐", name: "Pear" },
    { emoji: "🍋", name: "Lemon" }, { emoji: "🥝", name: "Kiwi" }, { emoji: "🍈", name: "Melon" },
    { emoji: "🫐", name: "Blueberry" }, { emoji: "🥑", name: "Avocado" }, { emoji: "🍅", name: "Tomato" }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userData?.uid) return;

    setIsLoading(true);
    const inventoryRef = ref(realtimeDb, `inventory/${userData.uid}`);

    const unsubscribe = onValue(inventoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert object to array and calculate dynamic freshness
        const dataArray = Object.keys(data).map(key => {
          const item = data[key];

          // Live Freshness: Loses 0.5% freshness every hour since it was added/updated
          const baseFreshness = parseInt(item.freshness) || 100;
          const timeOrigin = item.updatedAt || item.createdAt || Date.now();
          const hoursSinceUpdate = Math.max(0, (Date.now() - timeOrigin) / (1000 * 60 * 60));
          const freshnessLost = Math.floor(hoursSinceUpdate * 0.5);
          const currentFreshness = Math.max(20, baseFreshness - freshnessLost); // Bottoms out at 20%

          return {
            id: key,
            ...item,
            freshness: currentFreshness
          };
        });
        setInventoryData(dataArray);
      } else {
        setInventoryData([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching inventory:", error);
      setIsLoading(false);
    });

    // Also listen to incoming Retailer stock requests
    const requestsRef = ref(realtimeDb, `stock_requests/${userData.uid}`);
    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const reqs = snapshot.val();
        const pending = Object.entries(reqs).map(([id, r]) => ({id, ...r})).filter(r => r.status === "pending").sort((a,b) => b.createdAt - a.createdAt);
        setPendingRequests(pending);
      } else {
        setPendingRequests([]);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeRequests();
    };
  }, [userData]);

  const handleDenyRequest = async (req) => {
    if (!userData?.uid) return;
    // Optimistically remove it instantly from the screen
    setPendingRequests(prev => prev.filter(r => r.id !== req.id));
    try {
      // Mark as denied
      const requestRef = ref(realtimeDb, `stock_requests/${userData.uid}/${req.id}`);
      await update(requestRef, {
        status: "denied",
        deniedAt: Date.now()
      });
      
      // Optionally notify the retailer
      const notifId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
      const notificationRef = ref(realtimeDb, `notifications/${req.retailerId}/${notifId}`);
      await set(notificationRef, {
        title: "Stock Request Declined",
        message: `${userData.companyName || userData.name || "A Wholesaler"} cannot accommodate your request for ${req.requestedQuantity}kg of ${req.productName} right now.`,
        type: "stock_denied",
        read: false,
        createdAt: Date.now()
      });
      
      toast.info(`Request for ${req.productName} from ${req.retailerName} was dismissed.`);
    } catch (err) {
      console.error("Failed to deny request:", err);
      toast.error("Failed to dismiss request.");
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingItemId(null);
    setNewItem({ name: "", image: "🍎", quantity: "", maxQuantity: "", pricePerKg: "", freshness: "100" });
    setIsAddModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditMode(true);
    setEditingItemId(item.id);
    setNewItem({
      name: item.name,
      image: item.image,
      quantity: item.quantity.toString(),
      maxQuantity: item.maxQuantity.toString(),
      pricePerKg: item.pricePerKg.toString(),
      freshness: item.freshness.toString()
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!userData?.uid) return;
    if (!window.confirm("Are you sure you want to completely remove this item from your inventory?")) return;

    try {
      const itemRef = ref(realtimeDb, `inventory/${userData.uid}/${itemId}`);
      await remove(itemRef);
      toast.success("Item removed from inventory");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const openDumpModal = (item) => {
    setDumpItem(item);
    setDumpQuantity("");
    setIsDumpModalOpen(true);
  };

  const handleDumpSubmit = async (e) => {
    e.preventDefault();
    if (!userData?.uid || !dumpItem) return;

    const dumpQty = parseInt(dumpQuantity);
    if (!dumpQty || dumpQty <= 0) {
      toast.error("Please enter a valid amount to dump");
      return;
    }

    if (dumpQty > dumpItem.quantity) {
      toast.error(`Cannot dump more than current stock (${dumpItem.quantity} kg)`);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Reduce inventory
      const newQuantity = dumpItem.quantity - dumpQty;
      const itemRef = ref(realtimeDb, `inventory/${userData.uid}/${dumpItem.id}`);
      await update(itemRef, {
        quantity: newQuantity,
        status: newQuantity < 20 ? "low-stock" : "in-stock",
        updatedAt: Date.now()
      });

      // 2. Log wastage to analytics
      const wastageRef = ref(realtimeDb, `wastage/${userData.uid}/${nanoid()}`);
      await set(wastageRef, {
        itemId: dumpItem.id,
        itemName: dumpItem.name,
        quantity: dumpQty,
        financialLoss: dumpQty * (dumpItem.pricePerKg || 0),
        date: Date.now()
      });

      toast.success(`Logged ${dumpQty}kg of spoiled ${dumpItem.name}.`);
      setIsDumpModalOpen(false);
    } catch (error) {
      console.error("Error logging dump:", error);
      toast.error("Failed to log spoilage.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!userData?.uid) return;

    setIsSubmitting(true);
    try {
      let itemId = isEditMode && editingItemId ? editingItemId : null;
      let isUpdatingExisting = false;
      let existingItem = null;

      if (!isEditMode) {
        existingItem = inventoryData.find(item => item.name.toLowerCase().trim() === newItem.name.toLowerCase().trim());
        if (existingItem) {
          itemId = existingItem.id;
          isUpdatingExisting = true;
        }
      }

      if (!itemId) {
        itemId = nanoid();
      }

      const itemRef = ref(realtimeDb, `inventory/${userData.uid}/${itemId}`);

      const inputQuantity = parseInt(newItem.quantity) || 0;
      const inputMaxQuantity = parseInt(newItem.maxQuantity) || inputQuantity;
      const totalQuantity = isUpdatingExisting ? ((parseInt(existingItem.quantity) || 0) + inputQuantity) : inputQuantity;
      const totalMaxQuantity = isUpdatingExisting ? ((parseInt(existingItem.maxQuantity) || 0) + inputMaxQuantity) : inputMaxQuantity;

      const payload = {
        name: isUpdatingExisting ? existingItem.name : (newItem.name ? newItem.name.trim() : "Unnamed Item"),
        image: newItem.image,
        quantity: totalQuantity,
        maxQuantity: totalMaxQuantity,
        pricePerKg: parseFloat(newItem.pricePerKg) || (isUpdatingExisting ? existingItem.pricePerKg : 0),
        freshness: parseInt(newItem.freshness) || (isUpdatingExisting ? existingItem.freshness : 100),
        status: totalQuantity < 20 ? "low-stock" : "in-stock",
        updatedAt: Date.now()
      };

      if (!isEditMode && !isUpdatingExisting) {
        payload.createdAt = Date.now();
      }

      await update(itemRef, payload);
      // Check for fulfilled stock requests
      try {
        const requestsRef = ref(realtimeDb, `stock_requests/${userData.uid}`);
        const requestsSnap = await get(requestsRef);
        if (requestsSnap.exists()) {
          const reqs = requestsSnap.val();
          for (const [reqId, reqData] of Object.entries(reqs)) {
            // If pending request matches this product and we now have enough stock
            if (reqData.productId === itemId && reqData.status === "pending" && totalQuantity >= reqData.requestedQuantity) {
              
              const requestToUpdateRef = ref(realtimeDb, `stock_requests/${userData.uid}/${reqId}`);
              await update(requestToUpdateRef, {
                status: "fulfilled",
                fulfilledAt: Date.now()
              });

              // Create notification in Retailer's inbox
              const notifId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
              const notificationRef = ref(realtimeDb, `notifications/${reqData.retailerId}/${notifId}`);
              await set(notificationRef, {
                title: "Stock Request Fulfilled! 🎉",
                message: `${userData.companyName || userData.name || "A Wholesaler"} now has ${reqData.requestedQuantity}kg of ${payload.name} back in stock.`,
                type: "stock_update",
                read: false,
                createdAt: Date.now()
              });
            }
          }
        }
      } catch (err) {
         console.error("Checking requests failed", err);
      }

      toast.success(isEditMode ? "Item updated successfully!" : (isUpdatingExisting ? "Merged with existing inventory successfully!" : "Item added to inventory successfully!"));
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error(isEditMode ? "Failed to update item." : (isUpdatingExisting ? "Failed to merge with existing inventory." : "Failed to add item."));
    } finally {
      setIsSubmitting(false);
    }
  };


  // Filter inventory based on search and selected filter type
  const filteredInventory = inventoryData.filter((item) => {
    // ... (filtering logic unchanged)
    const query = searchQuery.toLowerCase();
    if (!query) return true;

    if (filterType === "name") {
      return item.name.toLowerCase().includes(query);
    } else if (filterType === "quantity") {
      return item.quantity.toString().includes(query);
    } else if (filterType === "price") {
      return item.pricePerKg.toString().includes(query);
    }
    return true;
  });

  return (
    <div className="p-3 sm:p-6 space-y-6">
      
      {/* Pending Requests Banner */}
      {pendingRequests.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 shadow-lg shadow-orange-500/5 dark:bg-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-500 text-white rounded-full p-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-orange-700 dark:text-orange-400">Retailer Stock Requests</h2>
              <p className="text-sm text-orange-600/80 dark:text-orange-400/80">Retailers are waiting for stock on these items. Updating your quantity above their request will automatically notify them!</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {pendingRequests.map((req, i) => (
              <div key={i} className="flex flex-col p-3 rounded-lg bg-white/50 border border-orange-500/20 dark:bg-black/20">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-foreground dark:text-white">{req.productName}</span>
                  <button onClick={() => handleDenyRequest(req)} className="p-1 hover:bg-orange-500/20 text-orange-500 rounded transition-colors" title="Deny / Dismiss Request">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">Requested by: {req.retailerName}</span>
                  <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">{req.requestedQuantity} kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Section */}
      <div className="space-y-4">
        {/* Filter Type Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilterType("name")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === "name"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
          >
            {t('byName')}
          </button>
          <button
            onClick={() => setFilterType("quantity")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === "quantity"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
          >
            {t('byStock')}
          </button>
          <button
            onClick={() => setFilterType("price")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === "price"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
          >
            {t('byPrice')}
          </button>
        </div>

        {/* Right Side: Search & Add */}
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
            <input
              type="text"
              placeholder={t('searchInventoryPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
            />
          </div>
          <button
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 font-medium transition-colors whitespace-nowrap shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Loading your stock...</p>
        </div>
      ) : (
        <>
          {/* Inventory Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredInventory.map((item, index) => {
              const quantityPercentage = (item.quantity / item.maxQuantity) * 100;
              const isLowStock = item.status === "low-stock";

              return (
                <Card
                  key={item.id}
                  className={`relative bg-card/50 backdrop-blur-sm border-border p-6 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group dark:bg-white/5 dark:border-white/10 dark:hover:shadow-emerald-500/10 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"} ${isLowStock ? "animate-pulse-soft" : ""}`}
                  style={{
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Action Menu (Visible on Hover for desktop, Always visible on mobile) */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10 bg-white/50 dark:bg-black/50 p-1 rounded-full md:bg-transparent md:p-0">
                    <button
                      onClick={() => openDumpModal(item)}
                      className="bg-white/80 dark:bg-black/50 hover:bg-orange-50 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 p-2 rounded-full shadow-sm backdrop-blur border border-orange-100 dark:border-white/10 transition-colors"
                      title="Log Spoilage / Dump"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="bg-white/80 dark:bg-black/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-2 rounded-full shadow-sm backdrop-blur border border-emerald-100 dark:border-white/10 transition-colors"
                      title="Edit Item"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="bg-white/80 dark:bg-black/50 hover:bg-red-50 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 p-2 rounded-full shadow-sm backdrop-blur border border-red-100 dark:border-white/10 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Fruit Image */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-5xl md:text-7xl group-hover:rotate-12 transition-transform duration-300">
                      {item.image}
                    </div>
                  </div>

                  {/* Fruit Name */}
                  <h3 className="text-xl font-semibold text-foreground mb-4 text-center dark:text-white">{t(item.name)}</h3>

                  {/* Quantity Indicator */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground dark:text-white/60">{t('stockLevel')}</span>
                      <span className="text-foreground font-medium dark:text-white">
                        {item.quantity} / {item.maxQuantity} kg
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden dark:bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${quantityPercentage > 50
                          ? "bg-emerald-500"
                          : quantityPercentage > 20
                            ? "bg-yellow-500"
                            : "bg-red-500"
                          }`}
                        style={{
                          width: mounted ? `${quantityPercentage}%` : "0%",
                          transitionDelay: `${index * 50 + 200}ms`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Freshness Indicator */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground dark:text-white/60">{t('freshness')}</span>
                      <span className="text-foreground font-medium dark:text-white">{item.freshness}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden dark:bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${item.freshness > 85
                          ? "bg-emerald-500"
                          : item.freshness > 70
                            ? "bg-yellow-500"
                            : "bg-red-500"
                          }`}
                        style={{
                          width: mounted ? `${item.freshness}%` : "0%",
                          transitionDelay: `${index * 50 + 200}ms`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground text-sm dark:text-white/60">{t('pricePerKg')}</span>
                    <span className="text-2xl font-bold text-emerald-500">₹{item.pricePerKg}</span>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="flex items-center justify-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${isLowStock
                        ? "bg-red-500/10 text-red-600 border border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                        }`}
                    >
                      {isLowStock ? t('lowStock') : t('inStock')}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* No results message */}
          {!isLoading && filteredInventory.length === 0 && (
            <div className="text-center py-16 bg-card/50 backdrop-blur-sm border border-dashed border-border rounded-2xl dark:bg-white/5 dark:border-white/10">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 dark:text-white">Your inventory is empty</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6 dark:text-white/60">
                {searchQuery ? "No items match your search. Try different keywords." : "You haven't listed any items for sale yet. Add your first fruit to start receiving orders from retailers."}
              </p>
              {!searchQuery && (
                <button
                  onClick={openAddModal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-semibold transition-transform active:scale-95 shadow-lg shadow-emerald-500/25"
                >
                  + Add First Item
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Add / Edit Inventory Modal / Sheet */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={() => setIsAddModalOpen(false)}
        >
          <Card 
            className="w-full max-w-lg bg-background border-border shadow-2xl overflow-hidden dark:bg-[#121212] dark:border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500 max-h-[92vh] flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            {/* Grabber for Mobile */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-3 sm:hidden" />

            <div className="px-6 py-4 sm:p-6 border-b border-border dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-foreground dark:text-white uppercase tracking-tight">
                  {isEditMode ? "Update Produce" : "New Inventory"}
                </h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                  {isEditMode ? "Modify existing stock details" : "Add fresh stock to marketplace"}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-muted/50 hover:bg-muted text-muted-foreground rounded-full transition-all dark:text-white/60 dark:hover:bg-white/10 active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">

              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3 dark:text-white/80">Select Fruit Icon</label>
                    <div className="grid grid-cols-6 gap-2 bg-muted/30 p-3 rounded-xl dark:bg-black/20 overflow-y-auto max-h-40">
                      {fruitIcons.map((item) => (
                        <button
                          key={item.emoji}
                          type="button"
                          onClick={() => setNewItem({ ...newItem, image: item.emoji })}
                          className={`text-2xl p-2 rounded-lg transition-all duration-200 hover:bg-emerald-500/20 active:scale-90 ${newItem.image === item.emoji
                            ? "bg-emerald-500/20 ring-2 ring-emerald-500 scale-110 z-10"
                            : "hover:scale-110"
                            }`}
                          title={item.name}
                        >
                          {item.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground mb-1 dark:text-white/80">Fruit Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fresh Mangoes"
                      value={newItem.name}
                      onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1 dark:text-white/80">Current Stock (kg)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="100"
                      value={newItem.quantity}
                      onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1 dark:text-white/80">Max Capacity (kg)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="150"
                      value={newItem.maxQuantity}
                      onChange={e => setNewItem({ ...newItem, maxQuantity: e.target.value })}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1 dark:text-white/80">Price (₹/kg)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="45.50"
                      value={newItem.pricePerKg}
                      onChange={e => setNewItem({ ...newItem, pricePerKg: e.target.value })}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1 dark:text-white/80">Freshness %</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      placeholder="100"
                      value={newItem.freshness}
                      onChange={e => setNewItem({ ...newItem, freshness: e.target.value })}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-background/80 backdrop-blur-md mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 order-2 sm:order-1 px-4 py-3 border border-border text-foreground rounded-xl hover:bg-muted font-bold text-xs uppercase tracking-widest transition-all dark:border-white/20 dark:text-white dark:hover:bg-white/10 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] order-1 sm:order-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20 active:scale-95"
                  >
                    {isSubmitting ? "Processing..." : (isEditMode ? "Save Changes" : "Confirm Addition")}
                  </button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      <style jsx global>{`
                @keyframes pulse-soft {
                    0%, 100% {
                        border-color: rgba(239, 68, 68, 0.3);
                        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2);
                    }
                    50% {
                        border-color: rgba(239, 68, 68, 0.5);
                        box-shadow: 0 0 20px 0 rgba(239, 68, 68, 0.3);
                    }
                }
                .animate-pulse-soft {
                    animation: pulse-soft 2s ease-in-out infinite;
                }
            `}</style>

      {/* Dump Modal / Sheet Overlay */}
      {isDumpModalOpen && dumpItem && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300"
          onClick={() => setIsDumpModalOpen(false)}
        >
          <div 
            className="bg-background max-w-md w-full rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Grabber for Mobile */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-3 sm:hidden" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Log Spoilage</h3>
                </div>
                <button
                  onClick={() => setIsDumpModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-muted/50 hover:bg-muted text-muted-foreground transition-all rounded-full active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-muted/50 rounded-2xl p-5 mb-6 border border-border/50">
                <p className="font-black text-lg flex items-center gap-3 uppercase tracking-tight">
                  <span className="text-3xl">{dumpItem.image}</span> {dumpItem.name}
                </p>
                <div className="flex justify-between text-[10px] mt-3 text-muted-foreground uppercase font-black tracking-widest opacity-60">
                  <span>Stock: <span className="text-foreground dark:text-white">{dumpItem.quantity} kg</span></span>
                  <span>Freshness: <span className={`${dumpItem.freshness < 50 ? 'text-orange-500' : 'text-foreground dark:text-white'}`}>{dumpItem.freshness}%</span></span>
                </div>
              </div>

              <form onSubmit={handleDumpSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Quantity to Dump (kg)</label>
                  <p className="text-[10px] text-muted-foreground mb-4 leading-relaxed opacity-60 font-medium">
                    This will permanently remove stock and log the financial loss in your analytics dashboard. This action cannot be undone.
                  </p>
                  <input
                    type="number"
                    required
                    min="1"
                    max={dumpItem.quantity}
                    placeholder="e.g. 5"
                    value={dumpQuantity}
                    onChange={e => setDumpQuantity(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 dark:bg-white/5 dark:border-white/10 placeholder:font-normal placeholder:opacity-50"
                  />
                  {dumpQuantity && parseInt(dumpQuantity) > 0 && (
                    <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg mt-3">
                       <p className="text-xs text-red-500 font-bold flex items-center gap-2">
                         <DollarSign className="w-3 h-3" /> Est. Financial Loss: ₹{(parseInt(dumpQuantity) * dumpItem.pricePerKg).toFixed(2)}
                       </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDumpModalOpen(false)}
                    className="flex-1 order-2 sm:order-1 px-4 py-3 border border-border text-foreground rounded-xl hover:bg-muted font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] order-1 sm:order-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-red-600/20 active:scale-95"
                  >
                    {isSubmitting ? "Logging..." : "Confirm Spoilage"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <ProtectedRoute allowedRole="wholesaler">
      <InventoryPageContent />
    </ProtectedRoute>
  );
}
