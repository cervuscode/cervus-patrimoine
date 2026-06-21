import { calculerAV, AVInput, AVComputed } from "../av-engine";

function printCas(titre: string, input: AVInput, res: AVComputed) {
  /* eslint-disable no-console */
  console.log(`\n══════════ ${titre} ══════════`);
  console.log("Entrées :", JSON.stringify(input));
  console.log("capitalFinalBrut        :", res.capitalFinalBrut, "€");
  console.log("capitalNetSansCervus    :", res.capitalNetSansCervus, "€");
  console.log("capitalNetAvecCervus    :", res.capitalNetAvecCervus, "€");
  console.log("irEvite                 :", res.irEvite, "€");
  console.log("manqueAGagnerCapit.     :", res.manqueAGagnerCapitalisation, "€");
  console.log("gainNetCervus           :", res.gainNetCervus, "€");
  console.log("purgeUtile              :", res.purgeUtile);
  console.log("totalPSPayes            :", JSON.stringify(res.totalPSPayes));
  console.log("primesVerseesTotal      :", res.primesVerseesTotal, "€");
  console.log("messagePurge            :", res.messagePurge);
  if (res.purges.length === 0) {
    console.log("purges                  : (aucune)");
  } else {
    console.log("purges (année par année) :");
    for (const p of res.purges) {
      console.log(
        `   année ${p.annee} → racheté ${p.montantRachete} € | part de gain ${p.partGain} € | PS payés ${p.psPayes} €`
      );
    }
  }
  /* eslint-enable no-console */
}

describe("av-engine — moteur assurance-vie", () => {
  it("CAS 1 : 50 000 € initial, 0 €/mois, 15 ans, équilibré 4 %, seul", () => {
    const input: AVInput = {
      versementInitial: 50000,
      versementMensuel: 0,
      dureeAnnees: 15,
      profil: "equilibre",
      marie: false,
    };
    const res = calculerAV(input);
    printCas("CAS 1", input, res);
    expect(res.capitalFinalBrut).toBeGreaterThan(50000);
    expect(typeof res.gainNetCervus).toBe("number");
    expect(Number.isFinite(res.gainNetCervus)).toBe(true);
  });

  it("CAS 2 : 0 € initial, 300 €/mois, 20 ans, dynamique 5 %, marié", () => {
    const input: AVInput = {
      versementInitial: 0,
      versementMensuel: 300,
      dureeAnnees: 20,
      profil: "dynamique",
      marie: true,
    };
    const res = calculerAV(input);
    printCas("CAS 2", input, res);
    expect(res.capitalFinalBrut).toBeGreaterThan(300 * 12 * 20);
    expect(Number.isFinite(res.gainNetCervus)).toBe(true);
  });

  it("CAS 3 : 10 000 € initial, 100 €/mois, 10 ans, prudent 3 %, seul", () => {
    const input: AVInput = {
      versementInitial: 10000,
      versementMensuel: 100,
      dureeAnnees: 10,
      profil: "prudent",
      marie: false,
    };
    const res = calculerAV(input);
    printCas("CAS 3", input, res);
    expect(Number.isFinite(res.gainNetCervus)).toBe(true);
    // Gain marginal → la purge n'est pas pertinente.
    expect(res.purgeUtile).toBe(false);
    expect(res.messagePurge).toContain("conservez votre contrat");
  });

  it("CAS 4 : 150 000 € initial, 0 €/mois, 20 ans, dynamique 5 %, marié (franchit 150k)", () => {
    const input: AVInput = {
      versementInitial: 150000,
      versementMensuel: 0,
      dureeAnnees: 20,
      profil: "dynamique",
      marie: true,
    };
    const res = calculerAV(input);
    printCas("CAS 4", input, res);
    // Démonstration du prorata 7,5 % / 12,8 % sur les PRIMES (règle officielle).
    const ratio = Math.max(0, res.primesVerseesTotal - 150000) / res.primesVerseesTotal;
    /* eslint-disable no-console */
    console.log(
      `prorata 150k (avec)     : primes ${res.primesVerseesTotal} € → ` +
        `${((1 - ratio) * 100).toFixed(1)} % du gain imposable à 7,5 % · ` +
        `${(ratio * 100).toFixed(1)} % à 12,8 %`
    );
    console.log("prorata 150k (sans)     : primes 150 000 € → 100 % à 7,5 % (seuil non dépassé)");
    /* eslint-enable no-console */
    // Les réinvestissements de purge doivent pousser le total de primes au-delà de 150k.
    expect(res.primesVerseesTotal).toBeGreaterThan(150000);
    expect(Number.isFinite(res.gainNetCervus)).toBe(true);
  });
});

// ── Fiscalité de sortie selon l'antériorité (seuil des 8 ans) ──────────────────
// Régime > 8 ans : abattement 4 600/9 200 € + 7,5 %/12,8 % (seuil 150k).
// Régime < 8 ans : pas d'abattement, PFU 12,8 % sur toute la PV (PS 17,2 % à part).
// IR implicite déduit des champs exposés : capitalFinalBrut − PS − capitalNetSans.
describe("av-engine — fiscalité de sortie conditionnée au seuil des 8 ans", () => {
  // Scénarios à prime unique, sans versement mensuel → base (sans purge) = initial.
  const impliedPV = (r: AVComputed, initial: number) => r.capitalFinalBrut - initial;
  const impliedIR = (r: AVComputed) =>
    r.capitalFinalBrut - r.totalPSPayes.sansCervus - r.capitalNetSansCervus;
  // Marge d'arrondi : ces grandeurs dérivent de 3 entiers déjà arrondis (±2 €).
  const proche = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(2);

  it("NON-RÉGRESSION > 8 ans : abattement appliqué + IR à 7,5 % (50 000 €, 15 ans, seul)", () => {
    const input: AVInput = {
      versementInitial: 50000,
      versementMensuel: 0,
      dureeAnnees: 15,
      profil: "equilibre",
      marie: false,
    };
    const res = calculerAV(input);
    const pv = impliedPV(res, 50000);
    // base < 150k → tout le gain imposable à 7,5 %, sur la PV au-delà de 4 600 €.
    const irAttendu = 0.075 * Math.max(0, pv - 4600);
    proche(res.totalPSPayes.sansCervus, 0.172 * pv);
    proche(impliedIR(res), irAttendu);
  });

  it("NOUVEAU < 8 ans : aucun abattement, PFU 12,8 % sur toute la PV (50 000 €, 5 ans, seul)", () => {
    const input: AVInput = {
      versementInitial: 50000,
      versementMensuel: 0,
      dureeAnnees: 5,
      profil: "prudent",
      marie: false,
    };
    const res = calculerAV(input);
    const pv = impliedPV(res, 50000);
    expect(pv).toBeGreaterThan(0);
    // IR < 8 ans = 12,8 % de TOUTE la PV (pas d'abattement).
    proche(impliedIR(res), 0.128 * pv);
    proche(res.totalPSPayes.sansCervus, 0.172 * pv);
    // Vérifie que c'est bien PLUS taxé que ne l'aurait donné le régime > 8 ans
    // (abattement + 7,5 %) : le net < 8 ans doit être strictement inférieur.
    const net8ans = res.capitalFinalBrut - 0.172 * pv - 0.075 * Math.max(0, pv - 4600);
    expect(res.capitalNetSansCervus).toBeLessThan(net8ans);
    // Aucune purge possible avant 8 ans → stratégie non pertinente.
    expect(res.purges).toHaveLength(0);
    expect(res.purgeUtile).toBe(false);
  });

  it("FRONTIÈRE exactement 8 ans : régime FAVORABLE (abattement) appliqué", () => {
    // PV projetée (~2 668 €) sous l'abattement 4 600 € → IR du régime > 8 ans = 0.
    // Si le régime < 8 ans s'appliquait à tort, l'IR serait 0,128 × PV > 0.
    const input: AVInput = {
      versementInitial: 10000,
      versementMensuel: 0,
      dureeAnnees: 8,
      profil: "prudent",
      marie: false,
    };
    const res = calculerAV(input);
    const pv = impliedPV(res, 10000);
    expect(pv).toBeGreaterThan(0);
    expect(pv).toBeLessThan(4600); // sous l'abattement
    // Régime favorable à 8 ans → IR nul (toute la PV absorbée par l'abattement).
    proche(impliedIR(res), 0);
  });
});
