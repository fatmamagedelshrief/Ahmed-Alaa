/* ============================================================
   INVITATION SETTINGS  –  the only file you normally need to edit
   ============================================================ */
window.INVITE_CONFIG = {
  // ---- Event ------------------------------------------------
  // NOTE: your brief mentioned both 14 November and 14 September 2026.
  // 14 September 2026 has already passed, so November 14 is used.
  // Change these three numbers if the date is different.
  year: 2026, month: 11, day: 14,          // month: 1–12
  startTime: "18:00",                       // 24-hour clock, venue's local time
  endTime:   "22:00",

  // ---- TIMEZONE (IMPORTANT) --------------------------------
  // The countdown is calculated in THIS timezone, not the guest's phone.
  // Egypt = "Africa/Cairo". Other examples: "Asia/Riyadh", "Asia/Dubai",
  // "Europe/London", "America/New_York".  (List: search "IANA time zones")
  timezone: "Africa/Cairo",

  // ---- Venue -----------------------------------------------
  venueName: "Our Celebration Venue",       // only change once the real name is confirmed
  mapsUrl: "https://maps.app.goo.gl/fqpMrDzKqkTHJ3HKA?g_st=aw",

  // ---- Music -----------------------------------------------
  // First file that the guest's browser can play is used.
  audioSources: [
    { src: "assets/audio/el-leila.m4a", type: "audio/mp4" },
    { src: "assets/audio/el-leila.mp3", type: "audio/mpeg" }
  ],
  musicVolume: 0.85,

  // ---- RSVP backend ----------------------------------------
  // Paste your Formspree form URL here, e.g. "https://formspree.io/f/abcdwxyz"
  // (This URL is public by design – it is NOT a secret key.)
  // Leave empty "" until connected: the form is then safely disabled.
  rsvpEndpoint: "",
  maxGuests: 10,

  // ---- Countdown messages -----------------------------------
  messageDuring: "Tonight, we celebrate.",
  messageAfter:  "A beautiful beginning, forever remembered."
};
