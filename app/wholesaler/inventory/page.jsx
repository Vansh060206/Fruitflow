"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { Search, Package, Plus, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { ref, onValue, set, remove, update } from "firebase/database";
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
  const [isLoading, setIsLoading] = useState(true);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    return () => unsubscribe();
  }, [userData]);

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

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!userData?.uid) return;

    setIsSubmitting(true);
    try {
      const itemId = isEditMode && editingItemId ? editingItemId : nanoid();
      const itemRef = ref(realtimeDb, `inventory/${userData.uid}/${itemId}`);

      const quantityNum = parseInt(newItem.quantity) || 0;

      const payload = {
        name: newItem.name,
        image: newItem.image,
        quantity: quantityNum,
        maxQuantity: parseInt(newItem.maxQuantity) || quantityNum,
        pricePerKg: parseFloat(newItem.pricePerKg) || 0,
        freshness: parseInt(newItem.freshness) || 100,
        status: quantityNum < 20 ? "low-stock" : "in-stock",
        updatedAt: Date.now()
      };

      if (!isEditMode) {
        payload.createdAt = Date.now();
      }

      await update(itemRef, payload);
      toast.success(isEditMode ? "Item updated successfully!" : "Item added to inventory successfully!");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error(isEditMode ? "Failed to update item." : "Failed to add item.");
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
    <div className="p-6 space-y-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  {/* Action Menu (Visible on Hover) */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
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
                    <div className="text-7xl group-hover:rotate-12 transition-transform duration-300">
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

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-background border-border shadow-2xl overflow-hidden dark:bg-[#121212] dark:border-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground dark:text-white">
                  {isEditMode ? "Edit Fruit Details" : "Add New Inventory"}
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground dark:text-white/60 dark:hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

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

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium transition-colors dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : (isEditMode ? "Save Changes" : "Add to Stock")}
                  </button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      <style jsx global>{`
                @keyframes pulse-soft {
                    0%,
                    100% {
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
