# 📚 UI Components Library Guide (`src/lib`)

This guide explains how to easily integrate and use the custom React components available in the `src/lib` directory. 

> **Important Astro Rule**: Since this is an Astro project, you must use the appropriate [Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives) (like `client:load`, `client:visible`, or `client:idle`) when importing React components so their interactivity (hooks, state, event listeners) actually runs on the browser!

---

## 1. 🪪 HoloBadge (`HoloBadge.tsx`)
A highly interactive, physics-based 3D ID card that tilts towards the user's cursor with an iridescent holographic glare effect.

**Best used for:** A hero section showpiece or an "About Me" author card.

**How to integrate:**
```astro
---
import HoloBadge from "../lib/HoloBadge.tsx";
---

<!-- It's highly recommended to wrap it in a perspective container -->
<div class="flex justify-center w-full perspective-1000 py-10">
  <HoloBadge client:visible />
</div>
```

---

## 2. 💻 TerminalInfo (`TerminalInfo.tsx`)
A sleek, auto-typing terminal emulator that simulates typing predefined commands (`whoami`, `nmap`, etc.) to reveal your information. It runs automatically when it scrolls into view.

**Best used for:** A dynamic header section or replacing a static bio/about paragraph.

**How to integrate:**
```astro
---
import TerminalInfo from "../lib/TerminalInfo.tsx";
---

<div class="w-full flex justify-center py-8">
  <TerminalInfo client:visible />
</div>
```

---

## 3. ⌨️ InteractiveShell (`InteractiveShell.tsx`)
A fully playable, interactive mini-terminal. Visitors can click on it and actually type commands. (Try typing `help`, `projects`, `clear`, or `sudo rm -rf /`).

**Best used for:** An interactive easter-egg section, an alternative contact form, or a fun footer element.

**How to integrate:**
```astro
---
import InteractiveShell from "../lib/InteractiveShell.tsx";
---

<!-- Use client:load so it hydrates immediately and is ready for typing -->
<div class="w-full flex justify-center py-8">
  <InteractiveShell client:load />
</div>
```

---

## 4. 🌧️ MatrixRain (`MatrixRain.tsx`)
A completely responsive `<canvas>` element that drops cascading hacker code down the screen.

**Best used for:** A thematic background behind other elements or inside a featured project card.

**Props:**
- `color` (optional): The hex color of the text. Defaults to `#0F0` (Green).

**How to integrate:**
```astro
---
import MatrixRain from "../lib/MatrixRain.tsx";
---

<!-- Ensure the parent container has relative positioning and explicit sizing -->
<div class="relative w-full h-[400px] rounded-xl overflow-hidden">
  
  <!-- The Matrix Rain goes in the background -->
  <div class="absolute inset-0 z-0">
    <!-- You can pass your theme color to it! -->
    <MatrixRain client:visible color="var(--pink)" />
  </div>
  
  <!-- Your content goes over it -->
  <div class="relative z-10 p-8 flex justify-center items-center h-full">
    <h2 class="text-white text-3xl font-bold bg-black/50 p-4 rounded-lg">
      Welcome to the Mainframe
    </h2>
  </div>
</div>
```

---

## 5. 🔠 LetterGlitch (`LetterGlitch.tsx`)
An animated, glitching text block that scrambles characters before settling.

**How to integrate:**
```astro
---
import LetterGlitch from "../lib/LetterGlitch.tsx";
---

<div class="size-[290px]">
  <LetterGlitch 
    client:visible 
    glitchColors={["#225522", "#008F11", "#0A1A0A"]} 
    glitchSpeed={30} 
    centerVignette={false} 
    outerVignette={true} 
    smooth={true} 
  />
</div>
```
