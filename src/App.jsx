import React, { useState } from "react";

// ============================================================
//  CUSTOMER DATA — Dan's pre-built dummy profiles
//  Each customer is one object. Add more by copying the shape.
// ============================================================

const CUSTOMERS = {
  northwind: {
    name: "Northwind Analytics",
    industry: "B2B SaaS — Marketing Analytics",
    stage: "Mid-contract · Expansion opportunity",
    storyline: "The Expansion Story",
    status: "healthy", // healthy | watch | risk
    health: 92,
    daysToRenewal: 104,
    renewalDate: "Aug 31, 2026",
    acv: 485000,
    seats: { used: 104, total: 120 },
    apiSpend: [
      { month: "Mar", value: 22 }, { month: "Apr", value: 26 },
      { month: "May", value: 30 }, { month: "Jun", value: 33 },
      { month: "Jul", value: 37 }, { month: "Aug", value: 41 },
    ],
    apiHeadline: "$41K",
    apiDeltaPct: 87,
    apiNote: "$22K → $41K. Consumption growth signals deepening reliance.",
    seatNote: "16 seats of headroom — nearing capacity.",
    useCases: ["API analytics feature", "Internal copilot", "Claude Code eng pilot"],
    stakeholders: [
      { name: "VP, Data & AI", role: "Champion" },
      { name: "Director of Engineering", role: "Technical champion" },
      { name: "Head of CS", role: "Use case owner" },
    ],
    // bottom panel adapts per storyline
    focusPanel: {
      kind: "expansion",
      title: "Flagged Expansion Opportunities",
      items: [
        { label: "Claude Code rollout", value: 78000 },
        { label: "Seat expansion", value: 29000 },
      ],
    },
  },

  meridian: {
    name: "Meridian Federal Credit Union",
    industry: "Financial Services — Credit Union",
    stage: "Mid-contract · At risk",
    storyline: "The Save Play",
    status: "risk",
    health: 38,
    daysToRenewal: 165,
    renewalDate: "Oct 31, 2026",
    acv: 312000,
    seats: { used: 64, total: 200 },
    apiSpend: [
      { month: "Mar", value: 18.5 }, { month: "Apr", value: 15 },
      { month: "May", value: 12 }, { month: "Jun", value: 9.5 },
      { month: "Jul", value: 7.5 }, { month: "Aug", value: 6.2 },
    ],
    apiHeadline: "$6.2K",
    apiDeltaPct: -66,
    apiNote: "$18.5K → $6.2K. Sharp consumption decline — disengagement signal.",
    seatNote: "Tracking ~40% of annual usage commitment — major value gap.",
    useCases: ["Member service (stalled in legal 11+ wks)"],
    stakeholders: [
      { name: "Interim VP", role: "Skeptical · disengaged" },
      { name: "Former CIO sponsor", role: "Departed Mar 2026" },
    ],
    focusPanel: {
      kind: "risk",
      title: "Documented Risks · Mitigation In Place",
      items: [
        { label: "Champion departed — no exec sponsor", value: null },
        { label: "Primary use case stalled in legal (11+ wks)", value: null },
        { label: "Usage 66% below ramp — value gap", value: null },
      ],
      footnote: "BAA in place (HIPAA-ready) raises switching cost — leverage for the save.",
    },
  },

  helix: {
    name: "Helix Health Systems",
    industry: "Healthcare Technology",
    stage: "Active onboarding · Week 6 of 12",
    storyline: "The Active Onboarding",
    status: "watch",
    mode: "onboarding", // changes framing: go-live + progress instead of renewal
    health: 68,
    daysToRenewal: 316,
    renewalDate: "Mar 31, 2027",
    goLive: "Jul 15, 2026",
    onboarding: { week: 6, totalWeeks: 12, phase: "Integration & Pilot", milestonesDone: 5, milestonesTotal: 9 },
    acv: 215000,
    seats: { used: 48, total: 200 },
    apiSpend: [
      { month: "Mar", value: 0 }, { month: "Apr", value: 1.5 },
      { month: "May", value: 3 }, { month: "Jun", value: 4 },
      { month: "Jul", value: 5 }, { month: "Aug", value: 6 },
    ],
    apiHeadline: "Ramping",
    apiDeltaPct: 0,
    apiNote: "Early consumption — expected pre-go-live, not yet a signal.",
    seatNote: "24% — appropriate for onboarding stage, worth watching post go-live.",
    useCases: ["Clinical workflow integration (in pilot)"],
    stakeholders: [
      { name: "CMO (Exec sponsor)", role: "Highly engaged", tone: "good" },
      { name: "VP Engineering (Eng lead)", role: "Highly engaged", tone: "good" },
      { name: "Dir. Clinical Product", role: "Missed 2 of 3 calls", tone: "warn" },
    ],
    focusPanel: {
      kind: "engagement",
      title: "Stakeholder Engagement Signal",
      items: [
        { label: "Exec sponsor & Eng lead actively driving", tone: "good" },
        { label: "Use case owner disengaging — missed 2 of last 3 calls", tone: "warn" },
      ],
      footnote: "Technical track is healthy; adoption risk concentrated in one quiet stakeholder. Re-engage before go-live.",
    },
  },
};

const ORDER = ["northwind", "meridian", "helix"];

// ---- status → color theme ----
const THEME = {
  healthy: { ring: "#3fb985", chip: "rgba(63,185,133,0.12)", chipBorder: "rgba(63,185,133,0.3)", chipText: "#3fb985", label: "HEALTHY" },
  watch:   { ring: "#e0a458", chip: "rgba(224,164,88,0.12)", chipBorder: "rgba(224,164,88,0.32)", chipText: "#e0a458", label: "WATCH" },
  risk:    { ring: "#e06a5c", chip: "rgba(224,106,92,0.12)", chipBorder: "rgba(224,106,92,0.32)", chipText: "#e06a5c", label: "AT RISK" },
};

const fmtUSD = (n) => n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n}`;
const fmtUSDFull = (n) => `$${n.toLocaleString("en-US")}`;

function Sparkline({ data, color }) {
  const w = 220, h = 56, pad = 4;
  const max = Math.max(...data.map((x) => x.value));
  const min = Math.min(...data.map((x) => x.value));
  const range = max - min || 1;
  const pts = data.map((dd, i) => {
    const x = pad + (i * (w - pad * 2)) / (data.length - 1);
    const y = h - pad - ((dd.value - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`;
  const last = pts[pts.length - 1];
  const gid = `spark-${color.replace("#", "")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} />
    </svg>
  );
}

function HealthRing({ score, color }) {
  const r = 34, c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--ring-track)" strokeWidth="7" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 44 44)" style={{ transition: "stroke-dashoffset 600ms ease, stroke 300ms ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 24, fontWeight: 600, color: "var(--ink)", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", marginTop: 2 }}>Health</span>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, divider, accent }) {
  return (
    <div style={{ padding: "18px 22px", borderLeft: divider ? "1px solid var(--line)" : "none" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.06em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 7 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: accent || "var(--ink)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{sub}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: "0.06em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>{title}</div>
      {children}
    </div>
  );
}

function BriefBlock({ label, text, accent, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 16 }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.08em", color: accent || "var(--muted)", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: 0, color: "var(--ink)" }}>{text}</p>
    </div>
  );
}

export default function App() {
  const [key, setKey] = useState("northwind");
  const [hovered, setHovered] = useState(null);
  const [brief, setBrief] = useState({}); // keyed by customer: { situation, outlook, signals, play }
  const [loading, setLoading] = useState(false);
  const [briefErr, setBriefErr] = useState(null);
  const d = CUSTOMERS[key];

  // ============================================================
  //  SAMPLE BRIEFS (local mode)
  //  These are pre-written so the dashboard runs fully offline,
  //  with no API key. At deploy, generateBrief() will call a
  //  Vercel serverless function instead (see the marked spot below)
  //  and these samples become the fallback.
  // ============================================================
  const SAMPLE_BRIEFS = {
    northwind: {
      situation: "Northwind is a healthy, deepening account at 92/100 with three production use cases live. API spend is up 87% to $41K and seats are 87% utilized.",
      outlook: "Strong renewal with clear expansion headroom well ahead of the Aug 31 date.",
      signals: [
        "API spend +87% ($22K→$41K) — deepening reliance",
        "Seat utilization 87% (104/120) — nearing capacity",
        "Two expansions flagged worth $107K combined",
        "Champion presenting wins to her CEO",
      ],
      actions_taken: [
        "Identified and sized two expansion paths ($78K + $29K)",
        "Tracked three use cases into production",
        "Maintained active QBR cadence with VP Data & AI",
      ],
      leadership_support: "Light product/solutions support to scope the Claude Code rollout would accelerate the $78K expansion; no exec escalation needed.",
      success_criteria: "Expansion is on track when seat utilization passes 90% and the Claude Code rollout SOW is signed before renewal.",
      play: "Table both expansions now as a value-led growth conversation while the account is healthy and 104 days out — before renewal procurement compresses the discussion.",
    },
    meridian: {
      situation: "Meridian is at risk (38/100): champion departed in March, API spend down 66% to $6.2K, and the primary use case has been stalled in legal 11+ weeks. Seats sit at 32%.",
      outlook: "Renewal is in jeopardy without a recovery play before the Oct 31 date.",
      signals: [
        "API spend −66% ($18.5K→$6.2K) — disengagement",
        "Seat utilization 32% (64/200) — major value gap",
        "Tracking ~40% of annual usage commitment",
        "Interim VP skeptical, absent from QBR cadence",
      ],
      actions_taken: [
        "Documented three risks with mitigation plans on file",
        "Flagged the 11-week legal stall for escalation",
        "Confirmed BAA in place, raising switching cost",
      ],
      leadership_support: "Request an Anthropic exec sponsor reach out to Meridian's interim VP to re-establish executive alignment lost when the CIO departed.",
      success_criteria: "Risk is mitigated when API spend recovers toward the $18.5K baseline and the interim VP rejoins QBR cadence.",
      play: "Run a structured save: unblock the legal review, secure an exec-to-exec touch, and rebuild a value case before renewal. Use the HIPAA-ready BAA as switching-cost leverage.",
    },
    helix: {
      situation: "Helix is mid-onboarding (week 6 of 12, 68/100). Technical track is healthy — CMO and VP Eng highly engaged — but the Clinical Product Director has missed 2 of 3 calls.",
      outlook: "On track for the July 15 go-live if adoption risk is addressed before launch.",
      signals: [
        "5 of 9 milestones complete — on schedule",
        "Exec sponsor & Eng lead actively driving",
        "Use case owner missed 2 of last 3 calls",
        "Seat utilization 24% — appropriate for stage",
      ],
      actions_taken: [
        "Advanced integration & pilot to week 6 on plan",
        "Partially executed the training plan",
        "Kept CMO and VP Eng engaged in cadence",
      ],
      leadership_support: "A brief exec-sponsor nudge to re-engage the Clinical Product Director before go-live would de-risk adoption; no major escalation needed yet.",
      success_criteria: "Adoption risk clears when the Clinical Product Director returns to call cadence and the remaining 4 milestones complete before July 15.",
      play: "Re-engage the quiet use-case owner this week with a focused working session, while keeping the healthy technical track moving toward go-live.",
    },
  };

  // Build a compact data summary the model can reason over.
  // (Used for the LIVE call at deploy time — kept here so the
  //  prompt logic is ready to plug into the serverless function.)
  function customerFacts(c) {
    const seatPct = Math.round((c.seats.used / c.seats.total) * 100);
    const lines = [
      `Customer: ${c.name} (${c.industry})`,
      `Lifecycle: ${c.stage}`,
      `Account health score: ${c.health}/100 (${c.status})`,
      `ACV: $${c.acv.toLocaleString()}`,
      c.mode === "onboarding"
        ? `Onboarding: week ${c.onboarding.week} of ${c.onboarding.totalWeeks} (${c.onboarding.phase}), ${c.onboarding.milestonesDone}/${c.onboarding.milestonesTotal} milestones complete, target go-live ${c.goLive}`
        : `Days to renewal: ${c.daysToRenewal} (${c.renewalDate})`,
      `Seat utilization: ${seatPct}% (${c.seats.used} of ${c.seats.total})`,
      `API spend trend: ${c.apiNote}`,
      `Use cases: ${c.useCases.join("; ")}`,
      `Stakeholders: ${c.stakeholders.map((s) => `${s.name} — ${s.role}`).join("; ")}`,
      `Key situation: ${c.focusPanel.title} — ${c.focusPanel.items.map((i) => i.label + (i.value ? ` ($${i.value.toLocaleString()})` : "")).join("; ")}`,
      c.focusPanel.footnote ? `Note: ${c.focusPanel.footnote}` : "",
    ];
    return lines.filter(Boolean).join("\n");
  }

  async function generateBrief() {
    setLoading(true);
    setBriefErr(null);

    // ----------------------------------------------------------
    //  LIVE CALL GOES HERE (next session, at deploy):
    //  Replace the sample block below with a fetch to our own
    //  Vercel serverless function, e.g. fetch("/api/brief", {...})
    //  which holds the Anthropic key securely server-side and
    //  uses customerFacts(c) to build the prompt.
    // ----------------------------------------------------------

    try {
      // Simulate generation latency so the feature feels live
      await new Promise((r) => setTimeout(r, 1100));
      setBrief((prev) => ({ ...prev, [key]: SAMPLE_BRIEFS[key] }));
    } catch (e) {
      setBriefErr("Couldn't load the brief — try again.");
    } finally {
      setLoading(false);
    }
  }


  const t = THEME[d.status];
  const seatPct = Math.round((d.seats.used / d.seats.total) * 100);
  const panelKind = d.focusPanel.kind; // expansion | risk | engagement
  const isRisk = panelKind === "risk";
  const isEngagement = panelKind === "engagement";
  const isOnboarding = d.mode === "onboarding";
  const totalExpansion = panelKind === "expansion" ? d.focusPanel.items.reduce((s, e) => s + e.value, 0) : 0;
  const TONE = { good: "#3fb985", warn: "#e0a458", risk: "#e06a5c" };
  const currentBrief = brief[key];

  const styles = {
    "--bg": "#0f1115", "--card": "#171a21", "--card-2": "#1c2029",
    "--ink": "#f2f4f8", "--muted": "#8a91a0", "--line": "#262b35",
    "--accent": "#5b9dff", "--ring-track": "#262b35",
  };

  return (
    <div style={{ ...styles, background: "var(--bg)", minHeight: "100%", padding: "28px 20px 40px", fontFamily: "'DM Sans', ui-sans-serif, sans-serif", color: "var(--ink)" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');`}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* customer switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {ORDER.map((k) => {
            const c = CUSTOMERS[k];
            const ct = THEME[c.status];
            const active = k === key;
            return (
              <button key={k} onClick={() => setKey(k)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: active ? "var(--card)" : "transparent",
                  border: `1px solid ${active ? "var(--line)" : "transparent"}`,
                  borderRadius: 999, padding: "8px 14px", cursor: "pointer",
                  color: active ? "var(--ink)" : "var(--muted)",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 500,
                  transition: "all 160ms ease",
                }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: ct.ring }} />
                {c.name.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* main card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 60px -28px rgba(0,0,0,0.7)" }}>
          {/* header */}
          <div style={{ padding: "26px 28px 22px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: t.chip, border: `1px solid ${t.chipBorder}`, color: t.chipText, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: "0.03em", marginBottom: 12 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: t.ring }} />
                {t.label} · {d.storyline.toUpperCase()}
              </div>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.01em" }}>{d.name}</h1>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 13.5 }}>{d.industry} · {d.stage}</p>
            </div>
            <HealthRing score={d.health} color={t.ring} />
          </div>

          {/* metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: "1px solid var(--line)" }}>
            <Metric label="Annual Contract Value" value={fmtUSD(d.acv)} sub={fmtUSDFull(d.acv)} />
            {isOnboarding
              ? <Metric label="Target Go-Live" value={d.goLive} sub={`Week ${d.onboarding.week} of ${d.onboarding.totalWeeks}`} divider accent={t.ring} />
              : <Metric label="Days to Renewal" value={String(d.daysToRenewal)} sub={d.renewalDate} divider />}
            {isOnboarding
              ? <Metric label="Onboarding Progress" value={`${d.onboarding.milestonesDone}/${d.onboarding.milestonesTotal}`} sub={`milestones · ${d.onboarding.phase}`} divider accent="var(--accent)" />
              : isRisk
                ? <Metric label="Renewal Status" value="Save Play" sub={`${d.focusPanel.items.length} active risks`} divider accent={t.ring} />
                : <Metric label="Open Expansion" value={fmtUSD(totalExpansion)} sub={`${d.focusPanel.items.length} opportunities`} divider accent="var(--accent)" />}
          </div>

          {/* body */}
          <div style={{ padding: "24px 28px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            {isOnboarding && (
              <Panel title="Onboarding Progress">
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 26, fontWeight: 600 }}>Week {d.onboarding.week}</span>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>of {d.onboarding.totalWeeks} · {d.onboarding.phase}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "var(--card-2)", overflow: "hidden" }}>
                  <div style={{ width: `${(d.onboarding.week / d.onboarding.totalWeeks) * 100}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${t.ring}, #f0c074)`, transition: "width 600ms ease" }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "10px 0 0" }}>{d.onboarding.milestonesDone} of {d.onboarding.milestonesTotal} milestones complete · go-live {d.goLive}.</p>
              </Panel>
            )}

            <Panel title="Seat Utilization">
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 26, fontWeight: 600 }}>{seatPct}%</span>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>{d.seats.used} of {d.seats.total} active</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "var(--card-2)", overflow: "hidden" }}>
                <div style={{ width: `${seatPct}%`, height: "100%", borderRadius: 999, background: seatPct < 50 ? `linear-gradient(90deg, ${t.ring}, #ec8276)` : "linear-gradient(90deg, #3fb985, #62d3a6)", transition: "width 600ms ease" }} />
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "10px 0 0" }}>{d.seatNote}</p>
            </Panel>

            {!isOnboarding && (
            <Panel title="API Spend Trend (6 mo)">
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 26, fontWeight: 600 }}>{d.apiHeadline}</span>
                <span style={{ color: d.apiDeltaPct < 0 ? t.ring : "#3fb985", fontSize: 13, fontWeight: 600 }}>{d.apiDeltaPct > 0 ? "+" : ""}{d.apiDeltaPct}%</span>
              </div>
              <Sparkline data={d.apiSpend} color={d.apiDeltaPct < 0 ? t.ring : "#3fb985"} />
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "6px 0 0" }}>{d.apiNote}</p>
            </Panel>
            )}

            <Panel title={isOnboarding || isRisk ? "Use Case" : "Production Use Cases"}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {d.useCases.map((u) => (
                  <div key={u} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 999, background: isRisk ? t.ring : isOnboarding ? t.ring : "var(--accent)" }} />
                    {u}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Stakeholders">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {d.stakeholders.map((s) => (
                  <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                      {s.tone && <span style={{ width: 7, height: 7, borderRadius: 999, background: TONE[s.tone], flexShrink: 0 }} />}
                      {s.name}
                    </span>
                    <span style={{ fontSize: 11, color: s.tone === "warn" ? TONE.warn : "var(--muted)", border: `1px solid ${s.tone === "warn" ? "rgba(224,164,88,0.3)" : "var(--line)"}`, padding: "2px 8px", borderRadius: 999 }}>{s.role}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* focus panel — expansion OR risk */}
          <div style={{ padding: "0 28px 28px" }}>
            <div style={{ background: "linear-gradient(135deg, var(--card-2), #1a1f2b)", border: "1px solid var(--line)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 12, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", fontWeight: 600 }}>{d.focusPanel.title}</span>
                {panelKind === "expansion" && <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>{fmtUSD(totalExpansion)} potential</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: panelKind === "expansion" ? "1fr 1fr" : "1fr", gap: 12 }}>
                {d.focusPanel.items.map((e) => {
                  const dot = isEngagement ? TONE[e.tone] : t.ring;
                  return (
                  <div key={e.label}
                    onMouseEnter={() => setHovered(e.label)} onMouseLeave={() => setHovered(null)}
                    style={{
                      background: "var(--card)",
                      border: `1px solid ${hovered === e.label ? (panelKind === "expansion" ? "var(--accent)" : dot) : "var(--line)"}`,
                      borderRadius: 11, padding: "14px 16px",
                      display: "flex", alignItems: "center", gap: 12,
                      transition: "border-color 160ms ease, transform 160ms ease",
                      transform: hovered === e.label ? "translateY(-2px)" : "none",
                    }}>
                    {panelKind === "expansion"
                      ? <div>
                          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 3 }}>{fmtUSD(e.value)}</div>
                          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{e.label}</div>
                        </div>
                      : <>
                          <span style={{ width: 8, height: 8, borderRadius: 999, background: dot, flexShrink: 0 }} />
                          <span style={{ fontSize: 13.5 }}>{e.label}</span>
                        </>}
                  </div>
                  );
                })}
              </div>
              {d.focusPanel.footnote && (
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "14px 0 0", fontStyle: "italic" }}>{d.focusPanel.footnote}</p>
              )}
            </div>
          </div>

          {/* exec brief */}
          <div style={{ padding: "0 28px 28px" }}>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: currentBrief || loading || briefErr ? 16 : 0 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>Executive Brief</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Claude-generated renewal readiness summary</div>
                </div>
                <button onClick={generateBrief} disabled={loading}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: loading ? "var(--card-2)" : "var(--accent)",
                    color: loading ? "var(--muted)" : "#0b1220",
                    border: "none", borderRadius: 10, padding: "10px 16px",
                    fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                    cursor: loading ? "default" : "pointer", transition: "all 160ms ease",
                  }}>
                  {loading ? "Generating…" : currentBrief ? "Regenerate" : "Generate Exec Brief"}
                </button>
              </div>

              {briefErr && (
                <p style={{ fontSize: 13, color: "#e06a5c", margin: "12px 0 0" }}>{briefErr}</p>
              )}

              {loading && !currentBrief && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                  {[80, 95, 70].map((w, i) => (
                    <div key={i} style={{ height: 11, width: `${w}%`, borderRadius: 6, background: "linear-gradient(90deg, var(--card-2), var(--line), var(--card-2))", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
                  ))}
                  <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
                </div>
              )}

              {currentBrief && (
                <div style={{ background: "var(--card-2)", border: "1px solid var(--line)", borderRadius: 14, padding: "20px 22px", opacity: loading ? 0.5 : 1, transition: "opacity 200ms ease" }}>
                  <BriefBlock label="Situation" text={currentBrief.situation} />
                  <BriefBlock label="Renewal Outlook" text={currentBrief.outlook} accent={t.ring} />
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10.5, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Key Signals</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {(currentBrief.signals || []).map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, lineHeight: 1.5 }}>
                          <span style={{ width: 5, height: 5, borderRadius: 999, background: t.ring, flexShrink: 0, marginTop: 7 }} />
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                  {currentBrief.actions_taken && currentBrief.actions_taken.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 10.5, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Actions Already Taken</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {currentBrief.actions_taken.map((a, i) => (
                          <div key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, lineHeight: 1.5 }}>
                            <span style={{ color: "#3fb985", flexShrink: 0, fontWeight: 700, marginTop: -1 }}>✓</span>
                            {a}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentBrief.leadership_support && (
                    <div style={{ marginBottom: 16, background: "rgba(91,157,255,0.07)", border: "1px solid rgba(91,157,255,0.22)", borderRadius: 10, padding: "13px 15px" }}>
                      <div style={{ fontSize: 10.5, letterSpacing: "0.08em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>↑ Leadership Support Needed</div>
                      <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: 0, color: "var(--ink)" }}>{currentBrief.leadership_support}</p>
                    </div>
                  )}
                  {currentBrief.success_criteria && (
                    <div style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(63,185,133,0.06)", border: "1px solid rgba(63,185,133,0.2)", borderRadius: 10, padding: "13px 15px" }}>
                      <span style={{ color: "#3fb985", flexShrink: 0, fontSize: 14, marginTop: 1 }}>◎</span>
                      <div>
                        <div style={{ fontSize: 10.5, letterSpacing: "0.08em", color: "#3fb985", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Success Criteria</div>
                        <p style={{ fontSize: 13.5, lineHeight: 1.5, margin: 0, color: "var(--ink)" }}>{currentBrief.success_criteria}</p>
                      </div>
                    </div>
                  )}
                  <BriefBlock label="Recommended Play" text={currentBrief.play} accent="var(--accent)" last />
                </div>
              )}
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 11.5, marginTop: 18 }}>
          QBR &amp; Renewal Prep Tool · Strategic CS · Demo data
        </p>
      </div>
    </div>
  );
}
