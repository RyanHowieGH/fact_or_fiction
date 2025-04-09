// app/api/get-fact/route.js
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const NINJA_API_KEY = process.env.API_NINJAS_KEY;
const NINJA_API_URL = "https://api.api-ninjas.com/v1/facts"; // No limit parameter

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Use GET export for GET requests in App Router Route Handlers
export async function GET(request) {
    try {
        // 1. Fetch facts
        const ninjaRes = await fetch(NINJA_API_URL, { headers: { 'X-Api-Key': NINJA_API_KEY } });
        if (!ninjaRes.ok) throw new Error(`API Ninjas Error: ${ninjaRes.status}`);
        const ninjaData = await ninjaRes.json();
        if (!Array.isArray(ninjaData) || ninjaData.length === 0 || !ninjaData[0].fact) {
            throw new Error('No fact found in API Ninjas response');
        }
        const originalFact = ninjaData[0].fact; // Use the first fact

        // 2. Decide if making false
        const shouldBeFalse = Math.random() < 0.5;
        let presentedFact = originalFact;
        let isPresentedFactTrue = true;

        if (shouldBeFalse) {
            try {
                // 3. Ask Gemini
                const prompt = `Take the following fact and make it false, but keep it believable and grammatically correct. Output only the modified fact, nothing else. Fact: "${originalFact}"`;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const geminiFact = response.text().trim().replace(/^"|"$/g, '');

                if (geminiFact && geminiFact.length > 10 && geminiFact.toLowerCase() !== originalFact.toLowerCase()) {
                    presentedFact = geminiFact;
                    isPresentedFactTrue = false;
                } else { console.warn("Gemini failed/similar, using original."); }
            } catch (geminiError) { console.error("Gemini API Error:", geminiError); console.warn("Fallback to original fact."); }
        }

        // 4. Send response using NextResponse
        return NextResponse.json({
            presentedFact: presentedFact,
            isPresentedFactTrue: isPresentedFactTrue,
            originalFact: originalFact,
        });

    } catch (error) {
        console.error("Error in /api/get-fact:", error);
        // Return error response using NextResponse
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}