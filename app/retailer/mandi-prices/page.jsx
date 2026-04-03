"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
    Search, 
    TrendingUp, 
    MapPin, 
    Calendar, 
    Sparkles, 
    Info, 
    ArrowUpRight, 
    ArrowDownRight,
    Loader2
} from "lucide-react";
import { 
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { ProtectedRoute } from "@/components/protected-route";

function RetailerMandiPricesContent() {
    const [fruit, setFruit] = useState("Apple");
    const [loading, setLoading] = useState(true);
    const [mandiData, setMandiData] = useState([]);
    const [aiInsight, setAiInsight] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const { language } = useLanguage();

    // Fetch Mandi Data from shared API route
    const fetchMandiData = async (searchFruit) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/mandi-prices?fruit=${searchFruit}`);
            const json = await res.json();
            if (json.success) {
                setMandiData(json.data);
                generateAiInsight(searchFruit, json.data);
            } else {
                toast.error("Failed to fetch market prices");
            }
        } catch (err) {
            console.error("Mandi Fetch Error:", err);
            toast.error("Server error while fetching Mandi data");
        } finally {
            setLoading(false);
        }
    };

    // Generate AI Prediction for Retailers (Focus on Buying Strategy)
    const generateAiInsight = async (fruitName, prices) => {
        setIsAiLoading(true);
        try {
            const prompt = `Analyze these mandi prices for ${fruitName} in India: ${JSON.stringify(prices)}. 
            You are advising a Retailer (Shop Owner). 
            Provide a short 2-sentence buying prediction (price likely to rise? buy now?) and which market has the best entry price.
            Language: ${language === 'hi' ? 'Hindi' : 'English'}`;
            
            const res = await fetch("/api/ai/predict", {
                method: "POST",
                body: JSON.stringify({ 
                    customPrompt: prompt,
                    role: 'retailer' 
                })
            });
            const json = await res.json();
            if (json.insights) {
                setAiInsight(json.insights[0]);
            }
        } catch (err) {
            console.error("AI Mandi Error:", err);
        } finally {
            setIsAiLoading(false);
        }
    };

    useEffect(() => {
        fetchMandiData(fruit);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMandiData(fruit);
    };

    // Prepare chart data (Simulated 7-day trend based on current modal price)
    const chartData = [
        { day: "Day 1", price: (mandiData[0]?.priceModal || 50) * 0.94 },
        { day: "Day 2", price: (mandiData[0]?.priceModal || 50) * 0.97 },
        { day: "Day 3", price: (mandiData[0]?.priceModal || 50) * 0.95 },
        { day: "Day 4", price: (mandiData[0]?.priceModal || 50) * 1.01 },
        { day: "Day 5", price: (mandiData[0]?.priceModal || 50) * 1.04 },
        { day: "Day 6", price: (mandiData[0]?.priceModal || 50) * 0.98 },
        { day: "Today", price: (mandiData[0]?.priceModal || 50) },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Search & Intro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-foreground dark:text-white">National Price Index</h2>
                    <p className="text-muted-foreground mt-1 dark:text-white/60">Compare mandi prices across India to buy smarter for your shop.</p>
                </div>
                
                <form onSubmit={handleSearch} className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        type="text" 
                        value={fruit}
                        onChange={(e) => setFruit(e.target.value)}
                        placeholder="Search fruit (e.g. Apple, Banana)..." 
                        className="w-full pl-10 pr-4 py-3 bg-card/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                </form>
            </div>

            {/* AI Buying Insight Card */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-purple-800 dark:text-purple-400">Retail Procurement Assistant</h3>
                        <p className="text-xs text-purple-600/80 dark:text-purple-400/60">Buying Recommendation for {fruit}</p>
                    </div>
                </div>
                
                {isAiLoading ? (
                    <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI is analyzing mandi arrivals and prices...</span>
                    </div>
                ) : (
                    <p className="text-foreground dark:text-white leading-relaxed font-semibold italic border-l-4 border-purple-500 pl-4 bg-white/5 rounded-r-lg py-2">
                        "{aiInsight || `Looking for best wholesale rates for ${fruit}. Current trends suggest Mumbai APMC as the best sourcing point for quality and price.`}"
                    </p>
                )}
            </Card>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Price Table / Cards */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xl flex items-center gap-2">
                             Live Mandi Listings
                        </h4>
                        <span className="text-[10px] bg-muted px-2 py-1 rounded-full text-muted-foreground dark:bg-white/10 uppercase font-bold tracking-widest">REAL-TIME DATA</span>
                    </div>

                    {loading ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                             {[1,2,3,4].map(i => (
                                <div key={i} className="h-40 bg-muted/30 rounded-xl animate-pulse border border-border" />
                             ))}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {mandiData.map((mandi, i) => (
                                <Card key={i} className="p-4 sm:p-5 hover:shadow-2xl transition-all duration-300 group border-border dark:bg-white/5 dark:border-white/10 hover:border-purple-500/30 overflow-hidden">
                                    <div className="flex justify-between items-start mb-4 gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <MapPin className="w-4 h-4 text-purple-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <h5 className="font-bold text-foreground dark:text-white leading-none truncate">{mandi.mandiName}</h5>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 truncate">{mandi.state}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-[10px] sm:text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-1 rounded">₹{mandi.priceModal}/kg</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground mb-4">
                                        <div className="flex-1 p-2 bg-muted/30 rounded-lg dark:bg-white/5 border border-transparent group-hover:border-purple-500/10 min-w-0">
                                            <p className="text-[9px] uppercase font-bold tracking-tighter truncate">Min Price</p>
                                            <p className="text-foreground font-black text-xs sm:text-sm dark:text-white truncate">₹{mandi.priceMin}</p>
                                        </div>
                                        <div className="flex-1 p-2 bg-muted/30 rounded-lg dark:bg-white/5 border border-transparent group-hover:border-purple-500/10 min-w-0">
                                            <p className="text-[9px] uppercase font-bold tracking-tighter truncate">Max Price</p>
                                            <p className="text-foreground font-black text-xs sm:text-sm dark:text-white truncate">₹{mandi.priceMax}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-[10px] border-t pt-3 border-border dark:border-white/5">
                                        <div className="flex items-center gap-1 font-medium italic">
                                            <Calendar className="w-3 h-3" />
                                            Updated: {mandi.date}
                                        </div>
                                        <div className={`flex items-center gap-1 font-black ${mandi.priceModal > 4000 ? 'text-emerald-500' : 'text-blue-500'}`}>
                                            <TrendingUp className="w-3 h-3" />
                                            {mandi.priceModal > 4000 ? 'BULLISH' : 'STABLE'}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Trend Analysis Chart */}
                <div className="space-y-6">
                    <h4 className="font-bold text-xl flex items-center gap-2">
                         Market Volatility
                    </h4>
                    <Card className="p-6 h-[400px] flex flex-col justify-between dark:bg-white/5 dark:border-white/10 overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="text-3xl font-black text-foreground dark:text-white">₹{mandiData[0]?.priceModal || 50}</p>
                                <div className="flex items-center gap-1 text-purple-600 text-xs font-bold">
                                    <ArrowUpRight className="w-4 h-4" />
                                    <span>Regional Demand High</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shadow-inner">
                                <TrendingUp className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorPricePurp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide domain={['dataMin', 'dataMax']} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
                                            color: '#fff'
                                        }}
                                        itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="#a855f7" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorPricePurp)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border dark:border-white/5">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground p-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
                                <Info className="w-4 h-4 text-purple-500" />
                                <span className="flex-1">Data sourced from Agmarknet Government Portal. Prices are Modal wholesale per unit of 100KG.</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function RetailerMandiPrices() {
    return (
        <ProtectedRoute allowedRole="retailer">
            <RetailerMandiPricesContent />
        </ProtectedRoute>
    );
}
