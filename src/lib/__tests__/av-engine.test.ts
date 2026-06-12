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
