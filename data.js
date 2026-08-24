window.OH = {
  modes: [
    {
      tag: "Mode 01",
      tint: "var(--blue)",
      title: "Book a live 1:1",
      blurb: "A real-time video room on JellyJelly at a time you actually agreed to. Paid when they book, not after.",
      points: [
        "Host publishes weekly availability; askers pick from open slots in their own timezone",
        "Durations you choose: 15 / 30 / 45 / 60 min, each priced separately",
        "Question sent with the booking so you can prep in 60 seconds",
        "Auto reminders at 24h and 10m, join link in both",
        "Optional recording saved privately to both accounts"
      ],
      priceHint: "You set: price per duration · max bookings per week · buffer between calls"
    },
    {
      tag: "Mode 02",
      tint: "var(--pink)",
      title: "Request a jelly",
      blurb: "No calendar, no timezone math. They write the question, you answer it as a jelly whenever you sit down to record.",
      points: [
        "Question capped at 600 characters plus up to 3 attachments (image, link, doc)",
        "You accept or decline inside a response window you set (default 3 days)",
        "Answer recorded as a jelly, delivered to their inbox, private by default",
        "Asker can mark it public so it lives on your profile as a sample",
        "One free follow-up question per answered jelly, 48h window"
      ],
      priceHint: "You set: price per question · response window · weekly request cap · auto-decline keywords"
    }
  ],

  flows: {
    host: [
      { h: "Turn on Office Hours", p: "One toggle in your JellyJelly profile. Connect a payout account so money can actually land somewhere." },
      { h: "List your topics", p: "Up to 8 topic chips, each with a one-line 'what good questions look like'. This is what search and recommendations index." },
      { h: "Set two prices", p: "A price per live duration and a price per jelly answer. Change them any time; existing bookings keep the price they were sold at." },
      { h: "Publish availability", p: "Recurring weekly windows, plus blackout dates. Google / Apple calendar sync stops double-booking." },
      { h: "Answer things", p: "Live calls show up in your calendar. Jelly requests queue in an inbox with a countdown to your response window." },
      { h: "Get paid out", p: "Funds release 24h after a completed call or a delivered jelly, then pay out on your normal schedule." }
    ],
    asker: [
      { h: "Find someone", p: "Browse by topic or land on a profile from a jelly you already watched. Price and reply speed are visible before you tap anything." },
      { h: "Pick your mode", p: "Book a live slot if you want back-and-forth. Request a jelly if you just need the answer and don't want to schedule." },
      { h: "Write the question", p: "Required for both modes. Live bookings without a question get a nudge; hosts can require one." },
      { h: "Pay up front", p: "Card or wallet. Full amount is authorized and held; the host only gets it once they deliver." },
      { h: "Show up or wait", p: "Live: reminders and a join link. Jelly: a countdown to the host's response window, refunded automatically if it lapses." },
      { h: "Rate it", p: "One tap after delivery. Ratings feed the host's reply-speed badge and the topic leaderboards." }
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
    { c: "var(--yellow)", t: "Topics, not a bio", d: "Each chip is a first-class object with its own examples and its own demand data. Askers filter on them; you learn which ones actually sell." },
    { c: "var(--blue)", t: "Reply-speed badge", d: "Median delivery time over your last 10 jellies. Earned, not typed in, so it can be trusted." },
    { c: "var(--pink)", t: "Two prices, always visible", d: "No 'contact for rates'. If an offer is paused or sold out for the week, the button says so instead of disappearing." },
    { c: "var(--mint)", t: "Public sample jellies", d: "Answers an asker chose to make public become your portfolio. Best conversion tool on the page." },
    { c: "var(--lav)", t: "Scarcity that's real", d: "Weekly caps mean the calendar shows what's genuinely left, and you never wake up to 40 owed answers." }
  ],

  fees: [
    { h: "Platform fee", p: "10% of gross, taken at capture. Same rate for live and jelly, no tiers to explain." },
    { h: "Card processing", p: "~2.9% + $0.30 per transaction, passed through at cost via the payments processor." },
    { h: "Payouts", p: "Held 24h after delivery, then daily or weekly to a connected bank account. Free." },
    { h: "Refunds", p: "Platform fee is returned on any full refund, so a canceled booking costs the asker nothing." }
  ],

  specs: [
    {
      title: "Data model",
      body: "Six objects carry the whole product. Everything else is a view over these.",
      code: "Profile      id, user_id, headline, payout_status, timezone, is_open\nTopic        id, profile_id, label, example_prompt, demand_score\nOffer        id, profile_id, kind(live|jelly), duration_min,\n             price_cents, currency, weekly_cap, response_window_h,\n             is_paused\nBooking      id, offer_id, asker_id, slot_start, slot_end,\n             question, room_url, state, price_locked_cents\nJellyRequest id, offer_id, asker_id, question, attachments[],\n             due_at, answer_jelly_id, visibility, state\nPayment      id, subject_type, subject_id, amount_cents,\n             fee_cents, state, processor_ref, released_at"
    },
    {
      title: "State machines",
      body: "Every dollar is tied to a state transition. No manual money moves.",
      code: "Booking\n  requested -> confirmed -> in_progress -> completed -> released\n            \\-> declined      \\-> no_show_asker -> released\n            \\-> canceled       \\-> no_show_host  -> refunded\n\nJellyRequest\n  submitted -> accepted -> answered -> delivered -> released\n            \\-> declined -> refunded\n            \\-> expired  -> refunded  (window lapsed)"
    },
    {
      title: "Payments",
      list: [
        "Connected-account model: host onboards to the processor, platform never touches funds directly",
        "Authorize + capture on booking, funds held on the platform balance until delivery",
        "Price is snapshotted onto the booking at purchase; later price edits don't retro-apply",
        "Application fee taken at capture, reversed on refund",
        "Idempotency keys on every create so a double-tap can't double-charge",
        "Payout blocked until identity verification clears; the Office Hours toggle stays off until then"
      ]
    },
    {
      title: "Scheduling",
      list: [
        "Availability stored as recurring rules (RRULE) in the host's timezone, expanded to slots on read",
        "Slots rendered in the asker's local timezone with the offset shown, always",
        "Configurable buffer between calls and minimum lead time (default 4h)",
        "Two-way sync with Google / Apple calendar; external busy blocks hide slots",
        "Reschedule allowed once per booking, at least 12h out, no fee",
        "Weekly cap enforced at slot-generation time, not just at checkout"
      ]
    },
    {
      title: "The live room",
      list: [
        "Runs on JellyJelly's existing video stack; join link valid from 10 min before start",
        "Timer visible to both sides, 5-minute and 1-minute warnings",
        "Host can extend in 15-min increments; the extension is charged at the same per-minute rate",
        "Both sides get a no-show button that unlocks 8 min in and drives the refund path",
        "Optional recording, off by default, requires both to consent, stored private to the two accounts",
        "Question and any attachments pinned in a side panel so nobody re-explains the setup"
      ]
    },
    {
      title: "The jelly answer loop",
      list: [
        "Request lands in an Office Hours inbox, separate from DMs, sorted by time-to-due",
        "Accept / decline within the response window; declining refunds instantly and costs the host nothing",
        "Recording opens the normal jelly composer with the question pinned on screen",
        "Delivery notifies the asker and starts the 48h free-follow-up window",
        "Asker can flip the answer public; host approves once, then it appears as a profile sample",
        "Auto-expire job refunds and posts a soft strike against the reply-speed badge"
      ]
    },
    {
      title: "Firehose integration",
      body: "Office Hours has a cold-start problem: nobody wants to fill in a topics form. The JellyJelly firehose already knows what you talk about, so the profile arrives pre-drafted and the host just edits.",
      list: [
        "<strong>Topic inference.</strong> Union the <code>topics[]</code> across a host's last 200 jellies, rank by count, take the top four as draft &ldquo;ask me about&rdquo; chips. Network-wide counts from the same query become <code>Topic.demand_score</code>.",
        "<strong>Price suggestion.</strong> <code>base = max(rate_table[topic])</code> over the draft topics, plus a volume bump of <code>min(60, 2 &times; jelly_count)</code>, rounded to $5. Jelly answers default to 28% of the live rate. Suggestions only; the host's number always wins.",
        "<strong>Proof of work.</strong> The three newest titled jellies render as a reel on the profile straight from <code>title</code>, <code>summary</code>, and <code>thumbnail_url</code>, so an asker hears the voice before paying.",
        "<strong>Answer delivery.</strong> An answer is just a jelly. <code>JellyRequest.answer_jelly_id</code> holds the id; playback uses the existing embed (<code>/embed?ids=&lt;jelly_id&gt;</code>) so paid answers get the same karaoke captions as the rest of the app.",
        "<strong>Discovery ranking.</strong> <code>sort_by=likes|views|date</code> with <code>start_date</code> gives a recency-weighted signal per topic. Cache page one per topic for ten minutes; none of this needs to be real-time.",
        "<strong>Auth.</strong> Reads are public, but monetized fields (<code>price</code>, <code>pay_to_watch</code>, video URLs) need <code>Authorization: Token</code>. So every firehose call runs server-side and the token never touches the client.",
        "<strong>Embeds are the live path.</strong> <code>/embed?ids=a,b&amp;bg=%23hex&amp;subs=karaoke</code> ships <code>frame-ancestors *</code>, so the player frames from any origin. That's why the jellies on this page really play: ids come from the firehose, pixels and captions come from JellyJelly at view time. Answer jellies reuse the same frame, so Office Hours never has to host video.",
        "<strong>Thumbnails expire.</strong> <code>thumbnail_url</code> is a signed CloudFront URL with an <code>Expires</code> stamp, so it can't be cached in a static build for long. Store the <code>jelly_id</code>, re-resolve the thumbnail on read, and let the embed cover playback.",
        "<strong>CORS.</strong> The endpoint sends no <code>Access-Control-Allow-Origin</code>, so a browser on another origin can't read it directly. This page demonstrates that honestly: it attempts a live read on load and falls back to a dated snapshot when blocked. Production reads it from the backend and serves its own JSON."
      ],
      code: "GET /v3/jelly/search?sort_by=date&ascending=false&page=1&page_size=50\nHost: api.jellyjelly.com\n\n{ status, total, page, page_size, jellies: [ {\n    id, post_type, started_by_id,\n    participants: [{ id, username, full_name, pfp_url, wobbles_badge_no }],\n    title, summary, topics: [\"startups\",\"tech\"],\n    thumbnail_url, transcript_overlay, posted_at\n} ] }\n\n-- derived by the Office Hours indexer --\nhost_draft  username, topics[4], jelly_count,\n            suggested_live_cents, suggested_jelly_cents,\n            reel[3] -> {jelly_id, title, thumbnail_url}\ntopic_stats topic, count_30d, base_rate_cents"
    },
    {
      title: "Discovery",
      list: [
        "Topic pages listing open hosts, sorted by a blend of rating, reply speed, and availability",
        "Search over topic labels and example prompts, not full-text bios",
        "'Office Hours open' badge on the normal JellyJelly profile and on every jelly the host posts",
        "Public sample jellies are the primary conversion surface, so they get their own carousel",
        "Demand signal per topic: views, started checkouts, declined-for-cap, surfaced back to the host"
      ]
    },
    {
      title: "Trust and safety",
      list: [
        "Questions screened for abuse before they reach the host; host can block an asker permanently",
        "Keyword auto-decline list per profile, plus a hard 'no legal / medical / financial advice' disclaimer",
        "Both sides can report after delivery; disputes go to a human queue with the recording as evidence",
        "Rate limits on requests per asker per host per week to stop spam-buying attention",
        "Chargeback playbook: delivery proof (room log or delivered jelly) attached automatically"
      ]
    }
  ],

  policies: [
    { pill: "pill-blue", h: "Asker cancels", p: "Full refund up to 24h before the slot. Inside 24h, 50% to the host. Inside 2h, no refund." },
    { pill: "pill-pink", h: "Host cancels", p: "Always a full refund plus a credit toward the next booking. Repeat cancels pause the offer." },
    { pill: "pill-yellow", h: "No-show", p: "Host waits 8 min, taps no-show, keeps the fee. Host no-show refunds in full, automatically." },
    { pill: "pill-mint", h: "Jelly not delivered", p: "Response window lapses, payment refunds itself. No support ticket, no chasing." }
  ],

  roadmap: [
    {
      pill: "pill-mint", label: "Phase 1", title: "Jellies only",
      items: ["Profile toggle + topics", "One jelly offer with a price", "Question inbox, accept / decline", "Payment hold + release", "Auto-refund on expiry"]
    },
    {
      pill: "pill-blue", label: "Phase 2", title: "Live 1:1",
      items: ["Availability rules + calendar sync", "Multi-duration pricing", "Room, timer, reminders", "No-show flow", "Reschedule once"]
    },
    {
      pill: "pill-lav", label: "Phase 3", title: "Scale it",
      items: ["Topic discovery pages", "Public sample jellies", "Group office hours (1:many)", "Bundles and subscriptions", "Host analytics on demand per topic"]
    }
  ],

  faq: [
    { q: "Why charge before the answer exists?", a: "Free questions are infinite and worthless. Paying up front filters for people who actually want your time, and the money sits in escrow until you deliver, so it's fair both ways." },
    { q: "Can I run only one of the two modes?", a: "Yes. Each offer is independent and can be paused. Plenty of hosts will never open a calendar and only ever answer jellies." },
    { q: "What if a question is out of scope?", a: "Decline it. The asker is refunded in full, it costs you nothing, and declines for scope don't touch your reply-speed badge." },
    { q: "Do answers become public content?", a: "Only if the asker opts in and you approve. Default is private to the two of you." },
    { q: "Can I set different prices per topic?", a: "Phase 3. Day one, pricing lives on the offer, not the topic, to keep the profile readable." },
    { q: "What stops someone booking 20 slots?", a: "Weekly caps, per-asker rate limits, and minimum lead time. The calendar only ever shows what you're actually willing to sell." }
  ],

  demos: {
    live: {
      title: "Book a live 1:1",
      steps: ["Pick 30 min, Thursday 4:00pm (shown in your timezone)", "Write what you want out of it", "Pay $120, held until the call completes", "Reminders at 24h and 10m with the join link"],
      receipt: "OFFER    live · 30 min\nSLOT     Thu 4:00pm PT (7:00pm ET)\nAMOUNT   $120.00\nFEE      $12.00 platform + $3.78 card\nSTATE    authorized → held\nRELEASE  24h after completed"
    },
    jelly: {
      title: "Request a jelly",
      steps: ["Type the question, up to 600 characters", "Attach up to 3 files or links", "Pay $35, held until the answer lands", "Auto-refund if the 3-day window lapses"],
      receipt: "OFFER    jelly answer\nQUESTION 412 / 600 chars\nDUE      in 3 days 0 hrs\nAMOUNT   $35.00\nFEE      $3.50 platform + $1.32 card\nSTATE    submitted → awaiting accept"
    }
  }
};
