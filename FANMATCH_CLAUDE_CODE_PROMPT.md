# Build Prompt: "FanMatch" — FIFA World Cup 2026 Fan Identity PWA

## Context
We're building a demo PWA for the MIT Sloan Sports Analytics Conference (SSAC) 2026 Hackathon. The theme is growing female football fandom through the FIFA Men's World Cup 2026. This is a DEMO/PROTOTYPE — it needs to look polished and be interactive, but does not need a real backend. All data can be stored in React state. The goal is to present this to judges in a 10-minute presentation as a product concept backed by real audience research.

## Core Concept
A gamified identity quest that matches fans (and their households) with FIFA World Cup 2026 players based on shared values, personality, and life goals. The experience captures high-value psychographic and behavioral data through fun interactions — making fans feel seen, not surveyed.

**Working name:** "FanMatch" — but the in-app headline is "Find Your World Cup Match"

**Target user:** Women aged 25-44 (especially moms), but the experience works for ANYONE. Designed FROM the female fan perspective, inclusive of all genders and demographics. A dad should enjoy this. A teenager should enjoy this. But the questions, tone, values, and player stories are shaped by what the research says women fans actually want: identity, stories, community, and being seen.

**The "Beyond the Pitch" thread:** The player matching isn't just "which player are you." It's "which player shares your VALUES and LIFE STORY." The results emphasize what players do OFF the pitch — leadership, advocacy, family, community. This addresses the #1 research finding: women fans connect with player stories and identity, not just athletic performance.

**Key research insight driving the product:**
- 94.3% of women are primary or shared household purchase decision-makers
- #1 brand failure: "Products don't fit my needs or lifestyle" (2,200+ responses)
- #2 brand failure: "Marketing feels inauthentic" (1,800+ responses)  
- 29-44 age group: highest buying power ($75K+) AND highest feeling of being underserved (67.6%)
- Top event motivation: Entertainment (30%) > Supporting team (26%) > Having fun day out (23%) > Socializing (19%)
- #1 ask from women fans: "Better coverage of women's sports" + "More representation of women in leadership"
- Women want to see player STORIES, not just stats. Identity > performance.

## Tech Stack & Build Constraints
- **React** single-page PWA — **ONE .jsx file, default export**
- **Tailwind CSS** utility classes ONLY (no custom CSS files — we don't have a Tailwind compiler, only pre-defined utility classes)
- All state managed in React (useState, useReducer) — **NO localStorage, NO sessionStorage** (these APIs are blocked in our environment)
- No backend, no external APIs, no fetch calls
- Mobile-first responsive design (375px primary, scales to desktop)
- Smooth transitions between screens using CSS transitions or simple state-based routing
- **Import only:** `import { useState, useEffect, useRef } from "react"` — no other React imports needed
- Available libraries if needed: `lucide-react` for icons
- Google Fonts via `<link>` tag rendered inside the component
- **This will be a large file (~800-1200 lines). That's fine. Build it complete. Do not split into multiple files.**

## Design Direction
- **Aesthetic:** Modern, bold, warm — NOT corporate or sterile. Think FIFA meets Spotify Wrapped meets a personality quiz app.
- **Colors:** Deep navy/dark background (#0a1628) with vibrant accent gradients (gold #ffd166, coral #ff6b6d, teal #00d4aa). White text on dark. Define these as JS constants at the top of the file.
- **Typography:** Use Google Font 'Plus Jakarta Sans' (import via link tag inside component). Bold 700/800 weights for headers, 400/500 for body.
- **Feel:** Each screen should feel like swiping through stories on Instagram — visual, fast, one action per screen. Progress bar at top showing how far through the experience they are.
- **Animations:** Use CSS transitions via Tailwind classes (transition-all, duration-300, etc). For the results reveal, use a simple keyframe animation defined in a `<style>` tag inside the component.
- **Styling approach:** Use Tailwind utility classes as the primary styling method. For any colors not in Tailwind's default palette, use inline style objects. Keep it clean — Tailwind for layout/spacing/typography, inline styles only for custom colors and gradients.

## App Structure — Screen by Screen

### Screen 1: Welcome / Landing
- Hero text: "Find Your World Cup Match" (large, bold)
- Subtext: "Discover which FIFA 2026 players share your values, your vibe, and your game-day energy."
- Subtext below: "2 minutes. 100% fun. Your World Cup identity awaits."
- Visual: Abstract soccer-themed gradient background with subtle geometric patterns or a silhouette motif
- CTA button: "Let's Go →" (large, rounded, gold gradient)
- Below CTA: "🏆 Over [X,000] fans matched" (social proof, hardcoded number)
- Below that: Small FIFA 2026 / Wasserman / SSAC branding strip

### Screen 2: "First, who's playing?" (Household Setup)
This is a critical data capture screen disguised as a fun setup.

- Header: "Who's on your team today?"
- Subtext: "Playing solo or bringing the squad? This helps us match everyone."
- Selection cards (tap to select ONE):
  - 👤 "Just Me" 
  - 👫 "Me + Partner"
  - 👨‍👩‍👧 "Me + Kids" 
  - 👨‍👩‍👧‍👦 "The Whole Crew" (partner + kids)
  - 🎉 "Friends / Watch Party"
- Each card is a rounded rectangle with emoji, label, and subtle glow on selection
- If "Me + Kids" or "Whole Crew" selected, show a quick follow-up: "How many little fans?" with a simple +/- stepper (1-5)
- CTA: "Next →"

**Data captured:** Household composition, presence of children, social viewing context (iso/duo/social fan typing)

### Screen 3: "Your Game-Day Vibe" (3-4 Quick Taps)
A series of visual "this or that" cards. Show two options side by side, user taps one. Each pair should be visually distinct (different background image or icon) and feel fast/fun.

**Pair 1:** "How do you watch?"
- 📺 "Couch Commander" (home viewing) vs 🏟️ "Stadium Energy" (live attendance)

**Pair 2:** "What pulls you in?"  
- ⚡ "The plays, the goals, the drama" (performance-driven) vs 💬 "The stories, the people, the meaning" (narrative-driven)

**Pair 3:** "Game-day fuel?"
- 🍕 "Pizza & snacks — keep it classic" vs 🥗 "Healthy spread — fuel the day right"

**Pair 4:** "Your Saturday energy?"
- 🎯 "Planned & purposeful" vs 🌊 "Go with the flow"

Each selection animates a small "+XP" badge floating up: "+10 XP ✨"

Running XP counter visible in top-right corner.

**Data captured:** Viewing preference (broadcast vs in-person), engagement driver (performance vs narrative), lifestyle/F&B affinity, personality type

### Screen 4: "What Drives You?" (Values Selection)
- Header: "Pick the 3 values that define you most"
- Subtext: "This is how we find your player match."
- Grid of 8-9 value cards (pick exactly 3). Each card has an icon + label:
  - 🔥 Ambition
  - 💛 Family First  
  - 🌍 Community Impact
  - 🎨 Creativity
  - 💪 Resilience
  - 🤝 Connection
  - ⚖️ Fairness & Equality
  - 🌱 Growth
  - 🎭 Authenticity
- Selected cards get a bright border glow + checkmark
- Enforce exactly 3 selections (disable "Next" until 3 picked, show counter "2/3 selected")
- "+15 XP ✨" on completion

**Data captured:** Core psychographic values (maps to Wasserman Q8 values ranking). This is the highest-value commercial data point — values alignment predicts brand affinity better than demographics.

### Screen 5: "Your City, Your Cup" (Location)
- Header: "Where are you cheering from?"
- Subtext: "We'll connect you to World Cup action near you."
- Options presented as a searchable dropdown OR visual map with FIFA 2026 host cities highlighted:
  - List of ~16 host cities (New York/NJ, LA, Miami, Dallas, Houston, Atlanta, Philadelphia, Seattle, San Francisco, Kansas City, Boston, Toronto, Vancouver, Monterrey, Guadalajara, Mexico City)
  - Plus "Other US City" and "International" options
- If host city selected, show a small badge: "🏟️ Matches in your city!"
- "+5 XP ✨"

**Data captured:** Geography for localized commercial activation, proximity to host venues, potential ticket buyer signal

### Screen 6: "Quick Fire Round" (3 Commercial-Value Questions)
Fast, fun, one-tap-each. These look playful but capture the most commercially actionable data.

**Q1:** "How do you find cool new stuff?" (brand discovery — maps to Q24)
- 📱 Social media
- 👯 Friends & family  
- 🎙️ Podcasts & creators
- 🛍️ In-store / live events

**Q2:** "Which matters most when you buy?" (purchase driver — maps to Q22)
- ✨ Quality & value
- 🌱 Ethical & sustainable  
- 🎨 Style & aesthetics
- 💡 Innovation & uniqueness

**Q3:** "What kind of World Cup content do you want more of?" (content preference)
- 🎬 Behind-the-scenes player stories
- 📊 Stats, predictions, analysis
- 🎉 Fan culture, fashion, game-day vibes
- 👨‍👩‍👧 Family activities & watch guides

"+10 XP ✨" — counter should now show 50+ XP total

**Data captured:** Brand discovery channel, purchase decision values, content consumption preference. Directly feeds sponsor activation strategy.

### Screen 7: THE REVEAL — "Your FanMatch Results" 🎉
This is the climax and THE reward. Should feel like Spotify Wrapped reveal energy — brief loading animation, then a multi-part reveal that users will screenshot.

**Loading state (2 seconds):**
"Finding your match..." with a pulsing soccer ball icon or spinning gradient ring. Build anticipation.

**Reveal Part A: Your Fan DNA Spider Chart**
First thing users see after loading — their OWN profile visualized.

- Header: "Your Fan DNA"
- A radar/spider chart (build with SVG — 6 axes) showing the user's profile scored on:
  - **Live Energy** (high if they picked "Stadium Energy" in Screen 3)
  - **Digital Engagement** (high if they picked "Couch Commander")
  - **Social Amplification** (high if household = "Friends/Watch Party" or "Whole Crew")
  - **Brand Receptivity** (high if they engage with brands via events/in-store from Screen 6)
  - **Values Drive** (always medium-high — everyone picked 3 values)
  - **Story Connection** (high if they picked "stories, people, meaning" in Screen 3)

- The chart should render with a smooth animation — lines drawing outward from center over ~1 second
- Use a gradient fill (teal/gold) inside the polygon
- Below chart: 2-3 "factoid badges" that feel personalized:
  - "🔥 You're in the top 12% of values-driven fans" (always flattering, hardcoded)
  - "👨‍👩‍👧 Family fans like you drive 84% of sports household purchases" (shown if they picked kids/crew — this is the real Wasserman stat)
  - "📺 Couch commanders are 2.3x more likely to engage with player content between matches" (shown if they picked home viewing — plausible stat)
  - "🏟️ Stadium fans spend 3.2x more on merch per season" (shown if they picked stadium)
- These factoids should feel like "oh wow, I didn't know that about people like me" — mixing real research stats with the user's specific choices

**Reveal Part B: Your Player Match (scroll down or auto-advance after 3s)**
- Large player card:
  - Colored gradient silhouette with jersey number (no real photos — use abstract shapes or a circular gradient avatar with the player's country flag colors)
  - Player name (large, bold)
  - Country flag badge
  - "Your Match Score: 94%" (always 88-97%)
  - The 3 shared value badges glowing: e.g., "🔥 Ambition" "💛 Family First" "🌍 Community"
  - One-line story emphasized: "Like you, [Player Name] leads with [value] and believes [insight]." — this should feel like the emotional payoff
  - "Beyond the Pitch:" — one extra line about what the player does OFF the field (leadership, advocacy, entrepreneurship, family). This is the "women want stories not stats" insight made real.

- Below the main match:
  - "Your secondary match:" — smaller card with a FEMALE player (if main was male) or vice versa. Always show both genders. Same format, condensed.
  - "Follow [Player] →" social buttons (styled, non-functional in demo)

**Reveal Part C: "Your Match Card" (shareable)**
- "📸 Share Your Match" button
- Tapping it shows a beautifully designed vertical card (roughly 9:16 aspect ratio within the screen) containing:
  - The spider chart (small, top corner)
  - Player name + match %
  - User's top 3 values as badges
  - "Find Your World Cup Match → fanmatch.fifa.com" at bottom (mock URL)
  - Designed to look good as a screenshot / Instagram story
- Below: mock share icons (Instagram, X, WhatsApp, Copy Link)

**XP Status shown:** "🏆 You've earned 55 XP!" with a small celebratory burst animation

**Building the spider chart in React (implementation guidance):**
```jsx
// Build as inline SVG — no external charting library needed
// 6-axis radar chart, values 0-100 for each axis
// Draw the outer hexagon grid (3 rings at 33%, 66%, 100%)
// Draw the user's data polygon with gradient fill
// Animate by transitioning points from center (0,0) to final positions on mount
// Use CSS transition on the polygon points or animate with useEffect + setTimeout

const axes = ['Live Energy', 'Digital Engage', 'Social Amplify', 'Brand Receptivity', 'Values Drive', 'Story Connection'];
// Map user's answers to scores:
// - Picked "Stadium Energy" → Live Energy: 85, Digital Engage: 40
// - Picked "Couch Commander" → Live Energy: 30, Digital Engage: 85
// - Household "Just Me" → Social Amplify: 25 (iso-fan signal)
// - Household "Friends/Watch Party" → Social Amplify: 90
// - Values Drive: always 65-80 (everyone picked values)
// - "Stories, people, meaning" → Story Connection: 90
// - "Plays, goals, drama" → Story Connection: 40
// Add slight randomness (±5) so it never looks identical
```

### Screen 8: "Unlock Your Rewards" (XP Redemption)
- Header: "Your XP. Your Rewards."
- Progress bar showing XP earned and thresholds:
  - ✅ 15 XP: "Match Results Unlocked" (already earned)
  - ✅ 25 XP: "Exclusive Player Content" (already earned) 
  - ✅ 50 XP: "15% FIFA Store Discount" (just unlocked!) — show with a celebratory animation
  - 🔒 75 XP: "VIP Prize Draw Entry" — "Complete the Squad Builder to unlock!"
  - 🔒 100 XP: "FIFA Insider Status — Early access to 2027 Women's World Cup presale"
- Current unlocked reward shown prominently:
  - "🎉 You unlocked: 15% off FIFA World Cup Merch"
  - Mock coupon code: "FANMATCH15"
  - "Personalized for you based on your values match"
- Below: "Recommended for you" section showing 2-3 mock product cards:
  - A jersey from their matched player's team ("Based on your match with [Player]")
  - A "Game Day Family Pack" (shown if user selected kids/crew — "Perfect for your crew")
  - A "Behind the Pitch" content subscription (shown if user's Story Connection score was high — "You love the stories behind the game")
- These recommendations should visually connect to their spider chart profile and earlier answers. If their fan DNA shows high Digital Engage + high Story Connection → lead with content. If high Live Energy + high Social Amplify → lead with experiences.

### Screen 9: "Keep Playing" (Retention / Next Steps)
- Header: "Your World Cup Journey Continues"
- Three cards for future engagement:
  - 🏟️ "Squad Builder" — "Build your family's starting XI" → "Coming Soon" badge (Phase 2 feature)
  - ⚽ "Predict & Play" — "Predict live match outcomes for bonus XP" → "Available June 11" (tournament start)
  - 👥 "Find Your Fan Community" — "Connect with matched fans in [their city]" → "Join Waitlist"
- Final CTA: "Share FanMatch with a friend" (with mock share icons)
- Footer: Small text — "Built for the future of fandom. Powered by Wasserman × SSAC 2026."

## Data Dashboard Screen (Judge-Facing / Hidden Screen)
Include a separate "Dashboard" screen accessible via a small "📊" icon in the corner of the results or rewards screen. This is for the PRESENTATION — showing judges what the org/brand sees on the back end.

**Dashboard shows:**

**Row 1: Headline KPIs**
- Mock aggregate stats in 4 cards: "12,847 fans matched" / "68% are parents" / "Top value: Family First (43%)" / "Top city: Houston (18%)"

**Row 2: Aggregate Fan DNA Spider Chart**
- A SECOND spider chart — same 6 axes as the user's personal one — but showing the AVERAGE profile across all users (hardcoded mock data). This is powerful visually: "Here's what the aggregate female football fan looks like across 12,847 users."
- Mock aggregate scores: Live Energy: 45, Digital Engage: 72, Social Amplify: 58, Brand Receptivity: 65, Values Drive: 78, Story Connection: 74
- This tells the story: "Digital-first, values-driven, story-hungry, moderate social — this is NOT the traditional male fan profile."

**Row 3: Segment Breakdown**
- Simple bar charts or pie segments showing: viewing preference split (home 64% vs stadium 36%), household type distribution, top 3 values, content preference distribution

**Row 4: Commercial Activation Opportunities**
Three segment cards:
  - "Segment: Value-Driven Moms 29-44 (34% of users)" → "Recommended partners: Family wellness, sustainable fashion, streaming. Revenue potential: $4.2M in first-party activation."
  - "Segment: Social Gen Z 18-28 (28% of users)" → "Recommended partners: Beauty, athleisure, creator platforms. Revenue potential: $2.8M in social amplification value."
  - "Segment: Stadium Enthusiasts (22% of users)" → "Recommended partners: Hospitality, F&B, travel. Revenue potential: $3.6M in premium experience upsell."

**Row 5: Data Capture Summary**
- "14 data points captured per user" with a visual list: household type, viewing preference, engagement driver, lifestyle signals, 3 core values, city, brand discovery, purchase driver, content preference, fan DNA profile (6 dimensions), player match, XP engagement depth
- A mock "Export Audience Data" button styled but non-functional

## Critical Implementation Notes

1. **Mobile-first:** Design at 375px width with `max-w-md mx-auto` wrapper. Everything should be tappable with thumbs. No tiny buttons. Min touch target: 44px.
2. **One action per screen:** Don't overload any screen. Each screen has ONE thing to do.
3. **Progress bar:** Always visible at top. Shows % complete (screen index / total screens). Gives sense of momentum. Use a simple div with width transition.
4. **XP counter:** Persistent in top-right. Animates when XP is added — use a brief scale transform + color flash.
5. **Transitions:** When advancing screens, fade out current → fade in next. Use opacity + translateY with transition-all duration-300. Results screen (Screen 7) should have a special loading state first (2-second "Finding your match..." with pulsing animation) then reveal.
6. **The "this or that" pairs (Screen 3):** Two large cards side by side. On tap, selected card scales slightly + gets border glow, other card dims. Auto-advance to next pair after 400ms delay.
7. **No scroll walls:** Each screen should fit in viewport without scrolling on mobile. If content is tall, make cards smaller or paginate.
8. **The player match algorithm:** Hardcode 8 players. Map values to players with the overlap scoring function provided. The "match percentage" should always be 88-97%.
9. **Shareable results card:** On Screen 7, include a bordered "card" element that looks like it was designed for Instagram stories — aspect ratio roughly 9:16 within the page, bold typography, player info, user's values.
10. **Brand/sponsor areas:** Subtle placeholder text like "Powered by [Partner]" in muted gray — no actual logos.
11. **State management:** Use a single `useState` for current screen index, and a single `useReducer` or multiple `useState` hooks for all user answers. Pass data forward to results/recommendations.
12. **The dashboard:** Accessible from a small chart-bar icon (📊 or use lucide-react BarChart3 icon) on the results or rewards screen. Should look completely different from the fan experience — clean, data-forward, white/light cards on dark background. This is the "org view."

## Player Data (Hardcode These)

```javascript
const PLAYERS = [
  { name: "Kylian Mbappé", country: "France", flag: "🇫🇷", gender: "M", values: ["Ambition", "Growth", "Creativity"], story: "Leads with fearless ambition and uses his platform to inspire the next generation." },
  { name: "Alexia Putellas", country: "Spain", flag: "🇪🇸", gender: "F", values: ["Resilience", "Fairness & Equality", "Growth"], story: "Came back from a torn ACL to redefine what greatness looks like in women's football." },
  { name: "Christian Pulisic", country: "USA", flag: "🇺🇸", gender: "M", values: ["Family First", "Resilience", "Authenticity"], story: "Carries the weight of a nation's hopes while staying grounded in family and faith." },
  { name: "Trinity Rodman", country: "USA", flag: "🇺🇸", gender: "F", values: ["Creativity", "Authenticity", "Ambition"], story: "Forging her own identity, proving that creativity and confidence win games and change culture." },
  { name: "Vinícius Jr", country: "Brazil", flag: "🇧🇷", gender: "M", values: ["Community Impact", "Resilience", "Connection"], story: "Fights racism on and off the pitch, turning adversity into advocacy for millions." },
  { name: "Aitana Bonmatí", country: "Spain", flag: "🇪🇸", gender: "F", values: ["Growth", "Connection", "Fairness & Equality"], story: "Quiet brilliance and relentless improvement — proving you don't need to be the loudest to lead." },
  { name: "Jude Bellingham", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", gender: "M", values: ["Ambition", "Family First", "Authenticity"], story: "Rose from Birmingham to the Bernabéu, never losing sight of where he came from." },
  { name: "Sophia Smith", country: "USA", flag: "🇺🇸", gender: "F", values: ["Family First", "Community Impact", "Ambition"], story: "Small-town roots, world-class talent — using every goal to lift her community higher." },
];
```

## Matching Logic + Fan DNA Profile Scoring
```javascript
// Fan DNA profile — compute from user's answers
function computeFanDNA(answers) {
  // answers = { household, viewStyle, engagementDriver, food, energy, values[], city, discovery, buyDriver, content }
  const dna = {
    liveEnergy: answers.viewStyle === 'stadium' ? 85 : 30,
    digitalEngage: answers.viewStyle === 'couch' ? 85 : 40,
    socialAmplify: ['crew', 'friends'].includes(answers.household) ? 88 : 
                   answers.household === 'partner' ? 60 :
                   answers.household === 'kids' ? 55 : 25,
    brandReceptivity: answers.discovery === 'events' ? 82 : 
                      answers.discovery === 'social' ? 70 : 55,
    valuesDrive: 72 + Math.floor(Math.random() * 13), // always 72-85
    storyConnection: answers.engagementDriver === 'stories' ? 90 : 40,
  };
  // Add ±5 randomness to each so no two profiles look identical
  Object.keys(dna).forEach(k => { dna[k] = Math.min(100, Math.max(10, dna[k] + Math.floor(Math.random() * 11) - 5)); });
  return dna;
}

// Player matching — same as before
function findMatch(userValues, gender = null) {
  const scored = PLAYERS
    .filter(p => gender ? p.gender === gender : true)
    .map(p => ({
      ...p,
      overlap: p.values.filter(v => userValues.includes(v)).length,
      matchPct: 88 + Math.floor(Math.random() * 10) // 88-97%
    }))
    .sort((a, b) => b.overlap - a.overlap);
  return scored[0];
}
// Primary match: best overall. Secondary match: best of opposite gender.

// Factoids — pick 2-3 based on user answers
function getFactoids(answers) {
  const facts = [];
  facts.push({ emoji: '🔥', text: "You're in the top 12% of values-driven fans" }); // always show
  if (['kids', 'crew'].includes(answers.household)) {
    facts.push({ emoji: '👨‍👩‍👧', text: "Family fans like you drive 84% of sports household purchases" });
  }
  if (answers.viewStyle === 'couch') {
    facts.push({ emoji: '📺', text: "Home viewers are 2.3x more likely to engage with player content between matches" });
  }
  if (answers.viewStyle === 'stadium') {
    facts.push({ emoji: '🏟️', text: "Live fans spend 3.2x more on merch per season" });
  }
  if (answers.engagementDriver === 'stories') {
    facts.push({ emoji: '💬', text: "Story-driven fans have 40% higher brand recall than stats-focused fans" });
  }
  if (answers.household === 'solo') {
    facts.push({ emoji: '✨', text: "Solo fans are the fastest-growing segment in women's sports — and the most underserved" });
  }
  return facts.slice(0, 3); // max 3
}
```

## Final Notes
- This is a PROTOTYPE for a hackathon presentation. Prioritize visual polish and flow over edge cases.
- The experience should take ~90 seconds to complete in demo. Judges will watch someone click through it.
- Every screen should feel intentional and designed, not like a form.
- The dashboard screen is the "business case" — it shows judges the commercial value of the data captured.
- Make it feel like something a real fan would WANT to do, not something they'd tolerate.

## Demo Presentation Flow (How Judges Will See This)
During the 10-minute presentation, the live demo portion (~2-3 minutes) should go:
1. Show the welcome screen on a phone/laptop — "This is what a fan sees"
2. Click through screens 1-7 in ~90 seconds, narrating each data capture point
3. Land on the results screen — pause for impact
4. Show the rewards screen — "This is the value exchange"
5. Tap the 📊 icon — "And THIS is what the organization sees"
6. Walk through the dashboard — "14 data points per user, 3 commercial segments identified, here's the activation strategy"

The dashboard screen is the BRIDGE between the product demo and the strategic recommendations in the slide deck. It turns "cool app" into "commercial intelligence platform."
