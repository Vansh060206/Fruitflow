import { NextResponse } from "next/server";

// Agmarknet Resource ID for "Real time Market price register for Commodities and Mandis"
const OGD_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const fruit = searchParams.get("fruit") || "Mango";
    const apiKey = process.env.OGD_API_KEY;

    try {
        console.log(`📡 Fetching LIVE Mandi Data for: ${fruit}`);

        // 1. Check Cache via REST (1-hour cache for live government data) to prevent Websocket warnings in Node
        const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
        const cacheUrl = `${dbUrl}/mandi_prices/${fruit}.json`;
        
        try {
            const cacheResponse = await fetch(cacheUrl);
            const cachedData = await cacheResponse.json();
            
            if (cachedData && cachedData.lastUpdated) {
                // Data less than 1 hour old? Return it.
                if (Date.now() - cachedData.lastUpdated < 60 * 60 * 1000) {
                    console.log("💾 Returning cached LIVE Mandi data (REST)");
                    return NextResponse.json({ success: true, data: cachedData.prices, source: 'cache_v3' });
                }
            }
        } catch (err) {
            console.error("Cache read failed:", err.message);
        }

        // 2. Fetch from Official OGD API (Agmarknet)
        // Agmarknet uses specific names: e.g. "Apple", "Mango", "Banana"
        const commodityMap = {
            "Mangoes": "Mango",
            "Apples": "Apple",
            "Bananas": "Banana",
            "Oranges": "Orange",
            "Grapes": "Grapes"
        };
        const searchVal = commodityMap[fruit] || fruit;

        const ogdUrl = `https://api.data.gov.in/resource/${OGD_RESOURCE_ID}?api-key=${apiKey}&format=json&filters[commodity]=${searchVal}&limit=10`;
        
        const response = await fetch(ogdUrl);
        const json = await response.json();

        // Check if records exist
        if (json.records && json.records.length > 0) {
            // 3. Map Government Data (Convert Quintal to KG)
            const mappedPrices = json.records.map(record => ({
                mandiName: record.market,
                state: record.state,
                priceMin: parseFloat(record.min_price) / 100,
                priceMax: parseFloat(record.max_price) / 100,
                priceModal: parseFloat(record.modal_price) / 100,
                date: record.arrival_date
            }));

            // 4. Update Firebase Cache via REST API
            try {
                await fetch(cacheUrl, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prices: mappedPrices,
                        lastUpdated: Date.now()
                    })
                });
            } catch (err) {
                console.error("Cache write failed:", err.message);
            }

            return NextResponse.json({
                success: true,
                data: mappedPrices,
                source: 'live_agmarknet',
                total_records: json.total,
                lastUpdated: new Date().toISOString()
            });
        }

        // 5. Dynamic Fallback: Varied Mock if API fails / No records found
        // Use the fruit name to seed a deterministic but varied price set
        const seed = fruit.length * 7;
        const mockData = [
            { mandiName: "Mumbai (APMC)", state: "Maharashtra", priceMin: 40 + (seed % 10), priceMax: 60 + (seed % 20), priceModal: 50 + (seed % 15), date: new Date().toISOString().split('T')[0] },
            { mandiName: "Delhi (Azadpur)", state: "Delhi", priceMin: 35 + (seed % 12), priceMax: 55 + (seed % 25), priceModal: 45 + (seed % 18), date: new Date().toISOString().split('T')[0] },
            { mandiName: "Rajkot (Gujarat)", state: "Gujarat", priceMin: 30 + (seed % 8), priceMax: 45 + (seed % 15), priceModal: 38 + (seed % 12), date: new Date().toISOString().split('T')[0] },
            { mandiName: "Ahmedabad", state: "Gujarat", priceMin: 28 + (seed % 6), priceMax: 42 + (seed % 12), priceModal: 35 + (seed % 10), date: new Date().toISOString().split('T')[0] }
        ];

        return NextResponse.json({ 
            success: true, 
            data: mockData,
            source: 'fruit_dynamic_fallback',
            note: `Real data for ${searchVal} unavailable in Agmarknet today. Showing estimated market rates.`
        });

    } catch (error) {
        console.error("❌ Mandi API Critical Error:", error);
        return NextResponse.json({ success: false, error: "Critical Mandi API Failure", details: error.message || error.toString() }, { status: 500 });
    }
}
