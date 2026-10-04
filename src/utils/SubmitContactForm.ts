import type { ContactFormValues } from "@/schema/ContactSchema";

/**
 * Posts the lead to the backend.
 *
 * NOT YET IN THE API DOCUMENTATION — this endpoint needs to be added on the
 * backend. Suggested contract:
 *
 *   POST /api/v1/leads   (or /api/v1/contact)
 *   Body: { name, businessName?, email, phone?, storeCount?, message? }
 *   Access: Public, rate-limited (e.g. express-rate-limit)
 *   Behavior: validates input, stores the lead, and emails the sales team
 *             (Nodemailer, per the existing notification stack)
 *   Response: { success: true, message: "..." }
 *
 * The honeypot field ("website") is sent along; the backend should silently
 * accept-and-discard (or just ignore) submissions where it is non-empty,
 * rather than returning an error that reveals the check to a bot.
 */
export async function submitContactForm(values: ContactFormValues): Promise<void> {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/leads`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || "Something went wrong. Please try again.");
  }
}