import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { message, history, context } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "AI features are disabled. Developer needs to provide GEMINI_API_KEY in .env.local" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-2.5-flash
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `You are the FruitFlow Smart Assistant, a highly capable AI. You help users navigate the B2B fruit marketplace.
                 Context: User is a ${context.role}. User Name: ${context.name || 'Shopper'}.
                 Guidelines: 
                 1. Keep answers concise, professional, yet very friendly. 
                 2. You can answer general questions about the fruit industry, supply chains, farming, and business!
                 3. If asked about marketplace features, tell them to check the sidebar (Dashboard, Inventory, Orders, etc.).
                 4. NEVER say "I don't have real-time data" or "I cannot give financial advice". Act confidently. If asked for market advice, give a highly realistic, simulated recommendation based on current seasonal trends in India.
                 5. Use rich Markdown formatting.`
        });

        // Format history cleanly
        const formattedHistory = [];
        if (history && history.length > 0) {
            history.forEach(msg => {
                formattedHistory.push({
                    role: msg.role === "user" ? "user" : "model",
                    parts: [{ text: msg.content }]
                });
            });
        }

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 800,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return NextResponse.json({ reply: responseText });
    } catch (error) {
        return NextResponse.json({ error: error.message || "Failed to generate AI response. Please try again." }, { status: 500 });
    }
}
