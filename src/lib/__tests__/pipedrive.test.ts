/**
 * Tests de NON-RÉGRESSION pour la généralisation « par produit » de pipedrive.ts.
 *
 * On mocke `global.fetch` et on route les réponses par URL afin de vérifier :
 *  - findOpenDealForPersonAndProduct("PER") ignore un deal Produit="AV", et inversement ;
 *  - aucun deal du produit ouvert → null (un nouveau deal sera créé) ;
 *  - le wrapper PER `syncToPipedrive` produit toujours Produit:"PER" / Source:"Simu-PER"
 *    / titre "PER - …" et matche le deal en filtrant par Produit="PER" (jamais un deal AV).
 */
import type { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";

// Clés hash factices des champs Deal renvoyées par la "meta" mockée.
const PROD_KEY = "prod_hash";
const SRC_KEY = "src_hash";

interface CapturedCall {
  method: string;
  path: string; // sans query string
  body: Record<string, unknown> | null;
}

let calls: CapturedCall[] = [];

// Réponse JSON minimale compatible avec pdGet/pdPost/pdPut.
function ok(payload: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response);
}

// Routeur de fetch : décide la réponse selon l'URL + capture les écritures.
function installFetchMock(opts: {
  dealsLimit1?: Array<{ id: number }>;
  dealsLimit50?: Array<Record<string, unknown>>;
  existingPersonId?: number | null;
}) {
  const {
    dealsLimit1 = [],
    dealsLimit50 = [],
    existingPersonId = null,
  } = opts;

  const fetchMock = jest.fn((input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const path = url.split("?")[0].replace(/^https?:\/\/[^/]+\/api\/v1/, "");
    const method = (init?.method ?? "GET").toUpperCase();
    let body: Record<string, unknown> | null = null;
    if (init?.body) {
      try {
        body = JSON.parse(init.body as string);
      } catch {
        body = null;
      }
    }
    calls.push({ method, path, body });

    // Méta
    if (url.includes("/personFields")) return ok({ data: [] });
    if (url.includes("/dealFields")) {
      return ok({
        data: [
          { name: "Produit", key: PROD_KEY },
          { name: "Source", key: SRC_KEY },
        ],
      });
    }
    if (url.includes("/pipelines")) {
      return ok({ data: [
        { id: 1, name: "Leads" },
        { id: 2, name: "Leads sans OTP" },
      ] });
    }
    if (url.includes("/stages")) {
      return ok({ data: [
        { id: 10, name: "Tel Validé", pipeline_id: 1 },
        { id: 20, name: "Simulation effectuée", pipeline_id: 2 },
      ] });
    }

    // Recherche / écriture Person
    if (url.includes("/persons/search")) {
      const items = existingPersonId ? [{ item: { id: existingPersonId } }] : [];
      return ok({ data: { items } });
    }
    if (path.match(/^\/persons\/\d+\/deals/)) {
      if (url.includes("limit=50")) return ok({ data: dealsLimit50 });
      return ok({ data: dealsLimit1 });
    }
    if (path === "/persons" && method === "POST") return ok({ data: { id: 500 } });
    if (path.match(/^\/persons\/\d+$/) && method === "PUT") {
      return ok({ data: { id: existingPersonId ?? 500 } });
    }

    // Écriture Deal
    if (path === "/deals" && method === "POST") return ok({ data: { id: 900 } });
    if (path.match(/^\/deals\/\d+$/) && method === "PUT") return ok({ data: { id: 901 } });

    return ok({ data: {} });
  });

  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

beforeEach(() => {
  calls = [];
  process.env.PIPEDRIVE_DOMAIN = "test-domain";
  process.env.PIPEDRIVE_API_TOKEN = "test-token";
});

function makePerData(): SimulateurData {
  return {
    statut: "celibataire",
    nbEnfants: 0,
    gardeParentale: null,
    salaireMensuel: "3000",
    abattementSalaires: "forfait10",
    fraisReels: "",
    revenusConjoint: "",
    autresRevenus: false,
    bnc: "",
    bic: "",
    foncier: "",
    anneeNaissance: "1985",
    ageRetraite: "64",
    versementInitial: "0",
    versementMensuel: "200",
    profil: "equilibre",
    objectif: "reduire_impots",
    statutPro: "salarie",
    prenom: "Jean",
    nom: "Dupont",
    email: "jean.dupont@test.fr",
    telephone: "0612345678",
    otpCode: "",
    otpSent: false,
    otpVerified: true,
    consentementRdv: true,
    consentementRgpd: true,
  };
}

function makeComputed(): ComputedResults {
  return {
    partsBase: 1,
    partsTotal: 1,
    revenuImposable: 32400,
    tmi: 30,
    nAnnees: 25,
    ageRetraiteNum: 64,
    tauxAnnuel: 0.04,
    capitalFinal: 120000,
    courbe: [],
    economieFiscale: 5000,
    versementAnnuel: 2400,
    impotAvant: 4000,
    impotApres: 3280,
    pasMensAvant: 333,
    pasMensApres: 273,
    economieMensuelle: 140,
  };
}

describe("findOpenDealForPersonAndProduct", () => {
  test('"PER" → ignore un deal Produit="AV" et retient le deal PER', async () => {
    const { findOpenDealForPersonAndProduct } = await import("@/lib/pipedrive");
    installFetchMock({
      dealsLimit50: [
        { id: 201, [PROD_KEY]: "AV" },
        { id: 202, [PROD_KEY]: "PER" },
      ],
    });
    const id = await findOpenDealForPersonAndProduct(42, "PER");
    expect(id).toBe(202);
  });

  test('"AV" → ignore un deal Produit="PER" et retient le deal AV', async () => {
    const { findOpenDealForPersonAndProduct } = await import("@/lib/pipedrive");
    installFetchMock({
      dealsLimit50: [
        { id: 201, [PROD_KEY]: "PER" },
        { id: 202, [PROD_KEY]: "AV" },
      ],
    });
    const id = await findOpenDealForPersonAndProduct(42, "AV");
    expect(id).toBe(202);
  });

  test("aucun deal du produit ouvert → null (nouveau deal sera créé)", async () => {
    const { findOpenDealForPersonAndProduct } = await import("@/lib/pipedrive");
    installFetchMock({ dealsLimit50: [{ id: 201, [PROD_KEY]: "PER" }] });
    const id = await findOpenDealForPersonAndProduct(42, "AV");
    expect(id).toBeNull();
  });

  test("comparaison normalisée (espaces / casse)", async () => {
    const { findOpenDealForPersonAndProduct } = await import("@/lib/pipedrive");
    installFetchMock({ dealsLimit50: [{ id: 303, [PROD_KEY]: "  per  " }] });
    const id = await findOpenDealForPersonAndProduct(42, "PER");
    expect(id).toBe(303);
  });
});

describe("syncToPipedrive (wrapper PER) — non-régression", () => {
  test('crée un deal Produit:"PER" / Source:"Simu-PER" / titre "PER - …"', async () => {
    const { syncToPipedrive } = await import("@/lib/pipedrive");
    installFetchMock({ existingPersonId: null, dealsLimit1: [] });

    const res = await syncToPipedrive(makePerData(), makeComputed(), true);
    expect(res.personId).toBe(500);
    expect(res.dealId).toBe(900);

    const dealPost = calls.find((c) => c.path === "/deals" && c.method === "POST");
    expect(dealPost).toBeDefined();
    expect(dealPost!.body!.title).toBe("PER - Jean Dupont");
    expect(dealPost!.body![PROD_KEY]).toBe("PER");
    expect(dealPost!.body![SRC_KEY]).toBe("Simu-PER");
    // Routing OTP validé → pipeline "Leads" (1) / étape "Tel Validé" (10)
    expect(dealPost!.body!.pipeline_id).toBe(1);
    expect(dealPost!.body!.stage_id).toBe(10);

    // Le wrapper PER interroge bien les deals de la Person pour filtrer par produit.
    expect(calls.some((c) => c.path === "/persons/500/deals")).toBe(true);
  });

  test("ne réutilise PAS un deal AV ouvert → crée un nouveau deal PER (fix dédup)", async () => {
    const { syncToPipedrive } = await import("@/lib/pipedrive");
    // La personne a déjà un deal AV ouvert (id 777). Une simu PER ne doit PAS le
    // réutiliser/écraser : elle crée un nouveau deal PER.
    installFetchMock({
      existingPersonId: 500,
      dealsLimit50: [{ id: 777, [PROD_KEY]: "AV" }],
    });

    const res = await syncToPipedrive(makePerData(), makeComputed(), true);
    expect(res.dealId).toBe(900); // nouveau deal (POST), pas le 777 réutilisé

    const dealPost = calls.find((c) => c.path === "/deals" && c.method === "POST");
    expect(dealPost).toBeDefined();
    expect(dealPost!.body![PROD_KEY]).toBe("PER");
    // Aucun PUT sur le deal AV existant : on ne l'a pas touché.
    expect(calls.some((c) => c.path === "/deals/777" && c.method === "PUT")).toBe(false);
  });
});
