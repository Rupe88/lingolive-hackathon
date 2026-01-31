// Simulating the Lingo.dev SDK for the Hackathon Demo

export const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
]

export const translations: Record<string, Record<string, string>> = {
    "Let's discuss the new feature": {
        es: "Hablemos sobre la nueva función",
        ne: "नयाँ फिचरको बारेमा छलफल गरौं",
        fr: "Discutons de la nouvelle fonctionnalité",
        de: "Lassen Sie uns über das neue Feature sprechen",
        ja: "新機能について話し合いましょう"
    },
    "Sounds good to me": {
        es: "Me parece bien",
        fr: "Ça me semble bien",
        de: "Das klingt gut für mich",
        ja: "私には良いですね"
    },
    "Project Requirements": {
        es: "Requisitos del Proyecto",
        fr: "Exigences du Projet",
        de: "Projektanforderungen",
        ja: "プロジェクト要件"
    },
    "Hola Rupesh": {
        en: "Hello Rupesh",
        fr: "Bonjour Rupesh",
        de: "Hallo Rupesh",
        ja: "こんにちは Rupesh"
    },
    "नमस्ते रुपेश": {
        en: "Hello Rupesh",
        es: "Hola Rupesh",
        fr: "Bonjour Rupesh"
    }
};

// Mock SDK function
export async function translateText(text: string, targetLang: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (targetLang === 'en' && text === "Hola Rupesh") return "Hello Rupesh"; // Specific fix for demo
    if (targetLang === 'en' && text === "नमस्ते रुपेश") return "Hello Rupesh"; // Nepali greeting fix

    const mockTranslation = translations[text]?.[targetLang];
    if (mockTranslation) return mockTranslation;

    // Smart Fallback for Demo:
    // If we don't have a hardcoded translation, we just append the language tag.
    // This "fakes" it well enough to show the UI updating.
    return `[${targetLang.toUpperCase()}] ${text}`;
}

export const lingo = {
    translate: translateText
}
