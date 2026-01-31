'use client'

import { useUser } from '@/context/UserContext'

const uiTranslations: Record<string, Record<string, string>> = {
    "Global Chat": {
        es: "Chat Global",
        ne: "ग्लोबल च्याट",
        fr: "Chat Global",
        de: "Globaler Chat",
        ja: "グローバルチャット"
    },
    "Project Plan": {
        es: "Plan del Proyecto",
        ne: "प्रोजेक्ट योजना",
        fr: "Plan du Projet",
        de: "Projektplan",
        ja: "プロジェクト計画"
    },
    "Type in": {
        es: "Escribe en",
        fr: "Écrivez en",
        de: "Schreiben Sie in",
        ja: "で入力"
    },
    "Saved": {
        es: "Guardado",
        fr: "Enregistré",
        de: "Gespeichert",
        ja: "保存されました"
    },
    "Saving...": {
        es: "Guardando...",
        fr: "Enregistrement...",
        de: "Speichern...",
        ja: "保存中..."
    }
}

export function T({ children }: { children: string }) {
    const { user } = useUser()

    if (!user || user.preferredLanguage === 'en') return <>{children}</>

    // Simple lookup
    const translated = uiTranslations[children]?.[user.preferredLanguage]
    return <>{translated || children}</>
}
