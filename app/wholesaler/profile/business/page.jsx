"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import {
    Store,
    FileText,
    Globe,
    MapPin,
    CreditCard,
    Building2,
    CheckCircle2,
    AlertCircle,
    Save,
    Map,
    Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { ref, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

import { useRef } from "react";
import { INDIAN_STATES, MAJOR_CITIES, ALL_CITIES } from "@/lib/location-data";

function BusinessProfileContent() {
    const [mounted, setMounted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { userData, user } = useAuth();

    const [formData, setFormData] = useState({
        companyName: "",
        gstNumber: "",
        panNumber: "",
        businessType: "Sole Proprietorship",
        description: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        bankName: "",
        accountNumber: "",
        ifscCode: ""
    });

    const [suggestions, setSuggestions] = useState({ state: [], city: [] });
    const [showSuggestions, setShowSuggestions] = useState({ state: false, city: false });
    const suggestionRefs = {
        state: useRef(null),
        city: useRef(null)
    };

    useEffect(() => {
        setMounted(true);
        if (userData) {
            setFormData({
                companyName: userData.companyName || userData.name || "",
                gstNumber: userData.gstNumber || "",
                panNumber: userData.panNumber || "",
                businessType: userData.businessType || "Sole Proprietorship",
                description: userData.description || "",
                address: userData.address || userData.location || "",
                city: userData.city || "",
                state: userData.state || "",
                pincode: userData.pincode || "",
                bankName: userData.bankName || "",
                accountNumber: userData.accountNumber || "",
                ifscCode: userData.ifscCode || ""
            });
        }

        const handleClickOutside = (event) => {
            if (suggestionRefs.state.current && !suggestionRefs.state.current.contains(event.target)) {
                setShowSuggestions(prev => ({ ...prev, state: false }));
            }
            if (suggestionRefs.city.current && !suggestionRefs.city.current.contains(event.target)) {
                setShowSuggestions(prev => ({ ...prev, city: false }));
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "state") {
            if (value.length > 0) {
                const filtered = INDIAN_STATES.filter(s =>
                    s.toLowerCase().includes(value.toLowerCase())
                ).slice(0, 5);
                setSuggestions(prev => ({ ...prev, state: filtered }));
                setShowSuggestions(prev => ({ ...prev, state: filtered.length > 0 }));
            } else {
                setShowSuggestions(prev => ({ ...prev, state: false }));
            }
        }

        if (name === "city") {
            if (value.length > 0) {
                const cityPool = formData.state && MAJOR_CITIES[formData.state]
                    ? MAJOR_CITIES[formData.state]
                    : ALL_CITIES;

                const filtered = cityPool.filter(c =>
                    c.toLowerCase().includes(value.toLowerCase())
                ).slice(0, 5);
                setSuggestions(prev => ({ ...prev, city: filtered }));
                setShowSuggestions(prev => ({ ...prev, city: filtered.length > 0 }));
            } else {
                setShowSuggestions(prev => ({ ...prev, city: false }));
            }
        }
    };

    const selectSuggestion = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setShowSuggestions(prev => ({ ...prev, [name]: false }));

        // If state is selected, clear city if it doesn't belong to the new state
        if (name === "state") {
            const stateCities = MAJOR_CITIES[value] || [];
            if (formData.city && !stateCities.includes(formData.city) && MAJOR_CITIES[value]) {
                setFormData(prev => ({ ...prev, city: "" }));
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            const userRef = ref(realtimeDb, `users/${user.uid}`);
            await update(userRef, {
                ...formData,
                updatedAt: new Date().toISOString()
            });
            toast.success("Business profile updated successfully!");
        } catch (error) {
            console.error("Error updating business profile:", error);
            toast.error("Failed to update business profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const fillDummyData = () => {
        setFormData({
            companyName: "Fresh Orchard Wholesale Ltd.",
            gstNumber: "27AAAAA0000A1Z5",
            panNumber: "ABCDE1234F",
            businessType: "Private Limited",
            description: "Leading supplier of premium organic fruits across Western India.",
            address: "Plot No. 45-B, Sector 19, Vashi Mandi, Navi Mumbai",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400703",
            bankName: "HDFC Bank",
            accountNumber: "50100234567890",
            ifscCode: "HDFC0000001"
        });
        toast.info("Form filled with dummy data!");
    };

    if (!mounted) return null;

    const inputClasses = "w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white";
    const labelClasses = "block text-sm font-medium text-muted-foreground mb-1.5 dark:text-white/60";

    const SuggestionDropdown = ({ items, onSelect, show, refObj }) => {
        if (!show || items.length === 0) return null;
        return (
            <div
                ref={refObj}
                className="absolute z-[100] w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 dark:bg-[#1a1a1a] dark:border-white/10"
            >
                {items.map((item, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => onSelect(item)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors border-b border-border/50 last:border-0 dark:text-white/80 dark:hover:text-emerald-400"
                    >
                        {item}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-8 max-w-5xl mx-auto pb-12">
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div>
                    <h1 className="text-3xl font-bold text-foreground dark:text-white mb-2">Business Profile</h1>
                    <p className="text-muted-foreground dark:text-white/60">Manage your business identification and operational details.</p>
                </div>
                <button
                    type="button"
                    onClick={fillDummyData}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-sm font-medium hover:bg-emerald-500/20 transition-all dark:text-emerald-400"
                >
                    <Sparkles className="w-4 h-4" />
                    Fill Dummy Data
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Identification Details */}
                <Card className={`p-6 bg-card/50 backdrop-blur-sm border-border transition-all duration-700 delay-100 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground dark:text-white">Tax & Identification</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Company Legal Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            placeholder="Enter legal business name"
                                            className={`${inputClasses} pl-10`}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Business Type</label>
                                    <select
                                        name="businessType"
                                        value={formData.businessType}
                                        onChange={handleInputChange}
                                        className={inputClasses}
                                    >
                                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                                        <option value="Partnership">Partnership</option>
                                        <option value="Private Limited">Private Limited</option>
                                        <option value="Public Limited">Public Limited</option>
                                        <option value="LLP">Limited Liability Partnership (LLP)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>GST Number</label>
                                    <input
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleInputChange}
                                        placeholder="22AAAAA0000A1Z5"
                                        className={inputClasses}
                                        maxLength={15}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1 px-1">15-digit GSTIN</p>
                                </div>
                                <div>
                                    <label className={labelClasses}>PAN Number</label>
                                    <input
                                        name="panNumber"
                                        value={formData.panNumber}
                                        onChange={handleInputChange}
                                        placeholder="ABCDE1234F"
                                        className={inputClasses}
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Business Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your business, specialization, or history..."
                                className={`${inputClasses} min-h-[80px] resize-none`}
                            />
                        </div>
                    </div>
                </Card>

                {/* Operational Details */}
                <Card className={`p-6 bg-card/50 backdrop-blur-sm border-border transition-all duration-700 delay-200 dark:bg-white/5 dark:border-white/10 relative ${showSuggestions.state || showSuggestions.city ? "z-50" : "z-20"} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground dark:text-white">Business Location</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className={labelClasses}>Registered Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Enter complete business address"
                                className={`${inputClasses} min-h-[100px] resize-none`}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className={`relative ${showSuggestions.state ? "z-[60]" : "z-0"}`}>
                                <label className={labelClasses}>State</label>
                                <input
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    placeholder="State"
                                    className={inputClasses}
                                    autoComplete="off"
                                />
                                <SuggestionDropdown
                                    items={suggestions.state}
                                    onSelect={(val) => selectSuggestion("state", val)}
                                    show={showSuggestions.state}
                                    refObj={suggestionRefs.state}
                                />
                            </div>
                            <div className={`relative ${showSuggestions.city ? "z-[60]" : "z-0"}`}>
                                <label className={labelClasses}>City</label>
                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="City"
                                    className={inputClasses}
                                    autoComplete="off"
                                />
                                <SuggestionDropdown
                                    items={suggestions.city}
                                    onSelect={(val) => selectSuggestion("city", val)}
                                    show={showSuggestions.city}
                                    refObj={suggestionRefs.city}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Pincode</label>
                                <input
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    placeholder="6-digit Pincode"
                                    className={inputClasses}
                                    maxLength={6}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Bank Account Details */}
                <Card className={`p-6 bg-card/50 backdrop-blur-sm border-border transition-all duration-700 delay-300 dark:bg-white/5 dark:border-white/10 relative z-10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground dark:text-white">Settlement Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className={labelClasses}>Bank Name</label>
                            <input
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleInputChange}
                                placeholder="e.g. HDFC Bank"
                                className={inputClasses}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className={labelClasses}>Account Number</label>
                            <input
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleInputChange}
                                placeholder="000000000000"
                                className={inputClasses}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className={labelClasses}>IFSC Code</label>
                            <input
                                name="ifscCode"
                                value={formData.ifscCode}
                                onChange={handleInputChange}
                                placeholder="HDFC0001234"
                                className={inputClasses}
                                maxLength={11}
                            />
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                            Provide accurate bank details to ensure timely settlement of your payments from FruitFlow.
                        </p>
                    </div>
                </Card>

                {/* Form Actions */}
                <div className={`flex items-center justify-end gap-4 transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <button
                        type="button"
                        className="px-6 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors dark:border-white/10 dark:hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Profile
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function BusinessProfilePage() {
    return (
        <ProtectedRoute allowedRole="wholesaler">
            <BusinessProfileContent />
        </ProtectedRoute>
    );
}
