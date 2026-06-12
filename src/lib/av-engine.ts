// ─────────────────────────────────────────────────────────────────────────────
// Moteur de simulation Assurance-vie — isolé, sans dépendance au simulateur PER.
//
// Modélisation indicative (non contractuelle). Capitalisation mensuelle (les
// versements mensuels sont capitalisés au fil de l'année), décisions de purge
// prises en fin d'année à partir de la 8e année.
// ─────────────────────────────────────────────────────────────────────────────

export type AVProfil = "prudent" | "equilibre" | "responsable" | "dynamique";

export interface AVInput {
  versementInitial: number; // € (peut être 0)
  versementMensuel: number; // € (peut être 0) — au moins un des deux > 0
  dureeAnnees: number; // horizon de placement
  profil: AVProfil;
  marie: boolean; // true = marié/pacsé (abattement 9200) ; false = seul (4600)
}

export interface AVPurge {
  annee: number; // année de la purge
  montantRachete: number; // rachat partiel brut (€)
  partGain: number; // part de gain rachetée (€) — dans l'abattement, IR = 0
  psPayes: number; // prélèvements sociaux 17,2 % sur la part de gain (€)
}

export interface AVComputed {
  capitalFinalBrut: number; // valeur du contrat au terme, avant fiscalité de sortie
  capitalNetSansCervus: number; // après PS + IR au terme (aucun rachat intermédiaire)
  capitalNetAvecCervus: number; // après purges réinvesties + fiscalité résiduelle au terme
  irEvite: number; // IR économisé grâce aux purges
  manqueAGagnerCapitalisation: number; // capitalisation perdue (PS payés en avance)
  gainNetCervus: number; // irEvite - manqueAGagnerCapitalisation (peut être ≤ 0)
  totalPSPayes: { sansCervus: number; avecCervus: number };
  primesVerseesTotal: number; // total dynamique des primes (initial + mensuels + réinvestis)
  purgeUtile: boolean; // false si purge non déclenchée OU gain net non significatif (< 250 €)
  messagePurge: string;
  purges: AVPurge[]; // détail année par année des purges déclenchées
  // Trajectoires de la valeur du contrat (brut) année par année, pour le graphique.
  courbe: { annee: number; capitalSans: number; capitalAvec: number }[];
}

// Marge de pertinence sur la décision de purge : on ne purge que si la PV latente
// projetée au terme dépasse l'abattement de plus de 10 %.
const MARGE_PURGE = 1.1;
// Gain net minimal pour considérer la stratégie de purge comme pertinente.
const SEUIL_GAIN_PERTINENT = 250;

// ── Constantes ───────────────────────────────────────────────────────────────
const RENDEMENTS: Record<AVProfil, number> = {
  prudent: 0.03,
  equilibre: 0.04,
  responsable: 0.04,
  dynamique: 0.05,
};
const PS = 0.172; // prélèvements sociaux
const SEUIL_150K = 150000; // seuil de versements pour le taux IR (7,5 % vs 12,8 %)

function abattementAnnuel(marie: boolean): number {
  return marie ? 9200 : 4600;
}

// IR sur la part de gain imposable (au-delà de l'abattement), contrat > 8 ans.
// 7,5 % si total des versements ≤ 150 000 € ; sinon 12,8 % sur la fraction de gain
// correspondant aux versements > 150 000 € (prorata), 7,5 % sur le reste.
function irSurGain(gainImposable: number, totalVersements: number): number {
  if (gainImposable <= 0) return 0;
  if (totalVersements <= SEUIL_150K) return 0.075 * gainImposable;
  const prorataAuDela = (totalVersements - SEUIL_150K) / totalVersements;
  const part128 = gainImposable * prorataAuDela;
  const part75 = gainImposable - part128;
  return 0.075 * part75 + 0.128 * part128;
}

interface SimState {
  valeur: number; // valeur du contrat
  base: number; // base = primes (versements) encore investies
  totalVersements: number; // cumul brut des versements (pour le seuil 150k)
  psPayesPendant: number; // PS payés pendant la phase (purges)
  purges: AVPurge[];
  courbe: { annee: number; valeur: number }[]; // valeur brute en fin de chaque année
}

// Simulation mois par mois. Si `avecCervus`, purge optimisée des plus-values.
function simuler(input: AVInput, avecCervus: boolean): SimState {
  const r = RENDEMENTS[input.profil];
  const m = Math.pow(1 + r, 1 / 12) - 1; // taux mensuel équivalent
  const abat = abattementAnnuel(input.marie);
  const mois = Math.round(input.dureeAnnees * 12);

  let valeur = input.versementInitial;
  let base = input.versementInitial;
  let totalVersements = input.versementInitial;
  let psPayesPendant = 0;
  const purges: AVPurge[] = [];
  const courbe: { annee: number; valeur: number }[] = [{ annee: 0, valeur: input.versementInitial }];

  for (let i = 1; i <= mois; i++) {
    // Croissance du mois puis versement de fin de mois (annuité ordinaire).
    valeur *= 1 + m;
    if (input.versementMensuel > 0) {
      valeur += input.versementMensuel;
      base += input.versementMensuel;
      totalVersements += input.versementMensuel;
    }

    // Fin d'année : décision de purge (scénario avec Cervus) puis relevé de la courbe.
    if (i % 12 !== 0) continue;
    const annee = i / 12;

    // Purge possible à partir de l'année 8 et jusqu'à l'avant-dernière année
    // (la dernière année correspond à la sortie/rachat total).
    if (avecCervus && annee >= 8 && annee < input.dureeAnnees) {
      const pv = valeur - base; // plus-value latente actuelle
      // Projection de la PV latente actuelle jusqu'au terme : on ne purge que si
      // elle dépasse l'abattement de sortie d'au moins 10 % (marge de pertinence).
      // Aucun garde-fou sur les "N dernières années" : une purge reste légitime en
      // année 18 ou 19 si la PV la justifie.
      const remaining = input.dureeAnnees - annee;
      const pvProjetee = pv * Math.pow(1 + r, remaining);
      if (pv > 0 && pvProjetee > abat * MARGE_PURGE) {
        // Purge calibrée : part de gain rachetée = abattement annuel (IR = 0).
        // Si la PV courante est inférieure à l'abattement, on purge toute la PV.
        const partGain = Math.min(abat, pv);
        const rachat = (partGain * valeur) / pv; // formule AV : part de gain = rachat × PV/valeur
        const ps = PS * partGain;
        psPayesPendant += ps;

        // Application du rachat partiel (prorata capital / gain).
        const partCapital = rachat - partGain;
        valeur -= rachat;
        base -= partCapital;

        // Réinvestissement immédiat du montant racheté NET DE PS (mêmes rendement et contrat).
        const reinvesti = rachat - ps;
        valeur += reinvesti;
        base += reinvesti;
        totalVersements += reinvesti;

        purges.push({ annee, montantRachete: rachat, partGain, psPayes: ps });
      }
    }

    courbe.push({ annee, valeur });
  }

  return { valeur, base, totalVersements, psPayesPendant, purges, courbe };
}

// Fiscalité de sortie : rachat total au terme. PS sur toute la PV résiduelle,
// IR sur la PV au-delà de l'abattement de l'année de sortie.
function sortie(state: SimState, marie: boolean): { net: number; ps: number; ir: number } {
  const pv = Math.max(0, state.valeur - state.base);
  const ps = PS * pv;
  const gainImposable = Math.max(0, pv - abattementAnnuel(marie));
  const ir = irSurGain(gainImposable, state.totalVersements);
  return { net: state.valeur - ps - ir, ps, ir };
}

const eur = (n: number): number => Math.round(n);

export function calculerAV(input: AVInput): AVComputed {
  const r = RENDEMENTS[input.profil];

  const sans = simuler(input, false);
  const avec = simuler(input, true);

  const sortieSans = sortie(sans, input.marie);
  const sortieAvec = sortie(avec, input.marie);

  // IR évité = IR de sortie sans purge − IR de sortie avec purge (les purges
  // annuelles ont réalisé du gain à IR nul dans l'abattement).
  const irEvite = Math.max(0, sortieSans.ir - sortieAvec.ir);

  // Manque à gagner de capitalisation = croissance perdue sur les PS payés en
  // avance (ces euros ne capitalisent plus jusqu'au terme).
  let manque = 0;
  for (const p of avec.purges) {
    const remaining = input.dureeAnnees - p.annee;
    manque += p.psPayes * (Math.pow(1 + r, remaining) - 1);
  }

  const gainNetCervus = irEvite - manque;

  // La purge n'est jugée UTILE que si elle a été techniquement déclenchée ET que
  // le gain net dépasse le seuil de pertinence. gainNetCervus reste exposé pour
  // la transparence, même quand purgeUtile = false.
  const purgeUtile = avec.purges.length > 0 && gainNetCervus >= SEUIL_GAIN_PERTINENT;

  const messagePurge = purgeUtile
    ? `La purge optimisée des plus-values vous fait gagner environ ${eur(gainNetCervus)} € nets.`
    : "Dans votre cas, la stratégie de purge n'apporte pas de gain significatif : conservez votre contrat jusqu'au terme.";

  // Trajectoires brutes alignées année par année (les deux courbes ont la même longueur).
  const courbe = sans.courbe.map((pt, i) => ({
    annee: pt.annee,
    capitalSans: eur(pt.valeur),
    capitalAvec: eur(avec.courbe[i]?.valeur ?? pt.valeur),
  }));

  return {
    capitalFinalBrut: eur(sans.valeur),
    capitalNetSansCervus: eur(sortieSans.net),
    capitalNetAvecCervus: eur(sortieAvec.net),
    irEvite: eur(irEvite),
    manqueAGagnerCapitalisation: eur(manque),
    gainNetCervus: eur(gainNetCervus),
    totalPSPayes: {
      sansCervus: eur(sortieSans.ps),
      avecCervus: eur(avec.psPayesPendant + sortieAvec.ps),
    },
    primesVerseesTotal: eur(avec.totalVersements),
    purgeUtile,
    messagePurge,
    purges: avec.purges.map((p) => ({
      annee: p.annee,
      montantRachete: eur(p.montantRachete),
      partGain: eur(p.partGain),
      psPayes: eur(p.psPayes),
    })),
    courbe,
  };
}
