// api/brief.js
// Vercel Serverless Function — runs on the SERVER, never in the browser.
// It reads the Anthropic API key from Vercel's environment vault
// (process.env.ANTHROPIC_API_KEY) and calls Claude on the browser's behalf.
// The key NEVER reaches the browser. Do NOT prefix it with VITE_.

import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY" });
  }

  try {
    const { facts } = req.body || {};
    if (!facts) {
      return res.status(400).json({ error: "Missing customer facts" });
    }

    const anthropic = new Anthropic({ apiKey });

    const prompt = `You are a Strategic Customer Success Manager at Anthropic, managing enterprise customers on Claude for Work and the API. You are preparing a concise executive brief for internal leadership ahead of a renewal/account review.

Here is the account data:
${facts}

Write a tight, leadership-ready brief that an executive can digest in one scan. Be ruthless: short sentences, no filler, no hedging, no restating the data back. Ground EVERY claim in the specific numbers above. Write the way a senior CSM writes for leadership — confident and economical. When you recommend timing, give the "why now" in a single clause, not a paragraph. Avoid jargon like "table" or "compress the discussion" — write plainly.

For "leadership_support": name the SPECIFIC internal ask if there is one — e.g. an Anthropic exec sponsor reaching out to the customer's executive, or product/solutions support to scope or troubleshoot a use case. If none is needed, say so in one short sentence and why.

For "actions_taken": what the CSM has already done, grounded in the documented signals (mitigation plans on file, training plan partially executed, QBR cadence, etc.). Do NOT invent meetings, dates, or activities not implied by the data. If history is thin, say so briefly.

For "success_criteria": ONE sentence. How leadership will know risk is mitigated or sentiment has upgraded — tied to a measurable signal already tracked (usage/spend recovery, seat utilization, stakeholder re-engagement, milestone completion), not soft sentiment.

Respond ONLY with valid JSON, no markdown, no preamble, in exactly this shape:
{
  "situation": "1-2 crisp sentences on where the account stands",
  "outlook": "1 sentence on the renewal/expansion outlook",
  "signals": ["3-4 bullets, each under ~12 words, grounded in a specific number"],
  "actions_taken": ["2-3 short bullets, each under ~12 words"],
  "leadership_support": "1 short sentence: the specific ask, or that none is needed and why",
  "success_criteria": "Exactly one sentence tied to a measurable signal",
  "play": "1-2 sentences recommending the specific next move, in plain language"
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const brief = JSON.parse(clean);

    return res.status(200).json({ brief });
  } catch (e) {
    console.error("Brief generation failed:", e);
    return res.status(500).json({ error: "Brief generation failed" });
  }
}