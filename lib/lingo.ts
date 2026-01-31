import { LingoDotDevEngine } from "lingo.dev/sdk";

// Initialize the Lingo.dev Engine with the API key from environment variables
// This matches the official documentation you provided.
export const lingoEngine = new LingoDotDevEngine({
    apiKey: process.env.NEXT_PUBLIC_LINGO_API_KEY || 'mock-key',
});

// Helper function to handle fallback if the key is missing/mocked
export async function translateTextReal(text: string, targetLocale: string, sourceLocale: string = 'en') {
    if (!process.env.NEXT_PUBLIC_LINGO_API_KEY || process.env.NEXT_PUBLIC_LINGO_API_KEY === 'mock-lingo-key') {
        console.warn("Using Mock Lingo Engine (No API Key found)");
        return `[${targetLocale.toUpperCase()}] ${text}`;
    }

    try {
        const result = await lingoEngine.localizeText(text, {
            sourceLocale,
            targetLocale,
        });
        return result;
    } catch (error) {
        console.error("Lingo API Error:", error);
        return text; // Fallback to original text on error
    }
}
