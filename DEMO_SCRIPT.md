# 🎬 LingoLive: The Winning Demo Script (2 Minutes)

**Setup:**
1.  Open Chrome with `http://localhost:3000`.
2.  Open VS Code Terminal (sized large enough to read).
3.  Have `demo-assets/en.json` ready on your Desktop.

---

### SCENE 1: The Hook (0:00 - 0:30)
**Visual:** Show the Landing Page (`/`).
**Action:** Type your name "Rupesh" and select "Japanese" (or any language). Click "Join".
**Voiceover:** 
"Working remotely shouldn't mean hitting a language barrier. This is LingoLive, a borderless collaboration workspace where I can work in English, and my team sees everything in their native language—instantly."

---

### SCENE 2: The Chat (0:30 - 1:00)
**Visual:** The Workspace (`/workspace`). You see the Chat on the right.
**Action 1 (Typing):** Type: *"we need to fix the deployment config asap"* (make it messy).
**Action 2 (Polish):** Click the **✨ Magic Sparkle Button**.
*   *Wait for it to change to: "We need to fix the deployment configuration immediately."*
**Action 3 (Send):** Click Send. It appears instantly.
**Action 4 (TTS):** Click the **Speaker Icon** on a message. Let the computer speak the Japanese content.
**Voiceover:** 
"I type in English. But notice this—my shaky input gets AI-Polished into professional text before sending. My Japanese colleague hears this..."
*(Let audio play)*
"...native Text-to-Speech using the Lingo Engine."

---

### SCENE 3: The Live Collaboration (1:00 - 1:20)
**Visual:** Click the **"Document Editor"** tab on the left.
**Action:** Start typing: *"# Project Plan [Enter] Phase 1: Deployment"*
**Voiceover:** 
"But the real magic is here. While we chat, I'm writing the project plan in English on the left. My Japanese teammate sees this same document... translated instantly into Japanese. We aren't just translating words; we are collaborating on **WORK** in real-time."

---

### SCENE 4: The File Hub (1:20 - 1:40)
**Visual:** Click the **"File Hub"** tab on the left.
**Action:** Drag & Drop `en.json`.
**Action:** Click **"Start Localization"**.
**Action:** Point to the **Split View** (Left: English, Right: Japanese).
**Voiceover:** 
"We also solve the developer's biggest pain: localization files. I just drag my raw `en.json` file. The system recursively parses every nested object and generates a production-ready Japanese file in seconds."

---

### SCENE 5: The Ecosystem Audit (1:40 - 2:00)
**Visual:** Switch to **VS Code Terminal**.
**Action:** Run: `node scripts/audit-cli.js components/ChatRoom.tsx`
**Action:** Highlight the cost/token output.
**Voiceover:** 
"And finally, the Lingo Auditor. This CLI tool scans my actual codebase for brand violations and calculates translation token costs before I even commit to GitHub. It's a full lifecycle ecosystem."

---

### OUTRO (2:00 - 2:10)
**Visual:** Back to Landing Page / Logo.
**Voiceover:** 
"LingoLive. Chat, Voice, Files, and Audit. The future of borderless work. Built with Next.js, Supabase, and Lingo.dev."
