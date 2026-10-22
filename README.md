# Alaa & Ahmed — Engagement Invitation

A luxury interactive invitation: closed silk curtain → tap → curtain parts, music starts → five sections
(Invitation · Venue · Countdown · RSVP · Our Promise). No scrolling. Plain HTML/CSS/JS — **no build step, no paid hosting.**

```
index.html          page + social-preview tags
css/style.css       all styling and animation
js/config.js        ★ YOUR SETTINGS (date, timezone, map link, RSVP link, song)
js/app.js           behaviour
assets/audio/       your song (el-leila.m4a = exact audio from your MP4, el-leila.mp3 = fallback)
assets/img/         og-image.jpg (WhatsApp/social preview), favicon.svg
assets/fonts/       self-hosted fonts (Great Vibes, Cormorant Garamond)
tools/make-og.py    optional: regenerates the preview image
```

## ⚠️ Please confirm the date
Your brief said **14 November 2026** in one place and **14 September 2026** in others. September 14, 2026
has already passed, so the site uses **14 November 2026** (a Saturday). If that's wrong, change `month` in
`js/config.js`, the date in the `<meta>` tags in `index.html`, and regenerate the preview image (see "Changing details").

## Deploy on GitHub Pages (free)
1. Create a free account at github.com → click **+ → New repository**. Name it e.g. `alaa-ahmed`. Choose **Public**. Click **Create repository**.
2. On the repository page click **uploading an existing file**. Open the project folder on your computer and drag **everything inside it**
   (`index.html`, `css`, `js`, `assets`, `tools`, `README.md`, `.nojekyll`) into the browser. Wait for uploads, then **Commit changes**.
   *(Drag the contents, not the outer folder, so `index.html` is at the top level.)*
3. Go to **Settings → Pages**. Under **Build and deployment → Source** choose **Deploy from a branch**, branch **main**, folder **/ (root)**, **Save**.
4. After ~1–2 minutes your site is live at `https://YOUR-USERNAME.github.io/alaa-ahmed/`.
5. **Fix the social-preview links (important):** open `index.html` on GitHub → pencil icon → find the block marked
   `SOCIAL PREVIEW` and replace `USERNAME` with your GitHub username and `REPOSITORY` with your repository name in all 4 places
   (`canonical`, `og:url`, `og:image`, `twitter:image`). Commit. All other paths are relative and already work in a subfolder.
6. Test the link on your phone, then share it on WhatsApp.
   WhatsApp/Facebook cache previews: if you shared the link before step 5, test with a fresh variation like `…/alaa-ahmed/?v=2`,
   or use Facebook's *Sharing Debugger* (developers.facebook.com/tools/debug) to re-scrape.

## Connect the RSVP form (Formspree – optional, free tier)
GitHub Pages can't store form replies, so RSVP uses a form service. Until connected, the RSVP button is safely disabled and
shows a setup note — it never pretends to save.
1. Sign up at **formspree.io** → **New form** → name it "Engagement RSVP" → copy the form URL (looks like `https://formspree.io/f/abcdwxyz`).
2. Open `js/config.js` on GitHub, set `rsvpEndpoint: "https://formspree.io/f/abcdwxyz"`, commit.
3. Send yourself a test RSVP. Formspree emails you every reply and keeps them in its dashboard. (First submission asks you to confirm your email.)
That URL is public by design — never put passwords or secret API keys in this repository.

## Changing details (all in `js/config.js`)
- **Date/time:** `year/month/day`, `startTime`, `endTime` (24-hour). Text on the page updates automatically.
  The `<meta>` description in `index.html` and the image `assets/img/og-image.jpg` contain the date too — update the meta text, and regenerate the image with `python3 tools/make-og.py` (or ask me to).
- **Timezone:** `timezone: "Africa/Cairo"`. The countdown uses this zone, not the guest's phone. Change it if the venue is elsewhere.
- **Venue name:** `venueName` (stays "Our Celebration Venue" until you confirm the real name). **Map link:** `mapsUrl`.
- **Song:** replace the files in `assets/audio/` (keep names, or edit `audioSources`). Use `.m4a` or `.mp3`; keep under ~5 MB.
- **Promise sentence / couple names:** edit `index.html` (the sentence appears in two places: `.quote` and `#promise`).
- **Preview the "event day" / "after" states:** add `?now=2026-11-14T17:00:00Z` (or `…T21:00:00Z`) to the URL.

## What was tested vs. what still needs you
**Tested here (headless Chromium, phone/desktop/landscape sizes):** closed curtain on load; open + animation; audio starts from the open tap and
continues across sections; music toggle; all five sections; home button; exact venue URL; exact promise text; countdown values and timezone maths
(18:00 Cairo = 16:00 UTC in November), "during" and "after" messages; RSVP validation, guest limits, success and error states (using a mock endpoint);
no scrolling or horizontal overflow at 390×844, 360×640, 667×375, 1440×900; reduced-motion; all assets load; no console errors; share image created.

**Not possible for me to verify — please check after publishing:**
- Real iPhone Safari, Android Chrome and the WhatsApp in-app browser (test the music starts on tap, and the keyboard when typing in RSVP).
- That the social preview appears in WhatsApp (needs the live public URL and step 5).
- A real Formspree submission arriving in your inbox.
- The real venue name/timezone, and the final date.
