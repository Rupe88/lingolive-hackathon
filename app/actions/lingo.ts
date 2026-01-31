'use server'

import { LingoDotDevEngine } from "lingo.dev/sdk";

// Initialize Engine strictly on the server
const lingoEngine = new LingoDotDevEngine({
    apiKey: process.env.NEXT_PUBLIC_LINGO_API_KEY || 'mock-key',
});

// 🚀 LINGO TURBO: In-Memory Cache for Instant 0ms Localized responses
const translationCache = new Map<string, Record<string, string>>();

// Glossary / Terminology Guard
// Prevents specific brand terms from being translated incorrectly.
function checkGlossary(text: string): string | null {
    const lower = text.toLowerCase();
    if (lower.includes('lingo.dev')) return "Lingo.dev"; // Brand Lock
    if (lower.includes('hackathon')) return "Hackathon"; // Terminology Lock
    return null;
}

// Batch translate to all languages in ONE API call for speed
// Context: Optional parameter to help the engine understand the scenario (e.g. "Chat", "Button", "Error")
export async function translateTextBatchServer(text: string, targetLocales: string[], sourceLocale: string = 'en', context: string = 'General') {
    const isMock = !process.env.NEXT_PUBLIC_LINGO_API_KEY || process.env.NEXT_PUBLIC_LINGO_API_KEY === 'mock-lingo-key';
    const cacheKey = `${text.trim().toLowerCase()}-${targetLocales.sort().join(',')}`;

    // 0. Glossary Check (Before anything else)
    const glossaryTerm = checkGlossary(text);
    if (glossaryTerm) {
        console.log(`🛡️ Glossary Lock Applied: "${glossaryTerm}" (Context: ${context})`);
        const results: Record<string, string> = {};
        targetLocales.forEach(lang => results[lang] = glossaryTerm);
        return results;
    }

    // 1. Lingo Turbo Cache (Optimization)
    if (translationCache.has(cacheKey)) {
        console.log(`⚡ Lingo Turbo: Cache Hit for "${text}"`);
        return translationCache.get(cacheKey)!;
    }

    console.log(`🌐 Lingo Engine: Translating "${text}" [Context: ${context}]`);

    if (isMock) {
        const results: Record<string, string> = {};

        // Use Real Translation API (MyMemory) for Chat as well!
        // This ensures Japanese and other languages work perfectly without a paid key.
        await Promise.all(targetLocales.map(async (lang) => {
            try {
                const response = await fetch(
                    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLocale}|${lang}`
                );
                const data = await response.json();

                if (data.responseData && data.responseData.translatedText) {
                    results[lang] = data.responseData.translatedText;
                } else {
                    results[lang] = `[${lang.toUpperCase()}] ${text}`;
                }
            } catch (error) {
                console.error(`Chat Translation Error (${lang}):`, error);
                results[lang] = `[${lang.toUpperCase()}] ${text}`;
            }
        }));

        if (Object.keys(results).length > 0) {
            translationCache.set(cacheKey, results);
        }
        return results;
    }

    try {
        // Use batchLocalizeText to translate to multiple languages in parallel (ONE request)
        const translationsArray = await lingoEngine.batchLocalizeText(text, {
            sourceLocale: sourceLocale as any,
            targetLocales: targetLocales as any,
        });

        // Map array results back to a dictionary { es: "Hola", fr: "Bonjour" }
        const results: Record<string, string> = {};
        targetLocales.forEach((lang, index) => {
            results[lang] = translationsArray[index] || text;
        });

        if (Object.keys(results).length > 0) {
            translationCache.set(cacheKey, results);
        }
        return results;

    } catch (error) {
        console.error(`Lingo Batch Error:`, error);
        // Fallback
        const results: Record<string, string> = {};
        targetLocales.forEach(lang => { results[lang] = text });
        return results;
    }
}

// Keep single version for backward compatibility if needed
export async function translateTextServer(text: string, targetLocale: string, sourceLocale: string = 'en') {
    // ... same as before but unlikely to be used now ...
    return (await translateTextBatchServer(text, [targetLocale], sourceLocale))[targetLocale];
}
