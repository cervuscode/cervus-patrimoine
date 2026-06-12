/**
 * Tests de NON-RÉGRESSION pour check-contact « par produit ».
 *
 * - Sans `produit` (défaut PER) : un lead PER (présent dans la liste #5 ou #6) renvoie
 *   exists:true, comme avant. Un contact hors listes PER renvoie exists:false.
 * - Avec `produit:"AV"` : un lead PER n'est PAS considéré comme doublon AV (exists:false),
 *   ce qui permet à un client PER de faire une simu AV.
 */
import { POST } from "../route";

function installBrevoMock(contactByEmail: Record<string, { ok: boolean; listIds?: number[] }>) {
  const fetchMock = jest.fn((input: string | URL | Request) => {
    const url = String(input);
    // GET /contacts/{email}
    const m = url.match(/\/contacts\/([^/?]+)$/);
    if (m) {
      const email = decodeURIComponent(m[1]);
      const entry = contactByEmail[email];
      if (!entry || !entry.ok) {
        return Promise.resolve({ ok: false, status: 404, json: async () => ({}) } as unknown as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ email, listIds: entry.listIds ?? [] }),
      } as unknown as Response);
    }
    return Promise.resolve({ ok: false, status: 400, json: async () => ({}) } as unknown as Response);
  });
  global.fetch = fetchMock as unknown as typeof fetch;
}

function req(body: unknown) {
  return { json: async () => body } as unknown as Parameters<typeof POST>[0];
}

beforeEach(() => {
  process.env.BREVO_API_KEY = "test-key";
});

describe("check-contact par produit", () => {
  test("défaut PER : lead PER (liste #5) → exists:true (comportement inchangé)", async () => {
    installBrevoMock({ "lead.per@test.fr": { ok: true, listIds: [5] } });
    const res = await POST(req({ email: "lead.per@test.fr" }));
    expect(await res.json()).toEqual({ exists: true });
  });

  test("défaut PER : lead en liste #6 (sans OTP) → exists:true", async () => {
    installBrevoMock({ "lead.per@test.fr": { ok: true, listIds: [6] } });
    const res = await POST(req({ email: "lead.per@test.fr" }));
    expect(await res.json()).toEqual({ exists: true });
  });

  test("défaut PER : contact hors listes PER → exists:false", async () => {
    installBrevoMock({ "newsletter@test.fr": { ok: true, listIds: [99] } });
    const res = await POST(req({ email: "newsletter@test.fr" }));
    expect(await res.json()).toEqual({ exists: false });
  });

  test("contact inexistant dans Brevo → exists:false", async () => {
    installBrevoMock({});
    const res = await POST(req({ email: "inconnu@test.fr" }));
    expect(await res.json()).toEqual({ exists: false });
  });

  test('produit:"AV" : un lead PER (listes #5/#6) n\'est PAS un doublon AV → exists:false', async () => {
    installBrevoMock({ "lead.per@test.fr": { ok: true, listIds: [5, 6] } });
    const res = await POST(req({ email: "lead.per@test.fr", produit: "AV" }));
    expect(await res.json()).toEqual({ exists: false });
  });
});
