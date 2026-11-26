/* =========================================================
   Heart Shayri - Core Engine (Plain-Text JSON + Auto-Design)
   100% Client-Side, 60fps Single-DOM-Card Engine
   ========================================================= */

(() => {
  "use strict";

  // Live GitHub JSON URL (auto-converts github.com/.../blob/... URLs to raw JSON)
  const REMOTE_CONFIG_URL =
    "https://raw.githubusercontent.com/Vakaar01/shayari-data.json/main/shayari-data.json";
  const LOCAL_FALLBACK_URL = "./shayari-data.json";
  const CACHE_KEY = "heart_shayri_config_cache_v1";
  const FAVORITES_KEY = "heart_shayri_favorites_v1";

  function normalizeRemoteJsonUrl(url) {
    const trimmed = (url || "").trim();
    const ghBlobMatch = trimmed.match(
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i
    );
    if (ghBlobMatch) {
      const [, user, repo, branch, filePath] = ghBlobMatch;
      return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;
    }
    return trimmed;
  }

  // Default fallback config & original plain-text shayaris for instant offline launch
  const FALLBACK_CONFIG = {
    app_download_url: "https://heartshayri.github.io/app",
    maintenance_mode: false,
    ad_interval: 5,
    shayaris: [
      "Teri ek muskaan par dil haar baithe hain hum,\nHar dua mein bas tera hi naam maang baithe hain hum,\nLog kehte hain ishq mein neend ud jaati hai,\nPar teri yaadon ke sahare har raat guzaar baithe hain hum.",
      "Mohabbat lafzon ki mohtaaj nahi hoti,\nHar dhadkan mein teri hi tasveer basee hoti hai,\nChahe jitni bhi dooriyan aa jayein darmiyaan,\nSache pyar ki khushboo kabhi kam nahi hoti.",
      "Aankhon mein aansu aur dil mein ek gehra dard chhupa hai,\nTeri judaai ka yeh mausam aaj bhi khafa hai,\nSab kehte hain waqt har zakhm bhar deta hai,\nPar tanha raaton ko kaun samjhaye kya saza hai.",
      "Apna attitude apni jeb mein rakhna dost,\nHum woh sher hain jo apni marzi se chalte hain,\nDushman bhi hamari pehchaan se darte hain,\nKyunki hum waqt ke hisaab se nahi apne usoolon se palte hain.",
      "Sacha yaar wohi hai jo bheed mein bhi pehchan le,\nBina kahe tere dil ka har haal jaan le,\nDosti ka rishta sabse anmol hota hai jag mein,\nJo mushkil waqt mein bhi tera haath thaam le.",
      "Bewafa logon se ab koi gila nahi rakhte,\nHum toote hue kaanch ko dil mein nahi rakhte,\nJisne dhokha diya muskura kar aage badh gaye,\nApne kirdaar mein hum kabhi maila nahi rakhte.",
      "Waqt sab kuch badal deta hai dheere dheere,\nBas kuch yaadein dil ke kone mein reh jaati hain,\nZindagi chalne ka naam hai mere humsafar,\nRukne walon ki manzilein peeche chhoot jaati hain.",
      "Dil ki har dhadkan mein tera hi ehsaas rehta hai,\nTu door ho kar bhi hamesha mere paas rehta hai,\nKya jaadu kiya hai teri pyar bhari baaton ne,\nHar pal bas tere deedar ka intezaar rehta hai.",
      "Khamosh rehte hain par dil mein dard bahut hai,\nTere bina yeh zindagi bhi sard bahut hai,\nLog poochte hain kyun bheeg jaati hain palkein,\nUnhe kya batayein teri yaadon ka bojh bahut hai.",
      "Hamari aukaat naapne ki koshish mat karna,\nSamundar ki gehrai kinaron se nahi naapi jaati,\nAttitude toh khoon mein shamil hai hamare,\nSheron ki chhalang kabhi peeche nahi aati.",
      "Dosti ke liye jaan bhi haazir hai meri,\nTeri khushi mein hi basti hai duniya meri,\nChahe kitne bhi saal beet jayein ae mere dost,\nHar yaad mein zinda rahegi yaari teri.",
      "Wafa ki umeed jis bewafa se lagayi thi,\nUsi ne dil ke baagh mein aag lagayi thi,\nDhokha de kar bhi woh be-fikr ghoomte hain,\nAur humne unki yaad mein har khushi gawayi thi.",
      "Manzil unhi ko milti hai jinke iradon mein jaan hoti hai,\nSirf pankhon se kuch nahi hota hoslon se udaan hoti hai,\nWaqt chahe jitna bhi kathin imtihaan le le,\nMehnat karne walon ki alag hi pehchaan hoti hai.",
      "Ishq woh nahi jo duniya ko dikhaya jaye,\nIshq woh hai jo har khamoshi mein nibhaya jaye,\nTere naam se shuru aur tujh par hi khatam,\nAisi chahat ko dil ke mandir mein sajaya jaye.",
      "Tanha baith kar jab bhi tera khayal aata hai,\nBina mausam aankhon mein saawan chha jaata hai,\nKaash tu samajh paata meri khamoshi ke alfaaz,\nJudaai ka har lamha andar se tod jaata hai.",
      "Jitna jhukna tha utna jhuk liya humne,\nAb sar utha kar chalne ki baari hamari hai,\nJo log peeche se waar karte the kal tak,\nAaj unki mehfil mein charcha sirf hamari hai.",
      "Jab dost saath ho toh har manzil aasaan lagti hai,\nBina yaaron ke yeh mehfil bhi veeran lagti hai,\nKhuda salamat rakhe hamari dosti ka yeh rishta,\nYahi toh ek daulat hai jo sabse mahaan lagti hai.",
      "Zindagi ke safar mein gir kar sambhalna seekho,\nHar mushkil se lad kar aage nikalna seekho,\nKamyabi khud tumhare kadam choomegi ek din,\nBas apne khwabon ke liye har roz jalna seekho.",
      "Tere ishq mein humne har gham ko gale lagaya,\nTeri har ek khushi ko apna naseeb banaya,\nDil ke har panne par sirf tera naam likha,\nAur pyar ki har rasam ko siddat se nibhaya.",
      "Har subah ek nayi umeed lekar aati hai,\nZindagi jeene ka naya salika sikhati hai,\nChhod do kal ki baatein aur aage badho,\nManzil toh bas hoslon ke aage jhuk jaati hai."
    ]
  };

  // Mood-Matched Curated Background Palettes (Distinct per mood & varied uniquely per shayari)
  const MOOD_THEMES = {
    Love: [
      { c1: "#3a061c", cMid: "#1b0615", c2: "#54082b", accent: "rgba(255, 45, 117, 0.38)", glow: "rgba(255, 0, 102, 0.28)", g1: "rgba(255, 64, 129, 0.34)", g2: "rgba(255, 118, 168, 0.24)" },
      { c1: "#450920", cMid: "#1e0718", c2: "#2e0836", accent: "rgba(255, 77, 148, 0.38)", glow: "rgba(255, 77, 148, 0.26)", g1: "rgba(255, 0, 127, 0.32)", g2: "rgba(232, 121, 249, 0.24)" },
      { c1: "#4a0b16", cMid: "#1d070e", c2: "#3b1029", accent: "rgba(244, 63, 94, 0.4)", glow: "rgba(244, 63, 94, 0.28)", g1: "rgba(244, 63, 94, 0.34)", g2: "rgba(251, 113, 133, 0.26)" },
      { c1: "#360728", cMid: "#18061a", c2: "#4d0b24", accent: "rgba(255, 105, 180, 0.36)", glow: "rgba(255, 0, 127, 0.25)", g1: "rgba(236, 72, 153, 0.34)", g2: "rgba(255, 153, 200, 0.22)" },
      { c1: "#3d0d1d", cMid: "#1a0712", c2: "#4f1722", accent: "rgba(251, 113, 133, 0.38)", glow: "rgba(251, 113, 133, 0.26)", g1: "rgba(255, 87, 127, 0.32)", g2: "rgba(255, 179, 198, 0.2)" },
      { c1: "#2f0724", cMid: "#160619", c2: "#590927", accent: "rgba(255, 20, 147, 0.38)", glow: "rgba(255, 20, 147, 0.26)", g1: "rgba(255, 20, 147, 0.32)", g2: "rgba(244, 114, 182, 0.24)" },
      { c1: "#42081c", cMid: "#1b0816", c2: "#2c0b3a", accent: "rgba(244, 114, 182, 0.38)", glow: "rgba(236, 72, 153, 0.26)", g1: "rgba(255, 56, 132, 0.32)", g2: "rgba(192, 132, 252, 0.22)" },
      { c1: "#4d0919", cMid: "#210612", c2: "#3c0c24", accent: "rgba(255, 65, 108, 0.4)", glow: "rgba(255, 65, 108, 0.28)", g1: "rgba(255, 65, 108, 0.34)", g2: "rgba(255, 138, 165, 0.22)" }
    ],
    Sad: [
      { c1: "#091426", cMid: "#0a0f18", c2: "#16243b", accent: "rgba(96, 165, 250, 0.28)", glow: "rgba(59, 130, 246, 0.2)", g1: "rgba(96, 165, 250, 0.22)", g2: "rgba(148, 163, 184, 0.18)" },
      { c1: "#111622", cMid: "#090c12", c2: "#1c2738", accent: "rgba(148, 163, 184, 0.28)", glow: "rgba(100, 116, 139, 0.2)", g1: "rgba(125, 211, 252, 0.18)", g2: "rgba(100, 116, 139, 0.2)" },
      { c1: "#0d1b2a", cMid: "#08101a", c2: "#1b263b", accent: "rgba(56, 189, 248, 0.26)", glow: "rgba(56, 189, 248, 0.18)", g1: "rgba(56, 189, 248, 0.2)", g2: "rgba(99, 102, 241, 0.18)" },
      { c1: "#141428", cMid: "#0a0b14", c2: "#1e293b", accent: "rgba(129, 140, 248, 0.28)", glow: "rgba(129, 140, 248, 0.2)", g1: "rgba(129, 140, 248, 0.2)", g2: "rgba(148, 163, 184, 0.18)" },
      { c1: "#0b1a24", cMid: "#080f14", c2: "#172c3a", accent: "rgba(103, 232, 249, 0.24)", glow: "rgba(56, 189, 248, 0.18)", g1: "rgba(103, 232, 249, 0.18)", g2: "rgba(71, 85, 105, 0.22)" },
      { c1: "#161925", cMid: "#0b0d13", c2: "#242b3d", accent: "rgba(165, 180, 252, 0.26)", glow: "rgba(99, 102, 241, 0.18)", g1: "rgba(165, 180, 252, 0.2)", g2: "rgba(71, 85, 105, 0.2)" },
      { c1: "#0a1520", cMid: "#070c12", c2: "#1f2a3c", accent: "rgba(94, 234, 212, 0.22)", glow: "rgba(59, 130, 246, 0.18)", g1: "rgba(96, 165, 250, 0.2)", g2: "rgba(94, 234, 212, 0.14)" },
      { c1: "#171324", cMid: "#0b0a12", c2: "#182436", accent: "rgba(147, 197, 253, 0.26)", glow: "rgba(96, 165, 250, 0.18)", g1: "rgba(147, 197, 253, 0.2)", g2: "rgba(167, 139, 250, 0.18)" }
    ],
    Bewafa: [
      { c1: "#240c1e", cMid: "#100811", c2: "#1e1b2e", accent: "rgba(192, 132, 252, 0.3)", glow: "rgba(168, 85, 247, 0.22)", g1: "rgba(244, 63, 94, 0.22)", g2: "rgba(148, 163, 184, 0.2)" },
      { c1: "#291018", cMid: "#120a0e", c2: "#262033", accent: "rgba(225, 29, 72, 0.28)", glow: "rgba(190, 18, 60, 0.22)", g1: "rgba(225, 29, 72, 0.22)", g2: "rgba(129, 140, 248, 0.18)" },
      { c1: "#1d1128", cMid: "#0e0914", c2: "#2b1623", accent: "rgba(217, 70, 239, 0.28)", glow: "rgba(192, 38, 211, 0.2)", g1: "rgba(217, 70, 239, 0.2)", g2: "rgba(100, 116, 139, 0.22)" },
      { c1: "#22131f", cMid: "#0f0a0f", c2: "#192231", accent: "rgba(251, 113, 133, 0.28)", glow: "rgba(244, 63, 94, 0.2)", g1: "rgba(251, 113, 133, 0.22)", g2: "rgba(96, 165, 250, 0.18)" },
      { c1: "#260f20", cMid: "#110910", c2: "#2b213a", accent: "rgba(167, 139, 250, 0.3)", glow: "rgba(139, 92, 246, 0.22)", g1: "rgba(244, 114, 182, 0.2)", g2: "rgba(139, 92, 246, 0.22)" },
      { c1: "#1f121b", cMid: "#0d090d", c2: "#2e1a24", accent: "rgba(244, 63, 94, 0.26)", glow: "rgba(159, 18, 57, 0.2)", g1: "rgba(244, 63, 94, 0.2)", g2: "rgba(148, 163, 184, 0.18)" }
    ],
    Attitude: [
      { c1: "#291005", cMid: "#110907", c2: "#3b0a18", accent: "rgba(255, 115, 0, 0.36)", glow: "rgba(255, 94, 0, 0.26)", g1: "rgba(255, 123, 0, 0.3)", g2: "rgba(255, 0, 76, 0.24)" },
      { c1: "#2b080d", cMid: "#120709", c2: "#2b1c06", accent: "rgba(245, 158, 11, 0.36)", glow: "rgba(245, 158, 11, 0.24)", g1: "rgba(239, 68, 68, 0.3)", g2: "rgba(245, 158, 11, 0.26)" },
      { c1: "#141029", cMid: "#0a0912", c2: "#360b16", accent: "rgba(239, 68, 68, 0.36)", glow: "rgba(239, 68, 68, 0.24)", g1: "rgba(99, 102, 241, 0.26)", g2: "rgba(239, 68, 68, 0.28)" },
      { c1: "#241907", cMid: "#100c07", c2: "#171724", accent: "rgba(251, 191, 36, 0.34)", glow: "rgba(251, 191, 36, 0.22)", g1: "rgba(251, 191, 36, 0.28)", g2: "rgba(249, 115, 22, 0.24)" },
      { c1: "#2e0b0b", cMid: "#120707", c2: "#0b1a30", accent: "rgba(249, 115, 22, 0.36)", glow: "rgba(249, 115, 22, 0.24)", g1: "rgba(249, 115, 22, 0.28)", g2: "rgba(59, 130, 246, 0.24)" },
      { c1: "#1f0d24", cMid: "#0d0810", c2: "#361207", accent: "rgba(255, 85, 0, 0.36)", glow: "rgba(255, 85, 0, 0.24)", g1: "rgba(255, 85, 0, 0.28)", g2: "rgba(217, 70, 239, 0.24)" }
    ],
    Dosti: [
      { c1: "#06261d", cMid: "#071211", c2: "#0b2436", accent: "rgba(0, 245, 212, 0.34)", glow: "rgba(0, 245, 212, 0.22)", g1: "rgba(0, 245, 212, 0.28)", g2: "rgba(250, 204, 21, 0.2)" },
      { c1: "#09212e", cMid: "#071017", c2: "#0a2e22", accent: "rgba(52, 211, 153, 0.34)", glow: "rgba(52, 211, 153, 0.22)", g1: "rgba(52, 211, 153, 0.26)", g2: "rgba(56, 189, 248, 0.24)" },
      { c1: "#12240d", cMid: "#091208", c2: "#09252e", accent: "rgba(163, 230, 53, 0.3)", glow: "rgba(74, 222, 128, 0.2)", g1: "rgba(163, 230, 53, 0.22)", g2: "rgba(0, 245, 212, 0.24)" },
      { c1: "#081c2e", cMid: "#070f18", c2: "#1e2409", accent: "rgba(250, 204, 21, 0.3)", glow: "rgba(34, 211, 238, 0.22)", g1: "rgba(34, 211, 238, 0.26)", g2: "rgba(250, 204, 21, 0.2)" },
      { c1: "#072629", cMid: "#071214", c2: "#132917", accent: "rgba(45, 212, 191, 0.34)", glow: "rgba(45, 212, 191, 0.22)", g1: "rgba(45, 212, 191, 0.28)", g2: "rgba(74, 222, 128, 0.22)" },
      { c1: "#0a1e2e", cMid: "#081018", c2: "#1e1233", accent: "rgba(0, 245, 212, 0.32)", glow: "rgba(0, 245, 212, 0.22)", g1: "rgba(0, 245, 212, 0.26)", g2: "rgba(167, 139, 250, 0.22)" }
    ],
    Motivational: [
      { c1: "#091736", cMid: "#080d1a", c2: "#261607", accent: "rgba(56, 189, 248, 0.34)", glow: "rgba(56, 189, 248, 0.24)", g1: "rgba(56, 189, 248, 0.28)", g2: "rgba(251, 191, 36, 0.24)" },
      { c1: "#1a0e33", cMid: "#0b0917", c2: "#07262b", accent: "rgba(0, 245, 212, 0.34)", glow: "rgba(139, 92, 246, 0.24)", g1: "rgba(139, 92, 246, 0.28)", g2: "rgba(0, 245, 212, 0.26)" },
      { c1: "#211606", cMid: "#0f0c07", c2: "#0a1c33", accent: "rgba(251, 191, 36, 0.34)", glow: "rgba(251, 191, 36, 0.22)", g1: "rgba(251, 191, 36, 0.26)", g2: "rgba(59, 130, 246, 0.26)" },
      { c1: "#082429", cMid: "#081014", c2: "#1f0e33", accent: "rgba(34, 211, 238, 0.34)", glow: "rgba(34, 211, 238, 0.24)", g1: "rgba(34, 211, 238, 0.28)", g2: "rgba(192, 132, 252, 0.24)" },
      { c1: "#0d1b38", cMid: "#080e1c", c2: "#092920", accent: "rgba(52, 211, 153, 0.34)", glow: "rgba(59, 130, 246, 0.24)", g1: "rgba(59, 130, 246, 0.28)", g2: "rgba(52, 211, 153, 0.24)" },
      { c1: "#261209", cMid: "#100a08", c2: "#151233", accent: "rgba(251, 146, 60, 0.34)", glow: "rgba(251, 146, 60, 0.22)", g1: "rgba(251, 146, 60, 0.28)", g2: "rgba(99, 102, 241, 0.24)" }
    ],
    Birthday: [
      { c1: "#2b0926", cMid: "#120814", c2: "#07252e", accent: "rgba(255, 0, 127, 0.36)", glow: "rgba(0, 245, 212, 0.24)", g1: "rgba(255, 0, 127, 0.3)", g2: "rgba(251, 191, 36, 0.26)" },
      { c1: "#1a0a36", cMid: "#0d0818", c2: "#30121e", accent: "rgba(251, 191, 36, 0.36)", glow: "rgba(255, 0, 127, 0.24)", g1: "rgba(251, 191, 36, 0.28)", g2: "rgba(232, 121, 249, 0.28)" },
      { c1: "#08242e", cMid: "#081016", c2: "#2e0824", accent: "rgba(0, 245, 212, 0.36)", glow: "rgba(251, 191, 36, 0.22)", g1: "rgba(0, 245, 212, 0.28)", g2: "rgba(255, 77, 166, 0.28)" },
      { c1: "#291807", cMid: "#110c07", c2: "#210a33", accent: "rgba(244, 114, 182, 0.36)", glow: "rgba(251, 191, 36, 0.24)", g1: "rgba(251, 191, 36, 0.28)", g2: "rgba(244, 114, 182, 0.26)" }
    ],
    "Dil Se": [
      { c1: "#180c29", cMid: "#0b0912", c2: "#082129", accent: "rgba(0, 245, 212, 0.32)", glow: "rgba(192, 132, 252, 0.22)", g1: "rgba(192, 132, 252, 0.26)", g2: "rgba(0, 245, 212, 0.24)" },
      { c1: "#21091f", cMid: "#0c0910", c2: "#0b192e", accent: "rgba(255, 0, 127, 0.32)", glow: "rgba(255, 0, 127, 0.22)", g1: "rgba(255, 0, 127, 0.26)", g2: "rgba(56, 189, 248, 0.22)" },
      { c1: "#081f24", cMid: "#080f12", c2: "#240d21", accent: "rgba(34, 211, 238, 0.32)", glow: "rgba(34, 211, 238, 0.22)", g1: "rgba(34, 211, 238, 0.26)", g2: "rgba(244, 114, 182, 0.22)" },
      { c1: "#1d122e", cMid: "#0b0914", c2: "#1c1809", accent: "rgba(167, 139, 250, 0.32)", glow: "rgba(167, 139, 250, 0.22)", g1: "rgba(167, 139, 250, 0.26)", g2: "rgba(251, 191, 36, 0.2)" }
    ]
  };

  // Curated 12 Canvas Swatch Presets covering Romantic, Sad, Attitude, Dosti & Neon moods
  const CANVAS_PRESETS = [
    { mood: "Love", idx: 0, label: "Romantic Crimson" },
    { mood: "Love", idx: 2, label: "Rose Velvet" },
    { mood: "Sad", idx: 0, label: "Rainy Midnight" },
    { mood: "Sad", idx: 2, label: "Ocean Tears" },
    { mood: "Bewafa", idx: 0, label: "Heartbreak Plum" },
    { mood: "Bewafa", idx: 1, label: "Faded Wine" },
    { mood: "Attitude", idx: 0, label: "Royal Ember" },
    { mood: "Attitude", idx: 1, label: "Onyx Gold" },
    { mood: "Dosti", idx: 0, label: "Emerald Cyan" },
    { mood: "Motivational", idx: 0, label: "Cosmic Dawn" },
    { mood: "Birthday", idx: 0, label: "Festive Neon" },
    { mood: "Dil Se", idx: 0, label: "Starlit Dream" }
  ];

  // Mood-Matched Emojis (Dil/Rose for Love, Broken Heart/Sadness for Sad & Bewafa, etc.)
  const MOOD_EMOJIS = {
    Love: [
      { strip: "❤️ 🌹", watermark: "🌹" },
      { strip: "💖 🌹 💕", watermark: "❤️" },
      { strip: "🌹 ❤️ ✨", watermark: "💖" },
      { strip: "💕 🌹 💘", watermark: "🌹" },
      { strip: "❤️ 🌷 💖", watermark: "💕" },
      { strip: "💞 🌹 ❤️", watermark: "💘" }
    ],
    Sad: [
      { strip: "💔 😢", watermark: "💔" },
      { strip: "💔 🌧️ 😔", watermark: "😢" },
      { strip: "😢 💔 💧", watermark: "🌧️" },
      { strip: "😔 💔 🥀", watermark: "💔" },
      { strip: "💔 🥺 💧", watermark: "😔" },
      { strip: "💧 😢 💔", watermark: "💔" }
    ],
    Bewafa: [
      { strip: "🥀 💔", watermark: "🥀" },
      { strip: "💔 🥀 😢", watermark: "💔" },
      { strip: "🥀 💧 😔", watermark: "🥀" },
      { strip: "💔 🖤 🥀", watermark: "💔" },
      { strip: "🥀 💔 🌧️", watermark: "🥀" },
      { strip: "😔 🥀 💔", watermark: "💔" }
    ],
    Attitude: [
      { strip: "🔥 👑", watermark: "👑" },
      { strip: "⚡ 🔥 🦁", watermark: "🔥" },
      { strip: "👑 🔥 😎", watermark: "🦁" },
      { strip: "🔥 💯 ⚡", watermark: "🔥" },
      { strip: "🦁 🔥 👑", watermark: "👑" },
      { strip: "⚡ 👑 🔥", watermark: "⚡" }
    ],
    Dosti: [
      { strip: "🤝 💛", watermark: "🤝" },
      { strip: "🫂 ✨ 💛", watermark: "💛" },
      { strip: "🤝 🌟 💫", watermark: "🤝" },
      { strip: "💛 🤝 ✨", watermark: "🫂" },
      { strip: "✨ 🤝 🌟", watermark: "🤝" },
      { strip: "🫂 💛 🤝", watermark: "✨" }
    ],
    Motivational: [
      { strip: "⚡ 🚀", watermark: "⚡" },
      { strip: "🌟 ⚡ 💪", watermark: "🚀" },
      { strip: "🔥 ⚡ 🏆", watermark: "🏆" },
      { strip: "🚀 ✨ ⚡", watermark: "⚡" },
      { strip: "💪 🌟 ⚡", watermark: "🌟" },
      { strip: "🏆 ⚡ 🔥", watermark: "⚡" }
    ],
    Birthday: [
      { strip: "🎂 🎉", watermark: "🎂" },
      { strip: "🥳 🎂 ✨", watermark: "🎉" },
      { strip: "🎉 🎈 🎂", watermark: "🥳" },
      { strip: "🎂 💖 🎉", watermark: "🎈" }
    ],
    "Dil Se": [
      { strip: "✨ 💖", watermark: "✨" },
      { strip: "🌙 ✨ 💫", watermark: "🌙" },
      { strip: "💫 ❤️ ✨", watermark: "💫" },
      { strip: "✨ 🌟 💭", watermark: "✨" }
    ]
  };

  function getMoodTheme(category, index = 0) {
    const palette = MOOD_THEMES[category] || MOOD_THEMES["Dil Se"];
    const base = palette[Math.abs(index) % palette.length];
    // Unique angle & subtle stop variation per shayari so every shayari has a distinct background
    const angle = 115 + ((Math.abs(index) * 37) % 130);
    const midStop = 44 + ((Math.abs(index) * 7) % 18);
    return {
      ...base,
      angle,
      bg: `linear-gradient(${angle}deg, ${base.c1} 0%, ${base.cMid} ${midStop}%, ${base.c2} 100%)`
    };
  }

  function getMoodEmojis(category, index = 0) {
    const list = MOOD_EMOJIS[category] || MOOD_EMOJIS["Dil Se"];
    return list[Math.abs(index) % list.length];
  }

  // Auto-Mood Keyword NLP Rules
  const CATEGORY_RULES = [
    {
      id: "Love",
      label: "Love ❤️",
      icon: "❤️",
      keywords: [
        "ishq", "pyar", "pyaar", "dil", "mohabbat", "chahat", "deedar",
        "dhadkan", "muskaan", "sanam", "jaan", "humdum", "aashiqui", "mehboob",
        "इश्क", "प्यार", "दिल", "मोहब्बत", "चाहत"
      ]
    },
    {
      id: "Sad",
      label: "Sad 💔",
      icon: "💔",
      keywords: [
        "dard", "aansu", "tanha", "tanhai", "judaai", "judai", "zakhm",
        "gham", "khamoshi", "khamosh", "saza", "bheeg", "palkein", "rona",
        "दर्द", "आंसू", "तन्हा", "जुदाई", "गम"
      ]
    },
    {
      id: "Attitude",
      label: "Attitude 🔥",
      icon: "🔥",
      keywords: [
        "attitude", "aukaat", "aukat", "sher", "sheron", "dushman", "tevar",
        "shaan", "usool", "salaam", "kirdaar", "pehchaan", "jhukna",
        "औकात", "दुश्मन", "शेर", "तेवर"
      ]
    },
    {
      id: "Dosti",
      label: "Dosti 🤝",
      icon: "🤝",
      keywords: [
        "yaar", "yaari", "yaaron", "dost", "dosti", "saath", "bheed",
        "यार", "दोस्त", "दोस्ती", "यारी"
      ]
    },
    {
      id: "Bewafa",
      label: "Bewafa 🥀",
      icon: "🥀",
      keywords: [
        "bewafa", "bewafaai", "dhokha", "wafa", "bharosa", "gila", "matlab",
        "बेवफा", "धोखा", "वफा"
      ]
    },
    {
      id: "Motivational",
      label: "Motivational ⚡",
      icon: "⚡",
      keywords: [
        "waqt", "zindagi", "manzil", "hosla", "hoslon", "mehnat", "kamyabi",
        "udaan", "iradon", "umeed", "safar", "subah", "khwabon",
        "वक्त", "जिंदगी", "ज़िंदगी", "मंजिल", "हौसला"
      ]
    }
  ];

  // Personalized Name Shayari Original Templates
  const NAME_TEMPLATES = {
    Love: [
      (n) => `${n}, tera naam mere dil ki har dhadkan mein basta hai,\nTeri ek muskaan se hi mera har din hansta hai.`,
      (n) => `Har dua mein bas ${n} ka hi zikr aata hai,\nTere pyar ke bina yeh dil kahin chain nahi paata hai.`,
      (n) => `${n} ki aankhon mein ek alag hi noor rehta hai,\nJo paas na ho kar bhi dil ke sabse kareeb rehta hai.`,
      (n) => `Ishq ki kitaab ka sabse khoobsurat panna hai ${n},\nMeri har khushi aur har khwab ka thikana hai ${n}.`,
      (n) => `Chahe lakhon chehre hon is bheed bhari duniya mein,\nPar meri nazron ko sirf ${n} hi pasand aata hai.`,
      (n) => `${n}, tere saath guzra har pal ek haseen kahani hai,\nYeh dil sirf tera hai, bas yahi zindagi ki nishani hai.`,
      (n) => `Mohabbat ka matlab samajh aaya ${n} se milne ke baad,\nHar mausam suhana lagta hai tere khilne ke baad.`,
      (n) => `Dil ki duniya mein sirf ${n} ka hi raaj chalta hai,\nTeri ek aawaaz sunte hi mera har gham dhalta hai.`,
      (n) => `Sacha pyar lafzon mein nahi, ${n} ki saadgi mein dikhta hai,\nJo bina kahe har ehsaas mere dil par likhta hai.`,
      (n) => `${n} ka saath mile toh har raasta gulzar ho jaye,\nEk pal ki mulaqat bhi umr bhar ka pyar ho jaye.`,
      (n) => `Raat ki khamoshi mein jab bhi sitare chamakte hain,\nMere khayalon mein sirf ${n} ke hi naam dhadakte hain.`,
      (n) => `Khuda se har subah bas yahi fariyaad karte hain hum,\nHamesha muskurata rahe ${n}, bas yahi aabad karte hain hum.`
    ],
    Dosti: [
      (n) => `${n} jaisa yaar kismat walon ko milta hai,\nJiske hone se mushkilon mein bhi chehra khilta hai.`,
      (n) => `Dosti ka asli matlab ${n} ne sikhaya hai,\nHar mod par bina kahe saath nibhaya hai.`,
      (n) => `Waqt chahe jitna bhi badal jaye mere dost ${n},\nHamari yaari ka rang kabhi halka nahi padega.`,
      (n) => `Bheed mein bhi jo awaaz pehchan le woh hai ${n},\nDosti ki mehfil ki asli jaan aur shaan hai ${n}.`,
      (n) => `${n} ke saath bitaye lamhe sabse anmol khazana hain,\nYaaron ke bina zindagi ka har rang begaana hai.`,
      (n) => `Jab bhi mushkil raaste saamne aate hain,\n${n} jaise dost hi hausla badha jaate hain.`,
      (n) => `Na daulat ki zaroorat hai, na shohrat ki chahat hai,\nBas ${n} ki dosti salamat rahe, yahi sabse badi raahat hai.`,
      (n) => `Har hansi mein shamil hai ${n}, har raaz ka sahara hai,\nSachi yaari ki duniya mein yeh rishta sabse pyara hai.`,
      (n) => `Saalon beet jayein par yaad rahegi ${n} ki yaari,\nDuniya ki har khushi par bhaari hai dosti hamari.`,
      (n) => `Ek call par jo haazir ho jaye woh yaar hai ${n},\nKhushiyon ke samundar ka sacha kinara hai ${n}.`,
      (n) => `Zindagi ki kitaab mein sabse pyara kissa hai ${n},\nMeri har muskurahat ka sabse khaas hissa hai ${n}.`,
      (n) => `Khuda hamesha buland rakhe ${n} ka har makaam,\nYaari ke naam likh di humne apni har subah aur shaam.`
    ],
    Attitude: [
      (n) => `${n} apna andaaz khud likhta hai, kisi ki naqal nahi karta,\nJo usoolon par chale woh waqt se kabhi nahi darta.`,
      (n) => `Naam toh ${n} hi kaafi hai mehfil mein pehchaan ke liye,\nHum chup rehte hain bas apni shaan ke liye.`,
      (n) => `${n} ki khamoshi ko kamzori mat samajhna,\nSamundar shant ho toh uski gehrai se darna.`,
      (n) => `Jitna seedha dikhta hai ${n}, irade utne hi buland hain,\nDushman bhi maante hain ki hamare tevar akhand hain.`,
      (n) => `${n} kisi ke peeche nahi chalta, apni raah khud banata hai,\nHaar ko jeet mein badalna is sher ko aata hai.`,
      (n) => `Hamari aukaat ka andaaza woh kya lagayenge,\nJo ${n} ki ek jhalak paane ko taras jayenge.`,
      (n) => `${n} ka attitude khoon mein hai, dikhawe mein nahi,\nHum waqt aane par bolte hain, har chhoti baat mein nahi.`,
      (n) => `Bheed ka hissa banna ${n} ki fitrat mein nahi,\nHum akele hi kaafi hain apni izzat aur shohrat mein.`,
      (n) => `Jo jalte hain ${n} ki kamyabi dekh kar,\nUnhe keh do abhi toh shuruat hui hai sabr rakh kar.`,
      (n) => `${n} na kisi se darta hai, na kisi ke aage jhukta hai,\nApni manzil paane se pehle yeh toofan nahi rukta hai.`,
      (n) => `Andaaz thoda alag hai ${n} ka duniya walon se,\nHum jawab kaam se dete hain, fizool ke sawalon se.`,
      (n) => `Sher ki chaal aur ${n} ka naam dono khaas hote hain,\nJahan khade ho jayein, wahin naye itihaas hote hain.`
    ],
    Birthday: [
      (n) => `Janamdin mubarak ho ${n}, har khushi tere kadam choome,\nTere aangan mein hamesha hansiyon ka saawan jhoome.`,
      (n) => `Aaj ka din sabse khaas hai kyunki ${n} ka birthday aaya hai,\nHar taraf khushiyon aur duaon ka ujala chhaya hai.`,
      (n) => `Khuda kare ${n} ki umr lambi aur safar suhana ho,\nHar aane wala saal pichle saal se bhi deewana ho.`,
      (n) => `Chamakte sitaron jaisi chamak rahe ${n} ke chehre par,\nKoi gham na aaye kabhi tere khushiyon ke pehre par.`,
      (n) => `Happy Birthday ${n}, tera har sapna sach ho jaye,\nJis manzil ko tu chahe woh tujhe aasani se mil jaye.`,
      (n) => `Dua hai aaj ${n} ke liye har subah nayi umeed laye,\nTeri muskaan dekh kar yeh poori kaaynaat muskuraye.`,
      (n) => `Zindagi ke har mod par kamyabi tera haath thaame ${n},\nHar mehfil mein goonje hamesha sirf tera hi naam ${n}.`,
      (n) => `Phoolon ki tarah khilta rahe ${n} ka har ek pal,\nAaj bhi haseen ho tera aur roshan ho aane wala kal.`,
      (n) => `Birthday par ${n} ko dher saara pyar aur shubhkamnayein,\nTere jeevan mein kabhi na aayein koi bhi uljhanein.`,
      (n) => `Sooraj si roshni aur chaand si sheetalta mile ${n} ko,\nKhushiyon ka aisa samundar mile jo kabhi na ruke ${n} ko.`,
      (n) => `Cake se zyada meethi ho ${n} ki aane wali zindagi,\nHar din bane ek tyohar aur barkarar rahe taazgi.`,
      (n) => `Dil se duayein bhej rahe hain aaj ${n} ke janamdin par,\nSada salamat raho tum har khushi ki zameen par.`
    ]
  };

  // App State
  const state = {
    appDownloadUrl: FALLBACK_CONFIG.app_download_url,
    adInterval: FALLBACK_CONFIG.ad_interval,
    allShayaris: [],       // [{ id, text, category, icon, badge }]
    filteredShayaris: [],
    activeCategory: "All",
    searchQuery: "",
    currentIndex: 0,
    swipeCount: 0,
    favorites: [],         // array of strings
    activeTab: "home",
    nameMood: "Love",
    maker: {
      aspect: "1:1",
      text: "",
      category: "Love",
      emojis: "❤️ 🌹",
      bgIndex: 0,
      customTheme: null,
      customImg: null,
      overlayOpacity: 0.45,
      fontSize: 44,
      fontStyle: "modern",
      textColor: "#FFFFFF"
    }
  };

  // DOM References
  const el = {
    maintenanceOverlay: document.getElementById("maintenanceOverlay"),
    retryConfigBtn: document.getElementById("retryConfigBtn"),
    syncBadge: document.getElementById("syncBadge"),
    liveCounter: document.getElementById("liveCounter"),
    categoryBar: document.getElementById("categoryBar"),
    homeSearchInput: document.getElementById("homeSearchInput"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    homeSearchGoBtn: document.getElementById("homeSearchGoBtn"),
    trendingKeywords: document.getElementById("trendingKeywords"),
    searchStatusBanner: document.getElementById("searchStatusBanner"),
    searchStatusText: document.getElementById("searchStatusText"),
    resetSearchBannerBtn: document.getElementById("resetSearchBannerBtn"),
    cardViewport: document.getElementById("cardViewport"),
    prevBtn: document.getElementById("prevBtn"),
    randomBtn: document.getElementById("randomBtn"),
    headerRandomBtn: document.getElementById("headerRandomBtn"),
    nextBtn: document.getElementById("nextBtn"),
    jumpModalBtn: document.getElementById("jumpModalBtn"),
    jumpModal: document.getElementById("jumpModal"),
    closeJumpModalBtn: document.getElementById("closeJumpModalBtn"),
    jumpRangeHint: document.getElementById("jumpRangeHint"),
    jumpNumberInput: document.getElementById("jumpNumberInput"),
    confirmJumpBtn: document.getElementById("confirmJumpBtn"),
    jumpFirstBtn: document.getElementById("jumpFirstBtn"),
    jumpRandomBtn: document.getElementById("jumpRandomBtn"),
    jumpLastBtn: document.getElementById("jumpLastBtn"),
    nameInput: document.getElementById("nameInput"),
    generateNameBtn: document.getElementById("generateNameBtn"),
    nameMoodPills: document.getElementById("nameMoodPills"),
    nameResultsList: document.getElementById("nameResultsList"),
    aspectSquareBtn: document.getElementById("aspectSquareBtn"),
    aspectStoryBtn: document.getElementById("aspectStoryBtn"),
    galleryUploadInput: document.getElementById("galleryUploadInput"),
    clearBgImageBtn: document.getElementById("clearBgImageBtn"),
    statusCanvas: document.getElementById("statusCanvas"),
    downloadStatusBtn: document.getElementById("downloadStatusBtn"),
    shareStatusBtn: document.getElementById("shareStatusBtn"),
    makerTextInput: document.getElementById("makerTextInput"),
    presetBgGrid: document.getElementById("presetBgGrid"),
    overlaySlider: document.getElementById("overlaySlider"),
    overlayVal: document.getElementById("overlayVal"),
    fontSizeSlider: document.getElementById("fontSizeSlider"),
    fontSizeVal: document.getElementById("fontSizeVal"),
    fontStyleSelect: document.getElementById("fontStyleSelect"),
    textColorSwatches: document.getElementById("textColorSwatches"),
    favoritesList: document.getElementById("favoritesList"),
    favoritesCountSub: document.getElementById("favoritesCountSub"),
    clearFavoritesBtn: document.getElementById("clearFavoritesBtn"),
    favNavBadge: document.getElementById("favNavBadge"),
    toast: document.getElementById("toast")
  };

  // Safe default Start.io / WebView interstitial hook
  if (typeof window.showAndroidInterstitial !== "function") {
    window.showAndroidInterstitial = () => {
      if (window.AndroidBridge && typeof window.AndroidBridge.showInterstitial === "function") {
        window.AndroidBridge.showInterstitial();
      }
    };
  }

  // Android Hardware Back Button handler
  window.handleAndroidBack = () => {
    if (!el.jumpModal.classList.contains("hidden")) {
      closeJumpModal();
      return true;
    }
    if (state.activeTab !== "home") {
      switchTab("home");
      return true;
    }
    if (state.searchQuery) {
      clearKeywordSearch();
      return true;
    }
    return false;
  };

  // ---------- Toast Utility ----------
  let toastTimer = null;
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.classList.remove("show");
    }, 2400);
  }

  // ---------- Auto-Mood Keyword NLP Detector ----------
  function detectCategory(text, explicitCat) {
    if (explicitCat && typeof explicitCat === "string") {
      const match = CATEGORY_RULES.find(
        (r) => r.id.toLowerCase() === explicitCat.trim().toLowerCase()
      );
      if (match) return { id: match.id, label: match.label, icon: match.icon };
      return { id: explicitCat.trim(), label: `${explicitCat.trim()} ✨`, icon: "✨" };
    }

    const lower = text.toLowerCase();
    let bestRule = null;
    let bestScore = 0;

    for (const rule of CATEGORY_RULES) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (lower.includes(kw)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestRule = rule;
      }
    }

    if (bestRule) {
      return { id: bestRule.id, label: bestRule.label, icon: bestRule.icon };
    }
    return { id: "Dil Se", label: "Dil Se ✨", icon: "✨" };
  }

  // ---------- Auto-Typography Scaler ----------
  function getTypographyClass(text) {
    const len = text.length;
    const lines = text.split("\n").length;
    if (len <= 90 && lines <= 2) return "size-xl";
    if (len <= 160 && lines <= 4) return "size-lg";
    if (len <= 250 && lines <= 5) return "size-md";
    return "size-sm";
  }

  // ---------- Normalize Flat OR Categorized JSON ----------
  function normalizeShayaris(rawShayaris) {
    const list = [];
    let counter = 0;

    if (Array.isArray(rawShayaris)) {
      for (const item of rawShayaris) {
        if (typeof item === "string" && item.trim()) {
          const text = item.trim();
          const cat = detectCategory(text);
          list.push({ id: counter++, text, category: cat.id, badge: cat.label, icon: cat.icon });
        } else if (item && typeof item === "object" && typeof item.text === "string" && item.text.trim()) {
          const text = item.text.trim();
          const cat = detectCategory(text, item.category);
          list.push({ id: counter++, text, category: cat.id, badge: cat.label, icon: cat.icon });
        }
      }
    } else if (rawShayaris && typeof rawShayaris === "object") {
      for (const [catName, arr] of Object.entries(rawShayaris)) {
        if (Array.isArray(arr)) {
          for (const text of arr) {
            if (typeof text === "string" && text.trim()) {
              const clean = text.trim();
              const cat = detectCategory(clean, catName);
              list.push({ id: counter++, text: clean, category: cat.id, badge: cat.label, icon: cat.icon });
            }
          }
        }
      }
    }

    return list;
  }

  // ---------- Remote Config & LocalStorage Cache ----------
  function applyConfig(config, sourceLabel) {
    if (config.maintenance_mode === true) {
      el.maintenanceOverlay.classList.remove("hidden");
    } else {
      el.maintenanceOverlay.classList.add("hidden");
    }

    if (typeof config.app_download_url === "string" && config.app_download_url.trim()) {
      state.appDownloadUrl = config.app_download_url.trim();
    }
    if (Number.isFinite(Number(config.ad_interval)) && Number(config.ad_interval) > 0) {
      state.adInterval = Number(config.ad_interval);
    }

    const parsed = normalizeShayaris(config.shayaris);
    state.allShayaris = parsed.length > 0 ? parsed : normalizeShayaris(FALLBACK_CONFIG.shayaris);

    el.syncBadge.textContent = sourceLabel;
    buildCategoryPills();
    applyCategoryFilter(state.activeCategory, false);

    if (!state.maker.text && state.filteredShayaris.length > 0) {
      const first = state.filteredShayaris[0];
      state.maker.text = first.text;
      state.maker.category = first.category;
      state.maker.emojis = getMoodEmojis(first.category, first.id).strip;
      state.maker.customTheme = getMoodTheme(first.category, first.id);
      el.makerTextInput.value = state.maker.text;
      renderStatusCanvas();
    }
  }

  function normalizeConfigPayload(rawData) {
    if (Array.isArray(rawData)) {
      return {
        app_download_url: FALLBACK_CONFIG.app_download_url,
        maintenance_mode: false,
        ad_interval: FALLBACK_CONFIG.ad_interval,
        shayaris: rawData
      };
    }
    if (rawData && typeof rawData === "object" && rawData.shayaris) {
      return rawData;
    }
    return null;
  }

  async function loadShayariConfig() {
    let hasCache = false;

    // 1. Instant render from localStorage cache or offline fallback
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache = normalizeConfigPayload(JSON.parse(cached));
        if (parsedCache) {
          hasCache = true;
          applyConfig(parsedCache, "Cached • Instant");
        }
      }
      if (!hasCache) {
        applyConfig(FALLBACK_CONFIG, "Offline Ready");
      }
    } catch {
      applyConfig(FALLBACK_CONFIG, "Offline Ready");
    }

    // 2. Background fetch from live GitHub Raw JSON URL
    const liveUrl = normalizeRemoteJsonUrl(REMOTE_CONFIG_URL);
    try {
      const resp = await fetch(liveUrl, { cache: "no-store" });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const rawJson = await resp.json();
      const normalized = normalizeConfigPayload(rawJson);
      if (normalized) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
        const count = normalizeShayaris(normalized.shayaris).length;
        applyConfig(normalized, `Live • ${count} Shayaris`);
        return;
      }
    } catch {
      // Fallback to bundled local shayari-data.json if no cache yet
      if (!hasCache) {
        try {
          const localResp = await fetch(LOCAL_FALLBACK_URL, { cache: "no-store" });
          if (localResp.ok) {
            const localJson = normalizeConfigPayload(await localResp.json());
            if (localJson) {
              applyConfig(localJson, "Offline Ready");
            }
          }
        } catch {
          // Keep FALLBACK_CONFIG smoothly
        }
      }
    }
  }

  // ---------- Category Pills & Filtering ----------
  function buildCategoryPills() {
    const counts = new Map();
    for (const item of state.allShayaris) {
      counts.set(item.category, (counts.get(item.category) || 0) + 1);
    }

    const orderedIds = ["All", ...CATEGORY_RULES.map((r) => r.id), "Dil Se"];
    // Add any custom categories from categorized JSON
    for (const key of counts.keys()) {
      if (!orderedIds.includes(key)) orderedIds.push(key);
    }

    const frag = document.createDocumentFragment();
    for (const catId of orderedIds) {
      const count = catId === "All" ? state.allShayaris.length : (counts.get(catId) || 0);
      if (catId !== "All" && count === 0) continue;

      const rule = CATEGORY_RULES.find((r) => r.id === catId);
      const label = catId === "All" ? "All ✨" : rule ? rule.label : `${catId} ✨`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cat-pill" + (state.activeCategory === catId ? " active" : "");
      btn.dataset.category = catId;
      btn.innerHTML = `<span>${escapeHtml(label)}</span><span class="cat-pill-count">${count}</span>`;
      btn.addEventListener("click", () => {
        state.searchQuery = "";
        el.homeSearchInput.value = "";
        applyCategoryFilter(catId, true);
        if (state.activeTab !== "home") switchTab("home");
      });
      frag.appendChild(btn);
    }

    el.categoryBar.innerHTML = "";
    el.categoryBar.appendChild(frag);
  }

  function applyCategoryFilter(catId, resetIndex = true) {
    state.activeCategory = catId;
    const baseList =
      catId === "All"
        ? state.allShayaris
        : state.allShayaris.filter((item) => item.category === catId);

    const q = state.searchQuery.trim().toLowerCase();
    if (q) {
      // Keyword search scans full collection if user searched directly, or matching items
      state.filteredShayaris = state.allShayaris.filter(
        (item) =>
          item.text.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q)
      );
    } else {
      state.filteredShayaris = baseList;
    }

    if (resetIndex) {
      state.currentIndex = 0;
    } else if (state.currentIndex >= state.filteredShayaris.length) {
      state.currentIndex = 0;
    }

    // Update active pill styling
    el.categoryBar.querySelectorAll(".cat-pill").forEach((pill) => {
      pill.classList.toggle("active", !q && pill.dataset.category === catId);
    });

    updateSearchUiState();
    renderActiveCard();
  }

  // ---------- Search Engine & Number Jump ----------
  function parseJumpNumber(raw) {
    const clean = raw.trim();
    if (/^#?\d+$/.test(clean)) {
      return parseInt(clean.replace("#", ""), 10);
    }
    return null;
  }

  function updateSearchUiState() {
    const rawVal = el.homeSearchInput.value;
    const trimmed = rawVal.trim();
    const jumpNum = parseJumpNumber(trimmed);

    el.clearSearchBtn.classList.toggle("hidden", rawVal.length === 0);
    el.homeSearchGoBtn.textContent = jumpNum !== null ? `Jump #${jumpNum}` : "Search";

    el.trendingKeywords.querySelectorAll(".kw-chip").forEach((chip) => {
      chip.classList.toggle("active", state.searchQuery.toLowerCase() === chip.dataset.kw.toLowerCase());
    });

    if (state.searchQuery) {
      const count = state.filteredShayaris.length;
      el.searchStatusText.textContent = `🔍 ${count} shayari${count === 1 ? "" : "s"} found for "${state.searchQuery}"`;
      el.searchStatusBanner.classList.remove("hidden");
    } else {
      el.searchStatusBanner.classList.add("hidden");
    }
  }

  function runKeywordSearch(query) {
    state.searchQuery = query.trim();
    el.homeSearchInput.value = state.searchQuery;
    applyCategoryFilter(state.activeCategory, true);
  }

  function clearKeywordSearch() {
    state.searchQuery = "";
    el.homeSearchInput.value = "";
    applyCategoryFilter(state.activeCategory, true);
  }

  function jumpToShayariNumber(num) {
    if (state.searchQuery) {
      state.searchQuery = "";
      el.homeSearchInput.value = "";
      state.filteredShayaris =
        state.activeCategory === "All"
          ? state.allShayaris
          : state.allShayaris.filter((item) => item.category === state.activeCategory);
    }

    const total = state.filteredShayaris.length;
    if (total === 0) return;
    if (num < 1 || num > total) {
      showToast(`Enter a number between 1 and ${total}`);
      return;
    }
    state.currentIndex = num - 1;
    updateSearchUiState();
    renderActiveCard();
    if (state.activeTab !== "home") switchTab("home");
    showToast(`Jumped to Shayari #${num}`);
  }

  function handleSearchSubmit(rawValue) {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      clearKeywordSearch();
      return;
    }
    const jumpNum = parseJumpNumber(trimmed);
    if (jumpNum !== null) {
      jumpToShayariNumber(jumpNum);
    } else {
      runKeywordSearch(trimmed);
      if (state.activeTab !== "home") switchTab("home");
    }
  }

  function highlightKeywordHtml(text, query) {
    const safeText = escapeHtml(text);
    const q = query.trim();
    if (!q) return safeText;
    const escapedQuery = escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return safeText.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // ---------- Favorites Persistence ----------
  function loadFavorites() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      state.favorites = Array.isArray(parsed) ? parsed : [];
    } catch {
      state.favorites = [];
    }
    updateFavBadge();
  }

  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
    } catch {
      // Ignore quota errors
    }
    updateFavBadge();
  }

  function isFavorited(text) {
    return state.favorites.includes(text);
  }

  function toggleFavorite(text) {
    const idx = state.favorites.indexOf(text);
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      showToast("Removed from Favorites");
    } else {
      state.favorites.unshift(text);
      showToast("Saved to Favorites ❤️");
    }
    saveFavorites();
    renderActiveCard();
    if (state.activeTab === "favorites") renderFavoritesTab();
  }

  function updateFavBadge() {
    const count = state.favorites.length;
    el.favNavBadge.textContent = String(count);
    el.favNavBadge.classList.toggle("hidden", count === 0);
  }

  // ---------- Sharing & Clipboard Actions ----------
  function buildShareMessage(text, emojis = "") {
    const prefix = emojis ? `${emojis}\n` : "";
    return `${prefix}${text}\n\n📲 Download Best Shayari App:\n${state.appDownloadUrl}`;
  }

  async function copyShayari(text, emojis = "") {
    const payload = buildShareMessage(text, emojis);
    if (window.AndroidBridge && typeof window.AndroidBridge.copyText === "function") {
      window.AndroidBridge.copyText(payload);
      showToast("Copied with App Link! 📋");
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        fallbackCopy(payload);
      }
      showToast("Copied with App Link! 📋");
    } catch {
      fallbackCopy(payload);
      showToast("Copied with App Link! 📋");
    }
  }

  function fallbackCopy(str) {
    const ta = document.createElement("textarea");
    ta.value = str;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  function shareOnWhatsApp(text, emojis = "") {
    const url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(buildShareMessage(text, emojis));
    if (window.AndroidBridge && typeof window.AndroidBridge.openExternalUrl === "function") {
      window.AndroidBridge.openExternalUrl(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function openInPhotoMaker(text, category = "Love", themeIndex = 0, emojis = "") {
    const moodEmojis = emojis || getMoodEmojis(category, themeIndex).strip;
    state.maker.text = text;
    state.maker.category = category;
    state.maker.emojis = moodEmojis;
    state.maker.customTheme = getMoodTheme(category, themeIndex);
    state.maker.customImg = null;
    el.clearBgImageBtn.classList.add("hidden");
    el.makerTextInput.value = text;
    updatePresetSwatchSelection();
    renderStatusCanvas();
    switchTab("maker");
    showToast(`Loaded ${category} Theme 🎨`);
  }

  // ---------- Tab 1: Strict Single-Card Renderer ----------
  function renderActiveCard() {
    const total = state.filteredShayaris.length;
    if (total === 0) {
      el.liveCounter.textContent = "0 / 0";
      el.cardViewport.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-icon">🔍</div>
          <h3>No Shayari Found</h3>
          <p>${state.searchQuery ? `No match for "${escapeHtml(state.searchQuery)}". Try another keyword like dil, dard, or yaar.` : "Try selecting the All category above."}</p>
        </div>`;
      return;
    }

    const idx = ((state.currentIndex % total) + total) % total;
    state.currentIndex = idx;
    const item = state.filteredShayaris[idx];
    const theme = getMoodTheme(item.category, item.id);
    const moodEmoji = getMoodEmojis(item.category, item.id);
    const typoClass = getTypographyClass(item.text);
    const fav = isFavorited(item.text);
    const renderedTextHtml = highlightKeywordHtml(item.text, state.searchQuery);

    el.liveCounter.textContent = `${idx + 1} / ${total}`;
    const deckTotal = state.activeCategory === "All"
      ? state.allShayaris.length
      : state.allShayaris.filter((x) => x.category === state.activeCategory).length;
    el.jumpRangeHint.textContent = `Type a keyword (e.g. dil, dard) or number (1–${deckTotal})`;

    // Strictly ONE card in DOM at a time for 60fps performance even with 5,000+ shayaris
    el.cardViewport.innerHTML = "";

    const card = document.createElement("article");
    card.className = "shayari-card";
    card.dataset.mood = item.category;
    card.style.background = theme.bg;
    card.style.setProperty("--card-accent", theme.accent);
    card.style.setProperty("--card-glow", theme.glow);

    card.innerHTML = `
      <div class="card-watermark-emoji" aria-hidden="true">${moodEmoji.watermark}</div>
      <div class="card-meta-row">
        <span class="mood-badge">${escapeHtml(item.badge)}</span>
        <span class="card-index-chip">#${idx + 1}</span>
      </div>
      <div class="shayari-body-wrap">
        <div class="shayari-emoji-strip" aria-hidden="true">${moodEmoji.strip}</div>
        <p class="shayari-text ${typoClass}">${renderedTextHtml}</p>
      </div>
      <div class="card-actions-bar">
        <button class="card-action-btn" data-act="copy" type="button" aria-label="Copy Shayari">
          <span class="act-ico">📋</span>
          <span>Copy</span>
        </button>
        <button class="card-action-btn is-whatsapp" data-act="whatsapp" type="button" aria-label="Share on WhatsApp">
          <span class="act-ico">💬</span>
          <span>Status</span>
        </button>
        <button class="card-action-btn is-maker" data-act="maker" type="button" aria-label="Edit on Photo">
          <span class="act-ico">🎨</span>
          <span>Photo</span>
        </button>
        <button class="card-action-btn is-fav ${fav ? "favorited" : ""}" data-act="fav" type="button" aria-label="Favorite Shayari">
          <span class="act-ico">${fav ? "❤️" : "🤍"}</span>
          <span>${fav ? "Saved" : "Save"}</span>
        </button>
      </div>
    `;

    card.querySelector('[data-act="copy"]').addEventListener("click", () => copyShayari(item.text, moodEmoji.strip));
    card.querySelector('[data-act="whatsapp"]').addEventListener("click", () => shareOnWhatsApp(item.text, moodEmoji.strip));
    card.querySelector('[data-act="maker"]').addEventListener("click", () => openInPhotoMaker(item.text, item.category, item.id, moodEmoji.strip));
    card.querySelector('[data-act="fav"]').addEventListener("click", () => toggleFavorite(item.text));

    el.cardViewport.appendChild(card);
  }

  function navigateCard(delta) {
    const total = state.filteredShayaris.length;
    if (total === 0) return;

    state.currentIndex = (state.currentIndex + delta + total) % total;
    state.swipeCount += 1;
    renderActiveCard();

    if (state.adInterval > 0 && state.swipeCount % state.adInterval === 0) {
      window.showAndroidInterstitial();
    }
  }

  function jumpToRandomCard() {
    const total = state.filteredShayaris.length;
    if (total <= 1) return;
    let nextIdx = Math.floor(Math.random() * total);
    if (nextIdx === state.currentIndex) {
      nextIdx = (nextIdx + 1) % total;
    }
    state.currentIndex = nextIdx;
    state.swipeCount += 1;
    renderActiveCard();
    if (state.activeTab !== "home") switchTab("home");
    if (state.adInterval > 0 && state.swipeCount % state.adInterval === 0) {
      window.showAndroidInterstitial();
    }
  }

  // Smooth Touch Swipe Gesture on Card Viewport
  function setupSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    el.cardViewport.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    el.cardViewport.addEventListener("touchend", (e) => {
      if (!tracking || e.changedTouches.length === 0) return;
      tracking = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx < 0) navigateCard(1);
        else navigateCard(-1);
      }
    }, { passive: true });
  }

  // ---------- Unified Search & Jump Modal ----------
  function openJumpModal() {
    el.jumpNumberInput.value = state.searchQuery || "";
    el.jumpModal.classList.remove("hidden");
    setTimeout(() => el.jumpNumberInput.focus(), 60);
  }

  function closeJumpModal() {
    el.jumpModal.classList.add("hidden");
  }

  function commitJumpNumber() {
    const raw = el.jumpNumberInput.value.trim();
    if (!raw) {
      closeJumpModal();
      clearKeywordSearch();
      return;
    }
    const jumpNum = parseJumpNumber(raw);
    if (jumpNum !== null) {
      closeJumpModal();
      jumpToShayariNumber(jumpNum);
    } else {
      closeJumpModal();
      runKeywordSearch(raw);
      if (state.activeTab !== "home") switchTab("home");
    }
  }

  // ---------- Tab 2: Name Shayari Generator ----------
  function generateNameShayaris() {
    const rawName = el.nameInput.value.trim();
    const displayName = rawName ? rawName : "Aarav";
    const templates = NAME_TEMPLATES[state.nameMood] || NAME_TEMPLATES.Love;

    el.nameResultsList.innerHTML = "";
    const frag = document.createDocumentFragment();

    templates.forEach((fn, idx) => {
      const text = fn(displayName);
      const mood = state.nameMood;
      const theme = getMoodTheme(mood, idx);
      const moodEmoji = getMoodEmojis(mood, idx);
      const fav = isFavorited(text);

      const card = document.createElement("article");
      card.className = "mini-shayari-card";
      card.dataset.mood = mood;
      card.style.background = theme.bg;
      card.style.setProperty("--card-accent", theme.accent);
      card.innerHTML = `
        <div class="card-watermark-emoji" aria-hidden="true">${moodEmoji.watermark}</div>
        <div class="card-meta-row">
          <span class="mood-badge">${escapeHtml(displayName)} • ${escapeHtml(mood)}</span>
          <span class="card-index-chip">#${idx + 1}</span>
        </div>
        <div class="mini-emoji-center">
          <div class="shayari-emoji-strip" aria-hidden="true">${moodEmoji.strip}</div>
        </div>
        <p class="shayari-text size-md">${escapeHtml(text)}</p>
        <div class="card-actions-bar">
          <button class="card-action-btn" data-act="copy" type="button"><span class="act-ico">📋</span><span>Copy</span></button>
          <button class="card-action-btn is-whatsapp" data-act="whatsapp" type="button"><span class="act-ico">💬</span><span>Status</span></button>
          <button class="card-action-btn is-maker" data-act="maker" type="button"><span class="act-ico">🎨</span><span>Photo</span></button>
          <button class="card-action-btn is-fav ${fav ? "favorited" : ""}" data-act="fav" type="button">
            <span class="act-ico">${fav ? "❤️" : "🤍"}</span><span>${fav ? "Saved" : "Save"}</span>
          </button>
        </div>
      `;

      card.querySelector('[data-act="copy"]').addEventListener("click", () => copyShayari(text, moodEmoji.strip));
      card.querySelector('[data-act="whatsapp"]').addEventListener("click", () => shareOnWhatsApp(text, moodEmoji.strip));
      card.querySelector('[data-act="maker"]').addEventListener("click", () => openInPhotoMaker(text, mood, idx, moodEmoji.strip));
      card.querySelector('[data-act="fav"]').addEventListener("click", (ev) => {
        toggleFavorite(text);
        const nowFav = isFavorited(text);
        const btn = ev.currentTarget;
        btn.classList.toggle("favorited", nowFav);
        btn.querySelector(".act-ico").textContent = nowFav ? "❤️" : "🤍";
        btn.querySelector("span:last-child").textContent = nowFav ? "Saved" : "Save";
      });

      frag.appendChild(card);
    });

    el.nameResultsList.appendChild(frag);
  }

  // ---------- Tab 3: Photo Status Maker (HTML5 Canvas) ----------
  function buildPresetSwatches() {
    el.presetBgGrid.innerHTML = "";
    CANVAS_PRESETS.forEach((preset, i) => {
      const theme = getMoodTheme(preset.mood, preset.idx);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset-swatch" + (!state.maker.customTheme && state.maker.bgIndex === i ? " active" : "");
      btn.style.background = theme.bg;
      btn.title = preset.label;
      btn.setAttribute("aria-label", preset.label);
      btn.addEventListener("click", () => {
        state.maker.bgIndex = i;
        state.maker.customTheme = null;
        state.maker.customImg = null;
        state.maker.category = preset.mood;
        state.maker.emojis = getMoodEmojis(preset.mood, preset.idx).strip;
        el.clearBgImageBtn.classList.add("hidden");
        updatePresetSwatchSelection();
        renderStatusCanvas();
      });
      el.presetBgGrid.appendChild(btn);
    });
  }

  function updatePresetSwatchSelection() {
    el.presetBgGrid.querySelectorAll(".preset-swatch").forEach((sw, idx) => {
      sw.classList.toggle("active", !state.maker.customImg && !state.maker.customTheme && idx === state.maker.bgIndex);
    });
  }


  function wrapCanvasLines(ctx, rawText, maxWidth) {
    const paragraphs = rawText.split("\n");
    const lines = [];
    for (const para of paragraphs) {
      const words = para.trim().split(/\s+/);
      if (!words[0]) {
        lines.push("");
        continue;
      }
      let current = words[0];
      for (let i = 1; i < words.length; i++) {
        const test = current + " " + words[i];
        if (ctx.measureText(test).width <= maxWidth) {
          current = test;
        } else {
          lines.push(current);
          current = words[i];
        }
      }
      lines.push(current);
    }
    return lines;
  }

  function renderStatusCanvas() {
    const canvas = el.statusCanvas;
    const ctx = canvas.getContext("2d");
    const isStory = state.maker.aspect === "9:16";
    const W = 1080;
    const H = isStory ? 1920 : 1080;

    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }

    const preset = CANVAS_PRESETS[state.maker.bgIndex % CANVAS_PRESETS.length];
    const theme = state.maker.customTheme || getMoodTheme(preset.mood, preset.idx);

    // 1. Background (Custom Gallery Image OR Mood-Matched Romantic/Sad/Neon Gradient)
    if (state.maker.customImg) {
      const img = state.maker.customImg;
      const scale = Math.max(W / img.width, H / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, theme.c1);
      grad.addColorStop(0.5, theme.cMid || "#09090e");
      grad.addColorStop(1, theme.c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Mood-colored radial glows
      const g1 = ctx.createRadialGradient(W * 0.18, H * 0.2, 20, W * 0.18, H * 0.2, W * 0.62);
      g1.addColorStop(0, theme.g1 || "rgba(255, 0, 127, 0.28)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const g2 = ctx.createRadialGradient(W * 0.84, H * 0.78, 20, W * 0.84, H * 0.78, W * 0.65);
      g2.addColorStop(0, theme.g2 || "rgba(0, 245, 212, 0.26)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // Subtle mood texture on canvas (rain lines for Sad/Bewafa, soft bokeh dots for Love)
      ctx.save();
      if (state.maker.category === "Sad" || state.maker.category === "Bewafa") {
        ctx.strokeStyle = "rgba(180, 210, 255, 0.06)";
        ctx.lineWidth = 2;
        for (let rx = -200; rx < W + 200; rx += 54) {
          ctx.beginPath();
          ctx.moveTo(rx, 0);
          ctx.lineTo(rx - 180, H);
          ctx.stroke();
        }
      } else if (state.maker.category === "Love") {
        ctx.fillStyle = "rgba(255, 160, 200, 0.06)";
        const dots = [[0.18, 0.28, 70], [0.82, 0.24, 52], [0.22, 0.72, 48], [0.78, 0.68, 86]];
        for (const [dx, dy, dr] of dots) {
          ctx.beginPath();
          ctx.arc(W * dx, H * dy, dr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 2. Dark Overlay Scrim
    if (state.maker.overlayOpacity > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${state.maker.overlayOpacity})`;
      ctx.fillRect(0, 0, W, H);
    }

    // 3. Sleek Inner Neon Frame
    const pad = 54;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 3;
    roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 42);
    ctx.stroke();

    // 4. Shayari Text (Auto-wrapped & centered) + Mood Emojis Header
    const displayText = (state.maker.text || "Write your Shayari here...").trim();
    const fontSize = state.maker.fontSize;
    if (state.maker.fontStyle === "calligraphy") {
      ctx.font = `italic 600 ${fontSize}px Georgia, serif`;
    } else if (state.maker.fontStyle === "classic") {
      ctx.font = `700 ${fontSize}px Georgia, 'Times New Roman', serif`;
    } else if (state.maker.fontStyle === "clean") {
      ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    } else {
      ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    }

    ctx.textAlign = "center";
    const maxTextWidth = W - 210;
    const lines = wrapCanvasLines(ctx, displayText, maxTextWidth);
    const lineHeight = fontSize * 1.52;
    const totalTextHeight = lines.length * lineHeight;
    let startY = (H - totalTextHeight) / 2 + fontSize * 0.55;

    // Draw Mood Emojis right above the centered Shayari
    const moodEmojiStr = state.maker.emojis || getMoodEmojis(state.maker.category, 0).strip;
    const emojiY = Math.max(pad + 92, startY - fontSize * 1.45);
    ctx.save();
    ctx.font = "64px -apple-system, BlinkMacSystemFont, 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 16;
    ctx.fillText(moodEmojiStr, W / 2, emojiY);
    ctx.restore();

    ctx.fillStyle = state.maker.textColor;
    ctx.shadowColor = "rgba(0, 0, 0, 0.78)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;

    for (const line of lines) {
      ctx.fillText(line, W / 2, startY);
      startY += lineHeight;
    }
    ctx.restore();

    // 5. Auto App Branding Footer Badge
    ctx.save();
    const cleanUrl = state.appDownloadUrl.replace(/^https?:\/\//, "");
    const badgeText = `♥ Heart Shayri  •  ${cleanUrl}`;
    ctx.font = "700 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const textW = ctx.measureText(badgeText).width;
    const pillW = Math.min(W - 140, textW + 64);
    const pillH = 56;
    const pillX = (W - pillW) / 2;
    const pillY = H - pad - pillH - 34;

    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    roundRect(ctx, pillX, pillY, pillW, pillH, 28);
    ctx.fill();

    ctx.strokeStyle = "rgba(0, 245, 212, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#00F5D4";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, W / 2, pillY + pillH / 2 + 1, pillW - 32);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function downloadStatusPng() {
    const dataUrl = el.statusCanvas.toDataURL("image/png");
    const filename = `HeartShayri_${Date.now()}.png`;

    if (window.AndroidBridge && typeof window.AndroidBridge.saveBase64Image === "function") {
      window.AndroidBridge.saveBase64Image(dataUrl, filename);
      showToast("Saved HD Status to Gallery! 🖼️");
      return;
    }

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Downloaded HD Status PNG! ⬇️");
  }

  async function shareStatusPng() {
    const dataUrl = el.statusCanvas.toDataURL("image/png");
    const shareText = buildShareMessage(state.maker.text || "Heart Shayri Status");
    const filename = `HeartShayri_Status_${Date.now()}.png`;

    if (window.AndroidBridge && typeof window.AndroidBridge.shareImageAndText === "function") {
      window.AndroidBridge.shareImageAndText(dataUrl, shareText, filename);
      return;
    }

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Heart Shayri Status",
          text: shareText,
          files: [file]
        });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: "Heart Shayri", text: shareText });
        return;
      }
    } catch {
      // User cancelled or unsupported
    }

    downloadStatusPng();
    shareOnWhatsApp(state.maker.text || "Heart Shayri");
  }

  // ---------- Tab 4: Favorites ----------
  function renderFavoritesTab() {
    const favs = state.favorites;
    el.favoritesCountSub.textContent = `${favs.length} shayari${favs.length === 1 ? "" : "s"} saved`;
    el.clearFavoritesBtn.classList.toggle("hidden", favs.length === 0);

    if (favs.length === 0) {
      el.favoritesList.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-icon">💔</div>
          <h3>No Favorites Yet</h3>
          <p>Tap the Heart button on any Shayari card to save it here for quick WhatsApp sharing.</p>
        </div>`;
      return;
    }

    el.favoritesList.innerHTML = "";
    const frag = document.createDocumentFragment();

    favs.forEach((text, idx) => {
      const cat = detectCategory(text);
      const theme = getMoodTheme(cat.id, idx);
      const moodEmoji = getMoodEmojis(cat.id, idx);

      const card = document.createElement("article");
      card.className = "mini-shayari-card";
      card.dataset.mood = cat.id;
      card.style.background = theme.bg;
      card.style.setProperty("--card-accent", theme.accent);
      card.innerHTML = `
        <div class="card-watermark-emoji" aria-hidden="true">${moodEmoji.watermark}</div>
        <div class="card-meta-row">
          <span class="mood-badge">${escapeHtml(cat.label)}</span>
          <span class="card-index-chip">Saved #${idx + 1}</span>
        </div>
        <div class="mini-emoji-center">
          <div class="shayari-emoji-strip" aria-hidden="true">${moodEmoji.strip}</div>
        </div>
        <p class="shayari-text ${getTypographyClass(text)}">${escapeHtml(text)}</p>
        <div class="card-actions-bar">
          <button class="card-action-btn" data-act="copy" type="button"><span class="act-ico">📋</span><span>Copy</span></button>
          <button class="card-action-btn is-whatsapp" data-act="whatsapp" type="button"><span class="act-ico">💬</span><span>Status</span></button>
          <button class="card-action-btn is-maker" data-act="maker" type="button"><span class="act-ico">🎨</span><span>Photo</span></button>
          <button class="card-action-btn is-fav favorited" data-act="remove" type="button"><span class="act-ico">🗑️</span><span>Remove</span></button>
        </div>
      `;

      card.querySelector('[data-act="copy"]').addEventListener("click", () => copyShayari(text, moodEmoji.strip));
      card.querySelector('[data-act="whatsapp"]').addEventListener("click", () => shareOnWhatsApp(text, moodEmoji.strip));
      card.querySelector('[data-act="maker"]').addEventListener("click", () => openInPhotoMaker(text, cat.id, idx, moodEmoji.strip));
      card.querySelector('[data-act="remove"]').addEventListener("click", () => toggleFavorite(text));

      frag.appendChild(card);
    });

    el.favoritesList.appendChild(frag);
  }

  // ---------- Tab Switching ----------
  function switchTab(tabId) {
    state.activeTab = tabId;

    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${tabId}`);
    });
    document.querySelectorAll(".bottom-nav .nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    if (tabId === "favorites") renderFavoritesTab();
    if (tabId === "maker") renderStatusCanvas();
    if (tabId === "name" && el.nameResultsList.children.length === 0) generateNameShayaris();
  }

  // ---------- Utility ----------
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ---------- Event Wiring ----------
  function bindEvents() {
    // Bottom Navigation
    document.querySelectorAll(".bottom-nav .nav-item").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    // Home Search Engine & Number Jump
    el.homeSearchInput.addEventListener("input", () => {
      const raw = el.homeSearchInput.value;
      const jumpNum = parseJumpNumber(raw);
      if (jumpNum !== null) {
        // Wait for Go/Enter on pure numbers, just update Go button label
        updateSearchUiState();
      } else {
        state.searchQuery = raw.trim();
        applyCategoryFilter(state.activeCategory, true);
      }
    });
    el.homeSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearchSubmit(el.homeSearchInput.value);
      }
    });
    el.homeSearchGoBtn.addEventListener("click", () => {
      handleSearchSubmit(el.homeSearchInput.value);
    });
    el.clearSearchBtn.addEventListener("click", clearKeywordSearch);
    el.resetSearchBannerBtn.addEventListener("click", clearKeywordSearch);
    el.trendingKeywords.querySelectorAll(".kw-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const kw = chip.dataset.kw || "";
        if (state.searchQuery.toLowerCase() === kw.toLowerCase()) {
          clearKeywordSearch();
        } else {
          runKeywordSearch(kw);
        }
      });
    });

    // Home Deck Controls
    el.prevBtn.addEventListener("click", () => navigateCard(-1));
    el.nextBtn.addEventListener("click", () => navigateCard(1));
    el.randomBtn.addEventListener("click", jumpToRandomCard);
    el.headerRandomBtn.addEventListener("click", jumpToRandomCard);
    setupSwipeGestures();

    // Unified Search & Jump Modal
    el.jumpModalBtn.addEventListener("click", openJumpModal);
    el.closeJumpModalBtn.addEventListener("click", closeJumpModal);
    el.jumpModal.addEventListener("click", (e) => {
      if (e.target === el.jumpModal) closeJumpModal();
    });
    el.confirmJumpBtn.addEventListener("click", commitJumpNumber);
    el.jumpNumberInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") commitJumpNumber();
    });
    el.jumpFirstBtn.addEventListener("click", () => {
      closeJumpModal();
      jumpToShayariNumber(1);
    });
    el.jumpRandomBtn.addEventListener("click", () => {
      closeJumpModal();
      jumpToRandomCard();
    });
    el.jumpLastBtn.addEventListener("click", () => {
      closeJumpModal();
      const total = state.searchQuery ? state.filteredShayaris.length : (state.activeCategory === "All" ? state.allShayaris.length : state.filteredShayaris.length);
      jumpToShayariNumber(Math.max(1, total));
    });

    // Retry maintenance check
    el.retryConfigBtn.addEventListener("click", loadShayariConfig);

    // Name Shayari Studio
    el.generateNameBtn.addEventListener("click", generateNameShayaris);
    el.nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") generateNameShayaris();
    });
    el.nameMoodPills.querySelectorAll(".mood-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.nameMood = chip.dataset.mood;
        el.nameMoodPills.querySelectorAll(".mood-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        generateNameShayaris();
      });
    });

    // Photo Maker Controls
    el.aspectSquareBtn.addEventListener("click", () => {
      state.maker.aspect = "1:1";
      el.aspectSquareBtn.classList.add("active");
      el.aspectStoryBtn.classList.remove("active");
      renderStatusCanvas();
    });
    el.aspectStoryBtn.addEventListener("click", () => {
      state.maker.aspect = "9:16";
      el.aspectStoryBtn.classList.add("active");
      el.aspectSquareBtn.classList.remove("active");
      renderStatusCanvas();
    });

    el.makerTextInput.addEventListener("input", () => {
      state.maker.text = el.makerTextInput.value;
      renderStatusCanvas();
    });

    el.galleryUploadInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          state.maker.customImg = img;
          el.clearBgImageBtn.classList.remove("hidden");
          updatePresetSwatchSelection();
          renderStatusCanvas();
          showToast("Gallery Photo Applied! 🖼️");
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    el.clearBgImageBtn.addEventListener("click", () => {
      state.maker.customImg = null;
      el.galleryUploadInput.value = "";
      el.clearBgImageBtn.classList.add("hidden");
      updatePresetSwatchSelection();
      renderStatusCanvas();
    });

    el.overlaySlider.addEventListener("input", () => {
      const pct = Number(el.overlaySlider.value);
      state.maker.overlayOpacity = pct / 100;
      el.overlayVal.textContent = `${pct}%`;
      renderStatusCanvas();
    });

    el.fontSizeSlider.addEventListener("input", () => {
      const px = Number(el.fontSizeSlider.value);
      state.maker.fontSize = px;
      el.fontSizeVal.textContent = `${px}px`;
      renderStatusCanvas();
    });

    el.fontStyleSelect.addEventListener("change", () => {
      state.maker.fontStyle = el.fontStyleSelect.value;
      renderStatusCanvas();
    });

    el.textColorSwatches.querySelectorAll(".color-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        state.maker.textColor = dot.dataset.color;
        el.textColorSwatches.querySelectorAll(".color-dot").forEach((d) => d.classList.remove("active"));
        dot.classList.add("active");
        renderStatusCanvas();
      });
    });

    el.downloadStatusBtn.addEventListener("click", downloadStatusPng);
    el.shareStatusBtn.addEventListener("click", shareStatusPng);

    // Favorites Clear All
    el.clearFavoritesBtn.addEventListener("click", () => {
      state.favorites = [];
      saveFavorites();
      renderFavoritesTab();
      renderActiveCard();
      showToast("Favorites Cleared");
    });
  }

  // ---------- Bootstrap ----------
  function init() {
    loadFavorites();
    buildPresetSwatches();
    bindEvents();
    loadShayariConfig();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
