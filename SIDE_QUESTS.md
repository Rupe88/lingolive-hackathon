# 🏆 Side Quest Strategy Guide

Here is your **Win-It-All** content kit. Copy, paste, and post!

---

## Quest 1: Social Wizards (Twitter/X & LinkedIn)
*Goal: Vitality & Engagement.*

**Headline:** 
I built the Ultimate "No-Code" Localization Workspace in 24 Hours 🌍🚀

**Body Text:**
I just built **LingoLive** for the @lingo_dev hackathon. 
It’s not just a translator; it’s a complete **Collaboration OS** for global teams.

🔥 **4 Killer Features in One App:**
1️⃣ **Real-Time Multilingual Chat:** Chat in English, they see Japanese. 0ms latency using Supabase Realtime.
2️⃣ **Native Voice (TTS):** Click "Listen" to hear messages spoken in the sender's native language/accent.
3️⃣ **Developer File Hub:** Drag & Drop your `en.json` -> Get `es.json` instantly. No more manual copy-pasting!
4️⃣ **Lingo Auditor:** A custom CLI that acts as a "Security Guard" for your codebase, preventing hardcoded English strings from reaching production.

**The Stack:** Next.js 14 + Supabase + Lingo.dev SDK.

Check out the full demo below! 👇
[Insert Video Link]

#hackathon #buildinpublic #nextjs #react #ai #translation #lingodev #supabase

---

## Quest 2: Conversation Starters (Reddit)
*Target Subreddits: r/nextjs, r/supabase, r/lingodotdev, r/webdev*

**Title:**
I built a "Drag & Drop" Localization Workspace with Next.js, Supabase & Lingo.dev 🚀 (Open Source)

**Body:**
Hey everyone! 👋

I just built **LingoLive** for the `r/lingodotdev` hackathon.
It’s a real-time collaboration platform that solves the pain of manual translation.

**🔥 Key Features:**
1.  **⚡️ 0ms Real-time Chat:** Uses **Supabase Realtime** for instant messaging. It optimistically updates the UI so it feels instant, while the translation happens in the background.
2.  **🗣️ Native Text-to-Speech:** You can click "Listen" to hear messages in the sender's native accent (e.g., Japanese/French).
3.  **📂 Lingo File Hub (Drag & Drop):** The killer feature for devs. Drag your `en.json` file, and it uses **Lingo.dev** to recursively parse & translate it into 5 languages in seconds. (Handles nested objects perfectly!).
4.  **🛡️ Lingo Auditor:** A CLI tool I wrote that scans my code for hardcoded strings before I commit.

**🛠️ The Tech Stack:**
*   **Next.js 14** (App Router & Server Actions)
*   **Supabase** (Postgres & Realtime Channels)
*   **Lingo.dev SDK** (Context-aware LLM Translation)
*   **Tailwind + Framer Motion** (Glassmorphism UI)

I made the repo public if anyone wants to steal the "Recursive JSON Translation" logic for their own SaaS.

**Repo:** [LINK]
**Demo:** [VIDEO LINK]

Would love to hear what you think! 
#nextjs #supabase #lingodev #hackathon

---

## Quest 3: Source Code Story (Article / Tutorial)
*Platform: Dev.to, Medium, or Hashnode*

**Article Title:**
**How to Automate App Localization in Next.js (Stop Copy-Pasting JSON)**

**Introduction:**
Internationalization (i18n) is usually an afterthought. We build the app in English, and then spend 3 days copy-pasting strings into Google Translate to generate `es.json`. It’s painful.

In this tutorial, I’ll show you how I built an **Automated Translation Pipeline** using Next.js Server Actions and the Lingo.dev SDK.

**Step 1: The Problem with Traditional i18n**
(Explain how managing 5 different JSON files gets out of sync easily).

**Step 2: The Solution (Recursive Parsing)**
Most translation APIs expect a flat string. But our app configs are nested:
```json
{
  "home": {
    "title": "Welcome"
  }
}
```
I wrote a tailored recursive function that traverses the JSON tree and only translates the "leaf" nodes.

**Step 3: The Code**
```typescript
// The Magic Function
const translateRecursive = async (obj: any): Promise<any> => {
    if (typeof obj === 'string') {
        return await lingo.translate(obj);
    } 
    // ... recurses into objects
}
```

**Step 4: The Result**
Now, I can drop a file into my app, and 2 seconds later I have a production-ready Japanese voice pack.

**Conclusion:**
AI isn't just for chatbots. It’s perfect for the "boring" work like localization. 
Check out the full source code here: [Git Hub Link]

---
**Good luck! Go get that PS5!** 🎮
