import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Fetch a webpage and return its plain text (strip HTML tags)
async function fetchPageText(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout per page
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CRM-Bot/1.0)",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return `[Could not fetch ${url} — HTTP ${res.status}]`;
    const html = await res.text();
    // Strip HTML tags, collapse whitespace, truncate to ~3000 chars per page
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000);
    return text || `[No readable content at ${url}]`;
  } catch (err: any) {
    if (err?.name === "AbortError") return `[Timed out fetching ${url}]`;
    return `[Error fetching ${url}: ${err?.message ?? "unknown"}]`;
  }
}

const testUrl = "https://drjtbc.org";
const testResult = await fetchPageText(testUrl);
console.log("TEST FETCH drjtbc.org:", testResult.slice(0, 200));


export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

  // Confirm the user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

// Step 1: Fetch all contacts with their linked agencies (including URLs)
const [{ data: contacts }, { data: agencyLinks }] = await Promise.all([
  supabase
    .from("contacts")
    .select("id, name, title, organization, state, influence, stage, notes, next_action, next_action_date"),
  supabase
    .from("contact_agencies")
    .select(`
      contact_id,
      account_id,
      accounts (
        id,
        agency_name,
        url,
        state
      )
    `),
]);

// Debug — remove after confirming
console.log("First agency link:", JSON.stringify(agencyLinks?.[0], null, 2));

// Step 2: Build a map of contact → agencies
const agencyByContact = new Map<string, { name: string; url: string | null; state: string | null }[]>();
(agencyLinks ?? []).forEach((link: any) => {
  const cid = link.contact_id;
  if (!agencyByContact.has(cid)) agencyByContact.set(cid, []);
  // Handle both nested object and flat response shapes
  const acc = Array.isArray(link.accounts) ? link.accounts[0] : link.accounts;
  if (acc?.agency_name) {
    agencyByContact.get(cid)!.push({
      name: acc.agency_name,
      url: acc.url ?? null,
      state: acc.state ?? null,
    });
  }
});

// Step 3: Collect URLs — prioritize agencies linked to contacts
const urlsToFetch = new Map<string, string>();

// First add contact-linked agencies
(agencyLinks ?? []).forEach((link: any) => {
  const acc = Array.isArray(link.accounts) ? link.accounts[0] : link.accounts;
  if (acc?.url && acc?.agency_name) {
    urlsToFetch.set(acc.url, acc.agency_name);
  }
});

// // Then fill remaining slots with other agencies
// (allAccounts ?? []).forEach((a: any) => {
//   if (a.url && a.agency_name && !urlsToFetch.has(a.url)) {
//     urlsToFetch.set(a.url, a.agency_name);
//   }
// });

const urlEntries = Array.from(urlsToFetch.entries()).slice(0, 12);

//step4
  const pageContents = await Promise.all(
    urlEntries.map(async ([url, name]) => {
      const text = await fetchPageText(url);
      return { name, url, text };
    })
  );


  
  console.log("URLs to fetch:", Array.from(urlsToFetch.entries()).map(([url, name]) => ({ url, name })));
console.log("Page contents fetched:", pageContents.map(p => ({
  name: p.name,
  contentLength: p.text.length,
  preview: p.text.slice(0, 80)
})));
  // Step 5: Build the contact summary
  const contactSummary = (contacts ?? []).map((c: any) => {
    const agencies = agencyByContact.get(c.id) ?? [];
    return [
      `Contact: ${c.name}${c.title ? ` (${c.title})` : ""}${c.organization ? ` at ${c.organization}` : ""}`,
      `  State: ${c.state || "—"} | Influence: ${c.influence} | Stage: ${c.stage}`,
      `  Notes: ${c.notes || "none"}`,
      `  Next Action: ${c.next_action || "none"}${c.next_action_date ? ` by ${c.next_action_date}` : ""}`,
      agencies.length > 0
        ? `  Agencies: ${agencies.map((a) => `${a.name}${a.url ? ` (${a.url})` : ""}`).join(", ")}`
        : "  Agencies: none linked",
    ].join("\n");
  }).join("\n\n");

  // Step 6: Build the agency web content section
  const agencyWebContent = pageContents.length > 0
    ? pageContents.map((p) =>
        `--- ${p.name} (${p.url}) ---\n${p.text}`
      ).join("\n\n")
    : "No agency websites could be fetched.";

  const systemPrompt = `You are a research assistant for an Agency Partnerships CRM tracking outreach to state DOTs, counties, and transit authorities.

You have access to:
1. A live contacts database with ${contacts?.length ?? 0} contacts
2. Real content fetched from agency websites right now

Answer the user's questions using the data below. Be specific — reference actual names, agencies, and details. If asked about an agency's programs, budget, or leadership, use the website content. If the data doesn't contain what's needed, say so clearly.

== CONTACTS DATABASE ==
${contactSummary || "(no contacts yet)"}

== AGENCY WEBSITE CONTENT (fetched live) ==
${agencyWebContent}`;

  // Step 7: Call Claude
// Replace the Anthropic fetch with this:
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile", // free, very capable
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ],
  }),
});

const data = await response.json();
const text = data.choices?.[0]?.message?.content ?? "";
return NextResponse.json({ reply: text });
}
