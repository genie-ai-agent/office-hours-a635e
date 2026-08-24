window.OH = {
  modes: [
    {
      tag: "Mode 01",
      tint: "var(--blue)",
      title: "Book a live 1:1",
      blurb: "A video room at a time you agreed to. Paid when they book.",
      points: [
        "Askers pick from your open slots, in their own timezone",
        "15 / 30 / 45 / 60 min, each priced separately",
        "Their question arrives with the booking, so you can prep"
      ],
      priceHint: "You set: price per duration \u00b7 weekly cap \u00b7 buffer between calls"
    },
    {
      tag: "Mode 02",
      tint: "var(--pink)",
      title: "Request a jelly",
      blurb: "No calendar. They write the question, you answer it as a jelly.",
      points: [
        "600 characters, up to 3 attachments",
        "Accept or decline inside a window you set",
        "Answer lands private; they can make it a public sample"
      ],
      priceHint: "You set: price per question \u00b7 response window \u00b7 weekly cap"
    }
  ],

  flows: {
    host: [
      { h: "Turn it on", p: "One toggle, plus a payout account." },
      { h: "List topics", p: "Up to 8 chips. This is what search indexes." },
      { h: "Set two prices", p: "Live rate and jelly rate. Change them any time." },
      { h: "Publish availability", p: "Recurring weekly windows, synced to your calendar." },
      { h: "Answer things", p: "Calls hit your calendar, questions hit an inbox." },
      { h: "Get paid", p: "Funds release 24h after you deliver." }
    ],
    asker: [
      { h: "Find someone", p: "Browse by topic, or land there from a jelly." },
      { h: "Pick a mode", p: "Live if you want back-and-forth. Jelly if you just need the answer." },
      { h: "Write the question", p: "Required either way." },
      { h: "Pay up front", p: "Held in escrow until the host delivers." },
      { h: "Show up or wait", p: "Join link, or a countdown that auto-refunds." },
      { h: "Rate it", p: "One tap. Feeds the reply-speed badge." }
    ]
  },

  topics: [
    { label: "Domain investing", cls: "pill-yellow" },
    { label: "Registrar APIs", cls: "pill-blue" },
    { label: "Cold outbound", cls: "pill-pink" },
    { label: "Pricing SaaS", cls: "pill-mint" },
    { label: "Solo founder ops", cls: "pill-lav" },
    { label: "Landing pages", cls: "pill-yellow" }
  ],

  anno: [
    { c: "var(--yellow)", t: "Topics, not a bio", d: "Each chip is an object with its own demand data. You learn which ones sell." },
    { c: "var(--blue)", t: "Reply-speed badge", d: "Median delivery over your last 10 jellies. Earned, not typed." },
    { c: "var(--pink)", t: "Prices always visible", d: "No 'contact for rates'. Sold out for the week says so." },
    { c: "var(--mint)", t: "Public sample jellies", d: "Answers askers made public become your portfolio." },
    { c: "var(--lav)", t: "Real scarcity", d: "Weekly caps mean you never wake up owing 40 answers." }
  ],

  fees: [
    { h: "Platform fee", p: "10% of gross, taken at capture. No tiers." },
    { h: "Card processing", p: "~2.9% + $0.30, passed through at cost." },
    { h: "Payouts", p: "Held 24h after delivery, then daily or weekly. Free." },
    { h: "Refunds", p: "Platform fee returned in full, so a cancel costs nothing." }
  ],

  specs: [
    {
      title: "Data model",
      body: "Six objects. Everything else is a view over these.",
      code: "Profile      id, user_id, headline, payout_status, timezone, is_open\nTopic        id, profile_id, label, example_prompt, demand_score\nOffer        id, profile_id, kind(live|jelly), duration_min,\n             price_cents, currency, weekly_cap, response_window_h,\n             is_paused\nBooking      id, offer_id, asker_id, slot_start, slot_end,\n             question, room_url, state, price_locked_cents\nJellyRequest id, offer_id, asker_id, question, attachments[],\n             due_at, answer_jelly_id, visibility, state\nPayment      id, subject_type, subject_id, amount_cents,\n             fee_cents, state, processor_ref, released_at"
    },
    {
      title: "State machines",
      body: "Every dollar rides a state transition. No manual money moves.",
      code: "Booking\n  requested -> confirmed -> in_progress -> completed -> released\n            \\-> declined      \\-> no_show_asker -> released\n            \\-> canceled       \\-> no_show_host  -> refunded\n\nJellyRequest\n  submitted -> accepted -> answered -> delivered -> released\n            \\-> declined -> refunded\n            \\-> expired  -> refunded  (window lapsed)"
    },
    {
      title: "Payments",
      list: [
        "Connected accounts: the platform never holds funds directly",
        "Authorize on booking, capture on delivery, release 24h later",
        "Price snapshotted at purchase, so later edits don't retro-apply",
        "Idempotency keys everywhere, so a double-tap can't double-charge"
      ]
    },
    {
      title: "Scheduling",
      list: [
        "Availability stored as RRULE in host time, expanded to slots on read",
        "Slots always rendered in asker-local time with the offset shown",
        "Buffer between calls, 4h minimum lead time, two-way calendar sync",
        "Weekly cap enforced at slot generation, not just at checkout"
      ]
    },
    {
      title: "The live room",
      list: [
        "JellyJelly's video stack; join link opens 10 min before start",
        "Shared timer, warnings at 5 and 1 min, extend in 15-min blocks",
        "No-show button unlocks 8 min in and drives the refund path",
        "Question pinned in a side panel so nobody re-explains the setup"
      ]
    },
    {
      title: "The jelly answer loop",
      list: [
        "Requests land in their own inbox, sorted by time-to-due",
        "Declining refunds instantly and costs the host nothing",
        "Recording opens the normal composer with the question pinned",
        "Auto-expire refunds and dings the reply-speed badge"
      ]
    },
    {
      title: "Firehose integration",
      body: "Nobody fills in a topics form. The firehose already knows what you talk about, so the profile arrives pre-drafted.",
      list: [
        "<strong>Topics.</strong> Rank <code>topics[]</code> across a host's last 200 jellies, take the top four as draft chips. Network-wide counts become <code>demand_score</code>.",
        "<strong>Price.</strong> <code>max(rate_table[topic])</code> plus <code>min(60, 2 &times; jelly_count)</code>, rounded to $5. Jelly answers default to 28% of live. The host's number always wins.",
        "<strong>Playback.</strong> An answer is just a jelly. <code>/embed?ids=&lt;id&gt;</code> ships <code>frame-ancestors *</code>, so Office Hours never hosts video, and the jellies on this page really play.",
        "<strong>Server-side only.</strong> No CORS header and monetized fields need a token, so reads run on the backend. This page tries live, then falls back to a dated snapshot."
      ],
      code: "GET /v3/jelly/search?sort_by=date&ascending=false&page=1&page_size=50\nHost: api.jellyjelly.com\n\n{ status, total, page, page_size, jellies: [ {\n    id, post_type, started_by_id,\n    participants: [{ id, username, full_name, pfp_url }],\n    title, summary, topics: [\"startups\",\"tech\"],\n    thumbnail_url, transcript_overlay, posted_at\n} ] }\n\n-- derived by the Office Hours indexer --\nhost_draft  username, topics[4], jelly_count,\n            suggested_live_cents, suggested_jelly_cents,\n            reel[3] -> {jelly_id, title, thumbnail_url}\ntopic_stats topic, count_30d, base_rate_cents"
    },
    {
      title: "Discovery",
      list: [
        "Topic pages ranked on rating, reply speed, and open availability",
        "Search over topic labels and example prompts, not full-text bios",
        "'Office Hours open' badge on the profile and on every jelly",
        "Demand per topic surfaced back to the host: views, starts, cap-blocks"
      ]
    },
    {
      title: "Trust and safety",
      list: [
        "Questions screened before they reach the host; permanent blocks",
        "Per-profile keyword auto-decline, plus a no-legal/medical disclaimer",
        "Disputes go to a human queue with delivery proof attached",
        "Per-asker rate limits, so nobody spam-buys attention"
      ]
    }
  ],

  policies: [
    { pill: "pill-blue", h: "Asker cancels", p: "Full refund up to 24h out. Inside 24h, 50% to the host. Inside 2h, none." },
    { pill: "pill-pink", h: "Host cancels", p: "Full refund plus a credit. Repeat cancels pause the offer." },
    { pill: "pill-yellow", h: "No-show", p: "Host waits 8 min and keeps the fee. Host no-show refunds itself." },
    { pill: "pill-mint", h: "Not delivered", p: "Window lapses, payment refunds itself. No support ticket." }
  ],

  roadmap: [
    {
      pill: "pill-mint", label: "Phase 1", title: "Jellies only",
      items: ["Profile toggle + topics", "One jelly offer, one price", "Question inbox", "Payment hold + release", "Auto-refund on expiry"]
    },
    {
      pill: "pill-blue", label: "Phase 2", title: "Live 1:1",
      items: ["Availability + calendar sync", "Multi-duration pricing", "Room, timer, reminders", "No-show flow", "Reschedule once"]
    },
    {
      pill: "pill-lav", label: "Phase 3", title: "Scale it",
      items: ["Topic discovery pages", "Public sample jellies", "Group office hours", "Bundles", "Host analytics"]
    }
  ],

  demos: {
    live: {
      title: "Book a live 1:1",
      steps: ["Pick 30 min, Thursday 4:00pm, in your timezone", "Say what you want out of it", "$120 held until the call completes", "Reminders at 24h and 10m"],
      receipt: "OFFER    live \u00b7 30 min\nSLOT     Thu 4:00pm PT (7:00pm ET)\nAMOUNT   $120.00\nFEE      $12.00 platform + $3.78 card\nSTATE    authorized \u2192 held\nRELEASE  24h after completed"
    },
    jelly: {
      title: "Request a jelly",
      steps: ["Type the question, up to 600 characters", "Attach up to 3 files or links", "$35 held until the answer lands", "Auto-refund if the 3-day window lapses"],
      receipt: "OFFER    jelly answer\nQUESTION 412 / 600 chars\nDUE      in 3 days 0 hrs\nAMOUNT   $35.00\nFEE      $3.50 platform + $1.32 card\nSTATE    submitted \u2192 awaiting accept"
    }
  }
};
