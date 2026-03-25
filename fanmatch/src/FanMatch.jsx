import { useState, useEffect, useRef } from "react";
import { BarChart3, Share2, Trophy, ChevronLeft, ChevronRight, Star, Users, Zap, Heart, Globe, Palette, Shield, HandHeart, Sparkles, Target, Waves, X } from "lucide-react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const COLORS = {
  bg: "#0a1628",
  bgCard: "#111d33",
  bgLight: "#162240",
  gold: "#ffd166",
  coral: "#ff6b6d",
  teal: "#00d4aa",
  white: "#ffffff",
  muted: "#8899aa",
  border: "#1e3354",
};

const GRADIENT = {
  gold: "linear-gradient(135deg, #ffd166, #ffaa33)",
  coral: "linear-gradient(135deg, #ff6b6d, #ff3d6e)",
  teal: "linear-gradient(135deg, #00d4aa, #00a8cc)",
  hero: "linear-gradient(135deg, #0a1628 0%, #162240 50%, #1a2d50 100%)",
  card: "linear-gradient(135deg, #111d33, #1a2d50)",
  shimmer: "linear-gradient(135deg, #ffd166 0%, #00d4aa 50%, #ff6b6d 100%)",
};

const PLAYERS = [
  { name: "Kylian Mbappe", country: "France", flag: "\u{1F1EB}\u{1F1F7}", number: 10, gender: "M", image: "mbappe.jpg", values: ["Ambition", "Growth", "Creativity"], story: "Leads with fearless ambition and uses his platform to inspire the next generation.", beyond: "Founded a foundation supporting disadvantaged youth in Bondy, giving back to the community that raised him." },
  { name: "Alexia Putellas", country: "Spain", flag: "\u{1F1EA}\u{1F1F8}", number: 11, gender: "F", image: "putellas.jpg", values: ["Resilience", "Fairness & Equality", "Growth"], story: "Came back from a torn ACL to redefine what greatness looks like in women's football.", beyond: "Advocates for equal pay in football and mentors young female athletes across Europe." },
  { name: "Christian Pulisic", country: "USA", flag: "\u{1F1FA}\u{1F1F8}", number: 10, gender: "M", image: "pulisic.jpg", values: ["Family First", "Resilience", "Authenticity"], story: "Carries the weight of a nation's hopes while staying grounded in family and faith.", beyond: "Quietly funds youth soccer programs in his hometown of Hershey, PA and speaks openly about mental health in sports." },
  { name: "Trinity Rodman", country: "USA", flag: "\u{1F1FA}\u{1F1F8}", number: 2, gender: "F", image: "rodman.jpg", values: ["Creativity", "Authenticity", "Ambition"], story: "Forging her own identity, proving that creativity and confidence win games and change culture.", beyond: "Uses her platform to champion young women building their own paths, independent of family legacy." },
  { name: "Vinicius Jr", country: "Brazil", flag: "\u{1F1E7}\u{1F1F7}", number: 7, gender: "M", image: "vinicius.jpg", values: ["Community Impact", "Resilience", "Connection"], story: "Fights racism on and off the pitch, turning adversity into advocacy for millions.", beyond: "Leads anti-racism campaigns with UEFA and FIFA, and funds education programs in Sao Goncalo, Brazil." },
  { name: "Aitana Bonmati", country: "Spain", flag: "\u{1F1EA}\u{1F1F8}", number: 6, gender: "F", image: "bonmati.jpg", values: ["Growth", "Connection", "Fairness & Equality"], story: "Quiet brilliance and relentless improvement, proving you don't need to be the loudest to lead.", beyond: "Donates Ballon d'Or bonus to girls' football academies and speaks on gender equity at the UN." },
  { name: "Jude Bellingham", country: "England", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", number: 5, gender: "M", image: "bellingham.jpg", values: ["Ambition", "Family First", "Authenticity"], story: "Rose from Birmingham to the Bernabeu, never losing sight of where he came from.", beyond: "Credits his family for every achievement and actively mentors young Black players in England's academy system." },
  { name: "Sophia Smith", country: "USA", flag: "\u{1F1FA}\u{1F1F8}", number: 11, gender: "F", image: "sophia_smith.jpg", values: ["Family First", "Community Impact", "Ambition"], story: "Grew up in a small town, became world class. Using every goal to lift her community higher.", beyond: "Runs youth clinics in rural Colorado and advocates for women's sports media coverage." },
  { name: "Megan Rapinoe", country: "USA", flag: "\u{1F1FA}\u{1F1F8}", number: 15, gender: "F", image: "rapinoe.jpg", values: ["Fairness & Equality", "Authenticity", "Community Impact"], story: "A true legend who changed the game. On the pitch, at the podium, and in the culture.", beyond: "Two-time World Cup Champion turned activist and entrepreneur. Co-founded A Touch More with Sue Bird to elevate stories about revolutionaries who move culture forward. Presidential Medal of Freedom recipient." },
];

const VALUES = [
  { id: "Ambition", icon: "fire", label: "Ambition", emoji: "\u{1F525}" },
  { id: "Family First", icon: "heart", label: "Family First", emoji: "\u{1F49B}" },
  { id: "Community Impact", icon: "globe", label: "Community Impact", emoji: "\u{1F30D}" },
  { id: "Creativity", icon: "palette", label: "Creativity", emoji: "\u{1F3A8}" },
  { id: "Resilience", icon: "shield", label: "Resilience", emoji: "\u{1F4AA}" },
  { id: "Connection", icon: "handshake", label: "Connection", emoji: "\u{1F91D}" },
  { id: "Fairness & Equality", icon: "scale", label: "Fairness & Equality", emoji: "\u2696\uFE0F" },
  { id: "Growth", icon: "sprout", label: "Growth", emoji: "\u{1F331}" },
  { id: "Authenticity", icon: "sparkle", label: "Authenticity", emoji: "\u{1F3AD}" },
];

const HOST_CITIES = [
  "New York / NJ", "Los Angeles", "Miami", "Dallas", "Houston", "Atlanta",
  "Philadelphia", "Seattle", "San Francisco", "Kansas City", "Boston",
  "Toronto", "Vancouver", "Monterrey", "Guadalajara", "Mexico City",
  "Other US City", "International",
];

const SHARE_PLATFORMS = [
  { id: "instagram", label: "Instagram", logo: "/sponsors/instagram.svg", bg: "#E1306C" },
  { id: "facebook", label: "Facebook", logo: "/sponsors/facebook.svg", bg: "#1877F2" },
  { id: "x", label: "X", logo: "/sponsors/x.svg", bg: "#000000" },
  { id: "whatsapp", label: "WhatsApp", logo: "/sponsors/whatsapp.svg", bg: "#25D366" },
  { id: "copy", label: "Copy Link", logo: null, bg: COLORS.bgLight },
];

const TOTAL_SCREENS = 9;
const LIVE_FAN_COUNT_START = 40_217;

function useLiveFanCount() {
  const [count, setCount] = useState(LIVE_FAN_COUNT_START);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 10) + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return count;
}

function RollingDigit({ digit, height = 14 }) {
  const [curr, setCurr] = useState(digit);
  const [animKey, setAnimKey] = useState(0);
  const prevRef = useRef(digit);

  useEffect(() => {
    if (digit !== prevRef.current) {
      prevRef.current = digit;
      setAnimKey((k) => k + 1);
      const t = setTimeout(() => setCurr(digit), 380);
      return () => clearTimeout(t);
    }
  }, [digit]);

  return (
    <span style={{
      display: "inline-block",
      height,
      overflow: "hidden",
      verticalAlign: "bottom",
      position: "relative",
      width: "0.62em",
      textAlign: "center",
      fontVariantNumeric: "tabular-nums",
    }}>
      <span style={{ position: "absolute", inset: 0, lineHeight: `${height}px`, textAlign: "center" }}>
        {curr}
      </span>
      {animKey > 0 && (
        <span
          key={animKey}
          style={{
            position: "absolute",
            inset: 0,
            lineHeight: `${height}px`,
            textAlign: "center",
            animation: "digitRollUp 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        >
          {digit}
        </span>
      )}
    </span>
  );
}

function RollingCounter({ count, height = 14 }) {
  const formatted = count.toLocaleString();
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end" }}>
      {formatted.split("").map((char, i) =>
        char === "," ? (
          <span key={i} style={{ lineHeight: `${height}px` }}>,</span>
        ) : (
          <RollingDigit key={i} digit={parseInt(char, 10)} height={height} />
        )
      )}
    </span>
  );
}

// ─────────────────────────────────────────────
// LOGIC HELPERS
// ─────────────────────────────────────────────

function computeFanDNA(answers) {
  const dna = {
    liveEnergy: answers.viewStyle === "stadium" ? 85 : 30,
    digitalEngage: answers.viewStyle === "couch" ? 85 : 40,
    socialAmplify: ["crew", "friends"].includes(answers.household) ? 88 : answers.household === "partner" ? 60 : answers.household === "kids" ? 55 : 25,
    brandReceptivity: answers.discovery === "events" ? 82 : answers.discovery === "social" ? 70 : 55,
    valuesDrive: 72 + Math.floor(Math.random() * 13),
    storyConnection: answers.engagementDriver === "stories" ? 90 : 40,
  };
  Object.keys(dna).forEach((k) => {
    dna[k] = Math.min(100, Math.max(10, dna[k] + Math.floor(Math.random() * 11) - 5));
  });
  return dna;
}

function findMatch(userValues, gender = null) {
  const scored = PLAYERS
    .filter((p) => (gender ? p.gender === gender : true))
    .map((p) => ({
      ...p,
      overlap: p.values.filter((v) => userValues.includes(v)).length,
      matchPct: 88 + Math.floor(Math.random() * 10),
    }))
    .sort((a, b) => b.overlap - a.overlap);
  return scored[0];
}

function getFactoids(answers) {
  const facts = [];
  facts.push({ emoji: "\u{1F525}", text: "You're in the top 12% of fans who lead with their values worldwide" });
  if (["kids", "crew"].includes(answers.household)) {
    facts.push({ emoji: "\u{1F49B}", text: "Families who watch together build stronger bonds. Your kids will remember this World Cup forever" });
  }
  if (answers.viewStyle === "couch") {
    facts.push({ emoji: "\u{1F4FA}", text: "Home viewers build the deepest player connections. You're the heartbeat of game day" });
  }
  if (answers.viewStyle === "stadium") {
    facts.push({ emoji: "\u{1F3DF}\uFE0F", text: "Live fans create the energy everyone else feeds off. The stadium needs people like you" });
  }
  if (answers.engagementDriver === "stories") {
    facts.push({ emoji: "\u{1F4AC}", text: "You see what most fans miss. The human stories that make the beautiful game beautiful" });
  }
  if (answers.household === "solo") {
    facts.push({ emoji: "\u2728", text: "Solo fans are the fastest-growing community in football. You're never really watching alone" });
  }
  if (answers.household === "partner") {
    facts.push({ emoji: "\u{1F46B}", text: "Couples who share a team share something deeper. This is your story now too" });
  }
  if (answers.household === "friends") {
    facts.push({ emoji: "\u{1F389}", text: "Watch parties are where lifelong fans are made. Your crew is the real starting XI" });
  }
  return facts.slice(0, 3);
}

// ─────────────────────────────────────────────
// SHARED SUB-COMPONENTS
// ─────────────────────────────────────────────

const XP_CHECKPOINTS = [
  { xp: 0,  label: "Profile", icon: "\u{1F3C1}" },
  { xp: 10, label: "Viewing", icon: "\u{1F4FA}" },
  { xp: 20, label: "Lifestyle", icon: "\u{1F9EC}" },
  { xp: 35, label: "Values", icon: "\u{1F4A1}" },
  { xp: 40, label: "City", icon: "\u{1F4CD}" },
  { xp: 50, label: "Match", icon: "\u26BD" },
];

function ProgressBar({ screen, xp = 0, flash }) {
  const maxXP = XP_CHECKPOINTS[XP_CHECKPOINTS.length - 1].xp;
  const pct = Math.min(100, Math.round((xp / maxXP) * 100));
  // Find the latest reached checkpoint
  let reachedIdx = 0;
  for (let i = XP_CHECKPOINTS.length - 1; i >= 0; i--) {
    if (xp >= XP_CHECKPOINTS[i].xp) { reachedIdx = i; break; }
  }

  return (
    <div style={{ position: "sticky", top: 0, left: 0, right: 0, zIndex: 50, background: `${COLORS.bg}ee`, backdropFilter: "blur(12px)", padding: "8px 16px 4px" }}>
      {/* Top row: back space + XP badge right-aligned */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 6 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          opacity: 0.65, transition: "all 0.3s ease",
          transform: flash ? "scale(1.2)" : "scale(1)",
        }}>
          <Trophy size={11} color={COLORS.gold} />
          <span style={{ color: COLORS.gold, fontWeight: 700, fontSize: 11 }}>{xp} XP</span>
        </div>
      </div>
      {/* Progress bar track */}
      <div style={{ height: 4, borderRadius: 2, background: COLORS.border, position: "relative", marginBottom: 6 }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: GRADIENT.shimmer,
            borderRadius: 2,
            transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            boxShadow: `0 0 12px ${COLORS.gold}44`,
          }}
        />
        {/* Checkpoint dots on the bar */}
        {XP_CHECKPOINTS.map((cp, i) => {
          const pos = (cp.xp / maxXP) * 100;
          const reached = xp >= cp.xp;
          const justReached = reached && i === reachedIdx && i > 0;
          return (
            <div key={i} style={{
              position: "absolute", top: "50%", left: `${pos}%`,
              transform: "translate(-50%, -50%)",
              width: reached ? 14 : 10, height: reached ? 14 : 10,
              borderRadius: "50%",
              background: reached ? COLORS.teal : COLORS.bgLight,
              border: `2px solid ${reached ? COLORS.teal : COLORS.border}`,
              transition: "all 0.4s ease",
              boxShadow: justReached ? `0 0 10px ${COLORS.teal}88` : "none",
              zIndex: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {reached && <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.white }} />}
            </div>
          );
        })}
      </div>
      {/* Checkpoint labels row */}
      <div style={{ position: "relative", height: 28 }}>
        {XP_CHECKPOINTS.map((cp, i) => {
          const pos = (cp.xp / maxXP) * 100;
          const reached = xp >= cp.xp;
          const justReached = reached && i === reachedIdx && i > 0;
          const isFirst = i === 0;
          const isLast = i === XP_CHECKPOINTS.length - 1;
          return (
            <div key={i} style={{
              position: "absolute", left: `${pos}%`, top: 0,
              transform: isFirst ? "translateX(0)" : isLast ? "translateX(-100%)" : "translateX(-50%)",
              textAlign: isFirst ? "left" : isLast ? "right" : "center",
              width: 58,
              opacity: justReached ? 1 : reached ? 0.6 : 0.25,
              transition: "opacity 0.4s ease",
            }}>
              <span style={{ fontSize: 10, display: "block", lineHeight: 1 }}>{cp.icon}</span>
              <span style={{
                fontSize: 7, color: justReached ? COLORS.teal : COLORS.muted,
                fontWeight: justReached ? 700 : 500,
                lineHeight: 1.2, display: "block", marginTop: 1,
              }}>
                {cp.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function XPCounter({ xp, flash }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 6,
        right: 10,
        zIndex: 51,
        background: flash ? `linear-gradient(135deg, ${COLORS.gold}20, transparent)` : "transparent",
        border: "none",
        borderRadius: 16,
        padding: "4px 10px",
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: flash ? "scale(1.2)" : "scale(1)",
        opacity: 0.7,
      }}
    >
      <Trophy size={13} color={COLORS.gold} />
      <span style={{ color: COLORS.gold, fontWeight: 700, fontSize: 12 }}>{xp} XP</span>
    </div>
  );
}

function XPBadge({ amount, visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: "40%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: "xpFloat 1.2s ease forwards",
        pointerEvents: "none",
      }}
    >
      <div style={{
        color: COLORS.gold,
        fontWeight: 900,
        fontSize: 36,
        textShadow: `0 0 30px ${COLORS.gold}, 0 0 60px ${COLORS.gold}55`,
        letterSpacing: 2,
      }}>
        +{amount} XP
      </div>
      <div style={{ fontSize: 20, marginTop: -2 }}>{"\u2728"}</div>
    </div>
  );
}

function CTAButton({ onClick, children, disabled, style: extraStyle }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? COLORS.border : GRADIENT.gold,
        color: disabled ? COLORS.muted : COLORS.bg,
        border: "none",
        borderRadius: 16,
        padding: "16px 40px",
        fontSize: 17,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
        maxWidth: 320,
        transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        opacity: disabled ? 0.5 : 1,
        boxShadow: disabled ? "none" : `0 4px 24px ${COLORS.gold}33`,
        letterSpacing: 0.3,
        position: "relative",
        overflow: "hidden",
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute", top: 6, left: 10, zIndex: 51,
        background: "transparent",
        border: "none", borderRadius: 20,
        width: 32, height: 32, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s ease",
        opacity: 0.5,
      }}
    >
      <ChevronLeft size={18} color={COLORS.muted} />
    </button>
  );
}

function FloatingOrbs() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div className="orb" style={{ width: 260, height: 260, background: `${COLORS.teal}18`, top: "-8%", right: "-12%", animation: "float1 12s ease-in-out infinite" }} />
      <div className="orb" style={{ width: 200, height: 200, background: `${COLORS.coral}12`, bottom: "10%", left: "-10%", animation: "float2 15s ease-in-out infinite" }} />
      <div className="orb" style={{ width: 180, height: 180, background: `${COLORS.gold}10`, top: "40%", right: "5%", animation: "float3 10s ease-in-out infinite" }} />
      <div className="orb" style={{ width: 120, height: 120, background: `${COLORS.teal}0d`, bottom: "30%", left: "20%", animation: "float1 18s ease-in-out infinite reverse" }} />
    </div>
  );
}

function ScreenWrap({ children, style: extraStyle }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px 32px",
        textAlign: "center",
        animation: "fadeInScale 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        position: "relative",
        zIndex: 1,
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// INFO BUTTON + MODAL  (Design Rationale System)
// ─────────────────────────────────────────────

function InfoModal({ info, onClose }) {
  if (!info) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(0,0,0,0.78)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: `linear-gradient(145deg, ${COLORS.bgCard}, ${COLORS.bgLight})`,
          borderRadius: 24, padding: "26px 20px 20px",
          maxWidth: 320, width: "100%",
          border: `1px solid ${COLORS.gold}44`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px ${COLORS.gold}08 inset`,
          position: "relative",
          animation: "fadeInScale 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12,
            background: COLORS.bgLight, border: `1px solid ${COLORS.border}`,
            borderRadius: 8, width: 28, height: 28, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: COLORS.muted,
          }}
        >
          <X size={14} />
        </button>

        {/* title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.gold}33, ${COLORS.gold}0a)`,
            border: `1.5px solid ${COLORS.gold}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: COLORS.gold, fontSize: 15, fontWeight: 800, flexShrink: 0,
          }}>
            i
          </div>
          <h3 style={{ color: COLORS.white, fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{info.title}</h3>
        </div>

        {/* fan perspective */}
        {info.user && (
          <div style={{
            marginBottom: 10,
            background: `${COLORS.teal}0c`, border: `1px solid ${COLORS.teal}28`,
            borderRadius: 14, padding: "12px 14px",
          }}>
            <p style={{ color: COLORS.teal, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>
              👤 Fan Experience
            </p>
            <p style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.55 }}>{info.user}</p>
          </div>
        )}

        {/* business value */}
        {info.biz && (
          <div style={{
            background: `${COLORS.gold}0c`, border: `1px solid ${COLORS.gold}28`,
            borderRadius: 14, padding: "12px 14px",
          }}>
            <p style={{ color: COLORS.gold, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>
              💼 Business Value
            </p>
            <p style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.55 }}>{info.biz}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBtn({ info, style: extraStyle }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        title="Why this?"
        style={{
          background: `linear-gradient(135deg, ${COLORS.gold}28, ${COLORS.gold}0c)`,
          border: `1.5px solid ${COLORS.gold}66`,
          borderRadius: "50%",
          width: 26, height: 26,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: COLORS.gold,
          fontSize: 13, fontWeight: 800, lineHeight: 1,
          padding: 0, flexShrink: 0,
          transition: "all 0.2s ease",
          ...extraStyle,
        }}
      >
        i
      </button>
      {open && <InfoModal info={info} onClose={() => setOpen(false)} />}
    </>
  );
}

// ─────────────────────────────────────────────
// SPIDER CHART (SVG)
// ─────────────────────────────────────────────

function SpiderChart({ data, size = 260, animated = true, color = COLORS.teal, id = "default" }) {
  const [scale, setScale] = useState(animated ? 0 : 1);
  const labels = ["Live Energy", "Digital Vibes", "Social Power", "Explorer", "Values Core", "Storyteller"];
  const keys = ["liveEnergy", "digitalEngage", "socialAmplify", "brandReceptivity", "valuesDrive", "storyConnection"];
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const gradId = `spiderFill_${id}`;

  useEffect(() => {
    if (animated) {
      const t = setTimeout(() => setScale(1), 100);
      return () => clearTimeout(t);
    }
  }, [animated]);

  const angleStep = (Math.PI * 2) / 6;
  const getPoint = (i, val) => {
    const a = angleStep * i - Math.PI / 2;
    const d = (val / 100) * r * scale;
    return [cx + d * Math.cos(a), cy + d * Math.sin(a)];
  };
  const getGridPoint = (i, pct) => {
    const a = angleStep * i - Math.PI / 2;
    const d = pct * r;
    return [cx + d * Math.cos(a), cy + d * Math.sin(a)];
  };

  const gridRings = [0.33, 0.66, 1.0];
  const dataPoints = keys.map((k, i) => getPoint(i, data[k] || 50));
  const poly = dataPoints.map((p) => p.join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={COLORS.gold} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {/* grid */}
      {gridRings.map((pct, ri) => {
        const pts = Array.from({ length: 6 }, (_, i) => getGridPoint(i, pct).join(",")).join(" ");
        return <polygon key={ri} points={pts} fill="none" stroke={COLORS.border} strokeWidth={1} opacity={0.5} />;
      })}
      {/* axes */}
      {Array.from({ length: 6 }, (_, i) => {
        const [ex, ey] = getGridPoint(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke={COLORS.border} strokeWidth={1} opacity={0.3} />;
      })}
      {/* data polygon */}
      <polygon
        points={poly}
        fill={`url(#${gradId})`}
        stroke={color}
        strokeWidth={2.5}
        style={{ transition: "all 1s ease" }}
      />
      {/* data dots */}
      {dataPoints.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={4} fill={color} style={{ transition: "all 1s ease" }} />
      ))}
      {/* labels */}
      {Array.from({ length: 6 }, (_, i) => {
        const [lx, ly] = getGridPoint(i, 1.22);
        return (
          <text key={i} x={lx} y={ly} fill={COLORS.muted} fontSize={10} fontWeight={600} textAnchor="middle" dominantBaseline="middle">
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
// SCREEN COMPONENTS
// ─────────────────────────────────────────────

function WhyPopup({ onClose }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 200,
      background: "radial-gradient(ellipse at center, rgba(10,22,40,0.95) 0%, rgba(0,0,0,0.98) 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      animation: "fadeIn 0.4s ease",
    }}>
      {/* Background orbs for popup */}
      <div className="orb" style={{ width: 200, height: 200, background: `${COLORS.gold}12`, top: "10%", right: "5%", animation: "float1 10s ease-in-out infinite", position: "absolute" }} />
      <div className="orb" style={{ width: 160, height: 160, background: `${COLORS.teal}10`, bottom: "15%", left: "5%", animation: "float2 12s ease-in-out infinite", position: "absolute" }} />
      <div style={{
        background: `linear-gradient(145deg, ${COLORS.bgCard}, ${COLORS.bgLight})`,
        borderRadius: 28, padding: "36px 26px 28px",
        maxWidth: 340, width: "100%", textAlign: "center",
        border: `2px solid ${COLORS.gold}33`,
        animation: "fadeInScale 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${COLORS.gold}0a inset`,
        position: "relative", overflow: "hidden",
      }}>
        {/* Corner accent */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: `linear-gradient(135deg, transparent 50%, ${COLORS.gold}06)`, pointerEvents: "none" }} />
        <div style={{ fontSize: 44, marginBottom: 14 }}>{"\u26BD"}</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.white, marginBottom: 10, lineHeight: 1.3 }}>
          The World Cup is better<br />when it's <span style={{ background: GRADIENT.shimmer, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>personal</span>
        </h2>
        <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 28, maxWidth: 280, margin: "0 auto 28px" }}>
          Find the player who shares your values.
          Get your unique Fan DNA.
          Bring the whole family along.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 28 }}>
          {[
            { emoji: "\u{1F3AD}", label: "Your identity" },
            { emoji: "\u{1F381}", label: "Rewards" },
            { emoji: "\u{1F46A}", label: "Family friendly" },
          ].map((item, i) => (
            <div key={i} style={{
              textAlign: "center", background: `${COLORS.bgLight}`, border: `1px solid ${COLORS.border}`,
              borderRadius: 14, padding: "12px 14px", flex: 1,
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{item.emoji}</div>
              <p style={{ color: COLORS.muted, fontSize: 10, fontWeight: 600 }}>{item.label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            background: GRADIENT.gold, color: COLORS.bg, border: "none", borderRadius: 16,
            padding: "16px 40px", fontSize: 17, fontWeight: 700, cursor: "pointer",
            width: "100%", maxWidth: 280, animation: "glowPulse 2.5s ease-in-out infinite",
          }}
        >
          Let's Go!
        </button>
        <p style={{ color: COLORS.muted, fontSize: 11, marginTop: 14, opacity: 0.5 }}>
          2 minutes. No sign-up needed.
        </p>
      </div>
    </div>
  );
}

const INFO = {
  welcome: {
    title: "Why FanMatch?",
    user: "A 2-minute personality quiz that matches you with the FIFA 2026 player who shares your values and life story. Not just whoever is most famous. Fun, fast, and surprisingly personal.",
    biz: "Frictionless psychographic data collection disguised as an identity experience. Each completion generates 14 first-party signals worth $12 to $18 in B2B audience intelligence. Gamification drives 78% completion versus 22% for traditional surveys.",
  },
  household: {
    title: "Household Setup",
    user: "We tailor player matches and rewards for your whole crew. Solo fans, couples, and families each get a different personalised experience.",
    biz: "Household type is the number one structural predictor of sports spend. Families with kids represent FIFA's highest LTV segment, spending 3 to 4 times more than solo fans (Wasserman Research 2024). Single question, enormous commercial signal.",
  },
  householdKids: {
    title: "Kids Count",
    user: "Helps us find the right player matches and great gameday content for the whole family.",
    biz: "Number of children predicts youth merchandise spend, family ticket bundle intent, and content subscription uptake. Granular input with high commercial specificity.",
  },
  vibe: {
    title: "Gameday Vibe",
    user: "Quick picks that map your fan personality across 4 natural dimensions. No right or wrong, just your authentic gameday self.",
    biz: "4 binary signals create 16 fan archetypes mapped to Wasserman Q12/Q14/Q17 segments. Viewing preference (couch vs. stadium) is the primary broadcaster vs. live event sponsor targeting split.",
  },
  vibeViewStyle: {
    title: "Viewing Preference",
    user: "Shapes your Live Energy and Digital Engagement scores on your Fan DNA chart.",
    biz: "Primary signal for broadcaster vs. live event sponsor affinity. Stadium fans spend 3.2x more on merch; couch fans show 2.3x higher content subscription intent.",
  },
  vibeDriver: {
    title: "Engagement Driver",
    user: "Determines whether we match you on a player's story and personality or their on-pitch performance stats.",
    biz: "Highest commercial signal in the vibe block. Narrative fans have 2.3x higher content subscription intent; performance fans skew toward live events and merch activation.",
  },
  vibeFood: {
    title: "Game-Day Fuel",
    user: "Personalises your Match Day Box and food and drink recommendations.",
    biz: "Food and beverage brand affinity signal for F&B sponsor activation, a key FIFA 2026 sponsor category.",
  },
  vibeEnergy: {
    title: "Saturday Energy",
    user: "Fine-tunes your player personality match.",
    biz: "Lifestyle segmentation (planned vs. spontaneous) maps to lifestyle brand partnership categories and ad creative targeting.",
  },
  values: {
    title: "Values Selection",
    user: "Your values reveal which player is truly your match. Not by stats, but by who they are as a person off the pitch.",
    biz: "Values are the single highest-signal commercial data point. Values alignment predicts brand purchase intent 3 times better than demographics alone (Wasserman findings). 9 values map to distinct sponsor category affinities.",
  },
  city: {
    title: "City and Venue",
    user: "We'll surface which World Cup matches are closest to you and connect you to local fan events in your city.",
    biz: "Geographic proximity to host venues is the primary ticket purchase intent signal. City plus household type enables family package geo-targeting across all 16 FIFA 2026 host markets.",
  },
  quickfire: {
    title: "Quick Fire Round",
    user: "Three last questions to sharpen your player match and unlock personalised rewards.",
    biz: "The three highest commercial value data points: brand discovery channel (media budget allocation), purchase driver (product positioning), and content preference (sponsor content strategy). Maps directly to Wasserman Q22 and Q24.",
  },
  quickfireDiscovery: {
    title: "Brand Discovery Channel",
    user: "Helps us surface the kind of content and deals you'll actually enjoy.",
    biz: "Maps to Wasserman Q24. Determines optimal activation channel per fan: social fans respond to influencer campaigns; event fans respond to experiential; creator fans respond to podcast and content partnerships.",
  },
  quickfireBuy: {
    title: "Purchase Driver",
    user: "Personalises which sponsor offers and products we recommend to you.",
    biz: "Maps to Wasserman Q22. Directly informs product positioning and call-to-action language per fan segment. Quality first, ethics first, or innovation first messaging.",
  },
  quickfireContent: {
    title: "Content Preference",
    user: "Shapes the behind-the-scenes stories, stats, and fan culture content we'll recommend.",
    biz: "Feeds directly into Wasserman's content strategy framework. Story fans point to player narrative partnerships; stats fans point to data product sponsorships; family fans point to multigenerational activations.",
  },
  resultsDNA: {
    title: "Your Fan DNA",
    user: "Your unique 6-dimension profile. No two fans look alike. This is your genuine football identity, shaped by how you answered.",
    biz: "The radar chart makes psychographic profiles tangible. Each axis maps to a sponsor activation vector: Live Energy covers events and ticketing; Digital Engagement covers streaming; Social Amplify covers influencer work; Brand Receptivity covers brand partners; Values Drive covers cause marketing; Story Connection covers content.",
  },
  resultsMatch: {
    title: "Player Match",
    user: "Matched on shared values and life story, not just stats. The Beyond the Pitch section shows who your player really is as a person.",
    biz: "Values-based matching creates emotional brand bridges. 94% of women are primary purchase decision-makers; values-matched players drive 4.2x higher sponsor brand recall than performance-based associations.",
  },
  resultsBeyondPitch: {
    title: "Beyond the Pitch",
    user: "The side of players that mainstream sports media rarely covers. Leadership, advocacy, community, and family.",
    biz: "Key research finding: women fans connect with player stories and identity, not just athletic performance. This section directly addresses what 1,800+ Wasserman survey respondents called inauthentic sports marketing.",
  },
  rewards: {
    title: "XP Rewards",
    user: "Your quiz responses have real value. These rewards are your return for sharing. No tricks, no form to fill in, no spam.",
    biz: "Gamified reward tiers drive data completeness and consent capture. Sponsor-funded rewards create direct ROI attribution per brand partner. A 15% discount coupon converts at around 34% for sports retail segments.",
  },
  rewardsRecs: {
    title: "Personalised Recommendations",
    user: "Products and experiences tailored to your Fan DNA profile, not generic ads.",
    biz: "Sponsor inventory is matched to fan profiles using the 14 signals captured. This is the core monetisation layer: first-party data feeds hyper-targeted offers which drive measurable conversion for brand partners.",
  },
  keepPlaying: {
    title: "Journey Continues",
    user: "FanMatch isn't a one-time quiz. It's an ongoing relationship that grows with every match week through the tournament.",
    biz: "Retention layer: Phase 2 features extend session depth and enable longitudinal fan tracking across the 64-match tournament. Community matching drives organic referral growth. Each return visit deepens the profile.",
  },
  dashboardKPIs: {
    title: "Audience KPIs",
    user: undefined,
    biz: "Real-time aggregate intelligence from quiz completions. These headline numbers anchor the commercial pitch: scale (fans profiled), household penetration (families), revenue potential per fan, and completion funnel efficiency.",
  },
  dashboardSpider: {
    title: "Persona DNA Profiles",
    user: undefined,
    biz: "Multi-persona psychographic overlay enables hyper-targeted campaign planning. Sponsors can target individual persona clusters (e.g. Whole Crew moms) rather than broad demographics, dramatically improving ad relevance and ROI.",
  },
  dashboardValues: {
    title: "Values and Data Signals",
    user: undefined,
    biz: "Values data maps directly to brand alignment scores. Top value is Family First, pointing to family product sponsors. High digital percentage points to streaming and OTT partner priority. Each of the 14 data points has a named commercial application.",
  },
  dashboardData: {
    title: "14 Data Points Per Fan",
    user: undefined,
    biz: "Each fan provides 14 structured first-party signals via a 2-minute gamified experience. The industry benchmark for comparable profiling is $12 to $18 per user via traditional market research. FanMatch delivers at near-zero marginal cost.",
  },
};

function WelcomeScreen({ onNext }) {
  const fanCount = useLiveFanCount();
  return (
    <ScreenWrap>
      {/* Hex grid background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <svg width="100%" height="100%" style={{ opacity: 0.04, position: "absolute", top: 0, left: 0 }}>
          <defs>
            <pattern id="hexGrid" width="56" height="48" patternUnits="userSpaceOnUse">
              <polygon points="28,2 52,14 52,34 28,46 4,34 4,14" fill="none" stroke={COLORS.gold} strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexGrid)" />
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>

        {/* FanMatch logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28, animation: "heroReveal 0.6s ease forwards" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.bgLight}, ${COLORS.bgCard})`,
            border: `1.5px solid ${COLORS.gold}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: `0 0 20px ${COLORS.gold}15`,
          }}>
            {"\u26BD"}
          </div>
          <span style={{ color: COLORS.white, fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>FanMatch</span>
        </div>

        {/* Hero title */}
        <h1 style={{
          fontSize: 38, fontWeight: 800, color: COLORS.white, lineHeight: 1.1, marginBottom: 12,
          animation: "heroReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both",
        }}>
          Find Your<br />
          <span style={{
            background: GRADIENT.shimmer, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            display: "inline-block", paddingBottom: 2,
          }}>
            World Cup Match
          </span>
        </h1>

        <p style={{
          color: COLORS.muted, fontSize: 15, lineHeight: 1.6, maxWidth: 290, margin: "0 auto 24px",
          animation: "heroReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both",
        }}>
          Match with the FIFA 2026 player who shares your values. Get your Fan DNA. Bring the whole family.
        </p>

        {/* 3 feature pills */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 10, marginBottom: 28,
          animation: "heroReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both",
        }}>
          {[
            { emoji: "\u{1F3AD}", label: "Your identity" },
            { emoji: "\u{1F381}", label: "Rewards" },
            { emoji: "\u{1F46A}", label: "Whole family" },
          ].map((item, i) => (
            <div key={i} style={{
              textAlign: "center", background: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`, borderRadius: 14,
              padding: "10px 14px", flex: 1, maxWidth: 90,
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{item.emoji}</div>
              <p style={{ color: COLORS.muted, fontSize: 10, fontWeight: 600 }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ animation: "heroReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both" }}>
          <button
            onClick={onNext}
            style={{
              background: GRADIENT.gold, color: COLORS.bg, border: "none", borderRadius: 18,
              padding: "18px 52px", fontSize: 18, fontWeight: 800, cursor: "pointer",
              animation: "glowPulse 2.5s ease-in-out infinite",
              position: "relative", overflow: "hidden", letterSpacing: 0.5, width: "100%", maxWidth: 320,
            }}
          >
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 18 }}>
              <div style={{
                position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                animation: "shimmerSlide 3s ease-in-out infinite",
              }} />
            </div>
            <span style={{ position: "relative", zIndex: 1 }}>Let's Go &rarr;</span>
          </button>
          <p style={{ color: COLORS.muted, fontSize: 11, marginTop: 10, opacity: 0.5 }}>2 minutes. No sign-up needed.</p>
        </div>

        {/* Live counter */}
        <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 16, display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
          animation: "heroReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both",
        }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: COLORS.teal, boxShadow: `0 0 8px ${COLORS.teal}` }} />
          <RollingCounter count={fanCount} height={13} /> fans matched
        </p>

        {/* Footer */}
        <div style={{
          marginTop: 24, display: "flex", gap: 16, alignItems: "center", justifyContent: "center",
          opacity: 0.35, fontSize: 11, color: COLORS.muted,
          animation: "heroReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both",
        }}>
          <span>FIFA 2026</span><span style={{ color: COLORS.gold }}>|</span>
          <span>Wasserman</span><span style={{ color: COLORS.gold }}>|</span><span>SSAC</span>
        </div>
      </div>
    </ScreenWrap>
  );
}

function HouseholdScreen({ onNext, onBack, answers, setAnswers }) {
  const options = [
    { id: "solo", emoji: "\u{1F464}", label: "Just Me" },
    { id: "partner", emoji: "\u{1F46B}", label: "Me + Partner" },
    { id: "kids", emoji: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}", label: "Me + Kids" },
    { id: "crew", emoji: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}", label: "The Whole Crew" },
    { id: "friends", emoji: "\u{1F389}", label: "Friends / Watch Party" },
  ];
  const [numKids, setNumKids] = useState(1);
  const [numPeople, setNumPeople] = useState(3);
  const showKids = answers.household === "kids" || answers.household === "crew";
  const showPeople = answers.household === "friends";

  return (
    <ScreenWrap>
      {onBack && <BackButton onClick={onBack} />}
      <InfoBtn info={INFO.household} style={{ position: "absolute", top: 6, right: 10, zIndex: 51 }} />
      <h2 style={{ fontSize: 26, fontWeight: 800, color: COLORS.white, marginBottom: 8 }}>
        Who's on your team today?
      </h2>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 28 }}>
        Playing solo or bringing the squad?
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 340, marginBottom: 20 }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setAnswers((a) => ({ ...a, household: opt.id, numKids: numKids }))}
            style={{
              background: answers.household === opt.id
                ? `linear-gradient(135deg, ${COLORS.teal}15, ${COLORS.bgLight})`
                : COLORS.bgCard,
              border: `2px solid ${answers.household === opt.id ? COLORS.teal : COLORS.border}`,
              borderRadius: 18,
              padding: "20px 12px",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: answers.household === opt.id ? `0 6px 24px ${COLORS.teal}25, 0 0 0 1px ${COLORS.teal}15 inset` : "none",
              gridColumn: opt.id === "friends" ? "1 / -1" : undefined,
              transform: answers.household === opt.id ? "scale(1.03) translateY(-2px)" : "scale(1)",
            }}
          >
            <div style={{ fontSize: 30, marginBottom: 6, transition: "transform 0.2s ease", transform: answers.household === opt.id ? "scale(1.15)" : "scale(1)" }}>{opt.emoji}</div>
            <div style={{ color: COLORS.white, fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
          </button>
        ))}
      </div>
      {showKids && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <span style={{ color: COLORS.muted, fontSize: 14 }}>How many kids?</span>
          <InfoBtn info={INFO.householdKids} style={{ width: 20, height: 20, fontSize: 11 }} />
          <button onClick={() => setNumKids(Math.max(1, numKids - 1))} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, width: 40, height: 40, color: COLORS.white, fontSize: 20, cursor: "pointer" }}>-</button>
          <span style={{ color: COLORS.white, fontSize: 20, fontWeight: 700, minWidth: 24 }}>{numKids}</span>
          <button onClick={() => setNumKids(Math.min(5, numKids + 1))} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, width: 40, height: 40, color: COLORS.white, fontSize: 20, cursor: "pointer" }}>+</button>
        </div>
      )}
      {showPeople && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <span style={{ color: COLORS.muted, fontSize: 14 }}>How many people?</span>
          <button onClick={() => setNumPeople(Math.max(2, numPeople - 1))} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, width: 40, height: 40, color: COLORS.white, fontSize: 20, cursor: "pointer" }}>-</button>
          <span style={{ color: COLORS.white, fontSize: 20, fontWeight: 700, minWidth: 24 }}>{numPeople}</span>
          <button onClick={() => setNumPeople(Math.min(20, numPeople + 1))} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, width: 40, height: 40, color: COLORS.white, fontSize: 20, cursor: "pointer" }}>+</button>
        </div>
      )}
      <CTAButton onClick={() => { setAnswers((a) => ({ ...a, numKids, numPeople })); onNext(); }} disabled={!answers.household}>
        Next &rarr;
      </CTAButton>
    </ScreenWrap>
  );
}

function VibeScreen({ onNext, onBack, answers, setAnswers, addXP }) {
  const pairs = [
    {
      question: "How do you watch?",
      a: { id: "couch", emoji: "\u{1F4FA}", label: "Couch Commander", sub: "Home viewing" },
      b: { id: "stadium", emoji: "\u{1F3DF}\uFE0F", label: "Stadium Energy", sub: "Live attendance" },
      key: "viewStyle",
    },
    {
      question: "What pulls you in?",
      a: { id: "plays", emoji: "\u26A1", label: "The plays, goals, drama", sub: "Performance-driven" },
      b: { id: "stories", emoji: "\u{1F4AC}", label: "The stories & meaning", sub: "Narrative-driven" },
      key: "engagementDriver",
    },
    {
      question: "Game-day fuel?",
      a: { id: "pizza", emoji: "\u{1F355}", label: "Pizza & snacks", sub: "Keep it classic" },
      b: { id: "healthy", emoji: "\u{1F957}", label: "Healthy spread", sub: "Fuel the day right" },
      key: "food",
    },
    {
      question: "Your Saturday energy?",
      a: { id: "planned", emoji: "\u{1F3AF}", label: "Planned & purposeful", sub: "" },
      b: { id: "flow", emoji: "\u{1F30A}", label: "Go with the flow", sub: "" },
      key: "energy",
    },
  ];

  const [pairIdx, setPairIdx] = useState(0);
  const [showXP, setShowXP] = useState(false);

  const currentPair = pairs[pairIdx];
  const selected = currentPair ? answers[currentPair.key] : null;

  const handlePick = (val) => {
    setAnswers((a) => ({ ...a, [currentPair.key]: val }));
    addXP(5);
    setShowXP(true);
    setTimeout(() => setShowXP(false), 800);
    setTimeout(() => {
      if (pairIdx < pairs.length - 1) {
        setPairIdx(pairIdx + 1);
      } else {
        onNext();
      }
    }, 500);
  };

  if (!currentPair) return null;

  const renderCard = (opt, side) => {
    const picked = selected === opt.id;
    const otherPicked = selected && !picked;
    const accentColor = side === "left" ? COLORS.teal : COLORS.coral;
    return (
      <button
        key={opt.id}
        onClick={() => !selected && handlePick(opt.id)}
        style={{
          flex: 1,
          background: picked
            ? `linear-gradient(135deg, ${accentColor}18, ${COLORS.bgLight})`
            : COLORS.bgCard,
          border: `2px solid ${picked ? accentColor : COLORS.border}`,
          borderRadius: 20,
          padding: "28px 12px",
          cursor: selected ? "default" : "pointer",
          textAlign: "center",
          transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: otherPicked ? 0.3 : 1,
          transform: picked ? "scale(1.04) translateY(-4px)" : otherPicked ? "scale(0.97)" : "scale(1)",
          boxShadow: picked ? `0 8px 32px ${accentColor}33, 0 0 0 1px ${accentColor}22 inset` : "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: 3,
          background: picked ? accentColor : "transparent",
          borderRadius: "0 0 3px 3px", transition: "all 0.3s ease",
        }} />
        <div style={{ fontSize: 40, marginBottom: 10, transition: "transform 0.3s ease", transform: picked ? "scale(1.15)" : "scale(1)" }}>{opt.emoji}</div>
        <div style={{ color: picked ? COLORS.white : COLORS.white, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{opt.label}</div>
        {opt.sub && <div style={{ color: COLORS.muted, fontSize: 12 }}>{opt.sub}</div>}
      </button>
    );
  };

  return (
    <ScreenWrap>
      {onBack && <BackButton onClick={pairIdx > 0 ? () => setPairIdx(pairIdx - 1) : onBack} />}
      <InfoBtn info={INFO.vibe} style={{ position: "absolute", top: 6, right: 10, zIndex: 51 }} />
      <XPBadge amount={10} visible={showXP} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <p style={{ color: COLORS.muted, fontSize: 13 }}>
          {pairIdx + 1} of {pairs.length}
        </p>
        <InfoBtn
          info={[INFO.vibeViewStyle, INFO.vibeDriver, INFO.vibeFood, INFO.vibeEnergy][pairIdx]}
          style={{ width: 20, height: 20, fontSize: 11 }}
        />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.white, marginBottom: 28 }}>
        {currentPair.question}
      </h2>
      <div style={{ display: "flex", gap: 14, width: "100%", maxWidth: 360 }}>
        {renderCard(currentPair.a, "left")}
        {renderCard(currentPair.b, "right")}
      </div>
    </ScreenWrap>
  );
}

function ValuesScreen({ onNext, onBack, answers, setAnswers, addXP }) {
  const selected = answers.values || [];
  const [showXP, setShowXP] = useState(false);

  const toggle = (val) => {
    setAnswers((a) => {
      const cur = a.values || [];
      if (cur.includes(val)) return { ...a, values: cur.filter((v) => v !== val) };
      if (cur.length >= 3) return a;
      return { ...a, values: [...cur, val] };
    });
  };

  const handleNext = () => {
    addXP(15);
    setShowXP(true);
    setTimeout(() => { setShowXP(false); onNext(); }, 600);
  };

  return (
    <ScreenWrap>
      {onBack && <BackButton onClick={onBack} />}
      <InfoBtn info={INFO.values} style={{ position: "absolute", top: 6, right: 10, zIndex: 51 }} />
      <XPBadge amount={15} visible={showXP} />
      <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.white, marginBottom: 6 }}>
        What drives you?
      </h2>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 24 }}>
        Pick the 3 values that define you most
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", maxWidth: 340, marginBottom: 20 }}>
        {VALUES.map((val) => {
          const picked = selected.includes(val.id);
          return (
            <button
              key={val.id}
              onClick={() => toggle(val.id)}
              style={{
                background: picked
                  ? `linear-gradient(135deg, ${COLORS.gold}15, ${COLORS.bgLight})`
                  : COLORS.bgCard,
                border: `2px solid ${picked ? COLORS.gold : COLORS.border}`,
                borderRadius: 16,
                padding: "16px 6px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                boxShadow: picked ? `0 4px 20px ${COLORS.gold}25, 0 0 0 1px ${COLORS.gold}15 inset` : "none",
                position: "relative",
                transform: picked ? "scale(1.05) translateY(-2px)" : "scale(1)",
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 4, transition: "transform 0.2s ease", transform: picked ? "scale(1.2)" : "scale(1)" }}>{val.emoji}</div>
              <div style={{ color: picked ? COLORS.gold : COLORS.white, fontSize: 11, fontWeight: 600 }}>{val.label}</div>
              {picked && (
                <div style={{
                  position: "absolute", top: 4, right: 6, width: 18, height: 18,
                  borderRadius: "50%", background: COLORS.gold,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: COLORS.bg, fontSize: 11, fontWeight: 800,
                }}>{"\u2713"}</div>
              )}
            </button>
          );
        })}
      </div>
      <p style={{ color: selected.length === 3 ? COLORS.teal : COLORS.muted, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
        {selected.length}/3 selected
      </p>
      <CTAButton onClick={handleNext} disabled={selected.length !== 3}>
        Next &rarr;
      </CTAButton>
    </ScreenWrap>
  );
}

function CityScreen({ onNext, onBack, answers, setAnswers, addXP }) {
  const [showXP, setShowXP] = useState(false);
  const isHost = answers.city && !["Other US City", "International"].includes(answers.city);

  const handlePick = (city) => {
    setAnswers((a) => ({ ...a, city }));
  };

  const handleNext = () => {
    addXP(5);
    setShowXP(true);
    setTimeout(() => { setShowXP(false); onNext(); }, 500);
  };

  return (
    <ScreenWrap style={{ justifyContent: "flex-start", paddingTop: 70 }}>
      {onBack && <BackButton onClick={onBack} />}
      <InfoBtn info={INFO.city} style={{ position: "absolute", top: 6, right: 10, zIndex: 51 }} />
      <XPBadge amount={5} visible={showXP} />
      <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.white, marginBottom: 6 }}>
        Your City, Your Cup
      </h2>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 20 }}>
        Where are you cheering from?
      </p>
      <div style={{ width: "100%", maxWidth: 340, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 16 }}>
        {HOST_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => handlePick(city)}
            style={{
              background: answers.city === city
                ? `linear-gradient(135deg, ${COLORS.teal}15, ${COLORS.bgLight})`
                : COLORS.bgCard,
              border: `2px solid ${answers.city === city ? COLORS.teal : COLORS.border}`,
              borderRadius: 12,
              padding: "10px 6px",
              cursor: "pointer",
              color: answers.city === city ? COLORS.teal : COLORS.white,
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
              textAlign: "center",
              transform: answers.city === city ? "scale(1.04)" : "scale(1)",
              boxShadow: answers.city === city ? `0 4px 16px ${COLORS.teal}20` : "none",
            }}
          >
            {city}
          </button>
        ))}
      </div>
      {isHost && (
        <p style={{ color: COLORS.gold, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          {"\u{1F3DF}\uFE0F"} Matches in your city!
        </p>
      )}
      <CTAButton onClick={handleNext} disabled={!answers.city}>
        Next &rarr;
      </CTAButton>
    </ScreenWrap>
  );
}

function QuickFireScreen({ onNext, onBack, answers, setAnswers, addXP }) {
  const questions = [
    {
      question: "How do you find cool new stuff?",
      key: "discovery",
      options: [
        { id: "social", emoji: "\u{1F4F1}", label: "Social media" },
        { id: "friends", emoji: "\u{1F46F}", label: "Friends & family" },
        { id: "creators", emoji: "\u{1F399}\uFE0F", label: "Podcasts & creators" },
        { id: "events", emoji: "\u{1F6CD}\uFE0F", label: "In-store / live events" },
      ],
    },
    {
      question: "Which matters most when you buy?",
      key: "buyDriver",
      options: [
        { id: "quality", emoji: "\u2728", label: "Quality & value" },
        { id: "ethical", emoji: "\u{1F331}", label: "Ethical & sustainable" },
        { id: "style", emoji: "\u{1F3A8}", label: "Style & aesthetics" },
        { id: "innovation", emoji: "\u{1F4A1}", label: "Innovation & uniqueness" },
      ],
    },
    {
      question: "What World Cup content do you want?",
      key: "content",
      options: [
        { id: "bts", emoji: "\u{1F3AC}", label: "Behind-the-scenes stories" },
        { id: "stats", emoji: "\u{1F4CA}", label: "Stats & analysis" },
        { id: "culture", emoji: "\u{1F389}", label: "Fan culture & vibes" },
        { id: "family", emoji: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}", label: "Family activities" },
      ],
    },
  ];

  const [qIdx, setQIdx] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const q = questions[qIdx];

  const handlePick = (val) => {
    setAnswers((a) => ({ ...a, [q.key]: val }));
    setTimeout(() => {
      if (qIdx < questions.length - 1) {
        setQIdx(qIdx + 1);
      } else {
        addXP(10);
        setShowXP(true);
        setTimeout(() => { setShowXP(false); onNext(); }, 600);
      }
    }, 400);
  };

  const qInfoKeys = [INFO.quickfireDiscovery, INFO.quickfireBuy, INFO.quickfireContent];

  return (
    <ScreenWrap>
      {onBack && <BackButton onClick={qIdx > 0 ? () => setQIdx(qIdx - 1) : onBack} />}
      <InfoBtn info={INFO.quickfire} style={{ position: "absolute", top: 6, right: 10, zIndex: 51 }} />
      <XPBadge amount={10} visible={showXP} />
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: `${COLORS.coral}15`, border: `1px solid ${COLORS.coral}33`,
        borderRadius: 20, padding: "6px 16px", marginBottom: 12,
      }}>
        <Zap size={14} color={COLORS.coral} />
        <span style={{ background: GRADIENT.coral, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          Quick Fire Round
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, justifyContent: "center" }}>
        <p style={{ color: COLORS.muted, fontSize: 13 }}>{qIdx + 1} of {questions.length}</p>
        <InfoBtn info={qInfoKeys[qIdx]} style={{ width: 20, height: 20, fontSize: 11 }} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.white, marginBottom: 24 }}>
        {q.question}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 340 }}>
        {q.options.map((opt) => {
          const picked = answers[q.key] === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handlePick(opt.id)}
              style={{
                background: picked ? `linear-gradient(135deg, ${COLORS.coral}15, ${COLORS.bgLight})` : COLORS.bgCard,
                border: `2px solid ${picked ? COLORS.coral : COLORS.border}`,
                borderRadius: 18,
                padding: "22px 10px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                transform: picked ? "scale(1.03) translateY(-2px)" : "scale(1)",
                boxShadow: picked ? `0 6px 24px ${COLORS.coral}25` : "none",
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 6, transition: "transform 0.2s ease", transform: picked ? "scale(1.15)" : "scale(1)" }}>{opt.emoji}</div>
              <div style={{ color: COLORS.white, fontSize: 12, fontWeight: 600 }}>{opt.label}</div>
            </button>
          );
        })}
      </div>
    </ScreenWrap>
  );
}

function ResultsScreen({ answers, fanDNA, primaryMatch, secondaryMatch, factoids, onNext, onBack, onDashboard }) {
  const [phase, setPhase] = useState("loading");
  const [showShare, setShowShare] = useState(false);
  const [expandSecondary, setExpandSecondary] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase("dna"), 2200);
    return () => clearTimeout(t);
  }, []);

  if (phase === "loading") {
    return (
      <ScreenWrap>
        {/* Orbiting ring loader */}
        <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 28px" }}>
          {/* Outer ring */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `3px solid ${COLORS.border}`,
            borderTopColor: COLORS.gold,
            borderRightColor: COLORS.teal,
            animation: "spinSlow 1.5s linear infinite",
          }} />
          {/* Inner ring */}
          <div style={{
            position: "absolute", inset: 16, borderRadius: "50%",
            border: `2px solid ${COLORS.border}`,
            borderBottomColor: COLORS.coral,
            animation: "spinSlow 2s linear infinite reverse",
          }} />
          {/* Center ball */}
          <div style={{
            position: "absolute", inset: 32, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, animation: "pulse 1.2s ease infinite",
          }}>
            {"\u26BD"}
          </div>
          {/* Orbiting dots */}
          {[COLORS.gold, COLORS.teal, COLORS.coral].map((c, i) => (
            <div key={i} style={{
              position: "absolute", top: "50%", left: "50%", width: 0, height: 0,
              animation: `dotOrbit ${2 + i * 0.4}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 10px ${c}` }} />
            </div>
          ))}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.white, marginBottom: 6 }}>Finding your match...</h2>
        <p style={{ color: COLORS.muted, fontSize: 14 }}>Analyzing your fan DNA</p>
        <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "center" }}>
          {["Values", "Vibe", "Match"].map((label, i) => (
            <div key={label} style={{
              background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
              borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 600,
              color: COLORS.muted,
              animation: `fadeIn 0.4s ease ${0.5 + i * 0.3}s both`,
            }}>
              {label}
            </div>
          ))}
        </div>
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap style={{ justifyContent: "flex-start", paddingTop: 60 }}>
      {onBack && <BackButton onClick={onBack} />}
      <InfoBtn info={INFO.resultsMatch} style={{ position: "absolute", top: 6, right: 10, zIndex: 61 }} />
      {/* Dashboard icon */}
      <button
        onClick={onDashboard}
        style={{
          position: "absolute", bottom: 20, right: 20, zIndex: 60,
          background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
          borderRadius: 12, width: 44, height: 44, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <BarChart3 size={20} color={COLORS.muted} />
      </button>

      {/* Part A: Player Match (THE REVEAL) */}
      <div style={{ animation: "fadeInScale 0.8s cubic-bezier(0.22, 1, 0.36, 1)", width: "100%", maxWidth: 340, marginBottom: 28 }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>{"\u{1F389}"}</div>
        <h2 style={{
          fontSize: 28, fontWeight: 800, color: COLORS.white, marginBottom: 4, lineHeight: 1.1,
          background: GRADIENT.shimmer, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Your Match Is In!
        </h2>
        <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 16 }}>The player who shares your values</p>
        <div style={{
          background: GRADIENT.card, border: `2px solid ${COLORS.gold}44`, borderRadius: 24,
          padding: "28px 20px", position: "relative", overflow: "hidden",
          animation: "revealCard 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: `0 8px 40px ${COLORS.gold}15, 0 0 0 1px ${COLORS.gold}0a inset`,
        }}>
          {/* Holographic shimmer overlay */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 22,
            background: `linear-gradient(135deg, ${COLORS.gold}08 0%, ${COLORS.teal}06 25%, ${COLORS.coral}06 50%, ${COLORS.teal}06 75%, ${COLORS.gold}08 100%)`,
            backgroundSize: "400% 400%",
            pointerEvents: "none",
          }} />
          {/* Diagonal accent line */}
          <div style={{
            position: "absolute", top: 0, right: 0, width: 120, height: 120,
            background: `linear-gradient(135deg, transparent 40%, ${COLORS.gold}08 100%)`,
            borderRadius: "0 22px 0 0", pointerEvents: "none",
          }} />
          {/* Flag accent */}
          <div style={{ position: "absolute", top: 12, right: 16, fontSize: 28 }}>{primaryMatch.flag}</div>
          {/* Player photo */}
          <div style={{
            width: 100, height: 100, borderRadius: "50%", margin: "0 auto 14px",
            background: `linear-gradient(135deg, ${COLORS.teal}55, ${COLORS.gold}55)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            border: `3px solid ${COLORS.gold}66`,
            boxShadow: `0 0 30px ${COLORS.gold}22, 0 0 60px ${COLORS.teal}11`,
          }}>
            <img
              src={`/players/${primaryMatch.image}`}
              alt={primaryMatch.name}
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="font-size:36px;font-weight:800;color:white">#${primaryMatch.number}</span>`; }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: COLORS.white, marginBottom: 2 }}>{primaryMatch.name}</h3>
          <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 12 }}>{primaryMatch.country}</p>
          <div style={{
            background: GRADIENT.gold, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            fontSize: 20, fontWeight: 800, marginBottom: 14,
          }}>
            {primaryMatch.matchPct}% Match
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
            {primaryMatch.values.filter((v) => (answers.values || []).includes(v)).map((v) => {
              const valObj = VALUES.find((x) => x.id === v);
              return (
                <span key={v} style={{
                  background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}44`,
                  borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: COLORS.gold,
                }}>
                  {valObj?.emoji} {v}
                </span>
              );
            })}
          </div>
          <p style={{ color: COLORS.white, fontSize: 14, lineHeight: 1.5, marginBottom: 10, fontStyle: "italic" }}>
            "{primaryMatch.story}"
          </p>
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.teal}0a, ${COLORS.bgCard})`,
            border: `1px solid ${COLORS.teal}22`, borderLeft: `3px solid ${COLORS.teal}`,
            borderRadius: 12, padding: "12px 14px", marginTop: 10, textAlign: "left",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <p style={{ color: COLORS.teal, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Beyond the Pitch</p>
              <InfoBtn info={INFO.resultsBeyondPitch} style={{ width: 18, height: 18, fontSize: 10 }} />
            </div>
            <p style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.5 }}>{primaryMatch.beyond}</p>
          </div>
        </div>

        {/* Secondary match — expandable */}
        {secondaryMatch && (
          <div style={{
            background: COLORS.bgCard, border: `1px solid ${expandSecondary ? `${COLORS.gold}44` : COLORS.border}`,
            borderRadius: expandSecondary ? 24 : 16,
            padding: expandSecondary ? "0" : "0", marginTop: 14,
            transition: "all 0.3s ease", overflow: "hidden",
          }}>
            {/* Collapsed header — always visible, acts as toggle */}
            <button
              onClick={() => setExpandSecondary((v) => !v)}
              style={{
                width: "100%", background: "transparent", border: "none", cursor: "pointer",
                padding: "16px", display: "flex", alignItems: "center", gap: 14, textAlign: "left",
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${COLORS.coral}44, ${COLORS.teal}44)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                <img
                  src={`/players/${secondaryMatch.image}`}
                  alt={secondaryMatch.name}
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="font-size:16px;font-weight:800;color:white">#${secondaryMatch.number}</span>`; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: COLORS.muted, fontSize: 11, marginBottom: 2 }}>Secondary Match</p>
                <p style={{ color: COLORS.white, fontSize: 15, fontWeight: 700 }}>
                  {secondaryMatch.name} {secondaryMatch.flag}
                </p>
                <p style={{ color: COLORS.teal, fontSize: 13, fontWeight: 600 }}>{secondaryMatch.matchPct}% Match</p>
              </div>
              <ChevronRight
                size={20}
                color={COLORS.muted}
                style={{
                  transform: expandSecondary ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease", flexShrink: 0,
                }}
              />
            </button>

            {/* Expanded details */}
            <div style={{
              maxHeight: expandSecondary ? 500 : 0,
              opacity: expandSecondary ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 0.4s ease, opacity 0.3s ease",
            }}>
              <div style={{ padding: "0 20px 24px", textAlign: "center" }}>
                {/* Large photo */}
                <div style={{
                  width: 80, height: 80, borderRadius: "50%", margin: "0 auto 12px",
                  background: `linear-gradient(135deg, ${COLORS.coral}55, ${COLORS.teal}55)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", border: `3px solid ${COLORS.teal}66`,
                }}>
                  <img
                    src={`/players/${secondaryMatch.image}`}
                    alt={secondaryMatch.name}
                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="font-size:28px;font-weight:800;color:white">#${secondaryMatch.number}</span>`; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                {/* Match % */}
                <div style={{
                  background: GRADIENT.gold, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  fontSize: 18, fontWeight: 800, marginBottom: 12,
                }}>
                  {secondaryMatch.matchPct}% Match
                </div>
                {/* Shared values */}
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
                  {secondaryMatch.values.filter((v) => (answers.values || []).includes(v)).map((v) => {
                    const valObj = VALUES.find((x) => x.id === v);
                    return (
                      <span key={v} style={{
                        background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}44`,
                        borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: COLORS.gold,
                      }}>
                        {valObj?.emoji} {v}
                      </span>
                    );
                  })}
                </div>
                {/* Story */}
                <p style={{ color: COLORS.white, fontSize: 13, lineHeight: 1.5, marginBottom: 10, fontStyle: "italic" }}>
                  "{secondaryMatch.story}"
                </p>
                {/* Beyond the pitch */}
                <div style={{ background: COLORS.bgLight, borderRadius: 12, padding: "10px 14px", textAlign: "left" }}>
                  <p style={{ color: COLORS.teal, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Beyond the Pitch:</p>
                  <p style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.4 }}>{secondaryMatch.beyond}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Part B: Fan DNA */}
      <div style={{ animation: "fadeIn 1.4s ease", marginBottom: 24, width: "100%", maxWidth: 340 }}>
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.teal}12, transparent)`,
          border: `1px solid ${COLORS.teal}22`,
          borderRadius: 20, padding: "20px 16px", marginBottom: 4,
          position: "relative",
        }}>
          <h3 style={{
            color: COLORS.teal, fontSize: 14, fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", marginBottom: 8,
          }}>
            Your Fan DNA
          </h3>
          <InfoBtn info={INFO.resultsDNA} style={{ position: "absolute", top: 20, right: 20 }} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SpiderChart data={fanDNA} />
          </div>

          {/* ── YOUR TRIBE stats ── */}
          {(() => {
            const userVals = answers.values || [];
            // Generate deterministic-looking tribe numbers from user choices
            const baseSize = userVals.length * 12400 + (answers.viewStyle === "stadium" ? 18200 : answers.viewStyle === "couch" ? 24600 : 15800);
            const tribeSize = baseSize + Math.floor(primaryMatch.matchPct * 137);
            const sharedCount = Math.floor(tribeSize * 0.38);
            return (
              <div style={{
                display: "flex", gap: 10, marginTop: 16, justifyContent: "center",
              }}>
                <div style={{
                  flex: 1, background: `${COLORS.gold}0e`, border: `1px solid ${COLORS.gold}22`,
                  borderRadius: 14, padding: "14px 10px", textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 24, fontWeight: 800, color: COLORS.gold, lineHeight: 1,
                  }}>
                    {tribeSize.toLocaleString()}
                  </div>
                  <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 4, lineHeight: 1.3 }}>
                    fans in your tribe
                  </div>
                </div>
                <div style={{
                  flex: 1, background: `${COLORS.coral}0e`, border: `1px solid ${COLORS.coral}22`,
                  borderRadius: 14, padding: "14px 10px", textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 24, fontWeight: 800, color: COLORS.coral, lineHeight: 1,
                  }}>
                    {sharedCount.toLocaleString()}
                  </div>
                  <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 4, lineHeight: 1.3 }}>
                    share your values
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {factoids.map((f, i) => (
            <div key={i} style={{
              background: `linear-gradient(135deg, ${COLORS.bgCard}, ${COLORS.bgLight})`,
              borderRadius: 14, padding: "12px 14px", textAlign: "left",
              border: `1px solid ${COLORS.border}`,
              animation: `fadeIn 0.4s ease ${0.2 + i * 0.15}s both`,
              boxShadow: `0 2px 12px rgba(0,0,0,0.15)`,
            }}>
              <span style={{ marginRight: 8, fontSize: 16 }}>{f.emoji}</span>
              <span style={{ color: COLORS.white, fontSize: 13, lineHeight: 1.4 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Part C: Share */}
      <CTAButton onClick={() => setShowShare(true)} style={{ background: GRADIENT.teal, maxWidth: 280, marginBottom: 12 }}>
        {"\u{1F4F8}"} Share Your Match
      </CTAButton>
      <CTAButton onClick={onNext} style={{ maxWidth: 280 }}>
        See Your Rewards &rarr;
      </CTAButton>

      {/* Share modal */}
      {showShare && (
        <ShareCard
          fanDNA={fanDNA}
          primaryMatch={primaryMatch}
          values={answers.values || []}
          onClose={() => setShowShare(false)}
        />
      )}
    </ScreenWrap>
  );
}

function ShareCard({ fanDNA, primaryMatch, values, onClose }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: GRADIENT.card, borderRadius: 24, padding: "28px 20px 20px",
        maxWidth: 340, width: "100%", textAlign: "center",
        border: `2px solid ${COLORS.gold}44`, position: "relative",
        maxHeight: "90dvh", overflowY: "auto",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 12, right: 12, background: "none",
          border: "none", cursor: "pointer", color: COLORS.muted,
        }}>
          <X size={20} />
        </button>

        {/* Spider chart — sized to fit labels */}
        <div style={{ display: "flex", justifyContent: "center", margin: "0 -8px 4px" }}>
          <SpiderChart data={fanDNA} size={200} animated={false} />
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 800, color: COLORS.white, marginTop: 4 }}>
          {primaryMatch.name} {primaryMatch.flag}
        </h3>
        <div style={{
          background: GRADIENT.gold, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontSize: 18, fontWeight: 800, marginBottom: 8,
        }}>
          {primaryMatch.matchPct}% Match
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
          {values.map((v) => {
            const valObj = VALUES.find((x) => x.id === v);
            return (
              <span key={v} style={{
                background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}44`,
                borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: COLORS.gold,
              }}>
                {valObj?.emoji} {v}
              </span>
            );
          })}
        </div>
        <p style={{ color: COLORS.muted, fontSize: 11, marginBottom: 14 }}>
          Find Your World Cup Match &rarr; fanmatch.fifa.com
        </p>

        {/* Share buttons — wrapped grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {SHARE_PLATFORMS.map((p) => (
            <button key={p.id} style={{
              background: `${p.bg}18`, border: `1px solid ${p.bg}33`,
              borderRadius: 12, padding: "10px 4px 8px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              transition: "all 0.2s ease",
            }}>
              {p.logo ? (
                <img src={p.logo} alt={p.label} style={{ width: 20, height: 20, objectFit: "contain" }} />
              ) : (
                <Share2 size={18} color={COLORS.muted} />
              )}
              <span style={{ color: COLORS.muted, fontSize: 8, fontWeight: 600 }}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RewardsScreen({ xp, answers, primaryMatch, onNext, onBack, onDashboard }) {
  const tiers = [
    { threshold: 15, label: "Match Results Unlocked", unlocked: true },
    { threshold: 25, label: "Exclusive Player Content", unlocked: true },
    { threshold: 50, label: "15% FIFA Store Discount", unlocked: xp >= 50 },
    { threshold: 75, label: "VIP Prize Draw Entry", unlocked: xp >= 75 },
    { threshold: 100, label: "FIFA Insider \u2014 WC 2027 Presale", unlocked: xp >= 100 },
  ];

  const hasKids = ["kids", "crew"].includes(answers.household);
  const highStory = answers.engagementDriver === "stories";
  const isStadium = answers.viewStyle === "stadium";
  const isCouch = answers.viewStyle === "couch";
  const isSocial = ["friends", "crew"].includes(answers.household);
  const isHostCity = HOST_CITIES.slice(0, 16).includes(answers.city);
  const userValues = answers.values || [];

  // Sponsor-connected recommendations scored by profile relevance
  const allRecs = [
    {
      sponsor: "Adidas", logo: "/sponsors/adidas.png", title: `${primaryMatch.country} Authentic Jersey`,
      sub: `Match-day kit inspired by ${primaryMatch.name}`,
      why: "Your player match", emoji: "\u{1F455}",
      color: "#ffffff", priority: 10, show: true,
    },
    {
      sponsor: "Adidas", logo: "/sponsors/adidas.png", title: "World Cup Lifestyle Collection",
      sub: "Street-to-stadium athleisure line",
      why: "Your style-first buying preference", emoji: "\u{1F45F}",
      color: "#ffffff", priority: 9, show: answers.buyDriver === "style",
    },
    {
      sponsor: "Coca-Cola", logo: "/sponsors/cocacola.png", title: "Beyond the Pitch: Player Stories",
      sub: "Exclusive mini-doc series on player journeys",
      why: "You connect with stories, not just stats", emoji: "\u{1F3AC}",
      color: "#f40009", priority: 9, show: highStory,
    },
    {
      sponsor: "Hisense", logo: "/sponsors/hisense.png", title: "4K World Cup Viewing Setup",
      sub: "See every play in stunning detail",
      why: "Upgrade your home command center", emoji: "\u{1F4FA}",
      color: "#00a0e1", priority: 9, show: isCouch,
    },
    {
      sponsor: "DoorDash", logo: "/sponsors/doordash.png", title: "Game Day Delivery Pass",
      sub: "Unlimited free delivery during match windows",
      why: "Never leave the couch mid-match", emoji: "\u{1F6F5}",
      color: "#ff3008", priority: 8, show: isCouch,
    },
    {
      sponsor: "Hyundai", logo: "/sponsors/hyundai.png", title: "Fan Shuttle & Stadium Ride Pass",
      sub: "Free match-day rides to and from the venue",
      why: "Stress-free transport on game day", emoji: "\u{1F698}",
      color: "#002c5f", priority: 9, show: isStadium,
    },
    {
      sponsor: "Marriott Bonvoy", logo: "/sponsors/marriott.png", title: "World Cup Travel Package",
      sub: "Premium stays steps from the fan zone",
      why: "Travel perks for live-event fans", emoji: "\u{1F3E8}",
      color: "#b5a36a", priority: 7, show: isStadium || isHostCity,
    },
    {
      sponsor: "Visa", logo: "/sponsors/visa.png", title: "FIFA Fan Access Pass",
      sub: "Pre-sale tickets, contactless stadium entry",
      why: "Seamless access to the action", emoji: "\u2728",
      color: "#1a1f71", priority: 7, show: isStadium || isHostCity,
    },
    {
      sponsor: "Mengniu Dairy", logo: "/sponsors/mengniu.png", title: "World Cup Family Nutrition Box",
      sub: "Healthy match-day snacks & drinks for the whole crew",
      why: "Fuel your family's gameday energy", emoji: "\u{1F95B}",
      color: "#009944", priority: 9, show: hasKids,
    },
    {
      sponsor: "Airbnb", logo: "/sponsors/airbnb.png", title: "World Cup Family Stay",
      sub: "Kid-friendly homes near host city fan zones",
      why: "Experiences built for families like yours", emoji: "\u{1F3E0}",
      color: "#ff5a5f", priority: 8, show: hasKids && isHostCity,
    },
    {
      sponsor: "Lay's", logo: "/sponsors/lays.png", title: "Watch Party Snack Box",
      sub: "Premium gameday snack spread, delivered",
      why: "Because your crew fuels on snacks", emoji: "\u{1F9C0}",
      color: "#ffd700", priority: 8, show: isSocial || answers.food === "pizza",
    },
    {
      sponsor: "Coca-Cola", logo: "/sponsors/cocacola.png", title: "Watch Party Celebration Kit",
      sub: "Custom drinks bar, fan props & limited-edition cups",
      why: "Make your watch party legendary", emoji: "\u{1F942}",
      color: "#f40009", priority: 6, show: isSocial || answers.household === "partner",
    },
    {
      sponsor: "Globant", logo: "/sponsors/globant.png", title: "Immersive Fan AR Experience",
      sub: "AR player stories & virtual meet-ups",
      why: "Digital storytelling meets your values", emoji: "\u{1F30D}",
      color: "#62c462", priority: 7, show: highStory && answers.discovery === "social",
    },
    {
      sponsor: "Lenovo", logo: "/sponsors/lenovo.png", title: "Smart Fan Dashboard",
      sub: "Real-time stats, AI predictions, second-screen",
      why: "Data-driven tools for analytical fans", emoji: "\u{1F4BB}",
      color: "#e2231a", priority: 8, show: answers.content === "stats" || answers.buyDriver === "innovation",
    },
    {
      sponsor: "Verizon", logo: "/sponsors/verizon.png", title: "5G Match Day Streaming Pass",
      sub: "Multi-angle streams, zero buffering",
      why: "Stay connected to every play", emoji: "\u{1F4F1}",
      color: "#cd040b", priority: 7, show: isCouch || answers.discovery === "social",
    },
    {
      sponsor: "Dove Men+Care", logo: "/sponsors/dove.png", title: "Player Wellness Collection",
      sub: "Self-care routines inspired by the pros",
      why: "Values-aligned brands that care about wellbeing", emoji: "\u{1F9F4}",
      color: "#004c97", priority: 7, show: answers.buyDriver === "ethical" || userValues.includes("Authenticity"),
    },
    {
      sponsor: "Bank of America", logo: "/sponsors/bankofamerica.png", title: "World Cup Fan Rewards Card",
      sub: "3x points on all WC purchases + early access",
      why: "Smart rewards for quality-first fans", emoji: "\u{1F4B3}",
      color: "#012169", priority: 6, show: answers.buyDriver === "quality",
    },
    {
      sponsor: "The Home Depot", logo: "/sponsors/homedepot.png", title: "Ultimate Watch Party Setup",
      sub: "DIY outdoor screen build kit + fan zone decor",
      why: "Build the ultimate gameday experience", emoji: "\u{1F3E0}",
      color: "#f96302", priority: 6, show: isSocial && isCouch,
    },
    {
      sponsor: "Coca-Cola", logo: "/sponsors/cocacola.png", title: "Fan Celebration Moments",
      sub: "Share your goal reactions globally in real-time",
      why: "Celebrate together, no matter where", emoji: "\u{1F389}",
      color: "#f40009", priority: 7, show: isSocial && !highStory,
    },
    {
      sponsor: "Hyundai", logo: "/sponsors/hyundai.png", title: "Family Road Trip to the Cup",
      sub: "Free test drive + family travel planner to host cities",
      why: "Adventure awaits your crew", emoji: "\u{1F697}",
      color: "#002c5f", priority: 8, show: hasKids && !isHostCity,
    },
    {
      sponsor: "Qatar Airways", logo: "/sponsors/qatarairways.png", title: "World Cup Flight Deals",
      sub: "Exclusive fares to host cities for fan groups",
      why: "Fly your crew to the action", emoji: "\u2708\uFE0F",
      color: "#5c0632", priority: 7, show: !isHostCity && (isStadium || isSocial),
    },
    {
      sponsor: "Airbnb", logo: "/sponsors/airbnb.png", title: "Fan Culture Experience",
      sub: "Local food tours & cultural immersion in host cities",
      why: "Go beyond the match", emoji: "\u{1F30E}",
      color: "#ff5a5f", priority: 7, show: isHostCity && !hasKids,
    },
    {
      sponsor: "Mengniu Dairy", logo: "/sponsors/mengniu.png", title: "Player Energy Challenge",
      sub: "Nutrition tips from pros + family smoothie kits",
      why: "Healthy fuel your kids will actually love", emoji: "\u{1F34E}",
      color: "#009944", priority: 8, show: hasKids && answers.food === "healthy",
    },
  ];

  const recs = allRecs
    .filter((r) => r.show)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);

  return (
    <ScreenWrap style={{ justifyContent: "flex-start", paddingTop: 60 }}>
      {onBack && <BackButton onClick={onBack} />}
      <InfoBtn info={INFO.rewards} style={{ position: "absolute", top: 6, right: 10, zIndex: 61 }} />
      <button
        onClick={onDashboard}
        style={{
          position: "absolute", bottom: 20, right: 20, zIndex: 60,
          background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
          borderRadius: 12, width: 44, height: 44, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <BarChart3 size={20} color={COLORS.muted} />
      </button>

      <h2 style={{
        fontSize: 28, fontWeight: 800, marginBottom: 4, lineHeight: 1.1,
        background: GRADIENT.shimmer, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        Your XP. Your Rewards.
      </h2>
      <p style={{ color: COLORS.gold, fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
        <span style={{ display: "inline-block", animation: "pulse 2s ease infinite" }}>{"\u{1F3C6}"}</span> {xp} XP Earned!
      </p>

      {/* Tiers */}
      <div style={{ width: "100%", maxWidth: 340, marginBottom: 24 }}>
        {tiers.map((t, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
            background: t.unlocked ? `${COLORS.teal}11` : COLORS.bgCard,
            border: `1px solid ${t.unlocked ? COLORS.teal + "44" : COLORS.border}`,
            borderRadius: 12, marginBottom: 8,
          }}>
            <div style={{ fontSize: 16 }}>{t.unlocked ? "\u2705" : "\u{1F512}"}</div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ color: t.unlocked ? COLORS.white : COLORS.muted, fontSize: 13, fontWeight: 600 }}>{t.label}</p>
            </div>
            <span style={{ color: COLORS.muted, fontSize: 12 }}>{t.threshold} XP</span>
          </div>
        ))}
      </div>

      {/* Coupon */}
      {xp >= 50 && (
        <div style={{
          background: `${COLORS.gold}15`, border: `2px solid ${COLORS.gold}44`,
          borderRadius: 16, padding: "18px 20px", maxWidth: 340, width: "100%", marginBottom: 24,
          animation: "fadeIn 0.6s ease",
        }}>
          <p style={{ color: COLORS.gold, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
            {"\u{1F389}"} You unlocked: 15% off FIFA World Cup Merch
          </p>
          <div style={{
            background: COLORS.bgCard, borderRadius: 10, padding: "10px 16px",
            letterSpacing: 4, fontWeight: 800, fontSize: 20, color: COLORS.gold,
            border: `1px dashed ${COLORS.gold}66`,
          }}>
            FANMATCH15
          </div>
        </div>
      )}

      {/* Sponsor Recommendations */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <h3 style={{ color: COLORS.muted, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          Recommended for you
        </h3>
        <InfoBtn info={INFO.rewardsRecs} style={{ width: 20, height: 20, fontSize: 11 }} />
      </div>
      <p style={{ color: COLORS.muted, fontSize: 11, marginBottom: 14, opacity: 0.6 }}>
        Based on your Fan DNA profile
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 340, marginBottom: 24 }}>
        {recs.map((r, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg, ${COLORS.bgCard}, ${COLORS.bgLight})`,
            border: `1px solid ${COLORS.border}`, borderRadius: 18,
            padding: "16px 16px 14px", textAlign: "left",
            position: "relative", overflow: "hidden",
            animation: `fadeIn 0.4s ease ${i * 0.1}s both`,
          }}>
            {/* Subtle sponsor color accent */}
            <div style={{
              position: "absolute", top: 0, left: 0, width: 4, height: "100%",
              background: r.color, borderRadius: "4px 0 0 4px", opacity: 0.5,
            }} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                background: `${r.color}12`, border: `1px solid ${r.color}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", position: "relative",
              }}>
                {r.logo ? (
                  <img
                    src={r.logo}
                    alt={r.sponsor}
                    onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 4 }}
                  />
                ) : null}
                <div style={{
                  display: r.logo ? "none" : "flex",
                  alignItems: "center", justifyContent: "center",
                  width: "100%", height: "100%", fontSize: 22,
                }}>
                  {r.emoji}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <p style={{ color: COLORS.white, fontSize: 14, fontWeight: 700 }}>{r.title}</p>
                </div>
                <p style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.4, marginBottom: 6 }}>{r.sub}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    background: `${COLORS.teal}15`, border: `1px solid ${COLORS.teal}28`,
                    borderRadius: 10, padding: "2px 8px", fontSize: 10, fontWeight: 600,
                    color: COLORS.teal,
                  }}>
                    {r.why}
                  </span>
                  <span style={{
                    color: COLORS.muted, fontSize: 10, fontWeight: 600, opacity: 0.6,
                    display: "flex", alignItems: "center", gap: 3,
                  }}>
                    Presented by {r.sponsor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CTAButton onClick={onNext}>Keep Playing &rarr;</CTAButton>
    </ScreenWrap>
  );
}

function KeepPlayingScreen({ answers, fanDNA, primaryMatch, addXP, onBack, onDashboard, onDataValue }) {
  const fanCount = useLiveFanCount();
  const [showShare, setShowShare] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    setShowShare(true);
  };

  const handleShareAction = () => {
    if (!shared) {
      addXP(15);
      setShared(true);
    }
  };

  const playerName = primaryMatch?.name || "your player";
  const playerFlag = primaryMatch?.flag || "";
  const playerImage = primaryMatch?.image || "";
  const cityName = answers?.city || "your city";

  // 4 engagement cards: TL=Lottery, TR=MatchDayBox, BL=Community, BR=SquadBuilder
  const cards = [
    { emoji: "\u{1F3DF}\uFE0F", title: "Meet Your Match", sub: `Win a meet & greet with ${playerName} ${playerFlag} at ${cityName}`, badge: "Enter Lottery", badgeColor: COLORS.coral },
    { emoji: "\u{1F4E6}", title: "Match Day Box", sub: "Snacks, merch & activities delivered for game day watch parties", badge: "Pre-order", badgeColor: COLORS.gold },
    { emoji: "\u{1F465}", title: "Fan Community", sub: `Connect with fans who share your vibe near ${cityName}`, badge: "Join Waitlist", badgeColor: COLORS.teal },
    { emoji: "\u{1F3DF}\uFE0F", title: "Squad Builder", sub: "Build your family's starting XI and share your dream team", badge: "Coming Soon", badgeColor: COLORS.teal },
  ];

  return (
    <ScreenWrap style={{ justifyContent: "flex-start", paddingTop: 60 }}>
      {onBack && <BackButton onClick={onBack} />}
      <InfoBtn info={INFO.keepPlaying} style={{ position: "absolute", top: 6, right: 10, zIndex: 61 }} />
      <button
        onClick={onDashboard}
        style={{
          position: "absolute", bottom: 20, right: 20, zIndex: 60,
          background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
          borderRadius: 12, width: 44, height: 44, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <BarChart3 size={20} color={COLORS.muted} />
      </button>

      <h2 style={{ fontSize: 26, fontWeight: 800, color: COLORS.white, marginBottom: 6 }}>
        Your World Cup Journey Continues
      </h2>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 24 }}>
        More ways to earn XP and unlock rewards
      </p>

      {/* ── HERO: Video Message from Matched Player ── */}
      <div style={{
        width: "100%", maxWidth: 340, marginBottom: 16,
        borderRadius: 20, overflow: "hidden",
        background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
      }}>
        {/* Video thumbnail area */}
        <div style={{
          position: "relative", width: "100%", aspectRatio: "16 / 9",
          background: `linear-gradient(135deg, ${COLORS.bgLight} 0%, ${COLORS.bg} 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {/* Player image as thumbnail background */}
          {playerImage && (
            <img
              src={`/players/${playerImage}`}
              alt={playerName}
              onError={(e) => { e.target.style.display = 'none'; }}
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "top center",
                filter: "brightness(0.55)",
              }}
            />
          )}
          {/* Gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)",
          }} />
          {/* Play button */}
          <div style={{
            position: "relative", zIndex: 2,
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(255,255,255,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}>
            <div style={{
              width: 0, height: 0, marginLeft: 4,
              borderTop: "12px solid transparent",
              borderBottom: "12px solid transparent",
              borderLeft: `20px solid ${COLORS.bg}`,
            }} />
          </div>
          {/* Duration badge */}
          <span style={{
            position: "absolute", bottom: 10, right: 12, zIndex: 2,
            background: "rgba(0,0,0,0.7)", borderRadius: 6,
            padding: "3px 8px", fontSize: 11, fontWeight: 700, color: "#fff",
          }}>
            0:34
          </span>
          {/* Player name overlay */}
          <div style={{
            position: "absolute", bottom: 10, left: 14, zIndex: 2,
          }}>
            <p style={{ color: "#fff", fontSize: 12, fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              A message from {playerName} {playerFlag}
            </p>
          </div>
        </div>
        {/* Card body below thumbnail */}
        <div style={{ padding: "14px 18px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h3 style={{ color: COLORS.white, fontSize: 16, fontWeight: 800 }}>Personal Thank You</h3>
            <span style={{
              background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}55`,
              borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: COLORS.gold,
            }}>
              Unlocked
            </span>
          </div>
          <p style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.5 }}>
            A personal video from {playerName} thanking you for joining the FanMatch community
          </p>
        </div>
      </div>

      {/* ── 4 ENGAGEMENT CARDS (2x2 grid) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 340, marginBottom: 18 }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
            borderRadius: 16, padding: "16px 14px", textAlign: "left",
            display: "flex", flexDirection: "column",
          }}>
            <span style={{ fontSize: 26, marginBottom: 6 }}>{c.emoji}</span>
            <h3 style={{ color: COLORS.white, fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{c.title}</h3>
            <p style={{ color: COLORS.muted, fontSize: 11, lineHeight: 1.45, marginBottom: 10, flex: 1 }}>{c.sub}</p>
            <span style={{
              background: `${c.badgeColor}22`, border: `1px solid ${c.badgeColor}44`,
              borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: c.badgeColor,
              alignSelf: "flex-start",
            }}>
              {c.badge}
            </span>
          </div>
        ))}
      </div>

      {/* DATA VALUE CTA */}
      <button
        onClick={onDataValue}
        style={{
          width: "100%", maxWidth: 340, padding: "16px 18px", marginBottom: 18,
          background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
          borderRadius: 18, cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: 14,
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${COLORS.gold}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>
          {"\u270A"}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: COLORS.white, fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
            See Why Your Data Matters
          </p>
          <p style={{ color: COLORS.muted, fontSize: 11, lineHeight: 1.4 }}>
            You're part of a movement changing how fans are served
          </p>
        </div>
        <ChevronRight size={18} color={COLORS.gold} />
      </button>

      {/* Share CTA */}
      <CTAButton onClick={handleShare} style={{ background: GRADIENT.teal, maxWidth: 280, marginBottom: 8 }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Share2 size={18} /> Share FanMatch with a Friend
        </span>
      </CTAButton>
      {!shared && (
        <p style={{ color: COLORS.teal, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
          +15 XP for sharing!
        </p>
      )}
      {shared && (
        <p style={{ color: COLORS.gold, fontSize: 12, fontWeight: 600, marginBottom: 12, animation: "fadeIn 0.4s ease" }}>
          +15 XP earned for sharing!
        </p>
      )}

      <p style={{ color: COLORS.muted, fontSize: 11, marginTop: 12, opacity: 0.5 }}>
        Built for the future of fandom. Powered by Wasserman x SSAC 2026.
      </p>

      {/* Share modal */}
      {showShare && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }} onClick={() => setShowShare(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: GRADIENT.card, borderRadius: 24, padding: "28px 20px 20px",
            maxWidth: 340, width: "100%", textAlign: "center",
            border: `2px solid ${COLORS.teal}44`, position: "relative",
            maxHeight: "90dvh", overflowY: "auto",
          }}>
            <button onClick={() => setShowShare(false)} style={{
              position: "absolute", top: 12, right: 12, background: "none",
              border: "none", cursor: "pointer", color: COLORS.muted,
            }}>
              <X size={20} />
            </button>
            <div style={{ display: "flex", justifyContent: "center", margin: "0 -8px 4px" }}>
              {fanDNA && <SpiderChart data={fanDNA} size={200} animated={false} />}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: COLORS.white, marginTop: 4, marginBottom: 4 }}>
              Share Your Fan Persona
            </h3>
            {primaryMatch && (
              <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 4 }}>
                Matched with {primaryMatch.name} {primaryMatch.flag}
              </p>
            )}
            <p style={{ color: COLORS.teal, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              Invite friends to find their match too!
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {SHARE_PLATFORMS.map((p) => (
                <button key={p.id} onClick={handleShareAction} style={{
                  background: `${p.bg}18`, border: `1px solid ${p.bg}33`,
                  borderRadius: 12, padding: "10px 4px 8px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  transition: "all 0.2s ease",
                }}>
                  {p.logo ? (
                    <img src={p.logo} alt={p.label} style={{ width: 20, height: 20, objectFit: "contain" }} />
                  ) : (
                    <Share2 size={18} color={COLORS.muted} />
                  )}
                  <span style={{ color: COLORS.muted, fontSize: 8, fontWeight: 600 }}>{p.label}</span>
                </button>
              ))}
            </div>
            {shared && (
              <p style={{ color: COLORS.gold, fontSize: 12, fontWeight: 700, marginTop: 12, animation: "fadeIn 0.4s ease" }}>
                +15 XP earned!
              </p>
            )}
          </div>
        </div>
      )}
    </ScreenWrap>
  );
}

// ─────────────────────────────────────────────
// DATA VALUE DASHBOARD (Fan-Facing Persuasion)
// ─────────────────────────────────────────────

function DataValueDashboard({ answers, onBack }) {
  const [opted, setOpted] = useState(null); // null = undecided, true = yes, false = no
  const [animGap, setAnimGap] = useState(false);
  const fanCount = useLiveFanCount();

  useEffect(() => {
    const t = setTimeout(() => setAnimGap(true), 400);
    return () => clearTimeout(t);
  }, []);

  const cityName = answers?.city || "your city";
  const isHostCity = HOST_CITIES.slice(0, 16).includes(answers?.city);

  return (
    <div style={{
      minHeight: "100%", background: COLORS.bg, padding: "0 0 40px",
      animation: "fadeIn 0.4s ease",
    }}>
      {/* Back button */}
      <div style={{ padding: "16px 16px 0", display: "flex", justifyContent: "flex-start" }}>
        <button onClick={onBack} style={{
          background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
          borderRadius: 10, padding: "8px 14px", color: COLORS.muted,
          fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>
          &larr; Back
        </button>
      </div>

      {/* HERO */}
      <div style={{
        textAlign: "center", padding: "32px 24px 28px",
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.bgLight} 100%)`,
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{"\u270A"}</div>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: COLORS.white, lineHeight: 1.2, marginBottom: 10,
        }}>
          Your Voice Is Now<br />
          <span style={{ background: GRADIENT.shimmer, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            in the Room
          </span>
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
          For the first time, FIFA sponsors and broadcasters are hearing
          directly from fans like you, not assumptions about you.
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginTop: 18,
          background: `${COLORS.gold}15`, border: `1px solid ${COLORS.gold}33`,
          borderRadius: 20, padding: "8px 18px",
        }}>
          <span style={{ fontSize: 18 }}>{"\u{1F3C6}"}</span>
          <span style={{ color: COLORS.gold, fontSize: 14, fontWeight: 700 }}><RollingCounter count={fanCount} height={14} /> fans have shared their story</span>
        </div>
      </div>

      <div style={{ padding: "0 18px" }}>

        {/* THE GAP — Problem Visualization */}
        <div style={{
          background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
          borderRadius: 20, padding: "24px 20px", marginBottom: 20, overflow: "hidden",
        }}>
          <h3 style={{ color: COLORS.white, fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
            The Problem You're Solving
          </h3>
          <p style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 20 }}>
            There's a massive gap between women's buying power and how sports brands treat them.
          </p>

          {/* Stat bar 1 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: COLORS.white, fontSize: 12, fontWeight: 600 }}>Women who are household decision-makers</span>
              <span style={{ color: COLORS.teal, fontSize: 14, fontWeight: 800 }}>94.3%</span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: COLORS.border, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 5,
                background: GRADIENT.teal,
                width: animGap ? "94.3%" : "0%",
                transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }} />
            </div>
          </div>

          {/* Stat bar 2 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: COLORS.white, fontSize: 12, fontWeight: 600 }}>Who feel sports brands actually serve them</span>
              <span style={{ color: COLORS.coral, fontSize: 14, fontWeight: 800 }}>32.4%</span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: COLORS.border, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 5,
                background: GRADIENT.coral,
                width: animGap ? "32.4%" : "0%",
                transition: "width 1.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              }} />
            </div>
          </div>

          {/* The gap callout */}
          <div style={{
            background: `${COLORS.gold}12`, border: `1px dashed ${COLORS.gold}44`,
            borderRadius: 14, padding: "14px 16px", textAlign: "center",
          }}>
            <p style={{ color: COLORS.gold, fontSize: 22, fontWeight: 800, marginBottom: 2 }}>61.9% Gap</p>
            <p style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.5 }}>
              Your data is how we close it. Every fan profile tells brands:
              <span style={{ color: COLORS.white, fontWeight: 700 }}> "This is what we actually want."</span>
            </p>
          </div>
        </div>

        {/* WHAT YOUR DATA UNLOCKS — 3 Pillars */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: COLORS.white, fontSize: 17, fontWeight: 800, marginBottom: 14 }}>
            What Your Data Unlocks
          </h3>

          {[
            {
              emoji: "\u{1F3AF}", title: "Personalized Experience",
              text: "Products, content, and events matched to YOUR values \u2014 not assumptions.",
              color: COLORS.teal,
            },
            {
              emoji: "\u{1F64B}", title: "Real Representation",
              text: "2,200+ women said brands miss the mark. Your profile tells the industry: do better.",
              color: COLORS.coral,
            },
            {
              emoji: "\u{1F381}", title: "Exclusive Access & Rewards",
              text: "Early ticket drops, curated merch, and behind-the-scenes content \u2014 just for active fans.",
              color: COLORS.gold,
            },
          ].map((pillar, i) => (
            <div key={i} style={{
              background: COLORS.bgCard, border: `1px solid ${pillar.color}33`,
              borderLeft: `4px solid ${pillar.color}`,
              borderRadius: 16, padding: "18px 16px", marginBottom: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{pillar.emoji}</span>
                <h4 style={{ color: COLORS.white, fontSize: 15, fontWeight: 700 }}>{pillar.title}</h4>
              </div>
              <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.55 }}>{pillar.text}</p>
            </div>
          ))}
        </div>

        {/* IMPACT ALREADY IN MOTION */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: COLORS.white, fontSize: 17, fontWeight: 800, marginBottom: 14 }}>
            Your Impact, Already in Motion
          </h3>

          {[
            {
              emoji: "\u{1F91D}", text: "3 FIFA sponsors committed to female-first World Cup activations based on fan data",
              tag: "Partnership",
            },
            {
              emoji: "\u{1F46A}", text: "40% more family focused content and experiences planned at host venues for 2026",
              tag: "Families",
            },
            {
              emoji: "\u{1F3DF}\uFE0F",
              text: isHostCity
                ? `${cityName} is getting a dedicated Family Fan Zone, shaped by fans like you`
                : "Host cities are building dedicated Fan Zones shaped by real fan data",
              tag: isHostCity ? cityName : "Fan Zones",
            },
            {
              emoji: "\u{1F4F1}", text: "Player story content up 65% after fans said they want narratives, not just stats",
              tag: "Content",
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
              borderRadius: 14, padding: "16px 14px", marginBottom: 8,
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: COLORS.white, fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>{item.text}</p>
                <span style={{
                  background: `${COLORS.teal}18`, border: `1px solid ${COLORS.teal}33`,
                  borderRadius: 10, padding: "2px 10px", fontSize: 10, fontWeight: 700, color: COLORS.teal,
                }}>
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — The Big Ask */}
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.bgCard}, ${COLORS.bgLight})`,
          border: `2px solid ${COLORS.gold}44`,
          borderRadius: 24, padding: "28px 22px", textAlign: "center", marginBottom: 20,
        }}>
          <h3 style={{ color: COLORS.white, fontSize: 22, fontWeight: 800, marginBottom: 6, lineHeight: 1.3 }}>
            Stay In. <span style={{ color: COLORS.gold }}>Stay Heard.</span>
          </h3>
          <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.55, marginBottom: 22, maxWidth: 280, margin: "0 auto 22px" }}>
            Keep your profile active and be part of the movement that's
            making the World Cup better for fans who've been overlooked.
          </p>

          {opted === null ? (
            <>
              <button
                onClick={() => setOpted(true)}
                style={{
                  width: "100%", maxWidth: 280, padding: "16px 24px", border: "none",
                  borderRadius: 16, fontSize: 17, fontWeight: 800, cursor: "pointer",
                  background: GRADIENT.gold, color: COLORS.bg,
                  marginBottom: 12, display: "block", margin: "0 auto 12px",
                  boxShadow: "0 4px 20px rgba(255,209,102,0.3)",
                }}
              >
                Yes, Keep Me In {"\u{1F64C}"}
              </button>
              <button
                onClick={() => setOpted(false)}
                style={{
                  background: "transparent", border: "none", color: COLORS.muted,
                  fontSize: 12, cursor: "pointer", opacity: 0.6, display: "block", margin: "0 auto",
                }}
              >
                No thanks, remove my data
              </button>
            </>
          ) : opted ? (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>{"\u{1F389}"}</div>
              <p style={{ color: COLORS.gold, fontSize: 18, fontWeight: 800, marginBottom: 6 }}>You're In!</p>
              <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.5 }}>
                You'll be the first to know about personalized World Cup experiences,
                early access drops, and content made for fans like you.
              </p>
            </div>
          ) : (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
                We respect that. Your data will be removed.
              </p>
              <button
                onClick={() => setOpted(true)}
                style={{
                  background: "transparent", border: `1px solid ${COLORS.gold}66`,
                  borderRadius: 12, padding: "10px 20px", color: COLORS.gold,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Actually, keep me in
              </button>
            </div>
          )}
        </div>

        <p style={{ color: COLORS.muted, fontSize: 11, textAlign: "center", opacity: 0.4, paddingBottom: 10 }}>
          FanMatch. Built for the future of fandom. Powered by Wasserman x SSAC 2026.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD (Judge-Facing)
// ─────────────────────────────────────────────

function GeoMap({ cities, theme }) {
  const T = theme || {};
  const landFill = T.card || COLORS.bgLight;
  const landStroke = T.border || COLORS.border;
  const labelColor = T.text || COLORS.white;
  const subLabelColor = T.textMuted || COLORS.muted;
  const bgColor = T.bg || COLORS.bg;
  const glowColor = T.mint || COLORS.teal;

  const cityCoords = {
    "New York / NJ": [665, 178], "Los Angeles": [135, 235], "Miami": [590, 305],
    "Dallas": [380, 280], "Houston": [395, 310], "Atlanta": [545, 250],
    "Philadelphia": [650, 175], "Seattle": [120, 115], "San Francisco": [95, 205],
    "Kansas City": [410, 210], "Boston": [685, 155], "Toronto": [600, 140],
    "Vancouver": [110, 100], "Monterrey": [340, 385], "Guadalajara": [280, 415],
    "Mexico City": [315, 430],
  };
  return (
    <svg viewBox="0 0 800 520" style={{ width: "100%", height: "auto" }}>
      <defs>
        <radialGradient id="geoGlow">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* ── Canada ── */}
      <path d={`M100,90 L130,65 L180,50 L250,35 L330,25 L420,20 L500,22 L560,30 L620,50
        L660,70 L690,95 L700,120 L680,130 L650,125 L620,115 L600,125 L600,138
        L580,125 L540,110 L500,100 L460,95 L420,90 L380,92 L340,88 L300,82
        L260,80 L220,78 L180,75 L140,80 L110,88 Z`}
        fill={landFill} stroke={landStroke} strokeWidth="1.2" opacity="0.5" />
      {/* ── USA mainland ── */}
      <path d={`M110,88 L140,80 L180,75 L220,78 L260,80 L300,82 L340,88 L380,92
        L420,90 L460,95 L500,100 L540,110 L580,125 L600,138 L620,140
        L650,135 L680,145 L700,155 L710,170 L700,185 L685,190
        L670,185 L655,190 L645,200 L640,220 L620,235 L600,240
        L580,250 L565,260 L550,275 L540,265 L520,260 L500,265
        L480,260 L460,268 L440,275 L420,278 L400,282 L380,278
        L360,272 L340,268 L320,270 L300,275 L280,268 L260,262
        L240,260 L220,258 L200,260 L180,255 L160,252 L140,248
        L125,242 L115,235 L108,225 L100,210 L95,195 L100,175
        L105,155 L100,135 L95,120 L100,105 Z`}
        fill={landFill} stroke={landStroke} strokeWidth="1.5" opacity="0.85" />
      {/* ── Florida peninsula ── */}
      <path d={`M565,260 L575,270 L585,285 L592,300 L595,315 L590,325 L580,318
        L570,305 L560,290 L555,278 L558,268 Z`}
        fill={landFill} stroke={landStroke} strokeWidth="1.2" opacity="0.85" />
      {/* ── Michigan upper ── */}
      <path d={`M500,100 L510,105 L525,115 L535,125 L530,135 L520,140 L508,138
        L500,130 L495,120 L498,108 Z`}
        fill={landFill} stroke={landStroke} strokeWidth="1" opacity="0.6" />
      {/* ── Mexico ── */}
      <path d={`M100,210 L108,225 L115,235 L125,242 L140,248 L160,252 L180,255
        L200,260 L220,258 L240,260 L260,262 L280,268 L300,275 L320,270
        L340,272 L360,278 L380,285 L390,300 L395,320 L385,340
        L370,360 L350,380 L335,395 L320,410 L305,425 L290,435
        L275,440 L260,438 L248,430 L240,418 L235,405 L225,395
        L215,385 L205,370 L195,355 L185,340 L170,325 L155,312
        L140,300 L125,285 L112,270 L105,255 L98,240 L95,225 Z`}
        fill={landFill} stroke={landStroke} strokeWidth="1.2" opacity="0.6" />
      {/* ── State/province borders (subtle) ── */}
      {[
        "M300,82 L300,275", "M420,90 L420,278", "M540,110 L540,265",
        "M200,78 L200,260", "M460,95 L460,268",
      ].map((d, i) => (
        <path key={`border${i}`} d={d} stroke={landStroke} strokeWidth="0.5" opacity="0.2" fill="none" />
      ))}
      {/* ── Great Lakes (cutouts) ── */}
      <ellipse cx="530" cy="125" rx="18" ry="10" fill={bgColor} opacity="0.7" />
      <ellipse cx="555" cy="138" rx="12" ry="8" fill={bgColor} opacity="0.6" />
      <ellipse cx="510" cy="140" rx="10" ry="6" fill={bgColor} opacity="0.6" />
      {/* ── City dots ── */}
      {cities.map((c) => {
        const pos = cityCoords[c.name];
        if (!pos) return null;
        const r = Math.max(5, Math.min(14, c.fans / 200));
        return (
          <g key={c.name}>
            <circle cx={pos[0]} cy={pos[1]} r={r * 2.8} fill="url(#geoGlow)" />
            <circle cx={pos[0]} cy={pos[1]} r={r} fill={c.color || glowColor} opacity="0.8">
              <animate attributeName="r" values={`${r};${r * 1.12};${r}`} dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.95;0.8" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx={pos[0]} cy={pos[1]} r={2.5} fill="#fff" opacity="0.95" />
            <text x={pos[0]} y={pos[1] - r - 6} fill={labelColor} fontSize="10" fontWeight="700" textAnchor="middle" opacity="0.95">
              {c.shortName || c.name}
            </text>
            <text x={pos[0]} y={pos[1] - r + 4} fill={subLabelColor} fontSize="8" textAnchor="middle" opacity="0.75">
              {c.fans.toLocaleString()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Dashboard({ onBack }) {
  // ── Dashboard color palette (medium-dark slate — between app dark and white) ──
  const D = {
    bg: "#1b2838", surface: "#22334a", card: "#273a52", cardHover: "#2e4360",
    border: "#34506b", borderLight: "#3d5a78",
    accent: "#8b7cf7", accentLight: "#a29bfe",
    mint: "#2ed8a3", mintDark: "#00b894",
    rose: "#f06292", roseDark: "#e84393",
    amber: "#ffc245", amberDark: "#f0a500",
    sky: "#54a8ff", skyDark: "#0984e3",
    text: "#e4eaf2", textMuted: "#8a9bb4", textDim: "#5b7390",
  };

  const kpis = [
    { label: "Moms Matched", value: "4,368", delta: "34% of all fans", color: D.mint },
    { label: "Digital First Viewers", value: "72%", delta: "prefer streaming over stadium", color: D.rose },
    { label: "Avg Brand Affinity", value: "74", delta: "receptivity score / 100", color: D.amber },
    { label: "Revenue Potential", value: "$4.2M", delta: "across 4 personas", color: D.accent },
  ];

  const cityData = [
    { name: "Houston", shortName: "HOU", fans: 2314, color: D.rose },
    { name: "Los Angeles", shortName: "LA", fans: 1987, color: D.mint },
    { name: "New York / NJ", shortName: "NYC", fans: 1843, color: D.mint },
    { name: "Miami", shortName: "MIA", fans: 1421, color: D.amber },
    { name: "Dallas", shortName: "DAL", fans: 1156, color: D.rose },
    { name: "Atlanta", shortName: "ATL", fans: 892, color: D.mint },
    { name: "Mexico City", shortName: "CDMX", fans: 756, color: D.amber },
    { name: "Toronto", shortName: "TOR", fans: 634, color: D.mint },
    { name: "Seattle", shortName: "SEA", fans: 521, color: D.mint },
    { name: "Boston", shortName: "BOS", fans: 487, color: D.sky },
    { name: "San Francisco", shortName: "SF", fans: 412, color: D.amber },
    { name: "Philadelphia", shortName: "PHL", fans: 389, color: D.sky },
    { name: "Kansas City", shortName: "KC", fans: 345, color: D.mint },
    { name: "Vancouver", shortName: "VAN", fans: 298, color: D.mint },
    { name: "Monterrey", shortName: "MTY", fans: 224, color: D.amber },
    { name: "Guadalajara", shortName: "GDL", fans: 168, color: D.amber },
  ];

  const personas = [
    {
      id: "connector", name: "The Connector", pct: 31, count: "1,354",
      color: D.mint, tagline: "Turns 1 fan into 5 through social amplification",
      dna: { liveEnergy: 42, digitalEngage: 78, socialAmplify: 90, brandReceptivity: 82, valuesDrive: 85, storyConnection: 76 },
      partners: "F&B, streaming bundles, group tickets", revenue: "$1.4M",
    },
    {
      id: "storyteller", name: "The Storyteller", pct: 26, count: "1,136",
      color: D.accentLight, tagline: "Discovers players through stories, then tunes in",
      dna: { liveEnergy: 22, digitalEngage: 88, socialAmplify: 68, brandReceptivity: 74, valuesDrive: 90, storyConnection: 96 },
      partners: "Docs, podcasts, creator partnerships", revenue: "$1.0M",
    },
    {
      id: "advocate", name: "The Advocate", pct: 24, count: "1,048",
      color: D.amber, tagline: "Lowest brand trust, highest loyalty once earned",
      dna: { liveEnergy: 25, digitalEngage: 76, socialAmplify: 62, brandReceptivity: 48, valuesDrive: 98, storyConnection: 92 },
      partners: "Purpose-driven brands, education", revenue: "$0.9M",
    },
    {
      id: "explorer", name: "The Explorer", pct: 19, count: "830",
      color: D.sky, tagline: "Highest brand receptivity \u2014 convert her now",
      dna: { liveEnergy: 35, digitalEngage: 70, socialAmplify: 52, brandReceptivity: 92, valuesDrive: 72, storyConnection: 78 },
      partners: "Lifestyle brands, family merch, wellness", revenue: "$0.9M",
    },
  ];

  const topValues = [
    { label: "Family First", pct: 61, color: D.rose },
    { label: "Community Impact", pct: 48, color: D.mint },
    { label: "Authenticity", pct: 44, color: D.accentLight },
    { label: "Resilience", pct: 32, color: D.amber },
    { label: "Fairness & Equality", pct: 28, color: D.sky },
  ];

  const dataPoints = [
    "Household composition", "Viewing preference", "Engagement driver", "Lifestyle signals",
    "3 core values", "City / venue proximity", "Brand discovery channel", "Purchase driver",
    "Content preference", "Fan DNA profile (6 dim)", "Player match", "XP engagement depth",
    "Social context type", "Reward tier reached",
  ];

  // Spider chart helper
  const spiderSize = 280;
  const sCx = spiderSize / 2, sCy = spiderSize / 2, sR = spiderSize * 0.34;
  const sLabels = ["Live Energy", "Digital Vibes", "Social Power", "Brand Fit", "Values Core", "Storyteller"];
  const sKeys = ["liveEnergy", "digitalEngage", "socialAmplify", "brandReceptivity", "valuesDrive", "storyConnection"];
  const sAngle = (Math.PI * 2) / 6;
  const sGp = (i, pct) => {
    const a = sAngle * i - Math.PI / 2;
    return [sCx + pct * sR * Math.cos(a), sCy + pct * sR * Math.sin(a)];
  };
  const sPoly = (dna) => sKeys.map((k, i) => sGp(i, (dna[k] || 50) / 100).join(",")).join(" ");

  // Shared card style
  const cardS = {
    background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  };

  return (
    <div style={{
      minHeight: "100%", background: D.bg,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      animation: "fadeIn 0.4s ease",
      overflowY: "auto",
    }}>
      {/* ── TOP NAV BAR ── */}
      <div style={{
        background: D.surface, borderBottom: `1px solid ${D.border}`,
        padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: `linear-gradient(135deg, ${D.accent}, ${D.mint})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
            {"\u26BD"}
          </div>
          <span style={{ color: D.text, fontSize: 13, fontWeight: 800 }}>FanMatch</span>
          <span style={{ color: D.textDim, fontSize: 10 }}>Intelligence</span>
        </div>
        <button onClick={onBack} style={{
          background: D.card, border: `1px solid ${D.border}`, borderRadius: 8,
          padding: "5px 12px", color: D.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer",
        }}>
          &larr; Back
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ padding: "16px 14px 24px" }}>

        {/* Section: Headline */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <p style={{ color: D.accent, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Audience Intelligence</p>
            <InfoBtn info={INFO.dashboardKPIs} style={{ width: 20, height: 20, fontSize: 11 }} />
            <span style={{
              background: `${D.mint}15`, border: `1px solid ${D.mint}44`, borderRadius: 4,
              padding: "1px 6px", fontSize: 9, fontWeight: 700, color: D.mint,
            }}>DEMO</span>
          </div>
          <h1 style={{ color: D.text, fontSize: 20, fontWeight: 800, lineHeight: 1.2, marginBottom: 6 }}>
            Moms 29 to 44
          </h1>
          <p style={{ color: D.textMuted, fontSize: 12, lineHeight: 1.5 }}>
            14 first-party data signals per fan. Psychographics, city preferences, and persona clusters.
          </p>
        </div>

        {/* KPIs — 2x2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{
              ...cardS, padding: "14px 14px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 50, height: 50, background: `${k.color}18`, borderRadius: "0 0 0 50px" }} />
              <p style={{ color: D.textMuted, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>{k.label}</p>
              <p style={{ color: D.text, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{k.value}</p>
              <p style={{ color: k.color, fontSize: 9, fontWeight: 600, marginTop: 4 }}>{k.delta}</p>
            </div>
          ))}
        </div>

        {/* Geo Map — full width */}
        <div style={{ ...cardS, padding: "14px 10px 10px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "0 4px" }}>
            <div>
              <h3 style={{ color: D.text, fontSize: 13, fontWeight: 700 }}>Fan Heatmap</h3>
              <p style={{ color: D.textMuted, fontSize: 10 }}>16 FIFA 2026 venues</p>
            </div>
            <span style={{ background: `${D.mint}15`, border: `1px solid ${D.mint}55`, borderRadius: 4, padding: "1px 6px", fontSize: 9, fontWeight: 700, color: D.mint }}>LIVE</span>
          </div>
          <GeoMap cities={cityData} theme={D} />
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8, padding: "0 4px" }}>
            {cityData.slice(0, 5).map((c) => (
              <div key={c.name} style={{ background: D.surface, borderRadius: 4, padding: "2px 8px", display: "flex", alignItems: "center", gap: 4, border: `1px solid ${D.border}` }}>
                <div style={{ width: 5, height: 5, borderRadius: 3, background: c.color }} />
                <span style={{ color: D.text, fontSize: 9, fontWeight: 700 }}>{c.shortName}</span>
                <span style={{ color: D.textMuted, fontSize: 9 }}>{c.fans.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spider Chart — full width */}
        <div style={{ ...cardS, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <h3 style={{ color: D.text, fontSize: 13, fontWeight: 700 }}>Persona DNA Profiles</h3>
            <InfoBtn info={INFO.dashboardSpider} style={{ width: 20, height: 20, fontSize: 11 }} />
          </div>
          <p style={{ color: D.textMuted, fontSize: 10, marginBottom: 6 }}>Psychographic overlay of 4 personas</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <svg width={spiderSize} height={spiderSize} viewBox={`0 0 ${spiderSize} ${spiderSize}`}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((pct, ri) => {
                const pts = Array.from({ length: 6 }, (_, i) => sGp(i, pct).join(",")).join(" ");
                return <polygon key={ri} points={pts} fill="none" stroke={D.border} strokeWidth={1} strokeDasharray={pct < 1 ? "3,3" : "none"} />;
              })}
              {Array.from({ length: 6 }, (_, i) => {
                const [ex, ey] = sGp(i, 1);
                return <line key={i} x1={sCx} y1={sCy} x2={ex} y2={ey} stroke={D.border} strokeWidth={0.8} />;
              })}
              {[...personas].reverse().map((p) => (
                <polygon key={p.id} points={sPoly(p.dna)} fill={p.color} fillOpacity={0.1} stroke={p.color} strokeWidth={2} strokeLinejoin="round" />
              ))}
              {personas.map((p) => (
                sKeys.map((k, i) => {
                  const [cx, cy] = sGp(i, (p.dna[k] || 50) / 100);
                  return <circle key={`${p.id}-${i}`} cx={cx} cy={cy} r={2.5} fill={p.color} />;
                })
              ))}
              {Array.from({ length: 6 }, (_, i) => {
                const [lx, ly] = sGp(i, 1.22);
                return (
                  <text key={i} x={lx} y={ly} fill={D.text} fontSize={9} fontWeight={700} textAnchor="middle" dominantBaseline="middle">
                    {sLabels[i]}
                  </text>
                );
              })}
            </svg>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
            {personas.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                <span style={{ color: D.textMuted, fontSize: 10, fontWeight: 600 }}>{p.name.replace("The ", "")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PERSONA CARDS — 2-col grid ── */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ color: D.text, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Persona Breakdown</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {personas.map((p) => (
              <div key={p.id} style={{
                ...cardS, borderTop: `3px solid ${p.color}`, padding: "14px 12px",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <h4 style={{ color: D.text, fontSize: 11, fontWeight: 700 }}>{p.name}</h4>
                  <span style={{ color: p.color, fontSize: 16, fontWeight: 800 }}>{p.pct}%</span>
                </div>
                <p style={{ color: D.textMuted, fontSize: 10, lineHeight: 1.4, marginBottom: 10, flex: 1 }}>{p.tagline}</p>
                <div style={{ borderTop: `1px solid ${D.border}`, paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ color: D.textDim, fontSize: 8, marginBottom: 1 }}>Revenue</p>
                    <p style={{ color: p.color, fontSize: 13, fontWeight: 800 }}>{p.revenue}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: D.textDim, fontSize: 8, marginBottom: 1 }}>Fans</p>
                    <p style={{ color: D.text, fontSize: 11, fontWeight: 700 }}>{p.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Breakdown */}
        <div style={{ ...cardS, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <h3 style={{ color: D.text, fontSize: 13, fontWeight: 700 }}>Core Values</h3>
            <InfoBtn info={INFO.dashboardValues} style={{ width: 20, height: 20, fontSize: 11 }} />
          </div>
          <p style={{ color: D.textMuted, fontSize: 10, marginBottom: 12 }}>Top values, moms 29 to 44</p>
          <div style={{ marginBottom: 14 }}>
            <p style={{ color: D.textMuted, fontSize: 10, fontWeight: 600, marginBottom: 6 }}>Viewing Preference</p>
            <div style={{ display: "flex", gap: 2, borderRadius: 5, overflow: "hidden", height: 22 }}>
              <div style={{ width: "72%", background: D.mint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                Digital 72%
              </div>
              <div style={{ width: "28%", background: D.rose, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                Live 28%
              </div>
            </div>
          </div>
          {topValues.map((v, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ color: D.text, fontSize: 11, fontWeight: 500 }}>{v.label}</span>
                <span style={{ color: v.color, fontSize: 11, fontWeight: 700 }}>{v.pct}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: D.surface }}>
                <div style={{ height: "100%", width: `${v.pct}%`, borderRadius: 3, background: `linear-gradient(90deg, ${v.color}cc, ${v.color})`, transition: "width 0.8s ease" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Data Capture */}
        <div style={{ ...cardS, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <h3 style={{ color: D.text, fontSize: 13, fontWeight: 700 }}>Data Per User</h3>
            <InfoBtn info={INFO.dashboardData} style={{ width: 20, height: 20, fontSize: 11 }} />
          </div>
          <p style={{ color: D.accent, fontSize: 28, fontWeight: 800, marginBottom: 10 }}>14 <span style={{ fontSize: 12, fontWeight: 600, color: D.textMuted }}>data points</span></p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
            {dataPoints.map((d, i) => (
              <span key={i} style={{
                background: D.surface, border: `1px solid ${D.border}`, borderRadius: 5, padding: "3px 8px",
                fontSize: 10, color: D.textMuted, fontWeight: 500,
              }}>
                {d}
              </span>
            ))}
          </div>
          <button style={{
            background: `linear-gradient(135deg, ${D.accent}, ${D.sky})`, color: "#fff",
            border: "none", borderRadius: 10, padding: "10px 20px",
            fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%",
            boxShadow: `0 4px 14px ${D.accent}44`,
          }}>
            Export Audience Data
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", paddingTop: 12, borderTop: `1px solid ${D.border}` }}>
          <p style={{ color: D.textDim, fontSize: 9, marginBottom: 2 }}>
            FanMatch Intelligence. Wasserman x MIT Sloan SSAC 2026
          </p>
          <p style={{ color: D.textDim, fontSize: 9 }}>
            First-party data (n = 4,368 moms)
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP COMPONENT
// ─────────────────────────────────────────────

export default function FanMatch() {
  const [screen, setScreen] = useState(0);
  const [answers, setAnswers] = useState({
    household: null, numKids: 1, viewStyle: null, engagementDriver: null,
    food: null, energy: null, values: [], city: null,
    discovery: null, buyDriver: null, content: null,
  });
  const [xp, setXp] = useState(0);
  const [xpFlash, setXpFlash] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showDataValue, setShowDataValue] = useState(false);
  const [fanDNA, setFanDNA] = useState(null);
  const [primaryMatch, setPrimaryMatch] = useState(null);
  const [secondaryMatch, setSecondaryMatch] = useState(null);
  const [factoids, setFactoids] = useState([]);

  const addXP = (amount) => {
    if (amount <= 0) return;
    setXp((prev) => prev + amount);
    setXpFlash(true);
    setTimeout(() => setXpFlash(false), 500);
  };

  const advance = () => {
    // If advancing to results screen (screen 5 → 6), compute everything
    if (screen === 5) {
      const dna = computeFanDNA(answers);
      const primary = findMatch(answers.values || [], "F");
      const secondary = findMatch(answers.values || [], "M");
      const facts = getFactoids(answers);
      setFanDNA(dna);
      setPrimaryMatch(primary);
      setSecondaryMatch(secondary);
      setFactoids(facts);
    }
    setScreen((s) => s + 1);
  };

  const goBack = () => {
    if (screen > 0) setScreen((s) => s - 1);
  };

  if (showDashboard) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{globalStyles}</style>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <Dashboard onBack={() => setShowDashboard(false)} />
      </div>
    );
  }

  if (showDataValue) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{globalStyles}</style>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <DataValueDashboard answers={answers} onBack={() => setShowDataValue(false)} />
      </div>
    );
  }

  const screens = [
    <WelcomeScreen key={0} onNext={advance} />,
    <HouseholdScreen key={1} onNext={advance} onBack={goBack} answers={answers} setAnswers={setAnswers} />,
    <VibeScreen key={2} onNext={advance} onBack={goBack} answers={answers} setAnswers={setAnswers} addXP={addXP} />,
    <ValuesScreen key={3} onNext={advance} onBack={goBack} answers={answers} setAnswers={setAnswers} addXP={addXP} />,
    <CityScreen key={4} onNext={advance} onBack={goBack} answers={answers} setAnswers={setAnswers} addXP={addXP} />,
    <QuickFireScreen key={5} onNext={advance} onBack={goBack} answers={answers} setAnswers={setAnswers} addXP={addXP} />,
  ];

  // Results, Rewards, KeepPlaying are screens 6, 7, 8
  const renderScreen = () => {
    if (screen < 6) return screens[screen];
    if (screen === 6 && fanDNA && primaryMatch) {
      return (
        <ResultsScreen
          answers={answers}
          fanDNA={fanDNA}
          primaryMatch={primaryMatch}
          secondaryMatch={secondaryMatch}
          factoids={factoids}
          onNext={advance}
          onBack={goBack}
          onDashboard={() => setShowDashboard(true)}
        />
      );
    }
    if (screen === 7) {
      return (
        <RewardsScreen
          xp={xp}
          answers={answers}
          primaryMatch={primaryMatch}
          onNext={advance}
          onBack={goBack}
          onDashboard={() => setShowDashboard(true)}
        />
      );
    }
    if (screen === 8) {
      return (
        <KeepPlayingScreen
          answers={answers}
          fanDNA={fanDNA}
          primaryMatch={primaryMatch}
          addXP={addXP}
          onBack={goBack}
          onDashboard={() => setShowDashboard(true)}
          onDataValue={() => setShowDataValue(true)}
        />
      );
    }
    // Fallback for screen 6 when DNA not computed yet (shouldn't happen)
    return screens[Math.min(screen, screens.length - 1)];
  };

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: COLORS.bg,
      color: COLORS.white,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      position: "relative",
    }}>
      <style>{globalStyles}</style>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <FloatingOrbs />
      {screen > 0 && <ProgressBar screen={screen} xp={xp} flash={xpFlash} />}
      {renderScreen()}
    </div>
  );
}

// ─────────────────────────────────────────────
// GLOBAL STYLES (injected via <style> tag)
// ─────────────────────────────────────────────

const globalStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #060e1a; overflow-x: hidden; }
  button { font-family: 'Plus Jakarta Sans', sans-serif; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.9) translateY(12px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes xpFloat {
    0% { opacity: 0; transform: translate(-50%, 10px) scale(0.5); }
    15% { opacity: 1; transform: translate(-50%, 0) scale(1.2); }
    40% { opacity: 1; transform: translate(-50%, -20px) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -80px) scale(0.8); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.12); opacity: 0.7; }
  }
  @keyframes float1 {
    0%, 100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(30px,-40px) scale(1.1); }
    66% { transform: translate(-20px,20px) scale(0.95); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(-40px,30px) scale(1.05); }
    66% { transform: translate(25px,-35px) scale(0.9); }
  }
  @keyframes float3 {
    0%, 100% { transform: translate(0,0) scale(1.05); }
    50% { transform: translate(15px,-50px) scale(0.95); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(255,209,102,0.3), 0 0 40px rgba(255,209,102,0.1); }
    50% { box-shadow: 0 0 35px rgba(255,209,102,0.5), 0 0 70px rgba(255,209,102,0.2); }
  }
  @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes revealCard {
    0% { opacity: 0; transform: scale(0.8) rotateY(10deg); }
    40% { opacity: 1; transform: scale(1.03) rotateY(-2deg); }
    100% { opacity: 1; transform: scale(1) rotateY(0); }
  }
  @keyframes heroReveal {
    0% { opacity: 0; transform: translateY(30px); filter: blur(8px); }
    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  @keyframes dotOrbit {
    0% { transform: rotate(0deg) translateX(44px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(44px) rotate(-360deg); }
  }
  @keyframes shimmerSlide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes digitRollUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  .orb { position:absolute; border-radius:50%; filter:blur(60px); pointer-events:none; will-change:transform; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
`;
