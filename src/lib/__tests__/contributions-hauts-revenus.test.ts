import {
  computeCEHR,
  computeCDHR,
  approximerRFR,
  computeContributionsHautsRevenus,
} from "../contributions-hauts-revenus";

// Source de vérité : DGFiP chap-thr.m + tgvI.m (docs/dgfip-source/).
// CEHR : 3 % entre seuil1 et seuil2, 4 % au-delà ; seuils doublés pour les couples.

describe("computeCEHR (art. 223 sexies CGI)", () => {
  it("célibataire sous le seuil (RFR 200 000) → 0", () => {
    const r = computeCEHR(200000, false);
    expect(r.contribution).toBe(0);
    expect(r.assujetti).toBe(false);
  });

  it("célibataire RFR 300 000 → 3 % × (300k − 250k) = 1 500", () => {
    expect(computeCEHR(300000, false).contribution).toBe(1500);
  });

  it("célibataire RFR 600 000 → 3 %×250k + 4 %×100k = 11 500", () => {
    expect(computeCEHR(600000, false).contribution).toBe(11500);
  });

  it("couple : seuils doublés (RFR 600 000 → 3 % × (600k − 500k) = 3 000)", () => {
    const r = computeCEHR(600000, true);
    expect(r.seuil1).toBe(500000);
    expect(r.seuil2).toBe(1000000);
    expect(r.contribution).toBe(3000);
  });

  it("couple RFR 1 200 000 → 3 %×500k + 4 %×200k = 23 000", () => {
    expect(computeCEHR(1200000, true).contribution).toBe(23000);
  });
});

describe("computeCDHR (art. 224 CGI)", () => {
  it("RFR sous le seuil → 0 (non assujetti)", () => {
    const r = computeCDHR({ rfr: 200000, ir: 30000, cehr: 0, couple: false, personnesCharge: 0 });
    expect(r.assujetti).toBe(false);
    expect(r.contribution).toBe(0);
  });

  it("décote ACTIVE dans la bande 250k-330k (célibataire RFR 300 000)", () => {
    const r = computeCDHR({ rfr: 300000, ir: 0, cehr: 0, couple: false, personnesCharge: 0 });
    expect(r.decoteApplicable).toBe(true);
    // cotisationBrute = 60 000 ; décote = 60 000 − 82,5 % × 50 000 = 18 750
    expect(r.cotisationBrute).toBe(60000);
    expect(r.decote).toBe(18750);
    // cotisation après décote 41 250 − imposition reconstituée 0 = 41 250
    expect(r.contribution).toBe(41250);
  });

  it("décote INACTIVE au-dessus de 330k (RFR 400 000)", () => {
    const r = computeCDHR({ rfr: 400000, ir: 0, cehr: 0, couple: false, personnesCharge: 0 });
    expect(r.decoteApplicable).toBe(false);
    expect(r.decote).toBe(0);
  });

  it("hors bande : contribution = 20 % RFR − (IR + CEHR) (RFR 600k)", () => {
    const r = computeCDHR({ rfr: 600000, ir: 80000, cehr: 11500, couple: false, personnesCharge: 0 });
    // 120 000 − (80 000 + 11 500) = 28 500
    expect(r.contribution).toBe(28500);
  });

  it("majorations foyer : 12 500 € couple + 1 500 €/PAC réduisent la contribution", () => {
    const sansPac = computeCDHR({ rfr: 1200000, ir: 200000, cehr: 23000, couple: true, personnesCharge: 0 });
    const avec2Pac = computeCDHR({ rfr: 1200000, ir: 200000, cehr: 23000, couple: true, personnesCharge: 2 });
    // maj couple = 12 500 ; +2 PAC = +3 000 → écart de 3 000 sur la contribution
    expect(sansPac.majorationFoyer).toBe(12500);
    expect(avec2Pac.majorationFoyer).toBe(15500);
    expect(sansPac.contribution - avec2Pac.contribution).toBe(3000);
    // 240 000 − (200 000 + 23 000 + 12 500) = 4 500
    expect(sansPac.contribution).toBe(4500);
  });
});

describe("approximerRFR", () => {
  it("retient le revenu net imposable (foncier/BNC/BIC déjà inclus, pas de double comptage)", () => {
    expect(approximerRFR({ revenuNetImposable: 280000 })).toBe(280000);
  });

  it("ajoute les revenus de capital hors barème éventuels", () => {
    expect(approximerRFR({ revenuNetImposable: 280000, revenusCapitalHorsBareme: 50000 })).toBe(330000);
  });
});

describe("computeContributionsHautsRevenus (agrégat)", () => {
  it("foyer non concerné sous le seuil", () => {
    const r = computeContributionsHautsRevenus({ rfr: 150000, rfrEstime: true, ir: 30000, couple: false, personnesCharge: 0 });
    expect(r.concerne).toBe(false);
    expect(r.cehr.contribution).toBe(0);
    expect(r.cdhr.contribution).toBe(0);
  });

  it("la CDHR consomme la CEHR calculée (chaînage)", () => {
    const r = computeContributionsHautsRevenus({ rfr: 600000, rfrEstime: false, ir: 80000, couple: false, personnesCharge: 0 });
    expect(r.cehr.contribution).toBe(11500);
    expect(r.cdhr.impositionReconstituee).toBe(80000 + 11500);
    expect(r.concerne).toBe(true);
  });
});
