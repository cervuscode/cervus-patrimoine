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
const PFU_IR = 0.128; // taux IR du PFU (contrat < 8 ans) — 12,8 % IR + 17,2 % PS = 30 %
const SEUIL_150K = 150000; // seuil de versements pour le taux IR (7,5 % vs 12,8 %)

function abattementAnnuel(marie: boolean): number {
  return marie ? 9200 : 4600;
}

// IR sur la part de gain imposable APRÈS abattement, contrat > 8 ans
// (CGI art. 200 A, primes versées depuis le 27/09/2017 — règle service-public.gouv.fr).
//
// L'abattement (4 600 € / 9 200 €) s'applique DANS TOUS LES CAS, en amont (cf. sortie()).
// Le gain imposable restant est ensuite ventilé selon la part des PRIMES VERSÉES
// excédant 150 000 € :
//   ratio       = max(0, primesVersées − 150 000) / primesVersées
//   (1 − ratio) du gain imposable est taxé à 7,5 %   (primes ≤ 150 000 €)
//   ratio       du gain imposable est taxé à 12,8 %  (primes > 150 000 €)
function irSurGain(gainImposable: number, primesVersees: number): number {
  if (gainImposable <= 0) return 0;
  const ratioAuDela = primesVersees > 0 ? Math.max(0, primesVersees - SEUIL_150K) / primesVersees : 0;
  const partTaux128 = gainImposable * ratioAuDela; // gains rattachés aux primes > 150k
  const partTaux75 = gainImposable - partTaux128; // gains rattachés aux primes ≤ 150k
  return 0.075 * partTaux75 + 0.128 * partTaux128;
}

interface SimState {
  valeur: number; // valeur du contrat
  base: number; // base = primes (versements) encore investies
  totalVersements: number; // cumul brut des versements (pour le seuil 150k)
  psPayesPendant: number; // PS payés pendant la phase (purges)
  purges: AVPurge[];
  courbe: { annee: number; valeur: number; base: number }[]; // valeur + base en fin d'année
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
  const courbe: { annee: number; valeur: number; base: number }[] = [
    { annee: 0, valeur: input.versementInitial, base: input.versementInitial },
  ];

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

    courbe.push({ annee, valeur, base });
  }

  return { valeur, base, totalVersements, psPayesPendant, purges, courbe };
}

// Fiscalité de sortie : rachat total au terme. PS 17,2 % sur toute la PV résiduelle
// dans TOUS les cas ; l'IR dépend de l'antériorité du contrat (seuil des 8 ans).
//
// HYPOTHÈSE : tous les contrats simulés sont de NOUVEAUX contrats (versements postérieurs
// au 27/09/2017). Le régime des contrats ouverts AVANT le 27/09/2017 (PFL 35 % si rachat
// < 4 ans, 15 % entre 4 et 8 ans) est HORS PÉRIMÈTRE et volontairement NON modélisé ici.
//
//  - dureeAnnees >= 8 : régime favorable « > 8 ans » — abattement annuel (4 600/9 200 €)
//    puis PFL 7,5 %/12,8 % au prorata du seuil 150k (cf. irSurGain).
//  - dureeAnnees  < 8 : PAS d'abattement ; PFU 12,8 % sur TOUTE la part de plus-value
//    (option standard, on n'applique pas l'option barème même si parfois plus favorable
//    aux TMI 0 %/11 %). PS 17,2 % identique. Soit 30 % au total sur la PV.
function sortie(
  state: SimState,
  marie: boolean,
  dureeAnnees: number
): { net: number; ps: number; ir: number; pv: number } {
  const pv = Math.max(0, state.valeur - state.base);
  const ps = PS * pv;
  let ir: number;
  if (dureeAnnees >= 8) {
    const gainImposable = Math.max(0, pv - abattementAnnuel(marie));
    // Seuil 150k apprécié sur les primes NETTES réellement présentes (state.base) :
    // capital initial + versements − capital racheté + réinvestissements de purge.
    // Surtout PAS sur un cumul brut qui recompterait le capital recyclé à chaque rachat.
    ir = irSurGain(gainImposable, state.base);
  } else {
    // Contrat < 8 ans : aucun abattement, PFU 12,8 % sur la PV entière.
    ir = PFU_IR * pv;
  }
  return { net: state.valeur - ps - ir, ps, ir, pv };
}

const eur = (n: number): number => Math.round(n);

// Diagnostic interne (non destiné à l'UI) — trace année par année du scénario "avec".
export function debugAV(input: AVInput) {
  const avec = simuler(input, true);
  const sans = simuler(input, false);
  const sa = sortie(avec, input.marie, input.dureeAnnees);
  const ss = sortie(sans, input.marie, input.dureeAnnees);
  return {
    trace: avec.courbe.map((c) => ({
      annee: c.annee,
      valeur: eur(c.valeur),
      base: eur(c.base),
      pvLatente: eur(c.valeur - c.base),
    })),
    purges: avec.purges.map((p) => ({ annee: p.annee, montantRachete: eur(p.montantRachete), partGain: eur(p.partGain), psPayes: eur(p.psPayes) })),
    baseAvecExit: eur(avec.base),
    totalVersementsAvecExit: eur(avec.totalVersements),
    pvResiduelleAvec: eur(sa.pv),
    irSortieAvec: eur(sa.ir),
    pvResiduelleSans: eur(ss.pv),
    irSortieSans: eur(ss.ir),
  };
}

export function calculerAV(input: AVInput): AVComputed {
  const r = RENDEMENTS[input.profil];

  const sans = simuler(input, false);
  const avec = simuler(input, true);

  const sortieSans = sortie(sans, input.marie, input.dureeAnnees);
  const sortieAvec = sortie(avec, input.marie, input.dureeAnnees);

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

  // Gain net = différence RÉELLE des capitaux nets des deux scénarios (cohérent avec
  // les chiffres affichés). irEvite et manque restent exposés pour la transparence, mais
  // leur simple soustraction ignorerait l'écart de PS TOTAUX payés (le scénario "avec"
  // en paie souvent un peu moins) — d'où une définition directe et exacte ici.
  const gainNetCervus = sortieAvec.net - sortieSans.net;

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
    primesVerseesTotal: eur(avec.base),
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
