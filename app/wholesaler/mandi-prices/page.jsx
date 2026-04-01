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
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

export default function MandiPricesPage() {
    const [fruit, setFruit] = useState("Mango");
    const [loading, setLoading] = useState(true);
    const [mandiData, setMandiData] = useState([]);
    const [aiInsight, setAiInsight] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const { language } = useLanguage();

    // Fetch Mandi Data
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
        } finally {
            setLoading(false);
        }
    };

    // Generate AI Prediction
    const generateAiInsight = async (fruitName, prices) => {
        setIsAiLoading(true);
        try {
            const prompt = `Analyze these mandi prices for ${fruitName} in India: ${JSON.stringify(prices)}. 
            Provide a short 2-sentence market prediction (price increase/decrease) and a recommendation on where to sell. 
            Language: ${language === 'hi' ? 'Hindi' : 'English'}`;
            
            const res = await fetch("/api/ai/predict", {
                method: "POST",
                body: JSON.stringify({ 
                    customPrompt: prompt,
                    role: 'wholesaler' 
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

    // Prepare chart data (Mock 7-day trend based on current modal price)
    const chartData = [
        { day: "Mon", price: mandiData[0]?.priceModal * 0.92 || 46 },
        { day: "Tue", price: mandiData[0]?.priceModal * 0.95 || 48 },
        { day: "Wed", price: mandiData[0]?.priceModal * 0.98 || 49 },
        { day: "Thu", price: mandiData[0]?.priceModal * 1.02 || 51 },
        { day: "Fri", price: mandiData[0]?.priceModal * 1.05 || 53 },
        { day: "Sat", price: mandiData[0]?.priceModal * 0.99 || 50 },
        { day: "Sun", price: mandiData[0]?.priceModal || 50 },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            {/* Search & Intro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-foreground dark:text-white">India Mandi Live</h2>
                    <p className="text-muted-foreground mt-1 dark:text-white/60">Live wholesale fruit prices across major Indian markets.</p>
                </div>
                
                <form onSubmit={handleSearch} className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        type="text" 
                        value={fruit}
                        onChange={(e) => setFruit(e.target.value)}
                        placeholder="Search fruit (e.g. Apple, Banana)..." 
                        className="w-full pl-10 pr-4 py-3 bg-card/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                </form>
            </div>

            {/* AI Recommendation Widget */}
            <Card className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-400">Market Intelligence Prediction</h3>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/60">AI Analysis for {fruit} • Regional Trends</p>
                    </div>
                </div>
                
                {isAiLoading ? (
                    <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Agri-Data Analysis in progress...</span>
                    </div>
                ) : (
                    <p className="text-foreground dark:text-white leading-relaxed font-medium italic border-l-4 border-emerald-500 pl-4">
                        "{aiInsight || `Mandi prices for ${fruit} are showing high volatility in northern states. Recommendation: Hold stock for better price realization in Mumbai market.`}"
                    </p>
                )}
            </Card>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Price Table / Cards */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xl flex items-center gap-2">
                             Major Market Listings
                        </h4>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground dark:bg-white/10">Updated {new Date().toLocaleDateString()}</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-20 animate-pulse">
                            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {mandiData.map((mandi, i) => (
                                <Card key={i} className="p-5 hover:shadow-xl transition-all duration-300 group border-border dark:bg-white/5 dark:border-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-foreground dark:text-white leading-none">{mandi.mandiName}</h5>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{mandi.state}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">₹{mandi.priceModal}/kg</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                        <div className="flex-1 p-2 bg-muted/50 rounded-lg dark:bg-white/5">
                                            <p>Min</p>
                                            <p className="text-foreground font-bold dark:text-white">₹{mandi.priceMin}</p>
                                        </div>
                                        <div className="flex-1 p-2 bg-muted/50 rounded-lg dark:bg-white/5">
                                            <p>Max</p>
                                            <p className="text-foreground font-bold dark:text-white">₹{mandi.priceMax}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-[10px] border-t pt-3 border-border dark:border-white/5">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {mandi.date}
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-500 font-bold">
                                            <TrendingUp className="w-3 h-3" />
                                            +4.2% Trend
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
                         Price Volatility (7d)
                    </h4>
                    <Card className="p-6 h-[400px] flex flex-col justify-between dark:bg-white/5 dark:border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="text-2xl font-bold">₹{mandiData[0]?.priceModal || 50}</p>
                                <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                                    <ArrowUpRight className="w-4 h-4" />
                                    <span>High Momentum Weekly</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide domain={['dataMin', 'dataMax']} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="#10b981" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorPrice)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border dark:border-white/5">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                <Info className="w-4 h-4 text-blue-500" />
                                <span>Note: These are modal wholesale prices. Actual retail realization may vary by 15-20%.</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
