import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { role, userData, inventory, sales, language = "English", customPrompt } = body;

        // Ensure we have the API Key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                error: "Missing API Key",
                insights: [
                    "⚠️ Please add GEMINI_API_KEY to your .env.local file.",
                    "AI Predictions are currently offline.",
                    "Once connected, this will analyze your local market data."
                ]
            });
        }

        // Use the custom prompt if provided (e.g. from Mandi page), otherwise use default
        const defaultPrompt = `
        You are an advanced AI business advisor for a localized B2B agricultural platform called FruitFlow.
        The user is a ${role?.toUpperCase() || "USER"} named ${userData?.name || "Partner"} based in ${userData?.location || "India"}.
        ${role === 'wholesaler' ? `They sell to retailers.` : `They buy from wholesalers to consumers.`}

        Analyze current global/seasonal fruit trends for their location and generate exactly 3 cutting-edge, highly actionable business predictions or tips to maximize their profit this week. 
        The tips must be specific to fruit trading (e.g., pricing, demand spikes, weather impacts, supply chain).

        CRITICAL: You MUST respond in the following language: ${language}.

        Respond ONLY with a valid JSON array of exactly 3 strings in the language requested. Example:
        ["Tip 1", "Tip 2", "Tip 3"]
        `;

        const finalPrompt = customPrompt || defaultPrompt;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: finalPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json",
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Google AI Error");
        }

        // Parse the JSON array returned by Gemini
        const rawText = data.candidates[0].content.parts[0].text;
        const insights = JSON.parse(rawText);

        return NextResponse.json({ insights });
    } catch (error) {
        console.error("AI Prediction Error:", error);
        return NextResponse.json({
            error: "Failed to generate predictions",
            insights: [
                "Seasonal demand for local citrus is expected to peak.",
                "Consider bundling low-moving stock with high-demand items.",
                "Monitor local weather patterns for supply chain delays."
            ]
        }, { status: 500 });
    }
}
