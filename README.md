# ✦ [Gachapedia](https://reinbowl.github.io/Gachapedia/)

**A gacha-style random Wikipedia explorer.**

Every time you open the book, five random Wikipedia articles are drawn from the archives, you never know what you'll get.

---

## How to use

**Opening the book**

Click or tap the book on the main screen. The cover flips open, the archives are consulted, and five random articles are revealed.

**Reading the pages**
- **Swipe left / right** (touch) or **click and drag** horizontally (desktop) to move between pages
- **Scroll up / down** within a page to read longer articles
- Use the **Prev / Next** buttons at the bottom of each page to navigate
- Each page links to the full Wikipedia article via **Wikipedia ↗**

**Closing**
Click or tap anywhere on the dark area outside the page to return to the main screen. You can also press **Escape** on a keyboard.

**Choosing your Scribe**
Before opening the book, select a scribe from the dropdown:

| Scribe | Speed | Quality |
|---|---|---|
| 📜 Swift Scribe | Instant | Uses raw article excerpt |
| 🪶 Apprentice Scribe | Fast | AI-summarised (small model) |
| 📖 Master Scribe | Slower | AI-summarised (full model) |

The coloured dot beside the dropdown shows scribe status — **orange** loading, **green** ready, **red** unavailable.

---

## Tech

- Vanilla HTML / CSS / JS — no framework, no build step
- Summarisation runs entirely in the browser via [Transformers.js](https://github.com/xenova/transformers.js) in a Web Worker (no server, no API key)
- Article data from the [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/)
